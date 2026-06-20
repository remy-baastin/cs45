import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from '../faqs/faq.schema';
import { MinimaxEmbeddingClient } from './minimax-embedding.client';
import { EmbeddingCacheService } from './embedding-cache.service';
import { rankBySimilarity } from '../common/cosine';
import { SEARCH_CONFIG } from '../config/search.config';
import {
  SearchResponse,
  SuggestResponse,
  FaqSearchResult,
  FaqSuggestion,
  FaqWithEmbedding,
} from '../common/types';

/**
 * AI SEARCH SERVICE
 * ──────────────────
 * Owns D-01 (Semantic FAQ Search) and D-02 (Live Suggestions).
 *
 * Flow for both endpoints:
 *   1. Normalise query text
 *   2. Call MiniMax embo-01 to embed the query → 1536-dim vector
 *   3. Load all FAQ embeddings from in-memory cache
 *   4. Cosine similarity score each FAQ against the query vector
 *   5. Filter by threshold, sort descending, slice to topN
 *   6. Return shaped response
 *
 * D-01 vs D-02 difference:
 *   - D-01: higher threshold (0.78), topN=5, full answer in response
 *   - D-02: lower threshold (0.65), topN=3, question only (no answer text)
 */
@Injectable()
export class AiSearchService {
  private readonly logger = new Logger(AiSearchService.name);

  constructor(
    @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
    private readonly embeddingClient: MinimaxEmbeddingClient,
    private readonly cache: EmbeddingCacheService,
  ) {}

  // ─── D-01: POST /ai/search ────────────────────────────────────────────────

  /**
   * Semantic FAQ search.
   * Returns ranked FAQs that mean the same as the user's query,
   * even with completely different wording.
   */
  async search(
    rawQuery: string,
    topN = SEARCH_CONFIG.SEARCH_TOP_N,
    threshold = SEARCH_CONFIG.SEARCH_THRESHOLD,
  ): Promise<SearchResponse> {
    const t0 = Date.now();
    const query = this.normalise(rawQuery);

    if (!query) throw new BadRequestException('Query must not be empty');

    this.logger.debug(`search: "${query}" (threshold=${threshold}, topN=${topN})`);

    // Step 1: Embed the query
    const queryEmbedding = await this.embeddingClient.embedQuery(query);

    // Step 2: Score all cached FAQ embeddings
    const corpus = this.cache.getAll();
    if (corpus.length === 0) {
      this.logger.warn('Embedding cache is empty — no published FAQs with embeddings');
      return { results: [], confidence: 0, query, latencyMs: Date.now() - t0 };
    }

    // Step 3: Rank, filter, slice
    const ranked = rankBySimilarity(queryEmbedding, corpus, threshold, topN);

    // Step 4: Shape response
    const results: FaqSearchResult[] = ranked.map((r) => ({
      faqId: r.faqId,
      question: r.question,
      answer: r.answer,
      confidence: Math.round(r.score * 1000) / 1000,  // 3 decimal places
      category: r.category,
      tags: r.tags,
    }));

    return {
      results,
      confidence: results[0]?.confidence ?? 0,
      query,
      latencyMs: Date.now() - t0,
    };
  }

  // ─── D-02: POST /ai/suggest ───────────────────────────────────────────────

  /**
   * Live FAQ suggestions while user is typing.
   * Lower threshold — surface more options to prevent duplicate queries.
   * Returns question only (no full answer) for compact UI display.
   *
   * NOTE: Debounce (300ms) is enforced on the frontend.
   *       This endpoint itself has no rate-limiting built in — add via NestJS ThrottlerGuard
   *       if suggest calls become expensive.
   */
  async suggest(rawQuery: string): Promise<SuggestResponse> {
    const t0 = Date.now();
    const query = this.normalise(rawQuery);

    if (!query || query.length < 3) {
      // Don't embed very short strings — not enough signal
      return { suggestions: [], latencyMs: Date.now() - t0 };
    }

    this.logger.debug(`suggest: "${query}"`);

    const queryEmbedding = await this.embeddingClient.embedQuery(query);
    const corpus = this.cache.getAll();

    const ranked = rankBySimilarity(
      queryEmbedding,
      corpus,
      SEARCH_CONFIG.SUGGEST_THRESHOLD,
      SEARCH_CONFIG.SUGGEST_TOP_N,
    );

    const suggestions: FaqSuggestion[] = ranked.map((r) => ({
      faqId: r.faqId,
      question: r.question,
      confidence: Math.round(r.score * 1000) / 1000,
    }));

    return { suggestions, latencyMs: Date.now() - t0 };
  }

  // ─── Embedding Indexing ───────────────────────────────────────────────────

  /**
   * Generate and store embedding for a single FAQ document.
   * Called by Negha's FAQ Generation module when a new FAQ is published.
   * Also call this for all existing FAQs via the /ai/index endpoint (admin only).
   *
   * Text sent for embedding = "Question: {question}\n\nAnswer: {answer}"
   * This gives the model full semantic context.
   */
  async indexFaq(faqId: string): Promise<void> {
    const faq = await this.faqModel.findById(faqId);
    if (!faq) throw new BadRequestException(`FAQ ${faqId} not found`);

    const text = this.buildEmbeddingText(faq.question, faq.answer);
    const [embedding] = await this.embeddingClient.embedDocuments([text]);

    await this.faqModel.updateOne(
      { _id: faqId },
      { embedding, embeddingReady: true },
    );

    // Update in-memory cache immediately — no need to wait for next full reload
    const updated: FaqWithEmbedding = {
      faqId: faq._id.toString(),
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags,
      embedding,
    };
    this.cache.addToCache(updated);

    this.logger.log(`Indexed FAQ ${faqId} (dim=${embedding.length})`);
  }

  /**
   * Bulk-index all published FAQs that don't have embeddings yet.
   * Run once on production setup, or after a model change.
   */
  async bulkIndexUnembedded(): Promise<{ indexed: number; failed: number }> {
    const faqs = await this.faqModel
      .find({ status: 'published', embeddingReady: false })
      .select('_id question answer')
      .lean()
      .exec();

    this.logger.log(`Bulk indexing ${faqs.length} unembedded FAQs...`);
    let indexed = 0;
    let failed = 0;

    // Process in batches of 10 to avoid overwhelming the API
    for (let i = 0; i < faqs.length; i += 10) {
      const batch = faqs.slice(i, i + 10);
      const texts = batch.map((f) => this.buildEmbeddingText(f.question, f.answer));

      try {
        const embeddings = await this.embeddingClient.embedDocuments(texts);
        const bulkOps = batch.map((faq, idx) => ({
          updateOne: {
            filter: { _id: faq._id },
            update: { $set: { embedding: embeddings[idx], embeddingReady: true } },
          },
        }));
        await this.faqModel.bulkWrite(bulkOps);
        indexed += batch.length;
      } catch (err) {
        this.logger.error(`Batch ${i}-${i + 10} failed: ${(err as Error).message}`);
        failed += batch.length;
      }
    }

    // Refresh in-memory cache after bulk index
    await this.cache.refreshCache();
    this.logger.log(`Bulk index complete: ${indexed} indexed, ${failed} failed`);
    return { indexed, failed };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Normalise query: trim, collapse whitespace, lowercase.
   * Keeps punctuation — embedding models handle it fine.
   */
  private normalise(text: string): string {
    return text.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private buildEmbeddingText(question: string, answer: string): string {
    return `Question: ${question}\n\nAnswer: ${answer}`;
  }
}

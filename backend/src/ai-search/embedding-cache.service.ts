import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from '../faqs/faq.schema';
import { FaqWithEmbedding } from '../common/types';

/**
 * EMBEDDING CACHE
 * ───────────────
 * Loads all published FAQ embeddings from MongoDB into memory at startup.
 * Subsequent search calls hit memory (O(n) cosine scan) — no DB round-trip per query.
 *
 * Why in-memory for MVP?
 *   - Atlas Vector Search requires an Atlas M10+ cluster (not free tier)
 *   - For 1,000 FAQs, in-memory cosine over 1536-dim vectors takes ~5ms
 *   - Swap to Atlas Vector Search in Phase 3 by replacing rankBySimilarity() call
 *     with a $vectorSearch aggregation pipeline — everything else stays the same.
 *
 * Cache invalidation:
 *   - Call refreshCache() when a new FAQ is published (call from Negha's FAQ Generation module)
 *   - Or use the /ai/cache/refresh admin endpoint (see controller)
 */
@Injectable()
export class EmbeddingCacheService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingCacheService.name);
  private cache: FaqWithEmbedding[] = [];
  private lastRefreshed: Date | null = null;

  constructor(@InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>) {}

  /** Load cache on module startup */
  async onModuleInit(): Promise<void> {
    await this.refreshCache();
  }

  /** Full reload from MongoDB — call after any FAQ is published */
  async refreshCache(): Promise<void> {
    const t0 = Date.now();
    const faqs = await this.faqModel
      .find({ status: 'published', embeddingReady: true })
      .select('question answer category tags embedding')
      .lean()
      .exec();

    this.cache = faqs.map((faq) => ({
      faqId: (faq._id as any).toString(),
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags,
      embedding: faq.embedding,
    }));

    this.lastRefreshed = new Date();
    this.logger.log(
      `Embedding cache loaded: ${this.cache.length} FAQs in ${Date.now() - t0}ms`,
    );
  }

  getAll(): FaqWithEmbedding[] {
    return this.cache;
  }

  getSize(): number {
    return this.cache.length;
  }

  getLastRefreshed(): Date | null {
    return this.lastRefreshed;
  }

  /** Add a single newly-published FAQ without full reload */
  addToCache(faq: FaqWithEmbedding): void {
    // Remove if already exists (update case)
    this.cache = this.cache.filter((f) => f.faqId !== faq.faqId);
    this.cache.push(faq);
  }
}

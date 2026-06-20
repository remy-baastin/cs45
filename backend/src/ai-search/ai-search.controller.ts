import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  Param,
} from '@nestjs/common';
import { AiSearchService } from './ai-search.service';
import { EmbeddingCacheService } from './embedding-cache.service';
import { SearchDto, SuggestDto } from './dto/search.dto';

/**
 * AI SEARCH CONTROLLER
 * ─────────────────────
 * Exposes:
 *   POST /ai/search    — D-01: Semantic FAQ search
 *   POST /ai/suggest   — D-02: Live suggestions while typing
 *
 * Admin/internal endpoints (for Samarpit/Negha integration):
 *   POST /ai/index/:faqId     — Embed and index a single FAQ
 *   POST /ai/index/bulk       — Bulk index all unembedded FAQs
 *   POST /ai/cache/refresh    — Reload embedding cache from DB
 *   GET  /ai/cache/status     — Check cache health
 */
@Controller('ai')
export class AiSearchController {
  private readonly logger = new Logger(AiSearchController.name);

  constructor(
    private readonly searchService: AiSearchService,
    private readonly cacheService: EmbeddingCacheService,
  ) {}

  // ─── D-01: Semantic FAQ Search ─────────────────────────────────────────────

  /**
   * POST /ai/search
   *
   * Request:  { query: string, topN?: number, threshold?: number }
   * Response: { results: FaqSearchResult[], confidence: number, query: string, latencyMs: number }
   *
   * Use this when user submits a search or when the FAQ page loads.
   * Threshold: 0.78 default — tune in search.config.ts
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  async search(@Body() dto: SearchDto) {
    this.logger.log(`POST /ai/search: "${dto.query}"`);
    return this.searchService.search(dto.query, dto.topN, dto.threshold);
  }

  // ─── D-02: Live Suggestions ────────────────────────────────────────────────

  /**
   * POST /ai/suggest
   *
   * Request:  { query: string }
   * Response: { suggestions: FaqSuggestion[], latencyMs: number }
   *
   * Called on every keystroke (debounced 300ms by frontend).
   * Lower threshold (0.65) — surfaces more options to prevent duplicate queries.
   * Returns question text only — no answer — for compact dropdown display.
   */
  @Post('suggest')
  @HttpCode(HttpStatus.OK)
  async suggest(@Body() dto: SuggestDto) {
    return this.searchService.suggest(dto.query);
  }

  // ─── Indexing (called by Negha's FAQ Generation module) ───────────────────

  /**
   * POST /ai/index/:faqId
   *
   * Call this when a new FAQ is published (from Negha's module).
   * Generates embedding and updates MongoDB + in-memory cache immediately.
   */
  @Post('index/:faqId')
  @HttpCode(HttpStatus.OK)
  async indexFaq(@Param('faqId') faqId: string) {
    this.logger.log(`POST /ai/index/${faqId}`);
    await this.searchService.indexFaq(faqId);
    return { ok: true, faqId, message: 'FAQ embedded and indexed' };
  }

  /**
   * POST /ai/index/bulk
   *
   * Embed all published FAQs that don't have embeddings yet.
   * Run once on initial deployment or after a model change.
   */
  @Post('index/bulk')
  @HttpCode(HttpStatus.OK)
  async bulkIndex() {
    this.logger.log('POST /ai/index/bulk');
    const result = await this.searchService.bulkIndexUnembedded();
    return { ok: true, ...result };
  }

  // ─── Cache management ──────────────────────────────────────────────────────

  /** POST /ai/cache/refresh — Reload all FAQ embeddings from MongoDB */
  @Post('cache/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshCache() {
    await this.cacheService.refreshCache();
    return {
      ok: true,
      cachedFaqs: this.cacheService.getSize(),
      lastRefreshed: this.cacheService.getLastRefreshed(),
    };
  }

  /** GET /ai/cache/status — Health check for the embedding cache */
  @Get('cache/status')
  cacheStatus() {
    return {
      cachedFaqs: this.cacheService.getSize(),
      lastRefreshed: this.cacheService.getLastRefreshed(),
      healthy: this.cacheService.getSize() > 0,
    };
  }
}

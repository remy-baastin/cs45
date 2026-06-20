/**
 * AI SEARCH — TYPE CONTRACTS
 * ──────────────────────────
 * All request/response shapes consumed by frontend and backend.
 * Share this file (or its derived JSON schema) with other teams.
 */

// ─── REQUEST DTOs ────────────────────────────────────────────────────────────

export interface SearchRequestDto {
  /** The user's raw query string */
  query: string;
  /** Optional override for top-N (defaults to SEARCH_TOP_N from config) */
  topN?: number;
  /** Optional threshold override — for A/B testing different thresholds */
  threshold?: number;
}

export interface SuggestRequestDto {
  /** Partial query — user is still typing */
  query: string;
}

// ─── RESPONSE SHAPES ─────────────────────────────────────────────────────────

export interface FaqSearchResult {
  faqId: string;
  question: string;
  answer: string;
  /** Cosine similarity score [0, 1] */
  confidence: number;
  /** Section/category for display */
  category?: string;
  tags?: string[];
}

export interface FaqSuggestion {
  faqId: string;
  question: string;
  /** Cosine similarity score [0, 1] */
  confidence: number;
}

/** POST /ai/search response */
export interface SearchResponse {
  results: FaqSearchResult[];
  /** Overall search confidence — score of the top result */
  confidence: number;
  /** Query that was actually searched (normalised) */
  query: string;
  /** Milliseconds taken (for monitoring) */
  latencyMs: number;
}

/** POST /ai/suggest response */
export interface SuggestResponse {
  suggestions: FaqSuggestion[];
  /** Milliseconds taken */
  latencyMs: number;
}

// ─── INTERNAL TYPES ──────────────────────────────────────────────────────────

export interface FaqWithEmbedding {
  faqId: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
  /** Stored embedding vector — from MongoDB or in-memory cache */
  embedding: number[];
}

export interface EmbeddingResult {
  text: string;
  embedding: number[];
}

/** Error shape — matches NestJS HttpException format */
export interface AiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

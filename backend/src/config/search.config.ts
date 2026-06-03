/**
 * SIMILARITY THRESHOLDS CONFIG
 * ─────────────────────────────
 * All cosine similarity thresholds in one place.
 * Tune here; no other file needs to change.
 *
 * Cosine similarity ranges from 0 (no match) to 1 (identical).
 * Higher threshold = more precise but misses more matches (↑ precision, ↓ recall)
 * Lower threshold  = surfaces more results but noisier  (↓ precision, ↑ recall)
 */

export const SEARCH_CONFIG = {
  // D-01: /ai/search — confident match for serving a definitive FAQ
  // Per spec: 0.78. Start here; lower if too few results surface in testing.
  SEARCH_THRESHOLD: parseFloat(process.env.SEARCH_THRESHOLD ?? '0.78'),

  // D-02: /ai/suggest — lower bar so user sees options while still typing
  // Per spec: 0.65. Intentionally permissive — better to show a slightly weak suggestion
  // than to show nothing and let the user submit a duplicate query.
  SUGGEST_THRESHOLD: parseFloat(process.env.SUGGEST_THRESHOLD ?? '0.65'),

  // Top-N results to return for each endpoint
  SEARCH_TOP_N: parseInt(process.env.SEARCH_TOP_N ?? '5', 10),
  SUGGEST_TOP_N: parseInt(process.env.SUGGEST_TOP_N ?? '3', 10),

  // Debounce delay hint (ms) — enforced on the frontend, documented here for contract clarity
  SUGGEST_DEBOUNCE_MS: 300,
} as const;

export const MINIMAX_CONFIG = {
  BASE_URL: 'https://api.minimax.chat/v1',
  EMBEDDING_MODEL: 'embo-01',   // MiniMax embedding model — swap here if model name changes
  MAX_RETRIES: 3,
  TIMEOUT_MS: 8000,
  // Embedding dimensionality for embo-01 — used to validate API response
  EMBEDDING_DIM: 1536,
} as const;

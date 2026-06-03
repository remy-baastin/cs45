import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MINIMAX_CONFIG } from '../config/search.config';

/**
 * MINIMAX EMBEDDING CLIENT
 * ─────────────────────────
 * Handles all communication with MiniMax's embedding API.
 * Gurnoor owns this for embedding; Samarpit owns a parallel client for LLM completions.
 *
 * NOTE: If MiniMax does not support batch embedding, single-text mode is used.
 *       We send texts one-by-one — slower but safe for MVP.
 *
 * MiniMax embo-01 API reference:
 *   POST https://api.minimax.chat/v1/embeddings
 *   Authorization: Bearer <MINIMAX_API_KEY>
 *   Body: { model: "embo-01", texts: string[], type: "query" | "db" }
 *
 *   - type "query" → for embedding the user's search query
 *   - type "db"    → for embedding FAQ documents (stored in MongoDB)
 */
@Injectable()
export class MinimaxEmbeddingClient {
  private readonly logger = new Logger(MinimaxEmbeddingClient.name);
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('MINIMAX_API_KEY');
    this.apiKey = key === 'your_minimax_api_key_here' ? '' : (key ?? '');
    if (!this.apiKey || this.apiKey.startsWith('your_') || this.apiKey === 'mock') {
      this.logger.warn(
        'MINIMAX_API_KEY is not configured or is a placeholder. ' +
          'Falling back to LOCAL DETERMINISTIC MOCK EMBEDDING mode for offline testing.',
      );
    }
  }

  /**
   * Embed a single query string.
   * Uses type="query" — MiniMax optimises differently for query vs document.
   */
  async embedQuery(text: string): Promise<number[]> {
    const results = await this.embedTexts([text], 'query');
    return results[0];
  }

  /**
   * Embed one or more FAQ document texts.
   * Uses type="db" — optimised for document storage.
   * Call this when indexing a new FAQ into the knowledge base.
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return this.embedTexts(texts, 'db');
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private async embedTexts(
    texts: string[],
    type: 'query' | 'db',
  ): Promise<number[][]> {
    if (!this.apiKey || this.apiKey.startsWith('your_') || this.apiKey === 'mock') {
      return texts.map((text) => this.generateMockEmbedding(text));
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MINIMAX_CONFIG.MAX_RETRIES; attempt++) {
      try {
        return await this.callApi(texts, type);
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(
          `MiniMax embedding attempt ${attempt}/${MINIMAX_CONFIG.MAX_RETRIES} failed: ${lastError.message}`,
        );
        if (attempt < MINIMAX_CONFIG.MAX_RETRIES) {
          // Exponential back-off: 500ms, 1000ms, 2000ms
          await this.sleep(500 * Math.pow(2, attempt - 1));
        }
      }
    }

    throw new Error(
      `MiniMax embedding failed after ${MINIMAX_CONFIG.MAX_RETRIES} attempts: ${lastError?.message}`,
    );
  }

  private async callApi(texts: string[], type: 'query' | 'db'): Promise<number[][]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MINIMAX_CONFIG.TIMEOUT_MS);

    try {
      const response = await fetch(`${MINIMAX_CONFIG.BASE_URL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: MINIMAX_CONFIG.EMBEDDING_MODEL,
          texts,
          type,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`MiniMax API ${response.status}: ${body}`);
      }

      const data = await response.json();

      // MiniMax response shape: { vectors: number[][] }
      const vectors: number[][] = data.vectors ?? data.data?.map((d: any) => d.embedding);
      if (!vectors || vectors.length !== texts.length) {
        throw new Error(
          `Expected ${texts.length} vectors, got ${vectors?.length ?? 0}`,
        );
      }

      // Validate dimensionality on first vector
      if (vectors[0].length !== MINIMAX_CONFIG.EMBEDDING_DIM) {
        this.logger.warn(
          `Unexpected embedding dim: ${vectors[0].length} (expected ${MINIMAX_CONFIG.EMBEDDING_DIM}). ` +
            `Update MINIMAX_CONFIG.EMBEDDING_DIM if model changed.`,
        );
      }

      return vectors;
    } finally {
      clearTimeout(timeout);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Deterministically generate a mock embedding vector (1536 dimensions) for testing.
   * Maps words to indices using a simple hash, then L2-normalises the vector.
   * Sharing words = non-zero dot product, giving a functional mock semantic similarity.
   */
  private generateMockEmbedding(text: string): number[] {
    const dim = MINIMAX_CONFIG.EMBEDDING_DIM;
    const vector = new Array(dim).fill(0);

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      vector[0] = 1.0;
      return vector;
    }

    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }

      for (let j = 0; j < 3; j++) {
        const idx = Math.abs((hash + j * 997) % dim);
        vector[idx] += 1.0;
      }
    }

    // L2 normalize
    let norm = 0;
    for (let i = 0; i < dim; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let i = 0; i < dim; i++) {
        vector[i] /= norm;
      }
    } else {
      vector[0] = 1.0;
    }

    return vector;
  }
}

/**
 * COSINE SIMILARITY ENGINE
 * ─────────────────────────
 * Pure functions — no side effects, no dependencies.
 * Fully unit-testable in isolation.
 *
 * Cosine similarity = dot(A, B) / (|A| * |B|)
 * Returns value in [−1, 1]. For embedding vectors (all positive after normalisation),
 * effectively in [0, 1]. Higher = more semantically similar.
 */

/**
 * Compute cosine similarity between two equal-length vectors.
 * Returns 0 if either vector is zero-length (degenerate case).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;

  // Clamp to [0, 1] — floating-point arithmetic can produce values like 1.0000000002
  return Math.min(1, Math.max(0, dot / denom));
}

/**
 * Score all items in a corpus against a query vector.
 * Returns items sorted by descending similarity, filtered by threshold, limited to topN.
 */
export function rankBySimilarity<T extends { embedding: number[] }>(
  queryEmbedding: number[],
  corpus: T[],
  threshold: number,
  topN: number,
): Array<T & { score: number }> {
  return corpus
    .map((item) => ({
      ...item,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/**
 * L2-normalise a vector to unit length.
 * Useful if you want dot-product to equal cosine similarity (minor optimisation).
 */
export function normaliseVector(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((acc, x) => acc + x * x, 0));
  if (norm === 0) return v;
  return v.map((x) => x / norm);
}

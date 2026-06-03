/**
 * UNIT TESTS — Cosine Similarity Engine
 * Run: npx jest cosine.spec.ts
 */

import { cosineSimilarity, rankBySimilarity, normaliseVector } from '../../common/cosine';

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = [1, 2, 3, 4];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0.0);
  });

  it('returns 0 for zero vector', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  it('clamps output to [0, 1]', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    const score = cosineSimilarity(a, b);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('throws on dimension mismatch', () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow('dimension mismatch');
  });

  it('is symmetric: sim(a,b) === sim(b,a)', () => {
    const a = [0.5, 0.8, 0.2, 0.9];
    const b = [0.1, 0.7, 0.6, 0.3];
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a));
  });
});

describe('rankBySimilarity', () => {
  const corpus = [
    { faqId: '1', question: 'q1', answer: 'a1', embedding: [1, 0, 0] },
    { faqId: '2', question: 'q2', answer: 'a2', embedding: [0, 1, 0] },
    { faqId: '3', question: 'q3', answer: 'a3', embedding: [0.9, 0.1, 0] },
    { faqId: '4', question: 'q4', answer: 'a4', embedding: [0, 0, 1] },
  ];

  it('returns items sorted by descending score', () => {
    const query = [1, 0, 0];
    const results = rankBySimilarity(query, corpus, 0, 10);
    expect(results[0].faqId).toBe('1');   // identical → score=1
    expect(results[1].faqId).toBe('3');   // similar
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  it('filters below threshold', () => {
    const query = [1, 0, 0];
    const results = rankBySimilarity(query, corpus, 0.8, 10);
    results.forEach((r) => expect(r.score).toBeGreaterThanOrEqual(0.8));
  });

  it('limits to topN', () => {
    const query = [1, 0, 0];
    const results = rankBySimilarity(query, corpus, 0, 2);
    expect(results.length).toBe(2);
  });

  it('returns empty array when no items pass threshold', () => {
    const query = [1, 0, 0];
    const results = rankBySimilarity(query, corpus, 0.999, 10);
    // Only exact match (faqId=1) should pass
    expect(results.length).toBe(1);
    expect(results[0].faqId).toBe('1');
  });
});

describe('normaliseVector', () => {
  it('produces unit vector', () => {
    const v = normaliseVector([3, 4]);
    const norm = Math.sqrt(v[0] ** 2 + v[1] ** 2);
    expect(norm).toBeCloseTo(1.0);
  });

  it('handles zero vector without throwing', () => {
    expect(() => normaliseVector([0, 0, 0])).not.toThrow();
  });
});

export interface IAiService {
  /**
   * Generates a numeric vector embedding for the input text.
   * Useful for semantic search, similarity scoring, and duplicate detection.
   */
  generateEmbeddings(text: string): Promise<number[]>;

  /**
   * Evaluates text for profanity, harassment, or policy violations.
   */
  analyzeToxicity(text: string): Promise<{ isToxic: boolean; reason?: string }>;

  /**
   * Determines if a query is Personal (sensitive) or Generic (suitable for public FAQ).
   */
  classifyQuery(
    text: string,
  ): Promise<{ type: 'generic' | 'personal'; confidence: number }>;

  /**
   * Aggregates a community discussion thread and outputs a synthesized FAQ entry.
   */
  generateFaqFromDiscussion(
    title: string,
    answers: string[],
  ): Promise<{ question: string; answer: string }>;
}

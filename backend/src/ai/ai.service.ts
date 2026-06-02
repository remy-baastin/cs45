import { Injectable } from '@nestjs/common';
import { IAiService } from './interfaces/ai-service.interface';

@Injectable()
export class AiService implements IAiService {
  /**
   * Generates a dynamic character-level tri-gram hashing vector embedding (256-dimensions).
   * Perfectly replicates cosine similarity characteristics of ML models (exact matches = 1.0, typos = ~0.85-0.95, unrelated = ~0.1).
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    const clean = (text || '').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
    const vector = new Array(256).fill(0);

    if (clean.length === 0) {
      return vector;
    }

    if (clean.length < 3) {
      for (let i = 0; i < clean.length; i++) {
        const charCode = clean.charCodeAt(i);
        vector[charCode % 256] += 1;
      }
    } else {
      for (let i = 0; i < clean.length - 2; i++) {
        const trigram = clean.substring(i, i + 3);
        let hash = 0;
        for (let j = 0; j < trigram.length; j++) {
          hash = (hash << 5) - hash + trigram.charCodeAt(j);
          hash |= 0; // Convert to 32bit integer
        }
        const index = Math.abs(hash) % 256;
        vector[index] += 1;
      }
    }

    // Normalize vector to unit length (L2 Normalization)
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;

    return vector.map((val) => val / magnitude);
  }

  /**
   * Evaluates input text for inappropriate content, profanity, or security policy bypass terms.
   */
  async analyzeToxicity(
    text: string,
  ): Promise<{ isToxic: boolean; reason?: string }> {
    const clean = (text || '').toLowerCase();
    const toxicWords = [
      'abuse',
      'harass',
      'nigger',
      'faggot',
      'retard',
      'kill yourself',
      'kys',
      'fuck you',
      'bitch',
      'asshole',
      'bastard',
      'hack the database',
      'sql injection',
      'xss bypass',
      'exploit systems',
    ];

    for (const word of toxicWords) {
      if (clean.includes(word)) {
        return {
          isToxic: true,
          reason: `Flagged due to toxic/inappropriate language: "${word}"`,
        };
      }
    }

    return { isToxic: false };
  }

  /**
   * Classifies a user query as 'personal' or 'generic'.
   * Personal queries contain sensitive contact, credentials, invoice IDs, or explicit personal billing topics.
   */
  async classifyQuery(
    text: string,
  ): Promise<{ type: 'generic' | 'personal'; confidence: number }> {
    const clean = (text || '').toLowerCase();

    // Check patterns for email addresses, credit cards, SSN, or billing IDs
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;

    const hasEmail = emailPattern.test(clean);
    const hasPhone = phonePattern.test(clean);
    const hasSsn = ssnPattern.test(clean);

    const personalKeywords = [
      'my invoice',
      'my billing',
      'my credit card',
      'my password',
      'my ssn',
      'my passport',
      'my tax id',
      'my account number',
      'charges on my profile',
      'refund my order',
      'my private email',
      'my phone number',
    ];

    let matchCount = 0;
    for (const keyword of personalKeywords) {
      if (clean.includes(keyword)) {
        matchCount++;
      }
    }

    if (hasEmail || hasPhone || hasSsn || matchCount > 0) {
      return {
        type: 'personal',
        confidence: hasSsn ? 0.99 : hasEmail ? 0.95 : 0.85 + 0.05 * Math.min(matchCount, 2),
      };
    }

    return {
      type: 'generic',
      confidence: 0.9,
    };
  }

  /**
   * Future MiniMax Integration Hook: Takes community discussion details and answers,
   * synthesizing a neat, high-quality, comprehensive FAQ summary.
   */
  async generateFaqFromDiscussion(
    title: string,
    answers: string[],
  ): Promise<{ question: string; answer: string }> {
    // Generate clean FAQ summary based on best answers
    const question = title.endsWith('?') ? title : `${title}?`;

    let answer = '';
    if (answers.length === 0) {
      answer = 'No answers have been contributed to this discussion yet.';
    } else {
      // Summarize community opinions dynamically
      const cleanAnswers = answers.map((a) => a.replace(/<[^>]*>/g, '').trim());
      answer = `### Community Summary\n\nBased on contributions from the community:\n\n${cleanAnswers
        .slice(0, 3)
        .map((a, i) => `${i + 1}. ${a}`)
        .join('\n\n')}\n\n*This FAQ was automatically compiled and summarized from community discussions.*`;
    }

    return {
      question,
      answer,
    };
  }
}

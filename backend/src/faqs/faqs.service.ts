import { Injectable, OnApplicationBootstrap, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FaqDocument } from './faq.schema';
import { FeedbackDocument } from './feedback.schema';
import { BookmarkDocument } from '../questions/bookmark.schema';
import { AiService } from '../ai/ai.service';
import { VectorStoreService } from '../ai/vector-store.service';

@Injectable()
export class FaqsService implements OnApplicationBootstrap {
  constructor(
    @InjectModel('Faq') private readonly faqModel: Model<FaqDocument>,
    @InjectModel('Feedback') private readonly feedbackModel: Model<FeedbackDocument>,
    @InjectModel('Bookmark') private readonly bookmarkModel: Model<BookmarkDocument>,
    private readonly aiService: AiService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  /**
   * Automatically indexes all existing database FAQs inside the VectorStore memory space on startup.
   */
  async onApplicationBootstrap() {
    try {
      const faqs = await this.faqModel.find();
      await this.vectorStore.clear();

      for (const faq of faqs) {
        await this.vectorStore.addDocument(faq._id.toString(), faq.embedding, {
          question: faq.question,
          answer: faq.answer,
        });
      }
      console.log(`[Vector Store Bootstrap] Successfully indexed ${faqs.length} FAQs.`);
    } catch (err) {
      console.error('[Vector Store Bootstrap] Failed to index FAQs:', err);
    }
  }

  async getAllApprovedFaqs() {
    return this.faqModel.find().sort({ createdAt: -1 });
  }

  /**
   * Vector-based search algorithm returning similarity scores, structured autocomplete,
   * and duplicate prevention warnings if similarity score crosses 80%.
   */
  async searchSimilarFaqs(queryText: string) {
    if (!queryText || queryText.trim().length === 0) {
      return {
        bestMatch: null,
        suggestions: [],
        confidenceScore: 0,
        discourageDuplicate: false,
      };
    }

    const queryEmbedding = await this.aiService.generateEmbeddings(queryText);
    const similarDocs = await this.vectorStore.searchSimilar(queryEmbedding, 5);

    const suggestions = similarDocs.map((doc) => ({
      faqId: doc.id,
      question: doc.metadata.question,
      answer: doc.metadata.answer,
      score: Math.round(doc.score * 100) / 100, // Round to 2 decimal places
    }));

    const bestMatch = suggestions[0] || null;
    const confidenceScore = bestMatch ? bestMatch.score * 100 : 0;

    // Discourage new query if similarity score is 80% or greater
    const discourageDuplicate = confidenceScore >= 80;

    // Increment viewCount on matching records
    if (bestMatch) {
      await this.faqModel.findByIdAndUpdate(bestMatch.faqId, { $inc: { viewCount: 1 } });
    }

    return {
      bestMatch,
      suggestions,
      confidenceScore,
      discourageDuplicate,
    };
  }

  /**
   * Adds a new FAQ entry to both MongoDB database and the Active Vector store indices.
   */
  async createFaq(faqDto: { question: string; answer: string; approvedBy?: string; isGenerated?: boolean }) {
    const cleanQuestion = faqDto.question.trim();
    const cleanAnswer = faqDto.answer.trim();

    // Check duplicate questions
    const existing = await this.faqModel.findOne({ question: cleanQuestion });
    if (existing) {
      throw new ConflictException('An FAQ with this exact question already exists.');
    }

    const embedding = await this.aiService.generateEmbeddings(cleanQuestion);

    const newFaq = new this.faqModel({
      question: cleanQuestion,
      answer: cleanAnswer,
      embedding,
      isGenerated: faqDto.isGenerated || false,
      approvedBy: faqDto.approvedBy || null,
    });

    const saved = await newFaq.save();

    // Dynamically register in VectorStore
    await this.vectorStore.addDocument(saved._id.toString(), embedding, {
      question: saved.question,
      answer: saved.answer,
    });

    return saved;
  }

  /**
   * Smart Search algorithm that routes queries between:
   * 1. Existing FAQs (Direct Match)
   * 2. Community Discussions (RAG - Retrieval Augmented Context)
   * 3. LLM Synthesis (Generative fallback for complex multi-context queries)
   */
  async smartSearch(queryText: string) {
    if (!queryText || queryText.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

    const queryEmbedding = await this.aiService.generateEmbeddings(queryText);
    
    // Step 1: Search FAQs (Direct Matches)
    const similarFaqs = await this.vectorStore.searchSimilar(queryEmbedding, 3);
    const bestFaq = similarFaqs[0];

    // If we have a very high confidence FAQ match, return it immediately
    if (bestFaq && bestFaq.score >= 0.85) {
      // Increment view count
      await this.faqModel.findByIdAndUpdate(bestFaq.id, { $inc: { viewCount: 1 } });
      return {
        routing: 'faq',
        data: {
          id: bestFaq.id,
          question: bestFaq.metadata.question,
          answer: bestFaq.metadata.answer,
          score: bestFaq.score,
        },
        message: 'Direct FAQ match found.',
      };
    }

    // Step 2: Search Community Questions (RAG Context)
    // We search the questionModel using embeddings
    const similarQuestions = await this.faqModel.db.model('Question').find({
      type: 'generic',
      moderationStatus: 'approved',
    }).select('title content embedding answerCount');

    // Simple manual similarity check for questions (could be moved to a dedicated service)
    const scoredQuestions = similarQuestions.map(q => {
      const score = this.calculateCosineSimilarity(queryEmbedding, (q as any).embedding);
      return { question: q, score };
    }).sort((a, b) => b.score - a.score).slice(0, 3);

    const bestQuestionMatch = scoredQuestions[0];

    // If we have a decent question match with answers, use it as RAG context
    if (bestQuestionMatch && bestQuestionMatch.score >= 0.6 && (bestQuestionMatch.question as any).answerCount > 0) {
      return {
        routing: 'rag',
        data: {
          originalQuestion: bestQuestionMatch.question.title,
          score: bestQuestionMatch.score,
          relatedDiscussions: scoredQuestions.map(sq => ({
            id: sq.question._id,
            title: sq.question.title,
            score: sq.score
          }))
        },
        message: 'Found relevant community discussions. Routing to RAG context.',
      };
    }

    // Step 3: LLM Context Switch (Synthesized Answer)
    // For complex or multi-context queries that don't match existing data well
    const synthesizedAnswer = await this.aiService.generateFaqFromDiscussion(
      queryText,
      scoredQuestions.map(sq => sq.question.content) // Use existing questions as context
    );

    return {
      routing: 'llm',
      data: {
        question: synthesizedAnswer.question,
        synthesizedAnswer: synthesizedAnswer.answer,
        confidence: 0.5 // Lower confidence for purely synthesized answers
      },
      message: 'No direct match found. Switching to LLM context for comprehensive synthesis.',
    };
  }

  private calculateCosineSimilarity(v1: number[], v2: number[]): number {
    if (!v1 || !v2 || v1.length !== v2.length || v1.length === 0) return 0;
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i < v1.length; i++) {
      dotProduct += v1[i] * v2[i];
      norm1 += v1[i] * v1[i];
      norm2 += v2[i] * v2[i];
    }
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Logs a user's search feedback, incrementing the FAQ's dynamic 'useCount' if resolved successfully.
   */
  async submitFeedback(feedbackDto: {
    userId?: string;
    faqId: string;
    queryText: string;
    isHelpful: boolean;
    comments?: string;
    confidenceScore: number;
  }) {
    const faq = await this.faqModel.findById(feedbackDto.faqId);
    if (!faq) {
      throw new NotFoundException('Faq target not found');
    }

    const feedback = new this.feedbackModel({
      userId: feedbackDto.userId || null,
      faqId: feedbackDto.faqId,
      queryText: feedbackDto.queryText,
      isHelpful: feedbackDto.isHelpful,
      comments: feedbackDto.comments || '',
      confidenceScore: feedbackDto.confidenceScore,
    });
    const saved = await feedback.save();

    // If marked as helpful, increment usage metrics
    if (feedbackDto.isHelpful) {
      faq.useCount += 1;
      await faq.save();
    }

    return saved;
  }

  /**
   * Bookmarks or unbookmarks a specific FAQ for a user profile.
   */
  async toggleBookmark(userId: string, faqId: string) {
    const faq = await this.faqModel.findById(faqId);
    if (!faq) {
      throw new NotFoundException('Faq item not found');
    }

    const existing = await this.bookmarkModel.findOne({ userId, itemId: faqId, itemType: 'faq' });
    if (existing) {
      await this.bookmarkModel.deleteOne({ _id: existing._id });
      return { bookmarked: false };
    } else {
      const newBookmark = new this.bookmarkModel({
        userId,
        itemId: faqId,
        itemType: 'faq',
      });
      await newBookmark.save();
      return { bookmarked: true };
    }
  }

  async isBookmarked(userId: string, faqId: string): Promise<boolean> {
    const b = await this.bookmarkModel.findOne({ userId, itemId: faqId, itemType: 'faq' });
    return !!b;
  }
}

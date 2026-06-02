import { Injectable, OnApplicationBootstrap, NotFoundException, ConflictException } from '@nestjs/common';
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

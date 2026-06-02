import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './user.schema';
import { NotificationDocument } from './notification.schema';
import { BookmarkDocument } from '../questions/bookmark.schema';
import { QuestionDocument } from '../questions/question.schema';
import { FaqDocument } from '../faqs/faq.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('Notification')
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel('Bookmark') private readonly bookmarkModel: Model<BookmarkDocument>,
    @InjectModel('Question') private readonly questionModel: Model<QuestionDocument>,
    @InjectModel('Faq') private readonly faqModel: Model<FaqDocument>,
  ) {}

  async getUserProfile(id: string) {
    const user = await this.userModel.findById(id).select('-passwordHash');
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    // Get their contribution statistics
    const questionCount = await this.questionModel.countDocuments({
      author: id,
      type: 'generic',
    });
    return {
      user,
      stats: {
        questionsAsked: questionCount,
      },
    };
  }

  async getLeaderboard(limit = 10) {
    return this.userModel
      .find({ isBanned: false })
      .sort({ reputationPoints: -1 })
      .limit(limit)
      .select('name reputationPoints role bio createdAt');
  }

  async awardReputationPoints(
    userId: string,
    points: number,
    title: string,
    message: string,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) return;

    user.reputationPoints += points;
    // Enforce non-negative score
    if (user.reputationPoints < 0) {
      user.reputationPoints = 0;
    }
    await user.save();

    // Create a reputation notification
    const notification = new this.notificationModel({
      recipient: userId,
      title,
      message: `${message} (+${points} SP)`,
      type: 'reputation',
      isRead: false,
    });
    await notification.save();
  }

  async getNotifications(userId: string) {
    return this.notificationModel
      .find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      recipient: userId,
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    await notification.save();
    return { success: true };
  }

  async getBookmarks(userId: string) {
    const bookmarks = await this.bookmarkModel.find({ userId }).sort({ createdAt: -1 });

    const results = [];
    for (const b of bookmarks) {
      if (b.itemType === 'faq') {
        const faq = await this.faqModel.findById(b.itemId);
        if (faq) {
          results.push({
            bookmarkId: b._id,
            itemType: 'faq',
            item: faq,
            createdAt: (b as any).createdAt,
          });
        }
      } else {
        const question = await this.questionModel
          .findById(b.itemId)
          .populate('author', 'name reputationPoints');
        if (question && question.moderationStatus === 'approved') {
          results.push({
            bookmarkId: b._id,
            itemType: 'question',
            item: question,
            createdAt: (b as any).createdAt,
          });
        }
      }
    }

    return results;
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserSchema } from '../users/user.schema';
import { FaqSchema } from '../faqs/faq.schema';
import { QuestionSchema } from '../questions/question.schema';
import { AnswerSchema } from '../questions/answer.schema';
import { FeedbackSchema } from '../faqs/feedback.schema';
import { NotificationSchema } from '../users/notification.schema';
import { ModerationLogSchema } from './moderation-log.schema';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Faq', schema: FaqSchema },
      { name: 'Question', schema: QuestionSchema },
      { name: 'Feedback', schema: FeedbackSchema },
      { name: 'Answer', schema: AnswerSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'ModerationLog', schema: ModerationLogSchema },
    ]),
    AiModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}

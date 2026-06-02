import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { FaqSchema } from './faq.schema';
import { FeedbackSchema } from './feedback.schema';
import { BookmarkSchema } from '../questions/bookmark.schema';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Faq', schema: FaqSchema },
      { name: 'Feedback', schema: FeedbackSchema },
      { name: 'Bookmark', schema: BookmarkSchema },
    ]),
    AiModule,
  ],
  providers: [FaqsService],
  controllers: [FaqsController],
  exports: [FaqsService],
})
export class FaqsModule {}

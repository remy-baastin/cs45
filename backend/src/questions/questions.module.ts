import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { QuestionSchema } from './question.schema';
import { AnswerSchema } from './answer.schema';
import { VoteSchema } from './vote.schema';
import { BookmarkSchema } from './bookmark.schema';
import { UserSchema } from '../users/user.schema';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Question', schema: QuestionSchema },
      { name: 'Answer', schema: AnswerSchema },
      { name: 'Vote', schema: VoteSchema },
      { name: 'Bookmark', schema: BookmarkSchema },
      { name: 'User', schema: UserSchema },
    ]),
    AiModule,
    UsersModule,
  ],
  providers: [QuestionsService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {}

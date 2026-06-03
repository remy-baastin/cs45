import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSchema } from './user.schema';
import { NotificationSchema } from './notification.schema';
import { BookmarkSchema } from '../questions/bookmark.schema';
import { QuestionSchema } from '../questions/question.schema';
import { FaqSchema } from '../faqs/faq.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'Bookmark', schema: BookmarkSchema },
      { name: 'Question', schema: QuestionSchema },
      { name: 'Faq', schema: FaqSchema },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

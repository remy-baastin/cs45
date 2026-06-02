import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { FaqsModule } from './faqs/faqs.module';
import { QuestionsModule } from './questions/questions.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configure Mongoose to connect to our dynamic/local MongoDB URI
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/faq-platform',
    ),
    AuthModule,
    UsersModule,
    AiModule,
    FaqsModule,
    QuestionsModule,
    AdminModule,
  ],
})
export class AppModule {}

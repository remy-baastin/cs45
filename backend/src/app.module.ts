import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { FaqsModule } from './faqs/faqs.module';
import { QuestionsModule } from './questions/questions.module';
import { AdminModule } from './admin/admin.module';
import { AiSearchModule } from './ai-search/ai-search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    AiSearchModule,
  ],
})
export class AppModule {}

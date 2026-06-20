import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiSearchController } from './ai-search.controller';
import { AiSearchService } from './ai-search.service';
import { MinimaxEmbeddingClient } from './minimax-embedding.client';
import { EmbeddingCacheService } from './embedding-cache.service';
import { Faq, FaqSchema } from '../faqs/faq.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }]),
  ],
  controllers: [AiSearchController],
  providers: [
    AiSearchService,
    MinimaxEmbeddingClient,
    EmbeddingCacheService,
  ],
  exports: [
    AiSearchService,  // exported so Negha's FAQ Generation module can call indexFaq()
  ],
})
export class AiSearchModule {}

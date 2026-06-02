import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { VectorStoreService } from './vector-store.service';

@Module({
  providers: [
    {
      provide: 'IAiService',
      useClass: AiService,
    },
    {
      provide: 'IVectorStore',
      useClass: VectorStoreService,
    },
    AiService,
    VectorStoreService,
  ],
  exports: ['IAiService', 'IVectorStore', AiService, VectorStoreService],
})
export class AiModule {}

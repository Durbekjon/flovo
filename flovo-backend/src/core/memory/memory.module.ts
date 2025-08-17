import { Module } from '@nestjs/common';
import { ConversationMemoryService } from './conversation-memory.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [ConversationMemoryService],
  exports: [ConversationMemoryService],
})
export class MemoryModule {}

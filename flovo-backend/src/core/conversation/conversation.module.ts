import { Module } from '@nestjs/common';
import { ConversationContextService } from './conversation-context.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LanguageModule } from '../language/language.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [PrismaModule, LanguageModule, MemoryModule],
  providers: [ConversationContextService],
  exports: [ConversationContextService],
})
export class ConversationModule {}

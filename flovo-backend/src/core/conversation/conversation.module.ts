import { Module } from '@nestjs/common';
import { ConversationContextService } from './conversation-context.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConversationContextService],
  exports: [ConversationContextService],
})
export class ConversationModule {}

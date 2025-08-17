import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SecurityModule } from './security/security.module';
import { LoggingModule } from './logging/logging.module';
import { CacheModule } from './cache/cache.module';
import { ConversationModule } from './conversation/conversation.module';
import { LanguageModule } from './language/language.module';
import { MemoryModule } from './memory/memory.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CRMModule } from './crm/crm.module';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
    LoggingModule,
    CacheModule,
    ConversationModule,
    LanguageModule,
    MemoryModule,
    AnalyticsModule,
    CRMModule,
  ],
  exports: [
    PrismaModule,
    SecurityModule,
    LoggingModule,
    CacheModule,
    ConversationModule,
    LanguageModule,
    MemoryModule,
    AnalyticsModule,
    CRMModule,
  ],
})
export class CoreModule {}

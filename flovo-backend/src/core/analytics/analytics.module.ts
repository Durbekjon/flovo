import { Module } from '@nestjs/common';
import { SalesAnalyticsService } from './sales-analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [SalesAnalyticsService],
  exports: [SalesAnalyticsService],
})
export class AnalyticsModule {}

import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}

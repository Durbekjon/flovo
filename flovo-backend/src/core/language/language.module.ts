import { Module } from '@nestjs/common';
import { LanguageDetectionService } from './language-detection.service';

@Module({
  providers: [LanguageDetectionService],
  exports: [LanguageDetectionService],
})
export class LanguageModule {}

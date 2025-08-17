import { Module } from '@nestjs/common';
import { CRMService } from './crm.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [CRMService],
  exports: [CRMService],
})
export class CRMModule {}

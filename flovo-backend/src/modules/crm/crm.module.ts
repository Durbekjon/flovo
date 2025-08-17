import { Module } from '@nestjs/common';
import { CRMController } from './crm.controller';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [CRMController],
})
export class CRMModule {}

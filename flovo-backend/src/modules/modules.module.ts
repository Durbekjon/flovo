import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { TelegramModule } from './telegram/telegram.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CRMModule } from './crm/crm.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    OrdersModule,
    ProductsModule,
    TelegramModule,
    AnalyticsModule,
    CRMModule,
  ],
})
export class ModulesModule {}

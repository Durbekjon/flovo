import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { SalesAnalyticsService } from '../../core/analytics/sales-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly salesAnalyticsService: SalesAnalyticsService) {}

  @Get('sales-metrics')
  async getSalesMetrics(
    @CurrentUser() user: any,
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    return await this.salesAnalyticsService.getSalesMetrics(
      user.userId,
      period,
    );
  }

  @Get('customer-analytics')
  async getCustomerAnalytics(@CurrentUser() user: any) {
    return await this.salesAnalyticsService.getCustomerAnalytics(user.userId);
  }

  @Get('product-analytics')
  async getProductAnalytics(@CurrentUser() user: any) {
    return await this.salesAnalyticsService.getProductAnalytics(user.userId);
  }

  @Get('conversation-analytics')
  async getConversationAnalytics(@CurrentUser() user: any) {
    return await this.salesAnalyticsService.getConversationAnalytics(
      user.userId,
    );
  }

  @Get('performance-insights')
  async getPerformanceInsights(@CurrentUser() user: any) {
    return await this.salesAnalyticsService.getPerformanceInsights(user.userId);
  }

  @Get('dashboard-summary')
  async getDashboardSummary(@CurrentUser() user: any) {
    const [
      salesMetrics,
      customerAnalytics,
      productAnalytics,
      conversationAnalytics,
      performanceInsights,
    ] = await Promise.all([
      this.salesAnalyticsService.getSalesMetrics(user.userId, 'month'),
      this.salesAnalyticsService.getCustomerAnalytics(user.userId),
      this.salesAnalyticsService.getProductAnalytics(user.userId),
      this.salesAnalyticsService.getConversationAnalytics(user.userId),
      this.salesAnalyticsService.getPerformanceInsights(user.userId),
    ]);

    return {
      salesMetrics,
      customerAnalytics,
      productAnalytics,
      conversationAnalytics,
      performanceInsights,
      summary: {
        totalRevenue: salesMetrics.totalRevenue,
        totalOrders: salesMetrics.totalOrders,
        totalCustomers: customerAnalytics.totalCustomers,
        totalProducts: productAnalytics.totalProducts,
        totalConversations: conversationAnalytics.totalConversations,
        conversionRate: salesMetrics.conversionRate,
        averageOrderValue: salesMetrics.averageOrderValue,
        customerSatisfaction: salesMetrics.customerSatisfactionScore,
      },
    };
  }
}

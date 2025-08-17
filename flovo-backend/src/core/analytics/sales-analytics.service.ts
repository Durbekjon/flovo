import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import type { Order, Product, User, Message } from '@prisma/client';

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  customerLifetimeValue: number;
  repeatPurchaseRate: number;
  averageResponseTime: number;
  customerSatisfactionScore: number;
  salesVelocity: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  churnRate: number;
  customerSegments: CustomerSegment[];
  topCustomers: TopCustomer[];
}

export interface CustomerSegment {
  segment: 'vip' | 'loyal' | 'regular' | 'new' | 'at_risk';
  count: number;
  percentage: number;
  averageOrderValue: number;
  totalRevenue: number;
  characteristics: string[];
}

export interface TopCustomer {
  customerId: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date;
  relationshipScore: number;
  preferredLanguage: string;
  favoriteCategories: string[];
}

export interface ProductAnalytics {
  totalProducts: number;
  topSellingProducts: TopProduct[];
  categoryAnalytics: CategoryAnalytics[];
}

export interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
  conversionRate: number;
  demandTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface CategoryAnalytics {
  category: string;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  customerPreference: number;
}

export interface ConversationAnalytics {
  totalConversations: number;
  averageConversationLength: number;
  responseTimeMetrics: ResponseTimeMetrics;
  intentAnalysis: IntentAnalysis;
  languageAnalytics: LanguageAnalytics;
}

export interface ResponseTimeMetrics {
  averageResponseTime: number;
  responseTimeDistribution: ResponseTimeDistribution[];
  peakResponseTimes: HourlyDistribution[];
}

export interface ResponseTimeDistribution {
  timeRange: string;
  count: number;
  percentage: number;
}

export interface HourlyDistribution {
  hour: number;
  conversations: number;
  orders: number;
  revenue: number;
}

export interface IntentAnalysis {
  totalIntents: number;
  intentDistribution: Record<string, number>;
  intentSuccessRate: Record<string, number>;
  topIntents: TopIntent[];
}

export interface TopIntent {
  intent: string;
  count: number;
  percentage: number;
  successRate: number;
  averageResponseTime: number;
}

export interface LanguageAnalytics {
  totalLanguages: number;
  languageDistribution: Record<string, number>;
  languagePerformance: LanguagePerformance[];
}

export interface LanguagePerformance {
  language: string;
  conversations: number;
  orders: number;
  conversionRate: number;
  averageOrderValue: number;
  customerSatisfaction: number;
}

export interface PerformanceInsights {
  topPerformers: TopPerformer[];
  improvementAreas: ImprovementArea[];
  opportunities: Opportunity[];
  risks: Risk[];
  recommendations: Recommendation[];
}

export interface TopPerformer {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  impact: 'high' | 'medium' | 'low';
}

export interface ImprovementArea {
  area: string;
  currentValue: number;
  targetValue: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  actionPlan: string[];
}

export interface Opportunity {
  type: 'upsell' | 'cross_sell' | 'retention' | 'acquisition' | 'optimization';
  description: string;
  potentialValue: number;
  probability: number;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface Risk {
  type: 'customer_churn' | 'inventory' | 'competition' | 'technical' | 'market';
  description: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  mitigation: string[];
}

export interface Recommendation {
  category:
    | 'sales'
    | 'marketing'
    | 'operations'
    | 'customer_service'
    | 'product';
  title: string;
  description: string;
  expectedImpact: number;
  implementationEffort: 'low' | 'medium' | 'high';
  priority: 'immediate' | 'short_term' | 'long_term';
  actionItems: string[];
}

@Injectable()
export class SalesAnalyticsService {
  private readonly logger = new Logger(SalesAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getSalesMetrics(
    userId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month',
  ): Promise<SalesMetrics> {
    const cacheKey = `sales_metrics:${userId}:${period}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = this.getStartDate(period);

    // Get orders for the period
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      include: { user: true },
    });

    // Calculate metrics
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.details as any)?.total || 0,
      0,
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get conversation data for conversion rate
    const conversations = await this.prisma.conversation.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      include: { messages: true },
    });

    const conversionRate =
      conversations.length > 0 ? (totalOrders / conversations.length) * 100 : 0;

    // Calculate customer lifetime value (simplified)
    const allOrders = await this.prisma.order.findMany({
      where: { userId },
      include: { user: true },
    });

    const totalCustomers = new Set(allOrders.map((order) => order.userId)).size;
    const customerLifetimeValue =
      totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Calculate repeat purchase rate
    const customerOrderCounts = new Map<string, number>();
    allOrders.forEach((order) => {
      customerOrderCounts.set(
        order.userId,
        (customerOrderCounts.get(order.userId) || 0) + 1,
      );
    });

    const repeatCustomers = Array.from(customerOrderCounts.values()).filter(
      (count) => count > 1,
    ).length;
    const repeatPurchaseRate =
      totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    // Calculate average response time
    const messages = await this.prisma.message.findMany({
      where: {
        conversation: { userId },
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const responseTimes: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender === 'BOT' && messages[i - 1].sender === 'USER') {
        const responseTime =
          messages[i].createdAt.getTime() - messages[i - 1].createdAt.getTime();
        responseTimes.push(responseTime);
      }
    }

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    // Calculate customer satisfaction score (simplified)
    const customerSatisfactionScore = this.calculateCustomerSatisfaction(
      orders,
      conversations,
    );

    // Calculate sales velocity (revenue per day)
    const daysInPeriod = this.getDaysInPeriod(period);
    const salesVelocity = daysInPeriod > 0 ? totalRevenue / daysInPeriod : 0;

    const metrics: SalesMetrics = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate,
      customerLifetimeValue,
      repeatPurchaseRate,
      averageResponseTime,
      customerSatisfactionScore,
      salesVelocity,
    };

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, JSON.stringify(metrics), 3600);

    return metrics;
  }

  async getCustomerAnalytics(userId: string): Promise<CustomerAnalytics> {
    const cacheKey = `customer_analytics:${userId}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get all customers and their data
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { user: true },
    });

    // Calculate customer segments
    const customerSegments = this.calculateCustomerSegments(orders);

    // Get top customers
    const topCustomers = this.getTopCustomers(orders);

    const analytics: CustomerAnalytics = {
      totalCustomers: new Set(orders.map((order) => order.userId)).size,
      newCustomers: this.getNewCustomers(orders),
      returningCustomers: this.getReturningCustomers(orders),
      churnRate: this.calculateChurnRate(orders),
      customerSegments,
      topCustomers,
    };

    // Cache for 2 hours
    await this.cacheService.set(cacheKey, JSON.stringify(analytics), 7200);

    return analytics;
  }

  async getProductAnalytics(userId: string): Promise<ProductAnalytics> {
    const cacheKey = `product_analytics:${userId}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get products and orders
    const products = await this.prisma.product.findMany({
      where: { userId },
    });

    const orders = await this.prisma.order.findMany({
      where: { userId },
    });

    // Calculate top selling products
    const topSellingProducts = this.calculateTopSellingProducts(
      products,
      orders,
    );

    // Calculate category analytics
    const categoryAnalytics = this.calculateCategoryAnalytics(products, orders);

    const analytics: ProductAnalytics = {
      totalProducts: products.length,
      topSellingProducts,
      categoryAnalytics,
    };

    // Cache for 2 hours
    await this.cacheService.set(cacheKey, JSON.stringify(analytics), 7200);

    return analytics;
  }

  async getConversationAnalytics(
    userId: string,
  ): Promise<ConversationAnalytics> {
    const cacheKey = `conversation_analytics:${userId}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get conversations and messages
    const conversations = await this.prisma.conversation.findMany({
      where: { userId },
      include: { messages: true },
    });

    // Calculate response time metrics
    const responseTimeMetrics =
      this.calculateResponseTimeMetrics(conversations);

    // Calculate intent analysis
    const intentAnalysis = this.calculateIntentAnalysis(conversations);

    // Calculate language analytics
    const languageAnalytics = this.calculateLanguageAnalytics(conversations);

    const analytics: ConversationAnalytics = {
      totalConversations: conversations.length,
      averageConversationLength:
        this.calculateAverageConversationLength(conversations),
      responseTimeMetrics,
      intentAnalysis,
      languageAnalytics,
    };

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, JSON.stringify(analytics), 3600);

    return analytics;
  }

  async getPerformanceInsights(userId: string): Promise<PerformanceInsights> {
    const cacheKey = `performance_insights:${userId}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get all analytics data
    const salesMetrics = await this.getSalesMetrics(userId);
    const customerAnalytics = await this.getCustomerAnalytics(userId);
    const productAnalytics = await this.getProductAnalytics(userId);
    const conversationAnalytics = await this.getConversationAnalytics(userId);

    // Calculate insights
    const topPerformers = this.calculateTopPerformers(
      salesMetrics,
      customerAnalytics,
      productAnalytics,
    );
    const improvementAreas = this.calculateImprovementAreas(
      salesMetrics,
      customerAnalytics,
      productAnalytics,
    );
    const opportunities = this.calculateOpportunities(
      salesMetrics,
      customerAnalytics,
      productAnalytics,
    );
    const risks = this.calculateRisks(
      salesMetrics,
      customerAnalytics,
      productAnalytics,
    );
    const recommendations = this.generateRecommendations(
      salesMetrics,
      customerAnalytics,
      productAnalytics,
      conversationAnalytics,
    );

    const insights: PerformanceInsights = {
      topPerformers,
      improvementAreas,
      opportunities,
      risks,
      recommendations,
    };

    // Cache for 4 hours
    await this.cacheService.set(cacheKey, JSON.stringify(insights), 14400);

    return insights;
  }

  // Helper methods
  private getStartDate(period: 'day' | 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
    }
  }

  private getDaysInPeriod(period: 'day' | 'week' | 'month' | 'year'): number {
    switch (period) {
      case 'day':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'year':
        return 365;
    }
  }

  private calculateCustomerSatisfaction(
    orders: Order[],
    conversations: any[],
  ): number {
    const totalInteractions = orders.length + conversations.length;
    if (totalInteractions === 0) return 0;

    const repeatOrders = new Set(orders.map((order) => order.userId)).size;
    const longConversations = conversations.filter(
      (conv) => conv.messages.length > 5,
    ).length;

    return Math.min(
      100,
      ((repeatOrders + longConversations) / totalInteractions) * 100,
    );
  }

  private calculateCustomerSegments(orders: Order[]): CustomerSegment[] {
    const customerData = new Map<
      string,
      { orders: Order[]; totalSpent: number }
    >();

    orders.forEach((order) => {
      const customerId = order.userId;
      if (!customerData.has(customerId)) {
        customerData.set(customerId, { orders: [], totalSpent: 0 });
      }
      const data = customerData.get(customerId)!;
      data.orders.push(order);
      data.totalSpent += (order.details as any)?.total || 0;
    });

    const segments: CustomerSegment[] = [];
    const totalCustomers = customerData.size;

    // VIP Customers (top 10% by spending)
    const sortedCustomers = Array.from(customerData.entries()).sort(
      (a, b) => b[1].totalSpent - a[1].totalSpent,
    );

    const vipCount = Math.ceil(totalCustomers * 0.1);
    const vipCustomers = sortedCustomers.slice(0, vipCount);

    segments.push({
      segment: 'vip',
      count: vipCount,
      percentage: (vipCount / totalCustomers) * 100,
      averageOrderValue:
        vipCustomers.reduce(
          (sum, [, data]) => sum + data.totalSpent / data.orders.length,
          0,
        ) / vipCount,
      totalRevenue: vipCustomers.reduce(
        (sum, [, data]) => sum + data.totalSpent,
        0,
      ),
      characteristics: [
        'High spending',
        'Frequent purchases',
        'Premium products',
      ],
    });

    // Loyal Customers (repeat orders)
    const loyalCustomers = Array.from(customerData.entries()).filter(
      ([, data]) => data.orders.length > 1,
    );

    segments.push({
      segment: 'loyal',
      count: loyalCustomers.length,
      percentage: (loyalCustomers.length / totalCustomers) * 100,
      averageOrderValue:
        loyalCustomers.reduce(
          (sum, [, data]) => sum + data.totalSpent / data.orders.length,
          0,
        ) / loyalCustomers.length,
      totalRevenue: loyalCustomers.reduce(
        (sum, [, data]) => sum + data.totalSpent,
        0,
      ),
      characteristics: [
        'Repeat purchases',
        'Consistent spending',
        'Trusted relationship',
      ],
    });

    return segments;
  }

  private getTopCustomers(orders: Order[]): TopCustomer[] {
    const customerData = new Map<
      string,
      { orders: Order[]; totalSpent: number }
    >();

    orders.forEach((order) => {
      const customerId = order.userId;
      if (!customerData.has(customerId)) {
        customerData.set(customerId, { orders: [], totalSpent: 0 });
      }
      const data = customerData.get(customerId)!;
      data.orders.push(order);
      data.totalSpent += (order.details as any)?.total || 0;
    });

    return Array.from(customerData.entries())
      .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
      .slice(0, 10)
      .map(([customerId, data]) => ({
        customerId,
        name: `Customer ${customerId}`,
        totalOrders: data.orders.length,
        totalSpent: data.totalSpent,
        averageOrderValue: data.totalSpent / data.orders.length,
        lastOrderDate: data.orders[data.orders.length - 1].createdAt,
        relationshipScore: this.calculateRelationshipScore(data.orders),
        preferredLanguage: 'uz',
        favoriteCategories: this.extractFavoriteCategories(data.orders),
      }));
  }

  private calculateRelationshipScore(orders: Order[]): number {
    let score = orders.length * 10;
    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.details as any)?.total || 0,
      0,
    );
    score += Math.min(totalSpent / 10, 50);
    return Math.min(score, 100);
  }

  private extractFavoriteCategories(orders: Order[]): string[] {
    const categories = new Map<string, number>();

    orders.forEach((order) => {
      const items = (order.details as any)?.items || '';
      if (items.includes('clothing'))
        categories.set('clothing', (categories.get('clothing') || 0) + 1);
      if (items.includes('food'))
        categories.set('food', (categories.get('food') || 0) + 1);
      if (items.includes('electronics'))
        categories.set('electronics', (categories.get('electronics') || 0) + 1);
    });

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  private getNewCustomers(orders: Order[]): number {
    const customerFirstOrders = new Map<string, Date>();

    orders.forEach((order) => {
      if (
        !customerFirstOrders.has(order.userId) ||
        order.createdAt < customerFirstOrders.get(order.userId)!
      ) {
        customerFirstOrders.set(order.userId, order.createdAt);
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return Array.from(customerFirstOrders.values()).filter(
      (date) => date >= thirtyDaysAgo,
    ).length;
  }

  private getReturningCustomers(orders: Order[]): number {
    const customerOrderCounts = new Map<string, number>();

    orders.forEach((order) => {
      customerOrderCounts.set(
        order.userId,
        (customerOrderCounts.get(order.userId) || 0) + 1,
      );
    });

    return Array.from(customerOrderCounts.values()).filter((count) => count > 1)
      .length;
  }

  private calculateChurnRate(orders: Order[]): number {
    const customerLastOrders = new Map<string, Date>();

    orders.forEach((order) => {
      if (
        !customerLastOrders.has(order.userId) ||
        order.createdAt > customerLastOrders.get(order.userId)!
      ) {
        customerLastOrders.set(order.userId, order.createdAt);
      }
    });

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const inactiveCustomers = Array.from(customerLastOrders.values()).filter(
      (date) => date < ninetyDaysAgo,
    ).length;

    const totalCustomers = customerLastOrders.size;

    return totalCustomers > 0 ? (inactiveCustomers / totalCustomers) * 100 : 0;
  }

  // Placeholder methods for other analytics
  private calculateTopSellingProducts(
    products: Product[],
    orders: Order[],
  ): TopProduct[] {
    return [];
  }

  private calculateCategoryAnalytics(
    products: Product[],
    orders: Order[],
  ): CategoryAnalytics[] {
    return [];
  }

  private calculateResponseTimeMetrics(
    conversations: any[],
  ): ResponseTimeMetrics {
    return {
      averageResponseTime: 0,
      responseTimeDistribution: [],
      peakResponseTimes: [],
    };
  }

  private calculateIntentAnalysis(conversations: any[]): IntentAnalysis {
    return {
      totalIntents: 0,
      intentDistribution: {},
      intentSuccessRate: {},
      topIntents: [],
    };
  }

  private calculateLanguageAnalytics(conversations: any[]): LanguageAnalytics {
    return {
      totalLanguages: 0,
      languageDistribution: {},
      languagePerformance: [],
    };
  }

  private calculateAverageConversationLength(conversations: any[]): number {
    if (conversations.length === 0) return 0;
    return (
      conversations.reduce((sum, conv) => sum + conv.messages.length, 0) /
      conversations.length
    );
  }

  private calculateTopPerformers(
    salesMetrics: SalesMetrics,
    customerAnalytics: CustomerAnalytics,
    productAnalytics: ProductAnalytics,
  ): TopPerformer[] {
    return [];
  }

  private calculateImprovementAreas(
    salesMetrics: SalesMetrics,
    customerAnalytics: CustomerAnalytics,
    productAnalytics: ProductAnalytics,
  ): ImprovementArea[] {
    return [];
  }

  private calculateOpportunities(
    salesMetrics: SalesMetrics,
    customerAnalytics: CustomerAnalytics,
    productAnalytics: ProductAnalytics,
  ): Opportunity[] {
    return [];
  }

  private calculateRisks(
    salesMetrics: SalesMetrics,
    customerAnalytics: CustomerAnalytics,
    productAnalytics: ProductAnalytics,
  ): Risk[] {
    return [];
  }

  private generateRecommendations(
    salesMetrics: SalesMetrics,
    customerAnalytics: CustomerAnalytics,
    productAnalytics: ProductAnalytics,
    conversationAnalytics: ConversationAnalytics,
  ): Recommendation[] {
    return [];
  }
}

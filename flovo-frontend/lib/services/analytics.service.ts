import { apiClient } from '../api';

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
  category: 'sales' | 'marketing' | 'operations' | 'customer_service' | 'product';
  title: string;
  description: string;
  expectedImpact: number;
  implementationEffort: 'low' | 'medium' | 'high';
  priority: 'immediate' | 'short_term' | 'long_term';
  actionItems: string[];
}

export interface DashboardSummary {
  salesMetrics: SalesMetrics;
  customerAnalytics: CustomerAnalytics;
  productAnalytics: ProductAnalytics;
  conversationAnalytics: ConversationAnalytics;
  performanceInsights: PerformanceInsights;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalConversations: number;
    conversionRate: number;
    averageOrderValue: number;
    customerSatisfaction: number;
  };
}

class AnalyticsService {
  async getSalesMetrics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SalesMetrics> {
    const response = await apiClient.get(`/analytics/sales-metrics?period=${period}`);
    return response.data;
  }

  async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    const response = await apiClient.get('/analytics/customer-analytics');
    return response.data;
  }

  async getProductAnalytics(): Promise<ProductAnalytics> {
    const response = await apiClient.get('/analytics/product-analytics');
    return response.data;
  }

  async getConversationAnalytics(): Promise<ConversationAnalytics> {
    const response = await apiClient.get('/analytics/conversation-analytics');
    return response.data;
  }

  async getPerformanceInsights(): Promise<PerformanceInsights> {
    const response = await apiClient.get('/analytics/performance-insights');
    return response.data;
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get('/analytics/dashboard-summary');
    return response.data;
  }

  // Helper methods for data formatting
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
    }
  }

  getImpactColor(impact: 'high' | 'medium' | 'low'): string {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
    }
  }

  getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  }

  getSegmentColor(segment: string): string {
    switch (segment) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'loyal':
        return 'bg-blue-100 text-blue-800';
      case 'regular':
        return 'bg-green-100 text-green-800';
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'at_risk':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  }
}

export const analyticsService = new AnalyticsService();

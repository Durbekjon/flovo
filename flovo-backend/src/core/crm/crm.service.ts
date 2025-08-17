import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import type { Order, Product, User, Message, Conversation } from '@prisma/client';

export interface CustomerProfile {
  customerId: string;
  basicInfo: CustomerBasicInfo;
  contactInfo: CustomerContactInfo;
  preferences: CustomerPreferences;
  behavior: CustomerBehavior;
  relationship: CustomerRelationship;
  engagement: CustomerEngagement;
  lifecycle: CustomerLifecycle;
  segments: CustomerSegments;
  insights: CustomerInsights;
  actions: CustomerActions;
}

export interface CustomerBasicInfo {
  name: string;
  language: string;
  region: string;
  timezone: string;
  joinDate: Date;
  lastSeen: Date;
  status: 'active' | 'inactive' | 'churned' | 'prospect';
}

export interface CustomerContactInfo {
  telegramUsername?: string;
  phoneNumber?: string;
  email?: string;
  preferredContactMethod: 'telegram' | 'phone' | 'email';
  contactHistory: ContactHistory[];
}

export interface ContactHistory {
  method: 'telegram' | 'phone' | 'email';
  timestamp: Date;
  type: 'inbound' | 'outbound';
  success: boolean;
  notes?: string;
}

export interface CustomerPreferences {
  language: 'uz' | 'ru' | 'en';
  communicationStyle: 'formal' | 'casual' | 'friendly';
  responseSpeed: 'immediate' | 'fast' | 'normal' | 'slow';
  productInterests: string[];
  priceSensitivity: 'low' | 'medium' | 'high';
  preferredCategories: string[];
  culturalPreferences: CulturalPreferences;
  businessEtiquette: string[];
}

export interface CulturalPreferences {
  formality: 'formal' | 'casual' | 'respectful';
  greetingStyle: 'traditional' | 'modern' | 'business';
  communicationTone: 'professional' | 'friendly' | 'authoritative';
  decisionStyle: 'individual' | 'consultative' | 'consensus';
}

export interface CustomerBehavior {
  purchaseHistory: PurchaseHistory[];
  browsingPatterns: BrowsingPattern[];
  interactionHistory: InteractionHistory[];
  decisionPatterns: DecisionPattern[];
  responsePatterns: ResponsePattern[];
  engagementLevel: 'high' | 'medium' | 'low';
  activityScore: number;
}

export interface PurchaseHistory {
  orderId: string;
  date: Date;
  amount: number;
  items: string[];
  category: string;
  satisfaction: number;
  feedback?: string;
}

export interface BrowsingPattern {
  category: string;
  frequency: number;
  lastViewed: Date;
  timeSpent: number;
  productsViewed: string[];
}

export interface InteractionHistory {
  conversationId: string;
  date: Date;
  duration: number;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  outcome: 'sale' | 'inquiry' | 'support' | 'general';
  satisfaction: number;
}

export interface DecisionPattern {
  type: 'impulsive' | 'analytical' | 'comparative' | 'deliberative';
  averageDecisionTime: number;
  factors: string[];
  objections: string[];
  closingTriggers: string[];
}

export interface ResponsePattern {
  responseTime: number;
  responseQuality: 'excellent' | 'good' | 'fair' | 'poor';
  preferredTimes: string[];
  preferredChannels: string[];
  engagementTriggers: string[];
}

export interface CustomerRelationship {
  relationshipScore: number;
  trustLevel: 'high' | 'medium' | 'low';
  loyaltyStatus: 'vip' | 'loyal' | 'regular' | 'new' | 'at_risk';
  relationshipStage: 'prospect' | 'lead' | 'customer' | 'loyal' | 'advocate';
  relationshipDuration: number;
  touchpoints: RelationshipTouchpoint[];
  milestones: RelationshipMilestone[];
}

export interface RelationshipTouchpoint {
  date: Date;
  type: 'conversation' | 'purchase' | 'support' | 'follow_up' | 'outreach';
  channel: string;
  outcome: string;
  impact: 'positive' | 'neutral' | 'negative';
  notes?: string;
}

export interface RelationshipMilestone {
  date: Date;
  type: 'first_purchase' | 'repeat_purchase' | 'high_value' | 'referral' | 'feedback';
  description: string;
  value: number;
}

export interface CustomerEngagement {
  engagementScore: number;
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
  engagementFrequency: number;
  engagementQuality: 'high' | 'medium' | 'low';
  preferredEngagementTimes: string[];
  engagementChannels: EngagementChannel[];
  engagementHistory: EngagementEvent[];
}

export interface EngagementChannel {
  channel: 'telegram' | 'phone' | 'email' | 'in_person';
  preference: number;
  effectiveness: number;
  lastUsed: Date;
}

export interface EngagementEvent {
  date: Date;
  type: 'message' | 'purchase' | 'inquiry' | 'feedback' | 'referral';
  channel: string;
  duration: number;
  satisfaction: number;
  outcome: string;
}

export interface CustomerLifecycle {
  stage: 'awareness' | 'consideration' | 'purchase' | 'retention' | 'advocacy';
  stageDuration: number;
  stageProgress: number;
  nextStage: string;
  stageHistory: LifecycleStage[];
  transitionTriggers: string[];
}

export interface LifecycleStage {
  stage: string;
  enteredDate: Date;
  duration: number;
  activities: string[];
  outcomes: string[];
}

export interface CustomerSegments {
  primarySegment: string;
  segments: CustomerSegment[];
  segmentHistory: SegmentChange[];
  segmentInsights: SegmentInsight[];
}

export interface CustomerSegment {
  name: string;
  type: 'demographic' | 'behavioral' | 'value' | 'engagement' | 'custom';
  assignedDate: Date;
  confidence: number;
  characteristics: string[];
  value: number;
}

export interface SegmentChange {
  date: Date;
  fromSegment: string;
  toSegment: string;
  reason: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export interface SegmentInsight {
  segment: string;
  insights: string[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
}

export interface CustomerInsights {
  behavioralInsights: string[];
  preferenceInsights: string[];
  relationshipInsights: string[];
  opportunityInsights: string[];
  riskInsights: string[];
  trendInsights: string[];
  predictiveInsights: PredictiveInsight[];
}

export interface PredictiveInsight {
  type: 'churn_risk' | 'upsell_opportunity' | 'cross_sell_opportunity' | 'engagement_drop' | 'satisfaction_decline';
  probability: number;
  timeframe: string;
  factors: string[];
  recommendations: string[];
  confidence: number;
}

export interface CustomerActions {
  pendingActions: PendingAction[];
  completedActions: CompletedAction[];
  recommendedActions: RecommendedAction[];
  actionHistory: ActionHistory[];
}

export interface PendingAction {
  id: string;
  type: 'follow_up' | 'outreach' | 'support' | 'upsell' | 'retention' | 'custom';
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface CompletedAction {
  id: string;
  type: string;
  completedDate: Date;
  outcome: string;
  satisfaction: number;
  notes?: string;
}

export interface RecommendedAction {
  type: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  description: string;
  reasoning: string[];
}

export interface ActionHistory {
  date: Date;
  action: string;
  outcome: string;
  impact: 'positive' | 'neutral' | 'negative';
  notes?: string;
}

export interface CRMInsights {
  customerCount: number;
  activeCustomers: number;
  churnRate: number;
  averageRelationshipScore: number;
  topCustomers: CustomerProfile[];
  atRiskCustomers: CustomerProfile[];
  opportunities: CRMOpportunity[];
  trends: CRMTrend[];
  recommendations: CRMRecommendation[];
}

export interface CRMOpportunity {
  type: 'upsell' | 'cross_sell' | 'retention' | 'acquisition' | 'reactivation';
  customerId: string;
  description: string;
  potentialValue: number;
  probability: number;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  strategy: string[];
}

export interface CRMTrend {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  period: string;
  impact: 'positive' | 'negative' | 'neutral';
  factors: string[];
}

export interface CRMRecommendation {
  category: 'relationship' | 'engagement' | 'retention' | 'growth' | 'optimization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timeframe: string;
  actionItems: string[];
}

@Injectable()
export class CRMService {
  private readonly logger = new Logger(CRMService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getCustomerProfile(customerId: string, userId: string): Promise<CustomerProfile> {
    const cacheKey = `customer_profile:${userId}:${customerId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Get customer data
    const orders = await this.prisma.order.findMany({
      where: { userId, customerId },
      orderBy: { createdAt: 'desc' },
    });

    const conversations = await this.prisma.conversation.findMany({
      where: { userId, customerId },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
    });

    // Build customer profile
    const profile: CustomerProfile = {
      customerId,
      basicInfo: await this.buildBasicInfo(customerId, orders, conversations),
      contactInfo: await this.buildContactInfo(customerId, conversations),
      preferences: await this.buildPreferences(customerId, orders, conversations),
      behavior: await this.buildBehavior(orders, conversations),
      relationship: await this.buildRelationship(customerId, orders, conversations),
      engagement: await this.buildEngagement(conversations),
      lifecycle: await this.buildLifecycle(orders, conversations),
      segments: await this.buildSegments(customerId, orders, conversations),
      insights: await this.buildInsights(customerId, orders, conversations),
      actions: await this.buildActions(customerId, orders, conversations),
    };

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, JSON.stringify(profile), 3600);
    
    return profile;
  }

  async getAllCustomers(userId: string): Promise<CustomerProfile[]> {
    const cacheKey = `all_customers:${userId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Get all unique customers
    const orders = await this.prisma.order.findMany({
      where: { userId },
      select: { customerId: true },
      distinct: ['customerId'],
    });

    const customerIds = orders.map(order => order.customerId);
    const profiles = await Promise.all(
      customerIds.map(customerId => this.getCustomerProfile(customerId, userId))
    );

    // Cache for 30 minutes
    await this.cacheService.set(cacheKey, JSON.stringify(profiles), 1800);
    
    return profiles;
  }

  async getCRMInsights(userId: string): Promise<CRMInsights> {
    const cacheKey = `crm_insights:${userId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const customers = await this.getAllCustomers(userId);
    
    const insights: CRMInsights = {
      customerCount: customers.length,
      activeCustomers: customers.filter(c => c.basicInfo.status === 'active').length,
      churnRate: this.calculateChurnRate(customers),
      averageRelationshipScore: this.calculateAverageRelationshipScore(customers),
      topCustomers: this.getTopCustomers(customers),
      atRiskCustomers: this.getAtRiskCustomers(customers),
      opportunities: this.identifyOpportunities(customers),
      trends: this.analyzeTrends(customers),
      recommendations: this.generateRecommendations(customers),
    };

    // Cache for 2 hours
    await this.cacheService.set(cacheKey, JSON.stringify(insights), 7200);
    
    return insights;
  }

  async updateCustomerProfile(customerId: string, userId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    // Invalidate cache
    await this.cacheService.delete(`customer_profile:${userId}:${customerId}`);
    await this.cacheService.delete(`all_customers:${userId}`);
    await this.cacheService.delete(`crm_insights:${userId}`);
    
    return await this.getCustomerProfile(customerId, userId);
  }

  async addCustomerAction(customerId: string, userId: string, action: Omit<PendingAction, 'id'>): Promise<void> {
    // Invalidate cache
    await this.cacheService.delete(`customer_profile:${userId}:${customerId}`);
    await this.cacheService.delete(`all_customers:${userId}`);
    await this.cacheService.delete(`crm_insights:${userId}`);
  }

  async completeCustomerAction(customerId: string, userId: string, actionId: string, outcome: string): Promise<void> {
    // Invalidate cache
    await this.cacheService.delete(`customer_profile:${userId}:${customerId}`);
    await this.cacheService.delete(`all_customers:${userId}`);
    await this.cacheService.delete(`crm_insights:${userId}`);
  }

  // Helper methods
  private async buildBasicInfo(customerId: string, orders: Order[], conversations: Conversation[]): Promise<CustomerBasicInfo> {
    const firstOrder = orders[orders.length - 1];
    const lastConversation = conversations[0];
    const lastOrder = orders[0];

    return {
      name: `Customer ${customerId}`,
      language: 'uz',
      region: 'Uzbekistan',
      timezone: 'Asia/Tashkent',
      joinDate: firstOrder?.createdAt || new Date(),
      lastSeen: lastConversation?.updatedAt || lastOrder?.createdAt || new Date(),
      status: this.determineCustomerStatus(orders, conversations),
    };
  }

  private async buildContactInfo(customerId: string, conversations: Conversation[]): Promise<CustomerContactInfo> {
    const contactHistory: ContactHistory[] = conversations.map(conv => ({
      method: 'telegram',
      timestamp: conv.createdAt,
      type: 'inbound',
      success: true,
      notes: `Conversation ${conv.id}`,
    }));

    return {
      telegramUsername: `@customer_${customerId}`,
      preferredContactMethod: 'telegram',
      contactHistory,
    };
  }

  private async buildPreferences(customerId: string, orders: Order[], conversations: Conversation[]): Promise<CustomerPreferences> {
    const productInterests = this.extractProductInterests(orders);
    const priceSensitivity = this.analyzePriceSensitivity(orders);

    return {
      language: 'uz',
      communicationStyle: 'friendly',
      responseSpeed: 'normal',
      productInterests,
      priceSensitivity,
      preferredCategories: this.extractPreferredCategories(orders),
      culturalPreferences: this.buildCulturalPreferences(),
      businessEtiquette: ['Respectful greetings', 'Professional communication'],
    };
  }

  private async buildBehavior(orders: Order[], conversations: Conversation[]): Promise<CustomerBehavior> {
    const purchaseHistory: PurchaseHistory[] = orders.map(order => ({
      orderId: order.id,
      date: order.createdAt,
      amount: (order.details as any)?.total || 0,
      items: (order.details as any)?.items || [],
      category: this.categorizeOrder(order),
      satisfaction: Math.floor(Math.random() * 3) + 8,
    }));

    return {
      purchaseHistory,
      browsingPatterns: [],
      interactionHistory: this.buildInteractionHistory(conversations),
      decisionPatterns: [{
        type: 'analytical',
        averageDecisionTime: 24 * 60 * 60 * 1000,
        factors: ['price', 'quality', 'delivery'],
        objections: ['price too high'],
        closingTriggers: ['limited time offer'],
      }],
      responsePatterns: [{
        responseTime: 300000,
        responseQuality: 'good',
        preferredTimes: ['09:00', '14:00', '18:00'],
        preferredChannels: ['telegram'],
        engagementTriggers: ['personalized offers'],
      }],
      engagementLevel: this.calculateEngagementLevel(conversations),
      activityScore: this.calculateActivityScore(orders, conversations),
    };
  }

  private async buildRelationship(customerId: string, orders: Order[], conversations: Conversation[]): Promise<CustomerRelationship> {
    const relationshipScore = this.calculateRelationshipScore(orders, conversations);
    const trustLevel = this.determineTrustLevel(relationshipScore);
    const loyaltyStatus = this.determineLoyaltyStatus(orders, relationshipScore);

    return {
      relationshipScore,
      trustLevel,
      loyaltyStatus,
      relationshipStage: this.determineRelationshipStage(orders, conversations),
      relationshipDuration: this.calculateRelationshipDuration(orders),
      touchpoints: this.buildRelationshipTouchpoints(orders, conversations),
      milestones: this.identifyRelationshipMilestones(orders),
    };
  }

  private async buildEngagement(conversations: Conversation[]): Promise<CustomerEngagement> {
    const engagementScore = this.calculateEngagementScore(conversations);
    const engagementTrend = this.determineEngagementTrend(conversations);

    return {
      engagementScore,
      engagementTrend,
      engagementFrequency: this.calculateEngagementFrequency(conversations),
      engagementQuality: this.determineEngagementQuality(conversations),
      preferredEngagementTimes: ['09:00', '14:00', '18:00'],
      engagementChannels: [{
        channel: 'telegram',
        preference: 1.0,
        effectiveness: 0.9,
        lastUsed: conversations[0]?.createdAt || new Date(),
      }],
      engagementHistory: this.buildEngagementHistory(conversations),
    };
  }

  private async buildLifecycle(orders: Order[], conversations: Conversation[]): Promise<CustomerLifecycle> {
    const stage = this.determineLifecycleStage(orders, conversations);
    const stageDuration = this.calculateStageDuration(orders, conversations);
    const stageProgress = this.calculateStageProgress(orders, conversations);

    return {
      stage,
      stageDuration,
      stageProgress,
      nextStage: this.predictNextStage(stage, orders, conversations),
      stageHistory: [{
        stage,
        enteredDate: orders[0]?.createdAt || new Date(),
        duration: stageDuration,
        activities: ['purchases', 'conversations'],
        outcomes: ['engagement', 'sales'],
      }],
      transitionTriggers: ['purchase made', 'repeat engagement'],
    };
  }

  private async buildSegments(customerId: string, orders: Order[], conversations: Conversation[]): Promise<CustomerSegments> {
    const segments = this.assignCustomerSegments(orders, conversations);
    const primarySegment = segments[0]?.name || 'general';

    return {
      primarySegment,
      segments,
      segmentHistory: [],
      segmentInsights: this.generateSegmentInsights(segments),
    };
  }

  private async buildInsights(customerId: string, orders: Order[], conversations: Conversation[]): Promise<CustomerInsights> {
    return {
      behavioralInsights: this.generateBehavioralInsights(orders, conversations),
      preferenceInsights: ['Prefers quick responses', 'Values personalized service'],
      relationshipInsights: ['Building trust through consistent service'],
      opportunityInsights: ['Upsell potential for premium products'],
      riskInsights: ['Low engagement recently'],
      trendInsights: ['Increasing order frequency'],
      predictiveInsights: [{
        type: 'upsell_opportunity',
        probability: 0.7,
        timeframe: '30 days',
        factors: ['High engagement', 'Previous purchases'],
        recommendations: ['Offer premium products'],
        confidence: 0.8,
      }],
    };
  }

  private async buildActions(customerId: string, orders: Order[], conversations: Conversation[]): Promise<CustomerActions> {
    return {
      pendingActions: [{
        id: `action_${customerId}_1`,
        type: 'follow_up',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Follow up on recent purchase',
        status: 'pending',
      }],
      completedActions: [],
      recommendedActions: [{
        type: 'personalized_offer',
        priority: 'high',
        expectedImpact: 0.8,
        effort: 'low',
        timeframe: '7 days',
        description: 'Send personalized product recommendations',
        reasoning: ['Customer shows interest in premium products'],
      }],
      actionHistory: [],
    };
  }

  // Additional helper methods
  private determineCustomerStatus(orders: Order[], conversations: Conversation[]): 'active' | 'inactive' | 'churned' | 'prospect' {
    const lastActivity = Math.max(
      orders[0]?.createdAt.getTime() || 0,
      conversations[0]?.updatedAt.getTime() || 0,
    );
    
    const daysSinceActivity = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActivity < 30) return 'active';
    if (daysSinceActivity < 90) return 'inactive';
    return 'churned';
  }

  private extractProductInterests(orders: Order[]): string[] {
    const interests = new Set<string>();
    orders.forEach(order => {
      const items = (order.details as any)?.items || [];
      items.forEach((item: string) => {
        if (item.includes('clothing')) interests.add('clothing');
        if (item.includes('food')) interests.add('food');
        if (item.includes('electronics')) interests.add('electronics');
      });
    });
    return Array.from(interests);
  }

  private analyzePriceSensitivity(orders: Order[]): 'low' | 'medium' | 'high' {
    if (orders.length === 0) return 'medium';
    
    const averageOrderValue = orders.reduce((sum, order) => sum + (order.details as any)?.total || 0, 0) / orders.length;
    
    if (averageOrderValue > 100) return 'low';
    if (averageOrderValue > 50) return 'medium';
    return 'high';
  }

  private extractPreferredCategories(orders: Order[]): string[] {
    const categories = new Map<string, number>();
    orders.forEach(order => {
      const category = this.categorizeOrder(order);
      categories.set(category, (categories.get(category) || 0) + 1);
    });
    
    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  private buildCulturalPreferences(): CulturalPreferences {
    return {
      formality: 'respectful',
      greetingStyle: 'traditional',
      communicationTone: 'friendly',
      decisionStyle: 'individual',
    };
  }

  private categorizeOrder(order: Order): string {
    const items = (order.details as any)?.items || '';
    if (items.includes('clothing')) return 'clothing';
    if (items.includes('food')) return 'food';
    if (items.includes('electronics')) return 'electronics';
    return 'general';
  }

  private buildInteractionHistory(conversations: Conversation[]): InteractionHistory[] {
    return conversations.map(conv => ({
      conversationId: conv.id,
      date: conv.createdAt,
      duration: conv.messages.length * 2,
      topics: this.extractTopics(conv.messages),
      sentiment: 'positive',
      outcome: 'general',
      satisfaction: Math.floor(Math.random() * 3) + 8,
    }));
  }

  private extractTopics(messages: Message[]): string[] {
    const topics = new Set<string>();
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      if (content.includes('order')) topics.add('ordering');
      if (content.includes('product')) topics.add('products');
      if (content.includes('price')) topics.add('pricing');
      if (content.includes('delivery')) topics.add('delivery');
    });
    return Array.from(topics);
  }

  private calculateEngagementLevel(conversations: Conversation[]): 'high' | 'medium' | 'low' {
    if (conversations.length > 10) return 'high';
    if (conversations.length > 5) return 'medium';
    return 'low';
  }

  private calculateActivityScore(orders: Order[], conversations: Conversation[]): number {
    let score = orders.length * 10;
    score += conversations.length * 5;
    return Math.min(score, 100);
  }

  private calculateRelationshipScore(orders: Order[], conversations: Conversation[]): number {
    let score = orders.length * 10;
    score += conversations.length * 5;
    const totalSpent = orders.reduce((sum, order) => sum + (order.details as any)?.total || 0, 0);
    score += Math.min(totalSpent / 10, 50);
    return Math.min(score, 100);
  }

  private determineTrustLevel(relationshipScore: number): 'high' | 'medium' | 'low' {
    if (relationshipScore > 70) return 'high';
    if (relationshipScore > 40) return 'medium';
    return 'low';
  }

  private determineLoyaltyStatus(orders: Order[], relationshipScore: number): 'vip' | 'loyal' | 'regular' | 'new' | 'at_risk' {
    if (orders.length > 5 && relationshipScore > 80) return 'vip';
    if (orders.length > 2 && relationshipScore > 60) return 'loyal';
    if (orders.length > 0) return 'regular';
    return 'new';
  }

  private determineRelationshipStage(orders: Order[], conversations: Conversation[]): 'prospect' | 'lead' | 'customer' | 'loyal' | 'advocate' {
    if (orders.length === 0) return 'prospect';
    if (orders.length === 1) return 'lead';
    if (orders.length < 3) return 'customer';
    if (orders.length < 5) return 'loyal';
    return 'advocate';
  }

  private calculateRelationshipDuration(orders: Order[]): number {
    if (orders.length === 0) return 0;
    const firstOrder = orders[orders.length - 1];
    const lastOrder = orders[0];
    return (lastOrder.createdAt.getTime() - firstOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  }

  private buildRelationshipTouchpoints(orders: Order[], conversations: Conversation[]): RelationshipTouchpoint[] {
    const touchpoints: RelationshipTouchpoint[] = [];
    
    orders.forEach(order => {
      touchpoints.push({
        date: order.createdAt,
        type: 'purchase',
        channel: 'telegram',
        outcome: 'successful purchase',
        impact: 'positive',
        notes: `Order ${order.id}`,
      });
    });
    
    conversations.forEach(conv => {
      touchpoints.push({
        date: conv.createdAt,
        type: 'conversation',
        channel: 'telegram',
        outcome: 'engagement',
        impact: 'positive',
        notes: `Conversation ${conv.id}`,
      });
    });
    
    return touchpoints.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private identifyRelationshipMilestones(orders: Order[]): RelationshipMilestone[] {
    const milestones: RelationshipMilestone[] = [];
    
    if (orders.length > 0) {
      milestones.push({
        date: orders[0].createdAt,
        type: 'first_purchase',
        description: 'First purchase made',
        value: (orders[0].details as any)?.total || 0,
      });
    }
    
    if (orders.length > 1) {
      milestones.push({
        date: orders[1].createdAt,
        type: 'repeat_purchase',
        description: 'Repeat purchase made',
        value: (orders[1].details as any)?.total || 0,
      });
    }
    
    return milestones;
  }

  private calculateEngagementScore(conversations: Conversation[]): number {
    let score = conversations.length * 10;
    conversations.forEach(conv => {
      score += conv.messages.length * 2;
    });
    return Math.min(score, 100);
  }

  private determineEngagementTrend(conversations: Conversation[]): 'increasing' | 'stable' | 'decreasing' {
    if (conversations.length < 2) return 'stable';
    return 'stable';
  }

  private calculateEngagementFrequency(conversations: Conversation[]): number {
    if (conversations.length === 0) return 0;
    return conversations.length;
  }

  private determineEngagementQuality(conversations: Conversation[]): 'high' | 'medium' | 'low' {
    const averageMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0) / conversations.length;
    
    if (averageMessages > 10) return 'high';
    if (averageMessages > 5) return 'medium';
    return 'low';
  }

  private buildEngagementHistory(conversations: Conversation[]): EngagementEvent[] {
    return conversations.map(conv => ({
      date: conv.createdAt,
      type: 'conversation',
      channel: 'telegram',
      duration: conv.messages.length * 2,
      satisfaction: Math.floor(Math.random() * 3) + 8,
      outcome: 'engagement',
    }));
  }

  private determineLifecycleStage(orders: Order[], conversations: Conversation[]): 'awareness' | 'consideration' | 'purchase' | 'retention' | 'advocacy' {
    if (orders.length === 0) return 'awareness';
    if (orders.length === 1) return 'purchase';
    if (orders.length < 3) return 'retention';
    return 'advocacy';
  }

  private calculateStageDuration(orders: Order[], conversations: Conversation[]): number {
    if (orders.length === 0) return 0;
    
    const firstOrder = orders[orders.length - 1];
    const lastOrder = orders[0];
    return (lastOrder.createdAt.getTime() - firstOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  }

  private calculateStageProgress(orders: Order[], conversations: Conversation[]): number {
    const stage = this.determineLifecycleStage(orders, conversations);
    
    switch (stage) {
      case 'awareness': return 25;
      case 'consideration': return 50;
      case 'purchase': return 75;
      case 'retention': return 90;
      case 'advocacy': return 100;
    }
  }

  private predictNextStage(currentStage: string, orders: Order[], conversations: Conversation[]): string {
    switch (currentStage) {
      case 'awareness': return 'consideration';
      case 'consideration': return 'purchase';
      case 'purchase': return 'retention';
      case 'retention': return 'advocacy';
      case 'advocacy': return 'advocacy';
    }
  }

  private assignCustomerSegments(orders: Order[], conversations: Conversation[]): CustomerSegment[] {
    const segments: CustomerSegment[] = [];
    
    const totalSpent = orders.reduce((sum, order) => sum + (order.details as any)?.total || 0, 0);
    if (totalSpent > 500) {
      segments.push({
        name: 'high_value',
        type: 'value',
        assignedDate: new Date(),
        confidence: 0.9,
        characteristics: ['High spending', 'Premium products'],
        value: totalSpent,
      });
    }
    
    if (orders.length > 3) {
      segments.push({
        name: 'frequent_buyer',
        type: 'behavioral',
        assignedDate: new Date(),
        confidence: 0.8,
        characteristics: ['Frequent purchases', 'Loyal customer'],
        value: orders.length,
      });
    }
    
    return segments;
  }

  private generateSegmentInsights(segments: CustomerSegment[]): SegmentInsight[] {
    return segments.map(segment => ({
      segment: segment.name,
      insights: [`Customer shows ${segment.characteristics.join(', ')}`],
      opportunities: ['Upsell opportunities', 'Cross-sell potential'],
      risks: ['Churn risk if not engaged'],
      recommendations: ['Personalized offers', 'Regular follow-ups'],
    }));
  }

  private generateBehavioralInsights(orders: Order[], conversations: Conversation[]): string[] {
    const insights: string[] = [];
    
    if (orders.length > 0) {
      insights.push(`Made ${orders.length} purchases`);
      insights.push(`Total spent: $${orders.reduce((sum, order) => sum + (order.details as any)?.total || 0, 0)}`);
    }
    
    if (conversations.length > 0) {
      insights.push(`Engaged in ${conversations.length} conversations`);
    }
    
    return insights;
  }

  private calculateChurnRate(customers: CustomerProfile[]): number {
    const churnedCustomers = customers.filter(c => c.basicInfo.status === 'churned').length;
    return customers.length > 0 ? (churnedCustomers / customers.length) * 100 : 0;
  }

  private calculateAverageRelationshipScore(customers: CustomerProfile[]): number {
    if (customers.length === 0) return 0;
    const totalScore = customers.reduce((sum, customer) => sum + customer.relationship.relationshipScore, 0);
    return totalScore / customers.length;
  }

  private getTopCustomers(customers: CustomerProfile[]): CustomerProfile[] {
    return customers
      .sort((a, b) => b.relationship.relationshipScore - a.relationship.relationshipScore)
      .slice(0, 10);
  }

  private getAtRiskCustomers(customers: CustomerProfile[]): CustomerProfile[] {
    return customers.filter(c => c.basicInfo.status === 'at_risk' || c.relationship.loyaltyStatus === 'at_risk');
  }

  private identifyOpportunities(customers: CustomerProfile[]): CRMOpportunity[] {
    return customers
      .filter(c => c.relationship.relationshipScore > 70)
      .map(customer => ({
        type: 'upsell',
        customerId: customer.customerId,
        description: `Upsell opportunity for ${customer.customerId}`,
        potentialValue: 100,
        probability: 0.7,
        effort: 'medium',
        timeframe: '30 days',
        strategy: ['Personalized offers', 'Premium product recommendations'],
      }));
  }

  private analyzeTrends(customers: CustomerProfile[]): CRMTrend[] {
    return [{
      metric: 'Average Relationship Score',
      trend: 'up',
      percentageChange: 5.2,
      period: '30 days',
      impact: 'positive',
      factors: ['Improved engagement', 'Better customer service'],
    }];
  }

  private generateRecommendations(customers: CustomerProfile[]): CRMRecommendation[] {
    return [{
      category: 'retention',
      title: 'Improve Customer Retention',
      description: 'Focus on at-risk customers to reduce churn',
      priority: 'high',
      expectedImpact: 0.8,
      implementationEffort: 'medium',
      timeframe: '60 days',
      actionItems: ['Identify at-risk customers', 'Implement retention campaigns', 'Monitor results'],
    }];
  }
}

import { apiClient } from '../api';

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

class CRMService {
  async getAllCustomers(): Promise<CustomerProfile[]> {
    const response = await apiClient.get('/crm/customers');
    return response.data;
  }

  async getCustomerProfile(customerId: string): Promise<CustomerProfile> {
    const response = await apiClient.get(`/crm/customers/${customerId}`);
    return response.data;
  }

  async getCRMInsights(): Promise<CRMInsights> {
    const response = await apiClient.get('/crm/insights');
    return response.data;
  }

  async updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const response = await apiClient.put(`/crm/customers/${customerId}`, updates);
    return response.data;
  }

  async addCustomerAction(customerId: string, action: Omit<PendingAction, 'id'>): Promise<void> {
    await apiClient.post(`/crm/customers/${customerId}/actions`, action);
  }

  async completeCustomerAction(customerId: string, actionId: string, outcome: string): Promise<void> {
    await apiClient.put(`/crm/customers/${customerId}/actions/${actionId}/complete`, { outcome });
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

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'churned':
        return 'text-red-600 bg-red-100';
      case 'prospect':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getLoyaltyColor(loyalty: string): string {
    switch (loyalty) {
      case 'vip':
        return 'text-purple-600 bg-purple-100';
      case 'loyal':
        return 'text-blue-600 bg-blue-100';
      case 'regular':
        return 'text-green-600 bg-green-100';
      case 'new':
        return 'text-yellow-600 bg-yellow-100';
      case 'at_risk':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getEngagementColor(level: string): string {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  getLifecycleColor(stage: string): string {
    switch (stage) {
      case 'awareness':
        return 'text-blue-600 bg-blue-100';
      case 'consideration':
        return 'text-yellow-600 bg-yellow-100';
      case 'purchase':
        return 'text-green-600 bg-green-100';
      case 'retention':
        return 'text-purple-600 bg-purple-100';
      case 'advocacy':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'neutral':
        return 'text-gray-600 bg-gray-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getImpactColor(impact: string): string {
    switch (impact) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'neutral':
        return 'text-gray-600 bg-gray-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

export const crmService = new CRMService();

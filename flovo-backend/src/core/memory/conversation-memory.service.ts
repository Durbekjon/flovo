import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import type { Message, Conversation, User } from '@prisma/client';

export interface ConversationMemory {
  conversationId: string;
  customerId: string;
  shortTermMemory: ShortTermMemory;
  longTermMemory: LongTermMemory;
  episodicMemory: EpisodicMemory[];
  semanticMemory: SemanticMemory;
  workingMemory: WorkingMemory;
  lastUpdated: Date;
  memoryScore: number;
}

export interface ShortTermMemory {
  recentMessages: MessageSummary[];
  currentContext: string;
  activeTopics: string[];
  pendingActions: PendingAction[];
  emotionalState: EmotionalState;
  conversationFlow: ConversationFlow[];
}

export interface LongTermMemory {
  customerPreferences: CustomerPreferences;
  relationshipHistory: RelationshipEvent[];
  purchasePatterns: PurchasePattern[];
  communicationStyle: CommunicationProfile;
  trustLevel: number;
  satisfactionHistory: SatisfactionEvent[];
  learningInsights: LearningInsight[];
}

export interface EpisodicMemory {
  id: string;
  timestamp: Date;
  eventType: 'conversation' | 'purchase' | 'complaint' | 'inquiry' | 'feedback';
  description: string;
  emotionalImpact: number;
  outcome: 'positive' | 'neutral' | 'negative';
  keyInsights: string[];
  relatedTopics: string[];
}

export interface SemanticMemory {
  customerKnowledge: CustomerKnowledge;
  productKnowledge: ProductKnowledge;
  businessKnowledge: BusinessKnowledge;
  culturalKnowledge: CulturalKnowledge;
  languagePatterns: LanguagePattern[];
}

export interface WorkingMemory {
  currentTask: string;
  activeGoals: string[];
  constraints: string[];
  availableResources: string[];
  decisionPoints: DecisionPoint[];
  nextActions: string[];
}

export interface MessageSummary {
  id: string;
  timestamp: Date;
  sender: 'USER' | 'BOT';
  content: string;
  intent: string;
  confidence: number;
  emotionalTone: string;
  keyTopics: string[];
  sentiment: number;
}

export interface PendingAction {
  id: string;
  type: 'follow_up' | 'reminder' | 'escalation' | 'research' | 'callback';
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
}

export interface EmotionalState {
  primary: 'happy' | 'satisfied' | 'neutral' | 'frustrated' | 'angry' | 'excited';
  intensity: number; // 0-10
  confidence: number; // 0-1
  triggers: string[];
  duration: number; // minutes
  trend: 'improving' | 'stable' | 'declining';
}

export interface ConversationFlow {
  timestamp: Date;
  state: string;
  intent: string;
  confidence: number;
  actions: string[];
  outcomes: string[];
}

export interface CustomerPreferences {
  communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional';
  preferredLanguage: string;
  responseSpeed: 'immediate' | 'normal' | 'detailed';
  productInterests: string[];
  priceSensitivity: 'high' | 'medium' | 'low';
  decisionStyle: 'impulsive' | 'analytical' | 'cautious' | 'social';
  preferredContactTime: string[];
  specialRequirements: string[];
}

export interface RelationshipEvent {
  timestamp: Date;
  eventType: 'first_contact' | 'purchase' | 'complaint' | 'feedback' | 'referral' | 'loyalty';
  description: string;
  impact: number; // -10 to 10
  context: string;
  outcome: string;
}

export interface PurchasePattern {
  category: string;
  frequency: number;
  averageValue: number;
  preferredTime: string;
  seasonalTrends: string[];
  lastPurchase: Date;
  nextPredictedPurchase: Date;
}

export interface CommunicationProfile {
  preferredChannel: 'telegram' | 'phone' | 'email' | 'in_person';
  responseTime: number; // average minutes
  messageLength: 'short' | 'medium' | 'long';
  formalityLevel: 'formal' | 'casual' | 'mixed';
  languagePreference: string;
  culturalSensitivity: 'high' | 'medium' | 'low';
}

export interface SatisfactionEvent {
  timestamp: Date;
  score: number; // 1-10
  factors: string[];
  feedback: string;
  resolution: string;
  followUpRequired: boolean;
}

export interface LearningInsight {
  timestamp: Date;
  insightType: 'preference' | 'behavior' | 'communication' | 'product' | 'cultural';
  description: string;
  confidence: number;
  source: string;
  actionable: boolean;
  applied: boolean;
}

export interface CustomerKnowledge {
  demographics: Demographics;
  psychographics: Psychographics;
  behavioralPatterns: BehavioralPattern[];
  preferences: Preference[];
  constraints: Constraint[];
}

export interface ProductKnowledge {
  interests: ProductInterest[];
  aversions: ProductAversion[];
  usagePatterns: UsagePattern[];
  satisfaction: ProductSatisfaction[];
}

export interface BusinessKnowledge {
  industry: string;
  role: string;
  companySize: string;
  decisionMakingPower: 'high' | 'medium' | 'low';
  budget: 'high' | 'medium' | 'low';
  urgency: 'high' | 'medium' | 'low';
}

export interface CulturalKnowledge {
  culturalBackground: string;
  communicationNorms: string[];
  businessEtiquette: string[];
  taboos: string[];
  preferences: string[];
}

export interface LanguagePattern {
  language: string;
  proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
  preferredTopics: string[];
  communicationStyle: string;
  culturalExpressions: string[];
}

export interface Demographics {
  age?: number;
  gender?: string;
  location?: string;
  occupation?: string;
  education?: string;
  income?: string;
}

export interface Psychographics {
  personality: string;
  values: string[];
  lifestyle: string;
  interests: string[];
  attitudes: string[];
}

export interface BehavioralPattern {
  pattern: string;
  frequency: number;
  triggers: string[];
  outcomes: string[];
  confidence: number;
}

export interface Preference {
  category: string;
  item: string;
  strength: number; // 0-10
  context: string;
  lastExpressed: Date;
}

export interface Constraint {
  type: 'budget' | 'time' | 'technical' | 'cultural' | 'logistical';
  description: string;
  impact: 'high' | 'medium' | 'low';
  solutions: string[];
}

export interface ProductInterest {
  category: string;
  specificProducts: string[];
  reasons: string[];
  intensity: number; // 0-10
  lastExpressed: Date;
}

export interface ProductAversion {
  category: string;
  specificProducts: string[];
  reasons: string[];
  intensity: number; // 0-10
  alternatives: string[];
}

export interface UsagePattern {
  product: string;
  frequency: string;
  context: string;
  satisfaction: number;
  improvements: string[];
}

export interface ProductSatisfaction {
  product: string;
  score: number; // 1-10
  factors: string[];
  feedback: string;
  date: Date;
}

export interface DecisionPoint {
  timestamp: Date;
  decision: string;
  options: string[];
  chosen: string;
  reasoning: string;
  outcome: string;
}

@Injectable()
export class ConversationMemoryService {
  private readonly logger = new Logger(ConversationMemoryService.name);
  private readonly memoryCache = new Map<string, ConversationMemory>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getOrCreateMemory(conversationId: string, customerId: string): Promise<ConversationMemory> {
    const cacheKey = `memory:${conversationId}:${customerId}`;
    
    // Check cache first
    const cachedMemory = this.memoryCache.get(cacheKey);
    if (cachedMemory) {
      return cachedMemory;
    }

    // Load from database or create new
    const memory = await this.loadMemoryFromDatabase(conversationId, customerId) || 
                   this.createNewMemory(conversationId, customerId);

    this.memoryCache.set(cacheKey, memory);
    return memory;
  }

  async updateMemory(
    conversationId: string,
    customerId: string,
    updateFn: (memory: ConversationMemory) => Partial<ConversationMemory>
  ): Promise<ConversationMemory> {
    const memory = await this.getOrCreateMemory(conversationId, customerId);
    const updates = updateFn(memory);
    
    // Apply updates
    Object.assign(memory, updates);
    memory.lastUpdated = new Date();
    memory.memoryScore = this.calculateMemoryScore(memory);

    // Save to database
    await this.saveMemoryToDatabase(memory);
    
    // Update cache
    const cacheKey = `memory:${conversationId}:${customerId}`;
    this.memoryCache.set(cacheKey, memory);

    return memory;
  }

  async addEpisodicMemory(
    conversationId: string,
    customerId: string,
    event: Omit<EpisodicMemory, 'id' | 'timestamp'>
  ): Promise<void> {
    await this.updateMemory(conversationId, customerId, (memory) => {
      const newEvent: EpisodicMemory = {
        ...event,
        id: this.generateId(),
        timestamp: new Date(),
      };

      memory.episodicMemory.unshift(newEvent); // Add to beginning
      
      // Keep only last 50 events
      if (memory.episodicMemory.length > 50) {
        memory.episodicMemory = memory.episodicMemory.slice(0, 50);
      }

      return { episodicMemory: memory.episodicMemory };
    });
  }

  async addMessageToShortTermMemory(
    conversationId: string,
    customerId: string,
    message: Message,
    intent: string,
    confidence: number,
    emotionalTone: string,
    sentiment: number
  ): Promise<void> {
    await this.updateMemory(conversationId, customerId, (memory) => {
      const messageSummary: MessageSummary = {
        id: message.id,
        timestamp: message.createdAt,
        sender: message.sender as 'USER' | 'BOT',
        content: message.content,
        intent,
        confidence,
        emotionalTone,
        keyTopics: this.extractKeyTopics(message.content),
        sentiment,
      };

      memory.shortTermMemory.recentMessages.unshift(messageSummary);
      
      // Keep only last 20 messages
      if (memory.shortTermMemory.recentMessages.length > 20) {
        memory.shortTermMemory.recentMessages = memory.shortTermMemory.recentMessages.slice(0, 20);
      }

      // Update current context
      memory.shortTermMemory.currentContext = this.updateCurrentContext(memory.shortTermMemory.recentMessages);
      
      // Update active topics
      memory.shortTermMemory.activeTopics = this.extractActiveTopics(memory.shortTermMemory.recentMessages);

      return {
        shortTermMemory: memory.shortTermMemory
      };
    });
  }

  async updateEmotionalState(
    conversationId: string,
    customerId: string,
    emotionalState: Partial<EmotionalState>
  ): Promise<void> {
    await this.updateMemory(conversationId, customerId, (memory) => {
      const currentState = memory.shortTermMemory.emotionalState;
      const updatedState: EmotionalState = {
        ...currentState,
        ...emotionalState,
        timestamp: new Date(),
      };

      // Calculate trend
      updatedState.trend = this.calculateEmotionalTrend(memory.shortTermMemory.recentMessages);

      return {
        shortTermMemory: {
          ...memory.shortTermMemory,
          emotionalState: updatedState
        }
      };
    });
  }

  async addPendingAction(
    conversationId: string,
    customerId: string,
    action: Omit<PendingAction, 'id' | 'status'>
  ): Promise<void> {
    await this.updateMemory(conversationId, customerId, (memory) => {
      const newAction: PendingAction = {
        ...action,
        id: this.generateId(),
        status: 'pending',
      };

      memory.shortTermMemory.pendingActions.push(newAction);

      return {
        shortTermMemory: {
          ...memory.shortTermMemory,
          pendingActions: memory.shortTermMemory.pendingActions
        }
      };
    });
  }

  async updateCustomerPreferences(
    conversationId: string,
    customerId: string,
    preferences: Partial<CustomerPreferences>
  ): Promise<void> {
    await this.updateMemory(conversationId, customerId, (memory) => {
      const updatedPreferences: CustomerPreferences = {
        ...memory.longTermMemory.customerPreferences,
        ...preferences,
      };

      return {
        longTermMemory: {
          ...memory.longTermMemory,
          customerPreferences: updatedPreferences
        }
      };
    });
  }

  async addLearningInsight(
    conversationId: string,
    customerId: string,
    insight: Omit<LearningInsight, 'timestamp' | 'applied'>
  ): Promise<void> {
    await this.updateMemory(conversationId, customerId, (memory) => {
      const newInsight: LearningInsight = {
        ...insight,
        timestamp: new Date(),
        applied: false,
      };

      memory.longTermMemory.learningInsights.unshift(newInsight);
      
      // Keep only last 20 insights
      if (memory.longTermMemory.learningInsights.length > 20) {
        memory.longTermMemory.learningInsights = memory.longTermMemory.learningInsights.slice(0, 20);
      }

      return {
        longTermMemory: {
          ...memory.longTermMemory,
          learningInsights: memory.longTermMemory.learningInsights
        }
      };
    });
  }

  async getMemoryInsights(conversationId: string, customerId: string): Promise<{
    customerInsights: string[];
    conversationInsights: string[];
    actionRecommendations: string[];
    riskFactors: string[];
  }> {
    const memory = await this.getOrCreateMemory(conversationId, customerId);
    
    return {
      customerInsights: this.generateCustomerInsights(memory),
      conversationInsights: this.generateConversationInsights(memory),
      actionRecommendations: this.generateActionRecommendations(memory),
      riskFactors: this.identifyRiskFactors(memory),
    };
  }

  async getConversationSummary(conversationId: string, customerId: string): Promise<string> {
    const memory = await this.getOrCreateMemory(conversationId, customerId);
    
    const recentMessages = memory.shortTermMemory.recentMessages.slice(0, 10);
    const keyTopics = memory.shortTermMemory.activeTopics;
    const emotionalState = memory.shortTermMemory.emotionalState;
    
    return `Conversation Summary:
- Recent Messages: ${recentMessages.length} messages
- Key Topics: ${keyTopics.join(', ')}
- Emotional State: ${emotionalState.primary} (intensity: ${emotionalState.intensity}/10)
- Current Context: ${memory.shortTermMemory.currentContext}
- Pending Actions: ${memory.shortTermMemory.pendingActions.length}
- Memory Score: ${memory.memoryScore}/100`;
  }

  private async loadMemoryFromDatabase(conversationId: string, customerId: string): Promise<ConversationMemory | null> {
    // For MVP, we'll use cache. In production, this would load from database
    const cacheKey = `memory:${conversationId}:${customerId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  }

  private async saveMemoryToDatabase(memory: ConversationMemory): Promise<void> {
    // For MVP, we'll use cache. In production, this would save to database
    const cacheKey = `memory:${memory.conversationId}:${memory.customerId}`;
    await this.cacheService.set(cacheKey, JSON.stringify(memory), 3600); // 1 hour
  }

  private createNewMemory(conversationId: string, customerId: string): ConversationMemory {
    return {
      conversationId,
      customerId,
      shortTermMemory: {
        recentMessages: [],
        currentContext: 'Initial conversation',
        activeTopics: [],
        pendingActions: [],
        emotionalState: {
          primary: 'neutral',
          intensity: 5,
          confidence: 0.5,
          triggers: [],
          duration: 0,
          trend: 'stable',
        },
        conversationFlow: [],
      },
      longTermMemory: {
        customerPreferences: {
          communicationStyle: 'friendly',
          preferredLanguage: 'uz',
          responseSpeed: 'normal',
          productInterests: [],
          priceSensitivity: 'medium',
          decisionStyle: 'analytical',
          preferredContactTime: [],
          specialRequirements: [],
        },
        relationshipHistory: [],
        purchasePatterns: [],
        communicationStyle: {
          preferredChannel: 'telegram',
          responseTime: 5,
          messageLength: 'medium',
          formalityLevel: 'casual',
          languagePreference: 'uz',
          culturalSensitivity: 'medium',
        },
        trustLevel: 50,
        satisfactionHistory: [],
        learningInsights: [],
      },
      episodicMemory: [],
      semanticMemory: {
        customerKnowledge: {
          demographics: {},
          psychographics: {
            personality: 'unknown',
            values: [],
            lifestyle: 'unknown',
            interests: [],
            attitudes: [],
          },
          behavioralPatterns: [],
          preferences: [],
          constraints: [],
        },
        productKnowledge: {
          interests: [],
          aversions: [],
          usagePatterns: [],
          satisfaction: [],
        },
        businessKnowledge: {
          industry: 'unknown',
          role: 'unknown',
          companySize: 'unknown',
          decisionMakingPower: 'medium',
          budget: 'medium',
          urgency: 'medium',
        },
        culturalKnowledge: {
          culturalBackground: 'uzbek',
          communicationNorms: [],
          businessEtiquette: [],
          taboos: [],
          preferences: [],
        },
        languagePatterns: [],
      },
      workingMemory: {
        currentTask: 'initial_greeting',
        activeGoals: ['build_relationship', 'understand_needs'],
        constraints: [],
        availableResources: [],
        decisionPoints: [],
        nextActions: ['greet_customer', 'ask_about_needs'],
      },
      lastUpdated: new Date(),
      memoryScore: 0,
    };
  }

  private calculateMemoryScore(memory: ConversationMemory): number {
    let score = 0;
    
    // Short-term memory score
    score += memory.shortTermMemory.recentMessages.length * 2;
    score += memory.shortTermMemory.activeTopics.length * 3;
    score += memory.shortTermMemory.emotionalState.confidence * 10;
    
    // Long-term memory score
    score += memory.longTermMemory.relationshipHistory.length * 2;
    score += memory.longTermMemory.purchasePatterns.length * 5;
    score += memory.longTermMemory.trustLevel * 0.5;
    score += memory.longTermMemory.learningInsights.length * 3;
    
    // Episodic memory score
    score += memory.episodicMemory.length * 2;
    
    // Semantic memory score
    score += memory.semanticMemory.customerKnowledge.preferences.length * 2;
    score += memory.semanticMemory.productKnowledge.interests.length * 3;
    
    return Math.min(score, 100);
  }

  private extractKeyTopics(content: string): string[] {
    const topics: string[] = [];
    const lowerContent = content.toLowerCase();
    
    // Simple topic extraction - in production, this would use NLP
    if (lowerContent.includes('order') || lowerContent.includes('buy')) topics.push('purchase');
    if (lowerContent.includes('price') || lowerContent.includes('cost')) topics.push('pricing');
    if (lowerContent.includes('product') || lowerContent.includes('item')) topics.push('products');
    if (lowerContent.includes('delivery') || lowerContent.includes('shipping')) topics.push('delivery');
    if (lowerContent.includes('problem') || lowerContent.includes('issue')) topics.push('support');
    if (lowerContent.includes('thank') || lowerContent.includes('appreciate')) topics.push('gratitude');
    
    return topics;
  }

  private updateCurrentContext(messages: MessageSummary[]): string {
    if (messages.length === 0) return 'Initial conversation';
    
    const recentMessages = messages.slice(0, 5);
    const topics = recentMessages.flatMap(msg => msg.keyTopics);
    const uniqueTopics = [...new Set(topics)];
    
    if (uniqueTopics.length === 0) return 'General conversation';
    
    return `Discussing: ${uniqueTopics.join(', ')}`;
  }

  private extractActiveTopics(messages: MessageSummary[]): string[] {
    const topicCounts = new Map<string, number>();
    
    messages.forEach(msg => {
      msg.keyTopics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });
    
    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  private calculateEmotionalTrend(messages: MessageSummary[]): 'improving' | 'stable' | 'declining' {
    if (messages.length < 3) return 'stable';
    
    const recentSentiments = messages.slice(0, 3).map(msg => msg.sentiment);
    const avgSentiment = recentSentiments.reduce((sum, s) => sum + s, 0) / recentSentiments.length;
    
    if (avgSentiment > 0.6) return 'improving';
    if (avgSentiment < 0.4) return 'declining';
    return 'stable';
  }

  private generateCustomerInsights(memory: ConversationMemory): string[] {
    const insights: string[] = [];
    
    // Communication style insights
    if (memory.longTermMemory.communicationStyle.messageLength === 'short') {
      insights.push('Customer prefers concise communication');
    }
    
    // Emotional state insights
    if (memory.shortTermMemory.emotionalState.intensity > 7) {
      insights.push('Customer shows high emotional engagement');
    }
    
    // Topic preferences
    const topicFrequency = new Map<string, number>();
    memory.shortTermMemory.recentMessages.forEach(msg => {
      msg.keyTopics.forEach(topic => {
        topicFrequency.set(topic, (topicFrequency.get(topic) || 0) + 1);
      });
    });
    
    const topTopics = Array.from(topicFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topTopics.length > 0) {
      insights.push(`Customer frequently discusses: ${topTopics.map(([topic]) => topic).join(', ')}`);
    }
    
    return insights;
  }

  private generateConversationInsights(memory: ConversationMemory): string[] {
    const insights: string[] = [];
    
    // Conversation flow insights
    if (memory.shortTermMemory.recentMessages.length > 10) {
      insights.push('Extended conversation indicates high engagement');
    }
    
    // Emotional trend insights
    if (memory.shortTermMemory.emotionalState.trend === 'improving') {
      insights.push('Customer satisfaction is improving throughout conversation');
    }
    
    // Pending actions insights
    if (memory.shortTermMemory.pendingActions.length > 0) {
      insights.push(`${memory.shortTermMemory.pendingActions.length} pending actions require attention`);
    }
    
    return insights;
  }

  private generateActionRecommendations(memory: ConversationMemory): string[] {
    const recommendations: string[] = [];
    
    // Based on emotional state
    if (memory.shortTermMemory.emotionalState.primary === 'frustrated') {
      recommendations.push('Provide immediate support and solutions');
    }
    
    // Based on pending actions
    const highPriorityActions = memory.shortTermMemory.pendingActions.filter(a => a.priority === 'high');
    if (highPriorityActions.length > 0) {
      recommendations.push('Address high-priority pending actions');
    }
    
    // Based on conversation flow
    if (memory.shortTermMemory.recentMessages.length > 15) {
      recommendations.push('Consider summarizing conversation and next steps');
    }
    
    return recommendations;
  }

  private identifyRiskFactors(memory: ConversationMemory): string[] {
    const risks: string[] = [];
    
    // Emotional risks
    if (memory.shortTermMemory.emotionalState.primary === 'angry' && memory.shortTermMemory.emotionalState.intensity > 8) {
      risks.push('High risk of customer dissatisfaction');
    }
    
    // Trust risks
    if (memory.longTermMemory.trustLevel < 30) {
      risks.push('Low trust level requires relationship building');
    }
    
    // Communication risks
    if (memory.shortTermMemory.pendingActions.filter(a => a.status === 'pending' && a.priority === 'high').length > 2) {
      risks.push('Multiple high-priority actions pending');
    }
    
    return risks;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

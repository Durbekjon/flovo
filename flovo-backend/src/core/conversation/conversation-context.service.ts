import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LanguageDetectionService,
  LanguageInfo,
  CulturalContext,
} from '../language/language-detection.service';
import {
  ConversationMemoryService,
  ConversationMemory,
} from '../memory/conversation-memory.service';
import type { Message, Conversation, User } from '@prisma/client';

export interface ConversationContext {
  conversationId: string;
  customerId: string;
  currentState: ConversationState;
  intent: IntentType;
  confidence: number;
  customerProfile: CustomerProfile;
  conversationSummary: string;
  lastInteraction: Date;
  sessionStart: Date;
  messageCount: number;
  languageContext: LanguageContext;
  memoryContext: MemoryContext;
}

export interface MemoryContext {
  memoryScore: number;
  shortTermInsights: string[];
  longTermInsights: string[];
  emotionalState: string;
  pendingActions: number;
  trustLevel: number;
  relationshipStrength: string;
  learningInsights: string[];
  riskFactors: string[];
  recommendations: string[];
}

export interface LanguageContext {
  detectedLanguage: LanguageInfo;
  culturalContext: CulturalContext;
  languagePreference: string;
  translationHistory: TranslationEntry[];
  culturalAdaptations: string[];
}

export interface TranslationEntry {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: Date;
  confidence: number;
}

export interface CustomerProfile {
  name?: string;
  phone?: string;
  email?: string;
  language: string;
  preferences: CustomerPreferences;
  relationshipScore: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  favoriteCategories: string[];
  culturalPreferences: CulturalPreferences;
  memoryInsights: MemoryInsights;
}

export interface MemoryInsights {
  communicationPatterns: string[];
  emotionalPatterns: string[];
  decisionPatterns: string[];
  satisfactionTrends: string[];
  loyaltyIndicators: string[];
  riskFactors: string[];
}

export interface CulturalPreferences {
  communicationStyle: 'formal' | 'casual' | 'friendly';
  preferredLanguage: 'uz' | 'ru' | 'en';
  responseSpeed: 'immediate' | 'normal' | 'detailed';
  productInterests: string[];
  culturalSensitivity: 'high' | 'medium' | 'low';
  businessEtiquette: string[];
}

export interface CustomerPreferences {
  communicationStyle: 'formal' | 'casual' | 'friendly';
  preferredLanguage: 'uz' | 'ru' | 'en';
  responseSpeed: 'immediate' | 'normal' | 'detailed';
  productInterests: string[];
}

export enum ConversationState {
  GREETING = 'greeting',
  PRODUCT_INQUIRY = 'product_inquiry',
  ORDER_INITIATION = 'order_initiation',
  ORDER_CONFIRMATION = 'order_confirmation',
  CUSTOMER_SERVICE = 'customer_service',
  FOLLOW_UP = 'follow_up',
  CLOSING = 'closing',
}

export enum IntentType {
  GREETING = 'greeting',
  PRODUCT_INQUIRY = 'product_inquiry',
  ORDER_REQUEST = 'order_request',
  ORDER_STATUS = 'order_status',
  COMPLAINT = 'complaint',
  FEEDBACK = 'feedback',
  GENERAL_QUESTION = 'general_question',
  PRICING_INQUIRY = 'pricing_inquiry',
  AVAILABILITY_CHECK = 'availability_check',
  CUSTOMER_SERVICE = 'customer_service',
  UNKNOWN = 'unknown',
}

@Injectable()
export class ConversationContextService {
  private readonly logger = new Logger(ConversationContextService.name);
  private readonly contextCache = new Map<string, ConversationContext>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly languageDetectionService: LanguageDetectionService,
    private readonly conversationMemoryService: ConversationMemoryService,
  ) {}

  async getOrCreateContext(
    conversationId: string,
    customerId: string,
  ): Promise<ConversationContext> {
    const cacheKey = `${conversationId}:${customerId}`;

    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey)!;
    }

    // Get conversation history
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Get or create memory context
    const memory = await this.conversationMemoryService.getOrCreateMemory(
      conversationId,
      customerId,
    );

    // Detect language from recent messages
    const languageContext = await this.detectLanguageContext(messages);

    // Get customer profile with memory insights
    const customerProfile = await this.buildCustomerProfile(
      customerId,
      conversationId,
      languageContext,
      memory,
    );

    // Analyze conversation state
    const currentState = this.analyzeConversationState(messages);
    const intent = this.detectIntent(
      messages[messages.length - 1]?.content || '',
    );
    const confidence = this.calculateConfidence(intent, messages);

    // Build memory context
    const memoryContext = await this.buildMemoryContext(memory);

    const context: ConversationContext = {
      conversationId,
      customerId,
      currentState,
      intent,
      confidence,
      customerProfile,
      conversationSummary: this.generateConversationSummary(messages),
      lastInteraction: new Date(),
      sessionStart: messages[messages.length - 1]?.createdAt || new Date(),
      messageCount: messages.length,
      languageContext,
      memoryContext,
    };

    this.contextCache.set(cacheKey, context);
    return context;
  }

  async updateContext(
    conversationId: string,
    customerId: string,
    newMessage: string,
    isUserMessage: boolean,
  ): Promise<ConversationContext> {
    const context = await this.getOrCreateContext(conversationId, customerId);

    // Update context based on new message
    context.lastInteraction = new Date();
    context.messageCount++;

    if (isUserMessage) {
      // Update language context with new message
      const languageInfo =
        await this.languageDetectionService.detectLanguage(newMessage);
      if (
        languageInfo.confidence >
        context.languageContext.detectedLanguage.confidence
      ) {
        context.languageContext.detectedLanguage = languageInfo;
        context.languageContext.culturalContext =
          this.languageDetectionService.getCulturalContext(languageInfo.code) ||
          context.languageContext.culturalContext;
      }

      context.intent = this.detectIntent(newMessage);
      context.confidence = this.calculateConfidence(context.intent, []);
      context.currentState = this.determineNextState(
        context.currentState,
        context.intent,
      );

      // Update memory with new message
      const message = await this.prisma.message.findFirst({
        where: { conversationId, content: newMessage },
        orderBy: { createdAt: 'desc' },
      });

      if (message) {
        await this.conversationMemoryService.addMessageToShortTermMemory(
          conversationId,
          customerId,
          message,
          context.intent,
          context.confidence,
          'neutral', // Will be updated by AI
          0.5, // Will be updated by AI
        );
      }
    }

    // Update conversation summary
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    context.conversationSummary = this.generateConversationSummary(messages);

    // Update memory context
    const memory = await this.conversationMemoryService.getOrCreateMemory(
      conversationId,
      customerId,
    );
    context.memoryContext = await this.buildMemoryContext(memory);

    return context;
  }

  private async buildMemoryContext(
    memory: ConversationMemory,
  ): Promise<MemoryContext> {
    const insights = await this.conversationMemoryService.getMemoryInsights(
      memory.conversationId,
      memory.customerId,
    );

    return {
      memoryScore: memory.memoryScore,
      shortTermInsights: insights.conversationInsights,
      longTermInsights: insights.customerInsights,
      emotionalState: memory.shortTermMemory.emotionalState.primary,
      pendingActions: memory.shortTermMemory.pendingActions.length,
      trustLevel: memory.longTermMemory.trustLevel,
      relationshipStrength: this.getRelationshipStrength(
        memory.longTermMemory.trustLevel,
      ),
      learningInsights: memory.longTermMemory.learningInsights.map(
        (insight) => insight.description,
      ),
      riskFactors: insights.riskFactors,
      recommendations: insights.actionRecommendations,
    };
  }

  private getRelationshipStrength(trustLevel: number): string {
    if (trustLevel >= 80) return 'Very Strong';
    if (trustLevel >= 60) return 'Strong';
    if (trustLevel >= 40) return 'Moderate';
    if (trustLevel >= 20) return 'Weak';
    return 'New';
  }

  private async detectLanguageContext(
    messages: Message[],
  ): Promise<LanguageContext> {
    // Analyze all messages to determine primary language
    const languageScores = new Map<string, number>();
    const translationHistory: TranslationEntry[] = [];

    for (const message of messages) {
      if (message.sender === 'USER') {
        const languageInfo = await this.languageDetectionService.detectLanguage(
          message.content,
        );
        const currentScore = languageScores.get(languageInfo.code) || 0;
        languageScores.set(
          languageInfo.code,
          currentScore + languageInfo.confidence,
        );
      }
    }

    // Determine primary language
    let primaryLanguage = 'uz'; // Default
    let maxScore = 0;

    for (const [lang, score] of languageScores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        primaryLanguage = lang;
      }
    }

    const detectedLanguage: LanguageInfo = {
      code: primaryLanguage,
      name:
        primaryLanguage === 'uz'
          ? 'Uzbek'
          : primaryLanguage === 'ru'
            ? 'Russian'
            : 'English',
      confidence: maxScore / messages.length,
      isPrimary: primaryLanguage === 'uz',
    };

    const culturalContext =
      this.languageDetectionService.getCulturalContext(primaryLanguage);

    return {
      detectedLanguage,
      culturalContext:
        culturalContext ||
        this.languageDetectionService.getCulturalContext('uz')!,
      languagePreference: primaryLanguage,
      translationHistory,
      culturalAdaptations: [],
    };
  }

  private async buildCustomerProfile(
    customerId: string,
    conversationId: string,
    languageContext: LanguageContext,
    memory: ConversationMemory,
  ): Promise<CustomerProfile> {
    // Get customer's order history
    const orders = await this.prisma.order.findMany({
      where: {
        user: {
          conversations: {
            some: { id: conversationId },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Analyze customer preferences
    const preferences = this.analyzeCustomerPreferences(orders);

    // Calculate relationship metrics
    const relationshipScore = this.calculateRelationshipScore(orders);
    const averageOrderValue =
      orders.length > 0
        ? orders.reduce(
            (sum, order) => sum + (order.details as any)?.total || 0,
            0,
          ) / orders.length
        : 0;

    // Determine favorite categories
    const favoriteCategories = this.extractFavoriteCategories(orders);

    // Build cultural preferences
    const culturalPreferences: CulturalPreferences = {
      communicationStyle:
        languageContext.culturalContext.formality === 'respectful'
          ? 'formal'
          : 'friendly',
      preferredLanguage: languageContext.languagePreference as
        | 'uz'
        | 'ru'
        | 'en',
      responseSpeed: 'normal',
      productInterests: favoriteCategories,
      culturalSensitivity: 'high',
      businessEtiquette: languageContext.culturalContext.businessEtiquette,
    };

    // Build memory insights
    const memoryInsights = this.buildMemoryInsights(memory);

    return {
      name: undefined, // Will be extracted from conversation
      phone: undefined, // Will be extracted from conversation
      email: undefined, // Will be extracted from conversation
      language: languageContext.languagePreference,
      preferences,
      relationshipScore,
      totalOrders: orders.length,
      averageOrderValue,
      lastOrderDate: orders[0]?.createdAt,
      favoriteCategories,
      culturalPreferences,
      memoryInsights,
    };
  }

  private buildMemoryInsights(memory: ConversationMemory): MemoryInsights {
    const insights: MemoryInsights = {
      communicationPatterns: [],
      emotionalPatterns: [],
      decisionPatterns: [],
      satisfactionTrends: [],
      loyaltyIndicators: [],
      riskFactors: [],
    };

    // Communication patterns
    if (memory.longTermMemory.communicationStyle.messageLength === 'short') {
      insights.communicationPatterns.push('Prefers concise communication');
    }
    if (memory.longTermMemory.communicationStyle.responseTime < 3) {
      insights.communicationPatterns.push('Expects quick responses');
    }

    // Emotional patterns
    if (memory.shortTermMemory.emotionalState.trend === 'improving') {
      insights.emotionalPatterns.push('Satisfaction improving over time');
    }
    if (memory.shortTermMemory.emotionalState.intensity > 7) {
      insights.emotionalPatterns.push('High emotional engagement');
    }

    // Decision patterns
    if (
      memory.longTermMemory.customerPreferences.decisionStyle === 'analytical'
    ) {
      insights.decisionPatterns.push('Makes analytical decisions');
    }
    if (memory.longTermMemory.customerPreferences.priceSensitivity === 'high') {
      insights.decisionPatterns.push('Price-sensitive decision maker');
    }

    // Satisfaction trends
    const recentSatisfaction = memory.longTermMemory.satisfactionHistory
      .filter(
        (event) =>
          Date.now() - event.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000,
      ) // Last 30 days
      .map((event) => event.score);

    if (recentSatisfaction.length > 0) {
      const avgSatisfaction =
        recentSatisfaction.reduce((sum, score) => sum + score, 0) /
        recentSatisfaction.length;
      if (avgSatisfaction > 8) {
        insights.satisfactionTrends.push('High satisfaction trend');
      } else if (avgSatisfaction < 6) {
        insights.satisfactionTrends.push('Declining satisfaction trend');
      }
    }

    // Loyalty indicators
    if (memory.longTermMemory.trustLevel > 70) {
      insights.loyaltyIndicators.push('High trust level');
    }
    if (memory.longTermMemory.purchasePatterns.length > 3) {
      insights.loyaltyIndicators.push('Repeat customer');
    }

    // Risk factors
    if (memory.shortTermMemory.emotionalState.primary === 'frustrated') {
      insights.riskFactors.push('Currently frustrated');
    }
    if (memory.longTermMemory.trustLevel < 30) {
      insights.riskFactors.push('Low trust level');
    }

    return insights;
  }

  private analyzeConversationState(messages: Message[]): ConversationState {
    if (messages.length === 0) return ConversationState.GREETING;

    const lastMessage = messages[0].content.toLowerCase();
    const messageCount = messages.length;

    // Simple state detection logic
    if (messageCount === 1) return ConversationState.GREETING;

    if (
      lastMessage.includes('order') ||
      lastMessage.includes('buy') ||
      lastMessage.includes('purchase') ||
      lastMessage.includes('заказать') ||
      lastMessage.includes('купить') ||
      lastMessage.includes('buyurtma')
    ) {
      return ConversationState.ORDER_INITIATION;
    }

    if (
      lastMessage.includes('product') ||
      lastMessage.includes('item') ||
      lastMessage.includes('available') ||
      lastMessage.includes('товар') ||
      lastMessage.includes('mahsulot')
    ) {
      return ConversationState.PRODUCT_INQUIRY;
    }

    if (
      lastMessage.includes('problem') ||
      lastMessage.includes('issue') ||
      lastMessage.includes('complaint') ||
      lastMessage.includes('проблема') ||
      lastMessage.includes('muammo')
    ) {
      return ConversationState.CUSTOMER_SERVICE;
    }

    return ConversationState.GENERAL_QUESTION;
  }

  private detectIntent(message: string): IntentType {
    const lowerMessage = message.toLowerCase();

    // Intent detection patterns with multi-language support
    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('привет') ||
      lowerMessage.includes('assalomu') ||
      lowerMessage.includes('salom')
    ) {
      return IntentType.GREETING;
    }

    if (
      lowerMessage.includes('order') ||
      lowerMessage.includes('buy') ||
      lowerMessage.includes('purchase') ||
      lowerMessage.includes('заказать') ||
      lowerMessage.includes('купить') ||
      lowerMessage.includes('buyurtma')
    ) {
      return IntentType.ORDER_REQUEST;
    }

    if (
      lowerMessage.includes('product') ||
      lowerMessage.includes('item') ||
      lowerMessage.includes('товар') ||
      lowerMessage.includes('mahsulot')
    ) {
      return IntentType.PRODUCT_INQUIRY;
    }

    if (
      lowerMessage.includes('price') ||
      lowerMessage.includes('cost') ||
      lowerMessage.includes('стоимость') ||
      lowerMessage.includes('narxi')
    ) {
      return IntentType.PRICING_INQUIRY;
    }

    if (
      lowerMessage.includes('available') ||
      lowerMessage.includes('in stock') ||
      lowerMessage.includes('есть') ||
      lowerMessage.includes('bor')
    ) {
      return IntentType.AVAILABILITY_CHECK;
    }

    if (
      lowerMessage.includes('problem') ||
      lowerMessage.includes('issue') ||
      lowerMessage.includes('проблема') ||
      lowerMessage.includes('muammo')
    ) {
      return IntentType.COMPLAINT;
    }

    if (
      lowerMessage.includes('status') ||
      lowerMessage.includes('where') ||
      lowerMessage.includes('статус') ||
      lowerMessage.includes('holat')
    ) {
      return IntentType.ORDER_STATUS;
    }

    return IntentType.UNKNOWN;
  }

  private calculateConfidence(intent: IntentType, messages: Message[]): number {
    // Base confidence on intent type and message history
    let confidence = 0.5; // Base confidence

    if (intent !== IntentType.UNKNOWN) {
      confidence += 0.3;
    }

    // Higher confidence with more context
    if (messages.length > 3) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  private determineNextState(
    currentState: ConversationState,
    intent: IntentType,
  ): ConversationState {
    // State transition logic
    switch (currentState) {
      case ConversationState.GREETING:
        if (intent === IntentType.ORDER_REQUEST)
          return ConversationState.ORDER_INITIATION;
        if (intent === IntentType.PRODUCT_INQUIRY)
          return ConversationState.PRODUCT_INQUIRY;
        return ConversationState.GENERAL_QUESTION;

      case ConversationState.ORDER_INITIATION:
        if (intent === IntentType.ORDER_REQUEST)
          return ConversationState.ORDER_CONFIRMATION;
        return ConversationState.ORDER_INITIATION;

      case ConversationState.ORDER_CONFIRMATION:
        return ConversationState.FOLLOW_UP;

      default:
        return currentState;
    }
  }

  private generateConversationSummary(messages: Message[]): string {
    if (messages.length === 0) return 'New conversation started';

    const recentMessages = messages.slice(0, 5).reverse();
    const summary = recentMessages
      .map(
        (msg) =>
          `${msg.sender}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
      )
      .join(' | ');

    return summary;
  }

  private analyzeCustomerPreferences(orders: any[]): CustomerPreferences {
    // Analyze order patterns to determine preferences
    const totalOrders = orders.length;
    const hasMultipleOrders = totalOrders > 1;

    return {
      communicationStyle: hasMultipleOrders ? 'friendly' : 'formal',
      preferredLanguage: 'uz', // Default, will be updated by language detection
      responseSpeed: hasMultipleOrders ? 'normal' : 'detailed',
      productInterests: this.extractFavoriteCategories(orders),
    };
  }

  private calculateRelationshipScore(orders: any[]): number {
    if (orders.length === 0) return 0;

    let score = orders.length * 10; // Base score per order

    // Bonus for recent orders
    const recentOrders = orders.filter((order) => {
      const daysSinceOrder =
        (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceOrder < 30;
    });

    score += recentOrders.length * 5;

    // Bonus for higher value orders
    const totalValue = orders.reduce(
      (sum, order) => sum + (order.details as any)?.total || 0,
      0,
    );
    score += Math.min(totalValue / 100, 50); // Cap at 50 points for value

    return Math.min(score, 100); // Cap at 100
  }

  private extractFavoriteCategories(orders: any[]): string[] {
    const categories = new Map<string, number>();

    orders.forEach((order) => {
      const items = (order.details as any)?.items || '';
      // Simple category extraction - in production, this would be more sophisticated
      if (
        items.includes('clothing') ||
        items.includes('одежда') ||
        items.includes('kiyim')
      )
        categories.set('clothing', (categories.get('clothing') || 0) + 1);
      if (
        items.includes('food') ||
        items.includes('еда') ||
        items.includes('ovqat')
      )
        categories.set('food', (categories.get('food') || 0) + 1);
      if (
        items.includes('electronics') ||
        items.includes('электроника') ||
        items.includes('elektronika')
      )
        categories.set('electronics', (categories.get('electronics') || 0) + 1);
    });

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  async clearContext(
    conversationId: string,
    customerId: string,
  ): Promise<void> {
    const cacheKey = `${conversationId}:${customerId}`;
    this.contextCache.delete(cacheKey);
  }

  async getContextStats(): Promise<{
    activeConversations: number;
    cacheSize: number;
  }> {
    return {
      activeConversations: this.contextCache.size,
      cacheSize: this.contextCache.size,
    };
  }

  async getLanguageDistribution(): Promise<Record<string, number>> {
    const distribution: Record<string, number> = {};

    for (const context of this.contextCache.values()) {
      const lang = context.languageContext.detectedLanguage.code;
      distribution[lang] = (distribution[lang] || 0) + 1;
    }

    return distribution;
  }

  async getMemoryInsights(
    conversationId: string,
    customerId: string,
  ): Promise<{
    customerInsights: string[];
    conversationInsights: string[];
    actionRecommendations: string[];
    riskFactors: string[];
  }> {
    return await this.conversationMemoryService.getMemoryInsights(
      conversationId,
      customerId,
    );
  }

  async getConversationSummary(
    conversationId: string,
    customerId: string,
  ): Promise<string> {
    return await this.conversationMemoryService.getConversationSummary(
      conversationId,
      customerId,
    );
  }
}

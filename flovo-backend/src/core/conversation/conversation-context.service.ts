import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  CLOSING = 'closing'
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
  UNKNOWN = 'unknown'
}

@Injectable()
export class ConversationContextService {
  private readonly logger = new Logger(ConversationContextService.name);
  private readonly contextCache = new Map<string, ConversationContext>();

  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateContext(conversationId: string, customerId: string): Promise<ConversationContext> {
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

    // Get customer profile
    const customerProfile = await this.buildCustomerProfile(customerId, conversationId);

    // Analyze conversation state
    const currentState = this.analyzeConversationState(messages);
    const intent = this.detectIntent(messages[messages.length - 1]?.content || '');
    const confidence = this.calculateConfidence(intent, messages);

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
    };

    this.contextCache.set(cacheKey, context);
    return context;
  }

  async updateContext(conversationId: string, customerId: string, newMessage: string, isUserMessage: boolean): Promise<ConversationContext> {
    const context = await this.getOrCreateContext(conversationId, customerId);
    
    // Update context based on new message
    context.lastInteraction = new Date();
    context.messageCount++;
    
    if (isUserMessage) {
      context.intent = this.detectIntent(newMessage);
      context.confidence = this.calculateConfidence(context.intent, []);
      context.currentState = this.determineNextState(context.currentState, context.intent);
    }

    // Update conversation summary
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    context.conversationSummary = this.generateConversationSummary(messages);

    return context;
  }

  private async buildCustomerProfile(customerId: string, conversationId: string): Promise<CustomerProfile> {
    // Get customer's order history
    const orders = await this.prisma.order.findMany({
      where: { 
        user: { 
          conversations: { 
            some: { id: conversationId } 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' },
    });

    // Analyze customer preferences
    const preferences = this.analyzeCustomerPreferences(orders);
    
    // Calculate relationship metrics
    const relationshipScore = this.calculateRelationshipScore(orders);
    const averageOrderValue = orders.length > 0 
      ? orders.reduce((sum, order) => sum + (order.details as any)?.total || 0, 0) / orders.length 
      : 0;

    // Determine favorite categories
    const favoriteCategories = this.extractFavoriteCategories(orders);

    return {
      name: undefined, // Will be extracted from conversation
      phone: undefined, // Will be extracted from conversation
      email: undefined, // Will be extracted from conversation
      language: 'uz', // Default, will be detected
      preferences,
      relationshipScore,
      totalOrders: orders.length,
      averageOrderValue,
      lastOrderDate: orders[0]?.createdAt,
      favoriteCategories,
    };
  }

  private analyzeConversationState(messages: Message[]): ConversationState {
    if (messages.length === 0) return ConversationState.GREETING;

    const lastMessage = messages[0].content.toLowerCase();
    const messageCount = messages.length;

    // Simple state detection logic
    if (messageCount === 1) return ConversationState.GREETING;
    
    if (lastMessage.includes('order') || lastMessage.includes('buy') || lastMessage.includes('purchase')) {
      return ConversationState.ORDER_INITIATION;
    }
    
    if (lastMessage.includes('product') || lastMessage.includes('item') || lastMessage.includes('available')) {
      return ConversationState.PRODUCT_INQUIRY;
    }
    
    if (lastMessage.includes('problem') || lastMessage.includes('issue') || lastMessage.includes('complaint')) {
      return ConversationState.CUSTOMER_SERVICE;
    }

    return ConversationState.GENERAL_QUESTION;
  }

  private detectIntent(message: string): IntentType {
    const lowerMessage = message.toLowerCase();
    
    // Intent detection patterns
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('привет')) {
      return IntentType.GREETING;
    }
    
    if (lowerMessage.includes('order') || lowerMessage.includes('buy') || lowerMessage.includes('purchase') || 
        lowerMessage.includes('заказать') || lowerMessage.includes('купить')) {
      return IntentType.ORDER_REQUEST;
    }
    
    if (lowerMessage.includes('product') || lowerMessage.includes('item') || lowerMessage.includes('товар')) {
      return IntentType.PRODUCT_INQUIRY;
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('стоимость')) {
      return IntentType.PRICING_INQUIRY;
    }
    
    if (lowerMessage.includes('available') || lowerMessage.includes('in stock') || lowerMessage.includes('есть')) {
      return IntentType.AVAILABILITY_CHECK;
    }
    
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('проблема')) {
      return IntentType.COMPLAINT;
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('where') || lowerMessage.includes('статус')) {
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

  private determineNextState(currentState: ConversationState, intent: IntentType): ConversationState {
    // State transition logic
    switch (currentState) {
      case ConversationState.GREETING:
        if (intent === IntentType.ORDER_REQUEST) return ConversationState.ORDER_INITIATION;
        if (intent === IntentType.PRODUCT_INQUIRY) return ConversationState.PRODUCT_INQUIRY;
        return ConversationState.GENERAL_QUESTION;
        
      case ConversationState.ORDER_INITIATION:
        if (intent === IntentType.ORDER_REQUEST) return ConversationState.ORDER_CONFIRMATION;
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
    const summary = recentMessages.map(msg => 
      `${msg.sender}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`
    ).join(' | ');
    
    return summary;
  }

  private analyzeCustomerPreferences(orders: any[]): CustomerPreferences {
    // Analyze order patterns to determine preferences
    const totalOrders = orders.length;
    const hasMultipleOrders = totalOrders > 1;
    
    return {
      communicationStyle: hasMultipleOrders ? 'friendly' : 'formal',
      preferredLanguage: 'uz', // Default, will be detected from messages
      responseSpeed: hasMultipleOrders ? 'normal' : 'detailed',
      productInterests: this.extractFavoriteCategories(orders),
    };
  }

  private calculateRelationshipScore(orders: any[]): number {
    if (orders.length === 0) return 0;
    
    let score = orders.length * 10; // Base score per order
    
    // Bonus for recent orders
    const recentOrders = orders.filter(order => {
      const daysSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceOrder < 30;
    });
    
    score += recentOrders.length * 5;
    
    // Bonus for higher value orders
    const totalValue = orders.reduce((sum, order) => sum + (order.details as any)?.total || 0, 0);
    score += Math.min(totalValue / 100, 50); // Cap at 50 points for value
    
    return Math.min(score, 100); // Cap at 100
  }

  private extractFavoriteCategories(orders: any[]): string[] {
    const categories = new Map<string, number>();
    
    orders.forEach(order => {
      const items = (order.details as any)?.items || '';
      // Simple category extraction - in production, this would be more sophisticated
      if (items.includes('clothing') || items.includes('одежда')) categories.set('clothing', (categories.get('clothing') || 0) + 1);
      if (items.includes('food') || items.includes('еда')) categories.set('food', (categories.get('food') || 0) + 1);
      if (items.includes('electronics') || items.includes('электроника')) categories.set('electronics', (categories.get('electronics') || 0) + 1);
    });
    
    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  async clearContext(conversationId: string, customerId: string): Promise<void> {
    const cacheKey = `${conversationId}:${customerId}`;
    this.contextCache.delete(cacheKey);
  }

  async getContextStats(): Promise<{ activeConversations: number; cacheSize: number }> {
    return {
      activeConversations: this.contextCache.size,
      cacheSize: this.contextCache.size,
    };
  }
}

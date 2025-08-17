import { PrismaService } from '../prisma/prisma.service';
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
export declare enum ConversationState {
    GREETING = "greeting",
    PRODUCT_INQUIRY = "product_inquiry",
    ORDER_INITIATION = "order_initiation",
    ORDER_CONFIRMATION = "order_confirmation",
    CUSTOMER_SERVICE = "customer_service",
    FOLLOW_UP = "follow_up",
    CLOSING = "closing"
}
export declare enum IntentType {
    GREETING = "greeting",
    PRODUCT_INQUIRY = "product_inquiry",
    ORDER_REQUEST = "order_request",
    ORDER_STATUS = "order_status",
    COMPLAINT = "complaint",
    FEEDBACK = "feedback",
    GENERAL_QUESTION = "general_question",
    PRICING_INQUIRY = "pricing_inquiry",
    AVAILABILITY_CHECK = "availability_check",
    CUSTOMER_SERVICE = "customer_service",
    UNKNOWN = "unknown"
}
export declare class ConversationContextService {
    private readonly prisma;
    private readonly logger;
    private readonly contextCache;
    constructor(prisma: PrismaService);
    getOrCreateContext(conversationId: string, customerId: string): Promise<ConversationContext>;
    updateContext(conversationId: string, customerId: string, newMessage: string, isUserMessage: boolean): Promise<ConversationContext>;
    private buildCustomerProfile;
    private analyzeConversationState;
    private detectIntent;
    private calculateConfidence;
    private determineNextState;
    private generateConversationSummary;
    private analyzeCustomerPreferences;
    private calculateRelationshipScore;
    private extractFavoriteCategories;
    clearContext(conversationId: string, customerId: string): Promise<void>;
    getContextStats(): Promise<{
        activeConversations: number;
        cacheSize: number;
    }>;
}

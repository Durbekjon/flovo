import { PrismaService } from '../prisma/prisma.service';
import { LanguageDetectionService, LanguageInfo, CulturalContext } from '../language/language-detection.service';
import { ConversationMemoryService } from '../memory/conversation-memory.service';
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
    private readonly languageDetectionService;
    private readonly conversationMemoryService;
    private readonly logger;
    private readonly contextCache;
    constructor(prisma: PrismaService, languageDetectionService: LanguageDetectionService, conversationMemoryService: ConversationMemoryService);
    getOrCreateContext(conversationId: string, customerId: string): Promise<ConversationContext>;
    updateContext(conversationId: string, customerId: string, newMessage: string, isUserMessage: boolean): Promise<ConversationContext>;
    private buildMemoryContext;
    private getRelationshipStrength;
    private detectLanguageContext;
    private buildCustomerProfile;
    private buildMemoryInsights;
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
    getLanguageDistribution(): Promise<Record<string, number>>;
    getMemoryInsights(conversationId: string, customerId: string): Promise<{
        customerInsights: string[];
        conversationInsights: string[];
        actionRecommendations: string[];
        riskFactors: string[];
    }>;
    getConversationSummary(conversationId: string, customerId: string): Promise<string>;
}

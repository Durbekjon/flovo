"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ConversationContextService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationContextService = exports.IntentType = exports.ConversationState = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const language_detection_service_1 = require("../language/language-detection.service");
const conversation_memory_service_1 = require("../memory/conversation-memory.service");
var ConversationState;
(function (ConversationState) {
    ConversationState["GREETING"] = "greeting";
    ConversationState["PRODUCT_INQUIRY"] = "product_inquiry";
    ConversationState["ORDER_INITIATION"] = "order_initiation";
    ConversationState["ORDER_CONFIRMATION"] = "order_confirmation";
    ConversationState["CUSTOMER_SERVICE"] = "customer_service";
    ConversationState["FOLLOW_UP"] = "follow_up";
    ConversationState["CLOSING"] = "closing";
})(ConversationState || (exports.ConversationState = ConversationState = {}));
var IntentType;
(function (IntentType) {
    IntentType["GREETING"] = "greeting";
    IntentType["PRODUCT_INQUIRY"] = "product_inquiry";
    IntentType["ORDER_REQUEST"] = "order_request";
    IntentType["ORDER_STATUS"] = "order_status";
    IntentType["COMPLAINT"] = "complaint";
    IntentType["FEEDBACK"] = "feedback";
    IntentType["GENERAL_QUESTION"] = "general_question";
    IntentType["PRICING_INQUIRY"] = "pricing_inquiry";
    IntentType["AVAILABILITY_CHECK"] = "availability_check";
    IntentType["CUSTOMER_SERVICE"] = "customer_service";
    IntentType["UNKNOWN"] = "unknown";
})(IntentType || (exports.IntentType = IntentType = {}));
let ConversationContextService = ConversationContextService_1 = class ConversationContextService {
    prisma;
    languageDetectionService;
    conversationMemoryService;
    logger = new common_1.Logger(ConversationContextService_1.name);
    contextCache = new Map();
    constructor(prisma, languageDetectionService, conversationMemoryService) {
        this.prisma = prisma;
        this.languageDetectionService = languageDetectionService;
        this.conversationMemoryService = conversationMemoryService;
    }
    async getOrCreateContext(conversationId, customerId) {
        const cacheKey = `${conversationId}:${customerId}`;
        if (this.contextCache.has(cacheKey)) {
            return this.contextCache.get(cacheKey);
        }
        const messages = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const memory = await this.conversationMemoryService.getOrCreateMemory(conversationId, customerId);
        const languageContext = await this.detectLanguageContext(messages);
        const customerProfile = await this.buildCustomerProfile(customerId, conversationId, languageContext, memory);
        const currentState = this.analyzeConversationState(messages);
        const intent = this.detectIntent(messages[messages.length - 1]?.content || '');
        const confidence = this.calculateConfidence(intent, messages);
        const memoryContext = await this.buildMemoryContext(memory);
        const context = {
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
    async updateContext(conversationId, customerId, newMessage, isUserMessage) {
        const context = await this.getOrCreateContext(conversationId, customerId);
        context.lastInteraction = new Date();
        context.messageCount++;
        if (isUserMessage) {
            const languageInfo = await this.languageDetectionService.detectLanguage(newMessage);
            if (languageInfo.confidence >
                context.languageContext.detectedLanguage.confidence) {
                context.languageContext.detectedLanguage = languageInfo;
                context.languageContext.culturalContext =
                    this.languageDetectionService.getCulturalContext(languageInfo.code) ||
                        context.languageContext.culturalContext;
            }
            context.intent = this.detectIntent(newMessage);
            context.confidence = this.calculateConfidence(context.intent, []);
            context.currentState = this.determineNextState(context.currentState, context.intent);
            const message = await this.prisma.message.findFirst({
                where: { conversationId, content: newMessage },
                orderBy: { createdAt: 'desc' },
            });
            if (message) {
                await this.conversationMemoryService.addMessageToShortTermMemory(conversationId, customerId, message, context.intent, context.confidence, 'neutral', 0.5);
            }
        }
        const messages = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        context.conversationSummary = this.generateConversationSummary(messages);
        const memory = await this.conversationMemoryService.getOrCreateMemory(conversationId, customerId);
        context.memoryContext = await this.buildMemoryContext(memory);
        return context;
    }
    async buildMemoryContext(memory) {
        const insights = await this.conversationMemoryService.getMemoryInsights(memory.conversationId, memory.customerId);
        return {
            memoryScore: memory.memoryScore,
            shortTermInsights: insights.conversationInsights,
            longTermInsights: insights.customerInsights,
            emotionalState: memory.shortTermMemory.emotionalState.primary,
            pendingActions: memory.shortTermMemory.pendingActions.length,
            trustLevel: memory.longTermMemory.trustLevel,
            relationshipStrength: this.getRelationshipStrength(memory.longTermMemory.trustLevel),
            learningInsights: memory.longTermMemory.learningInsights.map((insight) => insight.description),
            riskFactors: insights.riskFactors,
            recommendations: insights.actionRecommendations,
        };
    }
    getRelationshipStrength(trustLevel) {
        if (trustLevel >= 80)
            return 'Very Strong';
        if (trustLevel >= 60)
            return 'Strong';
        if (trustLevel >= 40)
            return 'Moderate';
        if (trustLevel >= 20)
            return 'Weak';
        return 'New';
    }
    async detectLanguageContext(messages) {
        const languageScores = new Map();
        const translationHistory = [];
        for (const message of messages) {
            if (message.sender === 'USER') {
                const languageInfo = await this.languageDetectionService.detectLanguage(message.content);
                const currentScore = languageScores.get(languageInfo.code) || 0;
                languageScores.set(languageInfo.code, currentScore + languageInfo.confidence);
            }
        }
        let primaryLanguage = 'uz';
        let maxScore = 0;
        for (const [lang, score] of languageScores.entries()) {
            if (score > maxScore) {
                maxScore = score;
                primaryLanguage = lang;
            }
        }
        const detectedLanguage = {
            code: primaryLanguage,
            name: primaryLanguage === 'uz'
                ? 'Uzbek'
                : primaryLanguage === 'ru'
                    ? 'Russian'
                    : 'English',
            confidence: maxScore / messages.length,
            isPrimary: primaryLanguage === 'uz',
        };
        const culturalContext = this.languageDetectionService.getCulturalContext(primaryLanguage);
        return {
            detectedLanguage,
            culturalContext: culturalContext ||
                this.languageDetectionService.getCulturalContext('uz'),
            languagePreference: primaryLanguage,
            translationHistory,
            culturalAdaptations: [],
        };
    }
    async buildCustomerProfile(customerId, conversationId, languageContext, memory) {
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
        const preferences = this.analyzeCustomerPreferences(orders);
        const relationshipScore = this.calculateRelationshipScore(orders);
        const averageOrderValue = orders.length > 0
            ? orders.reduce((sum, order) => sum + order.details?.total || 0, 0) / orders.length
            : 0;
        const favoriteCategories = this.extractFavoriteCategories(orders);
        const culturalPreferences = {
            communicationStyle: languageContext.culturalContext.formality === 'respectful'
                ? 'formal'
                : 'friendly',
            preferredLanguage: languageContext.languagePreference,
            responseSpeed: 'normal',
            productInterests: favoriteCategories,
            culturalSensitivity: 'high',
            businessEtiquette: languageContext.culturalContext.businessEtiquette,
        };
        const memoryInsights = this.buildMemoryInsights(memory);
        return {
            name: undefined,
            phone: undefined,
            email: undefined,
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
    buildMemoryInsights(memory) {
        const insights = {
            communicationPatterns: [],
            emotionalPatterns: [],
            decisionPatterns: [],
            satisfactionTrends: [],
            loyaltyIndicators: [],
            riskFactors: [],
        };
        if (memory.longTermMemory.communicationStyle.messageLength === 'short') {
            insights.communicationPatterns.push('Prefers concise communication');
        }
        if (memory.longTermMemory.communicationStyle.responseTime < 3) {
            insights.communicationPatterns.push('Expects quick responses');
        }
        if (memory.shortTermMemory.emotionalState.trend === 'improving') {
            insights.emotionalPatterns.push('Satisfaction improving over time');
        }
        if (memory.shortTermMemory.emotionalState.intensity > 7) {
            insights.emotionalPatterns.push('High emotional engagement');
        }
        if (memory.longTermMemory.customerPreferences.decisionStyle === 'analytical') {
            insights.decisionPatterns.push('Makes analytical decisions');
        }
        if (memory.longTermMemory.customerPreferences.priceSensitivity === 'high') {
            insights.decisionPatterns.push('Price-sensitive decision maker');
        }
        const recentSatisfaction = memory.longTermMemory.satisfactionHistory
            .filter((event) => Date.now() - event.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000)
            .map((event) => event.score);
        if (recentSatisfaction.length > 0) {
            const avgSatisfaction = recentSatisfaction.reduce((sum, score) => sum + score, 0) /
                recentSatisfaction.length;
            if (avgSatisfaction > 8) {
                insights.satisfactionTrends.push('High satisfaction trend');
            }
            else if (avgSatisfaction < 6) {
                insights.satisfactionTrends.push('Declining satisfaction trend');
            }
        }
        if (memory.longTermMemory.trustLevel > 70) {
            insights.loyaltyIndicators.push('High trust level');
        }
        if (memory.longTermMemory.purchasePatterns.length > 3) {
            insights.loyaltyIndicators.push('Repeat customer');
        }
        if (memory.shortTermMemory.emotionalState.primary === 'frustrated') {
            insights.riskFactors.push('Currently frustrated');
        }
        if (memory.longTermMemory.trustLevel < 30) {
            insights.riskFactors.push('Low trust level');
        }
        return insights;
    }
    analyzeConversationState(messages) {
        if (messages.length === 0)
            return ConversationState.GREETING;
        const lastMessage = messages[0].content.toLowerCase();
        const messageCount = messages.length;
        if (messageCount === 1)
            return ConversationState.GREETING;
        if (lastMessage.includes('order') ||
            lastMessage.includes('buy') ||
            lastMessage.includes('purchase') ||
            lastMessage.includes('заказать') ||
            lastMessage.includes('купить') ||
            lastMessage.includes('buyurtma')) {
            return ConversationState.ORDER_INITIATION;
        }
        if (lastMessage.includes('product') ||
            lastMessage.includes('item') ||
            lastMessage.includes('available') ||
            lastMessage.includes('товар') ||
            lastMessage.includes('mahsulot')) {
            return ConversationState.PRODUCT_INQUIRY;
        }
        if (lastMessage.includes('problem') ||
            lastMessage.includes('issue') ||
            lastMessage.includes('complaint') ||
            lastMessage.includes('проблема') ||
            lastMessage.includes('muammo')) {
            return ConversationState.CUSTOMER_SERVICE;
        }
        return ConversationState.GENERAL_QUESTION;
    }
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('hello') ||
            lowerMessage.includes('hi') ||
            lowerMessage.includes('привет') ||
            lowerMessage.includes('assalomu') ||
            lowerMessage.includes('salom')) {
            return IntentType.GREETING;
        }
        if (lowerMessage.includes('order') ||
            lowerMessage.includes('buy') ||
            lowerMessage.includes('purchase') ||
            lowerMessage.includes('заказать') ||
            lowerMessage.includes('купить') ||
            lowerMessage.includes('buyurtma')) {
            return IntentType.ORDER_REQUEST;
        }
        if (lowerMessage.includes('product') ||
            lowerMessage.includes('item') ||
            lowerMessage.includes('товар') ||
            lowerMessage.includes('mahsulot')) {
            return IntentType.PRODUCT_INQUIRY;
        }
        if (lowerMessage.includes('price') ||
            lowerMessage.includes('cost') ||
            lowerMessage.includes('стоимость') ||
            lowerMessage.includes('narxi')) {
            return IntentType.PRICING_INQUIRY;
        }
        if (lowerMessage.includes('available') ||
            lowerMessage.includes('in stock') ||
            lowerMessage.includes('есть') ||
            lowerMessage.includes('bor')) {
            return IntentType.AVAILABILITY_CHECK;
        }
        if (lowerMessage.includes('problem') ||
            lowerMessage.includes('issue') ||
            lowerMessage.includes('проблема') ||
            lowerMessage.includes('muammo')) {
            return IntentType.COMPLAINT;
        }
        if (lowerMessage.includes('status') ||
            lowerMessage.includes('where') ||
            lowerMessage.includes('статус') ||
            lowerMessage.includes('holat')) {
            return IntentType.ORDER_STATUS;
        }
        return IntentType.UNKNOWN;
    }
    calculateConfidence(intent, messages) {
        let confidence = 0.5;
        if (intent !== IntentType.UNKNOWN) {
            confidence += 0.3;
        }
        if (messages.length > 3) {
            confidence += 0.2;
        }
        return Math.min(confidence, 1.0);
    }
    determineNextState(currentState, intent) {
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
    generateConversationSummary(messages) {
        if (messages.length === 0)
            return 'New conversation started';
        const recentMessages = messages.slice(0, 5).reverse();
        const summary = recentMessages
            .map((msg) => `${msg.sender}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`)
            .join(' | ');
        return summary;
    }
    analyzeCustomerPreferences(orders) {
        const totalOrders = orders.length;
        const hasMultipleOrders = totalOrders > 1;
        return {
            communicationStyle: hasMultipleOrders ? 'friendly' : 'formal',
            preferredLanguage: 'uz',
            responseSpeed: hasMultipleOrders ? 'normal' : 'detailed',
            productInterests: this.extractFavoriteCategories(orders),
        };
    }
    calculateRelationshipScore(orders) {
        if (orders.length === 0)
            return 0;
        let score = orders.length * 10;
        const recentOrders = orders.filter((order) => {
            const daysSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceOrder < 30;
        });
        score += recentOrders.length * 5;
        const totalValue = orders.reduce((sum, order) => sum + order.details?.total || 0, 0);
        score += Math.min(totalValue / 100, 50);
        return Math.min(score, 100);
    }
    extractFavoriteCategories(orders) {
        const categories = new Map();
        orders.forEach((order) => {
            const items = order.details?.items || '';
            if (items.includes('clothing') ||
                items.includes('одежда') ||
                items.includes('kiyim'))
                categories.set('clothing', (categories.get('clothing') || 0) + 1);
            if (items.includes('food') ||
                items.includes('еда') ||
                items.includes('ovqat'))
                categories.set('food', (categories.get('food') || 0) + 1);
            if (items.includes('electronics') ||
                items.includes('электроника') ||
                items.includes('elektronika'))
                categories.set('electronics', (categories.get('electronics') || 0) + 1);
        });
        return Array.from(categories.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);
    }
    async clearContext(conversationId, customerId) {
        const cacheKey = `${conversationId}:${customerId}`;
        this.contextCache.delete(cacheKey);
    }
    async getContextStats() {
        return {
            activeConversations: this.contextCache.size,
            cacheSize: this.contextCache.size,
        };
    }
    async getLanguageDistribution() {
        const distribution = {};
        for (const context of this.contextCache.values()) {
            const lang = context.languageContext.detectedLanguage.code;
            distribution[lang] = (distribution[lang] || 0) + 1;
        }
        return distribution;
    }
    async getMemoryInsights(conversationId, customerId) {
        return await this.conversationMemoryService.getMemoryInsights(conversationId, customerId);
    }
    async getConversationSummary(conversationId, customerId) {
        return await this.conversationMemoryService.getConversationSummary(conversationId, customerId);
    }
};
exports.ConversationContextService = ConversationContextService;
exports.ConversationContextService = ConversationContextService = ConversationContextService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        language_detection_service_1.LanguageDetectionService,
        conversation_memory_service_1.ConversationMemoryService])
], ConversationContextService);
//# sourceMappingURL=conversation-context.service.js.map
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
    logger = new common_1.Logger(ConversationContextService_1.name);
    contextCache = new Map();
    constructor(prisma) {
        this.prisma = prisma;
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
        const customerProfile = await this.buildCustomerProfile(customerId, conversationId);
        const currentState = this.analyzeConversationState(messages);
        const intent = this.detectIntent(messages[messages.length - 1]?.content || '');
        const confidence = this.calculateConfidence(intent, messages);
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
        };
        this.contextCache.set(cacheKey, context);
        return context;
    }
    async updateContext(conversationId, customerId, newMessage, isUserMessage) {
        const context = await this.getOrCreateContext(conversationId, customerId);
        context.lastInteraction = new Date();
        context.messageCount++;
        if (isUserMessage) {
            context.intent = this.detectIntent(newMessage);
            context.confidence = this.calculateConfidence(context.intent, []);
            context.currentState = this.determineNextState(context.currentState, context.intent);
        }
        const messages = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        context.conversationSummary = this.generateConversationSummary(messages);
        return context;
    }
    async buildCustomerProfile(customerId, conversationId) {
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
        const preferences = this.analyzeCustomerPreferences(orders);
        const relationshipScore = this.calculateRelationshipScore(orders);
        const averageOrderValue = orders.length > 0
            ? orders.reduce((sum, order) => sum + order.details?.total || 0, 0) / orders.length
            : 0;
        const favoriteCategories = this.extractFavoriteCategories(orders);
        return {
            name: undefined,
            phone: undefined,
            email: undefined,
            language: 'uz',
            preferences,
            relationshipScore,
            totalOrders: orders.length,
            averageOrderValue,
            lastOrderDate: orders[0]?.createdAt,
            favoriteCategories,
        };
    }
    analyzeConversationState(messages) {
        if (messages.length === 0)
            return ConversationState.GREETING;
        const lastMessage = messages[0].content.toLowerCase();
        const messageCount = messages.length;
        if (messageCount === 1)
            return ConversationState.GREETING;
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
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
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
        const summary = recentMessages.map(msg => `${msg.sender}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`).join(' | ');
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
        const recentOrders = orders.filter(order => {
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
        orders.forEach(order => {
            const items = order.details?.items || '';
            if (items.includes('clothing') || items.includes('одежда'))
                categories.set('clothing', (categories.get('clothing') || 0) + 1);
            if (items.includes('food') || items.includes('еда'))
                categories.set('food', (categories.get('food') || 0) + 1);
            if (items.includes('electronics') || items.includes('электроника'))
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
};
exports.ConversationContextService = ConversationContextService;
exports.ConversationContextService = ConversationContextService = ConversationContextService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationContextService);
//# sourceMappingURL=conversation-context.service.js.map
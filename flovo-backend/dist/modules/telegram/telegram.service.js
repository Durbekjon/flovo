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
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const gemini_service_1 = require("../../core/gemini/gemini.service");
const users_service_1 = require("../users/users.service");
const orders_service_1 = require("../orders/orders.service");
const conversation_context_service_1 = require("../../core/conversation/conversation-context.service");
let TelegramService = TelegramService_1 = class TelegramService {
    prisma;
    geminiService;
    usersService;
    ordersService;
    conversationContextService;
    logger = new common_1.Logger(TelegramService_1.name);
    constructor(prisma, geminiService, usersService, ordersService, conversationContextService) {
        this.prisma = prisma;
        this.geminiService = geminiService;
        this.usersService = usersService;
        this.ordersService = ordersService;
        this.conversationContextService = conversationContextService;
    }
    async processUpdate(webhookData) {
        try {
            const { message, callback_query } = webhookData;
            if (!message && !callback_query) {
                this.logger.warn('No message or callback_query in webhook data');
                return;
            }
            const update = message || callback_query;
            const chatId = update.chat.id.toString();
            const userId = update.from.id.toString();
            const text = message?.text || callback_query?.data || '';
            const bot = await this.findBotForChat(chatId);
            if (!bot) {
                this.logger.warn(`No bot found for chat ${chatId}`);
                return;
            }
            let conversation = await this.prisma.conversation.findUnique({
                where: { id: chatId },
                include: { messages: true },
            });
            if (!conversation) {
                conversation = await this.prisma.conversation.create({
                    data: {
                        id: chatId,
                        botId: bot.id,
                    },
                    include: { messages: true },
                });
            }
            const userMessage = await this.prisma.message.create({
                data: {
                    content: text,
                    sender: 'USER',
                    conversationId: chatId,
                },
            });
            const conversationContext = await this.conversationContextService.getOrCreateContext(chatId, userId);
            await this.conversationContextService.updateContext(conversationContext, {
                lastMessage: text,
                timestamp: new Date(),
                sender: 'USER',
            });
            const recentMessages = await this.prisma.message.findMany({
                where: { conversationId: chatId },
                orderBy: { createdAt: 'desc' },
                take: 15,
            });
            const aiResponse = await this.processWithEnhancedAI(text, recentMessages.reverse(), conversationContext, bot);
            const botMessage = await this.prisma.message.create({
                data: {
                    content: aiResponse.message,
                    sender: 'BOT',
                    conversationId: chatId,
                },
            });
            await this.conversationContextService.updateContext(conversationContext, {
                lastMessage: aiResponse.message,
                timestamp: new Date(),
                sender: 'BOT',
                intent: aiResponse.intent,
                confidence: aiResponse.confidence,
            });
            await this.sendTelegramMessage(chatId, aiResponse.message, bot.token);
            this.logConversationAnalytics(conversation, aiResponse, text);
        }
        catch (error) {
            this.logger.error('Error processing Telegram update:', error);
            throw error;
        }
    }
    async findBotForChat(chatId) {
        const bots = await this.prisma.bot.findMany({
            where: { isEnabled: true },
        });
        if (bots.length === 0) {
            return null;
        }
        const bot = await this.usersService.getBotByUserId(bots[0].userId);
        return bot;
    }
    async processWithEnhancedAI(userText, messageHistory, conversationContext, bot) {
        try {
            const conversationHistory = messageHistory.map((msg) => ({
                role: msg.sender === 'USER' ? 'user' : 'assistant',
                content: msg.content,
                timestamp: msg.createdAt,
            }));
            const aiResponse = await this.geminiService.generateResponse(userText, conversationHistory, conversationContext);
            if (aiResponse.intent === 'CREATE_ORDER') {
                await this.handleOrderIntent(conversationContext, userText, aiResponse);
            }
            else if (aiResponse.intent === 'FETCH_ORDERS') {
                await this.handleFetchOrdersIntent(conversationContext, aiResponse);
            }
            else if (aiResponse.intent === 'CUSTOMER_SERVICE') {
                await this.handleCustomerServiceIntent(conversationContext, userText, aiResponse);
            }
            else if (aiResponse.intent === 'SALES_OPPORTUNITY') {
                await this.handleSalesOpportunityIntent(conversationContext, userText, aiResponse);
            }
            return aiResponse;
        }
        catch (error) {
            this.logger.error('Error processing with AI:', error);
            return {
                message: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
                intent: 'GENERAL',
                confidence: 0.5,
            };
        }
    }
    async handleOrderIntent(conversationContext, userText, aiResponse) {
        try {
            const orderData = this.extractOrderData(userText, aiResponse);
            if (orderData) {
                const order = await this.ordersService.createOrder({
                    customerName: orderData.customerName,
                    customerContact: orderData.customerContact,
                    customerAddress: orderData.customerAddress,
                    details: orderData.details,
                    userId: conversationContext.userId,
                });
                await this.conversationContextService.updateContext(conversationContext, {
                    totalOrders: (conversationContext.totalOrders || 0) + 1,
                    lastOrderDate: new Date(),
                    lastOrderAmount: orderData.details.total,
                });
                this.logger.log(`Order created: ${order.id} for user ${conversationContext.userId}`);
            }
        }
        catch (error) {
            this.logger.error('Error handling order intent:', error);
        }
    }
    async handleFetchOrdersIntent(conversationContext, aiResponse) {
        try {
            const orders = await this.ordersService.getOrdersWithPagination(conversationContext.userId, 1, 5);
            const relationshipScore = conversationContext.relationshipScore || 0;
            if (relationshipScore > 0.7) {
                aiResponse.message +=
                    "\n\nI've found your recent orders. As a valued customer, I'm here to help with anything you need!";
            }
        }
        catch (error) {
            this.logger.error('Error handling fetch orders intent:', error);
        }
    }
    async handleCustomerServiceIntent(conversationContext, userText, aiResponse) {
        try {
            this.logger.log(`Customer service request from ${conversationContext.customerId}: ${userText}`);
            await this.conversationContextService.updateContext(conversationContext, {
                customerServiceRequests: (conversationContext.customerServiceRequests || 0) + 1,
                lastCustomerServiceRequest: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Error handling customer service intent:', error);
        }
    }
    async handleSalesOpportunityIntent(conversationContext, userText, aiResponse) {
        try {
            this.logger.log(`Sales opportunity identified for ${conversationContext.customerId}: ${userText}`);
            await this.conversationContextService.updateContext(conversationContext, {
                salesOpportunities: (conversationContext.salesOpportunities || 0) + 1,
                lastSalesOpportunity: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Error handling sales opportunity intent:', error);
        }
    }
    extractOrderData(userText, aiResponse) {
        try {
            const orderMatch = userText.match(/order|buy|purchase/i);
            if (orderMatch) {
                return {
                    customerName: 'Customer',
                    customerContact: 'telegram',
                    customerAddress: 'Not specified',
                    details: {
                        items: ['Product'],
                        total: 100,
                        currency: 'USD',
                    },
                };
            }
            return null;
        }
        catch (error) {
            this.logger.error('Error extracting order data:', error);
            return null;
        }
    }
    async sendTelegramMessage(chatId, message, botToken) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML',
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                this.logger.error(`Failed to send Telegram message: ${error.description}`);
            }
        }
        catch (error) {
            this.logger.error('Error sending Telegram message:', error);
        }
    }
    logConversationAnalytics(conversation, aiResponse, userText) {
        this.logger.log(`Conversation ${conversation.id}: Intent=${aiResponse.intent}, Confidence=${aiResponse.confidence}, UserText="${userText.substring(0, 50)}..."`);
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gemini_service_1.GeminiService,
        users_service_1.UsersService,
        orders_service_1.OrdersService,
        conversation_context_service_1.ConversationContextService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map
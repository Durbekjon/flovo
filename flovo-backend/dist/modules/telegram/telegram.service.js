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
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const encryption_service_1 = require("../../core/encryption/encryption.service");
const gemini_service_1 = require("../../core/gemini/gemini.service");
const retry_service_1 = require("../../core/retry/retry.service");
const orders_service_1 = require("../orders/orders.service");
const products_service_1 = require("../products/products.service");
let TelegramService = TelegramService_1 = class TelegramService {
    prisma;
    encryption;
    configService;
    geminiService;
    retryService;
    ordersService;
    productsService;
    logger = new common_1.Logger(TelegramService_1.name);
    processedUpdates = new Set();
    constructor(prisma, encryption, configService, geminiService, retryService, ordersService, productsService) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.configService = configService;
        this.geminiService = geminiService;
        this.retryService = retryService;
        this.ordersService = ordersService;
        this.productsService = productsService;
    }
    async processUpdate(webhookData) {
        this.logger.log(`Processing update: ${webhookData.update_id}`);
        if (this.processedUpdates.has(webhookData.update_id)) {
            this.logger.log(`Update ${webhookData.update_id} already processed, skipping`);
            return;
        }
        this.processedUpdates.add(webhookData.update_id);
        if (this.processedUpdates.size > 1000) {
            const sortedIds = Array.from(this.processedUpdates).sort((a, b) => a - b);
            const toDelete = sortedIds.slice(0, sortedIds.length - 1000);
            toDelete.forEach((id) => this.processedUpdates.delete(id));
        }
        if (!webhookData.message?.text) {
            this.logger.log('Ignoring non-text message');
            return;
        }
        const message = webhookData.message;
        const chatId = message.chat.id.toString();
        const userText = message.text;
        try {
            const bot = await this.findBotForChat(chatId);
            if (!bot) {
                this.logger.warn(`No bot found for chat ${chatId}`);
                return;
            }
            if (!bot.isEnabled) {
                this.logger.log(`Bot ${bot.id} is disabled, ignoring message from chat ${chatId}`);
                return;
            }
            const messageDate = new Date(message.date * 1000);
            const currentTime = new Date();
            const timeDifference = currentTime.getTime() - messageDate.getTime();
            const maxAgeMinutes = this.configService.get('MAX_MESSAGE_AGE_MINUTES') || 5;
            if (timeDifference > maxAgeMinutes * 60 * 1000) {
                this.logger.log(`Ignoring old message from chat ${chatId}. Message age: ${Math.round(timeDifference / 1000 / 60)} minutes (max: ${maxAgeMinutes} minutes)`);
                return;
            }
            if (bot.updatedAt && messageDate < bot.updatedAt) {
                this.logger.log(`Ignoring message from chat ${chatId} that arrived before bot was enabled. Message: ${messageDate.toISOString()}, Bot enabled: ${bot.updatedAt.toISOString()}`);
                return;
            }
            const conversation = await this.ensureConversation(chatId, bot.id);
            await this.saveMessage(conversation.id, userText || '', 'USER');
            const history = await this.getConversationHistory(conversation.id, 10);
            const aiResponse = await this.processWithAI(userText || '', history, bot);
            await this.saveMessage(conversation.id, aiResponse, 'BOT');
            await this.sendTelegramReply(chatId, aiResponse);
            this.logger.log(`Successfully processed message from chat ${chatId}`);
        }
        catch (error) {
            this.logger.error(`Error processing update: ${error.message}`, error.stack);
        }
    }
    async findBotForChat(chatId) {
        return this.prisma.bot.findFirst({
            where: { isEnabled: true },
        });
    }
    async ensureConversation(chatId, botId) {
        return this.prisma.conversation.upsert({
            where: { id: chatId },
            update: {},
            create: {
                id: chatId,
                botId,
            },
        });
    }
    async saveMessage(conversationId, content, sender) {
        return this.prisma.message.create({
            data: {
                conversationId,
                content,
                sender,
            },
        });
    }
    async getConversationHistory(conversationId, limit = 10) {
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async processWithAI(userText, history, bot) {
        this.logger.log(`Processing AI request for: "${userText}"`);
        const productContext = await this.productsService.getProductsForAI(bot.userId);
        const userOrders = await this.ordersService.getOrdersByUser(bot.userId);
        const aiResponse = await this.geminiService.generateResponse(userText, history, productContext, userOrders);
        if (aiResponse.intent === 'CREATE_ORDER' && aiResponse.orderData) {
            await this.handleOrderIntent(aiResponse.orderData, bot.userId);
        }
        if (aiResponse.intent === 'FETCH_ORDERS' && aiResponse.shouldFetchOrders) {
            return await this.handleFetchOrdersIntent(bot.userId);
        }
        return aiResponse.text;
    }
    async handleOrderIntent(orderData, userId) {
        this.logger.log(`Processing order intent for user ${userId}:`, orderData);
        try {
            const order = await this.ordersService.createOrderFromIntent(userId, orderData);
            this.logger.log(`Order created successfully: ${order.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create order: ${error.message}`, error.stack);
        }
    }
    async handleFetchOrdersIntent(userId) {
        this.logger.log(`Fetching orders for user ${userId}`);
        try {
            const orders = await this.ordersService.getOrdersByUser(userId);
            if (orders.length === 0) {
                return "You haven't placed any orders with us yet. Ready to make your first purchase? I'd be happy to help you find something great!";
            }
            const ordersList = orders
                .slice(0, 5)
                .map((order) => {
                const status = order.status.toLowerCase();
                const date = new Date(order.createdAt).toLocaleDateString();
                const details = order.details;
                const items = details?.items || 'N/A';
                return `• Order #${order.id}: ${items} (${status}) - ${date}`;
            })
                .join('\n');
            const response = `Here are your recent orders:\n\n${ordersList}`;
            if (orders.length > 5) {
                return (response +
                    `\n\n...and ${orders.length - 5} more orders. Is there anything specific you'd like to know about any of these?`);
            }
            return response + `\n\nIs there anything else I can help you with today?`;
        }
        catch (error) {
            this.logger.error(`Failed to fetch orders: ${error.message}`, error.stack);
            return "Oops! I'm having trouble accessing your orders right now. Can you try asking again in a moment?";
        }
    }
    async sendTelegramReply(chatId, text) {
        try {
            const bot = await this.prisma.bot.findFirst({
                where: { isEnabled: true },
            });
            if (!bot) {
                this.logger.error('No enabled bot found for sending reply');
                return;
            }
            const botToken = this.encryption.decrypt(bot.token);
            await this.retryService.executeWithRetry(async () => {
                const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: text,
                        parse_mode: 'HTML',
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`Telegram API error: ${response.status} - ${errorData}`);
                }
                const result = await response.json();
                this.logger.log(`Message sent successfully to chat ${chatId}, message_id: ${result.result?.message_id}`);
                return result;
            }, {
                maxAttempts: 3,
                baseDelay: 1000,
                maxDelay: 5000,
            });
        }
        catch (error) {
            this.logger.error(`Failed to send Telegram reply to chat ${chatId} after retries: ${error.message}`, error.stack);
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        config_1.ConfigService,
        gemini_service_1.GeminiService,
        retry_service_1.RetryService,
        orders_service_1.OrdersService,
        products_service_1.ProductsService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map
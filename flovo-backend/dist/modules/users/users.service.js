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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const encryption_service_1 = require("../../core/encryption/encryption.service");
const config_1 = require("@nestjs/config");
let UsersService = class UsersService {
    prisma;
    encryption;
    logger;
    configService;
    constructor(prisma, encryption, logger, configService) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.logger = logger;
        this.configService = configService;
    }
    async connectBot(userId, dto) {
        const existingBot = await this.prisma.bot.findUnique({
            where: { userId },
        });
        if (existingBot) {
            throw new common_1.ConflictException('User already has a bot connected');
        }
        if (!this.isValidBotToken(dto.token)) {
            throw new common_1.BadRequestException('Invalid bot token format');
        }
        await this.validateBotToken(dto.token);
        const encryptedToken = this.encryption.encrypt(dto.token);
        const bot = await this.prisma.bot.create({
            data: {
                token: encryptedToken,
                userId,
                isEnabled: true,
            },
        });
        return bot;
    }
    async getBotByUser(userId) {
        return this.prisma.bot.findUnique({
            where: { userId },
        });
    }
    isValidBotToken(token) {
        const tokenPattern = /^\d+:[A-Za-z0-9_-]{35,}$/;
        return tokenPattern.test(token);
    }
    async validateBotToken(token) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new common_1.BadRequestException('Invalid bot token: Telegram API rejected the token');
            }
            const data = await response.json();
            if (!data.ok || !data.result?.is_bot) {
                throw new common_1.BadRequestException('Invalid bot token: Not a valid bot');
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Unable to validate bot token with Telegram API');
        }
    }
    async getBot(userId) {
        const bot = await this.prisma.bot.findUnique({
            where: { userId },
        });
        return { bot };
    }
    async setBotStatus(userId, isEnabled) {
        const currentBot = await this.prisma.bot.findUnique({
            where: { userId },
        });
        if (!currentBot) {
            throw new Error('Bot not found');
        }
        const botToken = this.encryption.decrypt(currentBot.token);
        await this.manageTelegramWebhook(botToken, isEnabled);
        const bot = await this.prisma.bot.update({
            where: { userId },
            data: {
                isEnabled,
                updatedAt: new Date(),
            },
        });
        this.logger.log(`Bot status updated for user ${userId}: ${isEnabled ? 'enabled' : 'disabled'}`);
        return { bot };
    }
    async manageTelegramWebhook(botToken, enable) {
        const baseUrl = `https://api.telegram.org/bot${botToken}`;
        if (enable) {
            const webhookUrl = this.getWebhookUrl();
            const setWebhookUrl = `${baseUrl}/setWebhook`;
            this.logger.log(`Setting webhook to: ${webhookUrl}`);
            const response = await fetch(setWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: webhookUrl }),
            });
            const result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(`Failed to set webhook: ${result.description || 'Unknown error'}`);
            }
            this.logger.log('Webhook set successfully');
        }
        else {
            const deleteWebhookUrl = `${baseUrl}/deleteWebhook`;
            this.logger.log('Removing webhook...');
            const response = await fetch(deleteWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (!response.ok || !result.ok) {
                this.logger.warn(`Failed to remove webhook: ${result.description || 'Unknown error'}`);
            }
            else {
                this.logger.log('Webhook removed successfully');
            }
        }
    }
    getWebhookUrl() {
        const webhookUrl = this.configService.get('WEBHOOK_URL');
        if (webhookUrl) {
            return `${webhookUrl}/telegram/webhook`;
        }
        const allowedOrigins = this.configService.get('ALLOWED_ORIGINS');
        if (allowedOrigins) {
            const origins = allowedOrigins.split(',');
            const firstOrigin = origins[0].trim();
            if (firstOrigin && firstOrigin !== '*') {
                return `${firstOrigin}/telegram/webhook`;
            }
        }
        throw new Error('WEBHOOK_URL or specific ALLOWED_ORIGINS must be configured');
    }
    async toggleBotStatus(userId) {
        const currentBot = await this.prisma.bot.findUnique({
            where: { userId },
        });
        if (!currentBot) {
            throw new Error('Bot not found');
        }
        return this.setBotStatus(userId, !currentBot.isEnabled);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        common_1.Logger,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map
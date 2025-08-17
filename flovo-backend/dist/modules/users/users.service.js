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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const encryption_service_1 = require("../../core/encryption/encryption.service");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    encryptionService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma, encryptionService) {
        this.prisma = prisma;
        this.encryptionService = encryptionService;
    }
    async connectBot(userId, createBotDto) {
        try {
            const encryptedToken = await this.encryptionService.encrypt(createBotDto.token);
            const existingBot = await this.prisma.bot.findUnique({
                where: { userId },
            });
            if (existingBot) {
                return await this.prisma.bot.update({
                    where: { userId },
                    data: {
                        token: encryptedToken,
                        isEnabled: true,
                        updatedAt: new Date(),
                    },
                });
            }
            else {
                return await this.prisma.bot.create({
                    data: {
                        token: encryptedToken,
                        userId,
                        isEnabled: true,
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to connect bot for user ${userId}:`, error);
            throw error;
        }
    }
    async getBotByUserId(userId) {
        try {
            const bot = await this.prisma.bot.findUnique({
                where: { userId },
            });
            if (!bot) {
                return null;
            }
            const decryptedToken = await this.encryptionService.decrypt(bot.token);
            return {
                ...bot,
                token: decryptedToken,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get bot for user ${userId}:`, error);
            throw error;
        }
    }
    async getBotByToken(token) {
        try {
            const bots = await this.prisma.bot.findMany();
            for (const bot of bots) {
                try {
                    const decryptedToken = await this.encryptionService.decrypt(bot.token);
                    if (decryptedToken === token) {
                        return {
                            ...bot,
                            token: decryptedToken,
                        };
                    }
                }
                catch (error) {
                    continue;
                }
            }
            return null;
        }
        catch (error) {
            this.logger.error('Failed to get bot by token:', error);
            throw error;
        }
    }
    async updateBotStatus(userId, isEnabled) {
        try {
            return await this.prisma.bot.update({
                where: { userId },
                data: {
                    isEnabled,
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update bot status for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], UsersService);
//# sourceMappingURL=users.service.js.map
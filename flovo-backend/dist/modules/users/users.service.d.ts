import { Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EncryptionService } from '../../core/encryption/encryption.service';
import { ConnectBotDto } from './dto/connect-bot.dto';
import type { Bot } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class UsersService {
    private readonly prisma;
    private readonly encryption;
    private readonly logger;
    private readonly configService;
    constructor(prisma: PrismaService, encryption: EncryptionService, logger: Logger, configService: ConfigService);
    connectBot(userId: number, dto: ConnectBotDto): Promise<Bot>;
    getBotByUser(userId: number): Promise<Bot | null>;
    private isValidBotToken;
    private validateBotToken;
    getBot(userId: number): Promise<{
        bot: Bot | null;
    }>;
    setBotStatus(userId: number, isEnabled: boolean): Promise<{
        bot: Bot;
    }>;
    private manageTelegramWebhook;
    private getWebhookUrl;
    toggleBotStatus(userId: number): Promise<{
        bot: Bot;
    }>;
}

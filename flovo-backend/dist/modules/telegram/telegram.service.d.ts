import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EncryptionService } from '../../core/encryption/encryption.service';
import { GeminiService } from '../../core/gemini/gemini.service';
import { RetryService } from '../../core/retry/retry.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { TelegramWebhookDto } from './dto/telegram-webhook.dto';
export declare class TelegramService {
    private readonly prisma;
    private readonly encryption;
    private readonly configService;
    private readonly geminiService;
    private readonly retryService;
    private readonly ordersService;
    private readonly productsService;
    private readonly logger;
    private readonly processedUpdates;
    constructor(prisma: PrismaService, encryption: EncryptionService, configService: ConfigService, geminiService: GeminiService, retryService: RetryService, ordersService: OrdersService, productsService: ProductsService);
    processUpdate(webhookData: TelegramWebhookDto): Promise<void>;
    private findBotForChat;
    private ensureConversation;
    private saveMessage;
    private getConversationHistory;
    private processWithAI;
    private handleOrderIntent;
    private handleFetchOrdersIntent;
    private sendTelegramReply;
}

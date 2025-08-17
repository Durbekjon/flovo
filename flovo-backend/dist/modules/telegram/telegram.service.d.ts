import { PrismaService } from '../../core/prisma/prisma.service';
import { GeminiService } from '../../core/gemini/gemini.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { ConversationContextService } from '../../core/conversation/conversation-context.service';
import type { TelegramWebhookDto } from './dto/telegram-webhook.dto';
export declare class TelegramService {
    private readonly prisma;
    private readonly geminiService;
    private readonly usersService;
    private readonly ordersService;
    private readonly conversationContextService;
    private readonly logger;
    constructor(prisma: PrismaService, geminiService: GeminiService, usersService: UsersService, ordersService: OrdersService, conversationContextService: ConversationContextService);
    processUpdate(webhookData: TelegramWebhookDto): Promise<void>;
    private findBotForChat;
    private processWithEnhancedAI;
    private handleOrderIntent;
    private handleFetchOrdersIntent;
    private handleCustomerServiceIntent;
    private handleSalesOpportunityIntent;
    private extractOrderData;
    private sendTelegramMessage;
    private logConversationAnalytics;
}

import { TelegramService } from './telegram.service';
import { TelegramWebhookDto } from './dto/telegram-webhook.dto';
export declare class TelegramController {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    handleWebhook(webhookData: TelegramWebhookDto): Promise<{
        status: string;
    }>;
}

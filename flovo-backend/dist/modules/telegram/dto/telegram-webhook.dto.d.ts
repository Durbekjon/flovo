export declare class TelegramUserDto {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}
export declare class TelegramChatDto {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
}
export declare class TelegramMessageDto {
    message_id: number;
    from: TelegramUserDto;
    chat: TelegramChatDto;
    date: number;
    text?: string;
}
export declare class TelegramWebhookDto {
    update_id: number;
    message?: TelegramMessageDto;
}

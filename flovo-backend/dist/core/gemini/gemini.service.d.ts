import { ConfigService } from '@nestjs/config';
import type { Message } from '@prisma/client';
export interface AiResponse {
    text: string;
    intent?: string;
    orderData?: any;
    shouldFetchOrders?: boolean;
}
export declare class GeminiService {
    private readonly configService;
    private readonly logger;
    private readonly genAI;
    constructor(configService: ConfigService);
    generateResponse(userText: string, conversationHistory: Message[], productContext?: string, userOrders?: any[]): Promise<AiResponse>;
    private buildPrompt;
    private parseResponse;
}

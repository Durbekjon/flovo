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
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let GeminiService = GeminiService_1 = class GeminiService {
    configService;
    logger = new common_1.Logger(GeminiService_1.name);
    genAI;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is required');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generateResponse(userText, conversationHistory, productContext, userOrders) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
            });
            const prompt = this.buildPrompt(userText, conversationHistory, productContext, userOrders);
            this.logger.log('Generating AI response...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const parsedResponse = this.parseResponse(text);
            this.logger.log(`AI response generated: ${text.substring(0, 100)}...`);
            return parsedResponse;
        }
        catch (error) {
            this.logger.error(`Error generating AI response: ${error.message}`, error.stack);
            return {
                text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
            };
        }
    }
    buildPrompt(userText, history, productContext, userOrders) {
        const recentHistory = history.slice(0, 6);
        const contextMessages = recentHistory
            .reverse()
            .map((msg) => `${msg.sender}: ${msg.content}`)
            .join('\n');
        const productInfo = productContext || 'No products are currently available in inventory.';
        return `You are Flovo, a friendly and helpful AI assistant for a business in Uzbekistan. You are warm, engaging, and speak like a real person.

PERSONALITY:
- Be friendly and conversational, like talking to a helpful friend
- Show enthusiasm and genuine interest in helping customers
- Use natural language and avoid robotic responses
- Be polite and respectful, but not overly formal
- Show personality and warmth in your responses

CRITICAL BUSINESS RULES:
1. NEVER lower prices or offer discounts unless explicitly authorized
2. Keep responses natural and conversational (not too long)
3. Stay on-topic - focus on products, orders, and business matters
4. Answer in the customer's language (Uzbek, Russian, or English)
5. Only sell products that are actually in stock
6. Be honest about availability - don't promise what you don't have

PRICING POLICY:
- Always quote the EXACT listed price from inventory
- NEVER lower prices, offer discounts, or negotiate prices
- If customer asks for discount, respond naturally: "I understand you're looking for a good deal! Unfortunately, our prices are fixed to ensure quality and fair service for everyone."
- Never suggest price reductions or special deals

CONVERSATION FLOW:
- Ask follow-up questions to keep the conversation engaging
- Don't repeat the same question multiple times
- If customer says "yes" to ordering, proceed with order details
- If customer seems unsure, offer to help with product information
- Be proactive in moving the conversation forward naturally
- Avoid repetitive responses - each message should feel fresh and relevant

EXAMPLE RESPONSES:
- "That sounds great! What's your name and phone number?"
- "Perfect! I'll help you with that. Can you tell me your contact details?"
- "Awesome! Let me get your order set up. What's your name?"
- "Great choice! I just need your contact information to complete the order."
- "Excellent! I've got that down. What's your phone number so we can reach you?"

CURRENT INVENTORY:
${productInfo}

${userOrders && userOrders.length > 0
            ? `CUSTOMER'S ORDER HISTORY:
${userOrders.map((order) => `- Order #${order.id}: ${order.details?.items || 'N/A'} (${order.status})`).join('\n')}`
            : ''}

SPECIAL INTENTS:
1. When customer wants to place an order for AVAILABLE products, use:
[INTENT:CREATE_ORDER]
{
  "customerName": "extracted name or 'Not provided'",
  "customerContact": "phone/email if provided or 'Not provided'", 
  "items": "description of what they want to order",
  "notes": "any special requests or details"
}

2. When customer asks about their orders, use:
[INTENT:FETCH_ORDERS]

IMPORTANT CONVERSATION RULES:
- If customer has already agreed to order something, don't ask again - proceed with order details
- If customer says "yes" to ordering, immediately create the order and confirm
- Don't repeat the same product suggestion multiple times
- If customer seems confused, ask clarifying questions instead of repeating
- Keep the conversation flowing naturally - don't get stuck in loops

Conversation History:
${contextMessages}

Customer: ${userText}

IMPORTANT: Read the conversation history carefully. If the customer has already agreed to order something or if you've already asked about ordering, don't repeat yourself. Move the conversation forward naturally.

Flovo:`;
    }
    parseResponse(aiText) {
        const orderMatch = aiText.match(/\[INTENT:CREATE_ORDER\]\s*(\{[\s\S]*?\})/);
        if (orderMatch) {
            try {
                const orderData = JSON.parse(orderMatch[1]);
                const responseText = aiText
                    .replace(/\[INTENT:CREATE_ORDER\][\s\S]*/, '')
                    .trim();
                return {
                    text: responseText ||
                        "Great! I've got your order down. What's your name and phone number so we can get in touch with you?",
                    intent: 'CREATE_ORDER',
                    orderData,
                };
            }
            catch (error) {
                this.logger.warn('Failed to parse order data from AI response');
            }
        }
        const fetchOrdersMatch = aiText.match(/\[INTENT:FETCH_ORDERS\]/);
        if (fetchOrdersMatch) {
            const responseText = aiText.replace(/\[INTENT:FETCH_ORDERS\]/, '').trim();
            return {
                text: responseText || 'Let me check your orders for you.',
                intent: 'FETCH_ORDERS',
                shouldFetchOrders: true,
            };
        }
        return {
            text: aiText,
        };
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map
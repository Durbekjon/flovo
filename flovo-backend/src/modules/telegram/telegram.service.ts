import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { GeminiService } from '../../core/gemini/gemini.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { ConversationContextService } from '../../core/conversation/conversation-context.service';
import type { TelegramWebhookDto } from './dto/telegram-webhook.dto';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly conversationContextService: ConversationContextService,
  ) {}

  async processUpdate(webhookData: TelegramWebhookDto) {
    try {
      const { message, callback_query } = webhookData;

      if (!message && !callback_query) {
        this.logger.warn('No message or callback_query in webhook data');
        return;
      }

      const update = message || callback_query;
      const chatId = update.chat.id.toString();
      const userId = update.from.id.toString();
      const text = message?.text || callback_query?.data || '';

      // Find bot by token (in production, you'd get this from the webhook URL)
      const bot = await this.findBotForChat(chatId);
      if (!bot) {
        this.logger.warn(`No bot found for chat ${chatId}`);
        return;
      }

      // Get or create conversation
      let conversation = await this.prisma.conversation.findUnique({
        where: { id: chatId },
        include: { messages: true },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            id: chatId,
            botId: bot.id,
          },
          include: { messages: true },
        });
      }

      // Save user message immediately
      const userMessage = await this.prisma.message.create({
        data: {
          content: text,
          sender: 'USER',
          conversationId: chatId,
        },
      });

      // Get conversation context
      const conversationContext =
        await this.conversationContextService.getOrCreateContext(
          chatId,
          userId,
        );

      // Update context with new message
      await this.conversationContextService.updateContext(conversationContext, {
        lastMessage: text,
        timestamp: new Date(),
        sender: 'USER',
      });

      // Retrieve last 10-15 messages for context (as specified)
      const recentMessages = await this.prisma.message.findMany({
        where: { conversationId: chatId },
        orderBy: { createdAt: 'desc' },
        take: 15, // As specified in requirements
      });

      // Process with enhanced AI
      const aiResponse = await this.processWithEnhancedAI(
        text,
        recentMessages.reverse(), // Reverse to get chronological order
        conversationContext,
        bot,
      );

      // Save bot response
      const botMessage = await this.prisma.message.create({
        data: {
          content: aiResponse.message,
          sender: 'BOT',
          conversationId: chatId,
        },
      });

      // Update context with bot response
      await this.conversationContextService.updateContext(conversationContext, {
        lastMessage: aiResponse.message,
        timestamp: new Date(),
        sender: 'BOT',
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
      });

      // Send response back to user
      await this.sendTelegramMessage(chatId, aiResponse.message, bot.token);

      // Log conversation analytics
      this.logConversationAnalytics(conversation, aiResponse, text);
    } catch (error) {
      this.logger.error('Error processing Telegram update:', error);
      throw error;
    }
  }

  private async findBotForChat(chatId: string) {
    // In a real implementation, you'd get the bot token from the webhook URL
    // For now, we'll find the first available bot
    const bots = await this.prisma.bot.findMany({
      where: { isEnabled: true },
    });

    if (bots.length === 0) {
      return null;
    }

    // Get the decrypted token for the first bot
    const bot = await this.usersService.getBotByUserId(bots[0].userId);
    return bot;
  }

  private async processWithEnhancedAI(
    userText: string,
    messageHistory: any[],
    conversationContext: any,
    bot: any,
  ) {
    try {
      // Build conversation history for AI
      const conversationHistory = messageHistory.map((msg) => ({
        role: msg.sender === 'USER' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.createdAt,
      }));

      // Process with AI
      const aiResponse = await this.geminiService.generateResponse(
        userText,
        conversationHistory,
        conversationContext,
      );

      // Handle specific intents
      if (aiResponse.intent === 'CREATE_ORDER') {
        await this.handleOrderIntent(conversationContext, userText, aiResponse);
      } else if (aiResponse.intent === 'FETCH_ORDERS') {
        await this.handleFetchOrdersIntent(conversationContext, aiResponse);
      } else if (aiResponse.intent === 'CUSTOMER_SERVICE') {
        await this.handleCustomerServiceIntent(
          conversationContext,
          userText,
          aiResponse,
        );
      } else if (aiResponse.intent === 'SALES_OPPORTUNITY') {
        await this.handleSalesOpportunityIntent(
          conversationContext,
          userText,
          aiResponse,
        );
      }

      return aiResponse;
    } catch (error) {
      this.logger.error('Error processing with AI:', error);
      // Return fallback response
      return {
        message:
          "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        intent: 'GENERAL',
        confidence: 0.5,
      };
    }
  }

  private async handleOrderIntent(
    conversationContext: any,
    userText: string,
    aiResponse: any,
  ) {
    try {
      // Extract order details from AI response or user text
      const orderData = this.extractOrderData(userText, aiResponse);

      if (orderData) {
        const order = await this.ordersService.createOrder({
          customerName: orderData.customerName,
          customerContact: orderData.customerContact,
          customerAddress: orderData.customerAddress,
          details: orderData.details,
          userId: conversationContext.userId,
        });

        // Update conversation context with order information
        await this.conversationContextService.updateContext(
          conversationContext,
          {
            totalOrders: (conversationContext.totalOrders || 0) + 1,
            lastOrderDate: new Date(),
            lastOrderAmount: orderData.details.total,
          },
        );

        this.logger.log(
          `Order created: ${order.id} for user ${conversationContext.userId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling order intent:', error);
    }
  }

  private async handleFetchOrdersIntent(
    conversationContext: any,
    aiResponse: any,
  ) {
    try {
      const orders = await this.ordersService.getOrdersWithPagination(
        conversationContext.userId,
        1,
        5,
      );

      // Add personalized message based on relationship score
      const relationshipScore = conversationContext.relationshipScore || 0;
      if (relationshipScore > 0.7) {
        aiResponse.message +=
          "\n\nI've found your recent orders. As a valued customer, I'm here to help with anything you need!";
      }
    } catch (error) {
      this.logger.error('Error handling fetch orders intent:', error);
    }
  }

  private async handleCustomerServiceIntent(
    conversationContext: any,
    userText: string,
    aiResponse: any,
  ) {
    try {
      // Log customer service interaction
      this.logger.log(
        `Customer service request from ${conversationContext.customerId}: ${userText}`,
      );

      // Update conversation context
      await this.conversationContextService.updateContext(conversationContext, {
        customerServiceRequests:
          (conversationContext.customerServiceRequests || 0) + 1,
        lastCustomerServiceRequest: new Date(),
      });
    } catch (error) {
      this.logger.error('Error handling customer service intent:', error);
    }
  }

  private async handleSalesOpportunityIntent(
    conversationContext: any,
    userText: string,
    aiResponse: any,
  ) {
    try {
      // Log sales opportunity
      this.logger.log(
        `Sales opportunity identified for ${conversationContext.customerId}: ${userText}`,
      );

      // Update conversation context
      await this.conversationContextService.updateContext(conversationContext, {
        salesOpportunities: (conversationContext.salesOpportunities || 0) + 1,
        lastSalesOpportunity: new Date(),
      });
    } catch (error) {
      this.logger.error('Error handling sales opportunity intent:', error);
    }
  }

  private extractOrderData(userText: string, aiResponse: any) {
    // Simple order data extraction - in production, this would be more sophisticated
    try {
      // Look for order details in AI response or user text
      const orderMatch = userText.match(/order|buy|purchase/i);
      if (orderMatch) {
        return {
          customerName: 'Customer', // Would extract from context
          customerContact: 'telegram', // Would extract from context
          customerAddress: 'Not specified',
          details: {
            items: ['Product'],
            total: 100, // Would extract from text
            currency: 'USD',
          },
        };
      }
      return null;
    } catch (error) {
      this.logger.error('Error extracting order data:', error);
      return null;
    }
  }

  private async sendTelegramMessage(
    chatId: string,
    message: string,
    botToken: string,
  ) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        this.logger.error(
          `Failed to send Telegram message: ${error.description}`,
        );
      }
    } catch (error) {
      this.logger.error('Error sending Telegram message:', error);
    }
  }

  private logConversationAnalytics(
    conversation: any,
    aiResponse: any,
    userText: string,
  ) {
    this.logger.log(
      `Conversation ${conversation.id}: Intent=${aiResponse.intent}, Confidence=${aiResponse.confidence}, UserText="${userText.substring(0, 50)}..."`,
    );
  }
}

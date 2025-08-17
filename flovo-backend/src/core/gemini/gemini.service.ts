import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message } from '@prisma/client';
import {
  ConversationContextService,
  ConversationContext,
  ConversationState,
} from '../conversation/conversation-context.service';
import { LanguageDetectionService } from '../language/language-detection.service';
import { ConversationMemoryService } from '../memory/conversation-memory.service';

export interface AiResponse {
  text: string;
  intent?: string;
  orderData?: any;
  shouldFetchOrders?: boolean;
  confidence?: number;
  suggestedActions?: string[];
  emotionalTone?: 'friendly' | 'professional' | 'empathetic' | 'enthusiastic';
  followUpQuestions?: string[];
  culturalAdaptations?: string[];
  languageUsed?: string;
  memoryInsights?: string[];
  learningRecommendations?: string[];
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly conversationContextService: ConversationContextService,
    private readonly languageDetectionService: LanguageDetectionService,
    private readonly conversationMemoryService: ConversationMemoryService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(
    userText: string,
    conversationHistory: Message[],
    productContext?: string,
    userOrders?: any[],
    conversationContext?: ConversationContext,
  ): Promise<AiResponse> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      const prompt = this.buildAdvancedPrompt(
        userText,
        conversationHistory,
        productContext,
        userOrders,
        conversationContext,
      );

      this.logger.log(
        'Generating AI response with advanced prompt engineering, cultural adaptation, and memory integration...',
      );
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response for intents and additional data
      const parsedResponse = this.parseAdvancedResponse(
        text,
        conversationContext,
      );

      // Apply cultural adaptation to the response
      const culturallyAdaptedResponse = await this.applyCulturalAdaptation(
        parsedResponse,
        conversationContext,
      );

      // Update memory with AI response insights
      if (conversationContext) {
        await this.updateMemoryWithResponse(
          conversationContext,
          culturallyAdaptedResponse,
          userText,
        );
      }

      this.logger.log(
        `AI response generated with cultural adaptation and memory integration: ${text.substring(0, 100)}...`,
      );
      return culturallyAdaptedResponse;
    } catch (error) {
      this.logger.error(
        `Error generating AI response: ${error.message}`,
        error.stack,
      );

      // Fallback response with context awareness
      return this.generateFallbackResponse(conversationContext);
    }
  }

  private async updateMemoryWithResponse(
    conversationContext: ConversationContext,
    aiResponse: AiResponse,
    userText: string,
  ): Promise<void> {
    try {
      const { conversationId, customerId } = conversationContext;

      // Add episodic memory for this interaction
      await this.conversationMemoryService.addEpisodicMemory(
        conversationId,
        customerId,
        {
          eventType: 'conversation',
          description: `Customer asked: "${userText.substring(0, 100)}..." | AI responded with ${aiResponse.intent || 'general'} intent`,
          emotionalImpact: this.calculateEmotionalImpact(
            aiResponse.emotionalTone,
          ),
          outcome: this.determineOutcome(aiResponse.confidence || 0.5),
          keyInsights: [
            `Intent detected: ${aiResponse.intent || 'unknown'}`,
            `Confidence: ${aiResponse.confidence || 0.5}`,
            `Emotional tone: ${aiResponse.emotionalTone || 'neutral'}`,
          ],
          relatedTopics: this.extractTopicsFromResponse(aiResponse.text),
        },
      );

      // Update emotional state based on AI response
      await this.conversationMemoryService.updateEmotionalState(
        conversationId,
        customerId,
        {
          primary: this.mapEmotionalTone(aiResponse.emotionalTone),
          intensity: this.calculateEmotionalIntensity(aiResponse.text),
          confidence: aiResponse.confidence || 0.5,
        },
      );

      // Add learning insights
      if (
        aiResponse.intent &&
        aiResponse.confidence &&
        aiResponse.confidence > 0.7
      ) {
        await this.conversationMemoryService.addLearningInsight(
          conversationId,
          customerId,
          {
            insightType: 'behavior',
            description: `Customer shows clear ${aiResponse.intent} intent with high confidence`,
            confidence: aiResponse.confidence,
            source: 'ai_response_analysis',
            actionable: true,
          },
        );
      }

      // Add pending actions if needed
      if (
        aiResponse.suggestedActions &&
        aiResponse.suggestedActions.length > 0
      ) {
        for (const action of aiResponse.suggestedActions) {
          await this.conversationMemoryService.addPendingAction(
            conversationId,
            customerId,
            {
              type: this.determineActionType(action),
              description: action,
              priority: this.determineActionPriority(action),
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            },
          );
        }
      }
    } catch (error) {
      this.logger.error('Error updating memory with response:', error);
    }
  }

  private calculateEmotionalImpact(emotionalTone?: string): number {
    switch (emotionalTone) {
      case 'enthusiastic':
        return 8;
      case 'friendly':
        return 6;
      case 'empathetic':
        return 7;
      case 'professional':
        return 5;
      default:
        return 5;
    }
  }

  private determineOutcome(
    confidence: number,
  ): 'positive' | 'neutral' | 'negative' {
    if (confidence > 0.7) return 'positive';
    if (confidence > 0.4) return 'neutral';
    return 'negative';
  }

  private extractTopicsFromResponse(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('order') || lowerText.includes('purchase'))
      topics.push('purchase');
    if (lowerText.includes('product') || lowerText.includes('item'))
      topics.push('products');
    if (lowerText.includes('price') || lowerText.includes('cost'))
      topics.push('pricing');
    if (lowerText.includes('delivery') || lowerText.includes('shipping'))
      topics.push('delivery');
    if (lowerText.includes('thank') || lowerText.includes('appreciate'))
      topics.push('gratitude');
    if (lowerText.includes('help') || lowerText.includes('support'))
      topics.push('support');

    return topics;
  }

  private mapEmotionalTone(
    emotionalTone?: string,
  ): 'happy' | 'satisfied' | 'neutral' | 'frustrated' | 'angry' | 'excited' {
    switch (emotionalTone) {
      case 'enthusiastic':
        return 'excited';
      case 'friendly':
        return 'happy';
      case 'empathetic':
        return 'satisfied';
      case 'professional':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  private calculateEmotionalIntensity(text: string): number {
    const positiveWords = [
      'great',
      'excellent',
      'amazing',
      'wonderful',
      'perfect',
    ];
    const negativeWords = [
      'bad',
      'terrible',
      'awful',
      'horrible',
      'disappointing',
    ];

    const lowerText = text.toLowerCase();
    let intensity = 5; // Base intensity

    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) intensity += 1;
    });

    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) intensity -= 1;
    });

    return Math.max(1, Math.min(10, intensity));
  }

  private determineActionType(
    action: string,
  ): 'follow_up' | 'reminder' | 'escalation' | 'research' | 'callback' {
    const lowerAction = action.toLowerCase();

    if (lowerAction.includes('follow') || lowerAction.includes('check'))
      return 'follow_up';
    if (lowerAction.includes('remind') || lowerAction.includes('schedule'))
      return 'reminder';
    if (lowerAction.includes('escalate') || lowerAction.includes('manager'))
      return 'escalation';
    if (lowerAction.includes('research') || lowerAction.includes('investigate'))
      return 'research';
    if (lowerAction.includes('call') || lowerAction.includes('contact'))
      return 'callback';

    return 'follow_up';
  }

  private determineActionPriority(action: string): 'high' | 'medium' | 'low' {
    const lowerAction = action.toLowerCase();

    if (
      lowerAction.includes('urgent') ||
      lowerAction.includes('immediate') ||
      lowerAction.includes('escalate')
    ) {
      return 'high';
    }

    if (lowerAction.includes('important') || lowerAction.includes('priority')) {
      return 'medium';
    }

    return 'low';
  }

  private buildAdvancedPrompt(
    userText: string,
    history: Message[],
    productContext?: string,
    userOrders?: any[],
    conversationContext?: ConversationContext,
  ): string {
    // Build conversation context (limit to last 8 messages for better context)
    const recentHistory = history.slice(0, 8);
    const contextMessages = recentHistory
      .reverse() // Show oldest first
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join('\n');

    const productInfo =
      productContext || 'No products are currently available in inventory.';

    // Build Flovo's professional sales persona with cultural awareness and memory
    const flovoPersona = this.buildFlovoPersona(conversationContext);

    // Build customer context with cultural preferences and memory insights
    const customerContext = this.buildCustomerContext(
      conversationContext,
      userOrders,
    );

    // Build conversation state context
    const stateContext = this.buildStateContext(conversationContext);

    // Build cultural and language context
    const culturalContext = this.buildCulturalContext(conversationContext);

    // Build memory context
    const memoryContext = this.buildMemoryContext(conversationContext);

    return `You are Flovo, a highly professional and intelligent AI sales assistant for businesses in Uzbekistan. You are not just a chatbot - you are a skilled sales professional with emotional intelligence, deep understanding of customer psychology, cultural sensitivity, and sophisticated memory capabilities.

${flovoPersona}

${customerContext}

${stateContext}

${culturalContext}

${memoryContext}

CORE SALES PSYCHOLOGY PRINCIPLES:
1. **Building Trust**: Always be honest, transparent, and reliable
2. **Active Listening**: Acknowledge customer concerns and show understanding
3. **Value Proposition**: Focus on benefits, not just features
4. **Social Proof**: Reference other satisfied customers when appropriate
5. **Urgency & Scarcity**: Create gentle urgency for limited items
6. **Reciprocity**: Offer helpful information before asking for anything
7. **Commitment**: Get small agreements before larger ones

EMOTIONAL INTELLIGENCE GUIDELINES:
- **Empathy**: Show genuine understanding of customer emotions
- **Adaptability**: Adjust your tone based on customer mood and style
- **Patience**: Never rush customers or show frustration
- **Enthusiasm**: Show genuine excitement about helping customers
- **Professionalism**: Maintain high standards while being warm

CULTURAL INTELLIGENCE:
- **Language Adaptation**: Respond in the customer's preferred language
- **Cultural Sensitivity**: Respect local customs and business etiquette
- **Formality Levels**: Match the customer's communication style
- **Regional Awareness**: Understand Uzbek, Russian, and international business practices
- **Religious Sensitivity**: Be respectful of cultural and religious practices

MEMORY & LEARNING INTELLIGENCE:
- **Context Awareness**: Use conversation history and customer memory to provide personalized responses
- **Pattern Recognition**: Identify and adapt to customer communication patterns
- **Emotional Memory**: Remember and respond to customer emotional states
- **Learning Adaptation**: Continuously learn from interactions to improve future responses
- **Relationship Building**: Use memory to strengthen customer relationships over time

CONVERSATION FLOW STRATEGIES:
1. **Greeting Phase**: Warm, personalized greeting based on customer profile, culture, and memory
2. **Discovery Phase**: Ask strategic questions to understand needs
3. **Presentation Phase**: Present relevant products with benefits
4. **Objection Handling**: Address concerns with empathy and solutions
5. **Closing Phase**: Guide naturally toward purchase decision
6. **Follow-up Phase**: Ensure satisfaction and encourage future business

LANGUAGE & CULTURAL ADAPTATION:
- **Primary**: Uzbek (formal but warm, with honorifics)
- **Secondary**: Russian (business-appropriate, formal address)
- **Tertiary**: English (for international customers, professional but friendly)
- **Cultural Greetings**: Use appropriate greetings for each culture
- **Business Etiquette**: Follow local business customs and practices
- **Number Formatting**: Use appropriate number and currency formats
- **Date Formatting**: Use culturally appropriate date formats

CURRENT INVENTORY:
${productInfo}

${
  userOrders && userOrders.length > 0
    ? `CUSTOMER'S ORDER HISTORY:
${userOrders.map((order) => `- Order #${order.id}: ${order.details?.items || 'N/A'} (${order.status}) - ${new Date(order.createdAt).toLocaleDateString()}`).join('\n')}`
    : ''
}

SPECIAL INTENTS (Use these markers when appropriate):
1. When customer wants to place an order for AVAILABLE products:
[INTENT:CREATE_ORDER]
{
  "customerName": "extracted name or 'Not provided'",
  "customerContact": "phone/email if provided or 'Not provided'", 
  "items": "description of what they want to order",
  "notes": "any special requests or details",
  "urgency": "high/medium/low",
  "budget": "if mentioned"
}

2. When customer asks about their orders:
[INTENT:FETCH_ORDERS]

3. When customer needs customer service:
[INTENT:CUSTOMER_SERVICE]
{
  "issue": "description of the problem",
  "urgency": "high/medium/low",
  "customerMood": "frustrated/neutral/satisfied"
}

4. When customer shows buying signals:
[INTENT:SALES_OPPORTUNITY]
{
  "productInterest": "specific product mentioned",
  "buyingSignals": ["price inquiry", "availability check", "comparison request"],
  "urgency": "high/medium/low"
}

CONVERSATION HISTORY:
${contextMessages}

Customer: ${userText}

IMPORTANT INSTRUCTIONS:
- Read the conversation history carefully to understand context
- Use memory insights to provide personalized responses
- If customer has already agreed to order, proceed with order details
- If customer seems confused, ask clarifying questions
- If customer shows frustration, show empathy and offer solutions
- Always maintain Flovo's professional yet warm personality
- Use the customer's preferred language and communication style
- Provide value in every interaction, not just sales pitches
- Apply cultural sensitivity and appropriate business etiquette
- Use culturally appropriate greetings and expressions
- Format numbers, dates, and currency according to cultural preferences
- Leverage memory insights to build stronger relationships
- Adapt responses based on customer's emotional state and history

Flovo:`;
  }

  private buildFlovoPersona(conversationContext?: ConversationContext): string {
    const basePersona = `FLOVO'S CORE PERSONALITY:
- **Professional Sales Expert**: Deep knowledge of products and sales psychology
- **Warm & Approachable**: Friendly demeanor that builds trust quickly
- **Intelligent & Adaptable**: Learns from each interaction to improve service
- **Culturally Aware**: Understands Uzbek, Russian, and international business cultures
- **Memory-Enhanced**: Remembers customer preferences, history, and relationship context
- **Problem Solver**: Focuses on finding solutions, not just selling products
- **Relationship Builder**: Values long-term customer relationships over quick sales

COMMUNICATION STYLE:
- Use the customer's preferred language (Uzbek/Russian/English)
- Match the customer's communication style (formal/casual/friendly)
- Show genuine enthusiasm for helping customers
- Use appropriate honorifics and cultural expressions
- Maintain professional boundaries while being warm
- Leverage memory to provide personalized experiences`;

    if (conversationContext) {
      const {
        customerProfile,
        currentState,
        intent,
        languageContext,
        memoryContext,
      } = conversationContext;

      return `${basePersona}

CURRENT CONTEXT:
- Customer Relationship Score: ${customerProfile.relationshipScore}/100
- Communication Style: ${customerProfile.preferences.communicationStyle}
- Preferred Language: ${customerProfile.preferences.preferredLanguage}
- Cultural Sensitivity: ${customerProfile.culturalPreferences.culturalSensitivity}
- Total Orders: ${customerProfile.totalOrders}
- Average Order Value: $${customerProfile.averageOrderValue.toFixed(2)}
- Favorite Categories: ${customerProfile.preferences.productInterests.join(', ')}

LANGUAGE & CULTURAL CONTEXT:
- Detected Language: ${languageContext.detectedLanguage.name} (${languageContext.detectedLanguage.code})
- Language Confidence: ${languageContext.detectedLanguage.confidence * 100}%
- Cultural Context: ${languageContext.culturalContext.region}
- Formality Level: ${languageContext.culturalContext.formality}
- Greeting Style: ${languageContext.culturalContext.greetingStyle}

MEMORY CONTEXT:
- Memory Score: ${memoryContext.memoryScore}/100
- Emotional State: ${memoryContext.emotionalState}
- Trust Level: ${memoryContext.trustLevel}/100
- Relationship Strength: ${memoryContext.relationshipStrength}
- Pending Actions: ${memoryContext.pendingActions}
- Risk Factors: ${memoryContext.riskFactors.length}
- Recent Insights: ${memoryContext.shortTermInsights.slice(0, 2).join(', ')}

CONVERSATION STATE: ${currentState}
DETECTED INTENT: ${intent}
CONFIDENCE: ${conversationContext.confidence * 100}%`;
    }

    return basePersona;
  }

  private buildCustomerContext(
    conversationContext?: ConversationContext,
    userOrders?: any[],
  ): string {
    if (!conversationContext) {
      return 'CUSTOMER CONTEXT: New customer, building initial relationship';
    }

    const { customerProfile, memoryContext } = conversationContext;

    let context = `CUSTOMER PROFILE:
- Relationship Level: ${this.getRelationshipLevel(customerProfile.relationshipScore)}
- Communication Preference: ${customerProfile.preferences.communicationStyle}
- Language: ${customerProfile.preferences.preferredLanguage}
- Response Speed: ${customerProfile.preferences.responseSpeed}
- Product Interests: ${customerProfile.preferences.productInterests.join(', ')}
- Cultural Sensitivity: ${customerProfile.culturalPreferences.culturalSensitivity}

MEMORY INSIGHTS:
- Communication Patterns: ${customerProfile.memoryInsights.communicationPatterns.join(', ')}
- Emotional Patterns: ${customerProfile.memoryInsights.emotionalPatterns.join(', ')}
- Decision Patterns: ${customerProfile.memoryInsights.decisionPatterns.join(', ')}
- Satisfaction Trends: ${customerProfile.memoryInsights.satisfactionTrends.join(', ')}
- Loyalty Indicators: ${customerProfile.memoryInsights.loyaltyIndicators.join(', ')}
- Risk Factors: ${customerProfile.memoryInsights.riskFactors.join(', ')}

CURRENT MEMORY STATE:
- Trust Level: ${memoryContext.trustLevel}/100
- Emotional State: ${memoryContext.emotionalState}
- Relationship Strength: ${memoryContext.relationshipStrength}
- Pending Actions: ${memoryContext.pendingActions}
- Recent Insights: ${memoryContext.shortTermInsights.join(', ')}
- Recommendations: ${memoryContext.recommendations.join(', ')}`;

    if (customerProfile.totalOrders > 0) {
      context += `\n- Loyalty Status: ${this.getLoyaltyStatus(customerProfile.totalOrders, customerProfile.averageOrderValue)}
- Last Order: ${customerProfile.lastOrderDate ? new Date(customerProfile.lastOrderDate).toLocaleDateString() : 'N/A'}`;
    }

    return context;
  }

  private buildStateContext(conversationContext?: ConversationContext): string {
    if (!conversationContext) {
      return 'CONVERSATION STATE: Initial greeting phase';
    }

    const { currentState, messageCount, memoryContext } = conversationContext;

    let stateContext = `CONVERSATION STATE: ${currentState}
MESSAGE COUNT: ${messageCount}
MEMORY SCORE: ${memoryContext.memoryScore}/100`;

    // Add state-specific guidance
    switch (currentState) {
      case ConversationState.GREETING:
        stateContext +=
          '\nGUIDANCE: Focus on warm greeting and understanding customer needs';
        break;
      case ConversationState.PRODUCT_INQUIRY:
        stateContext +=
          '\nGUIDANCE: Provide detailed product information and benefits';
        break;
      case ConversationState.ORDER_INITIATION:
        stateContext +=
          '\nGUIDANCE: Guide customer through order process naturally';
        break;
      case ConversationState.ORDER_CONFIRMATION:
        stateContext +=
          '\nGUIDANCE: Confirm order details and provide next steps';
        break;
      case ConversationState.CUSTOMER_SERVICE:
        stateContext += '\nGUIDANCE: Show empathy and provide solutions';
        break;
    }

    return stateContext;
  }

  private buildCulturalContext(
    conversationContext?: ConversationContext,
  ): string {
    if (!conversationContext) {
      return 'CULTURAL CONTEXT: Default Uzbek business culture';
    }

    const { languageContext } = conversationContext;
    const { culturalContext, detectedLanguage } = languageContext;

    return `CULTURAL CONTEXT:
- Primary Language: ${detectedLanguage.name} (${detectedLanguage.code})
- Region: ${culturalContext.region}
- Formality Level: ${culturalContext.formality}
- Greeting Style: ${culturalContext.greetingStyle}
- Business Etiquette: ${culturalContext.businessEtiquette.slice(0, 3).join(', ')}
- Number Format: ${culturalContext.numberFormat}
- Date Format: ${culturalContext.dateFormat}
- Currency Format: ${culturalContext.currencyFormat}

CULTURAL ADAPTATION GUIDELINES:
- Use appropriate greetings for ${culturalContext.region} culture
- Maintain ${culturalContext.formality} communication style
- Follow ${culturalContext.region} business etiquette
- Format numbers and dates according to ${culturalContext.region} standards
- Use culturally appropriate expressions and honorifics`;
  }

  private buildMemoryContext(
    conversationContext?: ConversationContext,
  ): string {
    if (!conversationContext) {
      return 'MEMORY CONTEXT: New conversation, building initial memory';
    }

    const { memoryContext } = conversationContext;

    return `MEMORY CONTEXT:
- Memory Score: ${memoryContext.memoryScore}/100
- Emotional State: ${memoryContext.emotionalState}
- Trust Level: ${memoryContext.trustLevel}/100
- Relationship Strength: ${memoryContext.relationshipStrength}
- Pending Actions: ${memoryContext.pendingActions}
- Risk Factors: ${memoryContext.riskFactors.length}

SHORT-TERM INSIGHTS:
${memoryContext.shortTermInsights.map((insight) => `- ${insight}`).join('\n')}

LONG-TERM INSIGHTS:
${memoryContext.longTermInsights.map((insight) => `- ${insight}`).join('\n')}

LEARNING INSIGHTS:
${memoryContext.learningInsights.map((insight) => `- ${insight}`).join('\n')}

RECOMMENDATIONS:
${memoryContext.recommendations.map((rec) => `- ${rec}`).join('\n')}

MEMORY GUIDELINES:
- Use memory insights to provide personalized responses
- Adapt communication style based on customer patterns
- Address pending actions and risk factors
- Build on existing relationship strength
- Apply learned preferences and behaviors`;
  }

  private getRelationshipLevel(score: number): string {
    if (score >= 80) return 'VIP Customer';
    if (score >= 60) return 'Loyal Customer';
    if (score >= 40) return 'Regular Customer';
    if (score >= 20) return 'Returning Customer';
    return 'New Customer';
  }

  private getLoyaltyStatus(totalOrders: number, averageValue: number): string {
    if (totalOrders >= 10 && averageValue >= 100) return 'Premium Loyal';
    if (totalOrders >= 5 && averageValue >= 50) return 'Loyal';
    if (totalOrders >= 2) return 'Returning';
    return 'First-time';
  }

  private async applyCulturalAdaptation(
    response: AiResponse,
    conversationContext?: ConversationContext,
  ): Promise<AiResponse> {
    if (!conversationContext) {
      return response;
    }

    const { languageContext } = conversationContext;
    const targetLanguage = languageContext.detectedLanguage.code;

    // Apply cultural adaptation to the response text
    const culturallyAdaptedText =
      await this.languageDetectionService.adaptResponseForCulture(
        response.text,
        targetLanguage,
        conversationContext.customerProfile.culturalPreferences
          .communicationStyle === 'formal'
          ? 'formal'
          : 'business',
      );

    // Add memory insights to response
    const memoryInsights =
      conversationContext.memoryContext.shortTermInsights.slice(0, 2);
    const learningRecommendations =
      conversationContext.memoryContext.recommendations.slice(0, 2);

    return {
      ...response,
      text: culturallyAdaptedText,
      languageUsed: targetLanguage,
      culturalAdaptations: [
        `Adapted response for ${languageContext.culturalContext.region} culture`,
        `Used ${languageContext.culturalContext.formality} communication style`,
        `Applied ${languageContext.culturalContext.greetingStyle} greeting style`,
      ],
      memoryInsights,
      learningRecommendations,
    };
  }

  private parseAdvancedResponse(
    aiText: string,
    conversationContext?: ConversationContext,
  ): AiResponse {
    // Look for order creation intent marker
    const orderMatch = aiText.match(/\[INTENT:CREATE_ORDER\]\s*(\{[\s\S]*?\})/);
    if (orderMatch) {
      try {
        const orderData = JSON.parse(orderMatch[1]);
        const responseText = aiText
          .replace(/\[INTENT:CREATE_ORDER\][\s\S]*/, '')
          .trim();

        return {
          text:
            responseText ||
            "Great! I've got your order down. What's your name and phone number so we can get in touch with you?",
          intent: 'CREATE_ORDER',
          orderData,
          confidence: conversationContext?.confidence || 0.8,
          emotionalTone: 'enthusiastic',
          followUpQuestions: ["What's your name?", "What's your phone number?"],
        };
      } catch (error) {
        this.logger.warn('Failed to parse order data from AI response');
      }
    }

    // Look for fetch orders intent marker
    const fetchOrdersMatch = aiText.match(/\[INTENT:FETCH_ORDERS\]/);
    if (fetchOrdersMatch) {
      const responseText = aiText.replace(/\[INTENT:FETCH_ORDERS\]/, '').trim();

      return {
        text: responseText || 'Let me check your orders for you.',
        intent: 'FETCH_ORDERS',
        shouldFetchOrders: true,
        confidence: conversationContext?.confidence || 0.9,
        emotionalTone: 'friendly',
      };
    }

    // Look for customer service intent marker
    const serviceMatch = aiText.match(
      /\[INTENT:CUSTOMER_SERVICE\]\s*(\{[\s\S]*?\})/,
    );
    if (serviceMatch) {
      try {
        const serviceData = JSON.parse(serviceMatch[1]);
        const responseText = aiText
          .replace(/\[INTENT:CUSTOMER_SERVICE\][\s\S]*/, '')
          .trim();

        return {
          text:
            responseText ||
            'I understand your concern. Let me help you with that.',
          intent: 'CUSTOMER_SERVICE',
          confidence: conversationContext?.confidence || 0.7,
          emotionalTone: 'empathetic',
          suggestedActions: [
            'Escalate to human agent',
            'Provide solution',
            'Follow up',
          ],
        };
      } catch (error) {
        this.logger.warn('Failed to parse service data from AI response');
      }
    }

    // Look for sales opportunity intent marker
    const salesMatch = aiText.match(
      /\[INTENT:SALES_OPPORTUNITY\]\s*(\{[\s\S]*?\})/,
    );
    if (salesMatch) {
      try {
        const salesData = JSON.parse(salesMatch[1]);
        const responseText = aiText
          .replace(/\[INTENT:SALES_OPPORTUNITY\][\s\S]*/, '')
          .trim();

        return {
          text: responseText,
          intent: 'SALES_OPPORTUNITY',
          confidence: conversationContext?.confidence || 0.6,
          emotionalTone: 'enthusiastic',
          suggestedActions: [
            'Present product benefits',
            'Address objections',
            'Create urgency',
          ],
        };
      } catch (error) {
        this.logger.warn('Failed to parse sales data from AI response');
      }
    }

    // Default response with context awareness
    return {
      text: aiText,
      confidence: conversationContext?.confidence || 0.5,
      emotionalTone: this.detectEmotionalTone(aiText),
      followUpQuestions: this.extractFollowUpQuestions(aiText),
    };
  }

  private detectEmotionalTone(
    text: string,
  ): 'friendly' | 'professional' | 'empathetic' | 'enthusiastic' {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('sorry') ||
      lowerText.includes('understand') ||
      lowerText.includes('concern')
    ) {
      return 'empathetic';
    }

    if (
      lowerText.includes('great') ||
      lowerText.includes('excellent') ||
      lowerText.includes('amazing')
    ) {
      return 'enthusiastic';
    }

    if (
      lowerText.includes('please') ||
      lowerText.includes('thank you') ||
      lowerText.includes('appreciate')
    ) {
      return 'friendly';
    }

    return 'professional';
  }

  private extractFollowUpQuestions(text: string): string[] {
    const questions: string[] = [];
    const questionRegex = /[^.!?]*\?/g;
    const matches = text.match(questionRegex);

    if (matches) {
      questions.push(...matches.map((q) => q.trim()).slice(0, 2)); // Limit to 2 questions
    }

    return questions;
  }

  private generateFallbackResponse(
    conversationContext?: ConversationContext,
  ): AiResponse {
    const relationshipLevel =
      conversationContext?.customerProfile.relationshipScore || 0;
    const language =
      conversationContext?.languageContext.detectedLanguage.code || 'uz';

    let fallbackText =
      "I'm having trouble processing your request right now. Please try again in a moment.";

    // Provide culturally appropriate fallback responses
    if (language === 'uz') {
      fallbackText =
        "Kechirasiz, so'rovingizni qayta ishlashda muammo bor. Iltimos, bir ozdan keyin qayta urinib ko'ring.";
    } else if (language === 'ru') {
      fallbackText =
        'Извините, у меня проблемы с обработкой вашего запроса. Пожалуйста, попробуйте еще раз через минуту.';
    }

    if (relationshipLevel > 50) {
      fallbackText =
        'I apologize for the technical issue. Let me get back to you right away. How can I help you today?';
    }

    return {
      text: fallbackText,
      emotionalTone: 'empathetic',
      confidence: 0.3,
      languageUsed: language,
    };
  }
}

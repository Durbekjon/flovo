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
const conversation_context_service_1 = require("../conversation/conversation-context.service");
const language_detection_service_1 = require("../language/language-detection.service");
const conversation_memory_service_1 = require("../memory/conversation-memory.service");
let GeminiService = GeminiService_1 = class GeminiService {
    configService;
    conversationContextService;
    languageDetectionService;
    conversationMemoryService;
    logger = new common_1.Logger(GeminiService_1.name);
    genAI;
    constructor(configService, conversationContextService, languageDetectionService, conversationMemoryService) {
        this.configService = configService;
        this.conversationContextService = conversationContextService;
        this.languageDetectionService = languageDetectionService;
        this.conversationMemoryService = conversationMemoryService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is required');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generateResponse(userText, conversationHistory, productContext, userOrders, conversationContext) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
            });
            const prompt = this.buildAdvancedPrompt(userText, conversationHistory, productContext, userOrders, conversationContext);
            this.logger.log('Generating AI response with advanced prompt engineering, cultural adaptation, and memory integration...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const parsedResponse = this.parseAdvancedResponse(text, conversationContext);
            const culturallyAdaptedResponse = await this.applyCulturalAdaptation(parsedResponse, conversationContext);
            if (conversationContext) {
                await this.updateMemoryWithResponse(conversationContext, culturallyAdaptedResponse, userText);
            }
            this.logger.log(`AI response generated with cultural adaptation and memory integration: ${text.substring(0, 100)}...`);
            return culturallyAdaptedResponse;
        }
        catch (error) {
            this.logger.error(`Error generating AI response: ${error.message}`, error.stack);
            return this.generateFallbackResponse(conversationContext);
        }
    }
    async updateMemoryWithResponse(conversationContext, aiResponse, userText) {
        try {
            const { conversationId, customerId } = conversationContext;
            await this.conversationMemoryService.addEpisodicMemory(conversationId, customerId, {
                eventType: 'conversation',
                description: `Customer asked: "${userText.substring(0, 100)}..." | AI responded with ${aiResponse.intent || 'general'} intent`,
                emotionalImpact: this.calculateEmotionalImpact(aiResponse.emotionalTone),
                outcome: this.determineOutcome(aiResponse.confidence || 0.5),
                keyInsights: [
                    `Intent detected: ${aiResponse.intent || 'unknown'}`,
                    `Confidence: ${aiResponse.confidence || 0.5}`,
                    `Emotional tone: ${aiResponse.emotionalTone || 'neutral'}`,
                ],
                relatedTopics: this.extractTopicsFromResponse(aiResponse.text),
            });
            await this.conversationMemoryService.updateEmotionalState(conversationId, customerId, {
                primary: this.mapEmotionalTone(aiResponse.emotionalTone),
                intensity: this.calculateEmotionalIntensity(aiResponse.text),
                confidence: aiResponse.confidence || 0.5,
            });
            if (aiResponse.intent &&
                aiResponse.confidence &&
                aiResponse.confidence > 0.7) {
                await this.conversationMemoryService.addLearningInsight(conversationId, customerId, {
                    insightType: 'behavior',
                    description: `Customer shows clear ${aiResponse.intent} intent with high confidence`,
                    confidence: aiResponse.confidence,
                    source: 'ai_response_analysis',
                    actionable: true,
                });
            }
            if (aiResponse.suggestedActions &&
                aiResponse.suggestedActions.length > 0) {
                for (const action of aiResponse.suggestedActions) {
                    await this.conversationMemoryService.addPendingAction(conversationId, customerId, {
                        type: this.determineActionType(action),
                        description: action,
                        priority: this.determineActionPriority(action),
                        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error updating memory with response:', error);
        }
    }
    calculateEmotionalImpact(emotionalTone) {
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
    determineOutcome(confidence) {
        if (confidence > 0.7)
            return 'positive';
        if (confidence > 0.4)
            return 'neutral';
        return 'negative';
    }
    extractTopicsFromResponse(text) {
        const topics = [];
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
    mapEmotionalTone(emotionalTone) {
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
    calculateEmotionalIntensity(text) {
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
        let intensity = 5;
        positiveWords.forEach((word) => {
            if (lowerText.includes(word))
                intensity += 1;
        });
        negativeWords.forEach((word) => {
            if (lowerText.includes(word))
                intensity -= 1;
        });
        return Math.max(1, Math.min(10, intensity));
    }
    determineActionType(action) {
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
    determineActionPriority(action) {
        const lowerAction = action.toLowerCase();
        if (lowerAction.includes('urgent') ||
            lowerAction.includes('immediate') ||
            lowerAction.includes('escalate')) {
            return 'high';
        }
        if (lowerAction.includes('important') || lowerAction.includes('priority')) {
            return 'medium';
        }
        return 'low';
    }
    buildAdvancedPrompt(userText, history, productContext, userOrders, conversationContext) {
        const recentHistory = history.slice(0, 8);
        const contextMessages = recentHistory
            .reverse()
            .map((msg) => `${msg.sender}: ${msg.content}`)
            .join('\n');
        const productInfo = productContext || 'No products are currently available in inventory.';
        const flovoPersona = this.buildFlovoPersona(conversationContext);
        const customerContext = this.buildCustomerContext(conversationContext, userOrders);
        const stateContext = this.buildStateContext(conversationContext);
        const culturalContext = this.buildCulturalContext(conversationContext);
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

${userOrders && userOrders.length > 0
            ? `CUSTOMER'S ORDER HISTORY:
${userOrders.map((order) => `- Order #${order.id}: ${order.details?.items || 'N/A'} (${order.status}) - ${new Date(order.createdAt).toLocaleDateString()}`).join('\n')}`
            : ''}

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
    buildFlovoPersona(conversationContext) {
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
            const { customerProfile, currentState, intent, languageContext, memoryContext, } = conversationContext;
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
    buildCustomerContext(conversationContext, userOrders) {
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
    buildStateContext(conversationContext) {
        if (!conversationContext) {
            return 'CONVERSATION STATE: Initial greeting phase';
        }
        const { currentState, messageCount, memoryContext } = conversationContext;
        let stateContext = `CONVERSATION STATE: ${currentState}
MESSAGE COUNT: ${messageCount}
MEMORY SCORE: ${memoryContext.memoryScore}/100`;
        switch (currentState) {
            case conversation_context_service_1.ConversationState.GREETING:
                stateContext +=
                    '\nGUIDANCE: Focus on warm greeting and understanding customer needs';
                break;
            case conversation_context_service_1.ConversationState.PRODUCT_INQUIRY:
                stateContext +=
                    '\nGUIDANCE: Provide detailed product information and benefits';
                break;
            case conversation_context_service_1.ConversationState.ORDER_INITIATION:
                stateContext +=
                    '\nGUIDANCE: Guide customer through order process naturally';
                break;
            case conversation_context_service_1.ConversationState.ORDER_CONFIRMATION:
                stateContext +=
                    '\nGUIDANCE: Confirm order details and provide next steps';
                break;
            case conversation_context_service_1.ConversationState.CUSTOMER_SERVICE:
                stateContext += '\nGUIDANCE: Show empathy and provide solutions';
                break;
        }
        return stateContext;
    }
    buildCulturalContext(conversationContext) {
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
    buildMemoryContext(conversationContext) {
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
    getRelationshipLevel(score) {
        if (score >= 80)
            return 'VIP Customer';
        if (score >= 60)
            return 'Loyal Customer';
        if (score >= 40)
            return 'Regular Customer';
        if (score >= 20)
            return 'Returning Customer';
        return 'New Customer';
    }
    getLoyaltyStatus(totalOrders, averageValue) {
        if (totalOrders >= 10 && averageValue >= 100)
            return 'Premium Loyal';
        if (totalOrders >= 5 && averageValue >= 50)
            return 'Loyal';
        if (totalOrders >= 2)
            return 'Returning';
        return 'First-time';
    }
    async applyCulturalAdaptation(response, conversationContext) {
        if (!conversationContext) {
            return response;
        }
        const { languageContext } = conversationContext;
        const targetLanguage = languageContext.detectedLanguage.code;
        const culturallyAdaptedText = await this.languageDetectionService.adaptResponseForCulture(response.text, targetLanguage, conversationContext.customerProfile.culturalPreferences
            .communicationStyle === 'formal'
            ? 'formal'
            : 'business');
        const memoryInsights = conversationContext.memoryContext.shortTermInsights.slice(0, 2);
        const learningRecommendations = conversationContext.memoryContext.recommendations.slice(0, 2);
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
    parseAdvancedResponse(aiText, conversationContext) {
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
                    confidence: conversationContext?.confidence || 0.8,
                    emotionalTone: 'enthusiastic',
                    followUpQuestions: ["What's your name?", "What's your phone number?"],
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
                confidence: conversationContext?.confidence || 0.9,
                emotionalTone: 'friendly',
            };
        }
        const serviceMatch = aiText.match(/\[INTENT:CUSTOMER_SERVICE\]\s*(\{[\s\S]*?\})/);
        if (serviceMatch) {
            try {
                const serviceData = JSON.parse(serviceMatch[1]);
                const responseText = aiText
                    .replace(/\[INTENT:CUSTOMER_SERVICE\][\s\S]*/, '')
                    .trim();
                return {
                    text: responseText ||
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
            }
            catch (error) {
                this.logger.warn('Failed to parse service data from AI response');
            }
        }
        const salesMatch = aiText.match(/\[INTENT:SALES_OPPORTUNITY\]\s*(\{[\s\S]*?\})/);
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
            }
            catch (error) {
                this.logger.warn('Failed to parse sales data from AI response');
            }
        }
        return {
            text: aiText,
            confidence: conversationContext?.confidence || 0.5,
            emotionalTone: this.detectEmotionalTone(aiText),
            followUpQuestions: this.extractFollowUpQuestions(aiText),
        };
    }
    detectEmotionalTone(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('sorry') ||
            lowerText.includes('understand') ||
            lowerText.includes('concern')) {
            return 'empathetic';
        }
        if (lowerText.includes('great') ||
            lowerText.includes('excellent') ||
            lowerText.includes('amazing')) {
            return 'enthusiastic';
        }
        if (lowerText.includes('please') ||
            lowerText.includes('thank you') ||
            lowerText.includes('appreciate')) {
            return 'friendly';
        }
        return 'professional';
    }
    extractFollowUpQuestions(text) {
        const questions = [];
        const questionRegex = /[^.!?]*\?/g;
        const matches = text.match(questionRegex);
        if (matches) {
            questions.push(...matches.map((q) => q.trim()).slice(0, 2));
        }
        return questions;
    }
    generateFallbackResponse(conversationContext) {
        const relationshipLevel = conversationContext?.customerProfile.relationshipScore || 0;
        const language = conversationContext?.languageContext.detectedLanguage.code || 'uz';
        let fallbackText = "I'm having trouble processing your request right now. Please try again in a moment.";
        if (language === 'uz') {
            fallbackText =
                "Kechirasiz, so'rovingizni qayta ishlashda muammo bor. Iltimos, bir ozdan keyin qayta urinib ko'ring.";
        }
        else if (language === 'ru') {
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
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        conversation_context_service_1.ConversationContextService,
        language_detection_service_1.LanguageDetectionService,
        conversation_memory_service_1.ConversationMemoryService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map
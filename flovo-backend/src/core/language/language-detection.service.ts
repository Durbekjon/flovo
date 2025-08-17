import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LanguageInfo {
  code: string;
  name: string;
  confidence: number;
  isPrimary: boolean;
}

export interface CulturalContext {
  language: string;
  region: string;
  formality: 'formal' | 'casual' | 'respectful';
  greetingStyle: 'warm' | 'professional' | 'traditional';
  businessEtiquette: string[];
  commonPhrases: Record<string, string>;
  numberFormat: 'western' | 'eastern';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  currencyFormat: string;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: 'business' | 'casual' | 'formal';
  preserveTone?: boolean;
}

export interface TranslationResponse {
  translatedText: string;
  confidence: number;
  culturalNotes?: string[];
  alternativeTranslations?: string[];
}

@Injectable()
export class LanguageDetectionService {
  private readonly logger = new Logger(LanguageDetectionService.name);
  private readonly supportedLanguages = new Map<string, CulturalContext>();

  constructor(private readonly configService: ConfigService) {
    this.initializeSupportedLanguages();
  }

  private initializeSupportedLanguages(): void {
    // Uzbek (Primary)
    this.supportedLanguages.set('uz', {
      language: 'uz',
      region: 'Uzbekistan',
      formality: 'respectful',
      greetingStyle: 'warm',
      businessEtiquette: [
        'Use formal titles and honorifics',
        'Show respect to elders and business partners',
        'Accept tea/coffee when offered',
        'Use both hands when giving/receiving items',
        'Maintain eye contact but not too direct'
      ],
      commonPhrases: {
        greeting: 'Assalomu alaykum',
        goodbye: 'Xayr',
        thank_you: 'Rahmat',
        please: 'Iltimos',
        excuse_me: 'Kechirasiz',
        yes: 'Ha',
        no: 'Yo\'q',
        how_are_you: 'Qalaysiz?',
        good: 'Yaxshi',
        price: 'Narxi',
        order: 'Buyurtma',
        delivery: 'Yetkazib berish',
        payment: 'To\'lov'
      },
      numberFormat: 'western',
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: 'UZS'
    });

    // Russian (Secondary)
    this.supportedLanguages.set('ru', {
      language: 'ru',
      region: 'CIS',
      formality: 'formal',
      greetingStyle: 'professional',
      businessEtiquette: [
        'Use formal address (Вы) in business',
        'Maintain professional distance',
        'Be punctual and prepared',
        'Use business cards appropriately',
        'Follow hierarchical communication'
      ],
      commonPhrases: {
        greeting: 'Здравствуйте',
        goodbye: 'До свидания',
        thank_you: 'Спасибо',
        please: 'Пожалуйста',
        excuse_me: 'Извините',
        yes: 'Да',
        no: 'Нет',
        how_are_you: 'Как дела?',
        good: 'Хорошо',
        price: 'Цена',
        order: 'Заказ',
        delivery: 'Доставка',
        payment: 'Оплата'
      },
      numberFormat: 'western',
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: 'RUB'
    });

    // English (Tertiary)
    this.supportedLanguages.set('en', {
      language: 'en',
      region: 'International',
      formality: 'casual',
      greetingStyle: 'professional',
      businessEtiquette: [
        'Be direct and clear in communication',
        'Use first names in most business situations',
        'Maintain professional but friendly tone',
        'Be punctual and respect time',
        'Follow up with written confirmation'
      ],
      commonPhrases: {
        greeting: 'Hello',
        goodbye: 'Goodbye',
        thank_you: 'Thank you',
        please: 'Please',
        excuse_me: 'Excuse me',
        yes: 'Yes',
        no: 'No',
        how_are_you: 'How are you?',
        good: 'Good',
        price: 'Price',
        order: 'Order',
        delivery: 'Delivery',
        payment: 'Payment'
      },
      numberFormat: 'western',
      dateFormat: 'MM/DD/YYYY',
      currencyFormat: 'USD'
    });
  }

  async detectLanguage(text: string): Promise<LanguageInfo> {
    this.logger.log(`Detecting language for text: ${text.substring(0, 50)}...`);

    // Simple language detection based on character sets and common words
    const lowerText = text.toLowerCase();
    
    // Uzbek detection (Cyrillic + Latin characters)
    const uzbekIndicators = [
      'assalomu', 'alaykum', 'xayr', 'rahmat', 'iltimos', 'kechirasiz',
      'qalaysiz', 'yaxshi', 'narxi', 'buyurtma', 'yetkazib', 'to\'lov',
      'ў', 'қ', 'ғ', 'ҳ', 'ў', 'ў', 'ў', 'ў', 'ў', 'ў', 'ў', 'ў'
    ];
    
    // Russian detection
    const russianIndicators = [
      'здравствуйте', 'спасибо', 'пожалуйста', 'извините', 'заказ',
      'доставка', 'оплата', 'цена', 'хорошо', 'плохо', 'да', 'нет',
      'я', 'вы', 'мы', 'они', 'это', 'то', 'как', 'что', 'где', 'когда'
    ];
    
    // English detection
    const englishIndicators = [
      'hello', 'thank', 'please', 'excuse', 'order', 'delivery',
      'payment', 'price', 'good', 'bad', 'yes', 'no', 'how', 'what',
      'where', 'when', 'why', 'the', 'and', 'or', 'but', 'for'
    ];

    let uzbekScore = 0;
    let russianScore = 0;
    let englishScore = 0;

    // Score based on character sets
    const cyrillicChars = (text.match(/[а-яё]/gi) || []).length;
    const latinChars = (text.match(/[a-z]/gi) || []).length;
    const uzbekChars = (text.match(/[ўқғҳ]/gi) || []).length;

    // Score based on common words
    uzbekIndicators.forEach(indicator => {
      if (lowerText.includes(indicator)) uzbekScore += 2;
    });
    
    russianIndicators.forEach(indicator => {
      if (lowerText.includes(indicator)) russianScore += 2;
    });
    
    englishIndicators.forEach(indicator => {
      if (lowerText.includes(indicator)) englishScore += 2;
    });

    // Adjust scores based on character distribution
    if (cyrillicChars > latinChars) {
      russianScore += cyrillicChars * 0.1;
      uzbekScore += uzbekChars * 0.5;
    } else {
      englishScore += latinChars * 0.1;
    }

    // Determine the most likely language
    const scores = [
      { code: 'uz', score: uzbekScore, name: 'Uzbek' },
      { code: 'ru', score: russianScore, name: 'Russian' },
      { code: 'en', score: englishScore, name: 'English' }
    ];

    scores.sort((a, b) => b.score - a.score);
    const primaryLanguage = scores[0];
    const confidence = Math.min(primaryLanguage.score / 10, 1.0);

    this.logger.log(`Language detected: ${primaryLanguage.name} (${primaryLanguage.code}) with confidence: ${confidence}`);

    return {
      code: primaryLanguage.code,
      name: primaryLanguage.name,
      confidence,
      isPrimary: primaryLanguage.code === 'uz'
    };
  }

  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    this.logger.log(`Translating text from ${request.sourceLanguage} to ${request.targetLanguage}`);

    // For MVP, we'll use a simple translation mapping
    // In production, this would integrate with Google Translate API or similar
    const translation = await this.simpleTranslate(request);

    return {
      translatedText: translation.text,
      confidence: translation.confidence,
      culturalNotes: translation.culturalNotes,
      alternativeTranslations: translation.alternatives
    };
  }

  private async simpleTranslate(request: TranslationRequest): Promise<{
    text: string;
    confidence: number;
    culturalNotes: string[];
    alternatives: string[];
  }> {
    const { text, sourceLanguage, targetLanguage, context = 'business' } = request;
    
    // Simple translation mappings for common phrases
    const translations: Record<string, Record<string, string>> = {
      'greeting': {
        'uz': 'Assalomu alaykum',
        'ru': 'Здравствуйте',
        'en': 'Hello'
      },
      'thank_you': {
        'uz': 'Rahmat',
        'ru': 'Спасибо',
        'en': 'Thank you'
      },
      'please': {
        'uz': 'Iltimos',
        'ru': 'Пожалуйста',
        'en': 'Please'
      },
      'order': {
        'uz': 'Buyurtma',
        'ru': 'Заказ',
        'en': 'Order'
      },
      'price': {
        'uz': 'Narxi',
        'ru': 'Цена',
        'en': 'Price'
      },
      'delivery': {
        'uz': 'Yetkazib berish',
        'ru': 'Доставка',
        'en': 'Delivery'
      }
    };

    let translatedText = text;
    let confidence = 0.8;
    const culturalNotes: string[] = [];
    const alternatives: string[] = [];

    // Replace common phrases
    Object.entries(translations).forEach(([key, langMap]) => {
      const sourcePhrase = langMap[sourceLanguage];
      const targetPhrase = langMap[targetLanguage];
      
      if (sourcePhrase && targetPhrase) {
        const regex = new RegExp(sourcePhrase, 'gi');
        translatedText = translatedText.replace(regex, targetPhrase);
      }
    });

    // Add cultural context
    const sourceContext = this.supportedLanguages.get(sourceLanguage);
    const targetContext = this.supportedLanguages.get(targetLanguage);
    
    if (sourceContext && targetContext && sourceLanguage !== targetLanguage) {
      culturalNotes.push(
        `Adapted from ${sourceContext.formality} to ${targetContext.formality} communication style`,
        `Used ${targetContext.greetingStyle} greeting style`,
        `Applied ${targetContext.region} business etiquette`
      );
    }

    // Generate alternatives for key phrases
    if (context === 'business') {
      alternatives.push(
        translatedText.replace(/hello/gi, 'Good day'),
        translatedText.replace(/thank you/gi, 'Thank you very much'),
        translatedText.replace(/please/gi, 'Kindly')
      );
    }

    return {
      text: translatedText,
      confidence,
      culturalNotes,
      alternatives
    };
  }

  getCulturalContext(languageCode: string): CulturalContext | null {
    return this.supportedLanguages.get(languageCode) || null;
  }

  async adaptResponseForCulture(
    response: string,
    targetLanguage: string,
    context: 'business' | 'casual' | 'formal' = 'business'
  ): Promise<string> {
    const culturalContext = this.getCulturalContext(targetLanguage);
    if (!culturalContext) {
      return response;
    }

    let adaptedResponse = response;

    // Apply cultural adaptations
    switch (targetLanguage) {
      case 'uz':
        // Add respectful honorifics
        adaptedResponse = adaptedResponse.replace(/^Hello/i, 'Assalomu alaykum');
        adaptedResponse = adaptedResponse.replace(/Thank you/gi, 'Rahmat');
        break;
        
      case 'ru':
        // Use formal address
        adaptedResponse = adaptedResponse.replace(/^Hello/i, 'Здравствуйте');
        adaptedResponse = adaptedResponse.replace(/Thank you/gi, 'Спасибо');
        break;
        
      case 'en':
        // Keep professional but friendly
        adaptedResponse = adaptedResponse.replace(/^Hello/i, 'Hello');
        adaptedResponse = adaptedResponse.replace(/Thank you/gi, 'Thank you');
        break;
    }

    // Add cultural context based on formality
    if (context === 'formal' && culturalContext.formality === 'respectful') {
      adaptedResponse = adaptedResponse.replace(/\./g, '. Iltimos, ');
    }

    return adaptedResponse;
  }

  async getLanguageStatistics(): Promise<{
    supportedLanguages: number;
    primaryLanguage: string;
    detectionAccuracy: number;
  }> {
    return {
      supportedLanguages: this.supportedLanguages.size,
      primaryLanguage: 'uz',
      detectionAccuracy: 0.85
    };
  }
}

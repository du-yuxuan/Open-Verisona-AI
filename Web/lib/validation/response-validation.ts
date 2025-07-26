// Comprehensive response validation and quality assessment system
import { z } from 'zod';
import { QuestionType } from '@/lib/db/schema';

export interface ResponseValidationResult {
  isValid: boolean;
  score: number; // 0-100 quality score
  errors: string[];
  warnings: string[];
  suggestions: string[];
  metadata: {
    completeness: number;
    thoughtfulness: number;
    authenticity: number;
    clarity: number;
  };
}

export interface ResponseAnalytics {
  responseTime: number;
  revisionCount: number;
  characterCount: number;
  wordCount: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  themes?: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

// Validation schemas for different question types
const validationSchemas = {
  [QuestionType.MULTIPLE_CHOICE]: z.object({
    response: z.string().min(1, 'Please select an option'),
    questionOptions: z.object({
      choices: z.array(z.object({
        value: z.string(),
        label: z.string(),
      }))
    })
  }),

  [QuestionType.TEXT]: z.object({
    response: z.string()
      .min(1, 'Response is required')
      .max(500, 'Response is too long (max 500 characters)'),
    questionOptions: z.object({
      maxLength: z.number().optional(),
      minLength: z.number().optional(),
    }).optional()
  }),

  [QuestionType.TEXTAREA]: z.object({
    response: z.string()
      .min(10, 'Please provide a more detailed response (at least 10 characters)')
      .max(2000, 'Response is too long (max 2000 characters)'),
    questionOptions: z.object({
      maxLength: z.number().optional(),
      minLength: z.number().optional(),
    }).optional()
  }),

  [QuestionType.SCALE]: z.object({
    response: z.number()
      .min(1, 'Please select a value on the scale')
      .max(10, 'Value must be within the scale range'),
    questionOptions: z.object({
      scale: z.object({
        min: z.number(),
        max: z.number(),
        step: z.number().optional(),
      })
    })
  }),

  [QuestionType.BOOLEAN]: z.object({
    response: z.boolean({
      required_error: 'Please select yes or no',
    }),
    questionOptions: z.object({}).optional()
  }),

  [QuestionType.RANKING]: z.object({
    response: z.array(z.string()).min(1, 'Please rank at least one item'),
    questionOptions: z.object({
      items: z.array(z.object({
        value: z.string(),
        label: z.string(),
      }))
    })
  }),
};

export class ResponseValidator {
  /**
   * Validate a response based on question type and requirements
   */
  static validateResponse(
    questionType: QuestionType,
    response: any,
    questionOptions: any = {},
    isRequired: boolean = false
  ): ResponseValidationResult {
    const result: ResponseValidationResult = {
      isValid: true,
      score: 100,
      errors: [],
      warnings: [],
      suggestions: [],
      metadata: {
        completeness: 100,
        thoughtfulness: 100,
        authenticity: 100,
        clarity: 100,
      }
    };

    try {
      // Basic required validation
      if (isRequired && !response) {
        result.errors.push('This question is required');
        result.isValid = false;
        result.score = 0;
        return result;
      }

      if (!response) {
        return result; // Optional question with no response is valid
      }

      // Type-specific validation
      const schema = validationSchemas[questionType];
      if (schema) {
        const validation = schema.safeParse({ response, questionOptions });
        if (!validation.success) {
          result.errors.push(...validation.error.errors.map(e => e.message));
          result.isValid = false;
          result.score = Math.max(0, result.score - 30);
        }
      }

      // Quality assessment
      ResponseValidator.assessResponseQuality(questionType, response, result);

      return result;
    } catch (error) {
      console.error('Response validation error:', error);
      result.errors.push('Validation failed');
      result.isValid = false;
      result.score = 0;
      return result;
    }
  }

  /**
   * Assess response quality and provide suggestions
   */
  private static assessResponseQuality(
    questionType: QuestionType,
    response: any,
    result: ResponseValidationResult
  ): void {
    switch (questionType) {
      case QuestionType.TEXT:
      case QuestionType.TEXTAREA:
        ResponseValidator.assessTextQuality(response, result);
        break;
      case QuestionType.SCALE:
        ResponseValidator.assessScaleQuality(response, result);
        break;
      case QuestionType.RANKING:
        ResponseValidator.assessRankingQuality(response, result);
        break;
      default:
        // Other types have basic validation only
        break;
    }
  }

  /**
   * Assess text response quality
   */
  private static assessTextQuality(text: string, result: ResponseValidationResult): void {
    if (!text || typeof text !== 'string') return;

    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    // Completeness assessment
    if (wordCount < 3) {
      result.warnings.push('Consider providing a more detailed response');
      result.metadata.completeness = 40;
      result.score -= 15;
    } else if (wordCount < 10) {
      result.metadata.completeness = 70;
      result.score -= 5;
    }

    // Thoughtfulness assessment
    if (sentences === 0) {
      result.warnings.push('Your response seems incomplete');
      result.metadata.thoughtfulness = 30;
      result.score -= 20;
    } else if (sentences === 1 && wordCount > 15) {
      result.suggestions.push('Consider breaking your response into multiple sentences for clarity');
      result.metadata.clarity = 80;
    }

    // Check for authenticity indicators
    const genericPhrases = ['i dont know', 'not sure', 'maybe', 'i guess'];
    const hasGenericPhrases = genericPhrases.some(phrase => 
      text.toLowerCase().includes(phrase)
    );

    if (hasGenericPhrases && wordCount < 10) {
      result.suggestions.push('Try to be more specific about your thoughts and feelings');
      result.metadata.authenticity = 60;
      result.score -= 10;
    }

    // Positive indicators
    if (wordCount >= 20 && sentences >= 2) {
      result.suggestions.push('Great job providing a thoughtful, detailed response!');
    }
  }

  /**
   * Assess scale response quality
   */
  private static assessScaleQuality(value: number, result: ResponseValidationResult): void {
    // Check for extreme values without context
    if (value === 1 || value === 10) {
      result.suggestions.push(
        'Extreme values are perfectly valid! You might consider explaining your reasoning in follow-up questions.'
      );
    }

    // Middle values might indicate uncertainty
    if (value === 5 || value === 6) {
      result.suggestions.push(
        'You chose a middle value. This might indicate mixed feelings - that\'s completely normal!'
      );
    }
  }

  /**
   * Assess ranking response quality
   */
  private static assessRankingQuality(rankings: string[], result: ResponseValidationResult): void {
    if (!Array.isArray(rankings)) return;

    if (rankings.length < 3) {
      result.suggestions.push('Consider ranking more items to give us better insights into your preferences');
      result.metadata.completeness = 70;
      result.score -= 10;
    }

    if (rankings.length >= 5) {
      result.suggestions.push('Excellent! Your comprehensive ranking helps us understand your priorities better.');
    }
  }

  /**
   * Generate response analytics
   */
  static generateAnalytics(
    response: any,
    questionType: QuestionType,
    timeSpent: number = 0,
    revisionCount: number = 0
  ): ResponseAnalytics {
    const analytics: ResponseAnalytics = {
      responseTime: timeSpent,
      revisionCount,
      characterCount: 0,
      wordCount: 0,
      complexity: 'simple'
    };

    if (typeof response === 'string') {
      analytics.characterCount = response.length;
      analytics.wordCount = response.trim().split(/\s+/).length;
      
      // Determine complexity
      if (analytics.wordCount > 50) {
        analytics.complexity = 'complex';
      } else if (analytics.wordCount > 15) {
        analytics.complexity = 'moderate';
      }

      // Basic sentiment analysis
      const positiveWords = ['happy', 'excited', 'love', 'great', 'awesome', 'amazing', 'wonderful'];
      const negativeWords = ['sad', 'worried', 'anxious', 'difficult', 'hard', 'challenging', 'frustrated'];
      
      const lowerResponse = response.toLowerCase();
      const positiveCount = positiveWords.filter(word => lowerResponse.includes(word)).length;
      const negativeCount = negativeWords.filter(word => lowerResponse.includes(word)).length;
      
      if (positiveCount > negativeCount) {
        analytics.sentiment = 'positive';
      } else if (negativeCount > positiveCount) {
        analytics.sentiment = 'negative';
      } else {
        analytics.sentiment = 'neutral';
      }
    }

    return analytics;
  }

  /**
   * Validate response completeness for questionnaire completion
   */
  static validateCompleteness(
    responses: Array<{ questionId: number; response: any; isRequired: boolean; questionType: QuestionType }>
  ): { canComplete: boolean; missingRequired: number; suggestions: string[] } {
    const missingRequired = responses.filter(r => r.isRequired && !r.response).length;
    const suggestions: string[] = [];

    if (missingRequired > 0) {
      suggestions.push(`Please complete ${missingRequired} required question${missingRequired > 1 ? 's' : ''}`);
    }

    // Check for quality issues
    const textResponses = responses.filter(r => 
      r.response && (r.questionType === QuestionType.TEXT || r.questionType === QuestionType.TEXTAREA)
    );

    const shortResponses = textResponses.filter(r => 
      typeof r.response === 'string' && r.response.trim().split(/\s+/).length < 5
    ).length;

    if (shortResponses > textResponses.length / 2) {
      suggestions.push('Consider adding more detail to your text responses for better insights');
    }

    return {
      canComplete: missingRequired === 0,
      missingRequired,
      suggestions
    };
  }
}

// Export validation functions for easy use
export const validateResponse = ResponseValidator.validateResponse;
export const generateAnalytics = ResponseValidator.generateAnalytics;
export const validateCompleteness = ResponseValidator.validateCompleteness;
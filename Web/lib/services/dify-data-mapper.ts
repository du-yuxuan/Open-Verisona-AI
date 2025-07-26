// Data mapping service for transforming data between Verisona AI and Dify workflows
// Handles data normalization, transformation, and validation for seamless integration

import { 
  type Question, 
  type User, 
  type QuestionnaireResponse,
  QuestionType 
} from '@/lib/db/schema';
import { 
  type DifyQuestionRequest, 
  type DifyAnalysisRequest 
} from '@/lib/config/dify-config';

export interface UserProfileMapping {
  userId: number;
  demographics: {
    firstName?: string;
    lastName?: string;
    graduationYear?: number;
    schoolName?: string;
    grade?: string;
    location?: string;
  };
  characteristics: {
    equityEligible: boolean;
    firstGeneration?: boolean;
    financialNeedLevel?: 'low' | 'medium' | 'high';
    learningStyle?: string[];
    personalityTraits?: Record<string, number>;
  };
  preferences: {
    collegeTypes?: string[];
    majorInterests?: string[];
    activityPreferences?: string[];
    geographicPreferences?: string[];
    culturalValues?: string[];
  };
  goals: {
    careerAspirations?: string[];
    academicGoals?: string[];
    personalGrowthAreas?: string[];
    impactAreas?: string[];
  };
}

export interface ResponseContextMapping {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  category: string;
  response: {
    value: any;
    text?: string;
    score?: number;
    options?: any;
  };
  metadata: {
    timeSpent: number;
    revisionCount: number;
    qualityScore?: number;
    sentiment?: string;
    complexity?: string;
    confidence?: number;
  };
  analytics: {
    wordCount?: number;
    characterCount?: number;
    themes?: string[];
    emotions?: string[];
    authenticity_indicators?: string[];
  };
}

export class DifyDataMapper {
  /**
   * Map user profile data for Dify consumption
   */
  static mapUserProfile(user: User): UserProfileMapping {
    return {
      userId: user.id,
      demographics: {
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        graduationYear: user.graduationYear || undefined,
        schoolName: user.schoolName || undefined,
        grade: this.calculateGrade(user.graduationYear),
        location: user.location || undefined,
      },
      characteristics: {
        equityEligible: user.equityEligible || false,
        firstGeneration: user.firstGeneration || false,
        financialNeedLevel: this.inferFinancialNeed(user),
        learningStyle: this.extractLearningStyle(user.preferences),
        personalityTraits: this.extractPersonalityTraits(user.preferences),
      },
      preferences: {
        collegeTypes: this.extractCollegeTypes(user.preferences),
        majorInterests: this.extractMajorInterests(user.preferences),
        activityPreferences: this.extractActivityPreferences(user.preferences),
        geographicPreferences: this.extractGeographicPreferences(user.preferences),
        culturalValues: this.extractCulturalValues(user.preferences),
      },
      goals: {
        careerAspirations: this.extractCareerAspirations(user.preferences),
        academicGoals: this.extractAcademicGoals(user.preferences),
        personalGrowthAreas: this.extractGrowthAreas(user.preferences),
        impactAreas: this.extractImpactAreas(user.preferences),
      },
    };
  }

  /**
   * Map response data with enriched context for Dify analysis
   */
  static mapResponseContext(
    responses: Array<{
      question: Question;
      response: any;
      metadata?: any;
    }>
  ): ResponseContextMapping[] {
    return responses.map(({ question, response, metadata }) => ({
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      category: question.category || 'general',
      response: {
        value: response,
        text: typeof response === 'string' ? response : undefined,
        score: typeof response === 'number' ? response : undefined,
        options: question.options,
      },
      metadata: {
        timeSpent: metadata?.timeSpent || 0,
        revisionCount: metadata?.revisionCount || 0,
        qualityScore: metadata?.validation?.score,
        sentiment: metadata?.analytics?.sentiment,
        complexity: metadata?.analytics?.complexity,
        confidence: metadata?.validation?.metadata?.authenticity,
      },
      analytics: {
        wordCount: metadata?.analytics?.wordCount,
        characterCount: metadata?.analytics?.characterCount,
        themes: this.extractThemes(response, question.category),
        emotions: this.extractEmotions(response),
        authenticity_indicators: this.extractAuthenticityIndicators(response, metadata),
      },
    }));
  }

  /**
   * Build comprehensive Dify question generation request
   */
  static buildQuestionRequest(
    user: User,
    sessionId: string,
    previousResponses: ResponseContextMapping[],
    context: {
      questionnaireType: string;
      category: string;
      currentQuestionCount: number;
      maxQuestions: number;
      focusAreas?: string[];
      urgency?: 'low' | 'medium' | 'high';
    }
  ): DifyQuestionRequest {
    const userProfile = this.mapUserProfile(user);
    
    return {
      userId: user.id,
      sessionId,
      previousResponses: previousResponses.map(r => ({
        questionId: r.questionId,
        questionText: r.questionText,
        response: r.response.value,
        category: r.category,
        timestamp: new Date().toISOString(),
      })),
      userProfile: {
        firstName: userProfile.demographics.firstName,
        lastName: userProfile.demographics.lastName,
        graduationYear: userProfile.demographics.graduationYear,
        schoolName: userProfile.demographics.schoolName,
        preferences: {
          ...userProfile.preferences,
          ...userProfile.goals,
          characteristics: userProfile.characteristics,
        },
        equityEligible: userProfile.characteristics.equityEligible,
      },
      context: {
        questionnaireType: context.questionnaireType,
        category: context.category,
        currentQuestionCount: context.currentQuestionCount,
        maxQuestions: context.maxQuestions,
        focusAreas: context.focusAreas || this.inferFocusAreas(previousResponses),
        urgency: context.urgency || this.inferUrgency(previousResponses),
      },
    };
  }

  /**
   * Build comprehensive Dify analysis request
   */
  static buildAnalysisRequest(
    user: User,
    sessionId: string,
    responses: ResponseContextMapping[],
    analysisType: 'personality' | 'academic' | 'college_match' | 'comprehensive',
    options?: {
      includeRecommendations?: boolean;
      includeCollegeMatches?: boolean;
      includeEssayGuidance?: boolean;
      detailLevel?: 'summary' | 'detailed' | 'comprehensive';
    }
  ): DifyAnalysisRequest {
    const userProfile = this.mapUserProfile(user);
    
    return {
      userId: user.id,
      sessionId,
      responses: responses.map(r => ({
        questionId: r.questionId,
        questionText: r.questionText,
        questionType: r.questionType,
        response: r.response.value,
        category: r.category,
        timeSpent: r.metadata.timeSpent,
        qualityScore: r.metadata.qualityScore,
        metadata: {
          sentiment: r.metadata.sentiment,
          complexity: r.metadata.complexity,
          themes: r.analytics.themes,
          authenticity: r.analytics.authenticity_indicators,
        },
      })),
      userProfile: {
        demographics: userProfile.demographics,
        characteristics: userProfile.characteristics,
        preferences: userProfile.preferences,
        goals: userProfile.goals,
      },
      analysisType,
      options: {
        includeRecommendations: options?.includeRecommendations ?? true,
        includeCollegeMatches: options?.includeCollegeMatches ?? true,
        includeEssayGuidance: options?.includeEssayGuidance ?? false,
        detailLevel: options?.detailLevel ?? 'detailed',
      },
    };
  }

  // Helper methods for data extraction and inference
  private static calculateGrade(graduationYear?: number): string | undefined {
    if (!graduationYear) return undefined;
    const currentYear = new Date().getFullYear();
    const grade = 12 - (graduationYear - currentYear);
    return grade >= 9 && grade <= 12 ? `${grade}th` : undefined;
  }

  private static inferFinancialNeed(user: User): 'low' | 'medium' | 'high' | undefined {
    if (user.equityEligible) return 'high';
    // Could implement more sophisticated inference based on user data
    return undefined;
  }

  private static extractLearningStyle(preferences: any): string[] {
    const styles = [];
    if (preferences?.learningStyle) {
      if (Array.isArray(preferences.learningStyle)) {
        styles.push(...preferences.learningStyle);
      } else {
        styles.push(preferences.learningStyle);
      }
    }
    return styles;
  }

  private static extractPersonalityTraits(preferences: any): Record<string, number> {
    return preferences?.personalityTraits || {};
  }

  private static extractCollegeTypes(preferences: any): string[] {
    return preferences?.collegeTypes || [];
  }

  private static extractMajorInterests(preferences: any): string[] {
    return preferences?.majors || preferences?.academicInterests || [];
  }

  private static extractActivityPreferences(preferences: any): string[] {
    return preferences?.activities || preferences?.extracurriculars || [];
  }

  private static extractGeographicPreferences(preferences: any): string[] {
    return preferences?.geography || preferences?.location || [];
  }

  private static extractCulturalValues(preferences: any): string[] {
    return preferences?.values || preferences?.culture || [];
  }

  private static extractCareerAspirations(preferences: any): string[] {
    return preferences?.career || preferences?.careerGoals || [];
  }

  private static extractAcademicGoals(preferences: any): string[] {
    return preferences?.academic || preferences?.academicGoals || [];
  }

  private static extractGrowthAreas(preferences: any): string[] {
    return preferences?.growth || preferences?.personalGrowth || [];
  }

  private static extractImpactAreas(preferences: any): string[] {
    return preferences?.impact || preferences?.socialImpact || [];
  }

  private static extractThemes(response: any, category: string): string[] {
    const themes = [];
    
    if (typeof response === 'string') {
      const text = response.toLowerCase();
      
      // Extract themes based on category and content
      const themePatterns = {
        personality: ['leadership', 'creativity', 'collaboration', 'independence', 'empathy'],
        academic: ['research', 'learning', 'discovery', 'knowledge', 'innovation'],
        values: ['justice', 'equality', 'service', 'growth', 'authenticity', 'integrity'],
        career: ['impact', 'success', 'fulfillment', 'challenge', 'stability'],
        social: ['community', 'relationships', 'diversity', 'inclusion', 'connection'],
      };

      const categoryPatterns = themePatterns[category] || [];
      categoryPatterns.forEach(theme => {
        if (text.includes(theme)) {
          themes.push(theme);
        }
      });
    }
    
    return themes;
  }

  private static extractEmotions(response: any): string[] {
    const emotions = [];
    
    if (typeof response === 'string') {
      const text = response.toLowerCase();
      const emotionPatterns = {
        positive: ['excited', 'happy', 'passionate', 'enthusiastic', 'motivated', 'confident'],
        negative: ['worried', 'anxious', 'frustrated', 'disappointed', 'confused', 'overwhelmed'],
        neutral: ['curious', 'thoughtful', 'reflective', 'contemplative', 'analytical'],
      };

      Object.entries(emotionPatterns).forEach(([category, patterns]) => {
        patterns.forEach(emotion => {
          if (text.includes(emotion)) {
            emotions.push(`${category}:${emotion}`);
          }
        });
      });
    }
    
    return emotions;
  }

  private static extractAuthenticityIndicators(response: any, metadata?: any): string[] {
    const indicators = [];
    
    if (metadata?.validation?.metadata) {
      const { authenticity, thoughtfulness, clarity } = metadata.validation.metadata;
      
      if (authenticity > 80) indicators.push('highly_authentic');
      if (thoughtfulness > 80) indicators.push('deeply_thoughtful');
      if (clarity > 80) indicators.push('clearly_expressed');
      
      if (metadata.analytics?.complexity === 'complex') {
        indicators.push('complex_thinking');
      }
    }
    
    return indicators;
  }

  private static inferFocusAreas(responses: ResponseContextMapping[]): string[] {
    const areas = new Set<string>();
    
    responses.forEach(response => {
      areas.add(response.category);
      response.analytics.themes?.forEach(theme => areas.add(theme));
    });
    
    return Array.from(areas);
  }

  private static inferUrgency(responses: ResponseContextMapping[]): 'low' | 'medium' | 'high' {
    // Infer urgency based on response patterns and user engagement
    const avgTimeSpent = responses.reduce((sum, r) => sum + r.metadata.timeSpent, 0) / responses.length;
    const revisionRate = responses.filter(r => r.metadata.revisionCount > 0).length / responses.length;
    
    if (avgTimeSpent > 120 && revisionRate > 0.3) return 'high'; // Highly engaged
    if (avgTimeSpent > 60 || revisionRate > 0.1) return 'medium'; // Moderately engaged
    return 'low'; // Quick responses
  }
}

export default DifyDataMapper;
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getAnalyticsService } from '@/lib/services/analytics-service';

export function useAnalytics() {
  const analyticsService = useRef(getAnalyticsService());
  const pathname = usePathname();

  // Track page views automatically
  useEffect(() => {
    analyticsService.current.trackPageView();
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      analyticsService.current.destroy();
    };
  }, []);

  // Return tracking functions
  return {
    // General event tracking
    trackEvent: useCallback((eventData: {
      eventType?: string;
      eventCategory?: string;
      eventAction: string;
      eventLabel?: string;
      eventValue?: number;
      properties?: Record<string, any>;
    }) => {
      analyticsService.current.trackEvent(eventData);
    }, []),

    // Specific tracking methods
    trackClick: useCallback((elementId: string, elementText?: string, category?: string) => {
      analyticsService.current.trackClick(elementId, elementText, category);
    }, []),

    trackFormSubmit: useCallback((formId: string, formType?: string) => {
      analyticsService.current.trackFormSubmit(formId, formType);
    }, []),

    trackQuestionnaireStart: useCallback((questionnaireId: number, questionnaireType: string) => {
      analyticsService.current.trackQuestionnaireStart(questionnaireId, questionnaireType);
    }, []),

    trackQuestionnaireComplete: useCallback((questionnaireId: number, completionTime: number) => {
      analyticsService.current.trackQuestionnaireComplete(questionnaireId, completionTime);
    }, []),

    trackFeatureUsage: useCallback((featureName: string, category: string, success?: boolean) => {
      analyticsService.current.trackFeatureUsage(featureName, category, success);
    }, []),

    trackAccessibilityUsage: useCallback((feature: string, enabled: boolean) => {
      analyticsService.current.trackAccessibilityUsage(feature, enabled);
    }, []),

    trackSearch: useCallback((query: string, results: number) => {
      analyticsService.current.trackSearch(query, results);
    }, []),

    trackError: useCallback((error: Error, context?: any) => {
      analyticsService.current.trackError(error, context);
    }, []),

    // User identification
    setUserId: useCallback((userId: number) => {
      analyticsService.current.setUserId(userId);
    }, []),

    // Questionnaire-specific analytics
    trackQuestionnaireAnalytics: useCallback((data: {
      questionnaireId: number;
      sessionId?: string;
      startTime: Date;
      endTime?: Date;
      questionsAnswered: number;
      questionsSkipped: number;
      questionsRevised: number;
      pauseCount: number;
      totalPauseTime: number;
      backtrackCount: number;
      dynamicQuestionsGenerated: number;
      finalStatus: 'completed' | 'abandoned' | 'partial';
      droppedAtQuestion?: number;
    }) => {
      analyticsService.current.trackQuestionnaireAnalytics(data);
    }, []),
  };
}

// Hook specifically for questionnaire tracking
export function useQuestionnaireAnalytics(questionnaireId: number, sessionId?: string) {
  const { trackQuestionnaireAnalytics, trackFeatureUsage, trackEvent } = useAnalytics();
  const startTime = useRef<Date>(new Date());
  const currentQuestionRef = useRef<number>(0);
  const analyticsData = useRef({
    questionsAnswered: 0,
    questionsSkipped: 0,
    questionsRevised: 0,
    pauseCount: 0,
    totalPauseTime: 0,
    backtrackCount: 0,
    dynamicQuestionsGenerated: 0,
    pauseStartTime: null as Date | null,
  });

  const trackQuestionAnswer = useCallback((questionNumber: number, revised: boolean = false) => {
    if (revised) {
      analyticsData.current.questionsRevised++;
    } else {
      analyticsData.current.questionsAnswered++;
    }

    // Track backtracking
    if (questionNumber < currentQuestionRef.current) {
      analyticsData.current.backtrackCount++;
    }

    currentQuestionRef.current = Math.max(currentQuestionRef.current, questionNumber);

    trackEvent({
      eventType: 'questionnaire_interaction',
      eventCategory: 'engagement',
      eventAction: revised ? 'question_revised' : 'question_answered',
      eventValue: questionNumber,
      properties: {
        questionnaireId,
        sessionId,
        questionNumber,
        revised
      }
    });
  }, [trackEvent, questionnaireId, sessionId]);

  const trackQuestionSkip = useCallback((questionNumber: number) => {
    analyticsData.current.questionsSkipped++;
    
    trackEvent({
      eventType: 'questionnaire_interaction',
      eventCategory: 'engagement',
      eventAction: 'question_skipped',
      eventValue: questionNumber,
      properties: {
        questionnaireId,
        sessionId,
        questionNumber
      }
    });
  }, [trackEvent, questionnaireId, sessionId]);

  const trackPause = useCallback(() => {
    analyticsData.current.pauseCount++;
    analyticsData.current.pauseStartTime = new Date();
    
    trackEvent({
      eventType: 'questionnaire_interaction',
      eventCategory: 'engagement',
      eventAction: 'questionnaire_paused',
      properties: {
        questionnaireId,
        sessionId,
        pauseCount: analyticsData.current.pauseCount
      }
    });
  }, [trackEvent, questionnaireId, sessionId]);

  const trackResume = useCallback(() => {
    if (analyticsData.current.pauseStartTime) {
      const pauseDuration = new Date().getTime() - analyticsData.current.pauseStartTime.getTime();
      analyticsData.current.totalPauseTime += Math.floor(pauseDuration / 1000);
      analyticsData.current.pauseStartTime = null;
    }
    
    trackEvent({
      eventType: 'questionnaire_interaction',
      eventCategory: 'engagement',
      eventAction: 'questionnaire_resumed',
      properties: {
        questionnaireId,
        sessionId,
        totalPauseTime: analyticsData.current.totalPauseTime
      }
    });
  }, [trackEvent, questionnaireId, sessionId]);

  const trackDynamicQuestionGenerated = useCallback(() => {
    analyticsData.current.dynamicQuestionsGenerated++;
    
    trackFeatureUsage('dynamic_question_generation', 'ai', true);
    
    trackEvent({
      eventType: 'ai_interaction',
      eventCategory: 'ai',
      eventAction: 'dynamic_question_generated',
      eventValue: analyticsData.current.dynamicQuestionsGenerated,
      properties: {
        questionnaireId,
        sessionId,
        totalGenerated: analyticsData.current.dynamicQuestionsGenerated
      }
    });
  }, [trackFeatureUsage, trackEvent, questionnaireId, sessionId]);

  const trackQuestionnaireComplete = useCallback((finalStatus: 'completed' | 'abandoned' | 'partial', droppedAtQuestion?: number) => {
    const endTime = new Date();
    const totalDuration = Math.floor((endTime.getTime() - startTime.current.getTime()) / 1000);
    
    trackQuestionnaireAnalytics({
      questionnaireId,
      sessionId,
      startTime: startTime.current,
      endTime,
      questionsAnswered: analyticsData.current.questionsAnswered,
      questionsSkipped: analyticsData.current.questionsSkipped,
      questionsRevised: analyticsData.current.questionsRevised,
      pauseCount: analyticsData.current.pauseCount,
      totalPauseTime: analyticsData.current.totalPauseTime,
      backtrackCount: analyticsData.current.backtrackCount,
      dynamicQuestionsGenerated: analyticsData.current.dynamicQuestionsGenerated,
      finalStatus,
      droppedAtQuestion,
    });

    trackEvent({
      eventType: 'questionnaire',
      eventCategory: finalStatus === 'completed' ? 'conversion' : 'engagement',
      eventAction: `questionnaire_${finalStatus}`,
      eventValue: totalDuration,
      properties: {
        questionnaireId,
        sessionId,
        totalDuration,
        finalStatus,
        droppedAtQuestion,
        ...analyticsData.current
      }
    });
  }, [trackQuestionnaireAnalytics, trackEvent, questionnaireId, sessionId]);

  return {
    trackQuestionAnswer,
    trackQuestionSkip,
    trackPause,
    trackResume,
    trackDynamicQuestionGenerated,
    trackQuestionnaireComplete,
    analytics: analyticsData.current,
  };
}

// Hook for tracking feature usage patterns
export function useFeatureAnalytics() {
  const { trackFeatureUsage, trackEvent } = useAnalytics();

  const trackButtonClick = useCallback((buttonId: string, context?: string) => {
    trackFeatureUsage(`button_${buttonId}`, 'interaction', true);
    trackEvent({
      eventType: 'click',
      eventCategory: 'interaction',
      eventAction: 'button_click',
      eventLabel: buttonId,
      properties: { buttonId, context }
    });
  }, [trackFeatureUsage, trackEvent]);

  const trackModalOpen = useCallback((modalId: string) => {
    trackFeatureUsage(`modal_${modalId}`, 'interaction', true);
    trackEvent({
      eventType: 'modal',
      eventCategory: 'interaction',
      eventAction: 'modal_open',
      eventLabel: modalId,
      properties: { modalId }
    });
  }, [trackFeatureUsage, trackEvent]);

  const trackDownload = useCallback((fileName: string, fileType: string) => {
    trackFeatureUsage('file_download', 'conversion', true);
    trackEvent({
      eventType: 'download',
      eventCategory: 'conversion',
      eventAction: 'file_download',
      eventLabel: fileName,
      properties: { fileName, fileType }
    });
  }, [trackFeatureUsage, trackEvent]);

  const trackShare = useCallback((shareType: string, content: string) => {
    trackFeatureUsage('content_share', 'social', true);
    trackEvent({
      eventType: 'share',
      eventCategory: 'social',
      eventAction: 'content_share',
      eventLabel: shareType,
      properties: { shareType, content }
    });
  }, [trackFeatureUsage, trackEvent]);

  return {
    trackButtonClick,
    trackModalOpen,
    trackDownload,
    trackShare,
  };
}
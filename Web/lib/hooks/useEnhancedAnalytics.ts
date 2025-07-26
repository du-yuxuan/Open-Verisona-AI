'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useAnalyticsContext } from '@/components/analytics/analytics-provider';
import { useAnalytics } from './useAnalytics';

export interface UserBehaviorEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export interface ConversionEvent {
  eventName: string;
  conversionType: 'registration' | 'questionnaire_completion' | 'report_generated' | 'feature_usage';
  value?: number;
  properties?: Record<string, any>;
}

export interface PerformanceEvent {
  metric: string;
  value: number;
  context?: string;
  additionalData?: Record<string, any>;
}

export interface AccessibilityEvent {
  featureName: string;
  enabled: boolean;
  userType?: string;
  assistiveTechnology?: string;
  properties?: Record<string, any>;
}

export function useEnhancedAnalytics() {
  const { analyticsService, isInitialized } = useAnalyticsContext();
  const baseAnalytics = useAnalytics();
  const lastScrollDepth = useRef(0);
  const engagementTimer = useRef<NodeJS.Timeout | null>(null);
  const isEngaged = useRef(false);

  // Track user engagement (time spent, scroll depth, etc.)
  const trackUserEngagement = useCallback((engagementData: {
    timeSpent: number;
    scrollDepth: number;
    interactionCount: number;
    pageUrl: string;
  }) => {
    if (!isInitialized) return;

    analyticsService.trackEvent({
      eventType: 'engagement',
      eventCategory: 'user_behavior',
      eventAction: 'page_engagement',
      eventValue: engagementData.timeSpent,
      properties: {
        scrollDepth: engagementData.scrollDepth,
        interactionCount: engagementData.interactionCount,
        pageUrl: engagementData.pageUrl,
        isEngaged: engagementData.timeSpent > 30, // 30 seconds threshold
        timestamp: new Date().toISOString(),
      }
    });
  }, [analyticsService, isInitialized]);

  // Track scroll depth
  const trackScrollDepth = useCallback(() => {
    if (!isInitialized) return;

    const scrollDepth = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    // Only track significant scroll milestones
    if (scrollDepth > lastScrollDepth.current + 25) {
      analyticsService.trackEvent({
        eventType: 'engagement',
        eventCategory: 'user_behavior',
        eventAction: 'scroll_depth',
        eventValue: scrollDepth,
        properties: {
          pageUrl: window.location.href,
          scrollDepth,
          timestamp: new Date().toISOString(),
        }
      });
      lastScrollDepth.current = scrollDepth;
    }
  }, [analyticsService, isInitialized]);

  // Track user behavior patterns
  const trackUserBehavior = useCallback((event: UserBehaviorEvent) => {
    if (!isInitialized) return;

    analyticsService.trackEvent({
      eventType: 'user_behavior',
      eventCategory: event.category,
      eventAction: event.action,
      eventLabel: event.label,
      eventValue: event.value,
      properties: {
        ...event.properties,
        timestamp: new Date().toISOString(),
        pathname: window.location.pathname,
      }
    });
  }, [analyticsService, isInitialized]);

  // Track conversion events
  const trackConversion = useCallback((event: ConversionEvent) => {
    if (!isInitialized) return;

    analyticsService.trackEvent({
      eventType: 'conversion',
      eventCategory: event.conversionType,
      eventAction: event.eventName,
      eventValue: event.value,
      properties: {
        ...event.properties,
        conversionType: event.conversionType,
        timestamp: new Date().toISOString(),
        pathname: window.location.pathname,
      }
    });
  }, [analyticsService, isInitialized]);

  // Track feature adoption and usage patterns
  const trackFeatureAdoption = useCallback((featureName: string, adoptionData: {
    isFirstUse: boolean;
    timeToFirstUse?: number;
    usageContext?: string;
    userSegment?: string;
    properties?: Record<string, any>;
  }) => {
    if (!isInitialized) return;

    analyticsService.trackEvent({
      eventType: 'feature_adoption',
      eventCategory: 'product_usage',
      eventAction: adoptionData.isFirstUse ? 'first_use' : 'repeat_use',
      eventLabel: featureName,
      eventValue: adoptionData.timeToFirstUse,
      properties: {
        featureName,
        isFirstUse: adoptionData.isFirstUse,
        timeToFirstUse: adoptionData.timeToFirstUse,
        usageContext: adoptionData.usageContext,
        userSegment: adoptionData.userSegment,
        ...adoptionData.properties,
        timestamp: new Date().toISOString(),
      }
    });
  }, [analyticsService, isInitialized]);

  // Track performance metrics
  const trackPerformanceMetric = useCallback((event: PerformanceEvent) => {
    if (!isInitialized) return;

    analyticsService.trackEvent({
      eventType: 'performance',
      eventCategory: 'technical',
      eventAction: event.metric,
      eventValue: event.value,
      properties: {
        metric: event.metric,
        value: event.value,
        context: event.context,
        ...event.additionalData,
        timestamp: new Date().toISOString(),
      }
    });
  }, [analyticsService, isInitialized]);

  // Track accessibility feature usage
  const trackAccessibilityFeature = useCallback((event: AccessibilityEvent) => {
    if (!isInitialized) return;

    analyticsService.trackAccessibilityUsage(event.featureName, event.enabled);

    // Additional detailed tracking
    analyticsService.trackEvent({
      eventType: 'accessibility',
      eventCategory: 'inclusive_design',
      eventAction: event.enabled ? 'feature_enabled' : 'feature_disabled',
      eventLabel: event.featureName,
      eventValue: event.enabled ? 1 : 0,
      properties: {
        featureName: event.featureName,
        enabled: event.enabled,
        userType: event.userType,
        assistiveTechnology: event.assistiveTechnology,
        ...event.properties,
        timestamp: new Date().toISOString(),
      }
    });
  }, [analyticsService, isInitialized]);

  // Track user segments and demographics
  const trackUserSegment = useCallback((segmentData: {
    userType?: 'student' | 'counselor' | 'parent' | 'administrator';
    demographicCategory?: 'underrepresented' | 'low_income' | 'first_generation' | 'general';
    academicLevel?: 'high_school' | 'undergraduate' | 'graduate' | 'other';
    properties?: Record<string, any>;
  }) => {
    if (!isInitialized) return;

    analyticsService.trackEvent({
      eventType: 'user_segment',
      eventCategory: 'demographics',
      eventAction: 'segment_identification',
      properties: {
        userType: segmentData.userType,
        demographicCategory: segmentData.demographicCategory,
        academicLevel: segmentData.academicLevel,
        ...segmentData.properties,
        timestamp: new Date().toISOString(),
      }
    });
  }, [analyticsService, isInitialized]);

  // Track funnel progression
  const trackFunnelStep = useCallback((funnelName: string, stepName: string, stepData: {
    stepNumber: number;
    completed: boolean;
    timeSpent?: number;
    properties?: Record<string, any>;
  }) => {
    if (!isInitialized) return;

    analyticsService.trackEvent({
      eventType: 'funnel_progression',
      eventCategory: 'user_journey',
      eventAction: stepData.completed ? 'step_completed' : 'step_started',
      eventLabel: `${funnelName}_${stepName}`,
      eventValue: stepData.stepNumber,
      properties: {
        funnelName,
        stepName,
        stepNumber: stepData.stepNumber,
        completed: stepData.completed,
        timeSpent: stepData.timeSpent,
        ...stepData.properties,
        timestamp: new Date().toISOString(),
      }
    });
  }, [analyticsService, isInitialized]);

  // Track A/B test participation
  const trackABTest = useCallback((testName: string, variant: string, outcome?: {
    converted: boolean;
    value?: number;
    properties?: Record<string, any>;
  }) => {
    if (!isInitialized) return;

    analyticsService.trackEvent({
      eventType: 'ab_test',
      eventCategory: 'experimentation',
      eventAction: outcome ? 'test_outcome' : 'test_participation',
      eventLabel: `${testName}_${variant}`,
      eventValue: outcome?.value,
      properties: {
        testName,
        variant,
        converted: outcome?.converted,
        ...outcome?.properties,
        timestamp: new Date().toISOString(),
      }
    });
  }, [analyticsService, isInitialized]);

  // Set up automatic scroll tracking
  useEffect(() => {
    if (!isInitialized) return;

    const handleScroll = () => {
      trackScrollDepth();
    };

    const throttledScrollHandler = throttle(handleScroll, 1000);
    window.addEventListener('scroll', throttledScrollHandler);

    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
    };
  }, [trackScrollDepth, isInitialized]);

  // Set up engagement tracking
  useEffect(() => {
    if (!isInitialized) return;

    const trackEngagement = () => {
      if (!isEngaged.current) {
        isEngaged.current = true;
        analyticsService.trackEvent({
          eventType: 'engagement',
          eventCategory: 'user_behavior',
          eventAction: 'engaged_user',
          properties: {
            engagementThreshold: 30,
            pathname: window.location.pathname,
            timestamp: new Date().toISOString(),
          }
        });
      }
    };

    // Set engagement timer (30 seconds)
    engagementTimer.current = setTimeout(trackEngagement, 30000);

    return () => {
      if (engagementTimer.current) {
        clearTimeout(engagementTimer.current);
      }
    };
  }, [analyticsService, isInitialized]);

  return {
    // Enhanced tracking methods
    trackUserBehavior,
    trackUserEngagement,
    trackScrollDepth,
    trackConversion,
    trackFeatureAdoption,
    trackPerformanceMetric,
    trackAccessibilityFeature,
    trackUserSegment,
    trackFunnelStep,
    trackABTest,
    
    // Original analytics methods
    ...baseAnalytics,
    
    // Analytics service reference
    analyticsService,
    isInitialized,
  };
}

// Utility function to throttle function calls
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), delay);
    }
  };
}
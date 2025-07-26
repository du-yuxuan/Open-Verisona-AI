'use client';

import { useEffect, useRef } from 'react';
import { useEnhancedAnalytics } from '@/lib/hooks/useEnhancedAnalytics';

interface AnalyticsTrackerProps {
  // Component-specific tracking
  componentName: string;
  componentType?: 'page' | 'form' | 'modal' | 'widget' | 'navigation';
  
  // User context
  userId?: number;
  userType?: 'student' | 'counselor' | 'parent' | 'administrator';
  userSegment?: 'underrepresented' | 'low_income' | 'first_generation' | 'general';
  
  // Feature tracking
  featureName?: string;
  featureCategory?: string;
  isFeatureFirstUse?: boolean;
  
  // Performance tracking
  trackPerformance?: boolean;
  performanceThreshold?: number;
  
  // Accessibility tracking
  trackAccessibility?: boolean;
  accessibilityFeatures?: string[];
  
  // Custom properties
  customProperties?: Record<string, any>;
  
  // Children components
  children?: React.ReactNode;
}

export function AnalyticsTracker({
  componentName,
  componentType = 'widget',
  userId,
  userType,
  userSegment,
  featureName,
  featureCategory,
  isFeatureFirstUse = false,
  trackPerformance = false,
  performanceThreshold = 2000,
  trackAccessibility = false,
  accessibilityFeatures = [],
  customProperties = {},
  children
}: AnalyticsTrackerProps) {
  const analytics = useEnhancedAnalytics();
  const componentRef = useRef<HTMLDivElement>(null);
  const mountTime = useRef(Date.now());
  const interactionCount = useRef(0);
  const hasTrackedView = useRef(false);
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Track component view
  useEffect(() => {
    if (!hasTrackedView.current) {
      analytics.trackUserBehavior({
        action: 'component_view',
        category: componentType,
        label: componentName,
        properties: {
          userId,
          userType,
          userSegment,
          mountTime: mountTime.current,
          ...customProperties,
        },
      });
      hasTrackedView.current = true;
    }
  }, [analytics, componentName, componentType, userId, userType, userSegment, customProperties]);

  // Track feature usage
  useEffect(() => {
    if (featureName && featureCategory) {
      analytics.trackFeatureAdoption(featureName, {
        isFirstUse: isFeatureFirstUse,
        usageContext: componentName,
        userSegment,
        properties: {
          featureCategory,
          componentType,
          ...customProperties,
        },
      });
    }
  }, [analytics, featureName, featureCategory, isFeatureFirstUse, componentName, userSegment, componentType, customProperties]);

  // Track user segment
  useEffect(() => {
    if (userType || userSegment) {
      analytics.trackUserSegment({
        userType,
        demographicCategory: userSegment,
        properties: {
          componentContext: componentName,
          ...customProperties,
        },
      });
    }
  }, [analytics, userType, userSegment, componentName, customProperties]);

  // Track performance metrics
  useEffect(() => {
    if (!trackPerformance) return;

    const trackComponentPerformance = () => {
      const renderTime = Date.now() - mountTime.current;
      
      analytics.trackPerformanceMetric({
        metric: 'component_render_time',
        value: renderTime,
        context: componentName,
        additionalData: {
          componentType,
          performanceThreshold,
          isSlowRender: renderTime > performanceThreshold,
          ...customProperties,
        },
      });
    };

    // Track initial render time
    const timer = setTimeout(trackComponentPerformance, 0);

    // Set up performance observer for more detailed metrics
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes(componentName)) {
            analytics.trackPerformanceMetric({
              metric: 'component_performance_measure',
              value: entry.duration,
              context: componentName,
              additionalData: {
                measureName: entry.name,
                startTime: entry.startTime,
                ...customProperties,
              },
            });
          }
        });
      });

      performanceObserver.current.observe({ entryTypes: ['measure'] });
    }

    return () => {
      clearTimeout(timer);
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, [analytics, trackPerformance, componentName, componentType, performanceThreshold, customProperties]);

  // Track accessibility usage
  useEffect(() => {
    if (!trackAccessibility) return;

    const checkAccessibilityFeatures = () => {
      // Check for high contrast mode
      const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      if (hasHighContrast) {
        analytics.trackAccessibilityFeature({
          featureName: 'high_contrast_mode',
          enabled: true,
          userType,
          properties: {
            componentContext: componentName,
            detectedAutomatically: true,
            ...customProperties,
          },
        });
      }

      // Check for reduced motion
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (hasReducedMotion) {
        analytics.trackAccessibilityFeature({
          featureName: 'reduced_motion',
          enabled: true,
          userType,
          properties: {
            componentContext: componentName,
            detectedAutomatically: true,
            ...customProperties,
          },
        });
      }

      // Check for custom accessibility features
      accessibilityFeatures.forEach(feature => {
        const isEnabled = localStorage.getItem(`verisona-${feature}`) === 'true';
        if (isEnabled) {
          analytics.trackAccessibilityFeature({
            featureName: feature,
            enabled: true,
            userType,
            properties: {
              componentContext: componentName,
              detectedFrom: 'localStorage',
              ...customProperties,
            },
          });
        }
      });
    };

    checkAccessibilityFeatures();
  }, [analytics, trackAccessibility, accessibilityFeatures, componentName, userType, customProperties]);

  // Track component interactions
  useEffect(() => {
    if (!componentRef.current) return;

    const handleInteraction = (event: Event) => {
      interactionCount.current++;
      
      analytics.trackUserBehavior({
        action: 'component_interaction',
        category: componentType,
        label: componentName,
        value: interactionCount.current,
        properties: {
          interactionType: event.type,
          userId,
          userType,
          userSegment,
          totalInteractions: interactionCount.current,
          timeFromMount: Date.now() - mountTime.current,
          ...customProperties,
        },
      });
    };

    const element = componentRef.current;
    const events = ['click', 'keydown', 'input', 'change', 'submit', 'focus'];
    
    events.forEach(eventType => {
      element.addEventListener(eventType, handleInteraction);
    });

    return () => {
      events.forEach(eventType => {
        element.removeEventListener(eventType, handleInteraction);
      });
    };
  }, [analytics, componentName, componentType, userId, userType, userSegment, customProperties]);

  // Track component unmount
  useEffect(() => {
    return () => {
      const sessionTime = Date.now() - mountTime.current;
      
      analytics.trackUserBehavior({
        action: 'component_unmount',
        category: componentType,
        label: componentName,
        value: sessionTime,
        properties: {
          sessionTime,
          interactionCount: interactionCount.current,
          engagementRate: interactionCount.current / (sessionTime / 1000),
          userId,
          userType,
          userSegment,
          ...customProperties,
        },
      });
    };
  }, [analytics, componentName, componentType, userId, userType, userSegment, customProperties]);

  if (children) {
    return (
      <div ref={componentRef} data-analytics-component={componentName}>
        {children}
      </div>
    );
  }

  return null;
}

// HOC for wrapping components with analytics
export function withAnalytics<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  analyticsConfig: Omit<AnalyticsTrackerProps, 'children'>
) {
  return function AnalyticsWrappedComponent(props: T) {
    return (
      <AnalyticsTracker {...analyticsConfig}>
        <Component {...props} />
      </AnalyticsTracker>
    );
  };
}

// Hook for manual analytics tracking within components
export function useComponentAnalytics(componentName: string, componentType?: string) {
  const analytics = useEnhancedAnalytics();
  
  return {
    trackInteraction: (interactionType: string, properties?: Record<string, any>) => {
      analytics.trackUserBehavior({
        action: `${componentName}_interaction`,
        category: componentType || 'component',
        label: interactionType,
        properties: {
          componentName,
          interactionType,
          ...properties,
        },
      });
    },
    
    trackError: (error: Error, context?: Record<string, any>) => {
      analytics.trackError(error, {
        componentName,
        componentType,
        ...context,
      });
    },
    
    trackPerformance: (metric: string, value: number, additionalData?: Record<string, any>) => {
      analytics.trackPerformanceMetric({
        metric,
        value,
        context: componentName,
        additionalData: {
          componentType,
          ...additionalData,
        },
      });
    },
    
    trackFeatureUsage: (featureName: string, success: boolean = true, properties?: Record<string, any>) => {
      analytics.trackFeatureUsage(featureName, componentType || 'component', success);
      
      if (properties) {
        analytics.trackUserBehavior({
          action: 'feature_usage',
          category: componentType || 'component',
          label: featureName,
          properties: {
            success,
            componentName,
            ...properties,
          },
        });
      }
    },
  };
}
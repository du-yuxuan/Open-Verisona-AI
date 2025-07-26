'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getAnalyticsService } from '@/lib/services/analytics-service';

interface AnalyticsContextType {
  isInitialized: boolean;
  analyticsService: ReturnType<typeof getAnalyticsService>;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
  userId?: number;
}

export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [analyticsService] = useState(() => getAnalyticsService());
  const pathname = usePathname();

  // Initialize analytics service
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        // Set user ID if provided
        if (userId) {
          analyticsService.setUserId(userId);
        }

        // Track initial page view
        analyticsService.trackPageView();

        // Track performance metrics
        analyticsService.trackWebVitals();

        // Track session start
        analyticsService.trackEvent({
          eventType: 'session',
          eventCategory: 'engagement',
          eventAction: 'app_start',
          properties: {
            pathname,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
      }
    }
  }, [analyticsService, userId, pathname, isInitialized]);

  // Track page views on route changes
  useEffect(() => {
    if (isInitialized) {
      analyticsService.trackPageView();
    }
  }, [pathname, isInitialized, analyticsService]);

  // Track visibility changes
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        analyticsService.trackEvent({
          eventType: 'engagement',
          eventCategory: 'user_behavior',
          eventAction: 'page_hidden',
          properties: {
            pathname,
            timestamp: new Date().toISOString(),
          }
        });
      } else {
        analyticsService.trackEvent({
          eventType: 'engagement',
          eventCategory: 'user_behavior',
          eventAction: 'page_visible',
          properties: {
            pathname,
            timestamp: new Date().toISOString(),
          }
        });
      }
    };

    const handleBeforeUnload = () => {
      analyticsService.trackEvent({
        eventType: 'session',
        eventCategory: 'engagement',
        eventAction: 'page_unload',
        properties: {
          pathname,
          timestamp: new Date().toISOString(),
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [analyticsService, pathname, isInitialized]);

  // Track clicks on interactive elements
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Track clicks on buttons, links, and interactive elements
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.hasAttribute('role')) {
        analyticsService.trackClick(
          target.id || target.className || target.tagName,
          target.textContent?.trim() || target.getAttribute('aria-label') || 'Unknown',
          'ui_interaction'
        );
      }

      // Track clicks on form elements
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        analyticsService.trackEvent({
          eventType: 'form_interaction',
          eventCategory: 'user_input',
          eventAction: 'field_focus',
          eventLabel: target.name || target.id || target.type,
          properties: {
            elementType: target.tagName,
            fieldType: target.getAttribute('type') || 'text',
            fieldName: target.name || target.id,
            pathname,
          }
        });
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [analyticsService, pathname, isInitialized]);

  // Track form submissions
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      if (!form) return;

      analyticsService.trackFormSubmit(
        form.id || form.className || 'unknown_form',
        form.getAttribute('data-form-type') || 'unknown'
      );
    };

    document.addEventListener('submit', handleSubmit);

    return () => {
      document.removeEventListener('submit', handleSubmit);
    };
  }, [analyticsService, isInitialized]);

  // Track errors
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;

    const handleError = (event: ErrorEvent) => {
      analyticsService.trackError(
        new Error(event.message || 'Unknown error'),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          pathname,
          timestamp: new Date().toISOString(),
        }
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analyticsService.trackError(
        new Error(event.reason?.message || 'Unhandled promise rejection'),
        {
          type: 'unhandled_promise_rejection',
          reason: event.reason,
          pathname,
          timestamp: new Date().toISOString(),
        }
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [analyticsService, pathname, isInitialized]);

  return (
    <AnalyticsContext.Provider value={{ isInitialized, analyticsService }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
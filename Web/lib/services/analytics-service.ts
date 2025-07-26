'use client';

import { v4 as uuidv4 } from 'uuid';

// Types for analytics events
export interface AnalyticsEvent {
  eventType: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  properties?: Record<string, any>;
  userId?: number;
  sessionId?: string;
  pageUrl?: string;
  timestamp?: Date;
}

export interface PageViewEvent {
  path: string;
  title?: string;
  referrer?: string;
  userId?: number;
  sessionId?: string;
  loadTime?: number;
  timestamp?: Date;
}

export interface SessionData {
  sessionId: string;
  userId?: number;
  deviceType: string;
  browser: string;
  os: string;
  userAgent: string;
  startTime: Date;
  accessibilityModeUsed?: boolean;
  textToSpeechUsed?: boolean;
  highContrastUsed?: boolean;
}

export interface QuestionnaireAnalyticsData {
  questionnaireId: number;
  userId?: number;
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
  deviceType: string;
  finalStatus: 'completed' | 'abandoned' | 'partial';
  droppedAtQuestion?: number;
}

export interface PerformanceMetrics {
  path: string;
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  userId?: number;
  sessionId?: string;
  connectionType?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

class AnalyticsService {
  private currentSession: SessionData | null = null;
  private eventQueue: any[] = [];
  private isOnline = true;
  private flushInterval: NodeJS.Timeout | null = null;
  private pageStartTime: number = Date.now();
  private currentPath: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSession();
      this.setupPerformanceTracking();
      this.setupOnlineOfflineHandlers();
      this.startEventFlushing();
      this.trackPageView();
    }
  }

  // Session Management
  private initializeSession() {
    const sessionId = this.getOrCreateSessionId();
    const deviceInfo = this.getDeviceInfo();
    
    this.currentSession = {
      sessionId,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      userAgent: navigator.userAgent,
      startTime: new Date(),
    };

    // Track session start
    this.queueEvent({
      eventType: 'session',
      eventCategory: 'engagement',
      eventAction: 'session_start',
      sessionId,
      properties: {
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      }
    });
  }

  private getOrCreateSessionId(): string {
    const sessionKey = 'verisona_session_id';
    const sessionTimeKey = 'verisona_session_time';
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    
    const existingSessionId = sessionStorage.getItem(sessionKey);
    const sessionTime = sessionStorage.getItem(sessionTimeKey);
    
    const now = Date.now();
    
    if (existingSessionId && sessionTime && (now - parseInt(sessionTime)) < sessionTimeout) {
      sessionStorage.setItem(sessionTimeKey, now.toString());
      return existingSessionId;
    }
    
    const newSessionId = uuidv4();
    sessionStorage.setItem(sessionKey, newSessionId);
    sessionStorage.setItem(sessionTimeKey, now.toString());
    
    return newSessionId;
  }

  private getDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    // Detect device type
    let deviceType = 'desktop';
    if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|android/i.test(userAgent)) {
      deviceType = 'mobile';
    }
    
    // Detect browser
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'chrome';
    else if (userAgent.includes('Firefox')) browser = 'firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'safari';
    else if (userAgent.includes('Edge')) browser = 'edge';
    
    // Detect OS
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'windows';
    else if (userAgent.includes('Mac')) os = 'macos';
    else if (userAgent.includes('Linux')) os = 'linux';
    else if (userAgent.includes('Android')) os = 'android';
    else if (userAgent.includes('iOS')) os = 'ios';
    
    return { deviceType, browser, os };
  }

  // Event Tracking
  public trackEvent(event: Partial<AnalyticsEvent>) {
    const fullEvent: AnalyticsEvent = {
      eventType: event.eventType || 'custom',
      eventCategory: event.eventCategory || 'general',
      eventAction: event.eventAction || 'action',
      eventLabel: event.eventLabel,
      eventValue: event.eventValue,
      properties: event.properties,
      userId: this.getCurrentUserId(),
      sessionId: this.currentSession?.sessionId,
      pageUrl: window.location.href,
      timestamp: new Date(),
    };

    this.queueEvent(fullEvent);
  }

  public trackPageView(customPath?: string) {
    const path = customPath || window.location.pathname;
    const title = document.title;
    const referrer = document.referrer;
    
    // Calculate time on previous page
    if (this.currentPath && this.currentPath !== path) {
      const timeOnPage = Math.floor((Date.now() - this.pageStartTime) / 1000);
      this.trackEvent({
        eventType: 'page_exit',
        eventCategory: 'navigation',
        eventAction: 'page_exit',
        eventLabel: this.currentPath,
        eventValue: timeOnPage,
        properties: { timeOnPage }
      });
    }
    
    this.currentPath = path;
    this.pageStartTime = Date.now();
    
    const pageViewEvent: PageViewEvent = {
      path,
      title,
      referrer,
      userId: this.getCurrentUserId(),
      sessionId: this.currentSession?.sessionId,
      timestamp: new Date(),
      loadTime: this.getNavigationTiming()?.loadEventEnd
    };

    this.queueEvent({
      type: 'page_view',
      ...pageViewEvent
    });
  }

  public trackQuestionnaireAnalytics(data: Partial<QuestionnaireAnalyticsData>) {
    const analyticsData: QuestionnaireAnalyticsData = {
      questionnaireId: data.questionnaireId || 0,
      userId: this.getCurrentUserId(),
      sessionId: data.sessionId || this.currentSession?.sessionId,
      startTime: data.startTime || new Date(),
      endTime: data.endTime,
      questionsAnswered: data.questionsAnswered || 0,
      questionsSkipped: data.questionsSkipped || 0,
      questionsRevised: data.questionsRevised || 0,
      pauseCount: data.pauseCount || 0,
      totalPauseTime: data.totalPauseTime || 0,
      backtrackCount: data.backtrackCount || 0,
      dynamicQuestionsGenerated: data.dynamicQuestionsGenerated || 0,
      deviceType: this.currentSession?.deviceType || 'unknown',
      finalStatus: data.finalStatus || 'partial',
      droppedAtQuestion: data.droppedAtQuestion,
    };

    this.queueEvent({
      type: 'questionnaire_analytics',
      ...analyticsData
    });
  }

  public trackFeatureUsage(featureName: string, category: string, success: boolean = true) {
    this.trackEvent({
      eventType: 'feature_usage',
      eventCategory: category,
      eventAction: featureName,
      eventValue: success ? 1 : 0,
      properties: {
        success,
        featureName,
        deviceType: this.currentSession?.deviceType,
        timestamp: new Date()
      }
    });
  }

  public trackAccessibilityUsage(feature: string, enabled: boolean) {
    if (this.currentSession) {
      switch (feature) {
        case 'accessibility_mode':
          this.currentSession.accessibilityModeUsed = enabled;
          break;
        case 'text_to_speech':
          this.currentSession.textToSpeechUsed = enabled;
          break;
        case 'high_contrast':
          this.currentSession.highContrastUsed = enabled;
          break;
      }
    }

    this.trackEvent({
      eventType: 'accessibility',
      eventCategory: 'accessibility',
      eventAction: feature,
      eventValue: enabled ? 1 : 0,
      properties: {
        enabled,
        feature,
        deviceType: this.currentSession?.deviceType
      }
    });
  }

  public trackError(error: Error, context?: any) {
    this.trackEvent({
      eventType: 'error',
      eventCategory: 'error',
      eventAction: error.name,
      eventLabel: error.message,
      properties: {
        stack: error.stack,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date()
      }
    });
  }

  // Performance Tracking
  private setupPerformanceTracking() {
    // Track Core Web Vitals
    if ('web-vital' in window) {
      this.trackWebVitals();
    }

    // Track navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = this.getNavigationTiming();
        if (timing) {
          this.trackPerformanceMetrics({
            path: window.location.pathname,
            ttfb: timing.responseStart - timing.requestStart,
            fcp: timing.loadEventEnd - timing.navigationStart,
            userId: this.getCurrentUserId(),
            sessionId: this.currentSession?.sessionId,
            connectionType: this.getConnectionType(),
            deviceMemory: this.getDeviceMemory(),
            hardwareConcurrency: navigator.hardwareConcurrency
          });
        }
      }, 0);
    });
  }

  private trackWebVitals() {
    // This would integrate with web-vitals library if available
    try {
      // @ts-ignore
      if (typeof getCLS !== 'undefined') {
        // @ts-ignore
        getCLS(this.onPerfEntry.bind(this));
      }
      // @ts-ignore
      if (typeof getFID !== 'undefined') {
        // @ts-ignore
        getFID(this.onPerfEntry.bind(this));
      }
      // @ts-ignore
      if (typeof getFCP !== 'undefined') {
        // @ts-ignore
        getFCP(this.onPerfEntry.bind(this));
      }
      // @ts-ignore
      if (typeof getLCP !== 'undefined') {
        // @ts-ignore
        getLCP(this.onPerfEntry.bind(this));
      }
    } catch (error) {
      // Web vitals library not available
    }
  }

  private onPerfEntry(metric: any) {
    this.trackPerformanceMetrics({
      path: window.location.pathname,
      [metric.name.toLowerCase()]: metric.value,
      userId: this.getCurrentUserId(),
      sessionId: this.currentSession?.sessionId
    });
  }

  private trackPerformanceMetrics(metrics: PerformanceMetrics) {
    this.queueEvent({
      type: 'performance_metrics',
      ...metrics
    });
  }

  private getNavigationTiming() {
    return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  }

  private getConnectionType(): string {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private getDeviceMemory(): number | undefined {
    // @ts-ignore
    return navigator.deviceMemory;
  }

  // Event Queue Management
  private queueEvent(event: any) {
    this.eventQueue.push(event);
    
    // If queue gets too large, flush immediately
    if (this.eventQueue.length >= 50) {
      this.flushEvents();
    }
  }

  private startEventFlushing() {
    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000);

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents(true);
    });

    // Flush events when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushEvents();
      }
    });
  }

  private async flushEvents(sync: boolean = false) {
    if (this.eventQueue.length === 0 || !this.isOnline) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const payload = {
        events: this.validateEventData(events),
        sessionData: this.validateSessionData(this.currentSession),
        timestamp: new Date().toISOString()
      };

      if (sync && navigator.sendBeacon) {
        // Use sendBeacon for synchronous sending during page unload
        navigator.sendBeacon('/api/analytics/events', JSON.stringify(payload));
      } else {
        // Regular async request
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure (with limit to prevent infinite growth)
      if (this.eventQueue.length < 100) {
        this.eventQueue.unshift(...events.slice(-50)); // Keep only recent events
      }
    }
  }

  // Online/Offline handling
  private setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Validation methods to prevent varchar constraint errors
  private validateEventData(events: any[]): any[] {
    return events.map(event => ({
      ...event,
      eventType: event.eventType ? event.eventType.substring(0, 50) : 'custom',
      eventCategory: event.eventCategory ? event.eventCategory.substring(0, 50) : 'general',
      eventAction: event.eventAction ? event.eventAction.substring(0, 100) : 'action',
      eventLabel: event.eventLabel ? event.eventLabel.substring(0, 200) : null,
      path: event.path ? event.path.substring(0, 500) : null,
      title: event.title ? event.title.substring(0, 200) : null,
      referrer: event.referrer ? event.referrer.substring(0, 500) : null,
      pageUrl: event.pageUrl ? event.pageUrl.substring(0, 500) : null,
      properties: event.properties ? {
        ...event.properties,
        elementId: event.properties.elementId ? event.properties.elementId.substring(0, 100) : null,
        elementClass: event.properties.elementClass ? event.properties.elementClass.substring(0, 200) : null,
        featureName: event.properties.featureName ? event.properties.featureName.substring(0, 100) : null,
      } : null,
    }));
  }

  private validateSessionData(session: any): any {
    if (!session) return null;
    return {
      ...session,
      deviceType: session.deviceType ? session.deviceType.substring(0, 20) : null,
      browser: session.browser ? session.browser.substring(0, 50) : null,
      os: session.os ? session.os.substring(0, 50) : null,
    };
  }

  // Utility methods
  private getCurrentUserId(): number | undefined {
    // This would integrate with your auth system
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        return user.id;
      }
    } catch (error) {
      // Handle parsing error
    }
    return undefined;
  }

  public setUserId(userId: number) {
    if (this.currentSession) {
      this.currentSession.userId = userId;
    }
    
    this.trackEvent({
      eventType: 'user_identification',
      eventCategory: 'auth',
      eventAction: 'user_identified',
      eventValue: userId,
      properties: { userId }
    });
  }

  // Public convenience methods
  public trackClick(elementId: string, elementText?: string, category: string = 'interaction') {
    this.trackEvent({
      eventType: 'click',
      eventCategory: category,
      eventAction: 'click',
      eventLabel: elementId,
      properties: {
        elementId,
        elementText,
        xpath: this.getElementXPath(document.getElementById(elementId))
      }
    });
  }

  public trackFormSubmit(formId: string, formType: string = 'general') {
    this.trackEvent({
      eventType: 'form_submit',
      eventCategory: 'conversion',
      eventAction: 'form_submit',
      eventLabel: formId,
      properties: {
        formId,
        formType
      }
    });
  }

  public trackQuestionnaireStart(questionnaireId: number, questionnaireType: string) {
    this.trackEvent({
      eventType: 'questionnaire',
      eventCategory: 'engagement',
      eventAction: 'questionnaire_start',
      eventValue: questionnaireId,
      properties: {
        questionnaireId,
        questionnaireType
      }
    });
  }

  public trackQuestionnaireComplete(questionnaireId: number, completionTime: number) {
    this.trackEvent({
      eventType: 'questionnaire',
      eventCategory: 'conversion',
      eventAction: 'questionnaire_complete',
      eventValue: questionnaireId,
      properties: {
        questionnaireId,
        completionTime,
        completionRate: 100
      }
    });
  }

  public trackSearch(query: string, results: number) {
    this.trackEvent({
      eventType: 'search',
      eventCategory: 'engagement',
      eventAction: 'search',
      eventLabel: query,
      eventValue: results,
      properties: {
        query,
        results,
        queryLength: query.length
      }
    });
  }

  // Helper methods
  private getElementXPath(element: Element | null): string {
    if (!element) return '';
    
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    if (element === document.body) {
      return '/html/body';
    }
    
    let ix = 0;
    const siblings = element.parentNode?.children;
    if (siblings) {
      for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) {
          return this.getElementXPath(element.parentElement) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
          ix++;
        }
      }
    }
    
    return '';
  }

  // Cleanup
  public destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents(true);
  }
}

// Singleton instance
let analyticsServiceInstance: AnalyticsService | null = null;

export const getAnalyticsService = (): AnalyticsService => {
  if (!analyticsServiceInstance && typeof window !== 'undefined') {
    analyticsServiceInstance = new AnalyticsService();
  }
  return analyticsServiceInstance!;
};

export default AnalyticsService;
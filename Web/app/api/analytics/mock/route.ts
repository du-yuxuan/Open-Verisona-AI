import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Mock analytics data for demonstration
    const mockData = {
      timeRange,
      dateRange: {
        start: new Date(Date.now() - (timeRange === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      overview: {
        totalUsers: 245,
        newUsers: 67,
        activeUsers: 189,
        totalSessions: 612,
        avgSessionDuration: 425,
        mobileUsage: 0.45,
        accessibilityUsage: 0.12,
      },
      pages: [
        { path: '/dashboard', views: 156, avgTimeOnPage: 180, avgLoadTime: 850 },
        { path: '/questionnaire', views: 134, avgTimeOnPage: 320, avgLoadTime: 950 },
        { path: '/reports', views: 89, avgTimeOnPage: 240, avgLoadTime: 760 },
        { path: '/profile', views: 67, avgTimeOnPage: 150, avgLoadTime: 680 },
        { path: '/', views: 234, avgTimeOnPage: 90, avgLoadTime: 650 },
      ],
      events: [
        { eventType: 'questionnaire', eventAction: 'started', count: 89, avgValue: 1 },
        { eventType: 'questionnaire', eventAction: 'completed', count: 67, avgValue: 1 },
        { eventType: 'click', eventAction: 'generate_question', count: 45, avgValue: 1 },
        { eventType: 'feature', eventAction: 'accessibility_mode', count: 23, avgValue: 1 },
      ],
      questionnaires: [
        {
          questionnaireId: 1,
          questionnaireName: 'Personal Values Assessment',
          starts: 89,
          completions: 67,
          avgCompletionRate: 0.75,
          avgDuration: 1200,
          avgEngagement: 0.85,
          abandonmentRate: 0.25,
        },
        {
          questionnaireId: 2,
          questionnaireName: 'Academic Goals Survey',
          starts: 72,
          completions: 58,
          avgCompletionRate: 0.81,
          avgDuration: 980,
          avgEngagement: 0.78,
          abandonmentRate: 0.19,
        },
      ],
      features: [
        {
          featureName: 'Dynamic Question Generation',
          category: 'AI',
          totalUsage: 145,
          uniqueUsers: 67,
          successRate: 0.92,
          avgSatisfaction: 4.3,
        },
        {
          featureName: 'Accessibility Mode',
          category: 'Accessibility',
          totalUsage: 89,
          uniqueUsers: 23,
          successRate: 0.98,
          avgSatisfaction: 4.7,
        },
      ],
      performance: {
        avgLcp: 1200,
        avgFid: 85,
        avgCls: 0.12,
        avgFcp: 950,
        avgTtfb: 450,
        performanceScore: 78,
      },
      trends: [
        { date: '2024-01-15', sessions: 45, uniqueUsers: 32, avgDuration: 420, mobilePercentage: 0.44 },
        { date: '2024-01-16', sessions: 52, uniqueUsers: 38, avgDuration: 380, mobilePercentage: 0.46 },
        { date: '2024-01-17', sessions: 48, uniqueUsers: 35, avgDuration: 445, mobilePercentage: 0.42 },
        { date: '2024-01-18', sessions: 61, uniqueUsers: 44, avgDuration: 395, mobilePercentage: 0.48 },
        { date: '2024-01-19', sessions: 55, uniqueUsers: 41, avgDuration: 410, mobilePercentage: 0.45 },
        { date: '2024-01-20', sessions: 58, uniqueUsers: 43, avgDuration: 425, mobilePercentage: 0.47 },
        { date: '2024-01-21', sessions: 49, uniqueUsers: 37, avgDuration: 435, mobilePercentage: 0.43 },
      ],
      demographics: {
        browsers: [
          { browser: 'Chrome', count: 156, percentage: 0.68 },
          { browser: 'Firefox', count: 45, percentage: 0.20 },
          { browser: 'Safari', count: 23, percentage: 0.10 },
          { browser: 'Edge', count: 5, percentage: 0.02 },
        ],
        operatingSystems: [
          { os: 'Windows', count: 123, percentage: 0.54 },
          { os: 'macOS', count: 67, percentage: 0.29 },
          { os: 'Linux', count: 23, percentage: 0.10 },
          { os: 'Android', count: 12, percentage: 0.05 },
          { os: 'iOS', count: 4, percentage: 0.02 },
        ],
        devices: [
          { device: 'Desktop', count: 145 },
          { device: 'Mobile', count: 67 },
          { device: 'Tablet', count: 17 },
        ],
      },
      accessibility: {
        totalAccessibilityUsers: 23,
        textToSpeechUsers: 12,
        highContrastUsers: 15,
        accessibilityPercentage: 0.12,
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Mock analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics data' },
      { status: 500 }
    );
  }
}
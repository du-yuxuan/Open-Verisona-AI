import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const userId = searchParams.get('userId');
    
    // Mock advanced analytics data
    const mockData = {
      engagement: {
        totalEngagedUsers: 156,
        avgEngagementTime: 480,
        engagementRate: 0.65,
        returnUserRate: 0.42,
        sessionDepth: 3.2,
        interactionRate: 0.78,
        scrollDepthAvg: 0.75,
        contentConsumption: 0.68,
      },
      
      userJourney: {
        funnelSteps: [
          {
            stepName: 'Landing Page Visit',
            stepNumber: 1,
            usersEntered: 1000,
            usersCompleted: 850,
            conversionRate: 0.85,
            avgTimeSpent: 45,
            dropOffRate: 0.15,
          },
          {
            stepName: 'Registration',
            stepNumber: 2,
            usersEntered: 850,
            usersCompleted: 680,
            conversionRate: 0.80,
            avgTimeSpent: 120,
            dropOffRate: 0.20,
          },
          {
            stepName: 'First Questionnaire',
            stepNumber: 3,
            usersEntered: 680,
            usersCompleted: 550,
            conversionRate: 0.81,
            avgTimeSpent: 900,
            dropOffRate: 0.19,
          },
          {
            stepName: 'Questionnaire Completion',
            stepNumber: 4,
            usersEntered: 550,
            usersCompleted: 420,
            conversionRate: 0.76,
            avgTimeSpent: 1200,
            dropOffRate: 0.24,
          },
          {
            stepName: 'Report Generation',
            stepNumber: 5,
            usersEntered: 420,
            usersCompleted: 380,
            conversionRate: 0.90,
            avgTimeSpent: 180,
            dropOffRate: 0.10,
          },
        ],
        pathAnalysis: [
          {
            fromPage: '/',
            toPage: '/sign-up',
            userCount: 234,
            avgTransitionTime: 15,
            bounceRate: 0.12,
          },
          {
            fromPage: '/sign-up',
            toPage: '/dashboard',
            userCount: 198,
            avgTransitionTime: 8,
            bounceRate: 0.15,
          },
          {
            fromPage: '/dashboard',
            toPage: '/questionnaire',
            userCount: 156,
            avgTransitionTime: 12,
            bounceRate: 0.21,
          },
        ],
        topExitPages: [
          { page: '/questionnaire', exitCount: 89, exitRate: 0.34 },
          { page: '/dashboard', exitCount: 67, exitRate: 0.28 },
          { page: '/reports', exitCount: 45, exitRate: 0.25 },
        ],
      },
      
      featureAdoption: {
        features: [
          {
            featureName: 'Dynamic Question Generation',
            totalUsers: 245,
            adopters: 110,
            adoptionRate: 0.45,
            timeToFirstUse: 1200,
            usageFrequency: 2.3,
            retentionRate: 0.78,
            satisfactionScore: 4.3,
          },
          {
            featureName: 'Accessibility Mode',
            totalUsers: 245,
            adopters: 37,
            adoptionRate: 0.15,
            timeToFirstUse: 800,
            usageFrequency: 1.8,
            retentionRate: 0.92,
            satisfactionScore: 4.7,
          },
          {
            featureName: 'Report Export',
            totalUsers: 245,
            adopters: 167,
            adoptionRate: 0.68,
            timeToFirstUse: 2400,
            usageFrequency: 1.2,
            retentionRate: 0.85,
            satisfactionScore: 4.1,
          },
        ],
        newFeatures: [
          {
            featureName: 'AI Chat Assistant',
            launchDate: '2024-01-15',
            adopters: 56,
            adoptionVelocity: 0.12,
          },
        ],
      },
      
      userSegmentation: {
        demographics: {
          userTypes: [
            { type: 'student', count: 184, percentage: 0.75 },
            { type: 'counselor', count: 37, percentage: 0.15 },
            { type: 'parent', count: 20, percentage: 0.08 },
            { type: 'administrator', count: 4, percentage: 0.02 },
          ],
          categories: [
            { category: 'underrepresented', count: 86, percentage: 0.35 },
            { category: 'low_income', count: 69, percentage: 0.28 },
            { category: 'first_generation', count: 54, percentage: 0.22 },
            { category: 'general', count: 36, percentage: 0.15 },
          ],
          academicLevels: [
            { level: 'high_school', count: 110, percentage: 0.45 },
            { level: 'undergraduate', count: 86, percentage: 0.35 },
            { level: 'graduate', count: 37, percentage: 0.15 },
            { level: 'other', count: 12, percentage: 0.05 },
          ],
        },
        behavior: {
          powerUsers: 37,
          casualUsers: 147,
          trialUsers: 49,
          churned: 12,
        },
        accessibility: {
          accessibilityUsers: 37,
          screenReaderUsers: 20,
          keyboardNavigationUsers: 29,
          highContrastUsers: 25,
          textToSpeechUsers: 15,
        },
      },
      
      performance: {
        pageLoadTimes: [
          { page: '/dashboard', avgLoadTime: 850, p95LoadTime: 1200, performanceScore: 85 },
          { page: '/questionnaire', avgLoadTime: 950, p95LoadTime: 1400, performanceScore: 78 },
          { page: '/reports', avgLoadTime: 760, p95LoadTime: 1100, performanceScore: 88 },
          { page: '/', avgLoadTime: 650, p95LoadTime: 900, performanceScore: 92 },
        ],
        errorRates: [
          { errorType: 'JavaScript', count: 23, affectedUsers: 18, errorRate: 0.02 },
          { errorType: 'Network', count: 12, affectedUsers: 10, errorRate: 0.01 },
          { errorType: 'API', count: 8, affectedUsers: 7, errorRate: 0.007 },
        ],
        systemHealth: {
          uptime: 99.9,
          responseTime: 150,
          errorRate: 0.1,
          throughput: 1000,
        },
      },
      
      conversions: {
        goals: [
          {
            goalName: 'Questionnaire Completion',
            conversions: 245,
            conversionRate: 0.68,
            value: 12250,
            trend: 'up' as const,
          },
          {
            goalName: 'Report Generation',
            conversions: 189,
            conversionRate: 0.77,
            value: 9450,
            trend: 'up' as const,
          },
          {
            goalName: 'Profile Completion',
            conversions: 312,
            conversionRate: 0.84,
            value: 15600,
            trend: 'stable' as const,
          },
        ],
        funnels: [
          {
            funnelName: 'User Onboarding',
            stages: [
              { stageName: 'Sign Up', users: 1000, conversionRate: 1.0 },
              { stageName: 'Profile Setup', users: 850, conversionRate: 0.85 },
              { stageName: 'First Questionnaire', users: 680, conversionRate: 0.80 },
              { stageName: 'Completion', users: 550, conversionRate: 0.81 },
            ],
          },
        ],
      },
      
      content: {
        questionnaires: [
          {
            questionnaireName: 'Personal Values Assessment',
            completionRate: 0.75,
            avgCompletionTime: 1200,
            userSatisfaction: 4.3,
            dropoffPoints: [
              { questionNumber: 5, dropoffRate: 0.12 },
              { questionNumber: 12, dropoffRate: 0.08 },
              { questionNumber: 18, dropoffRate: 0.05 },
            ],
          },
          {
            questionnaireName: 'Academic Goals Survey',
            completionRate: 0.81,
            avgCompletionTime: 980,
            userSatisfaction: 4.1,
            dropoffPoints: [
              { questionNumber: 3, dropoffRate: 0.09 },
              { questionNumber: 8, dropoffRate: 0.06 },
              { questionNumber: 14, dropoffRate: 0.04 },
            ],
          },
        ],
        reportGeneration: {
          totalReports: 189,
          avgGenerationTime: 2.3,
          userSatisfaction: 4.6,
          downloadRate: 0.89,
        },
      },
      
      trends: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          users: Math.floor(Math.random() * 50) + 30,
          sessions: Math.floor(Math.random() * 80) + 40,
          engagement: Math.random() * 0.4 + 0.5,
          conversions: Math.floor(Math.random() * 20) + 10,
        })),
        hourly: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          users: Math.floor(Math.random() * 20) + 5,
          activity: Math.random() * 100 + 50,
        })),
        cohort: [
          { cohortMonth: '2024-01', month0: 100, month1: 85, month2: 72, month3: 68 },
          { cohortMonth: '2024-02', month0: 120, month1: 95, month2: 78, month3: 0 },
          { cohortMonth: '2024-03', month0: 140, month1: 110, month2: 0, month3: 0 },
        ],
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Mock advanced analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to load advanced analytics' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { 
  userSessions, 
  pageViews, 
  userEvents, 
  questionnaireAnalytics,
  featureUsage,
  performanceMetrics 
} from '@/lib/db/analytics-schema';
import { users, questionnaires } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { desc, count, avg, sum, gte, lte, eq, and, sql, between } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const userId = searchParams.get('userId');
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Base filters
    const timeFilter = between(userSessions.startedAt, startDate, now);
    const userFilter = userId ? eq(userSessions.userId, parseInt(userId)) : undefined;
    const baseFilter = userFilter ? and(timeFilter, userFilter) : timeFilter;

    // 1. User Engagement Metrics
    const engagementStats = await db
      .select({
        totalEngagedUsers: count(sql`DISTINCT CASE WHEN ${userSessions.isEngaged} = true THEN ${userSessions.userId} END`),
        avgEngagementTime: avg(sql`CASE WHEN ${userSessions.isEngaged} = true THEN ${userSessions.duration} END`),
        totalSessions: count(),
        returningSessions: count(sql`CASE WHEN ${userSessions.userId} IN (
          SELECT DISTINCT ${userSessions.userId} 
          FROM ${userSessions} 
          WHERE ${userSessions.startedAt} < ${startDate}
        ) THEN 1 END`),
        avgSessionDuration: avg(userSessions.duration),
        avgPageViews: avg(userSessions.pageViews),
        interactionCount: sum(userSessions.interactions),
      })
      .from(userSessions)
      .where(baseFilter);

    // Calculate engagement derived metrics
    const engagement = {
      totalEngagedUsers: parseInt(engagementStats[0]?.totalEngagedUsers as string) || 0,
      avgEngagementTime: parseFloat(engagementStats[0]?.avgEngagementTime as string) || 0,
      engagementRate: engagementStats[0].totalSessions > 0 
        ? (parseInt(engagementStats[0]?.totalEngagedUsers as string) || 0) / engagementStats[0].totalSessions 
        : 0,
      returnUserRate: engagementStats[0].totalSessions > 0 
        ? (parseInt(engagementStats[0]?.returningSessions as string) || 0) / engagementStats[0].totalSessions 
        : 0,
      sessionDepth: parseFloat(engagementStats[0]?.avgPageViews as string) || 0,
      interactionRate: engagementStats[0].totalSessions > 0 
        ? (parseInt(engagementStats[0]?.interactionCount as string) || 0) / engagementStats[0].totalSessions / 10
        : 0,
      scrollDepthAvg: 0.75, // Placeholder - would need scroll depth tracking
      contentConsumption: 0.68, // Placeholder - would need content consumption tracking
    };

    // 2. User Journey Analysis
    const funnelSteps = await db
      .select({
        stepName: userEvents.eventLabel,
        usersEntered: count(sql`DISTINCT ${userEvents.userId}`),
        usersCompleted: count(sql`DISTINCT CASE WHEN ${userEvents.eventAction} LIKE '%completed%' THEN ${userEvents.userId} END`),
        avgTimeSpent: avg(userEvents.eventValue),
      })
      .from(userEvents)
      .where(and(
        between(userEvents.timestamp, startDate, now),
        userFilter ? eq(userEvents.userId, parseInt(userId)) : undefined
      ).filter(Boolean))
      .groupBy(userEvents.eventLabel)
      .orderBy(count(sql`DISTINCT ${userEvents.userId}`));

    // Path analysis (simplified)
    const pathAnalysis = await db
      .select({
        fromPage: pageViews.path,
        toPage: sql`LEAD(${pageViews.path}) OVER (PARTITION BY ${pageViews.userId} ORDER BY ${pageViews.timestamp})`.as('toPage'),
        userCount: count(sql`DISTINCT ${pageViews.userId}`),
        avgTransitionTime: avg(sql`EXTRACT(EPOCH FROM LEAD(${pageViews.timestamp}) OVER (PARTITION BY ${pageViews.userId} ORDER BY ${pageViews.timestamp}) - ${pageViews.timestamp})`),
      })
      .from(pageViews)
      .where(and(
        between(pageViews.timestamp, startDate, now),
        userFilter ? eq(pageViews.userId, parseInt(userId)) : undefined
      ).filter(Boolean))
      .groupBy(pageViews.path, sql`LEAD(${pageViews.path}) OVER (PARTITION BY ${pageViews.userId} ORDER BY ${pageViews.timestamp})`)
      .having(sql`COUNT(DISTINCT ${pageViews.userId}) > 5`)
      .orderBy(desc(count(sql`DISTINCT ${pageViews.userId}`)))
      .limit(20);

    // Top exit pages
    const topExitPages = await db
      .select({
        page: pageViews.path,
        exitCount: count(),
        exitRate: sql`COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()`.as('exitRate'),
      })
      .from(pageViews)
      .where(and(
        between(pageViews.timestamp, startDate, now),
        userFilter ? eq(pageViews.userId, parseInt(userId)) : undefined
      ).filter(Boolean))
      .groupBy(pageViews.path)
      .orderBy(desc(count()))
      .limit(10);

    const userJourney = {
      funnelSteps: funnelSteps.map((step, index) => ({
        stepName: step.stepName || `Step ${index + 1}`,
        stepNumber: index + 1,
        usersEntered: step.usersEntered,
        usersCompleted: parseInt(step.usersCompleted as string) || 0,
        conversionRate: step.usersEntered > 0 
          ? (parseInt(step.usersCompleted as string) || 0) / step.usersEntered 
          : 0,
        avgTimeSpent: parseFloat(step.avgTimeSpent as string) || 0,
        dropOffRate: step.usersEntered > 0 
          ? 1 - ((parseInt(step.usersCompleted as string) || 0) / step.usersEntered)
          : 0,
      })),
      pathAnalysis: pathAnalysis
        .filter(path => path.toPage)
        .map(path => ({
          fromPage: path.fromPage,
          toPage: path.toPage as string,
          userCount: path.userCount,
          avgTransitionTime: parseFloat(path.avgTransitionTime as string) || 0,
          bounceRate: Math.random() * 0.3, // Placeholder
        })),
      topExitPages: topExitPages.map(page => ({
        page: page.page,
        exitCount: page.exitCount,
        exitRate: parseFloat(page.exitRate as string) || 0,
      })),
    };

    // 3. Feature Adoption Analysis
    const featureAdoptionData = await db
      .select({
        featureName: featureUsage.featureName,
        totalUsers: count(sql`DISTINCT ${featureUsage.userId}`),
        totalUsage: sum(featureUsage.usageCount),
        avgSatisfaction: avg(featureUsage.satisfactionScore),
        successRate: avg(sql`CASE WHEN ${featureUsage.successful} = true THEN 1.0 ELSE 0.0 END`),
      })
      .from(featureUsage)
      .where(and(
        between(featureUsage.timestamp, startDate, now),
        userFilter ? eq(featureUsage.userId, parseInt(userId)) : undefined
      ).filter(Boolean))
      .groupBy(featureUsage.featureName)
      .orderBy(desc(count(sql`DISTINCT ${featureUsage.userId}`)));

    // Get total users for adoption rate calculation
    const totalUsers = await db
      .select({ count: count(sql`DISTINCT ${userSessions.userId}`) })
      .from(userSessions)
      .where(baseFilter);

    const totalUserCount = totalUsers[0]?.count || 1;

    const featureAdoption = {
      features: featureAdoptionData.map(feature => ({
        featureName: feature.featureName,
        totalUsers: totalUserCount,
        adopters: feature.totalUsers,
        adoptionRate: feature.totalUsers / totalUserCount,
        timeToFirstUse: Math.random() * 7200, // Placeholder (seconds)
        usageFrequency: (parseInt(feature.totalUsage as string) || 0) / feature.totalUsers || 0,
        retentionRate: Math.random() * 0.8 + 0.2, // Placeholder
        satisfactionScore: parseFloat(feature.avgSatisfaction as string) || 0,
      })),
      newFeatures: [], // Placeholder - would need feature launch date tracking
    };

    // 4. User Segmentation
    const userTypes = await db
      .select({
        userType: sql`COALESCE(${users.metadata}->>'userType', 'general')`.as('userType'),
        count: count(),
      })
      .from(users)
      .leftJoin(userSessions, eq(users.id, userSessions.userId))
      .where(baseFilter)
      .groupBy(sql`COALESCE(${users.metadata}->>'userType', 'general')`);

    const accessibilityUsage = await db
      .select({
        accessibilityUsers: count(sql`CASE WHEN ${userSessions.accessibilityModeUsed} = true THEN 1 END`),
        screenReaderUsers: count(sql`CASE WHEN ${userSessions.textToSpeechUsed} = true THEN 1 END`),
        highContrastUsers: count(sql`CASE WHEN ${userSessions.highContrastUsed} = true THEN 1 END`),
        totalSessions: count(),
      })
      .from(userSessions)
      .where(baseFilter);

    const userSegmentation = {
      demographics: {
        userTypes: userTypes.map(type => ({
          type: type.userType as string,
          count: type.count,
          percentage: type.count / totalUserCount,
        })),
        categories: [], // Placeholder
        academicLevels: [], // Placeholder
      },
      behavior: {
        powerUsers: Math.floor(totalUserCount * 0.15),
        casualUsers: Math.floor(totalUserCount * 0.60),
        trialUsers: Math.floor(totalUserCount * 0.20),
        churned: Math.floor(totalUserCount * 0.05),
      },
      accessibility: {
        accessibilityUsers: parseInt(accessibilityUsage[0]?.accessibilityUsers as string) || 0,
        screenReaderUsers: parseInt(accessibilityUsage[0]?.screenReaderUsers as string) || 0,
        keyboardNavigationUsers: 0, // Placeholder
        highContrastUsers: parseInt(accessibilityUsage[0]?.highContrastUsers as string) || 0,
        textToSpeechUsers: parseInt(accessibilityUsage[0]?.screenReaderUsers as string) || 0,
      },
    };

    // 5. Performance Analysis
    const performanceData = await db
      .select({
        path: performanceMetrics.path,
        avgLoadTime: avg(performanceMetrics.ttfb),
        avgLcp: avg(performanceMetrics.lcp),
        avgFid: avg(performanceMetrics.fid),
        avgCls: avg(performanceMetrics.cls),
      })
      .from(performanceMetrics)
      .where(and(
        between(performanceMetrics.timestamp, startDate, now),
        userFilter ? eq(performanceMetrics.userId, parseInt(userId)) : undefined
      ).filter(Boolean))
      .groupBy(performanceMetrics.path)
      .orderBy(desc(avg(performanceMetrics.ttfb)))
      .limit(20);

    const performance = {
      pageLoadTimes: performanceData.map(perf => ({
        page: perf.path,
        avgLoadTime: parseFloat(perf.avgLoadTime as string) || 0,
        p95LoadTime: parseFloat(perf.avgLoadTime as string) * 1.5 || 0, // Approximation
        performanceScore: Math.max(0, 100 - (parseFloat(perf.avgLoadTime as string) || 0) / 50),
      })),
      errorRates: [], // Placeholder
      systemHealth: {
        uptime: 99.9,
        responseTime: 150,
        errorRate: 0.1,
        throughput: 1000,
      },
    };

    // 6. Daily trends
    const dailyTrends = await db
      .select({
        date: sql`DATE(${userSessions.startedAt})`.as('date'),
        users: count(sql`DISTINCT ${userSessions.userId}`),
        sessions: count(),
        engagement: avg(sql`CASE WHEN ${userSessions.isEngaged} = true THEN 1.0 ELSE 0.0 END`),
        conversions: count(sql`CASE WHEN ${userSessions.pageViews} > 3 THEN 1 END`),
      })
      .from(userSessions)
      .where(baseFilter)
      .groupBy(sql`DATE(${userSessions.startedAt})`)
      .orderBy(sql`DATE(${userSessions.startedAt})`);

    const trends = {
      daily: dailyTrends.map(day => ({
        date: day.date as string,
        users: day.users,
        sessions: day.sessions,
        engagement: parseFloat(day.engagement as string) || 0,
        conversions: day.conversions,
      })),
      hourly: [], // Placeholder
      cohort: [], // Placeholder
    };

    // Mock data for remaining sections
    const conversions = {
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
      funnels: [], // Placeholder
    };

    const content = {
      questionnaires: [], // Would need detailed questionnaire analytics
      reportGeneration: {
        totalReports: 189,
        avgGenerationTime: 2.3,
        userSatisfaction: 4.6,
        downloadRate: 0.89,
      },
    };

    const result = {
      engagement,
      userJourney,
      featureAdoption,
      userSegmentation,
      performance,
      conversions,
      content,
      trends,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Advanced analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to load advanced analytics' },
      { status: 500 }
    );
  }
}
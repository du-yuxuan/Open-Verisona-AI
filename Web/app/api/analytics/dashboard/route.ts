import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { 
  userSessions, 
  pageViews, 
  userEvents, 
  questionnaireAnalytics,
  featureUsage,
  performanceMetrics,
  analyticsAggregates 
} from '@/lib/db/analytics-schema';
import { users, questionnaires } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { desc, count, avg, sum, gte, lte, eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 7d, 30d, 90d, 1y
    const userId = searchParams.get('userId'); // Optional: filter by specific user
    
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
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Build base filters
    const timeFilter = and(
      gte(userSessions.startedAt, startDate),
      lte(userSessions.startedAt, now)
    );

    const userFilter = userId ? eq(userSessions.userId, parseInt(userId)) : undefined;
    const baseFilter = userFilter ? and(timeFilter, userFilter) : timeFilter;

    // 1. Overall Platform Statistics
    const [userStats] = await db
      .select({
        totalUsers: count(),
        newUsers: sum(sql`CASE WHEN ${users.createdAt} >= ${startDate.toISOString()} THEN 1 ELSE 0 END`),
        activeUsers: count(sql`DISTINCT ${userSessions.userId}`)
      })
      .from(users)
      .leftJoin(userSessions, eq(users.id, userSessions.userId))
      .where(timeFilter);

    // 2. Session Analytics
    const sessionStats = await db
      .select({
        totalSessions: count(),
        avgDuration: avg(userSessions.duration),
        mobileUsers: sum(sql`CASE WHEN ${userSessions.deviceType} = 'mobile' THEN 1 ELSE 0 END`),
        tabletUsers: sum(sql`CASE WHEN ${userSessions.deviceType} = 'tablet' THEN 1 ELSE 0 END`),
        desktopUsers: sum(sql`CASE WHEN ${userSessions.deviceType} = 'desktop' THEN 1 ELSE 0 END`),
        accessibilityUsers: sum(sql`CASE WHEN ${userSessions.accessibilityModeUsed} = true THEN 1 ELSE 0 END`),
        ttsUsers: sum(sql`CASE WHEN ${userSessions.textToSpeechUsed} = true THEN 1 ELSE 0 END`),
        highContrastUsers: sum(sql`CASE WHEN ${userSessions.highContrastUsed} = true THEN 1 ELSE 0 END`),
      })
      .from(userSessions)
      .where(baseFilter);

    // 3. Page Analytics
    const pageStats = await db
      .select({
        path: pageViews.path,
        views: count(),
        avgTimeOnPage: avg(pageViews.timeOnPage),
        avgLoadTime: avg(pageViews.loadTime),
      })
      .from(pageViews)
      .where(and(
        gte(pageViews.timestamp, startDate),
        lte(pageViews.timestamp, now),
        userFilter ? eq(pageViews.userId, parseInt(userId)) : undefined
      ).filter(Boolean))
      .groupBy(pageViews.path)
      .orderBy(desc(count()))
      .limit(20);

    // 4. Event Analytics
    const eventStats = await db
      .select({
        eventType: userEvents.eventType,
        eventAction: userEvents.eventAction,
        count: count(),
        avgValue: avg(userEvents.eventValue),
      })
      .from(userEvents)
      .where(and(
        gte(userEvents.timestamp, startDate),
        lte(userEvents.timestamp, now),
        userFilter ? eq(userEvents.userId, parseInt(userId)) : undefined
      ).filter(Boolean))
      .groupBy(userEvents.eventType, userEvents.eventAction)
      .orderBy(desc(count()))
      .limit(50);

    // 5. Questionnaire Analytics
    const questionnaireStats = await db
      .select({
        questionnaireId: questionnaireAnalytics.questionnaireId,
        questionnaireName: questionnaires.title,
        starts: count(),
        completions: sum(sql`CASE WHEN ${questionnaireAnalytics.finalStatus} = 'completed' THEN 1 ELSE 0 END`),
        avgCompletionRate: avg(questionnaireAnalytics.completionRate),
        avgDuration: avg(questionnaireAnalytics.totalDuration),
        avgEngagement: avg(questionnaireAnalytics.engagementScore),
        abandonmentRate: sql`
          CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(*) - SUM(CASE WHEN ${questionnaireAnalytics.finalStatus} = 'completed' THEN 1 ELSE 0 END)) * 100.0 / COUNT(*)
            ELSE 0 
          END
        `,
      })
      .from(questionnaireAnalytics)
      .leftJoin(questionnaires, eq(questionnaireAnalytics.questionnaireId, questionnaires.id))
      .where(and(
        gte(questionnaireAnalytics.startTime, startDate),
        lte(questionnaireAnalytics.startTime, now),
        userFilter ? eq(questionnaireAnalytics.userId, parseInt(userId)) : undefined
      ).filter(Boolean))
      .groupBy(questionnaireAnalytics.questionnaireId, questionnaires.title)
      .orderBy(desc(count()));

    // 6. Feature Usage Analytics
    const featureStats = await db
      .select({
        featureName: featureUsage.featureName,
        category: featureUsage.featureCategory,
        totalUsage: sum(featureUsage.usageCount),
        uniqueUsers: count(sql`DISTINCT ${featureUsage.userId}`),
        successRate: sql`
          CASE 
            WHEN SUM(${featureUsage.usageCount}) > 0 
            THEN SUM(${featureUsage.successfulUses}) * 100.0 / SUM(${featureUsage.usageCount})
            ELSE 0 
          END
        `,
        avgSatisfaction: avg(featureUsage.satisfactionRating),
      })
      .from(featureUsage)
      .where(and(
        gte(featureUsage.lastUsed, startDate),
        lte(featureUsage.lastUsed, now),
        userFilter ? eq(featureUsage.userId, parseInt(userId)) : undefined
      ).filter(Boolean))
      .groupBy(featureUsage.featureName, featureUsage.featureCategory)
      .orderBy(desc(sum(featureUsage.usageCount)))
      .limit(30);

    // 7. Performance Analytics
    const [performanceStats] = await db
      .select({
        avgLcp: avg(performanceMetrics.lcp),
        avgFid: avg(performanceMetrics.fid),
        avgCls: avg(performanceMetrics.cls),
        avgFcp: avg(performanceMetrics.fcp),
        avgTtfb: avg(performanceMetrics.ttfb),
        slowPages: sum(sql`CASE WHEN ${performanceMetrics.lcp} > 2.5 THEN 1 ELSE 0 END`),
        totalMeasurements: count(),
      })
      .from(performanceMetrics)
      .where(and(
        gte(performanceMetrics.timestamp, startDate),
        lte(performanceMetrics.timestamp, now),
        userFilter ? eq(performanceMetrics.userId, parseInt(userId)) : undefined
      ).filter(Boolean));

    // 8. Daily trend data for charts
    const dailyTrends = await db
      .select({
        date: sql`DATE(${userSessions.startedAt})`,
        sessions: count(),
        uniqueUsers: count(sql`DISTINCT ${userSessions.userId}`),
        avgDuration: avg(userSessions.duration),
        mobilePercentage: sql`
          SUM(CASE WHEN ${userSessions.deviceType} = 'mobile' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
        `,
      })
      .from(userSessions)
      .where(baseFilter)
      .groupBy(sql`DATE(${userSessions.startedAt})`)
      .orderBy(sql`DATE(${userSessions.startedAt})`);

    // 9. Browser and OS distribution
    const browserStats = await db
      .select({
        browser: userSessions.browser,
        count: count(),
        percentage: sql`COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${userSessions} WHERE ${baseFilter})`,
      })
      .from(userSessions)
      .where(baseFilter)
      .groupBy(userSessions.browser)
      .orderBy(desc(count()));

    const osStats = await db
      .select({
        os: userSessions.os,
        count: count(),
        percentage: sql`COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${userSessions} WHERE ${baseFilter})`,
      })
      .from(userSessions)
      .where(baseFilter)
      .groupBy(userSessions.os)
      .orderBy(desc(count()));

    // 10. Accessibility Usage Breakdown
    const accessibilityStats = {
      totalAccessibilityUsers: sessionStats[0]?.accessibilityUsers || 0,
      textToSpeechUsers: sessionStats[0]?.ttsUsers || 0,
      highContrastUsers: sessionStats[0]?.highContrastUsers || 0,
      accessibilityPercentage: sessionStats[0]?.totalSessions 
        ? ((sessionStats[0]?.accessibilityUsers || 0) * 100 / (sessionStats[0]?.totalSessions || 1))
        : 0,
    };

    // Compile response
    const analytics = {
      timeRange,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      overview: {
        totalUsers: userStats?.totalUsers || 0,
        newUsers: userStats?.newUsers || 0,
        activeUsers: userStats?.activeUsers || 0,
        totalSessions: sessionStats[0]?.totalSessions || 0,
        avgSessionDuration: Math.round(sessionStats[0]?.avgSessionDuration || 0),
        mobileUsage: Math.round(((sessionStats[0]?.mobileUsers || 0) * 100) / Math.max(sessionStats[0]?.totalSessions || 1, 1)),
        accessibilityUsage: Math.round(((sessionStats[0]?.accessibilityUsers || 0) * 100) / Math.max(sessionStats[0]?.totalSessions || 1, 1)),
      },
      pages: pageStats,
      events: eventStats,
      questionnaires: questionnaireStats,
      features: featureStats,
      performance: {
        avgLcp: performanceStats?.avgLcp ? Math.round(performanceStats.avgLcp * 1000) / 1000 : null,
        avgFid: performanceStats?.avgFid ? Math.round(performanceStats.avgFid * 100) / 100 : null,
        avgCls: performanceStats?.avgCls ? Math.round(performanceStats.avgCls * 1000) / 1000 : null,
        avgFcp: performanceStats?.avgFcp ? Math.round(performanceStats.avgFcp * 1000) / 1000 : null,
        avgTtfb: performanceStats?.avgTtfb ? Math.round(performanceStats.avgTtfb) : null,
        performanceScore: performanceStats?.totalMeasurements 
          ? Math.round(((performanceStats.totalMeasurements - (performanceStats.slowPages || 0)) * 100) / performanceStats.totalMeasurements)
          : null,
      },
      trends: dailyTrends,
      demographics: {
        browsers: browserStats,
        operatingSystems: osStats,
        devices: [
          { device: 'Mobile', count: sessionStats[0]?.mobileUsers || 0 },
          { device: 'Desktop', count: sessionStats[0]?.desktopUsers || 0 },
          { device: 'Tablet', count: sessionStats[0]?.tabletUsers || 0 },
        ]
      },
      accessibility: accessibilityStats,
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
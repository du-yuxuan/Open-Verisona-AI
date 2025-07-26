import { db } from './drizzle';
import { users, questionnaires, questionnaireResponses, reports } from './schema';
import { userEvents } from './analytics-schema';
import { count, desc, eq, gte, sql } from 'drizzle-orm';

export async function getAdminStats() {
  try {
    // Get basic counts
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [totalQuestionnairesResult] = await db.select({ count: count() }).from(questionnaires);
    const [totalResponsesResult] = await db.select({ count: count() }).from(questionnaireResponses);
    const [totalReportsResult] = await db.select({ count: count() }).from(reports);

    return {
      totalUsers: totalUsersResult?.count || 0,
      totalQuestionnaires: totalQuestionnairesResult?.count || 0,
      totalResponses: totalResponsesResult?.count || 0,
      totalReports: totalReportsResult?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      totalQuestionnaires: 0,
      totalResponses: 0,
      totalReports: 0,
    };
  }
}

export async function getRecentActivity(limit = 10) {
  try {
    // Get recent events from analytics
    const recentEvents = await db
      .select({
        id: userEvents.id,
        eventType: userEvents.eventType,
        eventData: userEvents.properties,
        createdAt: userEvents.timestamp,
      })
      .from(userEvents)
      .orderBy(desc(userEvents.timestamp))
      .limit(limit);

    // Get recent users
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);

    // Get recent reports
    const recentReports = await db
      .select({
        id: reports.id,
        userId: reports.userId,
        status: reports.status,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(5);

    return {
      recentEvents,
      recentUsers,
      recentReports,
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      recentEvents: [],
      recentUsers: [],
      recentReports: [],
    };
  }
}

export async function getSystemMetrics() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get daily user registrations for the last 30 days
    const dailyRegistrations = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Get daily response submissions for the last 30 days
    const dailyResponses = await db
      .select({
        date: sql<string>`DATE(${questionnaireResponses.startedAt})`,
        count: count(),
      })
      .from(questionnaireResponses)
      .where(gte(questionnaireResponses.startedAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${questionnaireResponses.startedAt})`)
      .orderBy(sql`DATE(${questionnaireResponses.startedAt})`);

    // Get daily report generations for the last 30 days
    const dailyReports = await db
      .select({
        date: sql<string>`DATE(${reports.createdAt})`,
        count: count(),
      })
      .from(reports)
      .where(gte(reports.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${reports.createdAt})`)
      .orderBy(sql`DATE(${reports.createdAt})`);

    return {
      dailyRegistrations,
      dailyResponses,
      dailyReports,
    };
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return {
      dailyRegistrations: [],
      dailyResponses: [],
      dailyReports: [],
    };
  }
}

export async function getUsersWithPagination(page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;
    
    const usersData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        demographicInfo: users.demographicInfo,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult?.count || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users: usersData,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error('Error fetching users with pagination:', error);
    return {
      users: [],
      pagination: {
        page: 1,
        limit,
        totalUsers: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

export async function getQuestionnairesWithStats() {
  try {
    // Get questionnaires with response counts
    const questionnairesWithStats = await db
      .select({
        id: questionnaires.id,
        title: questionnaires.title,
        description: questionnaires.description,
        type: questionnaires.type,
        isActive: questionnaires.isActive,
        createdAt: questionnaires.createdAt,
        responseCount: sql<number>`COALESCE(COUNT(DISTINCT ${questionnaireResponses.id}), 0)`,
      })
      .from(questionnaires)
      .leftJoin(questionnaireResponses, eq(questionnaires.id, questionnaireResponses.questionnaireId))
      .groupBy(questionnaires.id)
      .orderBy(desc(questionnaires.createdAt));

    return questionnairesWithStats;
  } catch (error) {
    console.error('Error fetching questionnaires with stats:', error);
    return [];
  }
}

export async function getReportsWithPagination(page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;
    
    const reportsData = await db
      .select({
        id: reports.id,
        userId: reports.userId,
        sessionId: reports.sessionId,
        status: reports.status,
        summary: reports.summary,
        createdAt: reports.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(reports)
      .leftJoin(users, eq(reports.userId, users.id))
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalReportsResult] = await db.select({ count: count() }).from(reports);
    const totalReports = totalReportsResult?.count || 0;
    const totalPages = Math.ceil(totalReports / limit);

    return {
      reports: reportsData,
      pagination: {
        page,
        limit,
        totalReports,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error('Error fetching reports with pagination:', error);
    return {
      reports: [],
      pagination: {
        page: 1,
        limit,
        totalReports: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}
import { db } from './drizzle';
import { 
  questionnaires, 
  questions, 
  questionnaireResponses, 
  questionResponses,
  reports,
  type Questionnaire,
  type Question,
  type QuestionnaireResponse,
  type QuestionResponse,
  ResponseStatus,
  QuestionnaireType 
} from './schema';
import { eq, and, desc, asc, count, sql } from 'drizzle-orm';

// Questionnaire queries
export async function getActiveQuestionnaires(type?: QuestionnaireType, category?: string) {
  let query = db
    .select()
    .from(questionnaires)
    .where(eq(questionnaires.isActive, true));

  if (type) {
    query = query.where(and(eq(questionnaires.isActive, true), eq(questionnaires.type, type)));
  }

  if (category) {
    query = query.where(and(eq(questionnaires.isActive, true), eq(questionnaires.category, category)));
  }

  return await query.orderBy(desc(questionnaires.createdAt));
}

export async function getQuestionnaireById(id: number): Promise<Questionnaire | null> {
  const [questionnaire] = await db
    .select()
    .from(questionnaires)
    .where(and(eq(questionnaires.id, id), eq(questionnaires.isActive, true)))
    .limit(1);

  return questionnaire || null;
}

export async function getQuestionnaireWithQuestions(id: number) {
  const questionnaire = await getQuestionnaireById(id);
  if (!questionnaire) return null;

  const questionsList = await db
    .select()
    .from(questions)
    .where(eq(questions.questionnaireId, id))
    .orderBy(asc(questions.order));

  return {
    questionnaire,
    questions: questionsList,
  };
}

// Question queries
export async function getQuestionsByQuestionnaire(questionnaireId: number): Promise<Question[]> {
  return await db
    .select()
    .from(questions)
    .where(eq(questions.questionnaireId, questionnaireId))
    .orderBy(asc(questions.order));
}

export async function getQuestionById(id: number): Promise<Question | null> {
  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, id))
    .limit(1);

  return question || null;
}

// Response session queries
export async function getUserActiveSession(userId: number, questionnaireId: number): Promise<QuestionnaireResponse | null> {
  const [session] = await db
    .select()
    .from(questionnaireResponses)
    .where(and(
      eq(questionnaireResponses.userId, userId),
      eq(questionnaireResponses.questionnaireId, questionnaireId),
      eq(questionnaireResponses.status, ResponseStatus.IN_PROGRESS)
    ))
    .limit(1);

  return session || null;
}

export async function getSessionById(sessionId: string, userId: number): Promise<QuestionnaireResponse | null> {
  const [session] = await db
    .select()
    .from(questionnaireResponses)
    .where(and(
      eq(questionnaireResponses.sessionId, sessionId),
      eq(questionnaireResponses.userId, userId)
    ))
    .limit(1);

  return session || null;
}

export async function getUserSessions(userId: number, questionnaireId?: number, status?: ResponseStatus) {
  let query = db
    .select()
    .from(questionnaireResponses)
    .where(eq(questionnaireResponses.userId, userId));

  if (questionnaireId) {
    query = query.where(and(
      eq(questionnaireResponses.userId, userId),
      eq(questionnaireResponses.questionnaireId, questionnaireId)
    ));
  }

  if (status) {
    query = query.where(and(
      eq(questionnaireResponses.userId, userId),
      eq(questionnaireResponses.status, status)
    ));
  }

  return await query.orderBy(desc(questionnaireResponses.startedAt));
}

export async function getSessionResponses(sessionId: string): Promise<QuestionResponse[]> {
  return await db
    .select()
    .from(questionResponses)
    .where(eq(questionResponses.sessionId, sessionId))
    .orderBy(asc(questionResponses.answeredAt));
}

export async function getQuestionResponse(sessionId: string, questionId: number): Promise<QuestionResponse | null> {
  const [response] = await db
    .select()
    .from(questionResponses)
    .where(and(
      eq(questionResponses.sessionId, sessionId),
      eq(questionResponses.questionId, questionId)
    ))
    .limit(1);

  return response || null;
}

// Progress and analytics queries
export async function getUserQuestionnaireProgress(userId: number) {
  const sessions = await db
    .select({
      questionnaireId: questionnaireResponses.questionnaireId,
      questionnaireTitle: questionnaires.title,
      status: questionnaireResponses.status,
      progressPercentage: questionnaireResponses.progressPercentage,
      answeredQuestions: questionnaireResponses.answeredQuestions,
      totalQuestions: questionnaireResponses.totalQuestions,
      startedAt: questionnaireResponses.startedAt,
      completedAt: questionnaireResponses.completedAt,
      lastActivityAt: questionnaireResponses.lastActivityAt,
    })
    .from(questionnaireResponses)
    .leftJoin(questionnaires, eq(questionnaireResponses.questionnaireId, questionnaires.id))
    .where(eq(questionnaireResponses.userId, userId))
    .orderBy(desc(questionnaireResponses.lastActivityAt));

  return sessions;
}

export async function getQuestionnaireStats(questionnaireId: number) {
  const [stats] = await db
    .select({
      totalSessions: count(questionnaireResponses.id),
      completedSessions: sql<number>`COUNT(CASE WHEN ${questionnaireResponses.status} = 'completed' THEN 1 END)`,
      inProgressSessions: sql<number>`COUNT(CASE WHEN ${questionnaireResponses.status} = 'in_progress' THEN 1 END)`,
      abandonedSessions: sql<number>`COUNT(CASE WHEN ${questionnaireResponses.status} = 'abandoned' THEN 1 END)`,
      averageProgress: sql<number>`AVG(${questionnaireResponses.progressPercentage})`,
      averageTimeToComplete: sql<number>`AVG(EXTRACT(EPOCH FROM (${questionnaireResponses.completedAt} - ${questionnaireResponses.startedAt})))`,
    })
    .from(questionnaireResponses)
    .where(eq(questionnaireResponses.questionnaireId, questionnaireId));

  return stats;
}

// User statistics
export async function getUserQuestionnaireStatistics(userId: number) {
  const [userStats] = await db
    .select({
      totalQuestionnaires: count(questionnaireResponses.id),
      completedQuestionnaires: sql<number>`COUNT(CASE WHEN ${questionnaireResponses.status} = 'completed' THEN 1 END)`,
      inProgressQuestionnaires: sql<number>`COUNT(CASE WHEN ${questionnaireResponses.status} = 'in_progress' THEN 1 END)`,
      averageCompletionRate: sql<number>`AVG(${questionnaireResponses.progressPercentage})`,
      totalTimeSpent: sql<number>`SUM(EXTRACT(EPOCH FROM (${questionnaireResponses.lastActivityAt} - ${questionnaireResponses.startedAt})))`,
    })
    .from(questionnaireResponses)
    .where(eq(questionnaireResponses.userId, userId));

  return userStats;
}

// Report queries (for future integration)
export async function getUserReports(userId: number, sessionId?: string) {
  let query = db
    .select()
    .from(reports)
    .where(eq(reports.userId, userId));

  if (sessionId) {
    query = query.where(and(
      eq(reports.userId, userId),
      eq(reports.sessionId, sessionId)
    ));
  }

  return await query.orderBy(desc(reports.generatedAt));
}

// Utility functions
export async function calculateSessionProgress(sessionId: string): Promise<{
  answered: number;
  total: number;
  percentage: number;
}> {
  const [session] = await db
    .select({
      totalQuestions: questionnaireResponses.totalQuestions,
    })
    .from(questionnaireResponses)
    .where(eq(questionnaireResponses.sessionId, sessionId))
    .limit(1);

  if (!session) {
    return { answered: 0, total: 0, percentage: 0 };
  }

  const [responseCount] = await db
    .select({
      count: count(questionResponses.id),
    })
    .from(questionResponses)
    .where(eq(questionResponses.sessionId, sessionId));

  const answered = responseCount.count;
  const total = session.totalQuestions;
  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

  return { answered, total, percentage };
}

export async function isSessionComplete(sessionId: string): Promise<boolean> {
  const progress = await calculateSessionProgress(sessionId);
  return progress.percentage >= 100;
}
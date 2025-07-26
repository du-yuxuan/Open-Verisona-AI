import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { 
  questionnaires, 
  questions, 
  questionnaireResponses, 
  questionResponses,
  activityLogs,
  ActivityType,
  ResponseStatus 
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Schema for starting a new questionnaire session
const startSessionSchema = z.object({
  metadata: z.object({}).optional(),
});

// Schema for submitting responses
const submitResponseSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.number(),
  responseText: z.string().optional(),
  responseValue: z.any().optional(),
  responseScore: z.number().optional(),
  timeSpentSeconds: z.number().min(0).optional(),
});

// POST /api/questionnaires/[id]/responses - Start a new questionnaire session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const questionnaireId = parseInt(resolvedParams.id);
    if (isNaN(questionnaireId)) {
      return NextResponse.json({ error: 'Invalid questionnaire ID' }, { status: 400 });
    }

    const body = await request.json();
    const { metadata } = startSessionSchema.parse(body);

    // Check if questionnaire exists and is active
    const [questionnaire] = await db
      .select()
      .from(questionnaires)
      .where(and(
        eq(questionnaires.id, questionnaireId),
        eq(questionnaires.isActive, true)
      ))
      .limit(1);

    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found or inactive' }, { status: 404 });
    }

    // Count total questions
    const totalQuestions = await db
      .select({ count: questions.id })
      .from(questions)
      .where(eq(questions.questionnaireId, questionnaireId));

    // Check if user already has an active session for this questionnaire
    const existingSession = await db
      .select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.questionnaireId, questionnaireId),
        eq(questionnaireResponses.status, ResponseStatus.IN_PROGRESS)
      ))
      .limit(1);

    if (existingSession.length > 0) {
      return NextResponse.json({
        session: existingSession[0],
        message: 'Continuing existing session',
      });
    }

    // Create new session
    const sessionId = uuidv4();
    const [newSession] = await db
      .insert(questionnaireResponses)
      .values({
        userId: user.id,
        questionnaireId,
        sessionId,
        status: ResponseStatus.IN_PROGRESS,
        totalQuestions: totalQuestions.length,
        answeredQuestions: 0,
        progressPercentage: 0,
        responses: {},
        metadata: metadata || {},
      })
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      userId: user.id,
      action: ActivityType.QUESTIONNAIRE_STARTED,
      metadata: JSON.stringify({ questionnaireId, sessionId }),
    });

    return NextResponse.json({
      session: newSession,
      message: 'Questionnaire session started successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error starting questionnaire session:', error);
    return NextResponse.json(
      { error: 'Failed to start questionnaire session' },
      { status: 500 }
    );
  }
}

// GET /api/questionnaires/[id]/responses - Get user's response sessions for this questionnaire
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const questionnaireId = parseInt(resolvedParams.id);
    if (isNaN(questionnaireId)) {
      return NextResponse.json({ error: 'Invalid questionnaire ID' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = db
      .select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.questionnaireId, questionnaireId)
      ));

    if (status) {
      query = query.where(and(
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.questionnaireId, questionnaireId),
        eq(questionnaireResponses.status, status as ResponseStatus)
      ));
    }

    const sessions = await query.orderBy(desc(questionnaireResponses.startedAt));

    return NextResponse.json({
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching questionnaire responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questionnaire responses' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { 
  questionnaireResponses, 
  questionResponses,
  questions,
  activityLogs,
  ActivityType,
  ResponseStatus 
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { 
  validateResponse, 
  generateAnalytics, 
  validateCompleteness,
  type ResponseValidationResult,
  type ResponseAnalytics 
} from '@/lib/validation/response-validation';

// Schema for submitting a question response
const submitQuestionResponseSchema = z.object({
  questionId: z.number(),
  responseText: z.string().optional(),
  responseValue: z.any().optional(),
  responseScore: z.number().optional(),
  timeSpentSeconds: z.number().min(0).optional(),
  clientMetadata: z.object({
    userAgent: z.string().optional(),
    timestamp: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

// Schema for updating session progress
const updateSessionSchema = z.object({
  currentQuestionId: z.number().optional(),
  status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
  responses: z.object({}).optional(),
  metadata: z.object({}).optional(),
});

// GET /api/responses/[sessionId] - Get a specific response session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const resolvedParams = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = resolvedParams;

    // Get session details
    const [session] = await db
      .select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.sessionId, sessionId),
        eq(questionnaireResponses.userId, user.id)
      ))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get all question responses for this session
    const responses = await db
      .select({
        id: questionResponses.id,
        questionId: questionResponses.questionId,
        responseText: questionResponses.responseText,
        responseValue: questionResponses.responseValue,
        responseScore: questionResponses.responseScore,
        timeSpentSeconds: questionResponses.timeSpentSeconds,
        isRevised: questionResponses.isRevised,
        revisionCount: questionResponses.revisionCount,
        answeredAt: questionResponses.answeredAt,
        updatedAt: questionResponses.updatedAt,
      })
      .from(questionResponses)
      .where(eq(questionResponses.sessionId, sessionId));

    return NextResponse.json({
      session,
      responses,
      totalResponses: responses.length,
    });
  } catch (error) {
    console.error('Error fetching response session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch response session' },
      { status: 500 }
    );
  }
}

// POST /api/responses/[sessionId] - Submit a question response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const resolvedParams = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = resolvedParams;
    const body = await request.json();
    const validatedData = submitQuestionResponseSchema.parse(body);

    // Verify session belongs to user and is active
    const [session] = await db
      .select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.sessionId, sessionId),
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.status, ResponseStatus.IN_PROGRESS)
      ))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'Session not found or not active' }, { status: 404 });
    }

    // Verify question exists and belongs to the questionnaire
    const [question] = await db
      .select()
      .from(questions)
      .where(and(
        eq(questions.id, validatedData.questionId),
        eq(questions.questionnaireId, session.questionnaireId)
      ))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Determine the response value for validation
    const responseForValidation = validatedData.responseValue || 
                                  validatedData.responseText || 
                                  validatedData.responseScore;

    // Check if response already exists (for updates) - do this first
    const [existingResponse] = await db
      .select()
      .from(questionResponses)
      .where(and(
        eq(questionResponses.sessionId, sessionId),
        eq(questionResponses.questionId, validatedData.questionId)
      ))
      .limit(1);

    // Validate response
    let validation: ResponseValidationResult | null = null;
    let analytics: ResponseAnalytics | null = null;

    if (responseForValidation !== undefined && responseForValidation !== null && responseForValidation !== '') {
      validation = validateResponse(
        question.questionType as any,
        responseForValidation,
        question.options as any,
        question.isRequired || false
      );

      // Generate analytics for text responses
      if (typeof responseForValidation === 'string' && responseForValidation.length > 10) {
        analytics = generateAnalytics(
          responseForValidation,
          question.questionType as any,
          validatedData.timeSpentSeconds || 0,
          existingResponse ? (existingResponse.revisionCount || 0) + 1 : 0
        );
      }
    }

    let savedResponse;
    const responseData = {
      sessionId,
      questionId: validatedData.questionId,
      userId: user.id, // Add userId to fix constraint violation
      responseText: validatedData.responseText || null,
      responseValue: validatedData.responseValue || null,
      responseScore: validatedData.responseScore || null,
      timeSpentSeconds: validatedData.timeSpentSeconds || 0,
      isRevised: existingResponse ? true : false,
      revisionCount: existingResponse ? (existingResponse.revisionCount || 0) + 1 : 0,
      metadata: {
        validation: validation || {},
        analytics: analytics || {},
        clientMetadata: validatedData.clientMetadata || {},
        submittedAt: new Date().toISOString(),
      }
    };

    if (existingResponse) {
      // Update existing response
      [savedResponse] = await db
        .update(questionResponses)
        .set({
          ...responseData,
          updatedAt: new Date(),
        })
        .where(eq(questionResponses.id, existingResponse.id))
        .returning();
    } else {
      // Create new response
      [savedResponse] = await db
        .insert(questionResponses)
        .values(responseData)
        .returning();
    }

    // Update session progress
    const totalResponses = await db
      .select({ count: questionResponses.id })
      .from(questionResponses)
      .where(eq(questionResponses.sessionId, sessionId));

    const progressPercentage = Math.round((totalResponses.length / session.totalQuestions) * 100);

    await db
      .update(questionnaireResponses)
      .set({
        answeredQuestions: totalResponses.length,
        progressPercentage,
        lastActivityAt: new Date(),
      })
      .where(eq(questionnaireResponses.sessionId, sessionId));

    // Log activity
    try {
      await db.insert(activityLogs).values({
        userId: user.id,
        action: ActivityType.QUESTION_ANSWERED,
        metadata: JSON.stringify({
          sessionId,
          questionId: validatedData.questionId,
          questionType: question.questionType,
          hasValidation: !!validation,
          validationScore: validation?.score || null,
        }),
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
      // Continue without failing the response submission
    }

    return NextResponse.json({
      response: savedResponse,
      validation,
      analytics,
      progress: {
        answered: totalResponses.length,
        total: session.totalQuestions,
        percentage: progressPercentage,
      },
      message: existingResponse ? 'Response updated successfully' : 'Response saved successfully',
    }, { status: existingResponse ? 200 : 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error submitting response:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
}

// PUT /api/responses/[sessionId] - Update session (complete, abandon, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const resolvedParams = await params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = resolvedParams;
    const body = await request.json();
    const validatedData = updateSessionSchema.parse(body);

    // Verify session belongs to user
    const [session] = await db
      .select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.sessionId, sessionId),
        eq(questionnaireResponses.userId, user.id)
      ))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // If trying to complete, validate completeness
    let completionValidation;
    if (validatedData.status === ResponseStatus.COMPLETED) {
      // Get all responses for validation
      const allResponses = await db
        .select({
          questionResponses,
          question: questions
        })
        .from(questionResponses)
        .leftJoin(questions, eq(questionResponses.questionId, questions.id))
        .where(eq(questionResponses.sessionId, sessionId));

      const responseData = allResponses.map(r => ({
        questionId: r.questionResponses.questionId,
        response: r.questionResponses.responseValue || 
                 r.questionResponses.responseText || 
                 r.questionResponses.responseScore,
        isRequired: r.question?.isRequired || false,
        questionType: r.question?.questionType || 'text'
      }));

      completionValidation = validateCompleteness(responseData as any);
      
      if (!completionValidation.canComplete) {
        return NextResponse.json({
          error: 'Cannot complete questionnaire',
          validation: completionValidation,
          message: 'Please complete all required questions before submitting'
        }, { status: 400 });
      }
    }

    // Update session
    const [updatedSession] = await db
      .update(questionnaireResponses)
      .set({
        ...validatedData,
        lastActivityAt: new Date(),
        completedAt: validatedData.status === ResponseStatus.COMPLETED ? new Date() : session.completedAt,
        metadata: {
          ...(session.metadata as any || {}),
          completionValidation: completionValidation || undefined,
          updatedAt: new Date().toISOString()
        }
      })
      .where(eq(questionnaireResponses.sessionId, sessionId))
      .returning();

    // Log activity if questionnaire was completed
    if (validatedData.status === ResponseStatus.COMPLETED && session.status !== ResponseStatus.COMPLETED) {
      await db.insert(activityLogs).values({
        userId: user.id,
        action: ActivityType.QUESTIONNAIRE_COMPLETED,
        metadata: JSON.stringify({ 
          questionnaireId: session.questionnaireId, 
          sessionId,
          completedAt: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json({
      session: updatedSession,
      completionValidation,
      message: validatedData.status === ResponseStatus.COMPLETED ? 
        'Questionnaire completed successfully!' : 
        'Session updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { 
  questionnaires,
  questions,
  questionnaireResponses,
  questionResponses,
  users,
  QuestionType,
  ActivityType,
  activityLogs
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { difyService, type DifyQuestionRequest } from '@/lib/services/dify-service';

// Schema for requesting dynamic questions
const dynamicQuestionRequestSchema = z.object({
  sessionId: z.string().uuid(),
  context: z.object({
    currentQuestionCount: z.number().min(0),
    maxQuestions: z.number().min(1).max(50).optional(),
    focusAreas: z.array(z.string()).optional(),
    urgency: z.enum(['low', 'medium', 'high']).optional(),
  }).optional(),
});

// POST /api/questionnaires/[id]/dynamic-questions - Generate dynamic questions
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
    const { sessionId, context } = dynamicQuestionRequestSchema.parse(body);

    // Verify questionnaire exists and supports dynamic questions
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

    if (questionnaire.type !== 'dynamic' && questionnaire.type !== 'adaptive') {
      return NextResponse.json({ 
        error: 'This questionnaire does not support dynamic question generation' 
      }, { status: 400 });
    }

    // Verify session belongs to user
    const [session] = await db
      .select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.sessionId, sessionId),
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.questionnaireId, questionnaireId)
      ))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    // Get previous responses for context
    const previousResponses = await db
      .select({
        questionId: questionResponses.questionId,
        questionText: questions.questionText,
        questionType: questions.questionType,
        questionCategory: questions.category,
        responseText: questionResponses.responseText,
        responseValue: questionResponses.responseValue,
        responseScore: questionResponses.responseScore,
        timeSpent: questionResponses.timeSpentSeconds,
      })
      .from(questionResponses)
      .leftJoin(questions, eq(questionResponses.questionId, questions.id))
      .where(eq(questionResponses.sessionId, sessionId));

    // Prepare request for Dify service
    const difyRequest: DifyQuestionRequest = {
      userId: user.id,
      sessionId,
      previousResponses: previousResponses.map(r => ({
        questionId: r.questionId,
        questionText: r.questionText || '',
        response: r.responseValue || r.responseText || r.responseScore,
        category: r.questionCategory || 'general'
      })),
      userProfile: {
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        graduationYear: user.graduationYear || undefined,
        schoolName: user.schoolName || undefined,
        preferences: user.preferences,
        equityEligible: user.equityEligible || false,
      },
      context: {
        questionnaireType: questionnaire.type,
        category: questionnaire.category || 'general',
        currentQuestionCount: context?.currentQuestionCount || previousResponses.length,
        maxQuestions: context?.maxQuestions || 20,
      }
    };

    // Generate dynamic question using Dify service
    const difyResponse = await difyService.generateDynamicQuestion(difyRequest);

    // Create dynamic question in database
    const [newQuestion] = await db
      .insert(questions)
      .values({
        questionnaireId,
        questionText: difyResponse.question.text,
        questionType: difyResponse.question.type,
        category: difyResponse.question.category,
        options: difyResponse.question.options || {},
        isRequired: true,
        order: previousResponses.length + 1000, // Dynamic questions have high order numbers
        isAiGenerated: true,
        aiPrompt: difyResponse.question.reasoning,
        metadata: {
          difyMetadata: difyResponse.metadata,
          importance: difyResponse.question.importance,
          confidenceScore: difyResponse.confidenceScore,
          generatedFor: user.id,
          generatedAt: new Date().toISOString(),
          followUpSuggestions: difyResponse.followUpSuggestions || []
        }
      })
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      userId: user.id,
      action: 'DYNAMIC_QUESTION_GENERATED' as ActivityType,
      metadata: JSON.stringify({
        questionnaireId,
        questionId: newQuestion.id,
        sessionId,
        difyConfidence: difyResponse.confidenceScore,
        questionCategory: difyResponse.question.category
      }),
    });

    return NextResponse.json({
      question: {
        id: newQuestion.id,
        questionText: newQuestion.questionText,
        questionType: newQuestion.questionType,
        category: newQuestion.category,
        options: newQuestion.options,
        isRequired: newQuestion.isRequired,
        order: newQuestion.order,
        isAiGenerated: true,
        metadata: newQuestion.metadata
      },
      difyMetadata: {
        confidenceScore: difyResponse.confidenceScore,
        followUpSuggestions: difyResponse.followUpSuggestions,
        reasoning: difyResponse.question.reasoning,
        importance: difyResponse.question.importance
      },
      message: 'Dynamic question generated successfully'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error generating dynamic question:', error);
    return NextResponse.json(
      { error: 'Failed to generate dynamic question' },
      { status: 500 }
    );
  }
}

// GET /api/questionnaires/[id]/dynamic-questions - Get generated dynamic questions for a session
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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify session belongs to user
    const [session] = await db
      .select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.sessionId, sessionId),
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.questionnaireId, questionnaireId)
      ))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    // Get all AI-generated questions for this questionnaire and user
    const dynamicQuestions = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        questionType: questions.questionType,
        category: questions.category,
        options: questions.options,
        isRequired: questions.isRequired,
        order: questions.order,
        aiPrompt: questions.aiPrompt,
        metadata: questions.metadata,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .where(and(
        eq(questions.questionnaireId, questionnaireId),
        eq(questions.isAiGenerated, true)
      ));

    // Filter questions that were generated specifically for this user (optional enhancement)
    const userSpecificQuestions = dynamicQuestions.filter(q => {
      const metadata = q.metadata as any;
      return metadata?.generatedFor === user.id;
    });

    return NextResponse.json({
      questions: userSpecificQuestions.length > 0 ? userSpecificQuestions : dynamicQuestions,
      total: userSpecificQuestions.length > 0 ? userSpecificQuestions.length : dynamicQuestions.length,
      sessionId,
    });

  } catch (error) {
    console.error('Error fetching dynamic questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dynamic questions' },
      { status: 500 }
    );
  }
}
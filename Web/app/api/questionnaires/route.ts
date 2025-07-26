import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { questionnaires, questions, questionnaireResponses, QuestionnaireType, ResponseStatus } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc } from 'drizzle-orm';

// Schema for creating a new questionnaire
const createQuestionnaireSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['standardized', 'dynamic', 'adaptive']),
  category: z.string().max(100).optional(),
  estimatedDuration: z.number().min(1).max(300).optional(),
  difyWorkflowId: z.string().max(100).optional(),
  difyConfiguration: z.object({}).optional(),
  metadata: z.object({}).optional(),
});

// GET /api/questionnaires - List all active questionnaires
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as QuestionnaireType | null;
    const category = searchParams.get('category');
    const completed = searchParams.get('completed') === 'true';

    let query = db
      .select({
        id: questionnaires.id,
        title: questionnaires.title,
        description: questionnaires.description,
        type: questionnaires.type,
        category: questionnaires.category,
        version: questionnaires.version,
        estimatedDuration: questionnaires.estimatedDuration,
        createdAt: questionnaires.createdAt,
        metadata: questionnaires.metadata,
      })
      .from(questionnaires)
      .where(eq(questionnaires.isActive, true));

    if (type) {
      query = query.where(and(eq(questionnaires.isActive, true), eq(questionnaires.type, type)));
    }

    if (category) {
      query = query.where(and(eq(questionnaires.isActive, true), eq(questionnaires.category, category)));
    }

    const result = await query.orderBy(desc(questionnaires.createdAt));

    // If completed=true, return user's completed sessions instead
    if (completed) {
      const completedSessions = await db
        .select({
          sessionId: questionnaireResponses.sessionId,
          questionnaireId: questionnaireResponses.questionnaireId,
          completedAt: questionnaireResponses.completedAt,
          questionnaire: {
            id: questionnaires.id,
            title: questionnaires.title,
            description: questionnaires.description,
            type: questionnaires.type,
            category: questionnaires.category,
          },
        })
        .from(questionnaireResponses)
        .leftJoin(questionnaires, eq(questionnaireResponses.questionnaireId, questionnaires.id))
        .where(and(
          eq(questionnaireResponses.userId, user.id),
          eq(questionnaireResponses.status, ResponseStatus.COMPLETED)
        ))
        .orderBy(desc(questionnaireResponses.completedAt));

      return NextResponse.json({
        sessions: completedSessions,
        total: completedSessions.length,
      });
    }

    return NextResponse.json({
      questionnaires: result,
      total: result.length,
    });
  } catch (error) {
    console.error('Error fetching questionnaires:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questionnaires' },
      { status: 500 }
    );
  }
}

// POST /api/questionnaires - Create a new questionnaire (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, allow any authenticated user to create questionnaires
    // In production, you'd want admin-only access
    
    const body = await request.json();
    const validatedData = createQuestionnaireSchema.parse(body);

    const [newQuestionnaire] = await db
      .insert(questionnaires)
      .values({
        ...validatedData,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json({
      questionnaire: newQuestionnaire,
      message: 'Questionnaire created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to create questionnaire' },
      { status: 500 }
    );
  }
}
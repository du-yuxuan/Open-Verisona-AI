import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { questionnaires, questions } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, asc } from 'drizzle-orm';

// Schema for updating questionnaire
const updateQuestionnaireSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  estimatedDuration: z.number().min(1).max(300).optional(),
  isActive: z.boolean().optional(),
  difyWorkflowId: z.string().max(100).optional().nullable(),
  difyConfiguration: z.object({}).optional().nullable(),
  metadata: z.object({}).optional().nullable(),
});

// GET /api/questionnaires/[id] - Get a specific questionnaire with questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const questionnaireId = parseInt(id);
    if (isNaN(questionnaireId)) {
      return NextResponse.json({ error: 'Invalid questionnaire ID' }, { status: 400 });
    }

    // Get questionnaire details
    const [questionnaire] = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, questionnaireId))
      .limit(1);

    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    if (!questionnaire.isActive) {
      return NextResponse.json({ error: 'Questionnaire is not active' }, { status: 403 });
    }

    // Get all questions for this questionnaire
    const questionsList = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        questionType: questions.questionType,
        category: questions.category,
        options: questions.options,
        isRequired: questions.isRequired,
        order: questions.order,
        conditions: questions.conditions,
        isAiGenerated: questions.isAiGenerated,
      })
      .from(questions)
      .where(eq(questions.questionnaireId, questionnaireId))
      .orderBy(asc(questions.order));

    return NextResponse.json({
      questionnaire: {
        id: questionnaire.id,
        title: questionnaire.title,
        description: questionnaire.description,
        type: questionnaire.type,
        category: questionnaire.category,
        version: questionnaire.version,
        estimatedDuration: questionnaire.estimatedDuration,
        metadata: questionnaire.metadata,
        createdAt: questionnaire.createdAt,
      },
      questions: questionsList,
      totalQuestions: questionsList.length,
    });
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questionnaire' },
      { status: 500 }
    );
  }
}

// PUT /api/questionnaires/[id] - Update a questionnaire
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const questionnaireId = parseInt(id);
    if (isNaN(questionnaireId)) {
      return NextResponse.json({ error: 'Invalid questionnaire ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateQuestionnaireSchema.parse(body);

    // Check if questionnaire exists
    const [existingQuestionnaire] = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, questionnaireId))
      .limit(1);

    if (!existingQuestionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    // Update questionnaire
    const [updatedQuestionnaire] = await db
      .update(questionnaires)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(questionnaires.id, questionnaireId))
      .returning();

    return NextResponse.json({
      questionnaire: updatedQuestionnaire,
      message: 'Questionnaire updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to update questionnaire' },
      { status: 500 }
    );
  }
}

// DELETE /api/questionnaires/[id] - Soft delete a questionnaire
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const questionnaireId = parseInt(id);
    if (isNaN(questionnaireId)) {
      return NextResponse.json({ error: 'Invalid questionnaire ID' }, { status: 400 });
    }

    // Check if questionnaire exists
    const [existingQuestionnaire] = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, questionnaireId))
      .limit(1);

    if (!existingQuestionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await db
      .update(questionnaires)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(questionnaires.id, questionnaireId));

    return NextResponse.json({
      message: 'Questionnaire deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate questionnaire' },
      { status: 500 }
    );
  }
}
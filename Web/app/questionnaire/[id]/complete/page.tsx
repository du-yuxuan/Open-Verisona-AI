import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { questionnaires, questionnaireResponses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { QuestionnaireCompletePage } from './complete-client';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuestionnaireCompletePageServer({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const resolvedParams = await params;
  const questionnaireId = parseInt(resolvedParams.id);
  if (isNaN(questionnaireId)) {
    notFound();
  }

  // Get questionnaire
  const questionnaire = await db.query.questionnaires.findFirst({
    where: eq(questionnaires.id, questionnaireId),
  });

  if (!questionnaire) {
    notFound();
  }

  // Get user's most recent session for this questionnaire
  const session = await db.query.questionnaireResponses.findFirst({
    where: and(
      eq(questionnaireResponses.userId, user.id),
      eq(questionnaireResponses.questionnaireId, questionnaireId),
      eq(questionnaireResponses.status, 'completed')
    ),
    orderBy: (questionnaireResponses, { desc }) => [desc(questionnaireResponses.completedAt)],
  });

  if (!session) {
    notFound();
  }

  // Get AI-generated questionnaire if this was a foundation questionnaire
  let aiGeneratedQuestionnaire = null;
  if (questionnaire.title === 'Verisona AI Foundation Questionnaire' && session.difyResults) {
    aiGeneratedQuestionnaire = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.title, 'Verisona AI Questionnaire'),
      orderBy: (questionnaires, { desc }) => [desc(questionnaires.createdAt)],
    });
  }

  return (
    <QuestionnaireCompletePage
      questionnaire={questionnaire}
      session={session}
      aiGeneratedQuestionnaire={aiGeneratedQuestionnaire}
      user={user}
    />
  );
}
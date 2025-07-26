import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { getQuestionnaireWithQuestions } from '@/lib/db/questionnaire-queries';
import QuestionnaireClient from './questionnaire-client';

interface QuestionnairePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuestionnairePage({ params }: QuestionnairePageProps) {
  const resolvedParams = await params;
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const questionnaireId = parseInt(resolvedParams.id);
  if (isNaN(questionnaireId)) {
    notFound();
  }

  // Get questionnaire with questions
  const data = await getQuestionnaireWithQuestions(questionnaireId);
  
  if (!data) {
    notFound();
  }

  const { questionnaire, questions } = data;

  return (
    <main className="flex-1 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuestionnaireClient 
          questionnaire={questionnaire}
          questions={questions}
          user={user}
        />
      </div>
    </main>
  );
}
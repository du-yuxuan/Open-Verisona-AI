import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { 
  questionnaireResponses, 
  questionResponses,
  questions,
  questionnaires
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/responses/[sessionId]/analytics - Get detailed analytics for a session
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

    // Verify session belongs to user
    const [session] = await db
      .select({
        session: questionnaireResponses,
        questionnaire: questionnaires
      })
      .from(questionnaireResponses)
      .leftJoin(questionnaires, eq(questionnaireResponses.questionnaireId, questionnaires.id))
      .where(and(
        eq(questionnaireResponses.sessionId, sessionId),
        eq(questionnaireResponses.userId, user.id)
      ))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get all responses with detailed analytics
    const responses = await db
      .select({
        response: questionResponses,
        question: questions
      })
      .from(questionResponses)
      .leftJoin(questions, eq(questionResponses.questionId, questions.id))
      .where(eq(questionResponses.sessionId, sessionId))
      .orderBy(desc(questionResponses.answeredAt));

    // Calculate session-level analytics
    const totalResponses = responses.length;
    const totalTimeSpent = responses.reduce((sum, r) => sum + (r.response.timeSpentSeconds || 0), 0);
    const averageTimePerResponse = totalResponses > 0 ? totalTimeSpent / totalResponses : 0;
    const revisedResponses = responses.filter(r => r.response.isRevised).length;
    const revisionRate = totalResponses > 0 ? (revisedResponses / totalResponses) * 100 : 0;

    // Quality metrics
    let totalQualityScore = 0;
    let qualityScoreCount = 0;
    let sentimentDistribution = { positive: 0, neutral: 0, negative: 0 };
    let complexityDistribution = { simple: 0, moderate: 0, complex: 0 };

    const responseAnalytics = responses.map(r => {
      const metadata = r.response.metadata as any;
      const validation = metadata?.validation;
      const analytics = metadata?.analytics;

      if (validation?.score) {
        totalQualityScore += validation.score;
        qualityScoreCount++;
      }

      if (analytics?.sentiment) {
        sentimentDistribution[analytics.sentiment]++;
      }

      if (analytics?.complexity) {
        complexityDistribution[analytics.complexity]++;
      }

      return {
        questionId: r.response.questionId,
        questionText: r.question?.questionText,
        questionType: r.question?.questionType,
        category: r.question?.category,
        responseValue: r.response.responseValue || r.response.responseText || r.response.responseScore,
        timeSpent: r.response.timeSpentSeconds,
        isRevised: r.response.isRevised,
        revisionCount: r.response.revisionCount,
        qualityScore: validation?.score,
        sentiment: analytics?.sentiment,
        complexity: analytics?.complexity,
        wordCount: analytics?.wordCount,
        characterCount: analytics?.characterCount,
        suggestions: validation?.suggestions || [],
        answeredAt: r.response.answeredAt,
        updatedAt: r.response.updatedAt
      };
    });

    const averageQualityScore = qualityScoreCount > 0 ? totalQualityScore / qualityScoreCount : null;

    // Category breakdown
    const categoryBreakdown = responses.reduce((acc, r) => {
      const category = r.question?.category || 'other';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          averageTime: 0,
          totalTime: 0,
          revisions: 0
        };
      }
      acc[category].count++;
      acc[category].totalTime += r.response.timeSpentSeconds || 0;
      acc[category].averageTime = acc[category].totalTime / acc[category].count;
      if (r.response.isRevised) acc[category].revisions++;
      return acc;
    }, {} as any);

    // Engagement patterns
    const engagementInsights = [];

    if (averageTimePerResponse > 60) {
      engagementInsights.push({
        type: 'positive',
        message: 'You\'re taking thoughtful time with your responses - great job!'
      });
    } else if (averageTimePerResponse < 15) {
      engagementInsights.push({
        type: 'suggestion',
        message: 'Consider taking a bit more time to reflect on your answers for deeper insights.'
      });
    }

    if (revisionRate > 20) {
      engagementInsights.push({
        type: 'positive',
        message: 'Your willingness to revise shows thoughtful self-reflection.'
      });
    }

    if (averageQualityScore && averageQualityScore > 85) {
      engagementInsights.push({
        type: 'positive',
        message: 'Your responses show excellent depth and authenticity!'
      });
    }

    // Progress insights
    const completionRate = (totalResponses / (session.session.totalQuestions || 1)) * 100;
    let progressInsight = '';
    
    if (completionRate >= 100) {
      progressInsight = 'Congratulations! You\'ve completed the entire questionnaire.';
    } else if (completionRate >= 75) {
      progressInsight = 'You\'re almost done! Just a few more questions to go.';
    } else if (completionRate >= 50) {
      progressInsight = 'Great progress! You\'re halfway through the questionnaire.';
    } else if (completionRate >= 25) {
      progressInsight = 'Good start! Keep going to unlock more personalized insights.';
    } else {
      progressInsight = 'You\'re just getting started. Each response helps us understand you better.';
    }

    return NextResponse.json({
      sessionAnalytics: {
        sessionId,
        questionnaireName: session.questionnaire?.title,
        totalResponses,
        totalTimeSpent,
        averageTimePerResponse: Math.round(averageTimePerResponse),
        revisionRate: Math.round(revisionRate * 100) / 100,
        averageQualityScore: averageQualityScore ? Math.round(averageQualityScore * 100) / 100 : null,
        completionRate: Math.round(completionRate * 100) / 100,
        progressInsight
      },
      distributions: {
        sentiment: sentimentDistribution,
        complexity: complexityDistribution
      },
      categoryBreakdown,
      responses: responseAnalytics,
      insights: engagementInsights,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating response analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
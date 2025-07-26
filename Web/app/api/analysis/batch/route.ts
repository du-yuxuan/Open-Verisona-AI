import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { 
  questionnaireResponses, 
  questionResponses,
  questions,
  reports,
  activityLogs,
  ActivityType,
  ResponseStatus,
  ReportType,
  ReportStatus
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, inArray } from 'drizzle-orm';
import { difyService, type DifyAnalysisResponse } from '@/lib/services/dify-service';
import DifyDataMapper from '@/lib/services/dify-data-mapper';

// Schema for batch analysis request
const batchAnalysisRequestSchema = z.object({
  sessionIds: z.array(z.string().uuid()).min(1).max(10), // Limit to 10 sessions for performance
  analysisType: z.enum(['personality', 'academic', 'college_match', 'comprehensive']).default('comprehensive'),
  options: z.object({
    includeRecommendations: z.boolean().default(true),
    includeCollegeMatches: z.boolean().default(true),
    includeEssayGuidance: z.boolean().default(false),
    detailLevel: z.enum(['summary', 'detailed', 'comprehensive']).default('detailed'),
    generateComparative: z.boolean().default(false), // Compare across sessions
  }).optional(),
});

// POST /api/analysis/batch - Generate analysis for multiple sessions
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionIds, analysisType, options } = batchAnalysisRequestSchema.parse(body);

    // Verify all sessions belong to user and are completed
    const sessions = await db
      .select()
      .from(questionnaireResponses)
      .where(and(
        inArray(questionnaireResponses.sessionId, sessionIds),
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.status, ResponseStatus.COMPLETED)
      ));

    if (sessions.length !== sessionIds.length) {
      return NextResponse.json({ 
        error: 'Some sessions not found, unauthorized, or not completed',
        foundSessions: sessions.length,
        requestedSessions: sessionIds.length
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process each session
    for (const session of sessions) {
      try {
        // Check if analysis already exists
        const [existingReport] = await db
          .select()
          .from(reports)
          .where(and(
            eq(reports.sessionId, session.sessionId),
            eq(reports.userId, user.id),
            eq(reports.type, getReportType(analysisType))
          ))
          .limit(1);

        if (existingReport && existingReport.status === ReportStatus.COMPLETED) {
          results.push({
            sessionId: session.sessionId,
            status: 'cached',
            report: existingReport,
            cached: true,
          });
          continue;
        }

        // Get responses for this session
        const responses = await db
          .select({
            response: questionResponses,
            question: questions
          })
          .from(questionResponses)
          .leftJoin(questions, eq(questionResponses.questionId, questions.id))
          .where(eq(questionResponses.sessionId, session.sessionId));

        if (responses.length === 0) {
          errors.push({
            sessionId: session.sessionId,
            error: 'No responses found'
          });
          continue;
        }

        // Create report record
        const [report] = await db
          .insert(reports)
          .values({
            sessionId: session.sessionId,
            userId: user.id,
            type: getReportType(analysisType),
            status: ReportStatus.PROCESSING,
            title: generateReportTitle(analysisType, user, session.sessionId),
            metadata: {
              analysisStarted: new Date().toISOString(),
              analysisType,
              options,
              responseCount: responses.length,
              batchId: `batch_${Date.now()}`,
            }
          })
          .returning();

        // Perform analysis
        try {
          const analysisResult = await performAnalysis(
            user,
            session.sessionId,
            responses,
            analysisType,
            options || {}
          );

          // Update report with results
          const [updatedReport] = await db
            .update(reports)
            .set({
              status: ReportStatus.COMPLETED,
              content: analysisResult.analysis,
              summary: analysisResult.analysis.summary,
              metadata: {
                ...report.metadata as any,
                analysisCompleted: new Date().toISOString(),
                processingTime: Date.now() - new Date(report.createdAt).getTime(),
                difyMetadata: analysisResult.metadata,
              }
            })
            .where(eq(reports.id, report.id))
            .returning();

          results.push({
            sessionId: session.sessionId,
            status: 'completed',
            report: updatedReport,
            analysis: analysisResult.analysis,
          });

        } catch (analysisError) {
          console.error(`Analysis failed for session ${session.sessionId}:`, analysisError);
          
          await db
            .update(reports)
            .set({
              status: ReportStatus.FAILED,
              metadata: {
                ...report.metadata as any,
                error: analysisError instanceof Error ? analysisError.message : String(analysisError),
                failedAt: new Date().toISOString(),
              }
            })
            .where(eq(reports.id, report.id));

          errors.push({
            sessionId: session.sessionId,
            error: analysisError instanceof Error ? analysisError.message : String(analysisError),
            reportId: report.id,
          });
        }

      } catch (sessionError) {
        console.error(`Error processing session ${session.sessionId}:`, sessionError);
        errors.push({
          sessionId: session.sessionId,
          error: sessionError.message,
        });
      }
    }

    // Log batch analysis activity
    await db.insert(activityLogs).values({
      userId: user.id,
      action: ActivityType.REPORT_GENERATED,
      metadata: JSON.stringify({
        batchAnalysis: true,
        sessionCount: sessionIds.length,
        successCount: results.filter(r => r.status === 'completed').length,
        errorCount: errors.length,
        analysisType,
      }),
    });

    return NextResponse.json({
      message: 'Batch analysis completed',
      results,
      errors,
      summary: {
        total: sessionIds.length,
        completed: results.filter(r => r.status === 'completed').length,
        cached: results.filter(r => r.status === 'cached').length,
        failed: errors.length,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in batch analysis:', error);
    return NextResponse.json(
      { error: 'Failed to process batch analysis' },
      { status: 500 }
    );
  }
}

// Helper function to perform the actual analysis
async function performAnalysis(
  user: any,
  sessionId: string,
  responses: any[],
  analysisType: string,
  options: any
): Promise<DifyAnalysisResponse> {
  // Map responses to the format expected by Dify
  const mappedResponses = DifyDataMapper.mapResponseContext(
    responses.map(r => ({
      question: r.question,
      response: r.response.responseValue || r.response.responseText || r.response.responseScore,
      metadata: r.response.metadata,
    }))
  );

  // Build analysis request
  const analysisRequest = DifyDataMapper.buildAnalysisRequest(
    user,
    sessionId,
    mappedResponses,
    analysisType as any,
    options
  );

  // Call Dify service
  const difyResult = await difyService.analyzeResponses(analysisRequest);

  return difyResult;
}

// Helper functions
function getReportType(analysisType: string): ReportType {
  switch (analysisType) {
    case 'personality': return ReportType.PERSONALITY;
    case 'academic': return ReportType.ACADEMIC;
    case 'college_match': return ReportType.COLLEGE_MATCH;
    case 'comprehensive': return ReportType.COMPREHENSIVE;
    default: return ReportType.COMPREHENSIVE;
  }
}

function generateReportTitle(analysisType: string, user: any, sessionId: string): string {
  const userName = user.firstName ? `${user.firstName}'s` : 'Your';
  const sessionShort = sessionId.slice(-8);
  
  switch (analysisType) {
    case 'personality':
      return `${userName} Personality Analysis (${sessionShort})`;
    case 'academic':
      return `${userName} Academic Profile (${sessionShort})`;
    case 'college_match':
      return `${userName} College Match Report (${sessionShort})`;
    case 'comprehensive':
      return `${userName} Complete Analysis (${sessionShort})`;
    default:
      return `${userName} Report (${sessionShort})`;
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { 
  questionnaireResponses, 
  questionResponses,
  questions,
  users,
  reports,
  activityLogs,
  ActivityType,
  ResponseStatus,
  ReportType,
  ReportStatus
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { difyService, type DifyAnalysisResponse } from '@/lib/services/dify-service';
import DifyDataMapper from '@/lib/services/dify-data-mapper';

// Schema for analysis request
const analysisRequestSchema = z.object({
  analysisType: z.enum(['personality', 'academic', 'college_match', 'comprehensive']).default('comprehensive'),
  options: z.object({
    includeRecommendations: z.boolean().default(true),
    includeCollegeMatches: z.boolean().default(true),
    includeEssayGuidance: z.boolean().default(false),
    detailLevel: z.enum(['summary', 'detailed', 'comprehensive']).default('detailed'),
    generateReport: z.boolean().default(true),
  }).optional(),
});

// POST /api/analysis/[sessionId] - Generate AI analysis for a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const body = await request.json();
    const { analysisType, options } = analysisRequestSchema.parse(body);

    // Verify session belongs to user and is completed
    const [session] = await db
      .select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.sessionId, sessionId),
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.status, ResponseStatus.COMPLETED)
      ))
      .limit(1);

    if (!session) {
      return NextResponse.json({ 
        error: 'Session not found, unauthorized, or not completed' 
      }, { status: 404 });
    }

    // Check if analysis already exists for this session
    const [existingReport] = await db
      .select()
      .from(reports)
      .where(and(
        eq(reports.sessionId, sessionId),
        eq(reports.userId, user.id),
        eq(reports.type, getReportType(analysisType))
      ))
      .limit(1);

    if (existingReport && existingReport.status === ReportStatus.COMPLETED) {
      return NextResponse.json({
        message: 'Analysis already exists',
        report: existingReport,
        cached: true,
      });
    }

    // Get all responses with question details
    const responses = await db
      .select({
        response: questionResponses,
        question: questions
      })
      .from(questionResponses)
      .leftJoin(questions, eq(questionResponses.questionId, questions.id))
      .where(eq(questionResponses.sessionId, sessionId));

    if (responses.length === 0) {
      return NextResponse.json({
        error: 'No responses found for analysis'
      }, { status: 400 });
    }

    // Create or update report record
    let report;
    if (existingReport) {
      [report] = await db
        .update(reports)
        .set({
          status: ReportStatus.PROCESSING,
          metadata: {
            ...existingReport.metadata as any,
            analysisStarted: new Date().toISOString(),
            analysisType,
            options,
          }
        })
        .where(eq(reports.id, existingReport.id))
        .returning();
    } else {
      [report] = await db
        .insert(reports)
        .values({
          sessionId,
          userId: user.id,
          type: getReportType(analysisType),
          status: ReportStatus.PROCESSING,
          title: generateReportTitle(analysisType, user),
          metadata: {
            analysisStarted: new Date().toISOString(),
            analysisType,
            options,
            responseCount: responses.length,
            questionnaireId: session.questionnaireId,
          }
        })
        .returning();
    }

    // Start background analysis using async streaming approach
    // Return immediately with processing status and allow polling for completion
    processAnalysisAsync(
      user,
      sessionId,
      responses,
      analysisType,
      options || {},
      report.id
    ).catch(error => {
      console.error('Background analysis failed:', error);
      // Update report status to failed in background
      db.update(reports)
        .set({
          status: ReportStatus.FAILED,
          content: JSON.stringify({
            error: 'Analysis failed',
            message: error.message,
            timestamp: new Date().toISOString()
          }),
          metadata: {
            ...report.metadata as any,
            analysisFailed: new Date().toISOString(),
            error: error.message,
          }
        })
        .where(eq(reports.id, report.id))
        .catch(dbError => console.error('Failed to update report status:', dbError));
    });

    return NextResponse.json({
      message: 'Analysis started',
      reportId: report.id,
      sessionId,
      status: 'processing',
      metadata: {
        analysisType,
        estimatedTime: '3-5 minutes',
        startedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error generating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}

// GET /api/analysis/[sessionId] - Get existing analysis for a session
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
    const searchParams = request.nextUrl.searchParams;
    const analysisType = searchParams.get('type') || 'comprehensive';

    // Get all reports for this session
    const sessionReports = await db
      .select()
      .from(reports)
      .where(and(
        eq(reports.sessionId, sessionId),
        eq(reports.userId, user.id)
      ));

    if (sessionReports.length === 0) {
      return NextResponse.json({
        message: 'No analysis found for this session',
        available: false,
      });
    }

    // Get the most recent report of the requested type
    const specificReport = sessionReports
      .filter(r => r.type === getReportType(analysisType))
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0];

    return NextResponse.json({
      reports: sessionReports,
      currentReport: specificReport,
      available: !!specificReport,
    });

  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

// Helper function to perform the actual analysis asynchronously
async function processAnalysisAsync(
  user: any,
  sessionId: string,
  responses: any[],
  analysisType: string,
  options: any,
  reportId: number
): Promise<void> {
  try {
    console.log('\ud83d\ude80 Starting async analysis for session:', sessionId);
    
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

    console.log('\ud83d\udcca Analysis request prepared, calling Dify service...');
    
    // Call Dify service with extended timeout
    const difyResult = await difyService.analyzeResponses(analysisRequest);
    
    console.log('\u2705 Analysis completed successfully');
    
    // Save the analysis result
    const processingTime = Date.now() - new Date().getTime();
    
    // 确保分析结果有效
    const analysisContent = difyResult.analysis || 'Analysis completed successfully';
    const analysisSummary = difyResult.analysis?.summary || 'Summary not available';
    
    // Store content as proper JSON structure
    let contentToStore;
    if (typeof analysisContent === 'string') {
      contentToStore = {
        text: analysisContent,
        type: 'markdown',
        generatedAt: new Date().toISOString()
      };
    } else {
      contentToStore = analysisContent;
    }
    
    const [updatedReport] = await db
      .update(reports)
      .set({
        status: ReportStatus.COMPLETED,
        content: contentToStore,
        summary: analysisSummary,
        metadata: {
          ...report.metadata as any,
          analysisCompleted: new Date().toISOString(),
          processingTime,
          difyMetadata: difyResult.metadata,
          success: true
        }
      })
      .where(eq(reports.id, reportId))
      .returning();
    
    console.log('✅ Report updated successfully:', {
      reportId,
      status: updatedReport.status,
      contentLength: updatedReport.content ? String(updatedReport.content).length : 0
    });

    // Log activity
    const reportMetadata = updatedReport.metadata as any;
    await db.insert(activityLogs).values({
      userId: user.id,
      action: ActivityType.REPORT_GENERATED,
      metadata: JSON.stringify({
        reportId,
        sessionId,
        analysisType,
        processingTime: reportMetadata?.processingTime,
      }),
    });

    console.log('\ud83d\udcdd Analysis results saved to database');
  } catch (error) {
    console.error('\u274c Analysis failed:', error);
    throw error;
  }
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

function generateReportTitle(analysisType: string, user: any): string {
  const userName = user.firstName ? `${user.firstName}'s` : 'Your';
  
  switch (analysisType) {
    case 'personality':
      return `${userName} Personality Analysis`;
    case 'academic':
      return `${userName} Academic Profile`;
    case 'college_match':
      return `${userName} College Match Report`;
    case 'comprehensive':
      return `${userName} Complete Persona Analysis`;
    default:
      return `${userName} Analysis Report`;
  }
}
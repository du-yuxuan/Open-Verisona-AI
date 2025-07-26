import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db';
import { questionnaireResponses, reports, activityLogs, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { difyService } from '@/lib/services/dify-service';
import { DifyAnalysisRequest } from '@/lib/types/dify';
import { ReportStatus, ReportType, ActivityType } from '@/lib/db/schema';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    const { analysisType = 'comprehensive', options = {} } = await request.json();

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email!))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the questionnaire response session
    const [sessionResponse] = await db
      .select()
      .from(questionnaireResponses)
      .where(
        and(
          eq(questionnaireResponses.sessionId, sessionId),
          eq(questionnaireResponses.userId, user.id)
        )
      )
      .orderBy(desc(questionnaireResponses.createdAt))
      .limit(1);

    if (!sessionResponse) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Create or get existing report
    let report = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.sessionId, sessionId),
          eq(reports.userId, user.id)
        )
      )
      .then(results => results[0]);

    if (!report) {
      const [newReport] = await db
        .insert(reports)
        .values({
          userId: user.id,
          sessionId,
          title: generateReportTitle(analysisType, user),
          type: getReportType(analysisType),
          status: ReportStatus.PROCESSING,
          metadata: {
            analysisType,
            options,
            sessionId,
            createdAt: new Date().toISOString(),
          },
        })
        .returning();
      
      report = newReport;
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'status',
              stage: 'initializing',
              progress: 10,
              message: 'Setting up analysis environment...',
              reportId: report.id,
              timestamp: new Date().toISOString()
            })}\\n\\n`)
          );

          // Prepare analysis request
          const responses = sessionResponse.responses as any[];
          const mappedResponses = responses.map((response: any) => ({
            questionId: response.questionId,
            answer: response.answer,
            type: response.type || 'text',
            metadata: response.metadata || {},
            timestamp: response.timestamp || new Date().toISOString(),
          }));

          const analysisRequest: DifyAnalysisRequest = {
            userId: user.id,
            sessionId,
            responses: mappedResponses,
            userProfile: {
              name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email,
              email: user.email,
              preferences: user.preferences || {},
            },
            analysisType: analysisType as any,
            options: {
              includeRecommendations: true,
              includeCollegeMatches: true,
              includeEssayGuidance: true,
              detailLevel: 'comprehensive',
              generateReport: true,
              ...options,
            },
          };

          // Send processing status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'status',
              stage: 'processing',
              progress: 30,
              message: 'Analyzing your responses through our AI engine...',
              reportId: report.id,
              timestamp: new Date().toISOString()
            })}\\n\\n`)
          );

          // Call Dify service with streaming
          const difyResult = await difyService.analyzeResponsesWithStreaming(
            analysisRequest,
            (progressData) => {
              // Send progress updates
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  stage: progressData.stage || 'processing',
                  progress: progressData.progress || 50,
                  message: progressData.message || 'Processing...',
                  reportId: report.id,
                  timestamp: new Date().toISOString(),
                  details: progressData.details
                })}\\n\\n`)
              );
            }
          );

          // Send final processing status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'status',
              stage: 'finalizing',
              progress: 90,
              message: 'Preparing your comprehensive analysis report...',
              reportId: report.id,
              timestamp: new Date().toISOString()
            })}\\n\\n`)
          );

          // Save the analysis result
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
                difyMetadata: difyResult.metadata,
                success: true
              }
            })
            .where(eq(reports.id, report.id))
            .returning();

          // Log activity
          await db.insert(activityLogs).values({
            userId: user.id,
            action: ActivityType.REPORT_GENERATED,
            metadata: JSON.stringify({
              reportId: report.id,
              sessionId,
              analysisType,
            }),
          });

          // Send completion status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'complete',
              stage: 'completed',
              progress: 100,
              message: 'Analysis complete! Your report is ready.',
              reportId: report.id,
              timestamp: new Date().toISOString(),
              result: {
                reportId: report.id,
                status: updatedReport.status,
                summary: analysisSummary
              }
            })}\\n\\n`)
          );

          controller.close();
        } catch (error) {
          console.error('Streaming analysis error:', error);
          
          // Update report status to failed
          await db
            .update(reports)
            .set({
              status: ReportStatus.FAILED,
              metadata: {
                ...report.metadata as any,
                error: error.message,
                failedAt: new Date().toISOString()
              }
            })
            .where(eq(reports.id, report.id));

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              stage: 'error',
              progress: 0,
              message: error.message || 'Analysis failed. Please try again.',
              reportId: report.id,
              timestamp: new Date().toISOString()
            })}\\n\\n`)
          );
          
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup streaming analysis' },
      { status: 500 }
    );
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
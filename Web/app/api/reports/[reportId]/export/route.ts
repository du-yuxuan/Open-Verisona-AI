import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { reports, users, questionnaires } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';

// GET /api/reports/[reportId]/export - Export report in various formats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    // Get report with questionnaire details
    const [reportData] = await db
      .select({
        report: reports,
        questionnaire: questionnaires
      })
      .from(reports)
      .leftJoin(questionnaires, eq(reports.questionnaireId, questionnaires.id))
      .where(and(
        eq(reports.id, reportId),
        eq(reports.userId, user.id)
      ))
      .limit(1);

    if (!reportData) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    const report = reportData.report;
    const questionnaire = reportData.questionnaire;

    if (format === 'json') {
      return NextResponse.json({
        id: report.id,
        title: report.title,
        type: report.type,
        summary: report.summary,
        content: report.content,
        questionnaire: questionnaire?.title,
        createdAt: report.createdAt,
        completedAt: report.completedAt,
        metadata: report.metadata,
        exportedAt: new Date().toISOString(),
        exportedBy: `${user.firstName} ${user.lastName}`.trim() || user.email,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.json"`
        }
      });
    }

    if (format === 'txt') {
      const textContent = generateTextReport(report, questionnaire, user);
      
      return new NextResponse(textContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt"`
        }
      });
    }

    if (format === 'csv') {
      const csvContent = generateCSVReport(report, questionnaire, user);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Unsupported export format. Use json, txt, or csv.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

function generateTextReport(report: any, questionnaire: any, user: any): string {
  const userName = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const content = report.content || {};
  
  let text = `VERISONA AI ANALYSIS REPORT\n`;
  text += `${Array(50).fill('=').join('')}\n\n`;
  text += `Report Title: ${report.title}\n`;
  text += `Student: ${userName}\n`;
  text += `Questionnaire: ${questionnaire?.title || 'Unknown'}\n`;
  text += `Report Type: ${report.type.replace('_', ' ').toUpperCase()}\n`;
  text += `Generated: ${new Date(report.completedAt || report.createdAt).toLocaleString()}\n`;
  text += `Report ID: ${report.id}\n`;
  text += `${Array(50).fill('-').join('')}\n\n`;

  if (report.summary) {
    text += `EXECUTIVE SUMMARY\n`;
    text += `${Array(20).fill('-').join('')}\n`;
    text += `${report.summary}\n\n`;
  }

  // Personality Analysis
  if (content.personality) {
    text += `PERSONALITY ANALYSIS\n`;
    text += `${Array(20).fill('-').join('')}\n`;
    
    if (content.personality.traits) {
      text += `Core Traits:\n`;
      content.personality.traits.forEach((trait: any) => {
        text += `  • ${trait.name}: ${trait.score}/10\n`;
        text += `    ${trait.description}\n`;
      });
      text += '\n';
    }
    
    if (content.personality.strengths) {
      text += `Key Strengths:\n`;
      content.personality.strengths.forEach((strength: string) => {
        text += `  • ${strength}\n`;
      });
      text += '\n';
    }
  }

  // College Matches
  if (content.colleges) {
    text += `COLLEGE MATCHES\n`;
    text += `${Array(15).fill('-').join('')}\n`;
    content.colleges.forEach((college: any, index: number) => {
      text += `${index + 1}. ${college.name} (${college.matchScore}% match)\n`;
      text += `   Location: ${college.location}\n`;
      text += `   Why: ${college.why}\n`;
      if (college.programs) {
        text += `   Programs: ${college.programs.join(', ')}\n`;
      }
      text += '\n';
    });
  }

  // Academic Profile
  if (content.academic) {
    text += `ACADEMIC PROFILE\n`;
    text += `${Array(16).fill('-').join('')}\n`;
    
    if (content.academic.interests) {
      text += `Interests: ${content.academic.interests.join(', ')}\n\n`;
    }
    
    if (content.academic.careerPaths) {
      text += `Career Paths:\n`;
      content.academic.careerPaths.forEach((career: any) => {
        text += `  • ${career.title}\n`;
        text += `    ${career.description}\n`;
        if (career.alignment) {
          text += `    Alignment: ${career.alignment}/10\n`;
        }
      });
      text += '\n';
    }
  }

  // Recommendations
  if (content.recommendations) {
    text += `RECOMMENDATIONS\n`;
    text += `${Array(15).fill('-').join('')}\n`;
    content.recommendations.forEach((rec: any, index: number) => {
      text += `${index + 1}. ${rec.title}\n`;
      text += `   ${rec.description}\n`;
      if (rec.action) {
        text += `   Action: ${rec.action}\n`;
      }
      text += '\n';
    });
  }

  // Insights
  if (content.insights) {
    text += `PERSONAL INSIGHTS\n`;
    text += `${Array(17).fill('-').join('')}\n`;
    content.insights.forEach((insight: string, index: number) => {
      text += `${index + 1}. ${insight}\n`;
    });
    text += '\n';
  }

  text += `${Array(50).fill('=').join('')}\n`;
  text += `Generated by Verisona AI - Authentic College Application Platform\n`;
  text += `Export Date: ${new Date().toLocaleString()}\n`;

  return text;
}

function generateCSVReport(report: any, questionnaire: any, user: any): string {
  const userName = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const content = report.content || {};
  
  let csv = 'Section,Item,Value,Score,Description\n';
  
  // Basic info
  csv += `Report,Title,"${report.title}",,\n`;
  csv += `Report,Student,"${userName}",,\n`;
  csv += `Report,Questionnaire,"${questionnaire?.title || 'Unknown'}",,\n`;
  csv += `Report,Type,"${report.type}",,\n`;
  csv += `Report,Generated,"${new Date(report.completedAt || report.createdAt).toISOString()}",,\n`;
  
  if (report.summary) {
    csv += `Summary,Executive Summary,"${report.summary.replace(/"/g, '""')}",,\n`;
  }

  // Personality traits
  if (content.personality?.traits) {
    content.personality.traits.forEach((trait: any) => {
      csv += `Personality,${trait.name},"${trait.description.replace(/"/g, '""')}",${trait.score},Trait Score (1-10)\n`;
    });
  }

  // Strengths
  if (content.personality?.strengths) {
    content.personality.strengths.forEach((strength: string) => {
      csv += `Strengths,Strength,"${strength}",,\n`;
    });
  }

  // College matches
  if (content.colleges) {
    content.colleges.forEach((college: any) => {
      csv += `Colleges,${college.name},"${college.why.replace(/"/g, '""')}",${college.matchScore},Match Percentage\n`;
      csv += `Colleges,${college.name} Location,"${college.location}",,\n`;
      if (college.programs) {
        csv += `Colleges,${college.name} Programs,"${college.programs.join(', ')}",,\n`;
      }
    });
  }

  // Academic interests
  if (content.academic?.interests) {
    content.academic.interests.forEach((interest: string) => {
      csv += `Academic,Interest,"${interest}",,\n`;
    });
  }

  // Career paths
  if (content.academic?.careerPaths) {
    content.academic.careerPaths.forEach((career: any) => {
      csv += `Career,${career.title},"${career.description.replace(/"/g, '""')}",${career.alignment || ''},Alignment Score (1-10)\n`;
    });
  }

  // Recommendations
  if (content.recommendations) {
    content.recommendations.forEach((rec: any) => {
      csv += `Recommendations,${rec.title},"${rec.description.replace(/"/g, '""')}",,\n`;
      if (rec.action) {
        csv += `Recommendations,${rec.title} Action,"${rec.action.replace(/"/g, '""')}",,\n`;
      }
    });
  }

  // Insights
  if (content.insights) {
    content.insights.forEach((insight: string, index: number) => {
      csv += `Insights,Insight ${index + 1},"${insight.replace(/"/g, '""')}",,\n`;
    });
  }

  return csv;
}
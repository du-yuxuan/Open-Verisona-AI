import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { reports } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, desc } from 'drizzle-orm';

// GET /api/reports - Get list of reports for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all reports for the user
    const userReports = await db
      .select({
        id: reports.id,
        title: reports.title,
        type: reports.type,
        status: reports.status,
        summary: reports.summary,
        sessionId: reports.sessionId,
        generatedAt: reports.generatedAt,
        updatedAt: reports.updatedAt,
        lastViewedAt: reports.lastViewedAt,
        metadata: reports.metadata,
      })
      .from(reports)
      .where(eq(reports.userId, user.id))
      .orderBy(desc(reports.generatedAt));

    return NextResponse.json({
      reports: userReports,
      total: userReports.length,
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { reports, users, questionnaires } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';

// GET /api/reports/[reportId] - Get individual report details
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

    // Parse reportId as integer since it's a serial type
    const reportIdInt = parseInt(reportId);
    if (isNaN(reportIdInt)) {
      return NextResponse.json(
        { error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    // Get report details
    const [report] = await db
      .select()
      .from(reports)
      .where(and(
        eq(reports.id, reportIdInt),
        eq(reports.userId, user.id)
      ))
      .limit(1);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      report: report,
      status: report.status, // 保证状态字段在顶层可用
      success: true
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[reportId] - Delete a report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId } = await params;

    // Parse reportId as integer since it's a serial type
    const reportIdInt = parseInt(reportId);
    if (isNaN(reportIdInt)) {
      return NextResponse.json(
        { error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    // Verify report belongs to user
    const [existingReport] = await db
      .select()
      .from(reports)
      .where(and(
        eq(reports.id, reportIdInt),
        eq(reports.userId, user.id)
      ))
      .limit(1);

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Delete the report
    await db
      .delete(reports)
      .where(eq(reports.id, reportIdInt));

    return NextResponse.json({
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
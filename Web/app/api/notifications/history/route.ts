import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { notificationService } from '@/lib/services/notification-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const history = await notificationService.getUserNotificationHistory(user.id, limit);
    
    return NextResponse.json({
      notifications: history,
      total: history.length,
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification history' },
      { status: 500 }
    );
  }
}
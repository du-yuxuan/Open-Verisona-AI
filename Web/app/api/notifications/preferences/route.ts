import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { notificationService } from '@/lib/services/notification-service';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await notificationService.getUserNotificationPreferences(user.id);
    
    if (!preferences) {
      // Create default preferences if they don't exist
      await notificationService.createDefaultNotificationPreferences(user.id);
      const newPreferences = await notificationService.getUserNotificationPreferences(user.id);
      return NextResponse.json(newPreferences);
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    // Validate the updates object
    const allowedFields = [
      'emailEnabled',
      'welcomeEmails',
      'progressUpdates',
      'reportNotifications',
      'reminderEmails',
      'marketingEmails',
      'reminderFrequency',
      'progressUpdateFrequency',
      'preferredLanguage',
      'timezone',
    ];

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    const success = await notificationService.updateNotificationPreferences(user.id, filteredUpdates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    const updatedPreferences = await notificationService.getUserNotificationPreferences(user.id);
    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
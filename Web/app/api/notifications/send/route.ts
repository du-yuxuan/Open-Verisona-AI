import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { notificationService } from '@/lib/services/email-service';
import { notificationScheduler } from '@/lib/services/notification-scheduler';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, templateId, recipients, variables, scheduleAt } = body;

    if (!type || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Missing required fields: type, recipients' },
        { status: 400 }
      );
    }

    // Validate recipients
    const validRecipients = recipients.filter(r => 
      r.email && typeof r.email === 'string' && r.email.includes('@')
    );

    if (validRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No valid recipients provided' },
        { status: 400 }
      );
    }

    let result;

    if (scheduleAt) {
      // Schedule for later
      const scheduledAt = new Date(scheduleAt);
      if (scheduledAt <= new Date()) {
        return NextResponse.json(
          { error: 'Schedule time must be in the future' },
          { status: 400 }
        );
      }

      const notifications = [];
      for (const recipient of validRecipients) {
        const notificationId = await notificationScheduler.scheduleNotification(
          recipient.userId || 'unknown',
          type,
          {
            email: recipient.email,
            firstName: recipient.firstName || 'Student',
            ...variables,
            ...recipient.variables
          },
          Math.ceil((scheduledAt.getTime() - Date.now()) / (1000 * 60))
        );
        notifications.push(notificationId);
      }

      result = {
        scheduled: notifications.length,
        scheduledAt: scheduledAt.toISOString(),
        notificationIds: notifications
      };
    } else {
      // Send immediately
      switch (type) {
        case 'welcome':
          const welcomeResults = [];
          for (const recipient of validRecipients) {
            const sendResult = await notificationService.sendWelcomeEmail(
              recipient.email,
              recipient.firstName || 'Student'
            );
            welcomeResults.push({
              email: recipient.email,
              success: sendResult.success,
              messageId: sendResult.messageId,
              error: sendResult.error
            });
          }
          result = {
            sent: welcomeResults.filter(r => r.success).length,
            failed: welcomeResults.filter(r => !r.success).length,
            results: welcomeResults
          };
          break;

        case 'questionnaire_reminder':
          const reminderResults = [];
          for (const recipient of validRecipients) {
            const sendResult = await notificationService.sendQuestionnaireReminder(
              recipient.email,
              recipient.firstName || 'Student',
              recipient.progressPercentage || 25,
              recipient.remainingMinutes || 15
            );
            reminderResults.push({
              email: recipient.email,
              success: sendResult.success,
              messageId: sendResult.messageId,
              error: sendResult.error
            });
          }
          result = {
            sent: reminderResults.filter(r => r.success).length,
            failed: reminderResults.filter(r => !r.success).length,
            results: reminderResults
          };
          break;

        case 'report_ready':
          const reportResults = [];
          for (const recipient of validRecipients) {
            const sendResult = await notificationService.sendReportReadyEmail(
              recipient.email,
              recipient.firstName || 'Student',
              recipient.reportId || 'sample-report',
              recipient.insights || [
                'You have strong analytical thinking skills',
                'You show great potential for leadership',
                'Your authentic voice will resonate with admissions committees'
              ]
            );
            reportResults.push({
              email: recipient.email,
              success: sendResult.success,
              messageId: sendResult.messageId,
              error: sendResult.error
            });
          }
          result = {
            sent: reportResults.filter(r => r.success).length,
            failed: reportResults.filter(r => !r.success).length,
            results: reportResults
          };
          break;

        case 'weekly_progress':
          const progressResults = [];
          for (const recipient of validRecipients) {
            const sendResult = await notificationService.sendWeeklyProgress(
              recipient.email,
              recipient.firstName || 'Student',
              recipient.stats || {
                questionsAnswered: Math.floor(Math.random() * 50) + 10,
                timeSpent: Math.floor(Math.random() * 120) + 30,
                achievements: ['Completed profile setup', 'Started questionnaire', 'Reviewed recommendations'],
                nextSteps: ['Complete remaining questions', 'Review your report', 'Explore college matches'],
                weeklyTip: 'Take your time - authenticity is more important than speed.'
              }
            );
            progressResults.push({
              email: recipient.email,
              success: sendResult.success,
              messageId: sendResult.messageId,
              error: sendResult.error
            });
          }
          result = {
            sent: progressResults.filter(r => r.success).length,
            failed: progressResults.filter(r => !r.success).length,
            results: progressResults
          };
          break;

        case 'motivation':
          const motivationResults = [];
          for (const recipient of validRecipients) {
            const sendResult = await notificationService.sendMotivationBoost(
              recipient.email,
              recipient.firstName || 'Student',
              recipient.successStory || 'Maria from Texas overcame financial challenges to attend her dream college with a full scholarship.'
            );
            motivationResults.push({
              email: recipient.email,
              success: sendResult.success,
              messageId: sendResult.messageId,
              error: sendResult.error
            });
          }
          result = {
            sent: motivationResults.filter(r => r.success).length,
            failed: motivationResults.filter(r => !r.success).length,
            results: motivationResults
          };
          break;

        default:
          return NextResponse.json(
            { error: `Unknown notification type: ${type}` },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get notification statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = notificationScheduler.getNotificationStats();
    const rules = notificationScheduler.getRules();

    return NextResponse.json({
      statistics: stats,
      rules: rules,
      totalNotifications: stats.scheduled + stats.sent + stats.failed + stats.cancelled
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { notificationService } from './email-service';

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: 'welcome' | 'questionnaire_reminder' | 'report_ready' | 'weekly_progress' | 'motivation' | 'achievement';
  scheduledAt: Date;
  data: Record<string, any>;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  lastAttempt?: Date;
  nextAttempt?: Date;
  error?: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  type: 'welcome' | 'questionnaire_reminder' | 'weekly_progress' | 'motivation';
  trigger: 'user_registration' | 'questionnaire_incomplete' | 'weekly_schedule' | 'low_activity';
  condition?: string;
  delayMinutes: number;
  repeatInterval?: 'daily' | 'weekly' | 'monthly';
  maxRepeat?: number;
  active: boolean;
}

// Default notification rules
const defaultNotificationRules: NotificationRule[] = [
  {
    id: 'welcome_new_user',
    name: 'Welcome Email for New Users',
    type: 'welcome',
    trigger: 'user_registration',
    delayMinutes: 5, // Send 5 minutes after registration
    active: true
  },
  {
    id: 'questionnaire_reminder_1',
    name: 'First Questionnaire Reminder',
    type: 'questionnaire_reminder',
    trigger: 'questionnaire_incomplete',
    condition: 'registered_more_than_1_day_ago',
    delayMinutes: 1440, // 24 hours
    active: true
  },
  {
    id: 'questionnaire_reminder_2',
    name: 'Second Questionnaire Reminder',
    type: 'questionnaire_reminder',
    trigger: 'questionnaire_incomplete',
    condition: 'registered_more_than_3_days_ago',
    delayMinutes: 4320, // 72 hours
    active: true
  },
  {
    id: 'questionnaire_reminder_3',
    name: 'Final Questionnaire Reminder',
    type: 'questionnaire_reminder',
    trigger: 'questionnaire_incomplete',
    condition: 'registered_more_than_7_days_ago',
    delayMinutes: 10080, // 7 days
    active: true
  },
  {
    id: 'weekly_progress_update',
    name: 'Weekly Progress Update',
    type: 'weekly_progress',
    trigger: 'weekly_schedule',
    delayMinutes: 0,
    repeatInterval: 'weekly',
    active: true
  },
  {
    id: 'motivation_boost',
    name: 'Motivational Message for Inactive Users',
    type: 'motivation',
    trigger: 'low_activity',
    condition: 'no_activity_7_days',
    delayMinutes: 0,
    repeatInterval: 'weekly',
    maxRepeat: 4,
    active: true
  }
];

export class NotificationScheduler {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private rules: NotificationRule[] = defaultNotificationRules;

  // Schedule notification based on user event
  async scheduleNotification(
    userId: string,
    type: ScheduledNotification['type'],
    data: Record<string, any>,
    delayMinutes: number = 0
  ): Promise<string> {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000);

    const notification: ScheduledNotification = {
      id: notificationId,
      userId,
      type,
      scheduledAt,
      data,
      status: 'scheduled',
      attempts: 0
    };

    this.scheduledNotifications.set(notificationId, notification);
    
    console.log(`📅 Scheduled ${type} notification for user ${userId} at ${scheduledAt.toISOString()}`);
    
    return notificationId;
  }

  // Cancel scheduled notification
  cancelNotification(notificationId: string): boolean {
    const notification = this.scheduledNotifications.get(notificationId);
    if (notification && notification.status === 'scheduled') {
      notification.status = 'cancelled';
      this.scheduledNotifications.set(notificationId, notification);
      console.log(`🚫 Cancelled notification ${notificationId}`);
      return true;
    }
    return false;
  }

  // Process triggered events and schedule notifications
  async handleUserEvent(
    eventType: 'user_registration' | 'questionnaire_started' | 'questionnaire_completed' | 'report_generated',
    userId: string,
    userData: {
      email: string;
      firstName: string;
      registrationDate: Date;
      questionnaireCompletionPercentage?: number;
      lastActivityDate?: Date;
    }
  ) {
    const applicableRules = this.rules.filter(rule => {
      if (!rule.active) return false;
      
      // Match trigger event
      switch (eventType) {
        case 'user_registration':
          return rule.trigger === 'user_registration';
        case 'questionnaire_started':
        case 'questionnaire_completed':
          return rule.trigger === 'questionnaire_incomplete';
        default:
          return false;
      }
    });

    for (const rule of applicableRules) {
      // Check conditions
      if (rule.condition && !this.evaluateCondition(rule.condition, userData)) {
        continue;
      }

      // Schedule notification
      await this.scheduleNotification(userId, rule.type, {
        email: userData.email,
        firstName: userData.firstName,
        ruleId: rule.id
      }, rule.delayMinutes);
    }
  }

  // Evaluate notification condition
  private evaluateCondition(condition: string, userData: any): boolean {
    const now = new Date();
    const daysSinceRegistration = (now.getTime() - userData.registrationDate.getTime()) / (1000 * 60 * 60 * 24);

    switch (condition) {
      case 'registered_more_than_1_day_ago':
        return daysSinceRegistration >= 1;
      case 'registered_more_than_3_days_ago':
        return daysSinceRegistration >= 3;
      case 'registered_more_than_7_days_ago':
        return daysSinceRegistration >= 7;
      case 'no_activity_7_days':
        if (!userData.lastActivityDate) return daysSinceRegistration >= 7;
        const daysSinceActivity = (now.getTime() - userData.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActivity >= 7;
      default:
        return true;
    }
  }

  // Process due notifications
  async processDueNotifications(): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    const now = new Date();
    const dueNotifications = Array.from(this.scheduledNotifications.values())
      .filter(n => n.status === 'scheduled' && n.scheduledAt <= now);

    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const notification of dueNotifications) {
      processed++;
      notification.attempts++;
      notification.lastAttempt = now;

      try {
        let result;
        
        switch (notification.type) {
          case 'welcome':
            result = await notificationService.sendWelcomeEmail(
              notification.data.email,
              notification.data.firstName
            );
            break;
            
          case 'questionnaire_reminder':
            // Calculate progress and remaining time
            const progressPercentage = notification.data.progress || 25;
            const remainingMinutes = Math.max(5, 30 - (progressPercentage / 100 * 30));
            
            result = await notificationService.sendQuestionnaireReminder(
              notification.data.email,
              notification.data.firstName,
              progressPercentage,
              remainingMinutes
            );
            break;
            
          case 'report_ready':
            result = await notificationService.sendReportReadyEmail(
              notification.data.email,
              notification.data.firstName,
              notification.data.reportId,
              notification.data.insights || []
            );
            break;
            
          case 'weekly_progress':
            result = await notificationService.sendWeeklyProgress(
              notification.data.email,
              notification.data.firstName,
              notification.data.stats || {
                questionsAnswered: 0,
                timeSpent: 0,
                achievements: [],
                nextSteps: ['Complete your profile', 'Start questionnaire', 'Review recommendations'],
                weeklyTip: 'Take your time - authenticity is more important than speed.'
              }
            );
            break;
            
          case 'motivation':
            result = await notificationService.sendMotivationBoost(
              notification.data.email,
              notification.data.firstName,
              notification.data.successStory || 'Maria from Texas overcame financial challenges to attend her dream college with a full scholarship.'
            );
            break;
            
          default:
            throw new Error(`Unknown notification type: ${notification.type}`);
        }

        if (result.success) {
          notification.status = 'sent';
          sent++;
          console.log(`✅ Sent ${notification.type} notification to ${notification.data.email}`);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        notification.error = error instanceof Error ? error.message : 'Unknown error';
        
        // Retry logic
        if (notification.attempts < 3) {
          notification.nextAttempt = new Date(now.getTime() + Math.pow(2, notification.attempts) * 60 * 1000);
          console.log(`⏰ Retrying ${notification.type} notification in ${Math.pow(2, notification.attempts)} minutes`);
        } else {
          notification.status = 'failed';
          failed++;
          console.error(`❌ Failed to send ${notification.type} notification:`, error);
        }
      }

      this.scheduledNotifications.set(notification.id, notification);
    }

    return { processed, sent, failed };
  }

  // Get notification statistics
  getNotificationStats(): {
    scheduled: number;
    sent: number;
    failed: number;
    cancelled: number;
  } {
    const notifications = Array.from(this.scheduledNotifications.values());
    return {
      scheduled: notifications.filter(n => n.status === 'scheduled').length,
      sent: notifications.filter(n => n.status === 'sent').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      cancelled: notifications.filter(n => n.status === 'cancelled').length,
    };
  }

  // Get notifications for a user
  getUserNotifications(userId: string): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  }

  // Configure notification rules
  updateRule(ruleId: string, updates: Partial<NotificationRule>): boolean {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex >= 0) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
      return true;
    }
    return false;
  }

  // Get all rules
  getRules(): NotificationRule[] {
    return [...this.rules];
  }
}

// Global scheduler instance
export const notificationScheduler = new NotificationScheduler();

// Automatic processing interval
if (typeof window === 'undefined') {
  // Only run in server environment
  setInterval(async () => {
    try {
      const results = await notificationScheduler.processDueNotifications();
      if (results.processed > 0) {
        console.log(`📊 Notification batch processed: ${results.sent} sent, ${results.failed} failed`);
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  }, 60 * 1000); // Check every minute
}

// Weekly progress email scheduler
export function scheduleWeeklyEmails() {
  // This would typically be called by a cron job or scheduled task
  // For demonstration, we'll simulate scheduling weekly emails
  console.log('📅 Scheduling weekly progress emails...');
  
  // In a real app, you'd query your database for active users
  // and schedule weekly progress emails for each one
}
import { db } from '@/lib/db/drizzle';
import { 
  emailNotifications, 
  notificationPreferences, 
  EmailTemplateType, 
  NotificationStatus,
  NewEmailNotification,
  NewNotificationPreferences 
} from '@/lib/db/notifications-schema';
import { users, questionnaireResponses, reports } from '@/lib/db/schema';
import { emailService } from './email-service';
import { eq, and, lt, sql, desc } from 'drizzle-orm';

interface NotificationTriggerData {
  userId: number;
  userEmail: string;
  userName: string;
  [key: string]: any;
}

class NotificationService {
  
  // Initialize default notification preferences for new users
  async createDefaultNotificationPreferences(userId: number): Promise<void> {
    try {
      const defaultPreferences: NewNotificationPreferences = {
        userId,
        emailEnabled: true,
        welcomeEmails: true,
        progressUpdates: true,
        reportNotifications: true,
        reminderEmails: true,
        marketingEmails: false,
        reminderFrequency: 'weekly',
        progressUpdateFrequency: 'weekly',
        preferredLanguage: 'en',
        timezone: 'UTC',
      };

      await db.insert(notificationPreferences).values(defaultPreferences).onConflictDoNothing();
    } catch (error) {
      console.error('Failed to create notification preferences:', error);
    }
  }

  // Get user notification preferences
  async getUserNotificationPreferences(userId: number) {
    try {
      const preferences = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      return preferences[0] || null;
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return null;
    }
  }

  // Update user notification preferences
  async updateNotificationPreferences(userId: number, updates: Partial<NewNotificationPreferences>): Promise<boolean> {
    try {
      await db
        .update(notificationPreferences)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, userId));
      
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  // Queue an email notification
  async queueEmailNotification(notification: Omit<NewEmailNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> {
    try {
      const result = await db
        .insert(emailNotifications)
        .values({
          ...notification,
          status: 'pending',
          attemptCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: emailNotifications.id });

      return result[0]?.id || null;
    } catch (error) {
      console.error('Failed to queue email notification:', error);
      return null;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(data: NotificationTriggerData): Promise<boolean> {
    try {
      const preferences = await this.getUserNotificationPreferences(data.userId);
      
      if (!preferences?.welcomeEmails || !preferences?.emailEnabled) {
        console.log(`Welcome email skipped for user ${data.userId} due to preferences`);
        return true;
      }

      // Queue the email notification
      const notificationId = await this.queueEmailNotification({
        userId: data.userId,
        recipientEmail: data.userEmail,
        subject: 'Welcome to Verisona AI - Start Your College Journey',
        templateType: EmailTemplateType.WELCOME,
        templateData: { userName: data.userName },
      });

      if (!notificationId) {
        return false;
      }

      // Send the email
      const success = await emailService.sendWelcomeEmail(data.userEmail, data.userName);
      
      // Update notification status
      await this.updateNotificationStatus(notificationId, success ? 'sent' : 'failed');
      
      return success;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  // Send questionnaire reminder
  async sendQuestionnaireReminder(data: NotificationTriggerData & { 
    questionnaireName: string; 
    daysInactive: number; 
  }): Promise<boolean> {
    try {
      const preferences = await this.getUserNotificationPreferences(data.userId);
      
      if (!preferences?.reminderEmails || !preferences?.emailEnabled) {
        console.log(`Reminder email skipped for user ${data.userId} due to preferences`);
        return true;
      }

      const notificationId = await this.queueEmailNotification({
        userId: data.userId,
        recipientEmail: data.userEmail,
        subject: `Don't lose momentum - Complete your ${data.questionnaireName}`,
        templateType: EmailTemplateType.QUESTIONNAIRE_REMINDER,
        templateData: { 
          userName: data.userName,
          questionnaireName: data.questionnaireName,
          daysInactive: data.daysInactive,
        },
      });

      if (!notificationId) {
        return false;
      }

      const success = await emailService.sendQuestionnaireReminderEmail(
        data.userEmail,
        data.userName,
        data.questionnaireName,
        data.daysInactive
      );
      
      await this.updateNotificationStatus(notificationId, success ? 'sent' : 'failed');
      return success;
    } catch (error) {
      console.error('Failed to send questionnaire reminder:', error);
      return false;
    }
  }

  // Send report ready notification
  async sendReportReadyNotification(data: NotificationTriggerData & { 
    reportId: string; 
    reportType: string; 
  }): Promise<boolean> {
    try {
      const preferences = await this.getUserNotificationPreferences(data.userId);
      
      if (!preferences?.reportNotifications || !preferences?.emailEnabled) {
        console.log(`Report notification skipped for user ${data.userId} due to preferences`);
        return true;
      }

      const notificationId = await this.queueEmailNotification({
        userId: data.userId,
        recipientEmail: data.userEmail,
        subject: 'Your Verisona AI Report is Ready! 🎉',
        templateType: EmailTemplateType.REPORT_READY,
        templateData: { 
          userName: data.userName,
          reportId: data.reportId,
          reportType: data.reportType,
        },
      });

      if (!notificationId) {
        return false;
      }

      const success = await emailService.sendReportReadyEmail(
        data.userEmail,
        data.userName,
        data.reportId,
        data.reportType
      );
      
      await this.updateNotificationStatus(notificationId, success ? 'sent' : 'failed');
      return success;
    } catch (error) {
      console.error('Failed to send report ready notification:', error);
      return false;
    }
  }

  // Send progress update
  async sendProgressUpdate(data: NotificationTriggerData & { 
    completedQuestionnaires: number; 
    totalQuestionnaires: number; 
    nextSteps: string[]; 
  }): Promise<boolean> {
    try {
      const preferences = await this.getUserNotificationPreferences(data.userId);
      
      if (!preferences?.progressUpdates || !preferences?.emailEnabled) {
        console.log(`Progress update skipped for user ${data.userId} due to preferences`);
        return true;
      }

      const progressPercentage = Math.round((data.completedQuestionnaires / data.totalQuestionnaires) * 100);
      
      const notificationId = await this.queueEmailNotification({
        userId: data.userId,
        recipientEmail: data.userEmail,
        subject: `Your Verisona AI Progress Update - ${progressPercentage}% Complete`,
        templateType: EmailTemplateType.PROGRESS_UPDATE,
        templateData: { 
          userName: data.userName,
          completedQuestionnaires: data.completedQuestionnaires,
          totalQuestionnaires: data.totalQuestionnaires,
          nextSteps: data.nextSteps,
          progressPercentage,
        },
      });

      if (!notificationId) {
        return false;
      }

      const success = await emailService.sendProgressUpdateEmail(
        data.userEmail,
        data.userName,
        data.completedQuestionnaires,
        data.totalQuestionnaires,
        data.nextSteps
      );
      
      await this.updateNotificationStatus(notificationId, success ? 'sent' : 'failed');
      return success;
    } catch (error) {
      console.error('Failed to send progress update:', error);
      return false;
    }
  }

  // Update notification status
  private async updateNotificationStatus(notificationId: number, status: string): Promise<void> {
    try {
      const updates: any = { 
        status, 
        updatedAt: new Date(),
        attemptCount: sql`${emailNotifications.attemptCount} + 1`,
      };

      if (status === 'sent') {
        updates.sentAt = new Date();
      }

      await db
        .update(emailNotifications)
        .set(updates)
        .where(eq(emailNotifications.id, notificationId));
    } catch (error) {
      console.error('Failed to update notification status:', error);
    }
  }

  // Process pending notifications (for background job)
  async processPendingNotifications(limit = 50): Promise<void> {
    try {
      const pendingNotifications = await db
        .select()
        .from(emailNotifications)
        .where(
          and(
            eq(emailNotifications.status, 'pending'),
            lt(emailNotifications.attemptCount, emailNotifications.maxAttempts)
          )
        )
        .orderBy(emailNotifications.createdAt)
        .limit(limit);

      for (const notification of pendingNotifications) {
        try {
          let success = false;
          
          switch (notification.templateType) {
            case EmailTemplateType.WELCOME:
              const templateData = notification.templateData as any;
              success = await emailService.sendWelcomeEmail(
                notification.recipientEmail,
                templateData?.userName || 'Student'
              );
              break;
              
            case EmailTemplateType.QUESTIONNAIRE_REMINDER:
              const reminderData = notification.templateData as any;
              success = await emailService.sendQuestionnaireReminderEmail(
                notification.recipientEmail,
                reminderData?.userName || 'Student',
                reminderData?.questionnaireName || 'Questionnaire',
                reminderData?.daysInactive || 7
              );
              break;
              
            case EmailTemplateType.REPORT_READY:
              const reportData = notification.templateData as any;
              success = await emailService.sendReportReadyEmail(
                notification.recipientEmail,
                reportData?.userName || 'Student',
                reportData?.reportId || '',
                reportData?.reportType || 'Analysis Report'
              );
              break;
              
            case EmailTemplateType.PROGRESS_UPDATE:
              const progressData = notification.templateData as any;
              success = await emailService.sendProgressUpdateEmail(
                notification.recipientEmail,
                progressData?.userName || 'Student',
                progressData?.completedQuestionnaires || 0,
                progressData?.totalQuestionnaires || 1,
                progressData?.nextSteps || []
              );
              break;
              
            default:
              console.warn(`Unknown notification template type: ${notification.templateType}`);
              continue;
          }
          
          await this.updateNotificationStatus(notification.id, success ? 'sent' : 'failed');
          
        } catch (error) {
          console.error(`Failed to process notification ${notification.id}:`, error);
          await this.updateNotificationStatus(notification.id, 'failed');
        }
      }
    } catch (error) {
      console.error('Failed to process pending notifications:', error);
    }
  }

  // Get notification history for a user
  async getUserNotificationHistory(userId: number, limit = 20) {
    try {
      return await db
        .select()
        .from(emailNotifications)
        .where(eq(emailNotifications.userId, userId))
        .orderBy(desc(emailNotifications.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  // Check if user needs reminders
  async findUsersNeedingReminders(): Promise<Array<{
    userId: number;
    userEmail: string;
    userName: string;
    questionnaireName: string;
    daysInactive: number;
  }>> {
    try {
      // Find users with incomplete questionnaires who haven't been active
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // This is a simplified query - in a real implementation, you'd have more complex logic
      const inactiveUsers = await db
        .select({
          userId: users.id,
          userEmail: users.email,
          userName: users.name,
          lastActivity: questionnaireResponses.lastActivityAt,
        })
        .from(users)
        .leftJoin(questionnaireResponses, eq(users.id, questionnaireResponses.userId))
        .where(
          and(
            eq(questionnaireResponses.status, 'in_progress'),
            lt(questionnaireResponses.lastActivityAt, sevenDaysAgo)
          )
        );

      return inactiveUsers.map(user => ({
        userId: user.userId,
        userEmail: user.userEmail,
        userName: user.userName || 'Student',
        questionnaireName: 'Personality Assessment', // Simplified - would normally lookup the specific questionnaire
        daysInactive: Math.floor((Date.now() - new Date(user.lastActivity!).getTime()) / (1000 * 60 * 60 * 24)),
      }));
    } catch (error) {
      console.error('Failed to find users needing reminders:', error);
      return [];
    }
  }
}

export const notificationService = new NotificationService();
export default NotificationService;
import { notificationService } from '@/lib/services/notification-service';
import { db } from '@/lib/db/drizzle';
import { users, questionnaireResponses, reports } from '@/lib/db/schema';
import { eq, and, lt, sql } from 'drizzle-orm';

interface EmailJob {
  type: 'welcome' | 'reminder' | 'report_ready' | 'progress_update';
  data: any;
  userId: number;
  priority: 'high' | 'medium' | 'low';
  scheduledFor?: Date;
}

class EmailProcessor {
  private jobQueue: EmailJob[] = [];
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start processing jobs every 30 seconds
    this.startProcessing();
  }

  // Add a job to the queue
  addJob(job: EmailJob) {
    this.jobQueue.push(job);
    this.sortQueue();
    console.log(`Email job queued: ${job.type} for user ${job.userId}`);
  }

  // Sort queue by priority and scheduled time
  private sortQueue() {
    this.jobQueue.sort((a, b) => {
      // First by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by scheduled time
      const aTime = a.scheduledFor?.getTime() || Date.now();
      const bTime = b.scheduledFor?.getTime() || Date.now();
      return aTime - bTime;
    });
  }

  // Start background processing
  startProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    this.processingInterval = setInterval(() => {
      this.processJobs();
    }, 30000); // Process every 30 seconds
    
    console.log('Email processor started');
  }

  // Stop background processing
  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('Email processor stopped');
  }

  // Process queued jobs
  private async processJobs() {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`Processing ${this.jobQueue.length} email jobs...`);

    try {
      // Process pending notifications from database
      await notificationService.processPendingNotifications(10);

      // Process jobs from memory queue
      const currentTime = new Date();
      const jobsToProcess = this.jobQueue.filter(job => 
        !job.scheduledFor || job.scheduledFor <= currentTime
      );

      for (const job of jobsToProcess.slice(0, 5)) { // Process max 5 jobs at once
        try {
          await this.processJob(job);
          
          // Remove processed job from queue
          const index = this.jobQueue.indexOf(job);
          if (index > -1) {
            this.jobQueue.splice(index, 1);
          }
        } catch (error) {
          console.error(`Failed to process email job:`, error);
          
          // Move failed job to end of queue with lower priority
          job.priority = 'low';
          job.scheduledFor = new Date(Date.now() + 300000); // Retry in 5 minutes
        }
      }
    } catch (error) {
      console.error('Error processing email jobs:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process a single job
  private async processJob(job: EmailJob): Promise<void> {
    console.log(`Processing email job: ${job.type} for user ${job.userId}`);

    // Get user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, job.userId))
      .limit(1);

    if (!user.length) {
      throw new Error(`User ${job.userId} not found`);
    }

    const userData = {
      userId: user[0].id,
      userEmail: user[0].email,
      userName: user[0].name || 'Student',
      ...job.data,
    };

    switch (job.type) {
      case 'welcome':
        await notificationService.sendWelcomeEmail(userData);
        break;

      case 'reminder':
        await notificationService.sendQuestionnaireReminder(userData);
        break;

      case 'report_ready':
        await notificationService.sendReportReadyNotification(userData);
        break;

      case 'progress_update':
        await notificationService.sendProgressUpdate(userData);
        break;

      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  // Schedule welcome email for new user
  async scheduleWelcomeEmail(userId: number, delay = 0) {
    this.addJob({
      type: 'welcome',
      data: {},
      userId,
      priority: 'high',
      scheduledFor: delay > 0 ? new Date(Date.now() + delay) : undefined,
    });
  }

  // Schedule reminder emails for inactive users
  async scheduleReminderEmails() {
    try {
      const usersNeedingReminders = await notificationService.findUsersNeedingReminders();
      
      for (const user of usersNeedingReminders) {
        this.addJob({
          type: 'reminder',
          data: {
            questionnaireName: user.questionnaireName,
            daysInactive: user.daysInactive,
          },
          userId: user.userId,
          priority: 'medium',
        });
      }

      console.log(`Scheduled ${usersNeedingReminders.length} reminder emails`);
    } catch (error) {
      console.error('Failed to schedule reminder emails:', error);
    }
  }

  // Schedule report ready notifications
  async scheduleReportReadyNotification(userId: number, reportId: string, reportType: string) {
    this.addJob({
      type: 'report_ready',
      data: {
        reportId,
        reportType,
      },
      userId,
      priority: 'high',
    });
  }

  // Schedule progress update emails
  async scheduleProgressUpdate(userId: number, progressData: any) {
    this.addJob({
      type: 'progress_update',
      data: progressData,
      userId,
      priority: 'medium',
    });
  }

  // Bulk schedule progress updates for all active users
  async scheduleBulkProgressUpdates() {
    try {
      // Find users with recent questionnaire activity
      const activeUsers = await db
        .select({
          userId: users.id,
          userEmail: users.email,
          userName: users.name,
          completedResponses: sql<number>`COUNT(DISTINCT CASE WHEN ${questionnaireResponses.status} = 'completed' THEN ${questionnaireResponses.id} END)`,
          totalResponses: sql<number>`COUNT(DISTINCT ${questionnaireResponses.id})`,
        })
        .from(users)
        .leftJoin(questionnaireResponses, eq(users.id, questionnaireResponses.userId))
        .groupBy(users.id)
        .having(sql`COUNT(DISTINCT ${questionnaireResponses.id}) > 0`);

      for (const user of activeUsers) {
        // Calculate progress and next steps
        const completedQuestionnaires = user.completedResponses || 0;
        const totalQuestionnaires = Math.max(user.totalResponses || 1, 4); // Assume at least 4 questionnaires
        
        if (completedQuestionnaires > 0) {
          const nextSteps = [];
          if (completedQuestionnaires < totalQuestionnaires) {
            nextSteps.push('Complete your remaining questionnaires');
          }
          if (completedQuestionnaires >= 2) {
            nextSteps.push('Review your AI-generated insights');
          }
          nextSteps.push('Explore your college recommendations');

          this.addJob({
            type: 'progress_update',
            data: {
              completedQuestionnaires,
              totalQuestionnaires,
              nextSteps,
            },
            userId: user.userId,
            priority: 'low',
          });
        }
      }

      console.log(`Scheduled progress updates for ${activeUsers.length} users`);
    } catch (error) {
      console.error('Failed to schedule bulk progress updates:', error);
    }
  }

  // Get queue status
  getQueueStatus() {
    return {
      totalJobs: this.jobQueue.length,
      isProcessing: this.isProcessing,
      nextJob: this.jobQueue[0] || null,
      jobsByPriority: {
        high: this.jobQueue.filter(j => j.priority === 'high').length,
        medium: this.jobQueue.filter(j => j.priority === 'medium').length,
        low: this.jobQueue.filter(j => j.priority === 'low').length,
      },
    };
  }
}

// Create singleton instance
export const emailProcessor = new EmailProcessor();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down email processor...');
  emailProcessor.stopProcessing();
});

process.on('SIGINT', () => {
  console.log('Shutting down email processor...');
  emailProcessor.stopProcessing();
});

export default EmailProcessor;
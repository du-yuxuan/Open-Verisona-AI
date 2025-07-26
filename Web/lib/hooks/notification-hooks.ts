import { notificationService } from '@/lib/services/notification-service';
import { emailProcessor } from '@/lib/jobs/email-processor';

// Hook to trigger welcome email after user registration
export async function onUserRegistered(userId: number) {
  try {
    console.log(`User registered: ${userId}`);
    
    // Create default notification preferences
    await notificationService.createDefaultNotificationPreferences(userId);
    
    // Schedule welcome email with a small delay (30 seconds)
    await emailProcessor.scheduleWelcomeEmail(userId, 30000);
    
    console.log(`Welcome email scheduled for user ${userId}`);
  } catch (error) {
    console.error('Failed to handle user registration notification:', error);
  }
}

// Hook to trigger notifications when questionnaire is completed
export async function onQuestionnaireCompleted(userId: number, questionnaireId: number, sessionId: string) {
  try {
    console.log(`Questionnaire completed: ${questionnaireId} by user ${userId}`);
    
    // The report generation will trigger the report ready notification
    // This is handled separately in the report generation process
    
  } catch (error) {
    console.error('Failed to handle questionnaire completion notification:', error);
  }
}

// Hook to trigger notification when report is ready
export async function onReportGenerated(userId: number, reportId: string, reportType: string) {
  try {  
    console.log(`Report generated: ${reportId} for user ${userId}`);
    
    // Schedule report ready notification immediately
    await emailProcessor.scheduleReportReadyNotification(userId, reportId, reportType);
    
    console.log(`Report ready notification scheduled for user ${userId}`);
  } catch (error) {
    console.error('Failed to handle report generation notification:', error);
  }
}

// Hook to trigger reminder emails for inactive users
export async function checkInactiveUsers() {
  try {
    console.log('Checking for inactive users...');
    
    // Schedule reminder emails for users who haven't been active
    await emailProcessor.scheduleReminderEmails();
    
  } catch (error) {
    console.error('Failed to check inactive users:', error);
  }
}

// Hook to send progress updates
export async function sendProgressUpdates() {
  try {
    console.log('Sending progress updates...');
    
    // Schedule progress updates for all active users
    await emailProcessor.scheduleBulkProgressUpdates();
    
  } catch (error) {
    console.error('Failed to send progress updates:', error);
  }
}

// Hook to trigger notification on profile completion
export async function onProfileCompleted(userId: number, completionPercentage: number) {
  try {
    console.log(`Profile completed: ${completionPercentage}% for user ${userId}`);
    
    if (completionPercentage >= 80) {
      // Schedule a congratulatory progress update
      await emailProcessor.scheduleProgressUpdate(userId, {
        completedQuestionnaires: 1,
        totalQuestionnaires: 4,
        nextSteps: [
          'Start your personality assessment',
          'Explore your goals and aspirations',
          'Share your background and experiences',
        ],
      });
    }
    
  } catch (error) {
    console.error('Failed to handle profile completion notification:', error);
  }
}

// Hook for daily/weekly automated tasks
export async function runScheduledNotificationTasks() {
  try {
    console.log('Running scheduled notification tasks...');
    
    // Check for users needing reminders
    await checkInactiveUsers();
    
    // Send weekly progress updates (run weekly)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (dayOfWeek === 1) { // Monday
      await sendProgressUpdates();
    }
    
    console.log('Scheduled notification tasks completed');
  } catch (error) {
    console.error('Failed to run scheduled notification tasks:', error);
  }
}

// Export all hooks for easy importing
export const notificationHooks = {
  onUserRegistered,
  onQuestionnaireCompleted,
  onReportGenerated,
  onProfileCompleted,
  checkInactiveUsers,
  sendProgressUpdates,
  runScheduledNotificationTasks,
};
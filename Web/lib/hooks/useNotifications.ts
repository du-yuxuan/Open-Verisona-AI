'use client';

import { useState, useEffect } from 'react';
import { notificationScheduler } from '@/lib/services/notification-scheduler';

export interface NotificationPreferences {
  emailNotifications: boolean;
  progressUpdates: boolean;
  reminderEmails: boolean;
  motivationalMessages: boolean;
  weeklyDigest: boolean;
  reportNotifications: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

export interface UserNotification {
  id: string;
  type: 'welcome' | 'reminder' | 'progress' | 'achievement' | 'system';
  title: string;
  message: string;
  status: 'unread' | 'read';
  timestamp: Date;
  actionUrl?: string;
  actionText?: string;
}

const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  progressUpdates: true,
  reminderEmails: true,
  motivationalMessages: true,
  weeklyDigest: true,
  reportNotifications: true,
  frequency: 'immediate'
};

// Simulated in-app notifications
const sampleNotifications: UserNotification[] = [
  {
    id: 'notif_1',
    type: 'welcome',
    title: 'Welcome to Verisona AI!',
    message: 'Start your college application journey by completing your profile.',
    status: 'unread',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    actionUrl: '/dashboard/profile',
    actionText: 'Complete Profile'
  },
  {
    id: 'notif_2',
    type: 'reminder',
    title: 'Continue Your Questionnaire',
    message: 'You\'re 60% through discovering your authentic persona!',
    status: 'unread',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actionUrl: '/questionnaires',
    actionText: 'Continue'
  },
  {
    id: 'notif_3',
    type: 'achievement',
    title: 'Milestone Reached! 🎉',
    message: 'You\'ve completed your personality assessment. Great work!',
    status: 'read',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    actionUrl: '/dashboard/progress',
    actionText: 'View Progress'
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<UserNotification[]>(sampleNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get unread count
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, status: 'read' as const } : n
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, status: 'read' as const }))
    );
  };

  // Delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  // Update preferences
  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPreferences(prev => ({ ...prev, ...newPreferences }));
      console.log('✅ Notification preferences updated:', newPreferences);
    } catch (error) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (notification: Omit<UserNotification, 'id' | 'timestamp'>) => {
    const newNotification: UserNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Trigger notification based on user action
  const triggerNotification = async (
    eventType: 'questionnaire_started' | 'questionnaire_completed' | 'profile_updated' | 'report_generated',
    data?: Record<string, any>
  ) => {
    try {
      // Sample user data (in real app, this would come from context/auth)
      const userData = {
        email: 'student@example.com',
        firstName: 'Student',
        registrationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        questionnaireCompletionPercentage: 75,
        lastActivityDate: new Date()
      };

      // Handle the event through the notification scheduler
      await notificationScheduler.handleUserEvent(
        eventType,
        'current-user-id', 
        userData
      );

      // Add in-app notification based on event
      switch (eventType) {
        case 'questionnaire_started':
          addNotification({
            type: 'reminder',
            title: 'Questionnaire Started',
            message: 'Great! Continue whenever you\'re ready. Your progress is automatically saved.',
            status: 'unread'
          });
          break;
          
        case 'questionnaire_completed':
          addNotification({
            type: 'achievement',
            title: 'Questionnaire Completed! 🎉',
            message: 'Congratulations! Your AI report is being generated and will be ready soon.',
            status: 'unread',
            actionUrl: '/dashboard',
            actionText: 'View Dashboard'
          });
          break;
          
        case 'report_generated':
          addNotification({
            type: 'system',
            title: 'Your AI Report is Ready! 📊',
            message: 'Your personalized college application insights are now available.',
            status: 'unread',
            actionUrl: '/reports',
            actionText: 'View Report'
          });
          break;
          
        case 'profile_updated':
          addNotification({
            type: 'system',
            title: 'Profile Updated',
            message: 'Your profile changes have been saved successfully.',
            status: 'unread'
          });
          break;
      }

      console.log(`🔔 Triggered notification for event: ${eventType}`);
    } catch (error) {
      console.error('Error triggering notification:', error);
    }
  };

  // Send test email notification
  const sendTestNotification = async (type: string, email?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          recipients: [{
            email: email || 'test@example.com',
            firstName: 'Test User'
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification');
      }

      console.log('✅ Test notification sent:', data);
      
      // Add in-app notification to confirm
      addNotification({
        type: 'system',
        title: 'Test Email Sent ✉️',
        message: `A test ${type} email was sent successfully.`,
        status: 'unread'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
      console.error('Error sending test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh notifications (in real app, this might use websockets or polling)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving new notifications occasionally
      if (Math.random() > 0.95) { // 5% chance every 30 seconds
        const motivationalMessages = [
          'You\'re making great progress! Keep it up! 💪',
          'Remember: Your unique story matters. Stay authentic! ✨',
          'Every step forward is a step closer to your dream college! 🎓'
        ];
        
        addNotification({
          type: 'system',
          title: 'Daily Motivation',
          message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
          status: 'unread'
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    preferences,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    addNotification,
    triggerNotification,
    sendTestNotification
  };
}
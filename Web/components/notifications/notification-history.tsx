'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { 
  Mail, 
  MailOpen, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Bell,
  BarChart3,
  MessageSquare,
  UserPlus
} from 'lucide-react';

interface EmailNotification {
  id: number;
  recipientEmail: string;
  subject: string;
  templateType: string;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  failureReason: string | null;
  attemptCount: number;
  createdAt: string;
}

export function NotificationHistory() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotificationHistory();
  }, []);

  const fetchNotificationHistory = async () => {
    try {
      setError(null);
      const response = await fetch('/api/notifications/history?limit=20');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification history');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      setError('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'pending':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'failed':
      case 'bounced':
        return 'text-red-600 border-red-200 bg-red-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return Mail;
      case 'delivered':
        return MailOpen;
      case 'pending':
        return Clock;
      case 'failed':
      case 'bounced':
        return AlertCircle;
      default:
        return CheckCircle;
    }
  };

  const getTemplateIcon = (templateType: string) => {
    switch (templateType) {
      case 'welcome':
        return UserPlus;
      case 'questionnaire_reminder':
        return Bell;
      case 'report_ready':
        return BarChart3;
      case 'progress_update':
        return CheckCircle;
      default:
        return MessageSquare;
    }
  };

  const getTemplateLabel = (templateType: string) => {
    switch (templateType) {
      case 'welcome':
        return 'Welcome Email';
      case 'questionnaire_reminder':
        return 'Questionnaire Reminder';
      case 'report_ready':
        return 'Report Ready';
      case 'progress_update':
        return 'Progress Update';
      case 'password_reset':
        return 'Password Reset';
      case 'email_verification':
        return 'Email Verification';
      default:
        return templateType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded animate-pulse">
            <div className="w-10 h-10 bg-gray-300 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="w-16 h-6 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading History</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchNotificationHistory} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Notifications Yet</h3>
        <p className="text-muted-foreground">
          Your email notification history will appear here once you start receiving emails.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const StatusIcon = getStatusIcon(notification.status);
        const TemplateIcon = getTemplateIcon(notification.templateType);
        
        return (
          <div 
            key={notification.id} 
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            {/* Template Type Icon */}
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TemplateIcon className="h-5 w-5 text-primary" />
            </div>

            {/* Notification Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-foreground truncate">
                  {notification.subject}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {getTemplateLabel(notification.templateType)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Sent {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                {notification.attemptCount > 1 && (
                  <span className="text-orange-600">
                    {notification.attemptCount} attempts
                  </span>
                )}
                {notification.failureReason && (
                  <span className="text-red-600 truncate max-w-xs">
                    {notification.failureReason}
                  </span>
                )}
              </div>

              {notification.sentAt && notification.status === 'sent' && (
                <div className="text-xs text-green-600 mt-1">
                  Delivered {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge className={`flex items-center gap-1 ${getStatusColor(notification.status)}`}>
                <StatusIcon className="h-3 w-3" />
                {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
              </Badge>
            </div>
          </div>
        );
      })}

      {/* Load More Button */}
      {notifications.length >= 20 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => fetchNotificationHistory()}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
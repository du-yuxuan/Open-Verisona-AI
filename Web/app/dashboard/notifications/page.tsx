'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  Award,
  Clock,
  Volume2,
  VolumeX,
  Smartphone,
  Settings,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';

export default function NotificationsPage() {
  const {
    notifications,
    preferences,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    sendTestNotification
  } = useNotifications();

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    updatePreferences({ [key]: value });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <MessageSquare className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'progress':
        return <TrendingUp className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Manage your communication preferences and view your notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-600">
              {unreadCount} unread
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark All Read
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Tabs */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
              <CardDescription>
                Your latest updates and messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll notify you about important updates and progress
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-colors
                        ${notification.status === 'unread' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-muted/50'
                        }
                      `}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`
                            p-2 rounded-lg flex-shrink-0
                            ${notification.status === 'unread'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-muted text-muted-foreground'
                            }
                          `}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm">{notification.title}</h3>
                              {notification.status === 'unread' && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.actionUrl && notification.actionText && (
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  {notification.actionText}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Configure when and how often you receive emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates and reminders via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Progress Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly summaries of your progress and achievements
                    </p>
                  </div>
                  <Switch
                    checked={preferences.progressUpdates}
                    onCheckedChange={(checked) => handlePreferenceChange('progressUpdates', checked)}
                    disabled={!preferences.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reminder Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Gentle reminders to continue your questionnaire
                    </p>
                  </div>
                  <Switch
                    checked={preferences.reminderEmails}
                    onCheckedChange={(checked) => handlePreferenceChange('reminderEmails', checked)}
                    disabled={!preferences.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Motivational Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Inspirational content to keep you motivated
                    </p>
                  </div>
                  <Switch
                    checked={preferences.motivationalMessages}
                    onCheckedChange={(checked) => handlePreferenceChange('motivationalMessages', checked)}
                    disabled={!preferences.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Report Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerts when your AI reports are ready
                    </p>
                  </div>
                  <Switch
                    checked={preferences.reportNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('reportNotifications', checked)}
                    disabled={!preferences.emailNotifications}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Email Frequency</Label>
                  <Select
                    value={preferences.frequency}
                    onValueChange={(value) => handlePreferenceChange('frequency', value)}
                    disabled={!preferences.emailNotifications}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Instant notifications in your browser or app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications even when not on this page
                    </p>
                  </div>
                  <Switch disabled />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Play a sound when receiving notifications
                    </p>
                  </div>
                  <Switch disabled />
                </div>

                {/* Test Notifications */}
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Test Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => sendTestNotification('welcome')}
                      disabled={isLoading}
                    >
                      Test Welcome Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => sendTestNotification('questionnaire_reminder')}
                      disabled={isLoading}
                    >
                      Test Reminder Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => sendTestNotification('motivation')}
                      disabled={isLoading}
                    >
                      Test Motivation Email
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Communication Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Communication Schedule
              </CardTitle>
              <CardDescription>
                Your personalized notification timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Welcome Series</p>
                      <p className="text-sm text-muted-foreground">Immediate after registration</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Questionnaire Reminders</p>
                      <p className="text-sm text-muted-foreground">Daily until completion</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Weekly Progress</p>
                      <p className="text-sm text-muted-foreground">Every Friday at 6 PM</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600">
                    Scheduled
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Achievement Celebrations</p>
                      <p className="text-sm text-muted-foreground">When milestones are reached</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-600">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Preferences */}
          <div className="flex justify-end">
            <Button onClick={() => updatePreferences({})} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
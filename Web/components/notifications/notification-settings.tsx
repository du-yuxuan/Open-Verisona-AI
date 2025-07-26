'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Mail, Bell, MessageSquare, BarChart3, Clock, Globe, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NotificationPreferences {
  id?: number;
  userId?: number;
  emailEnabled: boolean;
  welcomeEmails: boolean;
  progressUpdates: boolean;
  reportNotifications: boolean;
  reminderEmails: boolean;
  marketingEmails: boolean;
  reminderFrequency: string;
  progressUpdateFrequency: string;
  preferredLanguage: string;
  timezone: string;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else {
        throw new Error('Failed to fetch preferences');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        const updatedPreferences = await response.json();
        setPreferences(updatedPreferences);
        toast({
          title: 'Success',
          description: 'Notification preferences updated successfully',
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded animate-pulse">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load notification preferences</p>
        <Button onClick={fetchPreferences} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const notificationTypes = [
    {
      key: 'emailEnabled' as keyof NotificationPreferences,
      icon: Mail,
      title: 'Email Notifications',
      description: 'Master toggle for all email notifications',
      type: 'boolean',
    },
    {
      key: 'welcomeEmails' as keyof NotificationPreferences,
      icon: Bell,
      title: 'Welcome Emails',
      description: 'Receive welcome messages when you join or complete major milestones',
      type: 'boolean',
      disabled: !preferences.emailEnabled,
    },
    {
      key: 'progressUpdates' as keyof NotificationPreferences,
      icon: BarChart3,
      title: 'Progress Updates',
      description: 'Get regular updates on your questionnaire completion and insights',
      type: 'boolean',
      disabled: !preferences.emailEnabled,
    },
    {
      key: 'reportNotifications' as keyof NotificationPreferences,
      icon: CheckCircle,
      title: 'Report Notifications',
      description: 'Be notified when your AI analysis reports are ready',
      type: 'boolean',
      disabled: !preferences.emailEnabled,
    },
    {
      key: 'reminderEmails' as keyof NotificationPreferences,
      icon: Clock,
      title: 'Reminder Emails',
      description: 'Gentle reminders to complete questionnaires and take next steps',
      type: 'boolean',
      disabled: !preferences.emailEnabled,
    },
    {
      key: 'marketingEmails' as keyof NotificationPreferences,
      icon: MessageSquare,
      title: 'Marketing & Tips',
      description: 'Receive helpful tips, success stories, and platform updates',
      type: 'boolean',
      disabled: !preferences.emailEnabled,
    },
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'never', label: 'Never' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
  ];

  return (
    <div className="space-y-6">
      {/* Main Notification Settings */}
      <div className="space-y-4">
        {notificationTypes.map((setting) => {
          const Icon = setting.icon;
          const isEnabled = preferences[setting.key] as boolean;
          
          return (
            <div 
              key={setting.key}
              className={`flex items-center justify-between p-4 border rounded-lg transition-opacity ${
                setting.disabled ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon className={`h-5 w-5 mt-0.5 ${
                  isEnabled && !setting.disabled ? 'text-green-600' : 'text-muted-foreground'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label 
                      htmlFor={setting.key}
                      className="font-medium text-foreground"
                    >
                      {setting.title}
                    </Label>
                    {isEnabled && !setting.disabled && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </div>
              <Switch
                id={setting.key}
                checked={isEnabled}
                onCheckedChange={(checked) => updatePreference(setting.key, checked)}
                disabled={setting.disabled}
              />
            </div>
          );
        })}
      </div>

      {/* Frequency Settings */}
      {preferences.emailEnabled && (
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium text-foreground">Frequency Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reminderFrequency" className="text-sm font-medium">
                Reminder Frequency
              </Label>
              <Select
                value={preferences.reminderFrequency}
                onValueChange={(value) => updatePreference('reminderFrequency', value)}
                disabled={!preferences.reminderEmails}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progressFrequency" className="text-sm font-medium">
                Progress Update Frequency
              </Label>
              <Select
                value={preferences.progressUpdateFrequency}
                onValueChange={(value) => updatePreference('progressUpdateFrequency', value)}
                disabled={!preferences.progressUpdates}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Language & Locale Settings */}
      {preferences.emailEnabled && (
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">
                Preferred Language
              </Label>
              <Select
                value={preferences.preferredLanguage}
                onValueChange={(value) => updatePreference('preferredLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-medium">
                Timezone
              </Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => updatePreference('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button 
          onClick={savePreferences}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
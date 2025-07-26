'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Database,
  Server,
  Zap,
  Shield,
  Globe,
  Download,
  RefreshCw,
  Settings,
  Bell,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Accessibility,
  Heart,
  Star,
  Target,
  Award,
  HelpCircle,
} from 'lucide-react';

interface AdminDashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    totalQuestionnaires: number;
    completedQuestionnaires: number;
    totalReports: number;
    systemHealth: number;
    storageUsed: number;
  };
  userStats: {
    totalUsers: number;
    verifiedUsers: number;
    activeToday: number;
    newThisWeek: number;
    userGrowth: number;
    retentionRate: number;
    avgSessionTime: number;
    topUserSegments: Array<{
      segment: string;
      count: number;
      percentage: number;
    }>;
  };
  questionnaireStats: {
    totalQuestionnaires: number;
    publishedQuestionnaires: number;
    draftQuestionnaires: number;
    completionRate: number;
    avgCompletionTime: number;
    topPerformingQuestionnaires: Array<{
      id: number;
      title: string;
      completions: number;
      rating: number;
    }>;
  };
  systemMetrics: {
    serverUptime: number;
    responseTime: number;
    errorRate: number;
    databaseHealth: number;
    storageUsage: number;
    bandwidthUsage: number;
    activeConnections: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'user_registered' | 'questionnaire_completed' | 'report_generated' | 'system_alert';
    description: string;
    timestamp: string;
    severity?: 'low' | 'medium' | 'high';
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

interface EnhancedAdminDashboardProps {
  className?: string;
}

export function EnhancedAdminDashboard({ className }: EnhancedAdminDashboardProps) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockData: AdminDashboardData = {
        overview: {
          totalUsers: 2456,
          activeUsers: 1834,
          newUsersToday: 23,
          totalQuestionnaires: 12,
          completedQuestionnaires: 1456,
          totalReports: 987,
          systemHealth: 98.5,
          storageUsed: 72.3,
        },
        userStats: {
          totalUsers: 2456,
          verifiedUsers: 2198,
          activeToday: 456,
          newThisWeek: 89,
          userGrowth: 12.5,
          retentionRate: 78.9,
          avgSessionTime: 24.5,
          topUserSegments: [
            { segment: 'High School Students', count: 1234, percentage: 50.2 },
            { segment: 'College Students', count: 789, percentage: 32.1 },
            { segment: 'Counselors', count: 234, percentage: 9.5 },
            { segment: 'Parents', count: 199, percentage: 8.2 },
          ],
        },
        questionnaireStats: {
          totalQuestionnaires: 12,
          publishedQuestionnaires: 8,
          draftQuestionnaires: 4,
          completionRate: 85.7,
          avgCompletionTime: 18.5,
          topPerformingQuestionnaires: [
            { id: 1, title: 'Personal Values Assessment', completions: 1234, rating: 4.8 },
            { id: 2, title: 'Academic Goals Survey', completions: 987, rating: 4.6 },
            { id: 3, title: 'Career Interest Inventory', completions: 756, rating: 4.7 },
          ],
        },
        systemMetrics: {
          serverUptime: 99.9,
          responseTime: 142,
          errorRate: 0.05,
          databaseHealth: 98.2,
          storageUsage: 72.3,
          bandwidthUsage: 45.7,
          activeConnections: 234,
        },
        recentActivity: [
          {
            id: '1',
            type: 'user_registered',
            description: 'Sarah Johnson registered and completed onboarding',
            timestamp: '2024-01-21T10:30:00Z',
          },
          {
            id: '2',
            type: 'questionnaire_completed',
            description: 'Personal Values Assessment completed by 15 users',
            timestamp: '2024-01-21T09:45:00Z',
          },
          {
            id: '3',
            type: 'report_generated',
            description: 'Monthly analytics report generated',
            timestamp: '2024-01-21T08:15:00Z',
          },
          {
            id: '4',
            type: 'system_alert',
            description: 'Database cleanup completed successfully',
            timestamp: '2024-01-21T07:30:00Z',
            severity: 'low',
          },
        ],
        alerts: [
          {
            id: '1',
            type: 'warning',
            title: 'Storage Usage High',
            description: 'Storage usage is at 72% capacity. Consider upgrading or cleaning up.',
            timestamp: '2024-01-21T06:00:00Z',
            resolved: false,
          },
          {
            id: '2',
            type: 'info',
            title: 'Scheduled Maintenance',
            description: 'Database maintenance scheduled for tonight at 2 AM UTC.',
            timestamp: '2024-01-20T18:00:00Z',
            resolved: false,
          },
        ],
      };

      setData(mockData);
    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'questionnaire_completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'report_generated':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'system_alert':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive platform management and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* System Health Banner */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">System Status: Healthy</p>
                <p className="text-sm text-green-600">
                  All systems operational • {data.systemMetrics.serverUptime}% uptime
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {data.systemMetrics.responseTime}ms avg response
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{data.overview.newUsersToday} today
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}% of total
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Questionnaires</p>
                <p className="text-2xl font-bold">{data.overview.totalQuestionnaires}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.overview.completedQuestionnaires} completed
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-bold">{data.overview.totalReports}</p>
                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3" />
                  High quality
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest platform events and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Metrics
            </CardTitle>
            <CardDescription>
              Performance and health indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Server Uptime</span>
                  <span className="font-medium">{data.systemMetrics.serverUptime}%</span>
                </div>
                <Progress value={data.systemMetrics.serverUptime} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Database Health</span>
                  <span className="font-medium">{data.systemMetrics.databaseHealth}%</span>
                </div>
                <Progress value={data.systemMetrics.databaseHealth} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage Usage</span>
                  <span className="font-medium">{data.systemMetrics.storageUsage}%</span>
                </div>
                <Progress value={data.systemMetrics.storageUsage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {data.systemMetrics.responseTime}ms
                  </p>
                  <p className="text-xs text-muted-foreground">Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {data.systemMetrics.activeConnections}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Connections</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Segments Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Segments
          </CardTitle>
          <CardDescription>
            Distribution of users across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {data.userStats.topUserSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{segment.segment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {segment.count.toLocaleString()}
                    </span>
                    <Badge variant="secondary">{segment.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.userStats.topUserSegments}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Important notifications and system messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.map((alert) => (
                <Alert key={alert.id} className={`${
                  alert.type === 'error' ? 'border-red-200 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <Button size="sm" variant="outline">
                        Resolve
                      </Button>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
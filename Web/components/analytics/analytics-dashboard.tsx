'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  AreaChart
} from 'recharts';
import { 
  Users, 
  Activity, 
  Clock, 
  Smartphone, 
  Monitor, 
  Eye,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

interface AnalyticsData {
  timeRange: string;
  dateRange: {
    start: string;
    end: string;
  };
  overview: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    totalSessions: number;
    avgSessionDuration: number;
    mobileUsage: number;
    accessibilityUsage: number;
  };
  pages: Array<{
    path: string;
    views: number;
    avgTimeOnPage: number;
    avgLoadTime: number;
  }>;
  events: Array<{
    eventType: string;
    eventAction: string;
    count: number;
    avgValue: number;
  }>;
  questionnaires: Array<{
    questionnaireId: number;
    questionnaireName: string;
    starts: number;
    completions: number;
    avgCompletionRate: number;
    avgDuration: number;
    avgEngagement: number;
    abandonmentRate: number;
  }>;
  features: Array<{
    featureName: string;
    category: string;
    totalUsage: number;
    uniqueUsers: number;
    successRate: number;
    avgSatisfaction: number;
  }>;
  performance: {
    avgLcp: number;
    avgFid: number;
    avgCls: number;
    avgFcp: number;
    avgTtfb: number;
    performanceScore: number;
  };
  trends: Array<{
    date: string;
    sessions: number;
    uniqueUsers: number;
    avgDuration: number;
    mobilePercentage: number;
  }>;
  demographics: {
    browsers: Array<{ browser: string; count: number; percentage: number; }>;
    operatingSystems: Array<{ os: string; count: number; percentage: number; }>;
    devices: Array<{ device: string; count: number; }>;
  };
  accessibility: {
    totalAccessibilityUsers: number;
    textToSpeechUsers: number;
    highContrastUsers: number;
    accessibilityPercentage: number;
  };
}

interface AnalyticsDashboardProps {
  className?: string;
}

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#f97316'];

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/mock?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to load analytics data');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getPerformanceGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600' };
    if (score >= 80) return { grade: 'B', color: 'text-green-500' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-500' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-500' };
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadAnalyticsData}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No analytics data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalUsers)}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                +{analyticsData.overview.newUsers} new
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalSessions)}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Avg: {formatDuration(analyticsData.overview.avgSessionDuration)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mobile Users</p>
                <p className="text-2xl font-bold">{analyticsData.overview.mobileUsage}%</p>
              </div>
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <Progress value={analyticsData.overview.mobileUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accessibility</p>
                <p className="text-2xl font-bold">{analyticsData.overview.accessibilityUsage}%</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <Progress value={analyticsData.overview.accessibilityUsage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="sessions" 
                stackId="1"
                stroke="#22c55e" 
                fill="#22c55e" 
                fillOpacity={0.6}
                name="Sessions"
              />
              <Area 
                type="monotone" 
                dataKey="uniqueUsers" 
                stackId="1"
                stroke="#f59e0b" 
                fill="#f59e0b" 
                fillOpacity={0.6}
                name="Unique Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Device Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.demographics.devices}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="device"
                >
                  {analyticsData.demographics.devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.pages.slice(0, 8).map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.path}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg time: {formatDuration(page.avgTimeOnPage || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatNumber(page.views)}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuestionnaires = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.questionnaires.map((q, index) => (
              <div key={q.questionnaireId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{q.questionnaireName || `Questionnaire ${q.questionnaireId}`}</h3>
                  <Badge variant={q.avgCompletionRate > 70 ? "default" : "secondary"}>
                    {q.avgCompletionRate?.toFixed(1)}% completion
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Starts</p>
                    <p className="text-lg font-semibold">{q.starts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completions</p>
                    <p className="text-lg font-semibold">{q.completions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Duration</p>
                    <p className="text-lg font-semibold">{formatDuration(q.avgDuration || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                    <p className="text-lg font-semibold">{q.avgEngagement?.toFixed(1) || 'N/A'}</p>
                  </div>
                </div>
                
                <Progress value={q.avgCompletionRate || 0} className="mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData.features.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="featureName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalUsage" fill="#22c55e" name="Total Usage" />
              <Bar dataKey="uniqueUsers" fill="#f59e0b" name="Unique Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{analyticsData.accessibility.totalAccessibilityUsers}</p>
              <p className="text-sm text-muted-foreground">Accessibility Mode Users</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Volume2 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{analyticsData.accessibility.textToSpeechUsers}</p>
              <p className="text-sm text-muted-foreground">Text-to-Speech Users</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{analyticsData.accessibility.highContrastUsers}</p>
              <p className="text-sm text-muted-foreground">High Contrast Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformance = () => {
    const performanceGrade = getPerformanceGrade(analyticsData.performance.performanceScore || 0);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className={`text-4xl font-bold ${performanceGrade.color}`}>
                  {performanceGrade.grade}
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-xs text-muted-foreground">{analyticsData.performance.performanceScore}%</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{analyticsData.performance.avgLcp?.toFixed(2)}s</p>
                <p className="text-sm text-muted-foreground">Largest Contentful Paint</p>
                <Badge variant={analyticsData.performance.avgLcp < 2.5 ? "default" : "destructive"} className="text-xs mt-1">
                  {analyticsData.performance.avgLcp < 2.5 ? "Good" : "Needs Work"}
                </Badge>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{analyticsData.performance.avgFid?.toFixed(0)}ms</p>
                <p className="text-sm text-muted-foreground">First Input Delay</p>
                <Badge variant={analyticsData.performance.avgFid < 100 ? "default" : "destructive"} className="text-xs mt-1">
                  {analyticsData.performance.avgFid < 100 ? "Good" : "Needs Work"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">First Contentful Paint</span>
                  <span className="text-sm font-medium">{analyticsData.performance.avgFcp?.toFixed(2)}s</span>
                </div>
                <Progress value={Math.min((analyticsData.performance.avgFcp || 0) / 3 * 100, 100)} />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Time to First Byte</span>
                  <span className="text-sm font-medium">{analyticsData.performance.avgTtfb?.toFixed(0)}ms</span>
                </div>
                <Progress value={Math.min((analyticsData.performance.avgTtfb || 0) / 1000 * 100, 100)} />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Cumulative Layout Shift</span>
                  <span className="text-sm font-medium">{analyticsData.performance.avgCls?.toFixed(3)}</span>
                </div>
                <Progress value={Math.min((analyticsData.performance.avgCls || 0) / 0.25 * 100, 100)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Platform insights for {analyticsData.dateRange.start.split('T')[0]} to {analyticsData.dateRange.end.split('T')[0]}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'questionnaires', label: 'Questionnaires', icon: Target },
          { id: 'features', label: 'Features', icon: Zap },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'questionnaires' && renderQuestionnaires()}
      {activeTab === 'features' && renderFeatures()}
      {activeTab === 'performance' && renderPerformance()}
    </div>
  );
}
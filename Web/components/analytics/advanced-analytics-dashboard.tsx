'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Funnel,
  FunnelChart,
  Treemap,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Target, 
  Zap, 
  Eye,
  Clock,
  Smartphone,
  Monitor,
  Accessibility,
  Award,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Heart,
  Star,
  Shield,
  Globe,
  MousePointer,
  FormInput,
  Navigation,
  Layers,
  Cpu,
  HardDrive,
  Wifi,
  Battery
} from 'lucide-react';

interface AdvancedAnalyticsData {
  // User engagement metrics
  engagement: {
    totalEngagedUsers: number;
    avgEngagementTime: number;
    engagementRate: number;
    returnUserRate: number;
    sessionDepth: number;
    interactionRate: number;
    scrollDepthAvg: number;
    contentConsumption: number;
  };
  
  // User journey analytics
  userJourney: {
    funnelSteps: Array<{
      stepName: string;
      stepNumber: number;
      usersEntered: number;
      usersCompleted: number;
      conversionRate: number;
      avgTimeSpent: number;
      dropOffRate: number;
    }>;
    pathAnalysis: Array<{
      fromPage: string;
      toPage: string;
      userCount: number;
      avgTransitionTime: number;
      bounceRate: number;
    }>;
    topExitPages: Array<{
      page: string;
      exitCount: number;
      exitRate: number;
    }>;
  };
  
  // Feature adoption metrics
  featureAdoption: {
    features: Array<{
      featureName: string;
      totalUsers: number;
      adopters: number;
      adoptionRate: number;
      timeToFirstUse: number;
      usageFrequency: number;
      retentionRate: number;
      satisfactionScore: number;
    }>;
    newFeatures: Array<{
      featureName: string;
      launchDate: string;
      adopters: number;
      adoptionVelocity: number;
    }>;
  };
  
  // User segmentation
  userSegmentation: {
    demographics: {
      userTypes: Array<{ type: string; count: number; percentage: number; }>;
      categories: Array<{ category: string; count: number; percentage: number; }>;
      academicLevels: Array<{ level: string; count: number; percentage: number; }>;
    };
    behavior: {
      powerUsers: number;
      casualUsers: number;
      trialUsers: number;
      churned: number;
    };
    accessibility: {
      accessibilityUsers: number;
      screenReaderUsers: number;
      keyboardNavigationUsers: number;
      highContrastUsers: number;
      textToSpeechUsers: number;
    };
  };
  
  // Performance insights
  performance: {
    pageLoadTimes: Array<{
      page: string;
      avgLoadTime: number;
      p95LoadTime: number;
      performanceScore: number;
    }>;
    errorRates: Array<{
      errorType: string;
      count: number;
      affectedUsers: number;
      errorRate: number;
    }>;
    systemHealth: {
      uptime: number;
      responseTime: number;
      errorRate: number;
      throughput: number;
    };
  };
  
  // Conversion metrics
  conversions: {
    goals: Array<{
      goalName: string;
      conversions: number;
      conversionRate: number;
      value: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    funnels: Array<{
      funnelName: string;
      stages: Array<{
        stageName: string;
        users: number;
        conversionRate: number;
      }>;
    }>;
  };
  
  // Content analytics
  content: {
    questionnaires: Array<{
      questionnaireName: string;
      completionRate: number;
      avgCompletionTime: number;
      userSatisfaction: number;
      dropoffPoints: Array<{
        questionNumber: number;
        dropoffRate: number;
      }>;
    }>;
    reportGeneration: {
      totalReports: number;
      avgGenerationTime: number;
      userSatisfaction: number;
      downloadRate: number;
    };
  };
  
  // Time-based trends
  trends: {
    daily: Array<{
      date: string;
      users: number;
      sessions: number;
      engagement: number;
      conversions: number;
    }>;
    hourly: Array<{
      hour: number;
      users: number;
      activity: number;
    }>;
    cohort: Array<{
      cohortMonth: string;
      month0: number;
      month1: number;
      month2: number;
      month3: number;
    }>;
  };
}

interface AdvancedAnalyticsDashboardProps {
  className?: string;
  timeRange?: string;
  userId?: number;
}

const COLORS = {
  primary: '#22c55e',
  secondary: '#3b82f6',
  accent: '#f59e0b',
  danger: '#ef4444',
  warning: '#f97316',
  info: '#06b6d4',
  success: '#10b981',
  muted: '#6b7280'
};

export function AdvancedAnalyticsDashboard({ 
  className, 
  timeRange = '30d', 
  userId 
}: AdvancedAnalyticsDashboardProps) {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('engagement');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        timeRange,
        advanced: 'true',
        ...(userId && { userId: userId.toString() })
      });
      
      const response = await fetch(`/api/analytics/mock-advanced?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load advanced analytics');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error('Advanced analytics loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange, userId]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading advanced analytics...</p>
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
          <h2 className="text-2xl font-bold">Advanced Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into user behavior and platform performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {[
          { id: 'engagement', label: 'Engagement', icon: Heart },
          { id: 'journey', label: 'User Journey', icon: Navigation },
          { id: 'features', label: 'Features', icon: Layers },
          { id: 'segments', label: 'Segments', icon: Users },
          { id: 'performance', label: 'Performance', icon: Cpu },
          { id: 'conversions', label: 'Conversions', icon: Target },
          { id: 'content', label: 'Content', icon: BarChart3 },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="grid gap-6">
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Engaged Users"
                value={data.engagement.totalEngagedUsers.toLocaleString()}
                change={12}
                icon={Heart}
                color="text-red-500"
              />
              <MetricCard
                title="Avg Engagement Time"
                value={`${Math.round(data.engagement.avgEngagementTime / 60)}m`}
                change={8}
                icon={Clock}
                color="text-blue-500"
              />
              <MetricCard
                title="Engagement Rate"
                value={`${(data.engagement.engagementRate * 100).toFixed(1)}%`}
                change={5}
                icon={Activity}
                color="text-green-500"
              />
              <MetricCard
                title="Return Rate"
                value={`${(data.engagement.returnUserRate * 100).toFixed(1)}%`}
                change={15}
                icon={RefreshCw}
                color="text-purple-500"
              />
            </div>

            {/* Engagement Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.trends.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke={COLORS.primary} 
                      fill={COLORS.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scroll Depth and Interaction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Average Scroll Depth</span>
                      <span className="font-medium">{(data.engagement.scrollDepthAvg * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={data.engagement.scrollDepthAvg * 100} />
                    
                    <div className="flex items-center justify-between">
                      <span>Interaction Rate</span>
                      <span className="font-medium">{(data.engagement.interactionRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={data.engagement.interactionRate * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Session Depth</span>
                      <span className="font-medium">{data.engagement.sessionDepth.toFixed(1)} pages</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Content Consumption</span>
                      <span className="font-medium">{(data.engagement.contentConsumption * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={data.engagement.contentConsumption * 100} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* User Journey Tab */}
        {activeTab === 'journey' && (
          <div className="grid gap-6">
            {/* Funnel Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>User Journey Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="usersCompleted"
                      data={data.userJourney.funnelSteps}
                      isAnimationActive
                    />
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Path Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>User Path Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userJourney.pathAnalysis.slice(0, 10).map((path, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{path.fromPage}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{path.toPage}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{path.userCount} users</div>
                        <div className="text-sm text-muted-foreground">
                          {path.avgTransitionTime}s avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Adoption Tab */}
        {activeTab === 'features' && (
          <div className="grid gap-6">
            {/* Feature Adoption Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Adoption Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.featureAdoption.features}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="featureName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="adoptionRate" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feature Details */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.featureAdoption.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{feature.featureName}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{feature.adopters} adopters</span>
                          <span>{feature.usageFrequency.toFixed(1)}x/week</span>
                          <span>{(feature.retentionRate * 100).toFixed(1)}% retention</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {(feature.adoptionRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ⭐ {feature.satisfactionScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional tabs would continue here... */}
      </div>
    </div>
  );
}

// Helper component for metric cards
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = "text-primary" 
}: {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <p className="text-sm flex items-center gap-1 mt-1">
                {change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={change > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(change)}%
                </span>
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
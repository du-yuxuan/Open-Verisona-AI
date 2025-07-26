import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, FileText, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { AdminStatsCards } from '@/components/admin/admin-stats-cards';
import { AdminRecentActivity } from '@/components/admin/admin-recent-activity';
import { AdminMetricsCharts } from '@/components/admin/admin-metrics-charts';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage the Verisona AI platform
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Platform Online
        </Badge>
      </div>

      {/* Quick Stats */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>}>
        <AdminStatsCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest user actions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>}>
              <AdminRecentActivity />
            </Suspense>
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Health
            </CardTitle>
            <CardDescription>
              System status and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <Badge variant="outline" className="text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  142ms
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Status</span>
                <Badge variant="outline" className="text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dify Integration</span>
                <Badge variant="outline" className="text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage Usage</span>
                <Badge variant="outline" className="text-blue-600">
                  68% used
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Platform Metrics
          </CardTitle>
          <CardDescription>
            Usage trends and performance analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-96 bg-gray-100 rounded animate-pulse"></div>}>
            <AdminMetricsCharts />
          </Suspense>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Alerts
          </CardTitle>
          <CardDescription>
            Important notifications and warnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Database backup scheduled
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Automated backup will run tonight at 2:00 AM EST
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  New feature deployment ready
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Enhanced accessibility features are ready for production
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
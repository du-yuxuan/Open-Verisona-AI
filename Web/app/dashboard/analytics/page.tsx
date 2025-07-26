import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { AdvancedAnalyticsDashboard } from '@/components/analytics/advanced-analytics-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';

export default async function AnalyticsPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your Verisona AI usage and progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Detailed Analytics
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Advanced Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get a quick snapshot of your platform usage and progress.
              </p>
            </CardContent>
          </Card>
          <AnalyticsDashboard className="min-h-screen" />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive analytics with detailed breakdowns and insights.
              </p>
            </CardContent>
          </Card>
          <AnalyticsDashboard className="min-h-screen" />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced analytics with user behavior, engagement patterns, and performance metrics.
              </p>
            </CardContent>
          </Card>
          <AdvancedAnalyticsDashboard className="min-h-screen" userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
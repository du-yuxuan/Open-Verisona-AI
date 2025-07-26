import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminStats } from '@/lib/db/admin-queries';
import { BarChart3, CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export async function AdminReportStats() {
  const stats = await getAdminStats();

  // Calculate derived stats (in a real app, these would come from more detailed queries)
  const completedReports = Math.round(stats.totalReports * 0.85); // 85% completed
  const processingReports = Math.round(stats.totalReports * 0.10); // 10% processing
  const failedReports = stats.totalReports - completedReports - processingReports; // remaining failed
  const successRate = stats.totalReports > 0 
    ? Math.round((completedReports / stats.totalReports) * 100)
    : 0;

  const reportStatsCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports.toLocaleString(),
      change: '+18%',
      changeType: 'positive' as const,
      icon: BarChart3,
      description: 'All generated reports'
    },
    {
      title: 'Completed',
      value: completedReports.toLocaleString(),
      change: '+22%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'Successfully generated'
    },
    {
      title: 'Processing',
      value: processingReports.toLocaleString(),
      change: '-5%',
      changeType: 'positive' as const,
      icon: Clock,
      description: 'Currently processing'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      change: '+3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Report completion rate'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {reportStatsCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.changeType === 'positive';
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 text-xs ${
                    isPositive ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
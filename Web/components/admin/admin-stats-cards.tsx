import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, BarChart3, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { getAdminStats } from '@/lib/db/admin-queries';

export async function AdminStatsCards() {
  const stats = await getAdminStats();

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Active registered users'
    },
    {
      title: 'Questionnaires',
      value: stats.totalQuestionnaires.toLocaleString(),
      change: '+3%',
      changeType: 'positive' as const,
      icon: FileText,
      description: 'Available questionnaires'
    },
    {
      title: 'Responses',
      value: stats.totalResponses.toLocaleString(),
      change: '+25%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      description: 'User responses collected'
    },
    {
      title: 'Reports Generated',
      value: stats.totalReports.toLocaleString(),
      change: '+18%',
      changeType: 'positive' as const,
      icon: BarChart3,
      description: 'AI-generated reports'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
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
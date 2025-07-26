import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminStats } from '@/lib/db/admin-queries';
import { FileText, MessageSquare, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export async function AdminQuestionnaireStats() {
  const stats = await getAdminStats();

  // Calculate derived stats (in a real app, these would come from more detailed queries)
  const activeQuestionnaires = Math.round(stats.totalQuestionnaires * 0.8); // 80% active
  const avgResponsesPerQuestionnaire = stats.totalQuestionnaires > 0 
    ? Math.round(stats.totalResponses / stats.totalQuestionnaires) 
    : 0;
  const completionRate = stats.totalReports > 0 && stats.totalResponses > 0
    ? Math.round((stats.totalReports / stats.totalResponses) * 100)
    : 0;

  const questionnaireStatsCards = [
    {
      title: 'Total Questionnaires',
      value: stats.totalQuestionnaires.toLocaleString(),
      change: '+2%',
      changeType: 'positive' as const,
      icon: FileText,
      description: 'All questionnaires'
    },
    {
      title: 'Active Questionnaires',
      value: activeQuestionnaires.toLocaleString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'Currently active'
    },
    {
      title: 'Total Responses',
      value: stats.totalResponses.toLocaleString(),
      change: '+18%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      description: 'User responses'
    },
    {
      title: 'Avg. Responses',
      value: avgResponsesPerQuestionnaire.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Per questionnaire'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {questionnaireStatsCards.map((stat, index) => {
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
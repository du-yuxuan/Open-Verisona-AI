import { Badge } from '@/components/ui/badge';
import { getRecentActivity } from '@/lib/db/admin-queries';
import { formatDistanceToNow } from 'date-fns';
import { User, FileText, BarChart3, UserPlus, MessageSquare } from 'lucide-react';

export async function AdminRecentActivity() {
  const { recentEvents, recentUsers, recentReports } = await getRecentActivity();

  // Combine and sort all activities
  const activities = [
    ...recentUsers.map(user => ({
      id: `user-${user.id}`,
      type: 'user_registered',
      title: `New user registered`,
      description: user.name || user.email,
      createdAt: user.createdAt,
      icon: UserPlus,
      color: 'text-green-600',
    })),
    ...recentReports.map(report => ({
      id: `report-${report.id}`,
      type: 'report_generated',
      title: `Report generated`,
      description: `Status: ${report.status}`,
      createdAt: report.createdAt,
      icon: BarChart3,
      color: 'text-blue-600',
    })),
    ...recentEvents.slice(0, 3).map(event => ({
      id: `event-${event.id}`,
      type: event.eventType,
      title: `${event.eventType.replace('_', ' ')}`,
      description: typeof event.eventData === 'object' && event.eventData 
        ? JSON.stringify(event.eventData).slice(0, 50) + '...'
        : 'System event',
      createdAt: event.createdAt,
      icon: MessageSquare,
      color: 'text-purple-600',
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon;
        
        return (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`mt-0.5 ${activity.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-foreground capitalize">
                  {activity.title}
                </p>
                <Badge variant="outline" className="text-xs">
                  {activity.type.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
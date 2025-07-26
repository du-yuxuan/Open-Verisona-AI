import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getQuestionnairesWithStats } from '@/lib/db/admin-queries';
import { formatDistanceToNow } from 'date-fns';
import { FileText, MoreVertical, Eye, Edit, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export async function AdminQuestionnairesList() {
  const questionnaires = await getQuestionnairesWithStats();

  if (questionnaires.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No questionnaires found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first questionnaire to get started.
        </p>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Create Questionnaire
        </Button>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personality_assessment':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'goals_aspirations':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'background_experiences':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'academic_preferences':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'personality_assessment':
        return 'Personality';
      case 'goals_aspirations':
        return 'Goals';
      case 'background_experiences':
        return 'Background';
      case 'academic_preferences':
        return 'Academic';
      default:
        return type.replace('_', ' ');
    }
  };

  return (
    <div className="space-y-4">
      {questionnaires.map((questionnaire) => (
        <div key={questionnaire.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          {/* Icon */}
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-primary" />
          </div>

          {/* Questionnaire Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground truncate">
                {questionnaire.title}
              </h4>
              <Badge className={`text-xs ${getTypeColor(questionnaire.type)}`}>
                {getTypeLabel(questionnaire.type)}
              </Badge>
              {questionnaire.isActive ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600 border-gray-200">
                  Inactive
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground truncate mb-2">
              {questionnaire.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {questionnaire.responseCount} responses
              </span>
              <span>
                Created {formatDistanceToNow(new Date(questionnaire.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center px-4">
            <div className="text-lg font-bold text-foreground">
              {questionnaire.responseCount}
            </div>
            <div className="text-xs text-muted-foreground">
              Responses
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/questionnaire/${questionnaire.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Questionnaire
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <FileText className="h-4 w-4 mr-2" />
                  {questionnaire.isActive ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
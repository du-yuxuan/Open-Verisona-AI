import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Settings, TrendingUp } from 'lucide-react';
import { AdminQuestionnairesList } from '@/components/admin/admin-questionnaires-list';
import { AdminQuestionnaireStats } from '@/components/admin/admin-questionnaire-stats';

export default function AdminQuestionnairesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Questionnaire Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage questionnaires and monitor response rates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Questionnaire
          </Button>
        </div>
      </div>

      {/* Questionnaire Stats */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>}>
        <AdminQuestionnaireStats />
      </Suspense>

      {/* Questionnaires List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Questionnaires
          </CardTitle>
          <CardDescription>
            Manage and monitor all questionnaires on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>}>
            <AdminQuestionnairesList />
          </Suspense>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create New Questionnaire
            </CardTitle>
            <CardDescription>
              Build a new questionnaire from scratch or template
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Response Analytics
            </CardTitle>
            <CardDescription>
              View detailed analytics for questionnaire responses
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Question Templates
            </CardTitle>
            <CardDescription>
              Manage reusable question templates and types
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
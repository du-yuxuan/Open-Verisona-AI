import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { AdminReportsList } from '@/components/admin/admin-reports-list';
import { AdminReportStats } from '@/components/admin/admin-report-stats';

export default async function AdminReportsPage({ 
  searchParams 
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const searchQuery = params.search || '';
  const statusFilter = params.status || 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Report Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor AI-generated reports and analysis results
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Report Stats */}
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
        <AdminReportStats />
      </Suspense>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            All Reports
          </CardTitle>
          <CardDescription>
            Browse and manage all generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or report content..."
                defaultValue={searchQuery}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                defaultValue={statusFilter}
                className="px-3 py-1.5 text-sm border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Reports Table */}
          <Suspense fallback={<div className="space-y-4">
            {[...Array(10)].map((_, i) => (
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
            <AdminReportsList 
              page={currentPage}
              search={searchQuery}
              status={statusFilter}
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Bulk Analysis
            </CardTitle>
            <CardDescription>
              Process multiple responses at once
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Export Reports
            </CardTitle>
            <CardDescription>
              Download reports in various formats
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              System Health
            </CardTitle>
            <CardDescription>
              Monitor AI processing system status
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Filter, Download, Plus } from 'lucide-react';
import { AdminUsersTable } from '@/components/admin/admin-users-table';
import { AdminUserStats } from '@/components/admin/admin-user-stats';

export default async function AdminUsersPage({ 
  searchParams 
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    filter?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const searchQuery = params.search || '';
  const filterType = params.filter || 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor platform users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Stats */}
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
        <AdminUserStats />
      </Suspense>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Directory</CardTitle>
          <CardDescription>
            Browse and manage all platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                defaultValue={searchQuery}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                defaultValue={filterType}
                className="px-3 py-1.5 text-sm border rounded-md bg-background"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="recent">Recent</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <Suspense fallback={<div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded animate-pulse">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="w-20 h-6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>}>
            <AdminUsersTable 
              page={currentPage}
              search={searchQuery}
              filter={filterType}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
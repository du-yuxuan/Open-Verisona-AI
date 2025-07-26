import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUsersWithPagination } from '@/lib/db/admin-queries';
import { formatDistanceToNow } from 'date-fns';
import { Mail, MoreVertical, Shield, UserX } from 'lucide-react';
import Link from 'next/link';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface AdminUsersTableProps {
  page: number;
  search: string;
  filter: string;
}

export async function AdminUsersTable({ page, search, filter }: AdminUsersTableProps) {
  const { users, pagination } = await getUsersWithPagination(page, 20);

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No users found</h3>
        <p className="text-muted-foreground">
          {search ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Users List */}
      <div className="space-y-2">
        {users.map((user) => {
          const userInitials = user.name
            ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : user.email[0].toUpperCase();
          
          const demographicInfo = user.demographicInfo as any;
          const isVerified = user.emailVerified;

          return (
            <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground truncate">
                    {user.name || 'Unnamed User'}
                  </h4>
                  {isVerified ? (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                      <Mail className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </span>
                  {demographicInfo?.yearInSchool && (
                    <Badge variant="outline" className="text-xs">
                      {demographicInfo.yearInSchool}
                    </Badge>
                  )}
                  {demographicInfo?.ethnicity && (
                    <Badge variant="outline" className="text-xs">
                      {demographicInfo.ethnicity}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/users/${user.id}`}>
                    View Details
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
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="h-4 w-4 mr-2" />
                      {isVerified ? 'Unverify' : 'Verify'} Account
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <UserX className="h-4 w-4 mr-2" />
                      Suspend User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {users.length} of {pagination.totalUsers} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              asChild={pagination.hasPrevPage}
            >
              {pagination.hasPrevPage ? (
                <Link href={`/admin/users?page=${pagination.page - 1}`}>
                  Previous
                </Link>
              ) : (
                <span>Previous</span>
              )}
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === pagination.page;
                
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    asChild={!isActive}
                    disabled={isActive}
                  >
                    {isActive ? (
                      <span>{pageNum}</span>
                    ) : (
                      <Link href={`/admin/users?page=${pageNum}`}>
                        {pageNum}
                      </Link>
                    )}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              asChild={pagination.hasNextPage}
            >
              {pagination.hasNextPage ? (
                <Link href={`/admin/users?page=${pagination.page + 1}`}>
                  Next
                </Link>
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
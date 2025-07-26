import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getReportsWithPagination } from '@/lib/db/admin-queries';
import { formatDistanceToNow } from 'date-fns';
import { BarChart3, MoreVertical, Eye, Download, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface AdminReportsListProps {
  page: number;
  search: string;
  status: string;
}

export async function AdminReportsList({ page, search, status }: AdminReportsListProps) {
  const { reports, pagination } = await getReportsWithPagination(page, 20);

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No reports found</h3>
        <p className="text-muted-foreground">
          {search ? 'Try adjusting your search terms.' : 'No reports have been generated yet.'}
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return BarChart3;
      case 'processing':
        return RefreshCw;
      case 'failed':
        return AlertCircle;
      default:
        return BarChart3;
    }
  };

  return (
    <div className="space-y-4">
      {/* Reports List */}
      <div className="space-y-2">
        {reports.map((report) => {
          const userInitials = report.userName
            ? report.userName.split(' ').map(n => n[0]).join('').toUpperCase()
            : report.userEmail?.[0]?.toUpperCase() || '?';
          
          const StatusIcon = getStatusIcon(report.status);

          return (
            <div key={report.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              {/* Report Icon */}
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <StatusIcon className={`h-6 w-6 ${
                  report.status === 'processing' ? 'animate-spin' : ''
                } text-primary`} />
              </div>

              {/* Report Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground">
                    Report #{report.id.slice(-8)}
                  </h4>
                  <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                    {report.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {report.userName || report.userEmail || 'Unknown User'}
                    </span>
                  </div>
                </div>

                {report.summary && (
                  <p className="text-sm text-muted-foreground truncate mb-1">
                    {report.summary.slice(0, 100)}...
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    Session: {report.sessionId?.slice(-8) || 'N/A'}
                  </span>
                  <span>
                    Generated {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {report.status === 'completed' && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/reports/${report.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {report.status === 'completed' && (
                      <>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      </>
                    )}
                    {report.status === 'failed' && (
                      <DropdownMenuItem>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Generation
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Delete Report
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
            Showing {reports.length} of {pagination.totalReports} reports
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              asChild={pagination.hasPrevPage}
            >
              {pagination.hasPrevPage ? (
                <Link href={`/admin/reports?page=${pagination.page - 1}`}>
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
                      <Link href={`/admin/reports?page=${pageNum}`}>
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
                <Link href={`/admin/reports?page=${pagination.page + 1}`}>
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
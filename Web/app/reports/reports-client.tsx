'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Brain, 
  GraduationCap, 
  Target, 
  Clock, 
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface Report {
  id: number;
  sessionId: string;
  type: string;
  status: string;
  title: string;
  summary?: string;
  content?: any;
  generatedAt: string;
  updatedAt: string;
  lastViewedAt?: string;
  metadata?: any;
}

interface Session {
  sessionId: string;
  questionnaireTitle: string;
  completedAt: string;
  reports: Report[];
}

export default function ReportsClient() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all reports for the user
      const reportsResponse = await fetch('/api/reports');
      if (!reportsResponse.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const reportsData = await reportsResponse.json();
      
      // Group reports by session
      const reportsBySession = reportsData.reports.reduce((acc: any, report: Report) => {
        const sessionId = report.sessionId;
        if (!acc[sessionId]) {
          acc[sessionId] = {
            sessionId,
            questionnaireTitle: 'Analysis Report',
            completedAt: report.generatedAt,
            reports: []
          };
        }
        acc[sessionId].reports.push(report);
        return acc;
      }, {});

      setSessions(Object.values(reportsBySession));
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (sessionId: string, analysisType: string) => {
    try {
      setGeneratingReports(prev => new Set([...prev, `${sessionId}-${analysisType}`]));
      
      const response = await fetch(`/api/analysis/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType,
          options: {
            includeRecommendations: true,
            includeCollegeMatches: analysisType === 'college_match' || analysisType === 'comprehensive',
            includeEssayGuidance: analysisType === 'comprehensive',
            detailLevel: 'detailed',
            generateReport: true,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();
      
      // Refresh reports
      await fetchReports();
      
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGeneratingReports(prev => {
        const next = new Set(prev);
        next.delete(`${sessionId}-${analysisType}`);
        return next;
      });
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'personality_analysis':
        return <Brain className="h-5 w-5" />;
      case 'college_match':
        return <GraduationCap className="h-5 w-5" />;
      case 'academic_profile':
        return <Target className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'personality_analysis':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'college_match':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'academic_profile':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchReports}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Reports Yet</h3>
        <p className="text-muted-foreground mb-6">
          Complete a questionnaire to generate your first AI analysis report.
        </p>
        <Link href="/questionnaire">
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="h-4 w-4 mr-2" />
            Start Questionnaire
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Recent Sessions</h2>
          <p className="text-sm text-muted-foreground">
            {sessions.length} completed session{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={fetchReports} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Sessions and Reports */}
      {sessions.map((session) => (
        <Card key={session.sessionId} className="border-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{session.questionnaireTitle}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Completed {new Date(session.completedAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {session.reports.length} report{session.reports.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {session.reports.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-muted/20 rounded-lg">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No reports generated yet</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['personality', 'academic', 'college_match', 'comprehensive'].map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => generateReport(session.sessionId, type)}
                      disabled={generatingReports.has(`${session.sessionId}-${type}`)}
                      className="text-xs"
                    >
                      {generatingReports.has(`${session.sessionId}-${type}`) ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        getReportTypeIcon(type + '_analysis')
                      )}
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {session.reports.map((report) => (
                  <Card key={report.id} className={`${getReportTypeColor(report.type)} border`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getReportTypeIcon(report.type)}
                          <CardTitle className="text-base">{report.title}</CardTitle>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      {report.summary && (
                        <CardDescription className="text-sm line-clamp-2">
                          {report.summary}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(report.updatedAt || report.generatedAt).toLocaleDateString()}
                        </span>
                        {report.metadata?.processingTime && (
                          <span>{Math.round(report.metadata.processingTime / 1000)}s</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {report.status === 'completed' && (
                          <>
                            <Link href={`/reports/${report.id}`}>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Button>
                          </>
                        )}
                        {report.status === 'failed' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => generateReport(session.sessionId, report.type.replace('_analysis', ''))}
                            disabled={generatingReports.has(`${session.sessionId}-${report.type.replace('_analysis', '')}`)}
                            className="flex-1"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add missing report types */}
                {['personality', 'academic', 'college_match', 'comprehensive'].map((type) => {
                  const hasReport = session.reports.some(r => r.type.includes(type));
                  if (hasReport) return null;
                  
                  return (
                    <Card key={type} className="border-dashed border-muted/40 bg-muted/5">
                      <CardContent className="p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {getReportTypeIcon(type + '_analysis')}
                          <p className="font-medium text-sm">
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Analysis
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateReport(session.sessionId, type)}
                            disabled={generatingReports.has(`${session.sessionId}-${type}`)}
                          >
                            {generatingReports.has(`${session.sessionId}-${type}`) ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              'Generate'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
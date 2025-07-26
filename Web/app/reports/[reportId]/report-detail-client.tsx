'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  GraduationCap, 
  Target, 
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Heart,
  Lightbulb,
  Map,
  Sparkles,
  FileText,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

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

interface ReportDetailClientProps {
  reportId: string;
}

// Helper function to render markdown-style content
function renderMarkdownContent(content: string) {
  if (!content) return null;
  
  // Split by lines and handle different markdown elements
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        // Handle headers
        if (line.startsWith('# ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Star className="h-6 w-6" />
              {line.substring(2)}
            </h2>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={index} className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              {line.substring(3)}
            </h3>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h4 key={index} className="text-lg font-medium text-foreground mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {line.substring(4)}
            </h4>
          );
        }
        
        // Handle lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start gap-3 ml-4">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-foreground leading-relaxed">{line.substring(2)}</p>
            </div>
          );
        }
        
        // Handle numbered lists
        if (/^\d+\. /.test(line)) {
          const number = line.match(/^(\d+)\. /)?.[1];
          const text = line.replace(/^\d+\. /, '');
          return (
            <div key={index} className="flex items-start gap-3 ml-4">
              <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {number}
              </div>
              <p className="text-foreground leading-relaxed">{text}</p>
            </div>
          );
        }
        
        // Handle bold text
        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <p key={index} className="text-foreground leading-relaxed">
              {parts.map((part, i) => 
                i % 2 === 0 ? part : <strong key={i} className="font-semibold text-primary">{part}</strong>
              )}
            </p>
          );
        }
        
        // Handle regular paragraphs
        if (line.trim()) {
          return (
            <p key={index} className="text-foreground leading-relaxed">
              {line}
            </p>
          );
        }
        
        return null;
      }).filter(Boolean)}
    </div>
  );
}

export default function ReportDetailClient({ reportId }: ReportDetailClientProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Report not found');
        }
        throw new Error('Failed to load report');
      }

      const data = await response.json();
      console.log('🔍 Report data received:', {
        reportId,
        status: data.report?.status,
        contentType: typeof data.report?.content,
        contentLength: data.report?.content ? String(data.report?.content).length : 0,
        contentPreview: data.report?.content ? String(data.report?.content).substring(0, 100) + '...' : 'N/A',
        contentKeys: data.report?.content && typeof data.report?.content === 'object' ? Object.keys(data.report?.content) : 'N/A'
      });
      setReport(data.report);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'json') => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report?.title || 'report'}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report?.title,
          text: report?.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error || 'Report not found'}
        </AlertDescription>
      </Alert>
    );
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'personality_analysis':
        return <Brain className="h-5 w-5" />;
      case 'college_match':
        return <GraduationCap className="h-5 w-5" />;
      case 'academic_profile':
        return <Target className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
                {getReportIcon(report.type)}
              </div>
              <div>
                <CardTitle className="text-xl">{report.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(report.updatedAt || report.generatedAt).toLocaleDateString()}
                  </span>
                  {report.metadata?.processingTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round(report.metadata.processingTime / 1000)}s processing
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
              <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={shareReport}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {report.summary && (
          <CardContent>
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Executive Summary
              </h3>
              <p className="text-foreground leading-relaxed">{report.summary}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Report Content */}
      {report.content && (
        <div className="space-y-6">
          {/* Raw Content Display with Markdown Rendering */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                AI Analysis Report
              </CardTitle>
              <CardDescription>
                Comprehensive personality analysis and college application insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {(() => {
                  // Handle different content structures
                  if (typeof report.content === 'string') {
                    // Check if it's a JSON-encoded string (legacy format)
                    if (report.content.startsWith('"') && report.content.endsWith('"')) {
                      try {
                        const parsed = JSON.parse(report.content);
                        if (typeof parsed === 'string') {
                          return renderMarkdownContent(parsed);
                        }
                      } catch (e) {
                        // If parsing fails, treat as regular string
                        return renderMarkdownContent(report.content);
                      }
                    }
                    // Regular string content
                    return renderMarkdownContent(report.content);
                  } else if (report.content && typeof report.content === 'object') {
                    // New structure with text property
                    if (report.content.text) {
                      return renderMarkdownContent(report.content.text);
                    }
                    // Legacy structure or other object formats
                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                          <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-mono">
                            {JSON.stringify(report.content, null, 2)}
                          </pre>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No content available</p>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
          
          {/* Tabbed Analysis Sections */}
          <Tabs defaultValue="personality" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personality" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Personality
              </TabsTrigger>
              <TabsTrigger value="colleges" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Colleges
              </TabsTrigger>
              <TabsTrigger value="academic" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Academic
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personality" className="mt-6">
              {renderPersonalityAnalysis(report.content)}
            </TabsContent>
            
            <TabsContent value="colleges" className="mt-6">
              {renderCollegeMatches(report.content)}
            </TabsContent>
            
            <TabsContent value="academic" className="mt-6">
              {renderAcademicProfile(report.content)}
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-6">
              {renderRecommendations(report.content)}
            </TabsContent>
            
            <TabsContent value="insights" className="mt-6">
              {renderInsights(report.content)}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Metadata */}
      {report.metadata && (
        <Card className="bg-muted/20 border-muted/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analysis Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Analysis Type</p>
                <p className="capitalize">{report.metadata.analysisType}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Response Count</p>
                <p>{report.metadata.responseCount} responses</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Processing Time</p>
                <p>{Math.round((report.metadata.processingTime || 0) / 1000)}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function renderPersonalityAnalysis(content: any) {
  if (!content.personality) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Personality Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No personality analysis data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const [expandedTrait, setExpandedTrait] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Personality Analysis
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of your personality traits and characteristics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Core Traits */}
          {content.personality.traits && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-secondary" />
                Core Personality Traits
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {content.personality.traits.map((trait: any, index: number) => {
                  // Ensure trait is an object with the expected properties
                  if (typeof trait === 'object' && trait !== null) {
                    const isExpanded = expandedTrait === index;
                    return (
                      <div key={index} className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20 hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg">{trait.name || trait.title || 'Trait'}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              {trait.score || 0}/10
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedTrait(isExpanded ? null : index)}
                              className="h-6 w-6 p-0"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Score:</span>
                            <Progress value={(trait.score || 0) * 10} className="flex-1" />
                            <span className="text-sm text-muted-foreground">{(trait.score || 0) * 10}%</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {trait.description || 'No description available'}
                        </p>
                        
                        {isExpanded && (
                          <div className="space-y-2 pt-3 border-t border-primary/20">
                            {trait.confidence && (
                              <div className="flex items-center gap-2 text-xs">
                                <Target className="h-3 w-3 text-green-600" />
                                <span className="text-green-700">Confidence: {trait.confidence}%</span>
                              </div>
                            )}
                            {trait.impact && (
                              <div className="flex items-center gap-2 text-xs">
                                <TrendingUp className="h-3 w-3 text-blue-600" />
                                <span className="text-blue-700">Impact: {trait.impact}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div key={index} className="bg-muted/30 rounded-lg p-4 border border-muted">
                        <p className="text-sm text-muted-foreground">{String(trait)}</p>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* Strengths */}
          {content.personality.strengths && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                Key Strengths
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {content.personality.strengths.map((strength: any, index: number) => {
                  // Handle different strength formats
                  if (typeof strength === 'string') {
                    return (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-green-800">{strength}</span>
                      </div>
                    );
                  } else if (typeof strength === 'object' && strength !== null) {
                    return (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-green-800">
                            {strength.title || strength.name || strength.description || 'Strength'}
                          </span>
                          {(strength.confidence || strength.impact) && (
                            <div className="flex items-center gap-3 text-xs text-green-700 mt-2">
                              {strength.confidence && (
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {strength.confidence}%
                                </span>
                              )}
                              {strength.impact && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {strength.impact}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-green-800">{String(strength)}</span>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function renderCollegeMatches(content: any) {
  if (!content.colleges) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-secondary" />
            College Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No college matches available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const [expandedCollege, setExpandedCollege] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-secondary" />
          College Matches
        </CardTitle>
        <CardDescription>
          Personalized college recommendations based on your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {content.colleges.map((college: any, index: number) => {
            // Handle different college formats
            if (typeof college === 'object' && college !== null) {
              const isExpanded = expandedCollege === index;
              const matchScore = college.matchScore || 0;
              
              return (
                <div key={index} className="bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-xl p-5 border border-secondary/20 hover:border-secondary/30 transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary/20 p-2 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-secondary">{college.name || 'College'}</h3>
                        {college.location && (
                          <p className="text-sm text-muted-foreground">{college.location}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${
                          matchScore >= 80 ? 'bg-green-100 text-green-800 border-green-200' :
                          matchScore >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        {matchScore}% match
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedCollege(isExpanded ? null : index)}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Match Score Progress */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Match Score:</span>
                      <Progress value={matchScore} className="flex-1" />
                      <span className="text-sm text-muted-foreground">{matchScore}%</span>
                    </div>
                  </div>
                  
                  {college.why && (
                    <p className="text-sm text-foreground mb-4 leading-relaxed">
                      {college.why || college.description || ''}
                    </p>
                  )}
                  
                  {college.programs && Array.isArray(college.programs) && college.programs.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium text-sm mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Recommended Programs:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {college.programs.map((program: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-secondary/10 border-secondary/20">
                            {typeof program === 'string' ? program : String(program)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isExpanded && (college.confidence || college.impact) && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-secondary/20">
                      {college.confidence && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Confidence: {college.confidence}%
                        </span>
                      )}
                      {college.impact && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Impact: {college.impact}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <div key={index} className="bg-muted/30 rounded-lg p-4 border border-muted">
                  <p className="text-sm text-muted-foreground">{String(college)}</p>
                </div>
              );
            }
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function renderAcademicProfile(content: any) {
  if (!content.academic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Academic Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No academic profile data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          Academic Profile
        </CardTitle>
        <CardDescription>
          Your academic interests and potential career paths
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {content.academic.interests && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                Academic Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {content.academic.interests.map((interest: any, index: number) => (
                  <Badge key={index} variant="outline" className="bg-gradient-to-r from-accent/10 to-accent/20 text-accent border-accent/30 hover:border-accent/40 transition-colors px-3 py-1">
                    {typeof interest === 'string' ? interest : 
                     typeof interest === 'object' && interest !== null ? 
                       (interest.title || interest.name || interest.description || String(interest)) : 
                       String(interest)
                    }
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {content.academic.careerPaths && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Map className="h-4 w-4 text-accent" />
                Potential Career Paths
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.academic.careerPaths.map((career: any, index: number) => {
                  // Handle different career path formats
                  if (typeof career === 'object' && career !== null) {
                    return (
                      <div key={index} className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-4 border border-accent/20 hover:border-accent/30 transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-accent/20 p-2 rounded-lg">
                            <Map className="h-4 w-4 text-accent" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-accent mb-2">{career.title || 'Career Path'}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{career.description || ''}</p>
                            {career.alignment && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium">Alignment:</span>
                                  <Progress value={career.alignment * 10} className="flex-1 h-2" />
                                  <span className="text-sm text-muted-foreground">{career.alignment}/10</span>
                                </div>
                              </div>
                            )}
                            {(career.confidence || career.impact) && (
                              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-accent/20">
                                {career.confidence && (
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Confidence: {career.confidence}%
                                  </span>
                                )}
                                {career.impact && (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Impact: {career.impact}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={index} className="bg-muted/30 rounded-lg p-4 border border-muted">
                        <p className="text-sm text-muted-foreground">{String(career)}</p>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function renderRecommendations(content: any) {
  if (!content.recommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recommendations available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Recommendations
        </CardTitle>
        <CardDescription>
          Personalized recommendations to enhance your college application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {content.recommendations.map((rec: any, index: number) => {
            // Handle different recommendation formats
            if (typeof rec === 'string') {
              return (
                <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-200 hover:border-yellow-300 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-yellow-900 text-sm leading-relaxed">{rec}</p>
                    </div>
                  </div>
                </div>
              );
            } else if (typeof rec === 'object' && rec !== null) {
              const isExpanded = expandedRec === index;
              return (
                <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-200 hover:border-yellow-300 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {rec.category && (
                            <Badge variant="outline" className="text-xs bg-yellow-100 border-yellow-300 text-yellow-800">
                              {rec.category}
                            </Badge>
                          )}
                          {rec.title && (
                            <h3 className="font-semibold text-yellow-900">{rec.title}</h3>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedRec(isExpanded ? null : index)}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {rec.description && (
                        <p className="text-yellow-800 text-sm leading-relaxed mb-3">{rec.description}</p>
                      )}
                      
                      {rec.action && (
                        <div className="bg-yellow-100 rounded-lg p-3 mb-3">
                          <p className="text-yellow-700 text-sm font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Action: {rec.action}
                          </p>
                        </div>
                      )}
                      
                      {isExpanded && (rec.confidence || rec.impact) && (
                        <div className="flex items-center gap-4 text-xs text-yellow-700 pt-3 border-t border-yellow-200">
                          {rec.confidence && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Confidence: {rec.confidence}%
                            </span>
                          )}
                          {rec.impact && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Impact: {rec.impact}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-200 hover:border-yellow-300 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-yellow-900 text-sm leading-relaxed">{String(rec)}</p>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function renderInsights(content: any) {
  if (!content.insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Personal Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No personal insights available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-600" />
          Personal Insights
        </CardTitle>
        <CardDescription>
          Deep insights about your personality and potential for growth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {content.insights.map((insight: any, index: number) => {
            // Handle different insight formats
            if (typeof insight === 'string') {
              return (
                <div key={index} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200 hover:border-pink-300 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Sparkles className="h-4 w-4 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-pink-900 text-sm leading-relaxed">{insight}</p>
                    </div>
                  </div>
                </div>
              );
            } else if (typeof insight === 'object' && insight !== null) {
              const isExpanded = expandedInsight === index;
              return (
                <div key={index} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200 hover:border-pink-300 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Sparkles className="h-4 w-4 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {insight.category && (
                            <Badge variant="outline" className="text-xs bg-pink-100 border-pink-300 text-pink-800">
                              {insight.category}
                            </Badge>
                          )}
                          {insight.title && (
                            <h4 className="font-semibold text-pink-900">{insight.title}</h4>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedInsight(isExpanded ? null : index)}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {insight.description && (
                        <p className="text-pink-800 text-sm leading-relaxed mb-3">{insight.description}</p>
                      )}
                      
                      {isExpanded && (insight.confidence || insight.impact) && (
                        <div className="flex items-center gap-4 text-xs text-pink-700 pt-3 border-t border-pink-200">
                          {insight.confidence && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Confidence: {insight.confidence}%
                            </span>
                          )}
                          {insight.impact && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Impact: {insight.impact}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            } else {
              // Fallback for other types
              return (
                <div key={index} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200 hover:border-pink-300 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Sparkles className="h-4 w-4 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-pink-900 text-sm leading-relaxed">{String(insight)}</p>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </CardContent>
    </Card>
  );
}
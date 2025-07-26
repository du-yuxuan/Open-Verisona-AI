'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  FileText,
  Clock,
  Stars,
  BrainCircuit,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Home,
  Download,
  Share2,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
// import { motion } from 'framer-motion'; // Removed for now
import { Questionnaire, QuestionnaireResponse, User } from '@/lib/db/schema';

interface Props {
  questionnaire: Questionnaire;
  session: QuestionnaireResponse;
  aiGeneratedQuestionnaire?: Questionnaire | null;
  user: User;
}

type AnalysisStatus = 'idle' | 'starting' | 'processing' | 'analyzing' | 'generating' | 'finalizing' | 'completed' | 'error';

type AnalysisStage = {
  name: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
};

export function QuestionnaireCompletePage({
  questionnaire,
  session,
  aiGeneratedQuestionnaire,
  user,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<string>('');
  const [analysisStartTime, setAnalysisStartTime] = useState<number>(0);

  const isFoundationQuestionnaire = questionnaire.title === 'Verisona AI Foundation Questionnaire';
  const hasDifyResults = session.difyResults && Array.isArray(session.difyResults);
  const isUpgradeQuestionnaire = !isFoundationQuestionnaire && questionnaire.title?.includes('Verisona AI Questionnaire');

  // Auto-start analysis for upgrade questionnaires
  useEffect(() => {
    if (isUpgradeQuestionnaire && analysisStatus === 'idle') {
      startAnalysis();
    }
  }, [isUpgradeQuestionnaire, analysisStatus]);

  const analysisStages: AnalysisStage[] = [
    {
      name: 'Initializing',
      description: 'Setting up analysis environment and validating your responses',
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      estimatedTime: '5-10 seconds'
    },
    {
      name: 'Processing',
      description: 'Analyzing your responses through our AI personality assessment engine',
      icon: <BrainCircuit className="h-4 w-4 text-blue-600" />,
      estimatedTime: '30-45 seconds'
    },
    {
      name: 'Analyzing',
      description: 'Identifying patterns and generating personality insights',
      icon: <Stars className="h-4 w-4 text-purple-600" />,
      estimatedTime: '45-60 seconds'
    },
    {
      name: 'Generating',
      description: 'Creating your personalized college application report',
      icon: <FileText className="h-4 w-4 text-green-600" />,
      estimatedTime: '15-30 seconds'
    },
    {
      name: 'Finalizing',
      description: 'Preparing your comprehensive analysis report',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      estimatedTime: '5-10 seconds'
    }
  ];

  const updateAnalysisStage = (status: AnalysisStatus, progress: number) => {
    setAnalysisStatus(status);
    setAnalysisProgress(progress);
    
    const stageMap: Record<AnalysisStatus, string> = {
      'idle': '',
      'starting': 'Initializing',
      'processing': 'Processing',
      'analyzing': 'Analyzing',
      'generating': 'Generating',
      'finalizing': 'Finalizing',
      'completed': 'Completed',
      'error': 'Error'
    };
    
    setCurrentStage(stageMap[status]);
    
    // Calculate estimated time remaining
    if (status !== 'idle' && status !== 'completed' && status !== 'error') {
      const totalEstimatedTime = 120; // 2 minutes total
      const timeLeft = Math.max(0, totalEstimatedTime - (progress / 100) * totalEstimatedTime);
      setEstimatedTimeLeft(timeLeft > 60 ? `${Math.ceil(timeLeft / 60)} minutes` : `${Math.ceil(timeLeft)} seconds`);
    }
  };

  const startAnalysis = async () => {
    setAnalysisStartTime(Date.now());
    updateAnalysisStage('starting', 10);
    setError(null);

    try {
      // Start streaming analysis
      const response = await fetch(`/api/analysis/${session.sessionId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType: 'comprehensive',
          options: {
            includeRecommendations: true,
            includeCollegeMatches: true,
            includeEssayGuidance: true,
            detailLevel: 'comprehensive',
            generateReport: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start streaming analysis');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body for streaming');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '' || !line.startsWith('data: ')) continue;
            
            try {
              const eventData = JSON.parse(line.substring(6));
              
              if (eventData.type === 'status' || eventData.type === 'progress') {
                updateAnalysisStage(
                  eventData.stage as AnalysisStatus,
                  eventData.progress
                );
                
                if (eventData.reportId) {
                  setReportId(eventData.reportId);
                }
              } else if (eventData.type === 'complete') {
                updateAnalysisStage('completed', 100);
                if (eventData.reportId) {
                  setReportId(eventData.reportId);
                  // Auto-redirect after showing completion
                  setTimeout(() => {
                    router.push(`/reports/${eventData.reportId}`);
                  }, 2000);
                }
              } else if (eventData.type === 'error') {
                throw new Error(eventData.message || 'Analysis failed');
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming event:', line, parseError);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      console.error('Error in streaming analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      updateAnalysisStage('error', 0);
    }
  };

  // Remove polling logic since we're using streaming now
  // This method is no longer needed but kept for compatibility
  const pollAnalysisStatus = async (reportId: string) => {
    console.log('Polling is deprecated, using streaming API instead');
  };

  const handleRetryAnalysis = () => {
    updateAnalysisStage('idle', 0);
    setError(null);
    setCurrentStage('');
    setElapsedTime(0);
    setEstimatedTimeLeft('');
    startAnalysis();
  };

  // Timer effect for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (analysisStatus !== 'idle' && analysisStatus !== 'completed' && analysisStatus !== 'error' && analysisStartTime > 0) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - analysisStartTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analysisStatus, analysisStartTime]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartAIQuestionnaire = async () => {
    if (!aiGeneratedQuestionnaire) return;
    
    setIsLoading(true);
    router.push(`/questionnaire/${aiGeneratedQuestionnaire.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Questionnaire Complete!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for completing the{' '}
            <span className="font-semibold text-primary">{questionnaire.title}</span>.
            Your responses have been saved and are being processed.
          </p>
        </div>

        {/* Session Summary */}
        <div>
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {session.answeredQuestions || 0}
                  </div>
                  <div className="text-sm text-gray-500">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(session.progressPercentage || 0)}%
                  </div>
                  <div className="text-sm text-gray-500">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {session.completedAt 
                      ? Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / (1000 * 60))
                      : 0}
                  </div>
                  <div className="text-sm text-gray-500">Minutes Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {session.sessionId.slice(-6).toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">Session ID</div>
                </div>
              </div>

              {session.completedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                  <Clock className="h-4 w-4" />
                  Completed on {new Date(session.completedAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dify Results for Foundation Questionnaire */}
        {isFoundationQuestionnaire && hasDifyResults && (
          <div>
            <Card className="shadow-lg border-l-4 border-l-purple-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                  AI Analysis Results
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Powered by Dify
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Stars className="h-4 w-4" />
                  <AlertDescription>
                    Based on your foundation questionnaire responses, our AI has generated{' '}
                    <strong>{(session.difyResults as string[]).length} personalized questions</strong>{' '}
                    to help you discover your authentic persona for college applications.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Generated Questions Preview
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(session.difyResults as string[]).slice(0, 3).map((question, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Q{index + 1}:</span> {question}
                        </p>
                      </div>
                    ))}
                    {(session.difyResults as string[]).length > 3 && (
                      <div className="p-3 bg-purple-50 rounded-lg text-center">
                        <p className="text-sm text-purple-700">
                          + {(session.difyResults as string[]).length - 3} more personalized questions
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {aiGeneratedQuestionnaire && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Your Personalized Questionnaire is Ready!
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Continue your persona discovery journey with AI-tailored questions
                        </p>
                      </div>
                      <Button
                        onClick={handleStartAIQuestionnaire}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start AI Questionnaire
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Async Analysis for Upgrade Questionnaires */}
        {isUpgradeQuestionnaire && analysisStatus !== 'idle' && (
          <div>
            <Card className="shadow-lg border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-blue-600" />
                  AI Analysis in Progress
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Powered by Dify
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Stage Status */}
                {analysisStatus !== 'idle' && analysisStatus !== 'error' && (
                  <div className="space-y-4">
                    <Alert className={`${analysisStatus === 'completed' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                      {analysisStages.find(stage => stage.name === currentStage)?.icon || <Loader2 className="h-4 w-4 animate-spin" />}
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">
                            {currentStage === 'Completed' ? 'Analysis Complete!' : `${currentStage}...`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {analysisStages.find(stage => stage.name === currentStage)?.description || 
                             (currentStage === 'Completed' ? 'Your comprehensive personality analysis is ready. Redirecting to your report...' : 'Processing your responses...')}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {/* Error State */}
                {analysisStatus === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-semibold text-red-900">Analysis Error</div>
                        <div className="text-sm text-red-600">
                          {error || 'An error occurred during analysis. Please try again.'}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">Analysis Progress</span>
                    <span className="text-blue-600 font-semibold">{analysisProgress}%</span>
                  </div>
                  <Progress 
                    value={analysisProgress} 
                    className="h-3" 
                  />
                </div>
                
                {/* Time Information */}
                {analysisStatus !== 'idle' && analysisStatus !== 'error' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Elapsed: {formatTime(elapsedTime)}</span>
                    </div>
                    {estimatedTimeLeft && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>Est. remaining: {estimatedTimeLeft}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Stage Timeline */}
                {analysisStatus !== 'idle' && analysisStatus !== 'error' && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Analysis Stages</h4>
                    <div className="space-y-2">
                      {analysisStages.map((stage, index) => {
                        const isCompleted = analysisStatus === 'completed' || 
                          (analysisStages.findIndex(s => s.name === currentStage) > index);
                        const isCurrent = stage.name === currentStage;
                        
                        return (
                          <div key={stage.name} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            isCurrent ? 'bg-blue-50 border border-blue-200' : 
                            isCompleted ? 'bg-green-50 border border-green-200' : 
                            'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className={`flex-shrink-0 ${
                              isCurrent ? 'text-blue-600' : 
                              isCompleted ? 'text-green-600' : 
                              'text-gray-400'
                            }`}>
                              {isCompleted ? <CheckCircle className="h-4 w-4" /> : 
                               isCurrent ? stage.icon : 
                               <div className="h-4 w-4 rounded-full border-2 border-current" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm ${
                                isCurrent ? 'text-blue-900' : 
                                isCompleted ? 'text-green-900' : 
                                'text-gray-600'
                              }`}>
                                {stage.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {stage.description}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 flex-shrink-0">
                              {stage.estimatedTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Processing Notice */}
                {analysisStatus === 'processing' || analysisStatus === 'analyzing' || analysisStatus === 'generating' || analysisStatus === 'finalizing' ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="font-medium">Important Notice</span>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      Please keep this page open during analysis. The process typically takes 2-5 minutes depending on response complexity.
                    </p>
                  </div>
                ) : null}
                
                {analysisStatus === 'error' && (
                  <div className="flex justify-center pt-4">
                    <Button onClick={handleRetryAnalysis} variant="outline" className="bg-red-50 hover:bg-red-100 border-red-200">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Analysis
                    </Button>
                  </div>
                )}
                
                {analysisStatus === 'completed' && reportId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Analysis Completed Successfully!</span>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Your comprehensive personality analysis report has been generated. You will be redirected automatically.
                    </p>
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => router.push(`/reports/${reportId}`)} 
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Report Now
                      </Button>
                      <span className="text-xs text-green-600">Auto-redirecting in 2 seconds...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Next Steps */}
        <div>
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Review Your Insights</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Visit your dashboard to see personalized insights and recommendations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="rounded-full bg-green-100 p-2">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Generate Your Report</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Get a comprehensive persona analysis report for your college applications
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/questionnaire')}
                  className="flex-1"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All Questionnaires
                </Button>
                {!isFoundationQuestionnaire && !isUpgradeQuestionnaire && (
                  <Button
                    onClick={startAnalysis}
                    disabled={analysisStatus === 'processing' || analysisStatus === 'starting'}
                    className="flex-1"
                  >
                    {analysisStatus === 'processing' || analysisStatus === 'starting' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="text-center space-y-4">
          <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-gradient-to-r from-purple-100 to-blue-100 p-3">
                  <Stars className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thank you for using Verisona AI!
              </h3>
              <p className="text-gray-600 mb-4">
                Your responses are helping us create a more personalized college application experience.
                We're here to support your journey to finding the right college fit.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Experience
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Give Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
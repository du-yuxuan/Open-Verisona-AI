'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionnaireForm } from '@/components/questionnaire/questionnaire-form';
import { AccessibleQuestionnaire } from '@/components/accessibility/accessible-questionnaire';
import { useQuestionnaireAnalytics } from '@/lib/hooks/useAnalytics';
import { useEnhancedAnalytics } from '@/lib/hooks/useEnhancedAnalytics';
import { AnalyticsTracker } from '@/components/analytics/analytics-tracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw,
  Sparkles,
  Plus,
  Bot,
  Loader2,
  Eye
} from 'lucide-react';
import { 
  type Question, 
  type Questionnaire, 
  type User,
  type QuestionnaireResponse 
} from '@/lib/db/schema';

interface QuestionnaireClientProps {
  questionnaire: Questionnaire;
  questions: Question[];
  user: User;
}

export default function QuestionnaireClient({ 
  questionnaire, 
  questions: initialQuestions, 
  user 
}: QuestionnaireClientProps) {
  const router = useRouter();
  const [session, setSession] = useState<QuestionnaireResponse | null>(null);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [dynamicQuestionCount, setDynamicQuestionCount] = useState(0);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  // Analytics tracking
  const questionnaireAnalytics = useQuestionnaireAnalytics(
    questionnaire.id,
    session?.sessionId
  );
  const enhancedAnalytics = useEnhancedAnalytics();

  // Check for accessibility preferences on mount
  useEffect(() => {
    const hasAccessibilityPrefs = 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(prefers-contrast: high)').matches ||
      localStorage.getItem('verisona-accessibility-mode') === 'true';
    
    setAccessibilityMode(hasAccessibilityPrefs);
    
    // Track accessibility mode usage
    if (hasAccessibilityPrefs) {
      enhancedAnalytics.trackAccessibilityFeature({
        featureName: 'accessibility_mode',
        enabled: true,
        userType: 'student',
        properties: {
          questionnaireId: questionnaire.id,
          detectedAutomatically: true,
        },
      });
    }
  }, []);

  // Initialize or load existing session
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Start a new questionnaire session
      const response = await fetch(`/api/questionnaires/${questionnaire.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            startedFromPage: window.location.href,
            userAgent: navigator.userAgent,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start questionnaire');
      }

      const data = await response.json();
      setSession(data.session);

      // If continuing existing session, load previous responses
      if (data.session.responses) {
        setResponses(data.session.responses);
      }
    } catch (err) {
      console.error('Failed to initialize session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async (questionId: number, response: any) => {
    if (!session) return;

    try {
      const apiResponse = await fetch(`/api/responses/${session.sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          responseText: typeof response === 'string' ? response : undefined,
          responseValue: typeof response !== 'string' ? response : undefined,
          responseScore: typeof response === 'number' ? response : undefined,
          timeSpentSeconds: 0, // We could implement time tracking here
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to submit response');
      }

      const data = await apiResponse.json();
      
      // Update local responses
      setResponses(prev => ({
        ...prev,
        [questionId]: response
      }));

      // Update session progress if needed
      if (data.progress) {
        setSession(prev => prev ? {
          ...prev,
          answeredQuestions: data.progress.answered,
          progressPercentage: data.progress.percentage,
        } : null);
      }
    } catch (err) {
      console.error('Failed to submit response:', err);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleComplete = async () => {
    if (!session) return;

    try {
      setIsSubmitting(true);

      // Mark session as completed
      const response = await fetch(`/api/responses/${session.sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          responses: responses,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete questionnaire');
      }

      // Check if this is the foundation questionnaire and process with Dify
      if (questionnaire.title === 'Verisona AI Foundation Questionnaire') {
        try {
          const difyResponse = await fetch(`/api/questionnaires/foundation/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: session.sessionId,
              responses: responses,
            }),
          });

          if (!difyResponse.ok) {
            let errorData;
            try {
              errorData = await difyResponse.json();
            } catch (parseError) {
              console.error('Failed to parse Dify error response:', parseError);
              errorData = { error: `HTTP ${difyResponse.status}: ${difyResponse.statusText}` };
            }
            console.error('Dify processing failed:', errorData);
            // Don't throw error - allow completion to continue even if Dify fails
          } else {
            const difyData = await difyResponse.json();
            console.log('Dify processing successful:', difyData);
            
            // Track Dify integration success
            enhancedAnalytics.trackFeatureAdoption('dify_integration', {
              isFirstUse: true,
              usageContext: 'foundation_questionnaire',
              userSegment: 'student',
              properties: {
                questionnaireId: questionnaire.id,
                sessionId: session.sessionId,
                difyResultsCount: difyData.difyResults?.length || 0,
                newQuestionnaireId: difyData.newQuestionnaire?.id,
              },
            });
          }
        } catch (difyError) {
          console.error('Dify integration error:', difyError);
          // Don't throw error - allow completion to continue even if Dify fails
        }
      }
      // Check if this is an upgrade questionnaire (generated by AI)
      else if (questionnaire.title === 'Verisona AI Questionnaire') {
        try {
          setIsSubmitting(true);
          console.log('Starting upgrade questionnaire processing...');
          
          // 设置超时控制 - 230秒超时以配合后端220秒超时
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, 230000); // 230秒超时
          
          const upgradeResponse = await fetch(`/api/questionnaires/upgrade/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              upgradeQuestionnaireId: questionnaire.id,
            }),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          if (!upgradeResponse.ok) {
            let errorData;
            try {
              errorData = await upgradeResponse.json();
            } catch (parseError) {
              console.error('Failed to parse upgrade completion error response:', parseError);
              errorData = { error: `HTTP ${upgradeResponse.status}: ${upgradeResponse.statusText}` };
            }
            
            // 为用户显示特定的错误信息
            if (upgradeResponse.status === 504) {
              setError('分析服务在处理您的回答时超时。请尝试缩短回答或稍后重试。');
            } else if (upgradeResponse.status === 502 || upgradeResponse.status === 503) {
              setError('分析服务暂时不可用。请稍后重试。');
            } else {
              setError('分析服务处理失败。请检查您的回答并重试。');
            }
            
            console.error('Upgrade questionnaire processing failed:', errorData);
            // Don't throw error - allow completion to continue even if processing fails
          } else {
            const upgradeData = await upgradeResponse.json();
            console.log('Upgrade questionnaire processing successful:', upgradeData);
            
            // Track upgrade completion success
            enhancedAnalytics.trackFeatureAdoption('upgrade_questionnaire_completion', {
              isFirstUse: true,
              usageContext: 'upgrade_questionnaire',
              userSegment: 'student',
              properties: {
                questionnaireId: questionnaire.id,
                sessionId: session.sessionId,
                reportId: upgradeData.report?.id,
                analysisGenerated: !!upgradeData.analysisResult,
              },
            });
          }
        } catch (upgradeError) {
          console.error('Upgrade questionnaire integration error:', upgradeError);
          
          // 为网络错误或超时错误给出友好的提示
          if (upgradeError.name === 'AbortError' || upgradeError.message.includes('timeout')) {
            setError('分析服务超时。请稍后重试。');
          } else if (upgradeError.message.includes('NetworkError') || upgradeError.message.includes('fetch')) {
            setError('网络连接问题。请检查您的网络连接并重试。');
          } else {
            setError('分析服务处理失败。请稍后重试。');
          }
          
          // Don't throw error - allow completion to continue even if processing fails
        }
      }

      // Track completion
      questionnaireAnalytics.trackQuestionnaireComplete('completed');
      
      // Track conversion event
      enhancedAnalytics.trackConversion({
        eventName: 'questionnaire_completed',
        conversionType: 'questionnaire_completion',
        value: questions.length,
        properties: {
          questionnaireId: questionnaire.id,
          sessionId: session.sessionId,
          totalQuestions: questions.length,
          dynamicQuestions: dynamicQuestionCount,
          accessibilityMode,
        },
      });
      
      // Redirect to completion page or dashboard
      router.push(`/questionnaire/${questionnaire.id}/complete`);
    } catch (err) {
      console.error('Failed to complete questionnaire:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/responses/${session.sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: responses,
          metadata: {
            lastSaved: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save progress');
      }

      // Could show a toast notification here
      console.log('Progress saved successfully');
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const handleGenerateDynamicQuestion = async () => {
    if (!session || isGeneratingQuestion) return;

    try {
      setIsGeneratingQuestion(true);
      setError(null);

      const response = await fetch(`/api/questionnaires/${questionnaire.id}/dynamic-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          context: {
            currentQuestionCount: questions.length,
            maxQuestions: 50,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate dynamic question');
      }

      const data = await response.json();
      
      // Add the new dynamic question to the questions list
      const newQuestion: Question = {
        id: data.question.id,
        questionnaireId: questionnaire.id,
        questionText: data.question.questionText,
        questionType: data.question.questionType,
        category: data.question.category,
        options: data.question.options,
        isRequired: data.question.isRequired,
        order: data.question.order,
        isAiGenerated: true,
        aiPrompt: data.difyMetadata.reasoning,
        metadata: data.question.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setQuestions(prev => [...prev, newQuestion]);
      setDynamicQuestionCount(prev => prev + 1);
      questionnaireAnalytics.trackDynamicQuestionGenerated();
      
      // Track AI feature usage
      enhancedAnalytics.trackFeatureAdoption('dynamic_question_generation', {
        isFirstUse: dynamicQuestionCount === 0,
        usageContext: 'questionnaire',
        userSegment: 'student',
        properties: {
          questionnaireId: questionnaire.id,
          sessionId: session.sessionId,
          totalDynamicQuestions: dynamicQuestionCount + 1,
        },
      });
    } catch (err) {
      console.error('Failed to generate dynamic question:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate dynamic question');
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Preparing your questionnaire...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Something Went Wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="flex gap-3">
            <Button onClick={initializeSession} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/questionnaire')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questionnaires
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Session Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Unable to create questionnaire session. Please try again.
          </p>
          <Button onClick={() => router.push('/questionnaire')}>
            Back to Questionnaires
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnalyticsTracker
      componentName="questionnaire_form"
      componentType="form"
      userId={user.id}
      userType="student"
      userSegment="general"
      featureName="questionnaire_completion"
      featureCategory="assessment"
      trackPerformance={true}
      trackAccessibility={true}
      accessibilityFeatures={['accessibility_mode', 'high_contrast', 'reduced_motion']}
      customProperties={{
        questionnaireId: questionnaire.id,
        questionnaireTitle: questionnaire.title,
        questionnaireCategory: questionnaire.category,
        totalQuestions: questions.length,
        dynamicQuestions: dynamicQuestionCount,
        sessionId: session?.sessionId,
        accessibilityMode,
      }}
    >
      <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/questionnaire')}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questionnaires
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Session ID: {session.sessionId.slice(-8)}</span>
          </div>
        </div>
        
        {/* Accessibility Toggle */}
        <Button
          variant={accessibilityMode ? "default" : "outline"}
          size="sm"
          onClick={() => {
            const newMode = !accessibilityMode;
            setAccessibilityMode(newMode);
            localStorage.setItem('verisona-accessibility-mode', newMode.toString());
          }}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {accessibilityMode ? 'Accessibility On' : 'Enable Accessibility'}
        </Button>
      </div>

      {/* Dynamic Question Generation */}
      {(questionnaire.type === 'dynamic' || questionnaire.type === 'adaptive') && (
        <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">AI-Powered Insights</h3>
                  <p className="text-xs text-muted-foreground">
                    Generate personalized questions based on your responses
                    {dynamicQuestionCount > 0 && ` • ${dynamicQuestionCount} generated`}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGenerateDynamicQuestion}
                disabled={isGeneratingQuestion || Object.keys(responses).length < 2}
                size="sm"
                className="gap-2"
              >
                {isGeneratingQuestion ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    Generate Question
                  </>
                )}
              </Button>
            </div>
            {Object.keys(responses).length < 2 && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                Answer at least 2 questions to generate personalized questions
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questionnaire Form */}
      {accessibilityMode ? (
        <AccessibleQuestionnaire
          questionnaire={questionnaire}
          questions={questions}
          initialResponses={responses}
          onSubmitResponse={handleSubmitResponse}
          onComplete={handleComplete}
          onSave={handleSaveProgress}
        />
      ) : (
        <QuestionnaireForm
          questionnaire={questionnaire}
          questions={questions}
          initialResponses={responses}
          onSubmitResponse={handleSubmitResponse}
          onComplete={handleComplete}
          onSave={handleSaveProgress}
        />
      )}

      {/* Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Progress saved automatically</span>
              {dynamicQuestionCount > 0 && (
                <>
                  <div className="h-3 w-px bg-border" />
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{dynamicQuestionCount} AI questions generated</span>
                  </div>
                </>
              )}
            </div>
            {(questionnaire.type === 'dynamic' || questionnaire.type === 'adaptive') && (
              <Badge variant="secondary" className="text-xs">
                <Bot className="h-3 w-3 mr-1" />
                AI-Enhanced
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You can return to complete this questionnaire later if needed.
          </p>
        </CardContent>
      </Card>
      </div>
    </AnalyticsTracker>
  );
}
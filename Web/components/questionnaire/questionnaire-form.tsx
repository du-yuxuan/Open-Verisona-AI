'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  Save,
  Sparkles,
  Lightbulb,
  TrendingUp,
  MessageCircle
} from 'lucide-react';

import {
  MultipleChoiceQuestion,
  ScaleQuestion,
  TextQuestion,
  TextareaQuestion,
  BooleanQuestion,
  RankingQuestion
} from './question-types';

import {
  LongTextQuestion,
  // CalendarScheduleQuestion, - Removed: Q2 is now LONG_TEXT
  FileUploadQuestion
} from './verisona-question-types';

import { 
  type Question, 
  type Questionnaire, 
  QuestionType,
  type QuestionnaireProgress 
} from '@/lib/db/schema';

interface QuestionnaireFormProps {
  questionnaire: Questionnaire;
  questions: Question[];
  initialResponses?: Record<number, any>;
  onSubmitResponse: (questionId: number, response: any) => Promise<void>;
  onComplete: () => void;
  onSave?: () => void;
  className?: string;
}

export function QuestionnaireForm({
  questionnaire,
  questions,
  initialResponses = {},
  onSubmitResponse,
  onComplete,
  onSave,
  className
}: QuestionnaireFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, any>>(initialResponses);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Calculate time spent
  const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
  const estimatedTimeRemaining = questionnaire.estimatedDuration 
    ? Math.max(0, (questionnaire.estimatedDuration * 60) - totalTimeSpent)
    : null;

  const handleResponseChange = async (value: any) => {
    const questionId = currentQuestion.id;
    
    // Update local state
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Submit to backend
    try {
      setIsLoading(true);
      await onSubmitResponse(questionId, value);
    } catch (error) {
      console.error('Failed to submit response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextQuestion = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const goToPreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      await onComplete();
    } catch (error) {
      console.error('Failed to complete questionnaire:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        setIsLoading(true);
        await onSave();
      } catch (error) {
        console.error('Failed to save progress:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentResponse = responses[currentQuestion.id];

    const questionProps = {
      question: currentQuestion,
      value: currentResponse,
      onChange: handleResponseChange,
      disabled: isLoading
    };

    switch (currentQuestion.questionType) {
      case QuestionType.MULTIPLE_CHOICE:
        return <MultipleChoiceQuestion {...questionProps} />;
      case QuestionType.SCALE:
        return <ScaleQuestion {...questionProps} />;
      case QuestionType.TEXT:
        return <TextQuestion {...questionProps} />;
      case QuestionType.TEXTAREA:
        return <TextareaQuestion {...questionProps} />;
      case QuestionType.BOOLEAN:
        return <BooleanQuestion {...questionProps} />;
      case QuestionType.RANKING:
        return <RankingQuestion {...questionProps} />;
      case QuestionType.LONG_TEXT:
        return <LongTextQuestion {...questionProps} />;
      case QuestionType.CALENDAR_SCHEDULE:
        // Fallback to LongTextQuestion for legacy questions
        return <LongTextQuestion {...questionProps} />;
      case QuestionType.FILE_UPLOAD:
        return <FileUploadQuestion {...questionProps} />;
      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unknown question type: {currentQuestion.questionType}
            </AlertDescription>
          </Alert>
        );
    }
  };

  const isCurrentQuestionAnswered = () => {
    const response = responses[currentQuestion.id];
    if (!currentQuestion.isRequired) return true;
    
    if (Array.isArray(response)) {
      return response.length > 0;
    }
    
    return response !== undefined && response !== null && response !== '';
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary/20 rounded-full animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-xl">{questionnaire.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {questionnaire.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                {questionnaire.category}
              </Badge>
              {estimatedTimeRemaining !== null && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>~{Math.ceil(estimatedTimeRemaining / 60)} min left</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="font-medium">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <div className="min-h-[400px]">
        {renderQuestion()}
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-start">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={isFirstQuestion || isLoading}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {onSave && (
                <Button
                  variant="ghost"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="rounded-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Answer status indicator */}
              {isCurrentQuestionAnswered() ? (
                <div className="flex items-center gap-1 text-sm text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span>Answered</span>
                </div>
              ) : currentQuestion.isRequired ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Required</span>
                </div>
              ) : null}

              <Button
                onClick={goToNextQuestion}
                disabled={isLoading || (currentQuestion.isRequired && !isCurrentQuestionAnswered())}
                className="rounded-full"
              >
                {isLastQuestion ? (
                  <>
                    Complete
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation Dots */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-center gap-2">
            {questions.map((_, index) => {
              const isAnswered = responses[questions[index].id] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setQuestionStartTime(Date.now());
                  }}
                  disabled={isLoading}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                      : isAnswered
                      ? 'bg-primary/20 text-primary hover:bg-primary/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  MessageCircle,
  Volume2,
  Pause,
  Play,
  Eye,
  EyeOff
} from 'lucide-react';

import {
  announceToScreenReader,
  manageFocus,
  formAccessibility,
  keyboardNavigation,
  colorContrast,
  touchAccessibility
} from '@/lib/accessibility';

import {
  MultipleChoiceQuestion,
  ScaleQuestion,
  TextQuestion,
  TextareaQuestion,
  BooleanQuestion,
  RankingQuestion
} from '../questionnaire/question-types';

import {
  LongTextQuestion,
  // CalendarScheduleQuestion, - Removed: Q2 is now LONG_TEXT
  FileUploadQuestion
} from '../questionnaire/verisona-question-types';

import { 
  type Question, 
  type Questionnaire, 
  QuestionType,
} from '@/lib/db/schema';

interface AccessibleQuestionnaireProps {
  questionnaire: Questionnaire;
  questions: Question[];
  initialResponses?: Record<number, any>;
  onSubmitResponse: (questionId: number, response: any) => Promise<void>;
  onComplete: () => void;
  onSave?: () => void;
  className?: string;
}

export function AccessibleQuestionnaire({
  questionnaire,
  questions,
  initialResponses = {},
  onSubmitResponse,
  onComplete,
  onSave,
  className
}: AccessibleQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, any>>(initialResponses);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // Accessibility states
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);
  
  // Refs for focus management
  const questionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Initialize accessibility features
  useEffect(() => {
    // Detect user preferences
    if (colorContrast.isHighContrastMode()) {
      setHighContrastMode(true);
    }
    
    if (colorContrast.prefersReducedMotion()) {
      setIsSimplifiedMode(true);
    }

    // Add skip link if not present
    if (!document.querySelector('.skip-link')) {
      const skipLink = keyboardNavigation.createSkipLink();
      skipLink.className += ' skip-link';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Announce questionnaire start
    announceToScreenReader(
      `Starting ${questionnaire.title}. This questionnaire has ${questions.length} questions and should take approximately ${questionnaire.estimatedDuration || 10} minutes.`,
      'polite'
    );

    return () => {
      // Cleanup
    };
  }, [questionnaire, questions.length]);

  // Announce question changes
  useEffect(() => {
    if (currentQuestion) {
      const questionNumber = currentQuestionIndex + 1;
      const announcement = `Question ${questionNumber} of ${questions.length}: ${currentQuestion.questionText}`;
      
      announceToScreenReader(announcement, 'polite');
      formAccessibility.announceProgress(questionNumber, questions.length, 'Question');
      
      // Focus management
      setTimeout(() => {
        if (questionRef.current) {
          manageFocus.setFocus(questionRef.current);
        }
      }, 100);
    }
  }, [currentQuestionIndex, currentQuestion, questions.length]);

  // Text-to-speech functionality
  const speakText = (text: string) => {
    if (!textToSpeechEnabled || typeof window === 'undefined') return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  };

  const toggleTextToSpeech = () => {
    setTextToSpeechEnabled(!textToSpeechEnabled);
    if (!textToSpeechEnabled) {
      speakText('Text to speech enabled. Questions will now be read aloud.');
    } else {
      speechSynthesis.cancel();
      announceToScreenReader('Text to speech disabled');
    }
  };

  const pauseResumeQuestionnaire = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      announceToScreenReader('Questionnaire resumed');
    } else {
      announceToScreenReader('Questionnaire paused. Take your time.');
    }
  };

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
      
      // Announce successful save
      announceToScreenReader('Response saved', 'polite');
    } catch (error) {
      console.error('Failed to submit response:', error);
      formAccessibility.announceFormError('response', 'Failed to save response. Please try again.');
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
      announceToScreenReader('Questionnaire completed successfully! Your responses have been saved.', 'assertive');
    } catch (error) {
      console.error('Failed to complete questionnaire:', error);
      formAccessibility.announceFormError('completion', 'Failed to complete questionnaire. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'n':
        if (e.altKey) {
          e.preventDefault();
          goToNextQuestion();
        }
        break;
      case 'ArrowLeft':
      case 'p':
        if (e.altKey) {
          e.preventDefault();
          goToPreviousQuestion();
        }
        break;
      case 's':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (onSave) onSave();
        }
        break;
      case ' ':
        if (e.target === document.body) {
          e.preventDefault();
          pauseResumeQuestionnaire();
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderAccessibilityControls = () => (
    <div className="bg-muted/50 p-4 rounded-lg mb-6">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Eye className="h-4 w-4" />
        Accessibility Options
      </h3>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTextToSpeech}
          aria-pressed={textToSpeechEnabled}
          aria-label={textToSpeechEnabled ? 'Disable text to speech' : 'Enable text to speech'}
        >
          <Volume2 className="h-4 w-4 mr-1" />
          {textToSpeechEnabled ? 'TTS On' : 'TTS Off'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHighContrastMode(!highContrastMode)}
          aria-pressed={highContrastMode}
          aria-label={highContrastMode ? 'Disable high contrast' : 'Enable high contrast'}
        >
          {highContrastMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          High Contrast
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={pauseResumeQuestionnaire}
          aria-pressed={isPaused}
          aria-label={isPaused ? 'Resume questionnaire' : 'Pause questionnaire'}
        >
          {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          aria-label="Text size"
          className="px-2 py-1 text-sm border rounded"
        >
          <option value="small">Small Text</option>
          <option value="normal">Normal Text</option>
          <option value="large">Large Text</option>
          <option value="xl">Extra Large Text</option>
        </select>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        Keyboard shortcuts: Alt+N (next), Alt+P (previous), Ctrl+S (save), Space (pause)
      </div>
    </div>
  );

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentResponse = responses[currentQuestion.id];

    const questionProps = {
      question: currentQuestion,
      value: currentResponse,
      onChange: handleResponseChange,
      disabled: isLoading || isPaused
    };

    // Read question aloud when text-to-speech is enabled
    useEffect(() => {
      if (textToSpeechEnabled && currentQuestion) {
        const questionText = `Question ${currentQuestionIndex + 1}: ${currentQuestion.questionText}`;
        speakText(questionText);
      }
    }, [currentQuestion, textToSpeechEnabled]);

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
    const response = responses[currentQuestion?.id];
    if (!currentQuestion) return false;
    
    if (currentQuestion.isRequired) {
      return response !== undefined && response !== null && response !== '';
    }
    return true;
  };

  return (
    <div 
      className={`w-full max-w-4xl mx-auto p-6 ${
        highContrastMode ? 'high-contrast' : ''
      } ${
        fontSize === 'large' ? 'text-lg' : 
        fontSize === 'xl' ? 'text-xl' : 
        fontSize === 'small' ? 'text-sm' : ''
      } ${className || ''}`}
      data-accessibility-enabled="true"
    >
      {/* Skip to content anchor */}
      <div id="main-content" tabIndex={-1}>
        {/* Accessibility Controls */}
        {renderAccessibilityControls()}

        {/* Progress Section */}
        <div ref={progressRef} className="mb-8" role="region" aria-label="Progress">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {questionnaire.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            <Badge variant="secondary" className="text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {Math.floor((Date.now() - startTime) / 1000 / 60)}m
            </Badge>
          </div>
          
          <Progress 
            value={progress} 
            className="h-3"
            aria-label={`Progress: ${Math.round(progress)}% complete`}
          />
          <div className="text-sm text-muted-foreground mt-2">
            {Math.round(progress)}% complete
          </div>
        </div>

        {/* Question Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle 
                  ref={questionRef}
                  className="text-xl mb-3"
                  role="heading"
                  aria-level={2}
                  tabIndex={-1}
                >
                  {currentQuestion?.questionText}
                </CardTitle>
                
                {currentQuestion?.category && (
                  <Badge variant="outline" className="mb-4">
                    {currentQuestion.category}
                  </Badge>
                )}
              </div>
              
              {currentQuestion?.isRequired && (
                <Badge variant="destructive" className="ml-4" aria-label="Required question">
                  Required
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {!isPaused ? (
              <div role="main" aria-live="polite">
                {renderQuestion()}
              </div>
            ) : (
              <Alert>
                <Pause className="h-4 w-4" />
                <AlertDescription>
                  Questionnaire is paused. Click Resume or press Space to continue.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Navigation Section */}
        <div 
          ref={navigationRef} 
          className="flex items-center justify-between"
          role="navigation"
          aria-label="Question navigation"
        >
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={isFirstQuestion || isLoading || isPaused}
            aria-label="Previous question"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {onSave && (
              <Button
                variant="outline"
                onClick={onSave}
                disabled={isLoading || isPaused}
                aria-label="Save progress"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
            )}
          </div>

          <Button
            onClick={goToNextQuestion}
            disabled={isLoading || isPaused || (currentQuestion?.isRequired === true && !isCurrentQuestionAnswered())}
            aria-label={isLastQuestion ? 'Complete questionnaire' : 'Next question'}
          >
            {isLastQuestion ? 'Complete' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Accessibility Information */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p>
            <strong>Need help?</strong> This questionnaire supports screen readers, keyboard navigation, and text-to-speech. 
            Use the accessibility controls above to customize your experience.
          </p>
        </div>
      </div>
    </div>
  );
}
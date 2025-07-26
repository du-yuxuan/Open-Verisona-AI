'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { type Question, QuestionType } from '@/lib/db/schema';

interface QuestionComponentProps {
  question: Question;
  value?: any;
  onChange: (value: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

// Multiple Choice Component
export function MultipleChoiceQuestion({ 
  question, 
  value = [], 
  onChange, 
  onNext, 
  onPrevious, 
  showNavigation = true,
  isLoading = false 
}: QuestionComponentProps) {
  const options = question.options as { choices: Array<{value: string | number, label: string, description?: string}>, allowMultiple?: boolean };
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(value) ? value.map(String) : value ? [String(value)] : []
  );

  const handleSingleSelect = (newValue: string) => {
    const values = [newValue];
    setSelectedValues(values);
    onChange(options.allowMultiple ? values : newValue);
  };

  const handleMultipleSelect = (optionValue: string, checked: boolean) => {
    const newValues = checked 
      ? [...selectedValues, optionValue]
      : selectedValues.filter(v => v !== optionValue);
    
    setSelectedValues(newValues);
    onChange(newValues);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {question.questionText}
            </h3>
            {question.isRequired && (
              <p className="text-sm text-muted-foreground mb-4">* Required</p>
            )}
          </div>

          {options.allowMultiple ? (
            <div className="space-y-3">
              {options.choices.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={`option-${option.value}`}
                    checked={selectedValues.includes(String(option.value))}
                    onCheckedChange={(checked) => 
                      handleMultipleSelect(String(option.value), checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`option-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    {option.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={selectedValues[0] || ''}
              onValueChange={handleSingleSelect}
              disabled={isLoading}
            >
              {options.choices.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem
                    id={`option-${option.value}`}
                    value={String(option.value)}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`option-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    {option.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Scale/Slider Component
export function ScaleQuestion({ 
  question, 
  value, 
  onChange, 
  isLoading = false 
}: QuestionComponentProps) {
  const scaleConfig = question.options as { scale: { min: number, max: number, step?: number, labels?: Record<number, string> } };
  const [currentValue, setCurrentValue] = useState<number>(
    typeof value === 'number' ? value : scaleConfig.scale.min
  );

  const handleValueChange = (newValue: number[]) => {
    const val = newValue[0];
    setCurrentValue(val);
    onChange(val);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {question.questionText}
            </h3>
            {question.isRequired && (
              <p className="text-sm text-muted-foreground mb-4">* Required</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={[currentValue]}
                onValueChange={handleValueChange}
                min={scaleConfig.scale.min}
                max={scaleConfig.scale.max}
                step={scaleConfig.scale.step || 1}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground px-2">
              <span>{scaleConfig.scale.labels?.[scaleConfig.scale.min] || scaleConfig.scale.min}</span>
              <span className="font-medium text-primary">{currentValue}</span>
              <span>{scaleConfig.scale.labels?.[scaleConfig.scale.max] || scaleConfig.scale.max}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Text Input Component
export function TextQuestion({ 
  question, 
  value = '', 
  onChange, 
  isLoading = false 
}: QuestionComponentProps) {
  const [inputValue, setInputValue] = useState<string>(String(value || ''));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {question.questionText}
            </h3>
            {question.isRequired && (
              <p className="text-sm text-muted-foreground mb-4">* Required</p>
            )}
          </div>

          <div>
            <Input
              value={inputValue}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your answer..."
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Textarea Component
export function TextareaQuestion({ 
  question, 
  value = '', 
  onChange, 
  isLoading = false 
}: QuestionComponentProps) {
  const [inputValue, setInputValue] = useState<string>(String(value || ''));

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {question.questionText}
            </h3>
            {question.isRequired && (
              <p className="text-sm text-muted-foreground mb-4">* Required</p>
            )}
          </div>

          <div>
            <Textarea
              value={inputValue}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your detailed answer..."
              className="w-full min-h-[120px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Boolean/Yes-No Component
export function BooleanQuestion({ 
  question, 
  value, 
  onChange, 
  isLoading = false 
}: QuestionComponentProps) {
  const [selectedValue, setSelectedValue] = useState<boolean | null>(
    typeof value === 'boolean' ? value : null
  );

  const handleSelect = (newValue: boolean) => {
    setSelectedValue(newValue);
    onChange(newValue);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {question.questionText}
            </h3>
            {question.isRequired && (
              <p className="text-sm text-muted-foreground mb-4">* Required</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              variant={selectedValue === true ? "default" : "outline"}
              onClick={() => handleSelect(true)}
              disabled={isLoading}
              className="flex-1"
            >
              Yes
            </Button>
            <Button
              variant={selectedValue === false ? "default" : "outline"}
              onClick={() => handleSelect(false)}
              disabled={isLoading}
              className="flex-1"
            >
              No
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Ranking Component
export function RankingQuestion({ 
  question, 
  value = [], 
  onChange, 
  isLoading = false 
}: QuestionComponentProps) {
  const options = question.options as { choices: Array<{value: string | number, label: string}> };
  const [rankedItems, setRankedItems] = useState<string[]>(
    Array.isArray(value) ? value.map(String) : []
  );

  const handleRankChange = (item: string, newRank: number) => {
    const newRanking = [...rankedItems];
    const currentIndex = newRanking.indexOf(item);
    
    if (currentIndex !== -1) {
      newRanking.splice(currentIndex, 1);
    }
    
    newRanking.splice(newRank, 0, item);
    setRankedItems(newRanking);
    onChange(newRanking);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {question.questionText}
            </h3>
            {question.isRequired && (
              <p className="text-sm text-muted-foreground mb-4">* Required</p>
            )}
            <p className="text-sm text-muted-foreground">
              Drag to reorder or click to select ranking
            </p>
          </div>

          <div className="space-y-2">
            {options.choices.map((option, index) => (
              <div
                key={option.value}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => handleRankChange(String(option.value), rankedItems.length)}
              >
                <span className="font-medium text-sm w-6">
                  {rankedItems.indexOf(String(option.value)) + 1 || '-'}
                </span>
                <span className="flex-1">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
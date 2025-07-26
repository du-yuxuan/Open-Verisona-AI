'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  announceToScreenReader, 
  formAccessibility,
  touchAccessibility 
} from '@/lib/accessibility';

// Accessible Input Component
interface AccessibleInputProps extends React.ComponentProps<typeof Input> {
  label: string;
  helpText?: string;
  error?: string;
  success?: string;
  showPasswordToggle?: boolean;
  characterLimit?: number;
  required?: boolean;
}

export function AccessibleInput({
  label,
  helpText,
  error,
  success,
  showPasswordToggle = false,
  characterLimit,
  required = false,
  id,
  className,
  ...props
}: AccessibleInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      touchAccessibility.ensureMinTouchTarget(inputRef.current);
    }
  }, []);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCharacterCount(value.length);
    
    if (characterLimit && value.length > characterLimit) {
      announceToScreenReader(`Character limit exceeded. ${value.length} of ${characterLimit} characters used.`, 'assertive');
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    announceToScreenReader(showPassword ? 'Password hidden' : 'Password visible', 'polite');
    
    // Maintain focus after toggle
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const getAriaDescribedBy = () => {
    const describedBy = [];
    if (helpText) describedBy.push(helpId);
    if (error) describedBy.push(errorId);
    return describedBy.length > 0 ? describedBy.join(' ') : undefined;
  };

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={inputId}
        className={`block text-sm font-medium ${error ? 'text-destructive' : 'text-foreground'}`}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">*</span>
        )}
      </Label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          id={inputId}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : props.type}
          className={`${className || ''} ${error ? 'border-destructive focus:ring-destructive' : ''} ${
            success ? 'border-green-500 focus:ring-green-500' : ''
          }`}
          aria-describedby={getAriaDescribedBy()}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          onChange={handleValueChange}
          {...props}
        />
        
        {showPasswordToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
        
        {success && (
          <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
      </div>
      
      {/* Help Text */}
      {helpText && (
        <div id={helpId} className="text-sm text-muted-foreground flex items-start gap-1">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{helpText}</span>
        </div>
      )}
      
      {/* Character Counter */}
      {characterLimit && (
        <div className="text-sm text-muted-foreground text-right">
          <span 
            className={characterCount > characterLimit ? 'text-destructive' : ''}
            aria-live="polite"
          >
            {characterCount}/{characterLimit}
          </span>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div id={errorId} className="text-sm text-destructive flex items-start gap-1" role="alert">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="text-sm text-green-600 flex items-start gap-1" role="status">
          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

// Accessible Textarea Component
interface AccessibleTextareaProps extends React.ComponentProps<typeof Textarea> {
  label: string;
  helpText?: string;
  error?: string;
  success?: string;
  characterLimit?: number;
  required?: boolean;
}

export function AccessibleTextarea({
  label,
  helpText,
  error,
  success,
  characterLimit,
  required = false,
  id,
  className,
  ...props
}: AccessibleTextareaProps) {
  const [characterCount, setCharacterCount] = useState(0);
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = `${textareaId}-help`;
  const errorId = `${textareaId}-error`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      touchAccessibility.ensureMinTouchTarget(textareaRef.current);
    }
  }, []);

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharacterCount(value.length);
    
    if (characterLimit && value.length > characterLimit) {
      announceToScreenReader(`Character limit exceeded. ${value.length} of ${characterLimit} characters used.`, 'assertive');
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const getAriaDescribedBy = () => {
    const describedBy = [];
    if (helpText) describedBy.push(helpId);
    if (error) describedBy.push(errorId);
    return describedBy.length > 0 ? describedBy.join(' ') : undefined;
  };

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={textareaId}
        className={`block text-sm font-medium ${error ? 'text-destructive' : 'text-foreground'}`}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">*</span>
        )}
      </Label>
      
      <Textarea
        ref={textareaRef}
        id={textareaId}
        className={`${className || ''} ${error ? 'border-destructive focus:ring-destructive' : ''} ${
          success ? 'border-green-500 focus:ring-green-500' : ''
        }`}
        aria-describedby={getAriaDescribedBy()}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        onChange={handleValueChange}
        {...props}
      />
      
      {/* Help Text */}
      {helpText && (
        <div id={helpId} className="text-sm text-muted-foreground flex items-start gap-1">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{helpText}</span>
        </div>
      )}
      
      {/* Character Counter */}
      {characterLimit && (
        <div className="text-sm text-muted-foreground text-right">
          <span 
            className={characterCount > characterLimit ? 'text-destructive' : ''}
            aria-live="polite"
          >
            {characterCount}/{characterLimit}
          </span>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div id={errorId} className="text-sm text-destructive flex items-start gap-1" role="alert">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="text-sm text-green-600 flex items-start gap-1" role="status">
          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

// Accessible Select Component
interface AccessibleSelectProps {
  label: string;
  helpText?: string;
  error?: string;
  success?: string;
  required?: boolean;
  id?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function AccessibleSelect({
  label,
  helpText,
  error,
  success,
  required = false,
  id,
  placeholder,
  value,
  onValueChange,
  children
}: AccessibleSelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = `${selectId}-help`;
  const errorId = `${selectId}-error`;

  const getAriaDescribedBy = () => {
    const describedBy = [];
    if (helpText) describedBy.push(helpId);
    if (error) describedBy.push(errorId);
    return describedBy.length > 0 ? describedBy.join(' ') : undefined;
  };

  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    announceToScreenReader(`Selected: ${newValue}`, 'polite');
  };

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={selectId}
        className={`block text-sm font-medium ${error ? 'text-destructive' : 'text-foreground'}`}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">*</span>
        )}
      </Label>
      
      <Select
        value={value}
        onValueChange={handleValueChange}
      >
        <SelectTrigger
          id={selectId}
          className={`${error ? 'border-destructive focus:ring-destructive' : ''} ${
            success ? 'border-green-500 focus:ring-green-500' : ''
          }`}
          aria-describedby={getAriaDescribedBy()}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      
      {/* Help Text */}
      {helpText && (
        <div id={helpId} className="text-sm text-muted-foreground flex items-start gap-1">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{helpText}</span>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div id={errorId} className="text-sm text-destructive flex items-start gap-1" role="alert">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="text-sm text-green-600 flex items-start gap-1" role="status">
          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

// Accessible Checkbox Component
interface AccessibleCheckboxProps {
  label: string;
  helpText?: string;
  error?: string;
  success?: string;
  required?: boolean;
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function AccessibleCheckbox({
  label,
  helpText,
  error,
  success,
  required = false,
  id,
  checked,
  onCheckedChange
}: AccessibleCheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = `${checkboxId}-help`;
  const errorId = `${checkboxId}-error`;

  const getAriaDescribedBy = () => {
    const describedBy = [];
    if (helpText) describedBy.push(helpId);
    if (error) describedBy.push(errorId);
    return describedBy.length > 0 ? describedBy.join(' ') : undefined;
  };

  const handleCheckedChange = (newChecked: boolean) => {
    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
    announceToScreenReader(`${label} ${newChecked ? 'checked' : 'unchecked'}`, 'polite');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <Checkbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          aria-describedby={getAriaDescribedBy()}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          className={`mt-0.5 ${error ? 'border-destructive' : ''}`}
        />
        <div className="space-y-1">
          <Label 
            htmlFor={checkboxId}
            className={`text-sm font-medium cursor-pointer ${error ? 'text-destructive' : 'text-foreground'}`}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-label="required">*</span>
            )}
          </Label>
          
          {/* Help Text */}
          {helpText && (
            <div id={helpId} className="text-sm text-muted-foreground flex items-start gap-1">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{helpText}</span>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div id={errorId} className="text-sm text-destructive flex items-start gap-1" role="alert">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="text-sm text-green-600 flex items-start gap-1" role="status">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Accessible Radio Group Component
interface AccessibleRadioGroupProps {
  label: string;
  helpText?: string;
  error?: string;
  success?: string;
  required?: boolean;
  id?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string }>;
}

export function AccessibleRadioGroup({
  label,
  helpText,
  error,
  success,
  required = false,
  id,
  value,
  onValueChange,
  options
}: AccessibleRadioGroupProps) {
  const radioGroupId = id || `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = `${radioGroupId}-help`;
  const errorId = `${radioGroupId}-error`;

  const getAriaDescribedBy = () => {
    const describedBy = [];
    if (helpText) describedBy.push(helpId);
    if (error) describedBy.push(errorId);
    return describedBy.length > 0 ? describedBy.join(' ') : undefined;
  };

  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    const selectedOption = options.find(opt => opt.value === newValue);
    announceToScreenReader(`Selected: ${selectedOption?.label || newValue}`, 'polite');
  };

  return (
    <fieldset className="space-y-3">
      <legend className={`text-sm font-medium ${error ? 'text-destructive' : 'text-foreground'}`}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">*</span>
        )}
      </legend>
      
      <RadioGroup
        value={value}
        onValueChange={handleValueChange}
        aria-describedby={getAriaDescribedBy()}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-start space-x-3">
            <RadioGroupItem 
              value={option.value} 
              id={`${radioGroupId}-${option.value}`}
              className={`mt-0.5 ${error ? 'border-destructive' : ''}`}
            />
            <div className="space-y-1">
              <Label 
                htmlFor={`${radioGroupId}-${option.value}`}
                className="text-sm font-medium cursor-pointer"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      
      {/* Help Text */}
      {helpText && (
        <div id={helpId} className="text-sm text-muted-foreground flex items-start gap-1">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{helpText}</span>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div id={errorId} className="text-sm text-destructive flex items-start gap-1" role="alert">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="text-sm text-green-600 flex items-start gap-1" role="status">
          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </fieldset>
  );
}
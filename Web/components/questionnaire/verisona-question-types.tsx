'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Calendar, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Info
} from 'lucide-react';
import { type Question } from '@/lib/db/schema';

interface BaseQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

// Long text question component
export function LongTextQuestion({ question, value, onChange, disabled }: BaseQuestionProps) {
  const [charCount, setCharCount] = useState(value?.length || 0);
  const metadata = question.metadata as any;
  const minLength = metadata?.minLength || 0;
  const maxLength = metadata?.maxLength || 1000;
  const placeholder = metadata?.placeholder || 'Please enter your answer...';
  const tips = metadata?.tips || [];

  const handleChange = (text: string) => {
    setCharCount(text.length);
    onChange(text);
  };

  const isValid = charCount >= minLength && charCount <= maxLength;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {question.questionText}
        </h3>
        
        {tips.length > 0 && (
          <Alert className="border-[var(--color-earth)]/20 bg-[var(--color-cream)]">
            <Info className="h-4 w-4 text-[var(--color-earth)]" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-[var(--color-text)]">Writing Tips:</p>
                <ul className="text-sm text-[var(--color-text)]/70 space-y-1">
                  {tips.map((tip: string, index: number) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="min-h-[200px] resize-none border-[var(--color-earth)]/20 focus:border-[var(--color-earth)] focus:ring-[var(--color-earth)]/20"
          rows={8}
        />
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span className={`${isValid ? 'text-green-600' : 'text-amber-600'}`}>
              {charCount < minLength 
                ? `Need at least ${minLength - charCount} more characters`
                : `Character count: ${charCount}`
              }
            </span>
          </div>
          
          <span className="text-[var(--color-text)]/60">
            {charCount}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}

// Calendar/schedule question component
export function CalendarScheduleQuestion({ question, value, onChange, disabled }: BaseQuestionProps) {
  const metadata = question.metadata as any;
  const activities = metadata?.activities || [];
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [schedule, setSchedule] = useState(value || {
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {}
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayLabels = {
    Monday: 'Monday',
    Tuesday: 'Tuesday',
    Wednesday: 'Wednesday',
    Thursday: 'Thursday',
    Friday: 'Friday',
    Saturday: 'Saturday',
    Sunday: 'Sunday'
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleScheduleChange = (day: string, hour: number, activity: string) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        [hour]: activity
      }
    };
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const getActivityColor = (activity: string) => {
    const colors = {
      'School/Classes': 'bg-blue-100 border-blue-300 text-blue-800',
      'Sleep': 'bg-purple-100 border-purple-300 text-purple-800',
      'Homework/Study': 'bg-green-100 border-green-300 text-green-800',
      'Extracurricular Activities': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'Family Time': 'bg-pink-100 border-pink-300 text-pink-800',
      'Work/Internship': 'bg-orange-100 border-orange-300 text-orange-800',
      'Chores': 'bg-gray-100 border-gray-300 text-gray-800',
      'Free Time/Entertainment': 'bg-indigo-100 border-indigo-300 text-indigo-800',
      'Sports/Exercise': 'bg-red-100 border-red-300 text-red-800',
      'Social Activities': 'bg-emerald-100 border-emerald-300 text-emerald-800'
    };
    return colors[activity] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {question.questionText}
        </h3>
        
        <Alert className="border-[var(--color-earth)]/20 bg-[var(--color-cream)]">
          <Calendar className="h-4 w-4 text-[var(--color-earth)]" />
          <AlertDescription>
            <p className="text-sm text-[var(--color-text)]/70">
              Please mark your typical weekly schedule in the timetable below. Click on time slots and select the corresponding activity type.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      {/* Activity type legend */}
      <div className="space-y-2">
        <h4 className="font-medium text-[var(--color-text)]">Activity Types:</h4>
        <div className="flex flex-wrap gap-2">
          {activities.map((activity: string) => (
            <Badge 
              key={activity} 
              variant="outline"
              className={`${getActivityColor(activity)} text-xs`}
            >
              {activity}
            </Badge>
          ))}
        </div>
      </div>

      {/* Date selector */}
      <div className="space-y-2">
        <h4 className="font-medium text-[var(--color-text)]">Select Date:</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map(day => (
            <Button
              key={day}
              variant={selectedDay === day ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDay(day)}
              className={`whitespace-nowrap ${
                selectedDay === day 
                  ? 'bg-[var(--color-earth)] hover:bg-[var(--color-earth)]/90' 
                  : 'border-[var(--color-earth)]/20 hover:bg-[var(--color-earth)]/10'
              }`}
            >
              {dayLabels[day]}
            </Button>
          ))}
        </div>
      </div>

      {/* Time table */}
      <div className="space-y-3">
        <h4 className="font-medium text-[var(--color-text)]">
          {dayLabels[selectedDay]} Schedule:
        </h4>
        
        <div className="grid grid-cols-12 gap-1 text-xs">
          {hours.map(hour => (
            <div key={hour} className="space-y-1">
              <div className="text-center font-medium text-[var(--color-text)]/60">
                {hour.toString().padStart(2, '0')}:00
              </div>
              
              <select
                value={schedule[selectedDay]?.[hour] || ''}
                onChange={(e) => handleScheduleChange(selectedDay, hour, e.target.value)}
                disabled={disabled}
                className={`
                  w-full h-8 text-xs border rounded
                  ${schedule[selectedDay]?.[hour] 
                    ? getActivityColor(schedule[selectedDay][hour])
                    : 'bg-gray-50 border-gray-200'
                  }
                  focus:outline-none focus:ring-1 focus:ring-[var(--color-earth)]
                `}
              >
                <option value="">Select Activity</option>
                {activities.map((activity: string) => (
                  <option key={activity} value={activity}>
                    {activity}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// File upload question component
export function FileUploadQuestion({ question, value, onChange, disabled }: BaseQuestionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const metadata = question.metadata as any;
  const acceptedTypes = metadata?.acceptedFileTypes || ['.pdf', '.jpg', '.jpeg', '.png'];
  const maxFileSize = metadata?.maxFileSize || 5242880; // 5MB
  const maxFiles = metadata?.maxFiles || 3;
  const instructions = metadata?.instructions || [];
  
  // Changed from File[] to uploaded file info
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
  }>>(value || []);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length === 0) return;
    
    // Validate files
    const validFiles = selectedFiles.filter(file => {
      const isValidType = acceptedTypes.some(type => 
        file.name.toLowerCase().endsWith(type.toLowerCase())
      );
      const isValidSize = file.size <= maxFileSize;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      setUploadStatus('Some files do not meet requirements and have been automatically filtered');
    } else {
      setUploadStatus('');
    }

    // Check if adding these files would exceed the limit
    const totalFiles = uploadedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      setUploadStatus(`Cannot upload more than ${maxFiles} files. Please remove some files first.`);
      return;
    }

    // Upload files to server
    setIsUploading(true);
    const newUploadedFiles = [...uploadedFiles];
    
    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        
        const result = await response.json();
        newUploadedFiles.push(result.file);
        
      } catch (error) {
        console.error('File upload error:', error);
        setUploadStatus(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    setUploadedFiles(newUploadedFiles);
    onChange(newUploadedFiles);
    setIsUploading(false);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {question.questionText}
        </h3>
        
        {instructions.length > 0 && (
          <Alert className="border-[var(--color-earth)]/20 bg-[var(--color-cream)]">
            <FileText className="h-4 w-4 text-[var(--color-earth)]" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-[var(--color-text)]">Upload Requirements:</p>
                <ul className="text-sm text-[var(--color-text)]/70 space-y-1">
                  {instructions.map((instruction: string, index: number) => (
                    <li key={index}>• {instruction}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* File upload area */}
      <div className="space-y-4">
        <div 
          className={`border-2 border-dashed border-[var(--color-earth)]/30 rounded-lg p-8 text-center hover:border-[var(--color-earth)]/50 transition-colors cursor-pointer ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <Upload className={`h-12 w-12 text-[var(--color-earth)] mx-auto mb-4 ${
            isUploading ? 'animate-pulse' : ''
          }`} />
          <p className="text-lg font-medium text-[var(--color-text)] mb-2">
            {isUploading ? 'Uploading files...' : 'Click to select files or drag and drop files here'}
          </p>
          <p className="text-sm text-[var(--color-text)]/60">
            Supported formats: {acceptedTypes.join(', ')} | Maximum file size: {formatFileSize(maxFileSize)} | Maximum {maxFiles} files
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {uploadStatus && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadStatus}</AlertDescription>
          </Alert>
        )}
        
        {isUploading && (
          <Alert>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <AlertDescription>Uploading files, please wait...</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--color-text)]">Uploaded Files:</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[var(--color-cream)] rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[var(--color-earth)]" />
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{file.name}</p>
                    <p className="text-sm text-[var(--color-text)]/60">
                      {formatFileSize(file.size)} • Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={disabled || isUploading}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
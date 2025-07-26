'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, ArrowRight, ArrowLeft, GraduationCap, User, Check } from 'lucide-react';
import { enhancedSignUp } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  graduationYear: number | null;
  schoolName: string;
}

export function EnhancedSignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    graduationYear: null,
    schoolName: '',
  });

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    enhancedSignUp,
    { error: '' }
  );

  const updateFormData = (field: keyof SignUpData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const canProceedStep1 = formData.email && formData.password.length >= 8;
  const canProceedStep2 = formData.firstName && formData.lastName;

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <Sparkles className="h-12 w-12 text-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary/20 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Start Your Authentic Journey
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Join thousands of students finding their authentic path to college success
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > stepNumber ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-8 h-0.5 ${
                      step > stepNumber ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-muted-foreground">
              Step {step} of 3
            </span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {step === 1 && <User className="h-5 w-5 text-primary" />}
              {step === 2 && <GraduationCap className="h-5 w-5 text-primary" />}
              {step === 3 && <Check className="h-5 w-5 text-primary" />}
              {step === 1 && 'Account Details'}
              {step === 2 && 'Student Information'}
              {step === 3 && 'Review & Complete'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Create your secure Verisona AI account'}
              {step === 2 && 'Tell us about your academic journey'}
              {step === 3 && 'Ready to discover your authentic voice?'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="rounded-lg"
                    required
                    aria-describedby="email-error"
                    aria-invalid={state.error?.includes('email') ? 'true' : 'false'}
                  />
                  {state.error?.includes('email') && (
                    <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
                      Please enter a valid email address
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="rounded-lg"
                    minLength={8}
                    required
                    aria-describedby="password-help password-error"
                    aria-invalid={state.error?.includes('password') ? 'true' : 'false'}
                  />
                  <p id="password-help" className="text-sm text-muted-foreground mt-1">
                    Must be at least 8 characters long
                  </p>
                  {state.error?.includes('password') && (
                    <p id="password-error" className="text-sm text-destructive mt-1" role="alert">
                      Password is required and must be at least 8 characters
                    </p>
                  )}
                </div>
                <Button 
                  onClick={nextStep} 
                  disabled={!canProceedStep1}
                  className="w-full rounded-full"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Your first name"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Your last name"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="graduationYear">Expected Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    placeholder="e.g., 2025"
                    value={formData.graduationYear || ''}
                    onChange={(e) => updateFormData('graduationYear', parseInt(e.target.value) || null)}
                    className="rounded-lg"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                  />
                </div>
                <div>
                  <Label htmlFor="schoolName">Current School (Optional)</Label>
                  <Input
                    id="schoolName"
                    type="text"
                    placeholder="Your current high school"
                    value={formData.schoolName}
                    onChange={(e) => updateFormData('schoolName', e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    className="flex-1 rounded-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={!canProceedStep2}
                    className="flex-1 rounded-full"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form action={formAction} className="space-y-6">
                {/* Hidden fields for form data */}
                <input type="hidden" name="email" value={formData.email} />
                <input type="hidden" name="password" value={formData.password} />
                <input type="hidden" name="firstName" value={formData.firstName} />
                <input type="hidden" name="lastName" value={formData.lastName} />
                <input type="hidden" name="graduationYear" value={formData.graduationYear || ''} />
                <input type="hidden" name="schoolName" value={formData.schoolName} />

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3">Review Your Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground">{formData.firstName} {formData.lastName}</span>
                    </div>
                    {formData.graduationYear && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Graduation:</span>
                        <span className="text-foreground">{formData.graduationYear}</span>
                      </div>
                    )}
                    {formData.schoolName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">School:</span>
                        <span className="text-foreground">{formData.schoolName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {state?.error && (
                  <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                    {state.error}
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={prevStep}
                    className="flex-1 rounded-full"
                    disabled={pending}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 rounded-full"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <GraduationCap className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {step < 3 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/sign-in" className="text-primary hover:underline font-medium">
                Sign in here
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
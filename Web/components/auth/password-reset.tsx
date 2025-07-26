'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Mail, ArrowLeft, Check } from 'lucide-react';
import { requestPasswordReset } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';
import Link from 'next/link';

export function PasswordReset() {
  const [emailSent, setEmailSent] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestPasswordReset,
    { error: '' }
  );

  // If successful, show success message
  if (state?.success) {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Check Your Email
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or try again in a few minutes.
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full"
                  >
                    <Link href="/sign-in">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="ghost"
                    className="rounded-full text-sm"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            Reset Your Password
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Password Reset
            </CardTitle>
            <CardDescription>
              We'll send you a secure link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  className="rounded-lg"
                  required
                />
              </div>

              {state?.error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                  {state.error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <Mail className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
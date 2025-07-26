'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, User, GraduationCap, Save, Check } from 'lucide-react';
import { updateProfile } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';
import { User as UserType } from '@/lib/db/schema';

interface ProfileFormProps {
  user: UserType;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateProfile,
    { error: '' }
  );

  // If successful, show success message
  if (state?.success) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Profile Updated Successfully!
              </h3>
              <p className="text-muted-foreground mb-4">
                Your profile has been updated. This will help us provide better personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="rounded-full">
                  <a href="/dashboard">
                    Go to Dashboard
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="rounded-full"
                >
                  Edit Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Basic information about yourself
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  defaultValue={user.firstName || ''}
                  placeholder="Your first name"
                  className="rounded-lg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  defaultValue={user.lastName || ''}
                  placeholder="Your last name"
                  className="rounded-lg"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                className="rounded-lg bg-muted"
                disabled
              />
              <p className="text-sm text-muted-foreground mt-1">
                Email cannot be changed. Contact support if you need to update it.
              </p>
            </div>

            {/* Academic Information */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-secondary" />
                <h3 className="text-lg font-semibold text-foreground">Academic Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="graduationYear">Expected Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    defaultValue={user.graduationYear || ''}
                    placeholder="e.g., 2025"
                    className="rounded-lg"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                  />
                </div>
                <div>
                  <Label htmlFor="schoolName">Current School</Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    type="text"
                    defaultValue={user.schoolName || ''}
                    placeholder="Your current high school"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* College Preferences */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">College Preferences (Optional)</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="intendedMajor">Intended Major/Field of Study</Label>
                  <Input
                    id="intendedMajor"
                    name="intendedMajor"
                    type="text"
                    placeholder="e.g., Computer Science, Biology, Undecided"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="collegePreferences">Preferred College Types</Label>
                  <Input
                    id="collegePreferences"
                    name="collegePreferences"
                    type="text"
                    placeholder="e.g., Liberal Arts, Research Universities"
                    className="rounded-lg"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="careerGoals">Career Goals/Aspirations</Label>
                <textarea
                  id="careerGoals"
                  name="careerGoals"
                  rows={3}
                  placeholder="Tell us about your career aspirations and goals..."
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Equity Program */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Support Programs</h3>
              
              <div className="bg-muted/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="equityEligible"
                    name="equityEligible"
                    defaultChecked={user.equityEligible}
                    className="mt-1"
                  />
                  <div>
                    <Label htmlFor="equityEligible" className="text-sm font-medium">
                      I may be eligible for financial assistance or equity programs
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check this if you're from a low-income family or underrepresented background. 
                      This helps us provide appropriate resources and may qualify you for free or discounted services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {state?.error && (
              <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                {state.error}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
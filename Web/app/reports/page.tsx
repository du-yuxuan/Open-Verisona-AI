import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Brain, 
  GraduationCap, 
  Target, 
  Clock, 
  Download,
  Eye,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { VerisonaLogo } from '@/components/ui/verisona-logo';
import Link from 'next/link';
import ReportsClient from './reports-client';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Your Reports</h1>
              <p className="text-muted-foreground">
                View your AI-generated insights and recommendations
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <VerisonaLogo size={16} />
            <span>Powered by AI • Personalized for your college journey</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Personality</p>
                  <p className="font-semibold">Analyses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-secondary/10 rounded-lg">
                  <GraduationCap className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">College</p>
                  <p className="font-semibold">Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-accent/10 rounded-lg">
                  <Target className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Academic</p>
                  <p className="font-semibold">Profiles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-semibold">Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Content */}
        <Suspense fallback={<ReportsLoadingSkeleton />}>
          <ReportsClient />
        </Suspense>

        {/* Help Section */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl flex-shrink-0">
                <VerisonaLogo size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Understanding Your Reports
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your AI-generated reports provide personalized insights based on your questionnaire responses. 
                  Each report is tailored to help you authentically present yourself in college applications.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Personality Analysis</h4>
                    <p className="text-muted-foreground">Discover your unique traits, values, and motivations</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">College Matches</h4>
                    <p className="text-muted-foreground">Find schools that align with your goals and personality</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Academic Profile</h4>
                    <p className="text-muted-foreground">Understand your academic strengths and interests</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Comprehensive Reports</h4>
                    <p className="text-muted-foreground">Complete analysis combining all aspects</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReportsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-muted/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
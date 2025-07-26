import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { getActiveQuestionnaires } from '@/lib/db/questionnaire-queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  BookOpen, 
  ArrowRight, 
  Target,
  GraduationCap,
  Heart,
  Sparkles
} from 'lucide-react';
import { VerisonaLogo } from '@/components/ui/verisona-logo';

export default async function QuestionnairePage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get all active questionnaires
  const questionnaires = await getActiveQuestionnaires();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personality':
        return <Heart className="h-5 w-5" />;
      case 'academic':
        return <GraduationCap className="h-5 w-5" />;
      case 'preferences':
        return <Target className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personality':
        return 'bg-orange-100 text-orange-800';
      case 'academic':
        return 'bg-amber-100 text-amber-800';
      case 'preferences':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <main className="flex-1 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <VerisonaLogo size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Discover Your Authentic Self
              </h1>
              <p className="text-muted-foreground">
                Take our AI-powered assessments to unlock insights about your personality, interests, and college fit.
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              Ready to Begin Your Journey?
            </CardTitle>
            <CardDescription>
              Our questionnaires are designed to help you understand yourself better and find colleges that align with your authentic personality and goals. Each assessment takes just a few minutes and provides personalized insights.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Questionnaires Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionnaires.map((questionnaire) => (
            <Card key={questionnaire.id} className="hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getCategoryIcon(questionnaire.category || '')}
                    </div>
                    {questionnaire.category && (
                      <Badge 
                        variant="secondary" 
                        className={getCategoryColor(questionnaire.category)}
                      >
                        {questionnaire.category}
                      </Badge>
                    )}
                  </div>
                  {questionnaire.estimatedDuration && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{questionnaire.estimatedDuration} min</span>
                    </div>
                  )}
                </div>
                
                <CardTitle className="text-lg leading-tight">
                  {questionnaire.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {questionnaire.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Features/Benefits */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">What you'll discover:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {questionnaire.category === 'personality' && (
                        <>
                          <li>• Your core personality traits and values</li>
                          <li>• Communication and learning styles</li>
                          <li>• Motivations and drivers</li>
                        </>
                      )}
                      {questionnaire.category === 'academic' && (
                        <>
                          <li>• Academic interests and strengths</li>
                          <li>• Career goals and aspirations</li>
                          <li>• Subject area preferences</li>
                        </>
                      )}
                      {questionnaire.category === 'preferences' && (
                        <>
                          <li>• Ideal college environment</li>
                          <li>• Campus culture preferences</li>
                          <li>• Location and size factors</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Button asChild className="w-full rounded-full">
                    <a href={`/questionnaire/${questionnaire.id}`}>
                      Start Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary" />
              How It Works
            </CardTitle>
            <CardDescription>
              Our assessment process is designed to be thoughtful, engaging, and insightful.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Choose & Start</h3>
                <p className="text-sm text-muted-foreground">
                  Select a questionnaire that interests you and begin your self-discovery journey.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-secondary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Reflect & Respond</h3>
                <p className="text-sm text-muted-foreground">
                  Answer thoughtfully crafted questions about your preferences, goals, and values.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Discover & Apply</h3>
                <p className="text-sm text-muted-foreground">
                  Receive personalized insights and recommendations to guide your college journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No Questionnaires State */}
        {questionnaires.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Questionnaires Available</h3>
              <p className="text-muted-foreground mb-4">
                We're preparing some exciting assessments for you. Check back soon!
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <a href="/dashboard">
                  Return to Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
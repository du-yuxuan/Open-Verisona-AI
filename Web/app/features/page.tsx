import { Button } from '@/components/ui/button';
import { ArrowRight, Users, BookOpen, Target, Brain, MessageSquare, BarChart3, Shield, Zap, CheckCircle, Star, Lightbulb } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function FeaturesPage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl">
              Powerful Features for
              <span className="block gradient-text">Authentic Discovery</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive AI-powered tools designed to help you uncover your unique story and present your authentic self in college applications.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
              Core Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to discover and articulate your authentic persona
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <div className="w-16 h-16 mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">AI Personality Analysis</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Advanced AI algorithms analyze your responses to reveal your unique personality traits, values, and strengths that make you stand out.
              </p>
              <div className="flex items-center text-sm text-primary font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Deep personality insights
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-secondary/20 transition-all duration-300 hover:shadow-lg">
              <div className="w-16 h-16 mb-6 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <MessageSquare className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">Dynamic Questionnaires</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Smart questionnaires that adapt to your responses, diving deeper into areas that reveal your authentic voice and unique experiences.
              </p>
              <div className="flex items-center text-sm text-secondary font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Adaptive question flow
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <div className="w-16 h-16 mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">Personalized Reports</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Comprehensive reports that highlight your strengths, suggest improvement areas, and provide actionable guidance for your applications.
              </p>
              <div className="flex items-center text-sm text-primary font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Actionable insights
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology to support your college application journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature Card */}
            <div className="p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-colors">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-3">Real-time AI Feedback</h3>
                  <p className="text-muted-foreground mb-4">
                    Get instant feedback on your responses and suggestions for how to better express your authentic voice.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Instant response analysis</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Writing improvement suggestions</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Authenticity scoring</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-background border border-border/50 hover:border-secondary/20 transition-colors">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-3">Goal-Oriented Guidance</h3>
                  <p className="text-muted-foreground mb-4">
                    Tailored recommendations based on your target schools, major interests, and career aspirations.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-secondary" /> School-specific insights</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-secondary" /> Major alignment analysis</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-secondary" /> Career path guidance</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-colors">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-3">Equity-Focused Support</h3>
                  <p className="text-muted-foreground mb-4">
                    Special features and resources designed for underrepresented and low-income students.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Scholarship identification</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Financial aid guidance</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Mentorship connections</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-background border border-border/50 hover:border-secondary/20 transition-colors">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-3">Privacy & Security</h3>
                  <p className="text-muted-foreground mb-4">
                    Your personal information and responses are protected with enterprise-grade security.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-secondary" /> End-to-end encryption</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-secondary" /> GDPR compliant</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-secondary" /> Data ownership rights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
              Why Students Choose Verisona AI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real benefits that make a difference in your college application journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">Stand Out Authentically</h3>
              <p className="text-muted-foreground leading-relaxed">
                Present your genuine self in a way that resonates with admissions officers and sets you apart from the crowd.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">Discover Hidden Strengths</h3>
              <p className="text-muted-foreground leading-relaxed">
                Uncover aspects of your personality and experiences that you might not have recognized as strengths.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">Find Your Perfect Match</h3>
              <p className="text-muted-foreground leading-relaxed">
                Identify colleges and programs that align with your authentic values and aspirations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Ready to Unlock Your Potential?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who have discovered their authentic voice with Verisona AI's powerful features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="text-lg rounded-full px-8 py-4"
            >
              <a href="/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg rounded-full px-8 py-4 border-primary/20 hover:bg-primary/5"
            >
              <a href="/pricing">
                View Pricing
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
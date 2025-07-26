import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Users, Target, BookOpen, Star, Award } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function AboutPage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl">
              About
              <span className="block gradient-text">Verisona AI</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Empowering students to discover their authentic voice and present their true selves in college applications through AI-powered personality analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At Verisona AI, we believe that every student has a unique story worth telling. Our mission is to help students, especially those from underrepresented and low-income backgrounds, discover and articulate their authentic persona for college applications.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We combine the power of artificial intelligence with human understanding to create a platform that doesn't just help students write better applications—it helps them understand themselves better.
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 py-4"
              >
                <a href="/sign-up">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Authentic</h3>
                  <p className="text-sm text-muted-foreground">True to yourself</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Focused</h3>
                  <p className="text-sm text-muted-foreground">Goal-oriented</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Inclusive</h3>
                  <p className="text-sm text-muted-foreground">For everyone</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Educational</h3>
                  <p className="text-sm text-muted-foreground">Learn & grow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
              Why Verisona AI Exists
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              College applications shouldn't be about fitting into someone else's mold. They should be about showing who you truly are.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <span className="text-2xl">😔</span>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">The Problem</h3>
              <p className="text-muted-foreground leading-relaxed">
                Many students, especially from underrepresented backgrounds, struggle to present their authentic selves in college applications, often feeling pressured to conform to perceived expectations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">Our Solution</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered questionnaires and personality analysis help students discover their unique strengths, values, and stories, providing personalized guidance for authentic self-presentation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-4">The Impact</h3>
              <p className="text-muted-foreground leading-relaxed">
                Students gain confidence in their authentic voice, create more compelling applications, and ultimately find colleges that truly fit their values and aspirations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at Verisona AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Authenticity First</h3>
              <p className="text-muted-foreground">
                We believe in helping students present their genuine selves, not manufactured personas.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 mb-4 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Equity & Inclusion</h3>
              <p className="text-muted-foreground">
                Special focus on supporting underrepresented and low-income students in their college journey.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Excellence</h3>
              <p className="text-muted-foreground">
                Continuous improvement in our AI technology and user experience to deliver exceptional results.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 mb-4 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Student-Centered</h3>
              <p className="text-muted-foreground">
                Every decision we make prioritizes the student experience and success.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Transparency</h3>
              <p className="text-muted-foreground">
                Clear communication about our processes, AI capabilities, and recommendations.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 mb-4 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Impact-Driven</h3>
              <p className="text-muted-foreground">
                Measuring success by the positive impact we have on students' lives and futures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Ready to Discover Your Authentic Voice?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their unique path to college success with Verisona AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="text-lg rounded-full px-8 py-4"
            >
              <a href="/sign-up">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg rounded-full px-8 py-4 border-primary/20 hover:bg-primary/5"
            >
              <a href="/features">
                Explore Features
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
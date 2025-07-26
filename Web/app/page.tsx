import { Button } from '@/components/ui/button';
import { ArrowRight, Users, BookOpen, Target, UserCircle, Brain, Heart, Star, Shield, Lightbulb, Lock } from 'lucide-react';
import { VerisonaLogo } from '@/components/ui/verisona-logo';
import { siteConfig } from '@/lib/config';

export default function HomePage() {
  return (
    <main className="flex-1 min-h-screen" style={{ backgroundColor: 'var(--color-light)' }}>
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, var(--color-light) 0%, var(--color-cream) 100%)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="fade-in">
              <h1 className="text-5xl font-bold tracking-tight mb-6" 
                  style={{ color: 'var(--color-text)', lineHeight: '1.1' }}>
                Your story is your strength
              </h1>
              <p className="text-lg leading-relaxed mb-8" 
                 style={{ color: 'var(--color-text)', opacity: 0.8 }}>
                Our revolutionary AI platform helps you discover your unique persona
                and craft an application that showcases who you truly are—not just your test scores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--color-orange)', 
                    color: 'white',
                    boxShadow: '0 4px 14px 0 rgba(255, 107, 53, 0.3)'
                  }}
                >
                  <a href="/sign-up">
                    Get Started Free
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 rounded-lg font-semibold border-2"
                  style={{ 
                    borderColor: 'var(--color-earth)',
                    color: 'var(--color-text)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <a href="#features">
                    Learn More
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Right Content - Constellation Preview */}
            <div className="constellation-animation">
              <div className="relative w-full h-96 bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                    Your Persona Constellation
                  </h3>
                  <div className="relative mx-auto w-64 h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    {/* Login overlay */}
                    <div className="text-center">
                      <Lock className="mx-auto text-3xl mb-3" style={{ color: 'var(--color-earth)' }} />
                      <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                        Get Started to Get Your Personal Constellation
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">Unlock your unique personality visualization</p>
                    </div>
                  </div>
                  <p className="text-sm mt-4" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                    Discover your unique strengths and personality traits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
                The Admissions Game is Stacked
              </h2>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                More Than Just Numbers
              </h3>
              <p className="mb-6 text-lg" style={{ color: 'var(--color-text)', opacity: 0.8 }}>
                Getting into college is challenging, especially for students from underrepresented
                backgrounds. The system often favors those with access to expensive extracurriculars and test
                prep, overlooking incredible students whose strengths aren't measured by a score, as well as
                students with potential but do not have the resources to apply it.
              </p>
              <p className="mb-6 text-lg" style={{ color: 'var(--color-text)', opacity: 0.8 }}>
                But colleges themselves want to see more; they are looking for character,
                resilience, leadership, and initiative. The problem isn't your potential—it's how the current
                system fails to recognize and showcase it.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2 text-gray-500">Traditional Metrics</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-200 px-3 py-1 rounded text-sm">GPA: 3.8</div>
                    <div className="bg-gray-200 px-3 py-1 rounded text-sm">SAT: 1450</div>
                    <div className="bg-gray-200 px-3 py-1 rounded text-sm">AP Classes: 5</div>
                  </div>
                </div>
                <div className="text-4xl text-gray-400">⚖️</div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-earth)' }}>
                    What Really Matters
                  </h4>
                  <div className="space-y-2">
                    <div className="px-3 py-1 rounded text-sm"
                         style={{ backgroundColor: 'var(--color-cream)' }}>Resilience</div>
                    <div className="px-3 py-1 rounded text-sm"
                         style={{ backgroundColor: 'var(--color-cream)' }}>Creativity</div>
                    <div className="px-3 py-1 rounded text-sm"
                         style={{ backgroundColor: 'var(--color-cream)' }}>Empathy</div>
                    <div className="px-3 py-1 rounded text-sm"
                         style={{ backgroundColor: 'var(--color-cream)' }}>Leadership</div>
                    <div className="px-3 py-1 rounded text-sm"
                         style={{ backgroundColor: 'var(--color-cream)' }}>Initiative</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Introduction Section */}
      <section className="py-16" style={{ 
        background: 'linear-gradient(135deg, var(--color-light) 0%, var(--color-cream) 100%)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              Introducing the AI Admissions Team
            </h2>
            <p className="text-lg max-w-3xl mx-auto mb-8" 
               style={{ color: 'var(--color-text)', opacity: 0.8 }}>
              Our revolutionary multi-agent AI system features
              specialized agents that collaborate and debate to uncover your unique strengths and build a powerful
              application strategy around them. This is mentorship, reimagined.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-cream)' }}>
                <UserCircle className="h-8 w-8" style={{ color: 'var(--color-earth)' }} />
              </div>
              <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Erikson Identity Mapper
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                Maps your developmental journey and identity formation
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-cream)' }}>
                <Brain className="h-8 w-8" style={{ color: 'var(--color-earth)' }} />
              </div>
              <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Gardner Intelligence Profiler
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                Identifies your multiple intelligence patterns
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-cream)' }}>
                <Heart className="h-8 w-8" style={{ color: 'var(--color-earth)' }} />
              </div>
              <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Goleman EQ Analyst
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                Evaluates your emotional intelligence strengths
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-cream)' }}>
                <Star className="h-8 w-8" style={{ color: 'var(--color-earth)' }} />
              </div>
              <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Strengths Synthesizer
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                Combines insights into your unique profile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              How It Works
            </h2>
            <p className="text-lg max-w-2xl mx-auto" 
               style={{ color: 'var(--color-text)', opacity: 0.7 }}>
              Transform your college application journey with our AI-powered approach
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl transition-all duration-200 hover:scale-105" 
                 style={{ backgroundColor: 'var(--color-light)' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-cream)' }}>
                <VerisonaLogo size={40} />
              </div>
              <h3 className="font-semibold text-xl mb-4" style={{ color: 'var(--color-text)' }}>
                The Platform
              </h3>
              <p style={{ color: 'var(--color-text)', opacity: 0.7, lineHeight: '1.6' }}>
                Access our comprehensive suite of AI-powered tools designed specifically for authentic college applications
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl transition-all duration-200 hover:scale-105" 
                 style={{ backgroundColor: 'var(--color-light)' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-earth)' }}>
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-4" style={{ color: 'var(--color-text)' }}>
                Our Mission & Ethics
              </h3>
              <p style={{ color: 'var(--color-text)', opacity: 0.7, lineHeight: '1.6' }}>
                Committed to equity and authenticity, especially supporting underrepresented students
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl transition-all duration-200 hover:scale-105" 
                 style={{ backgroundColor: 'var(--color-light)' }}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-orange)' }}>
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-4" style={{ color: 'var(--color-text)' }}>
                Pricing
              </h3>
              <p style={{ color: 'var(--color-text)', opacity: 0.7, lineHeight: '1.6' }}>
                Transparent, accessible pricing with free options and financial aid available
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
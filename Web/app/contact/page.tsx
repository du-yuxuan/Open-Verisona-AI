import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Mail, MessageCircle, Phone, MapPin, Clock, Send } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function ContactPage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl">
              Get in
              <span className="block gradient-text">Touch</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions about Verisona AI? We're here to help you on your college application journey. Reach out to our team anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Send us a Message
                </h2>
                <p className="text-lg text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-foreground mb-2 block">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-foreground mb-2 block">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      className="rounded-lg"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject" className="text-sm font-medium text-foreground mb-2 block">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What's this about?"
                    className="rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-foreground mb-2 block">
                    Category
                  </Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="general">General Question</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Pricing</option>
                    <option value="equity">Equity Program</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="press">Press & Media</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-foreground mb-2 block">
                    Message
                  </Label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us more about your question or how we can help..."
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full text-lg py-3"
                >
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div>
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Other Ways to Reach Us
                </h2>
                <p className="text-lg text-muted-foreground">
                  Choose the method that works best for you.
                </p>
              </div>
              
              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Email Support</h3>
                    <p className="text-muted-foreground mb-3">
                      Get help via email. We typically respond within a few hours.
                    </p>
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">support@verisona.ai</p>
                      <p className="text-foreground font-medium">equity@verisona.ai</p>
                    </div>
                  </div>
                </div>
                
                {/* Live Chat */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Live Chat</h3>
                    <p className="text-muted-foreground mb-3">
                      Chat with our team in real-time during business hours.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Start Chat
                    </Button>
                  </div>
                </div>
                
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Phone Support</h3>
                    <p className="text-muted-foreground mb-3">
                      Speak directly with our support team.
                    </p>
                    <p className="text-foreground font-medium">1-800-VERISONA</p>
                    <p className="text-sm text-muted-foreground">(1-800-837-4766)</p>
                  </div>
                </div>
                
                {/* Office Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Support Hours</h3>
                    <div className="space-y-1 text-foreground">
                      <p><span className="font-medium">Monday - Friday:</span> 8:00 AM - 8:00 PM EST</p>
                      <p><span className="font-medium">Saturday:</span> 10:00 AM - 4:00 PM EST</p>
                      <p><span className="font-medium">Sunday:</span> Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
              Quick Help
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions or get help with specific topics
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-background border border-border/50 hover:border-primary/20 transition-colors">
              <h3 className="font-semibold text-lg text-foreground mb-3">Getting Started</h3>
              <p className="text-muted-foreground mb-4">
                New to Verisona AI? Learn the basics and take your first steps.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <a href="/help/getting-started">
                  Learn More
                </a>
              </Button>
            </div>
            
            <div className="p-6 rounded-xl bg-background border border-border/50 hover:border-secondary/20 transition-colors">
              <h3 className="font-semibold text-lg text-foreground mb-3">Technical Issues</h3>
              <p className="text-muted-foreground mb-4">
                Having trouble with the platform? Find solutions here.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <a href="/help/technical">
                  Get Help
                </a>
              </Button>
            </div>
            
            <div className="p-6 rounded-xl bg-background border border-border/50 hover:border-primary/20 transition-colors">
              <h3 className="font-semibold text-lg text-foreground mb-3">Billing Questions</h3>
              <p className="text-muted-foreground mb-4">
                Questions about plans, payments, or the equity program.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <a href="/help/billing">
                  View FAQ
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 rounded-2xl bg-destructive/5 border border-destructive/20">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Need Immediate Help?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you're experiencing a mental health crisis or need immediate support, please reach out to these resources. Your wellbeing is our top priority.
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-destructive/20 hover:bg-destructive/5"
              >
                <a href="tel:988" className="flex items-center justify-center">
                  Crisis Lifeline: 988
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-destructive/20 hover:bg-destructive/5"
              >
                <a href="tel:911" className="flex items-center justify-center">
                  Emergency: 911
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Don't wait to discover your authentic voice. Join Verisona AI today and take the first step toward your dream college.
          </p>
          <Button
            asChild
            size="lg"
            className="text-lg rounded-full px-8 py-4"
          >
            <a href="/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
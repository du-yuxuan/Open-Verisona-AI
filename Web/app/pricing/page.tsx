'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X, Star, Zap, Crown, Building2 } from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    name: 'Holistic Questionnaire Access',
    free: true,
    vpro: true,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Basic Persona Analysis',
    free: true,
    vpro: true,
    pro: true,
    enterprise: true,
  },
  {
    name: 'College Recommendations',
    free: 'Up to 10',
    vpro: 'Unlimited',
    pro: 'Unlimited',
    enterprise: 'Unlimited',
  },
  {
    name: 'Seven-Agent AI Profile',
    free: false,
    vpro: true,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Interactive Persona Constellation',
    free: false,
    vpro: true,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Personal Essay Scaffold',
    free: false,
    vpro: true,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Advanced Essay Feedback',
    free: false,
    vpro: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Interview Preparation',
    free: false,
    vpro: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Counselor Dashboard',
    free: false,
    vpro: false,
    pro: false,
    enterprise: true,
  },
  {
    name: 'Bulk Student Accounts',
    free: false,
    vpro: false,
    pro: false,
    enterprise: true,
  },
  {
    name: 'Support Level',
    free: 'Community',
    vpro: 'AI Q&A',
    pro: 'Priority',
    enterprise: 'Dedicated Manager',
  },
];

const faqs = [
  {
    question: 'Why do you offer a completely free tier?',
    answer: 'Our mission is to democratize access to quality college admissions guidance. The Free tier provides foundational self-insight to any student at no cost, ensuring that financial barriers don\'t prevent students from discovering their potential. This aligns with our core value of equity and access.',
  },
  {
    question: 'What makes V-Pro different from Pro?',
    answer: 'V-Pro is specifically designed for students and provides the complete roadmap for successful college applications, including our full Seven-Agent AI Profile and interactive visualizations. Pro includes additional advanced tools like essay feedback and interview preparation, making it suitable for users who need comprehensive application strategy support.',
  },
  {
    question: 'How does the Seven-Agent AI Profile work?',
    answer: 'Our Seven-Agent AI system uses specialized agents that engage in structured debates to analyze your profile from multiple psychological and educational perspectives. This includes the Jungian-Eriksonian Analyst, Narrative Synthesist, and Cognitive-Behavioral Catalyst, among others, ensuring a comprehensive and authentic representation of your unique story.',
  },
  {
    question: 'What does V-Enterprise include for institutions?',
    answer: 'V-Enterprise empowers counselors and educators with our scalable institutional platform. It includes bulk student accounts, counselor dashboards with analytics, progress tracking across students, custom branding, and a dedicated account manager. Pricing is customized based on your institution\'s specific needs and student population.',
  },
  {
    question: 'How do you ensure data privacy and security?',
    answer: 'We take data security very seriously and follow our ethical AI principles. All student data is encrypted, stored securely, and never shared with third parties. We comply with FERPA and other relevant privacy regulations. Our AI provides transparent recommendations, and students always maintain control over their personal information.',
  },
  {
    question: 'Can I switch between plans?',
    answer: 'Yes! You can upgrade from Free to V-Pro or Pro at any time. Downgrades take effect at the end of your current billing cycle. Our goal is to provide flexibility so you can choose the level of support that best fits your current needs and budget.',
  },
];

export default function PricingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--color-light)] to-[var(--color-cream)]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold text-[var(--color-text)] tracking-tight sm:text-5xl md:text-6xl mb-6">
            Our Pricing Philosophy: Access and Sustainability
          </h1>
          <p className="text-xl text-[var(--color-text)]/70 max-w-3xl mx-auto leading-relaxed mb-8">
            Our mission is to democratize access. This requires a sustainable business model that does not contradict our core values. Therefore, we offer a multi-tiered approach to serve individuals and institutions.
          </p>
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">For Students & Institutions</h3>
            <p className="text-sm text-[var(--color-text)]/60">From free foundational insights to comprehensive institutional solutions</p>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Free Plan */}
            <div className="pricing-card bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--color-earth)]/10 flex items-center justify-center">
                  <Star className="h-8 w-8 text-[var(--color-earth)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Free</h3>
                <p className="text-sm text-[var(--color-text)]/60 mb-4">The "Discovery" Tier</p>
                <div className="text-4xl font-bold text-[var(--color-earth)] mb-2">$0</div>
                <p className="text-[var(--color-text)]/60">forever</p>
                <p className="text-xs text-[var(--color-text)]/50 mt-2">Foundational self-insight to any student, at no cost.</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Access to holistic questionnaire</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Basic Persona Analysis</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>3 archetypes Profile with top</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Enhanced Activity List</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Tailored College List (up to 10 schools)</span>
                </li>
              </ul>
              
              <Button
                asChild
                variant="outline"
                className="w-full py-3 border-[var(--color-earth)] text-[var(--color-earth)] hover:bg-[var(--color-earth)]/10"
              >
                <a href="/sign-up">Get Started</a>
              </Button>
            </div>

            {/* V-Pro Plan - Most Popular */}
            <div className="pricing-card bg-white rounded-lg shadow-lg p-6 border-2 border-[var(--color-orange)] relative hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-orange)] to-[var(--color-earth)] text-white text-sm font-semibold">
                  Most Popular
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--color-orange)]/10 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-[var(--color-orange)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">V-Pro</h3>
                <p className="text-sm text-[var(--color-text)]/60 mb-4">Pro for Students</p>
                <div className="text-4xl font-bold text-[var(--color-earth)] mb-2">$99</div>
                <p className="text-[var(--color-text)]/60">per month</p>
                <p className="text-xs text-[var(--color-text)]/50 mt-2">The complete roadmap for a successful student.</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-orange)] mr-2 flex-shrink-0" />
                  <span>Everything in Free, plus:</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-orange)] mr-2 flex-shrink-0" />
                  <span>Full Seven-Agent AI Profile</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-orange)] mr-2 flex-shrink-0" />
                  <span>Interactive Persona Constellation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-orange)] mr-2 flex-shrink-0" />
                  <span>Interactive Timeline of Achievements</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-orange)] mr-2 flex-shrink-0" />
                  <span>Detailed Personal Essay Scaffold</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-orange)] mr-2 flex-shrink-0" />
                  <span>Follow-up Q&A with the AI</span>
                </li>
              </ul>
              
              <Button
                asChild
                className="w-full py-3 bg-[var(--color-orange)] hover:bg-[var(--color-orange)]/90 text-white"
              >
                <a href="/sign-up">
                  Choose V-Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--color-earth)]/10 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-[var(--color-earth)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Pro</h3>
                <p className="text-sm text-[var(--color-text)]/60 mb-4">For Other</p>
                <div className="text-4xl font-bold text-[var(--color-earth)] mb-2">$199</div>
                <p className="text-[var(--color-text)]/60">per month</p>
                <p className="text-xs text-[var(--color-text)]/50 mt-2">Advanced tools for comprehensive application strategy.</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Everything in V-Pro, plus:</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Advanced essay feedback & refinement</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Interview preparation tools</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Priority support & consultation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Extended college research tools</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Application timeline management</span>
                </li>
              </ul>
              
              <Button
                asChild
                variant="outline"
                className="w-full py-3 border-[var(--color-earth)] text-[var(--color-earth)] hover:bg-[var(--color-earth)]/10"
              >
                <a href="/sign-up">Choose Pro</a>
              </Button>
            </div>

            {/* V-Enterprise Plan */}
            <div className="pricing-card bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--color-earth)]/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-[var(--color-earth)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">V-Enterprise</h3>
                <p className="text-sm text-[var(--color-text)]/60 mb-4">For Institutions</p>
                <div className="text-2xl font-bold text-[var(--color-earth)] mb-2">Custom</div>
                <p className="text-[var(--color-text)]/60">pricing</p>
                <p className="text-xs text-[var(--color-text)]/50 mt-2">Empower your counselors and educators with our scalable institutional platform.</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Everything in Pro, plus:</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Bulk student accounts</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Counselor dashboard & analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Progress tracking across students</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Custom branding & integration</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-[var(--color-earth)] mr-2 flex-shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
              
              <Button
                asChild
                variant="outline"
                className="w-full py-3 border-[var(--color-earth)] text-[var(--color-earth)] hover:bg-[var(--color-earth)]/10"
              >
                <a href="/contact">Discuss with Dev Team</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-16 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-6">
              Detailed Feature Comparison
            </h2>
            <p className="text-xl text-[var(--color-text)]/70">
              See what's included in each plan to find the perfect fit for your needs.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-cream)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-lg font-semibold text-[var(--color-text)]">Features</th>
                    <th className="px-4 py-3 text-center text-lg font-semibold text-[var(--color-text)]">Free</th>
                    <th className="px-4 py-3 text-center text-lg font-semibold text-[var(--color-text)]">V-Pro</th>
                    <th className="px-4 py-3 text-center text-lg font-semibold text-[var(--color-text)]">Pro</th>
                    <th className="px-4 py-3 text-center text-lg font-semibold text-[var(--color-text)]">V-Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {features.map((feature, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[var(--color-text)]">{feature.name}</td>
                      <td className="px-4 py-3 text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="h-5 w-5 text-[var(--color-earth)] mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-[var(--color-text)]">{feature.free}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {typeof feature.vpro === 'boolean' ? (
                          feature.vpro ? (
                            <Check className="h-5 w-5 text-[var(--color-earth)] mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-[var(--color-text)]">{feature.vpro}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <Check className="h-5 w-5 text-[var(--color-earth)] mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-[var(--color-text)]">{feature.pro}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {typeof feature.enterprise === 'boolean' ? (
                          feature.enterprise ? (
                            <Check className="h-5 w-5 text-[var(--color-earth)] mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-[var(--color-text)]">{feature.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-[var(--color-text)]/70">
              Get answers to common questions about our pricing philosophy and features.
            </p>
          </div>
          
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 pt-6">
                <button
                  className="w-full flex justify-between items-center text-left"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">{faq.question}</h3>
                  <ArrowRight 
                    className={`h-5 w-5 text-[var(--color-text)] transition-transform ${
                      openFAQ === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="mt-4">
                    <p className="text-[var(--color-text)]/70">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--color-light)] to-[var(--color-cream)]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-6">
            Start Your Journey Today
          </h2>
          <p className="text-xl text-[var(--color-text)]/70 mb-8">
            Join the movement toward authentic, equitable college admissions. Our sustainable pricing model ensures we can continue democratizing access to quality guidance for all students.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">Students</h3>
              <p className="text-sm text-[var(--color-text)]/70 mb-4">
                Start with our free Discovery tier and upgrade when you're ready for the complete roadmap.
              </p>
              <Button className="w-full bg-[var(--color-orange)] hover:bg-[var(--color-orange)]/90 text-white">
                Get Started Free
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">Counselors</h3>
              <p className="text-sm text-[var(--color-text)]/70 mb-4">
                Empower your students with our advanced AI-powered guidance tools and insights.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-[var(--color-earth)] text-[var(--color-earth)] hover:bg-[var(--color-earth)]/10"
              >
                Explore V-Pro
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">Institutions</h3>
              <p className="text-sm text-[var(--color-text)]/70 mb-4">
                Scale authentic college guidance across your entire student population.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-[var(--color-earth)] text-[var(--color-earth)] hover:bg-[var(--color-earth)]/10"
              >
                Discuss V-Enterprise
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Our Commitment</h3>
            <p className="text-sm text-[var(--color-text)]/60">
              Every plan is designed to uphold our mission of democratizing access while maintaining a sustainable model that allows us to continue serving students from all backgrounds. We believe in AI for Good - using technology to create positive change in education.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
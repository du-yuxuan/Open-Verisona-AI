import Link from 'next/link';
import { Sparkles, Heart, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="bg-muted/20 border-t border-border/50" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center group mb-4">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-primary group-hover:text-secondary transition-colors" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary/20 rounded-full animate-pulse" />
              </div>
              <div className="ml-3">
                <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {siteConfig.name}
                </span>
                <div className="text-xs text-muted-foreground font-medium tracking-wider">
                  AUTHENTIC • GROWTH • SUCCESS
                </div>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-primary" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-primary" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5 text-primary" />
              </a>
              <a
                href="mailto:support@verisona.ai"
                className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 text-primary" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <nav aria-label="Platform navigation">
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-muted-foreground hover:text-primary transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company navigation">
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-muted-foreground hover:text-primary transition-colors">
                  Press Kit
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500" />
              <span>for students everywhere</span>
            </div>
          </div>
          <div className="mt-4 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 Verisona AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { VerisonaLogo } from '@/components/ui/verisona-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

import { siteConfig } from '@/lib/config';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function NavigationLinks() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  if (user) {
    // Authenticated user navigation
    return (
      <>
        <Link href="/dashboard" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
          Dashboard
        </Link>
        <Link href="/questionnaire" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
          Questionnaire
        </Link>
        <Link href="/reports" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
          Reports
        </Link>
        <Link href="/dashboard/analytics" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
          Analytics
        </Link>
        <Link href="/dashboard/notifications" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
          Notifications
        </Link>
        <Link href="/profile" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
          Profile
        </Link>
      </>
    );
  }

  // Public navigation
  return (
    <>
      <Link href="/features" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
        Features
      </Link>
      <Link href="/about" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
        About
      </Link>
      <Link href="/pricing" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
        Pricing
      </Link>
      <Link href="/contact" className="block md:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 md:py-0">
        Contact
      </Link>
    </>
  );
}

function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
    setIsOpen(false);
  }

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {isOpen && (
        <div 
          id="mobile-navigation"
          className="absolute top-full left-0 right-0 z-50"
          role="navigation"
          aria-label="Mobile navigation"
          style={{ 
            backgroundColor: 'var(--color-light)', 
            borderTop: '1px solid rgba(212, 163, 115, 0.2)',
            boxShadow: '0 8px 32px -8px rgba(212, 163, 115, 0.2)'
          }}
        >
          <div className="px-4 py-6 space-y-4">
            <NavigationLinks />
            
            {user ? (
              <div className="pt-4" style={{ borderTop: '1px solid rgba(212, 163, 115, 0.2)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="size-8">
                    <AvatarImage alt={user.name || ''} />
                    <AvatarFallback>
                      {user.email
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{user.name || user.email}</div>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="pt-4 space-y-2" style={{ borderTop: '1px solid rgba(212, 163, 115, 0.2)' }}>
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="w-full rounded-full">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-foreground">
          <div className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{user.name || user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50" 
            style={{ 
              backgroundColor: 'var(--color-light)', 
              borderBottom: '1px solid rgba(212, 163, 115, 0.2)',
              backdropFilter: 'blur(12px)'
            }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center group">
          <div className="relative">
            <VerisonaLogo size={32} className="transition-all duration-200 group-hover:scale-105" />
          </div>
          <div className="ml-3">
            <span className="text-xl font-bold transition-colors"
                  style={{ color: 'var(--color-text)' }}>
              {siteConfig.name}
            </span>
            <div className="text-xs font-medium tracking-wider"
                 style={{ color: 'var(--color-text)', opacity: 0.6 }}>
              AUTHENTIC • GROWTH • SUCCESS
            </div>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav id="main-navigation" className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
          <NavigationLinks />
        </nav>
        
        {/* Mobile Navigation */}
        <MobileNavigation />
        
        <div className="hidden md:flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
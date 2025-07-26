import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { getUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';

import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: ['college application', 'AI', 'persona development', 'authentic', 'student support'],
  authors: [{ name: 'Verisona AI Team' }],
  creator: 'Verisona AI',
  publisher: 'Verisona AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  
  return (
    <html
      lang="en"
      className={`${inter.className} ${inter.variable}`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
        {/* Skip Links for Accessibility */}
        <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50">
          <a href="#main-content" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium">
            Skip to main content
          </a>
          <a href="#main-navigation" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium ml-2">
            Skip to navigation
          </a>
        </div>
        
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': user
            }
          }}
        >
          <AnalyticsProvider userId={user?.id}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main id="main-content" role="main" className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AnalyticsProvider>
        </SWRConfig>
      </body>
    </html>
  );
}

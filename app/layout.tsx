import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Newsreader, Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import './globals.css';
import ThemeToggle from '../components/ThemeToggle';
import TopNav from '../components/TopNav';
import AnalyticsProvider from '../components/AnalyticsProvider';
import VisitorAlert from '../components/VisitorAlert';

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  adjustFontFallback: false
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600']
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kerrydean-hub.vercel.app'),
  title: 'Kerry Dean Jr. Production AI systems and demos',
  description:
    'Kerry Dean Jr. builds production AI systems, browser demos, workflow products, publishing automation, and open source tools.',
  keywords: [
    'Software Engineer',
    'Generative AI',
    'LLM',
    'RAG',
    'Anthropic',
    'OpenAI',
    'Claude',
    'GPT-4',
    'LangChain',
    'MCP',
    'Model Context Protocol',
    'FHIR',
    'Healthcare AI'
  ],
  authors: [{ name: 'Kerry Dean Jr.' }],
  openGraph: {
    title: 'Kerry Dean Jr. Production AI systems and demos',
    description:
      'Case studies, games, demos, storefronts, and repos from AI systems and product work that actually shipped.',
    url: 'https://kerrydean-hub.vercel.app',
    siteName: 'Kerry Dean Jr.',
    images: [{ url: '/headshot.jpg', width: 1740, height: 978, alt: 'Kerry Dean Jr.' }],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kerry Dean Jr. Production AI systems and demos',
    description: 'Production AI systems, browser demos, and shipped product work.',
    images: ['/headshot.jpg']
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider />
          <VisitorAlert />
        </Suspense>
        <ThemeToggle />
        <TopNav />
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}

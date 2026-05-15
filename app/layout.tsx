import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Newsreader, Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import './globals.css';
import ThemeToggle from '../components/ThemeToggle';
import TopNav from '../components/TopNav';
import AnalyticsProvider from '../components/AnalyticsProvider';

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700']
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
  title: 'Kerry Dean Jr. Software Engineer',
  description:
    'Software Engineer shipping production AI systems across federal, healthcare, and enterprise. Available for senior Software Engineer roles.',
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
    title: 'Kerry Dean Jr. Software Engineer',
    description:
      'Software Engineer shipping production AI systems. Available for senior Software Engineer roles.',
    url: 'https://kerrydean-hub.vercel.app',
    siteName: 'Kerry Dean Jr.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Kerry Dean Jr. Software Engineer' }],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kerry Dean Jr. Software Engineer',
    description: 'Software Engineer shipping production AI systems.',
    images: ['/og.png']
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        <ThemeToggle />
        <TopNav />
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}

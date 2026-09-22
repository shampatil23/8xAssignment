import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Amazon Clone (Portfolio Demo) — Educational Full-Stack Project',
    template: '%s | Amazon Clone Demo',
  },
  description:
    'An educational portfolio demonstration of a multi-vendor e-commerce platform. For learning and evaluation purposes only. Not affiliated with Amazon.com, Inc.',
  keywords: ['portfolio', 'demo', 'educational project', 'ecommerce clone', 'nextjs'],
  authors: [{ name: 'Developer Portfolio' }],
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#131921',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Global Educational & Portfolio Disclaimer Banner */}
        <div className="bg-[#232f3e] text-white text-[11px] px-3 py-1.5 text-center font-medium border-b border-gray-700 flex items-center justify-center gap-2 select-none">
          <span>
            🎓 <strong>Educational Portfolio Project</strong> — Demonstration &amp; evaluation only. Not affiliated with Amazon.com, Inc. No real credit card or sensitive credentials are collected.
          </span>
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

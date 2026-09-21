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
    default: 'Amazon Clone — Shop Online',
    template: '%s | Amazon Clone',
  },
  description:
    'Shop millions of products at great prices. Fast delivery, easy returns. Your one-stop online marketplace.',
  keywords: ['shopping', 'ecommerce', 'online store', 'deals', 'marketplace'],
  authors: [{ name: 'Amazon Clone Team' }],
  openGraph: {
    type: 'website',
    siteName: 'Amazon Clone',
    title: 'Amazon Clone — Shop Online',
    description: 'Shop millions of products at great prices.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

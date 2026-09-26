import type { Metadata, Viewport } from 'next';
import { Inter, Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AiAssistantWidget } from '@/components/ai/AiAssistantWidget';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Valenza — Haute Horlogerie, Fine Jewelry & Bespoke Living',
    template: '%s | Valenza Maison de Luxe',
  },
  description:
    'Discover timeless elegance, curated luxury goods, Swiss timepieces, fine jewels, and bespoke artisan creations on Valenza.',
  keywords: ['Valenza', 'luxury marketplace', 'haute horlogerie', 'fine jewelry', 'bespoke fashion', 'private reserve'],
  authors: [{ name: 'Valenza Maison de Luxe' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0d14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${cinzel.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#faf9f6] text-[#141312]">
        <Providers>
          {children}
          <AiAssistantWidget />
        </Providers>
      </body>
    </html>
  );
}

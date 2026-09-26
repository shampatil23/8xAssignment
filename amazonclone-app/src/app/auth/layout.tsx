// ============================================================================
// (auth) group layout — Valenza Maison de Luxe Authentication Shell
// ============================================================================
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { default: 'Client Sign In — Valenza Maison Privée', template: '%s | Valenza Maison' },
  description: 'Access your private Valenza client salon and high-luxury curated collections.',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#faf9f6] dark:bg-[#0b0c10] text-[#141312] dark:text-[#f8f5ee] relative overflow-hidden selection:bg-[#c5a059]/20 selection:text-[#141312] transition-colors duration-300">
      {/* Background ambient luxury lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-[#f3ead7]/60 via-[#edd9b7]/20 to-transparent dark:from-[#151c2e]/40 dark:via-[#0e1424]/20 dark:to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 right-0 w-96 h-96 bg-[#d6be90]/10 dark:bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Page Container (Horizontal Centered Viewport) */}
      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10">
        {children}
      </main>

      {/* Refined Luxury Footer */}
      <footer className="border-t border-[#ebe2d1] dark:border-[#1e2330] py-6 text-center text-xs text-[#786b58] dark:text-[#a09a8e] bg-[#f5f1e8]/50 dark:bg-[#0e1118]/50 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase tracking-widest font-medium text-[#655947] dark:text-[#b8af9f]">
            <Link href="/" className="hover:text-[#c5a059] dark:hover:text-[#e8d5b5] transition-colors">
              Maison Home
            </Link>
            <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
            <Link href="/cart" className="hover:text-[#c5a059] dark:hover:text-[#e8d5b5] transition-colors">
              Shopping Bag
            </Link>
            <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
            <Link href="/customer-service" className="hover:text-[#c5a059] dark:hover:text-[#e8d5b5] transition-colors">
              Client Concierge
            </Link>
            <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
            <span className="hover:text-[#c5a059] cursor-pointer transition-colors">
              Confidentiality Charter
            </span>
          </div>

          <p className="text-[11px] text-[#9a8d79] dark:text-[#6e778b] tracking-wider">
            © {new Date().getFullYear()} Valenza Haute Maison. Handcrafted Masterpieces & Haute Horlogerie.
          </p>
        </div>
      </footer>
    </div>
  );
}


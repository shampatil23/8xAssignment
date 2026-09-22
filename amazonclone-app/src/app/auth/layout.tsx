// ============================================================================
// (auth) group layout — minimal shell for sign-in / sign-up / forgot-password
// Includes educational disclaimer to satisfy Google Safe Browsing standards
// ============================================================================
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { default: 'Sign In — Amazon Clone Demo', template: '%s | Amazon Clone Demo' },
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Educational Notice Bar */}
      <div className="bg-amber-50 text-amber-900 border-b border-amber-200 py-1.5 px-4 text-center text-xs font-medium">
        ⚠️ <strong>Developer Portfolio Demo:</strong> This is an educational project. <strong>Do not enter real Amazon credentials.</strong>
      </div>

      {/* Amazon-style logo header */}
      <header className="flex justify-center py-6">
        <Link href="/" id="auth-logo" aria-label="Amazon Clone home">
          <span className="font-extrabold text-amazon-dark text-3xl tracking-tight leading-none">
            amazon<span className="text-amazon-orange">.</span>
            <span className="text-sm align-super font-bold text-gray-500 ml-0.5">clone demo</span>
          </span>
        </Link>
      </header>

      {/* Page content */}
      <main className="flex flex-1 flex-col items-center px-4 pb-12">
        {children}
      </main>

      {/* Educational Footer */}
      <footer className="border-t py-6 text-center text-xs text-gray-500 space-y-2">
        <div className="flex justify-center gap-4 text-[11px]">
          <Link href="/" className="text-amazon-link hover:underline">
            Home
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Non-Commercial Educational Project</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">All trademarks belong to their respective owners</span>
        </div>
        <p className="text-[10px] text-gray-400">
          © {new Date().getFullYear()} Amazon Clone Portfolio Project. Built for learning and demonstration purposes only.
        </p>
      </footer>
    </div>
  );
}

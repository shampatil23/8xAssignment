// ============================================================================
// (auth) group layout — minimal shell for sign-in / sign-up / forgot-password
// ============================================================================
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { default: 'Sign In', template: '%s | Amazon Clone' },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Amazon-style logo header */}
      <header className="flex justify-center py-6">
        <Link href="/" id="auth-logo" aria-label="Amazon Clone home">
          <span className="font-extrabold text-amazon-dark text-3xl tracking-tight leading-none">
            amazon<span className="text-amazon-orange">.</span>
            <span className="text-sm align-super">clone</span>
          </span>
        </Link>
      </header>

      {/* Page content */}
      <main className="flex flex-1 flex-col items-center px-4 pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-gray-500">
        <div className="flex justify-center gap-4 mb-2">
          {['Conditions of Use', 'Privacy Notice', 'Help'].map((l) => (
            <a key={l} href="#" className="text-amazon-link hover:underline">
              {l}
            </a>
          ))}
        </div>
        <p>© 1996–{new Date().getFullYear()}, Amazon Clone, Inc. or its affiliates</p>
      </footer>
    </div>
  );
}

// ============================================================================
// MainLayout — wraps every page with Header + Footer
// ============================================================================
import React from 'react';
import { Header } from './Header/Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  /** Pass false on pages like /auth that don't need the full header/footer */
  withHeader?: boolean;
  withFooter?: boolean;
  /** Extra class on the <main> tag */
  mainClassName?: string;
}

export function MainLayout({
  children,
  withHeader = true,
  withFooter = true,
  mainClassName = '',
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-amazon-bg">
      {withHeader && <Header />}
      <main
        className={[
          'flex-1',
          mainClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </main>
      {withFooter && <Footer />}
    </div>
  );
}

'use client';
// ============================================================================
// MobileMenu — slide-in drawer for the "All Departments" menu
// ============================================================================
import React, { useEffect } from 'react';
import {
  X,
  ChevronRight,
  Watch,
  Shirt,
  Sparkles,
  Armchair,
  Headphones,
  Compass,
  BookOpen,
  Award,
  Wine,
  Gem,
  Crown,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { NAV_LINKS, SEARCH_CATEGORIES } from '@/lib/constants';

import { useAuth } from '@/hooks/useAuth';

interface MobileMenuProps {
  onClose: () => void;
}

const DEPARTMENTS = SEARCH_CATEGORIES.filter((c) => c.value !== 'all');

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  electronics: Watch,
  fashion: Shirt,
  beauty: Sparkles,
  'home-garden': Armchair,
  computers: Headphones,
  sports: Compass,
  books: BookOpen,
  toys: Award,
  grocery: Wine,
};

export function MobileMenu({ onClose }: MobileMenuProps) {
  const { user, signOut } = useAuth();

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="All departments menu"
        className="
          fixed left-0 top-0 z-50 h-full w-84 sm:w-92 bg-[#faf9f6] dark:bg-[#0d1017]
          flex flex-col overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]
          border-r border-[#e8e2d2] dark:border-[#262015]
          animate-[slideInLeft_0.25s_cubic-bezier(0.16,1,0.3,1)]
        "
      >
        {/* Luxury Drawer Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#1c1a17] via-[#161412] to-[#0f0e0c] dark:from-[#151922] dark:to-[#0a0d14] px-5 py-4 text-white border-b border-[#c5a059]/40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-amber-400/60 bg-gradient-to-tr from-amber-500/20 to-amber-300/10 flex items-center justify-center shadow-inner">
              <Crown size={14} className="text-amber-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif tracking-[0.16em] uppercase font-bold text-sm text-[#f8f5ee]">
                {user ? `Maison ${user.displayName?.split(' ')[0] ?? 'Client'}` : 'Valenza Ateliers'}
              </span>
              <span className="text-[8.5px] font-sans tracking-[0.3em] uppercase text-amber-300/80 font-medium">
                Salons &amp; Collections
              </span>
            </div>
          </div>
          <button
            id="mobile-menu-close-btn"
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Departments */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5 font-serif text-[10px] font-bold text-[#8a6827] dark:text-[#dfba73] uppercase tracking-[0.24em] flex items-center gap-1.5">
            <Gem size={10} className="text-[#c5a059]" />
            <span>Haute Collections &amp; Ateliers</span>
          </div>

          {DEPARTMENTS.map((dept) => {
            const IconComponent = CATEGORY_ICONS[dept.value] || Layers;
            return (
              <Link
                key={dept.value}
                href={`/category/${dept.value}`}
                onClick={onClose}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-sans font-medium text-[#2d2924] dark:text-[#e4ded3] hover:text-[#9a7833] dark:hover:text-[#dfba73] hover:bg-[#f2ecdf]/80 dark:hover:bg-[#161a24] border border-transparent hover:border-[#dfd3bc] dark:hover:border-[#2d2516] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-6 h-6 rounded-lg bg-[#efe8d8] dark:bg-[#1c2230] text-[#8a6827] dark:text-[#dfba73] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#dfba73] group-hover:text-[#12110f] transition-all">
                    <IconComponent size={12} />
                  </div>
                  <span className="truncate font-medium">{dept.label}</span>
                </div>
                <ChevronRight size={13} className="text-[#a8a195] dark:text-[#6a665d] group-hover:text-[#8a6827] dark:group-hover:text-[#dfba73] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            );
          })}

          {/* Nav links */}
          <div className="px-3 pt-4 pb-1.5 mt-2 font-serif text-[10px] font-bold text-[#8a6827] dark:text-[#dfba73] uppercase tracking-[0.24em] border-t border-[#ede7d8] dark:border-[#202534] flex items-center gap-1.5">
            <Crown size={10} className="text-[#c5a059]" />
            <span>Maison Services &amp; Privileges</span>
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans font-medium text-[#4a433a] dark:text-[#c4bdb2] hover:text-[#9a7833] dark:hover:text-[#dfba73] hover:bg-[#f2ecdf]/60 dark:hover:bg-[#161a24] transition-all"
            >
              <span className="tracking-wide">{link.label}</span>
              <ChevronRight size={12} className="text-[#b8b0a2] dark:text-[#5a564d]" />
            </Link>
          ))}
        </nav>

        {/* Auth CTA */}
        <div className="border-t border-[#ede7d8] dark:border-[#202534] p-4 flex flex-col gap-2 bg-[#f6f1e6]/60 dark:bg-[#10141d]/60">
          {user ? (
            <>
              <Link
                href="/account"
                onClick={onClose}
                className="block w-full rounded-full border border-[#d6be90] dark:border-[#c5a059]/40 bg-white dark:bg-[#161a24] px-4 py-2.5 text-center font-serif text-xs font-semibold tracking-wider text-[#141312] dark:text-[#f8f5ee] hover:bg-[#faf8f5] dark:hover:bg-[#1f2533] transition-colors shadow-xs"
              >
                Maison Account
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="block w-full rounded-full border border-transparent px-4 py-2 text-center text-xs font-sans text-[#8a8277] hover:text-[#141312] dark:hover:text-white transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              onClick={onClose}
              className="block w-full rounded-full border border-[#c5a059]/60 bg-gradient-to-r from-[#dfba73] to-[#9b7532] px-4 py-2.5 text-center font-serif text-xs font-bold tracking-widest uppercase text-[#141312] hover:brightness-105 transition-all shadow-xs"
            >
              Client Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

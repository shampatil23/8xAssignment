'use client';
// ============================================================================
// MobileMenu — slide-in drawer for the "All Departments" menu
// ============================================================================
import React, { useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { NAV_LINKS, SEARCH_CATEGORIES } from '@/lib/constants';

interface MobileMenuProps {
  onClose: () => void;
}

const DEPARTMENTS = SEARCH_CATEGORIES.filter((c) => c.value !== 'all');

export function MobileMenu({ onClose }: MobileMenuProps) {
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
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="All departments menu"
        className="
          fixed left-0 top-0 z-50 h-full w-72 bg-white
          flex flex-col overflow-y-auto shadow-2xl
          animate-[slideInLeft_0.2s_ease-out]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-amazon-dark px-4 py-3 text-white">
          <span className="font-bold text-base">Shop by Department</span>
          <button
            id="mobile-menu-close-btn"
            onClick={onClose}
            className="rounded p-1 hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Departments */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Departments
          </div>
          {DEPARTMENTS.map((dept) => (
            <Link
              key={dept.value}
              href={`/category/${dept.value}`}
              onClick={onClose}
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {dept.label}
              <ChevronRight size={14} className="text-gray-400" />
            </Link>
          ))}

          {/* Nav links */}
          <div className="px-4 py-2 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Programs & Features
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {link.label}
              <ChevronRight size={14} className="text-gray-400" />
            </Link>
          ))}
        </nav>

        {/* Sign in CTA */}
        <div className="border-t p-4">
          <Link
            href="/auth/sign-in"
            onClick={onClose}
            className="block w-full rounded border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </aside>
    </>
  );
}

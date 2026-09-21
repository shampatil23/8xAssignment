'use client';
// ============================================================================
// NavBar — the dark secondary navigation bar beneath the header
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { MobileMenu } from './MobileMenu';

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="bg-amazon-dark-light flex items-center gap-1 px-3 py-1.5 text-white text-sm overflow-x-auto scrollbar-hide"
        aria-label="Main navigation"
      >
        {/* Hamburger + All */}
        <button
          id="all-departments-btn"
          onClick={() => setMenuOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded font-semibold hover:ring-1 hover:ring-white transition-all whitespace-nowrap"
          aria-label="Open all departments menu"
          aria-expanded={menuOpen}
        >
          <Menu size={16} />
          <span>All</span>
        </button>

        {/* Nav links */}
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <MobileMenu onClose={() => setMenuOpen(false)} />
      )}
    </>
  );
}

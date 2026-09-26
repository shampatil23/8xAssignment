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
        className="bg-[#0c0e14] border-b border-[#c5a059]/20 flex items-center gap-1.5 px-4 py-1.5 text-gray-200 text-xs md:text-[13px] font-medium tracking-wider overflow-x-auto scrollbar-hide select-none"
        aria-label="Main navigation"
      >
        {/* Hamburger + All */}
        <button
          id="all-departments-btn"
          onClick={() => setMenuOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181a24] border border-[#c5a059]/30 text-[#dfba73] hover:text-white hover:bg-[#202330] hover:border-[#dfba73] transition-all whitespace-nowrap font-semibold cursor-pointer"
          aria-label="Open all departments menu"
          aria-expanded={menuOpen}
        >
          <Menu size={15} className="text-[#dfba73]" />
          <span>Ateliers &amp; Salons</span>
        </button>

        {/* Nav links */}
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1 rounded-full text-gray-300 hover:text-[#dfba73] hover:bg-white/5 transition-all whitespace-nowrap tracking-wide"
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

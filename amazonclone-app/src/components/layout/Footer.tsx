'use client';
// ============================================================================
// Footer — Amazon-style multi-column footer
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { FOOTER_SECTIONS, APP_NAME } from '@/lib/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-amazon-dark text-white">
      {/* Back to top */}
      <BackToTop />

      {/* Main link columns */}
      <div className="mx-auto max-w-screen-xl px-6 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-sm font-bold">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-800" />

      {/* Bottom bar */}
      <div className="flex flex-col items-center gap-2 py-6 text-center text-xs text-gray-400">
        {/* Valenza Luxury Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-amber-400/50 bg-amber-500/10 flex items-center justify-center">
            <span className="font-serif font-black text-amber-300 text-xs">V</span>
          </div>
          <span className="font-serif tracking-[0.25em] uppercase font-bold text-white text-sm bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
            VALENZA
          </span>
        </div>

        {/* Legal links */}
        <nav aria-label="Footer legal" className="flex flex-wrap justify-center gap-4 text-gray-400 mt-1">
          {['Private Client Terms', 'Haute Horlogerie Guarantee', 'Bespoke Privacy Policy', 'White-Glove Delivery'].map((label) => (
            <Link
              key={label}
              href="#"
              className="hover:text-amber-300 transition-colors text-[11px]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-[11px] text-gray-500 mt-1">
          © {year} {APP_NAME} Maison de Luxe. All rights reserved. Authentic luxury certified.
        </p>
      </div>
    </footer>
  );
}

// ── Back-to-top banner ──
function BackToTop() {
  function handleClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <button
      id="footer-back-to-top"
      onClick={handleClick}
      className="w-full bg-amazon-dark-light py-4 text-sm text-white font-medium hover:bg-[#3a4553] transition-colors"
      aria-label="Back to top"
    >
      Back to top
    </button>
  );
}

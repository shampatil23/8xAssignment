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
      <hr className="border-gray-700" />

      {/* Bottom bar */}
      <div className="flex flex-col items-center gap-2 py-6 text-center text-xs text-gray-400">
        {/* Logo */}
        <span className="font-extrabold text-white text-base tracking-tight">
          amazon<span className="text-amazon-orange">.</span>
          <span className="text-xs align-super">clone</span>
        </span>

        {/* Legal links */}
        <nav aria-label="Footer legal" className="flex flex-wrap justify-center gap-3">
          {['Conditions of Use', 'Privacy Notice', 'Interest-Based Ads'].map((label) => (
            <Link
              key={label}
              href="#"
              className="hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p>
          © 1996–{year}, {APP_NAME}, Inc. or its affiliates
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

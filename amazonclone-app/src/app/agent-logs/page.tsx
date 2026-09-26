'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Terminal,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bot,
} from 'lucide-react';

interface SessionData {
  id: string;
  filename: string;
  title: string;
  timestamp: string;
  model: string;
  tool: string;
  exchanges: number;
  size: string;
  highlights: string[];
  scope: string;
}

const SESSIONS: SessionData[] = [
  {
    id: '1153c1cf',
    filename: '2026-09-21_11-05-07_1153c1cf-5971-4d84-9186-130d5306a624.md',
    title: 'Session 01: Project Genesis & Architecture',
    timestamp: '2026-09-21 11:05:07',
    model: 'gemini-3.6-flash',
    tool: 'Google Antigravity IDE',
    exchanges: 6,
    size: '14.6 KB',
    scope: 'Next.js 16 App Router scaffolding, Tailwind CSS v4 design system, Firebase RTDB setup, root layout and theme tokens.',
    highlights: [
      'Next.js 16 App Router initialization with React 19',
      'Tailwind CSS v4 luxury dark/light theme tokens',
      'Firebase Realtime Database connection & client SDK',
      'Global layout, header, footer, and navigation scaffolding',
    ],
  },
  {
    id: '02d78a3d',
    filename: '2026-09-21_11-48-19_02d78a3d-c79f-4316-95ef-c5cf7a893144.md',
    title: 'Session 02: Authentication & RBAC Route Protection',
    timestamp: '2026-09-21 11:48:19',
    model: 'gemini-3.6-flash',
    tool: 'Google Antigravity IDE',
    exchanges: 2,
    size: '3.7 KB',
    scope: 'Firebase Auth integration, session state persistence, and role-based access control (RBAC) route guards for /admin and /seller.',
    highlights: [
      'Firebase Auth email/password provider implementation',
      'Persistent authentication context (AuthContext)',
      'Protected route wrapper with redirect logic',
      'Role distinction: Customer, Verified Merchant, Super Admin',
    ],
  },
  {
    id: '2ad16e77',
    filename: '2026-09-21_12-04-28_2ad16e77-2edb-49c9-9f08-8c8d0c6f5f5f.md',
    title: 'Session 03: Catalog Schema & RTDB Query Indexes',
    timestamp: '2026-09-21 12:04:28',
    model: 'gemini-3.6-flash',
    tool: 'Google Antigravity IDE',
    exchanges: 1,
    size: '2.9 KB',
    scope: 'Realtime database schema design, products, categories, reviews data structure, and Firebase database.rules.json.',
    highlights: [
      'Relational-like normalization in Firebase RTDB',
      'Compound index optimization for category and price queries',
      'Database security rules for read/write permissions',
      'Initial sample product schemas with variants',
    ],
  },
  {
    id: '51531d7c',
    filename: '2026-09-21_14-39-36_51531d7c-42e8-4803-b06c-d00adf923a4e.md',
    title: 'Session 04: Media Pipeline & Product Detail Experience',
    timestamp: '2026-09-21 14:39:36',
    model: 'gemini-3.6-flash',
    tool: 'Google Antigravity IDE',
    exchanges: 48,
    size: '327.9 KB',
    scope: 'Cloudinary signed upload API, Product Detail Page (PDP) interactive gallery, variant selectors, and the Amazon Buy Box.',
    highlights: [
      'Signed Cloudinary upload endpoint with server HMAC validation',
      'Interactive image gallery with hover zoom and thumbnail carousel',
      'Dynamic Buy Box with stock counters and 1-Click Buy Now',
      'Customer review breakdown bar chart and verified purchaser badges',
    ],
  },
  {
    id: 'f5e41dbe',
    filename: '2026-09-25_11-08-23_f5e41dbe-1968-4ec7-b257-aa64705bfdd7.md',
    title: 'Session 05: Merchant Central (/seller) & Inventory Hub',
    timestamp: '2026-09-25 11:08:23',
    model: 'gemini-3.6-flash',
    tool: 'Google Antigravity IDE',
    exchanges: 50,
    size: '162.9 KB',
    scope: 'Complete Seller Central merchant hub, sales revenue telemetry, inventory listing CRUD, and 4-stage order fulfillment stepper.',
    highlights: [
      'Real-time merchant revenue, units sold, and stock health metrics',
      'Listing editor with multi-image Cloudinary ingestion',
      'Order fulfillment lifecycle (Confirmed → Processing → Shipped → Delivered)',
      '1-Click test order simulator for merchant verification',
    ],
  },
  {
    id: '4f7a7188',
    filename: '2026-09-25_12-57-05_4f7a7188-5492-4fc7-a944-c539b08b940a.md',
    title: 'Session 06: 8x Autonomous Agent Capture Hook Setup',
    timestamp: '2026-09-25 12:57:05',
    model: 'gemini-3.6-flash',
    tool: 'Google Antigravity IDE',
    exchanges: 4,
    size: '8.8 KB',
    scope: 'Implementation of the 8x Engineering automated capture specification, lifecycle hooks in hooks.json, and sync.py engine.',
    highlights: [
      'Configuration of Antigravity IDE lifecycle hooks on Stop & PostInvocation',
      'Parsing engine for transcript_full.jsonl to markdown specification',
      'Session metadata extraction (timestamps, models, prompts, responses)',
      'Continuous synchronization verification across all workspaces',
    ],
  },
  {
    id: '3c2407a8',
    filename: '2026-09-25_13-45-55_3c2407a8-e998-4eb3-b20e-168a257143d0.md',
    title: 'Session 07: Admin Central (/admin) & Dispute Governance',
    timestamp: '2026-09-25 13:45:55',
    model: 'gemini-3.6-flash',
    tool: 'Google Antigravity IDE',
    exchanges: 46,
    size: '153.2 KB',
    scope: 'Marketplace command center, Gross Merchandise Volume (GMV) telemetry, user ban/unban governance, and return dispute resolution.',
    highlights: [
      'Real-time GMV calculation, shopper count, and seller analytics',
      'Item-level customer return approval & refund stepper',
      'User governance console with privilege management',
      'Global marketplace settings (currency, tax, shipping thresholds)',
    ],
  },
  {
    id: '1eea34b9',
    filename: '2026-09-25_18-45-42_1eea34b9-4a9b-439a-8c46-da2b19cd9ad4.md',
    title: 'Session 08: 4-Step Checkout & Payment Orchestration',
    timestamp: '2026-09-25 18:45:42',
    model: 'gemini-3.6-flash',
    tool: 'Google Antigravity IDE',
    exchanges: 12,
    size: '34.1 KB',
    scope: 'Streamlined 4-step accordion checkout, Razorpay test mode integration, UPI/QR validation, and atomic cart deduction.',
    highlights: [
      'Step-by-step accordion navigation (Address → Shipping → Payment → Review)',
      'Authentic Razorpay modal with test card & 3D Secure simulation',
      'Instant UPI ID verification and COD support',
      'Order confirmation with persistent order tracking at /orders',
    ],
  },
  {
    id: 'a7c9ada0',
    filename: '2026-09-26_04-55-14_a7c9ada0-1511-46fb-8860-7255b918ed0b.md',
    title: 'Session 09: Valenza Luxury Overhaul & AI Concierge',
    timestamp: '2026-09-26 04:55:14',
    model: 'gemini-3.6-flash',
    tool: 'Google Antigravity IDE',
    exchanges: 75,
    size: '397.5 KB',
    scope: 'Elevating the marketplace into Valenza Haute Maison: 6 curated Ateliers, Groq AI Concierge streaming advisor, Render deployment fixes, and secret redaction.',
    highlights: [
      '6 curated luxury ateliers in a clean 2x3 grid (Haute Horlogerie, Fine Jewels, Couture, Sanctuary Living, Audio & Tech, Rare Folios)',
      'In-store AI Concierge powered by Groq LLM with multi-model fallback',
      'Automated secret redaction filter in sync.py ensuring push safety',
      'Render deployment compatibility (root package.json & render.yaml)',
    ],
  },
];

export default function AgentLogsPage() {
  const [expandedId, setExpandedId] = useState<string | null>('a7c9ada0');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const totalExchanges = SESSIONS.reduce((acc, s) => acc + s.exchanges, 0);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[#dfba73] tracking-widest uppercase mb-2">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>8x Assessment</span>
            <span>/</span>
            <span className="text-gray-400">Agent Capture Logs</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c5a059]/20 pb-6">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-tight flex items-center gap-3">
                <Bot className="text-[#dfba73]" size={36} />
                <span>8x Autonomous Agent Trajectory Logs</span>
              </h1>
              <p className="text-sm text-gray-400 mt-2 max-w-3xl leading-relaxed">
                Autonomous turn-by-turn prompt, thinking trace, and system response audit trail generated during the 
                <strong> 8x Engineering 24-Hour Rebuild Challenge</strong>.
              </p>
            </div>

            <a
              href="https://github.com/shampatil23/8xAssignment/tree/main/.agent-logs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#c5a059] to-[#dfba73] text-[#0a0d14] font-serif font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_4px_20px_rgba(197,160,89,0.3)] transition-all shrink-0"
            >
              <span>GitHub .agent-logs/</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-[#121520] border border-white/5">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Synchronized Sessions</div>
            <div className="font-serif text-2xl sm:text-3xl text-[#dfba73] mt-1 font-bold">9 Sessions</div>
            <div className="text-[11px] text-gray-500 mt-1">100% captured</div>
          </div>
          <div className="p-4 rounded-xl bg-[#121520] border border-white/5">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Total Exchanges</div>
            <div className="font-serif text-2xl sm:text-3xl text-white mt-1 font-bold">{totalExchanges}+ Turns</div>
            <div className="text-[11px] text-gray-500 mt-1">Prompt / Response pairs</div>
          </div>
          <div className="p-4 rounded-xl bg-[#121520] border border-white/5">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Capture Assistant</div>
            <div className="font-serif text-2xl sm:text-3xl text-emerald-400 mt-1 font-bold">Antigravity</div>
            <div className="text-[11px] text-gray-500 mt-1">DeepMind Agentic Assistant</div>
          </div>
          <div className="p-4 rounded-xl bg-[#121520] border border-white/5">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Compliance Status</div>
            <div className="font-serif text-2xl sm:text-3xl text-amber-300 mt-1 font-bold flex items-center gap-1.5">
              <ShieldCheck size={24} className="text-amber-400" />
              <span>Verified</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Automated secret redaction</div>
          </div>
        </div>

        {/* System Architecture Callout */}
        <div className="mb-10 p-5 rounded-2xl bg-[#141824] border border-[#c5a059]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[#dfba73] uppercase tracking-wider flex items-center gap-2">
              <Terminal size={14} />
              <span>Automated Lifecycle Hooks Active</span>
            </div>
            <p className="text-xs text-gray-300">
              Antigravity IDE automatically executes <code className="text-[#dfba73] font-mono bg-black/40 px-1.5 py-0.5 rounded">.agent-logs/sync.py</code> on every model stop event via <code className="text-[#dfba73] font-mono bg-black/40 px-1.5 py-0.5 rounded">.agents/hooks.json</code>.
            </p>
          </div>
          <div className="text-xs font-mono text-gray-400 shrink-0">
            Root: <span className="text-gray-200">/.agent-logs/*.md</span>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {SESSIONS.map((session, index) => {
            const isExpanded = expandedId === session.id;
            return (
              <div
                key={session.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-[#141824] border-[#c5a059]/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
                    : 'bg-[#10131d] border-white/5 hover:border-white/20'
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(session.id)}
                  className="w-full p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-mono text-xs font-bold text-[#dfba73]">0{index + 1}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-serif text-lg font-medium text-white">{session.title}</h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                          {session.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-gray-500" />
                          <span>{session.timestamp}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Cpu size={12} className="text-gray-500" />
                          <span>{session.model}</span>
                        </span>
                        <span className="text-[#dfba73] font-mono font-medium">
                          {session.exchanges} exchanges ({session.size})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs text-gray-400 hidden md:inline">
                      {isExpanded ? 'Collapse' : 'Inspect'}
                    </span>
                    <div className="p-1 rounded-full bg-white/5 text-gray-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-white/5 space-y-4">
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1">
                        Scope &amp; Architecture
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{session.scope}</p>
                    </div>

                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-[#dfba73] mb-2 flex items-center gap-1.5">
                        <Layers size={14} />
                        <span>Key Milestones Delivered</span>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
                        {session.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
                            <span className="text-[#dfba73] font-bold">✓</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
                      <div className="text-xs font-mono text-gray-400">
                        File: <span className="text-gray-200">.agent-logs/{session.filename}</span>
                      </div>
                      <a
                        href={`https://github.com/shampatil23/8xAssignment/blob/main/.agent-logs/${session.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#dfba73] hover:underline font-mono"
                      >
                        <span>View Raw Markdown on GitHub</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center border-t border-white/10 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-serif font-bold text-[#dfba73] hover:text-white transition-colors"
          >
            <span>Return to Valenza Haute Maison</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

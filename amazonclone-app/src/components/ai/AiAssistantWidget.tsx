'use client';
// ============================================================================
// Valenza AI Concierge — Private Luxury Shopping Assistant & Stylist
// Powered by Groq AI (Llama 3.3 70B High-Speed Inference)
// Features: Luxury frosted glass window, instant suggestions, markdown rendering,
// catalog linking, and seamless responsive design.
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Trash2,
  Bot,
  User,
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
  Tag,
  ShieldCheck,
  ShoppingBag,
  Clock,
  Compass,
} from 'lucide-react';
import { askAiConcierge } from '@/services/aiAssistantService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { icon: '⌚', label: 'Swiss Skeleton Timepieces', query: 'Recommend the finest Swiss skeleton tourbillons and mechanical timepieces in the catalog.' },
  { icon: '💎', label: 'Rare Gemstones & Jewels', query: 'What certified high jewelry, emeralds, and diamond solitaires do you recommend?' },
  { icon: '🏷️', label: 'Active Privileges & Offers', query: 'What promotional discounts, coupon codes, and exhibition privileges are active right now?' },
  { icon: '📦', label: 'Track Order & White Glove Delivery', query: 'How does white-glove insured transit work and where can I track my placed orders?' },
  { icon: '🎁', label: 'VIP Gift Recommendations', query: 'Can you recommend exceptional luxury gifts for an anniversary or special gala celebration?' },
];

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        "Welcome to Valenza Haute Maison. I am your **Private AI Concierge & Stylist**.\n\nHow may I assist your acquisition today? I can recommend Swiss timepieces, fine jewels, check active privileges, or answer any order inquiries.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadNotice, setUnreadNotice] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuery('');
    setLoading(true);

    try {
      const data = await askAiConcierge(
        newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );

      if (data.message) {
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error('No response content');
      }
    } catch (err) {
      console.error('[AI Concierge Error]:', err);
      const errorReply: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          "I am delighted to assist you with our luxury collections. Please feel free to explore our [Haute Horlogerie](/category/electronics), [Fine Jewelry](/category/beauty), or check our [Active Privileges](/deals). How else may I assist you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          "Chat refreshed. I am at your service to assist with all luxury inquiries, product styling, or order guidance.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Convert markdown links, bold text, headers, and bullet points into JSX
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Horizontal rule
          if (trimmed === '---' || trimmed === '***') {
            return <hr key={idx} className="my-2 border-[#e5dec9] dark:border-[#22293a]" />;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-serif font-bold text-sm text-[#141312] dark:text-[#f8f5ee] mt-2 mb-1 text-[#8a6827] dark:text-[#dfba73]">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-serif font-bold text-sm sm:text-base text-[#141312] dark:text-[#f8f5ee] mt-2.5 mb-1 text-[#8a6827] dark:text-[#dfba73]">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }

          // Table separator row
          if (/^\|[-:| ]+\|$/.test(trimmed)) {
            return null;
          }

          // Table row
          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const cells = trimmed
              .slice(1, -1)
              .split('|')
              .map((c) => c.trim());
            return (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1.5 rounded-lg bg-[#f6f2e9]/60 dark:bg-[#151a27]/60 text-[11px] font-sans border border-[#ebe2d1] dark:border-[#232a3b]">
                {cells.map((cell, cIdx) => (
                  <div key={cIdx} className="overflow-hidden">
                    {parseInlineMarkdown(cell, `tbl-${idx}-${cIdx}`)}
                  </div>
                ))}
              </div>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
            const cleanText = trimmed.replace(/^[-•*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5">
                <span className="text-[#c5a059] font-bold mt-0.5">•</span>
                <span className="flex-1">{parseInlineMarkdown(cleanText, `bullet-${idx}`)}</span>
              </div>
            );
          }

          // Numbered list
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5">
                <span className="text-[#8a6827] dark:text-[#dfba73] font-bold font-mono text-[11px] mt-0.5">
                  {numMatch[1]}.
                </span>
                <span className="flex-1">{parseInlineMarkdown(numMatch[2], `num-${idx}`)}</span>
              </div>
            );
          }

          return <p key={idx}>{parseInlineMarkdown(line, `p-${idx}`)}</p>;
        })}
      </div>
    );
  };

  const parseInlineMarkdown = (text: string, baseKey: string) => {
    // Replace links regex: /\[(.*?)\]\((.*?)\)/g
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    while ((match = linkRegex.exec(text)) !== null) {
      const [fullMatch, linkText, linkUrl] = match;
      const matchIndex = match.index;

      if (matchIndex > lastIndex) {
        parts.push(renderBoldText(text.substring(lastIndex, matchIndex), `${baseKey}-t-${keyCounter++}`));
      }

      parts.push(
        <Link
          key={`${baseKey}-link-${keyCounter++}`}
          href={linkUrl}
          onClick={() => {
            if (window.innerWidth < 640) setIsOpen(false);
          }}
          className="inline-flex items-center gap-1 font-semibold text-[#8a6827] dark:text-[#dfba73] hover:underline underline-offset-2 px-1 py-0.5 rounded bg-[#c5a059]/15"
        >
          <span>{linkText}</span>
          <ExternalLink size={10} className="inline" />
        </Link>
      );

      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push(renderBoldText(text.substring(lastIndex), `${baseKey}-end-${keyCounter++}`));
    }

    return <React.Fragment key={baseKey}>{parts}</React.Fragment>;
  };

  const renderBoldText = (text: string, baseKey: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const pieces = [];
    let lastIdx = 0;
    let bMatch;
    let bCounter = 0;

    while ((bMatch = boldRegex.exec(text)) !== null) {
      const [full, boldContent] = bMatch;
      const mIdx = bMatch.index;
      if (mIdx > lastIdx) {
        pieces.push(text.substring(lastIdx, mIdx));
      }
      pieces.push(
        <strong key={`${baseKey}-b-${bCounter++}`} className="font-semibold text-gray-900 dark:text-white">
          {boldContent}
        </strong>
      );
      lastIdx = mIdx + full.length;
    }

    if (lastIdx < text.length) {
      pieces.push(text.substring(lastIdx));
    }

    return <React.Fragment key={baseKey}>{pieces}</React.Fragment>;
  };

  return (
    <>
      {/* ── Floating Luxury Launcher Pill ── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setUnreadNotice(false);
            }}
            aria-label="Open Valenza AI Concierge"
            className="group relative flex items-center gap-3 pl-3.5 pr-5 py-3 rounded-full bg-gradient-to-r from-[#141312] via-[#211e1a] to-[#141312] dark:from-[#0d1017] dark:via-[#191e2b] dark:to-[#0d1017] text-[#dfba73] border border-[#c5a059]/50 hover:border-[#dfba73] shadow-[0_8px_30px_rgba(197,160,89,0.35)] hover:shadow-[0_12px_40px_rgba(197,160,89,0.55)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            {/* Sparkling Gold Emblem */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#c5a059] to-[#dfba73] text-[#121110] shadow-sm">
              <Sparkles size={16} className="animate-spin-slow text-[#121110]" />
              {unreadNotice && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#141312] animate-pulse" />
              )}
            </div>

            {/* Label */}
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase">
                Valenza AI
              </span>
              <span className="text-xs font-serif font-bold tracking-wider text-white">
                Maison Concierge
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── Chat Modal / Window ── */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-16'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[440px] h-[calc(100vh-100px)] max-h-[680px]'
          }`}
        >
          <div className="w-full h-full flex flex-col rounded-3xl bg-[#faf9f6]/95 dark:bg-[#11141d]/95 backdrop-blur-2xl border border-[#c5a059]/40 dark:border-[#dfba73]/30 shadow-[0_20px_60px_rgba(0,0,0,0.45)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden">
            
            {/* ── Window Header ── */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#141312] via-[#221f1a] to-[#141312] text-white border-b border-[#c5a059]/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#c5a059] to-[#dfba73] flex items-center justify-center text-[#121110] shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm tracking-wide text-[#dfba73]">
                    Valenza AI Concierge
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Maison Stylist • Groq AI 120B</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 text-gray-400">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Expand' : 'Minimize'}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close Concierge"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Window Body (Hidden when minimized) ── */}
            {!isMinimized && (
              <>
                {/* Message Log */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-gray-800 dark:text-gray-200">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center shrink-0 text-[#8a6827] dark:text-[#dfba73] mt-1">
                            <Sparkles size={13} />
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                            isUser
                              ? 'bg-gradient-to-r from-[#c5a059] to-[#dfba73] text-[#121110] rounded-tr-none font-sans font-medium'
                              : 'bg-white dark:bg-[#181c28] border border-black/5 dark:border-white/10 rounded-tl-none font-sans'
                          }`}
                        >
                          {isUser ? (
                            <p className="text-xs sm:text-[13px] leading-relaxed">{msg.content}</p>
                          ) : (
                            renderFormattedContent(msg.content)
                          )}
                          <span
                            className={`block text-[9px] mt-1.5 text-right ${
                              isUser ? 'text-[#121110]/60' : 'text-gray-400'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Thinking Loader */}
                  {loading && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#8a6827] dark:text-[#dfba73]">
                        <Sparkles size={13} className="animate-spin" />
                      </div>
                      <div className="rounded-2xl rounded-tl-none p-3 bg-white dark:bg-[#181c28] border border-black/5 dark:border-white/10 text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-[#dfba73] animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-[#aa8038] animate-bounce [animation-delay:0.4s]" />
                        <span className="font-serif tracking-wider text-[11px] text-[#8a6827] dark:text-[#dfba73] ml-1">
                          Curating advice...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Quick Prompt Pills */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2">
                    <p className="text-[10px] font-serif uppercase tracking-[0.2em] text-[#8a6827] dark:text-[#dfba73] font-semibold mb-2 flex items-center gap-1">
                      <Compass size={12} /> Suggested Inquiries
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(prompt.query)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#181c28] hover:bg-[#c5a059]/15 dark:hover:bg-[#dfba73]/15 border border-black/5 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95"
                        >
                          <span>{prompt.icon}</span>
                          <span className="text-[11px] font-medium">{prompt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Input Bar ── */}
                <div className="p-3 sm:p-4 bg-white dark:bg-[#141722] border-t border-black/5 dark:border-white/10 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="Ask for advice, Swiss watches, gifts, privileges..."
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full bg-gray-50 dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                    />

                    <button
                      type="submit"
                      disabled={!inputQuery.trim() || loading}
                      aria-label="Send message"
                      className="p-2.5 rounded-full bg-gradient-to-r from-[#c5a059] to-[#dfba73] hover:brightness-110 text-[#121110] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs active:scale-90 shrink-0"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

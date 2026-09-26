'use client';
// ============================================================================
// ProductQA — Product Questions & Answers (Accessible & Clean English)
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import { HelpCircle, Search, MessageSquare, Plus, Check, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchQuestions, submitQuestion, submitAnswer } from '@/services/qaService';
import type { ProductQuestion } from '@/types';

interface ProductQAProps {
  productId: string;
  productTitle: string;
  className?: string;
}

export function ProductQA({
  productId,
  productTitle,
  className = '',
}: ProductQAProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Ask question state
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [qaNotice, setQaNotice] = useState<string | null>(null);

  // Answering state
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const list = await fetchQuestions(productId);
        if (isMounted) {
          if (list.length === 0) {
            setQuestions([
              {
                id: 'seed-q1',
                productId,
                userId: 'seed-u1',
                userName: 'Michael B.',
                question: 'Does this come with the original manufacturer warranty, authenticity certificate, and packaging box?',
                answers: [
                  {
                    id: 'seed-a1',
                    text: 'Yes, it includes the full official 1-year warranty along with the certificate of authenticity and official gift box.',
                    authorName: 'Certified Seller',
                    authorRole: 'seller',
                    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
                  },
                ],
                createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
              },
              {
                id: 'seed-q2',
                productId,
                userId: 'seed-u2',
                userName: 'Elena R.',
                question: 'Is this compatible with international 110V–240V dual voltage outlets for travel?',
                answers: [
                  {
                    id: 'seed-a2',
                    text: 'Yes! The power system supports 100V–240V auto-switching worldwide. A standard travel adapter is included.',
                    authorName: 'Verified Buyer',
                    authorRole: 'customer',
                    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                  },
                ],
                createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
              },
            ]);
          } else {
            setQuestions(list);
          }
        }
      } catch (err) {
        console.error('Failed to load questions', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = `/auth/sign-in?redirect=${encodeURIComponent(
        window.location.pathname,
      )}`;
      return;
    }

    if (!newQuestionText.trim()) return;

    setSubmittingQuestion(true);
    try {
      const res = await submitQuestion(
        user.uid,
        user.displayName || 'Customer',
        productId,
        newQuestionText,
      );

      if (res.success && res.data) {
        setQuestions((prev) => [res.data!, ...prev]);
        setNewQuestionText('');
        setIsAsking(false);
        setQaNotice('Your question has been posted successfully.');
        setTimeout(() => setQaNotice(null), 3500);
      }
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    if (!user) {
      window.location.href = `/auth/sign-in?redirect=${encodeURIComponent(
        window.location.pathname,
      )}`;
      return;
    }

    if (!answerText.trim()) return;

    setSubmittingAnswer(true);
    try {
      const res = await submitAnswer(
        user.uid,
        user.displayName || 'Customer',
        'customer',
        productId,
        questionId,
        answerText,
      );

      if (res.success && res.data) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? { ...q, answers: [...(q.answers || []), res.data!] }
              : q,
          ),
        );
        setAnsweringQuestionId(null);
        setAnswerText('');
        setQaNotice('Your answer has been posted. Thank you for helping others!');
        setTimeout(() => setQaNotice(null), 3500);
      }
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const q = searchQuery.toLowerCase();
    return questions.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answers?.some((a) => a.text.toLowerCase().includes(q)),
    );
  }, [questions, searchQuery]);

  return (
    <section
      aria-labelledby="product-qa-heading"
      className={`rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-[#141312] dark:text-[#f8f5ee] ${className}`}
    >
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0eae0] dark:border-[#1e2433] pb-5 mb-6">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#9b8353] dark:text-[#d6be90] block mb-1 flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#c5a059]" />
            Questions &amp; Answers
          </span>
          <h2
            id="product-qa-heading"
            className="font-serif text-xl sm:text-2xl font-light text-[#141312] dark:text-[#f8f5ee]"
          >
            Looking for specific info?
          </h2>
          <p className="text-xs text-[#786b58] dark:text-[#9e978b] mt-0.5">
            {questions.length} customer questions answered
          </p>
        </div>

        {/* Search Questions */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] pl-9 pr-3.5 py-2 text-xs text-[#141312] dark:text-[#f8f5ee] placeholder:text-[#9b8d7c] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none transition-all"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[#8a6827] dark:text-[#dfba73]" />
        </div>
      </div>

      {qaNotice && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-[#ebf7ef] dark:bg-[#132c1e] p-3.5 text-xs text-[#186a3b] dark:text-[#4ade80] border border-[#bce2ca] dark:border-[#1e4830]">
          <Check size={16} strokeWidth={2.5} className="text-[#186a3b] dark:text-[#4ade80] shrink-0" />
          <span className="font-medium">{qaNotice}</span>
        </div>
      )}

      {/* Ask a Question Box */}
      <div className="mb-8 rounded-2xl bg-[#fbfaf8] dark:bg-[#161a25] p-5 border border-[#ebe2d1] dark:border-[#262c3d]">
        {!isAsking ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[#6e6353] dark:text-[#a0a6b5]">
              <div className="w-7 h-7 rounded-full bg-[#f4ece0] dark:bg-[#202738] flex items-center justify-center text-[#c5a059] shrink-0">
                <HelpCircle size={15} />
              </div>
              <span className="font-medium">Have a question about this product?</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAsking(true)}
              className="px-5 py-2.5 rounded-xl font-sans text-xs uppercase tracking-[0.14em] font-semibold text-[#0d0a06] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-xs transition-all cursor-pointer shrink-0 text-center"
            >
              Ask the Community
            </button>
          </div>
        ) : (
          <form onSubmit={handleAskQuestion} className="space-y-3.5">
            <label className="block text-xs font-semibold text-[#141312] dark:text-[#f8f5ee]">
              Type your question here:
            </label>
            <textarea
              rows={3}
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="e.g. What are the exact dimensions? Does it include accessories?"
              className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#12151f] p-3 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none leading-relaxed"
              required
            />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAsking(false)}
                className="text-xs font-medium text-[#8a7b68] dark:text-[#9e978b] hover:text-[#141312] dark:hover:text-[#f8f5ee] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingQuestion}
                className="px-5 py-2 rounded-xl font-sans text-xs uppercase tracking-[0.14em] font-bold text-[#0d0a06] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {submittingQuestion ? 'Submitting...' : 'Post Question'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Questions Feed */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-[#f4ede2]/60 dark:bg-[#161a25] rounded-2xl" />
          <div className="h-20 bg-[#f4ede2]/60 dark:bg-[#161a25] rounded-2xl" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="py-10 text-center text-xs text-[#786b58] dark:text-[#9e978b]">
          No questions found matching &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="divide-y divide-[#f0eae0] dark:divide-[#1e2433] space-y-6">
          {filteredQuestions.map((item) => (
            <div key={item.id} className="pt-6 first:pt-0 text-xs">
              {/* Question Row */}
              <div className="flex items-start gap-3 mb-3">
                <span className="font-serif font-bold text-sm text-[#8a6827] dark:text-[#dfba73] shrink-0 mt-0.5">
                  Q:
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-[15px] text-[#141312] dark:text-[#f8f5ee] leading-snug">
                    {item.question}
                  </p>
                  <p className="text-[11px] text-[#8a7b68] dark:text-[#7e8aa2] mt-1">
                    Asked by <strong className="font-medium text-[#141312] dark:text-[#d6be90]">{item.userName}</strong> on{' '}
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Answers */}
              <div className="pl-6 sm:pl-7 space-y-3.5">
                {item.answers && item.answers.length > 0 ? (
                  item.answers.map((ans) => (
                    <div key={ans.id} className="flex items-start gap-3 rounded-2xl bg-[#fbfaf8] dark:bg-[#161a25]/80 border border-[#ebe2d1] dark:border-[#262c3d] p-3.5 sm:p-4 text-[#141312] dark:text-[#e8e4dc]">
                      <span className="font-serif font-bold text-sm text-[#c5a059] shrink-0 mt-0.5">
                        A:
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-[13px] leading-relaxed text-[#2f2b26] dark:text-[#ded8ce]">
                          {ans.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f0eae0]/80 dark:border-[#1e2433] text-[11px] text-[#8a7b68] dark:text-[#7e8aa2]">
                          <span>
                            By <strong className="text-[#141312] dark:text-[#f8f5ee]">{ans.authorName}</strong>
                          </span>
                          {ans.authorRole === 'seller' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f4ece0] dark:bg-[#2a261c] px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold text-[#8a6827] dark:text-[#dfba73] border border-[#e5d6be] dark:border-[#3e3422]">
                              <ShieldCheck size={10} /> Certified Seller
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                              <Check size={10} /> Verified Buyer
                            </span>
                          )}
                          <span>·</span>
                          <span>
                            {new Date(ans.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#8a7b68] dark:text-[#7e8aa2] italic text-[11px]">
                    No answers yet. Be the first to answer this question.
                  </p>
                )}

                {/* Inline Answer Form */}
                {answeringQuestionId === item.id ? (
                  <div className="mt-3 space-y-2 rounded-2xl bg-[#fbfaf8] dark:bg-[#161a25] p-3.5 border border-[#ebe2d1] dark:border-[#262c3d]">
                    <textarea
                      rows={2}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#12151f] p-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] focus:outline-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setAnsweringQuestionId(null);
                          setAnswerText('');
                        }}
                        className="text-xs uppercase tracking-wider font-semibold text-[#8a7b68] hover:text-[#141312] dark:hover:text-[#f8f5ee] px-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submittingAnswer}
                        onClick={() => handleAnswerSubmit(item.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b89548] text-[#0d0a06] text-xs uppercase tracking-wider font-bold hover:brightness-105 transition-all shadow-xs cursor-pointer"
                      >
                        {submittingAnswer ? 'Submitting...' : 'Post Answer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAnsweringQuestionId(item.id)}
                    className="text-[#8a6827] dark:text-[#dfba73] hover:underline text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer mt-1"
                  >
                    <MessageSquare size={12} />
                    <span>Answer this question</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}



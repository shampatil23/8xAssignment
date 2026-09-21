'use client';
// ============================================================================
// Admin Reviews Moderation — Customer Ratings & Review Content Moderation
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Star,
  ShieldCheck,
  Flag,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import {
  fetchAdminReviews,
  moderateAdminReview,
  removeAdminReview,
} from '@/services/adminService';
import type { Review } from '@/types';
import { Button } from '@/components/ui/Button';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetReview, setTargetReview] = useState<Review | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminReviews();
    if (res.success && res.data) {
      setReviews(res.data);
    } else {
      setError(res.error || 'Failed to load reviews.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        r.title.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.productId.toLowerCase().includes(q);

      const matchesRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter);
      const currentStatus = r.status || 'approved';
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, searchQuery, ratingFilter, statusFilter]);

  const handleModerateStatus = async (
    review: Review,
    status: 'approved' | 'hidden' | 'flagged',
  ) => {
    const res = await moderateAdminReview(review.productId, review.id, status);
    if (res.success) {
      setSuccessMessage(`Review status set to ${status}.`);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status } : r)),
      );
    } else {
      setError(res.error || 'Failed to update review status.');
    }
  };

  const handlePurgeReview = async () => {
    if (!targetReview) return;
    setActionLoading(true);
    try {
      const res = await removeAdminReview(targetReview.productId, targetReview.id);
      if (res.success) {
        setSuccessMessage('Review has been permanently purged.');
        setReviews((prev) => prev.filter((r) => r.id !== targetReview.id));
      } else {
        setError(res.error || 'Failed to delete review.');
      }
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
      setTargetReview(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              Review Moderation Feed
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit customer product reviews, filter spam or inappropriate remarks, and maintain rating integrity.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadReviews}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between text-emerald-800 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-900"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between text-red-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search comments, reviewer name, product ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <span className="text-xs text-slate-500 ml-2">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="hidden">Hidden</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        {/* Reviews Feed */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white p-8 text-center text-xs text-slate-500 rounded-xl border">
              Loading reviews...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white p-8 text-center text-xs text-slate-400 rounded-xl border">
              No reviews found matching filters.
            </div>
          ) : (
            filteredReviews.map((rev) => {
              const status = rev.status || 'approved';
              return (
                <div
                  key={rev.id}
                  className={`bg-white rounded-xl border p-4 shadow-xs transition-colors ${
                    status === 'hidden'
                      ? 'border-slate-300 bg-slate-50/70 opacity-75'
                      : status === 'flagged'
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {/* Left: Content */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }
                            />
                          ))}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate max-w-sm">
                          {rev.title}
                        </h4>

                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                            status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'hidden'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {status}
                        </span>

                        {rev.verifiedPurchase && (
                          <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                            <ShieldCheck size={11} />
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{rev.body}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>By <strong className="text-slate-600">{rev.userName}</strong></span>
                        <span>• Product: <strong className="text-slate-600">{rev.productId}</strong></span>
                        <span>• {new Date(rev.createdAt).toLocaleDateString()}</span>
                        {rev.helpfulCount > 0 && <span>• {rev.helpfulCount} people found helpful</span>}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      {status === 'hidden' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerateStatus(rev, 'approved')}
                          className="h-7 text-[11px] text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                        >
                          <Eye size={12} className="mr-1" />
                          Approve
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerateStatus(rev, 'hidden')}
                          className="h-7 text-[11px] text-slate-600 hover:bg-slate-100"
                        >
                          <EyeOff size={12} className="mr-1" />
                          Hide
                        </Button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setTargetReview(rev);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Purge Review"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Confirmation Modal ── */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Permanently Purge Review"
          message="Are you sure you want to permanently delete this customer review? The product average rating and review count will be automatically recalculated."
          confirmText="Yes, Purge Review"
          variant="danger"
          isLoading={actionLoading}
          onConfirm={handlePurgeReview}
          onCancel={() => {
            setDeleteModalOpen(false);
            setTargetReview(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}

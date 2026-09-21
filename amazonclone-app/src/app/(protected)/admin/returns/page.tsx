'use client';
// ============================================================================
// Admin Returns & Refunds — Return Request Approval & Refund Execution
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  RotateCcw,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  Clock,
  CheckCircle2,
  DollarSign,
  Package,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { fetchAdminReturns, processAdminReturn } from '@/services/adminService';
import type { ReturnRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Return for Modal
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  // Confirmation Modal for Status Advance
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [targetReturn, setTargetReturn] = useState<ReturnRequest | null>(null);
  const [nextStatus, setNextStatus] = useState<ReturnRequest['status']>('RETURN_APPROVED');
  const [actionLoading, setActionLoading] = useState(false);

  const loadReturns = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminReturns();
    if (res.success && res.data) {
      setReturns(res.data);
    } else {
      setError(res.error || 'Failed to load return requests.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.itemTitle.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [returns, searchQuery, statusFilter]);

  const handleOpenAdvance = (req: ReturnRequest, status: ReturnRequest['status']) => {
    setTargetReturn(req);
    setNextStatus(status);
    setConfirmModalOpen(true);
  };

  const handleExecuteAdvance = async () => {
    if (!targetReturn) return;
    setActionLoading(true);

    try {
      const res = await processAdminReturn(
        targetReturn.id,
        targetReturn.orderId,
        targetReturn.userId,
        nextStatus,
      );

      if (res.success) {
        setSuccessMessage(`Return request #${targetReturn.id.slice(-6)} transitioned to ${nextStatus}.`);
        setReturns((prev) =>
          prev.map((r) => (r.id === targetReturn.id ? { ...r, status: nextStatus } : r)),
        );
        if (selectedReturn && selectedReturn.id === targetReturn.id) {
          setSelectedReturn({ ...selectedReturn, status: nextStatus });
        }
      } else {
        setError(res.error || 'Failed to update return status.');
      }
    } finally {
      setActionLoading(false);
      setConfirmModalOpen(false);
      setTargetReturn(null);
    }
  };

  const getStatusStepBadge = (status: ReturnRequest['status']) => {
    switch (status) {
      case 'REFUNDED':
        return <span className="bg-[#ebf8fa] text-[#007600] border border-[#a2d8df] rounded px-2 py-0.5 text-[10px] font-bold">Refunded</span>;
      case 'REFUND_PENDING':
        return <span className="bg-amber-50 text-[#b12704] border border-amber-200 rounded px-2 py-0.5 text-[10px] font-bold">Refund Pending</span>;
      case 'RETURNED':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 rounded px-2 py-0.5 text-[10px] font-bold">Item Returned</span>;
      case 'RETURN_APPROVED':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 rounded px-2 py-0.5 text-[10px] font-bold">Return Approved</span>;
      default:
        return <span className="bg-amber-50 text-[#b12704] border border-amber-200 rounded px-2 py-0.5 text-[10px] font-bold">Request Pending</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-[#0f1111] flex items-center gap-2">
              <RotateCcw className="h-6 w-6 text-amazon-orange" />
              Returns & Refunds Queue
            </h1>
            <p className="text-xs text-[#565959] mt-1">
              Process customer return claims, inspect dispute items, approve RMA, and disburse refunds.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadReturns}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-[#0f1111] border-[#d5d9d9] hover:bg-[#f7fafa] cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-amazon-orange' : 'text-[#565959]'} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 flex items-center justify-between text-emerald-900 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#007600]" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex items-center justify-between text-red-900 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-[#d5d9d9] shadow-xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#565959]" />
            <input
              type="text"
              placeholder="Search by request ID, order ID, product title, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#565959]">Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded border border-[#d5d9d9] bg-white text-[#0f1111] focus:border-[#e77600] focus:outline-hidden"
            >
              <option value="all">All Stages</option>
              <option value="RETURN_REQUESTED">Pending Request</option>
              <option value="RETURN_APPROVED">Approved</option>
              <option value="RETURNED">Item Returned</option>
              <option value="REFUND_PENDING">Refund Pending</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading return requests...</div>
          ) : filteredReturns.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No return or refund requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Item & Claim</th>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Refund Amount</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReturns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100 border border-slate-200">
                            {r.itemImage ? (
                              <Image src={r.itemImage} alt={r.itemTitle} fill className="object-contain p-0.5" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <Package size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <p className="font-bold text-slate-900 truncate" title={r.itemTitle}>
                              {r.itemTitle}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Qty: {r.quantity} • User: {r.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        #{r.orderId.slice(-8)}
                      </td>

                      <td className="py-3 px-4 text-slate-700 max-w-[180px] truncate" title={r.reason}>
                        {r.reason}
                      </td>

                      <td className="py-3 px-4 font-black text-slate-900">
                        {formatPrice(r.refundAmount)}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusStepBadge(r.status)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReturn(r)}
                            className="p-1.5 rounded text-[#565959] hover:text-[#007185] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye size={15} />
                          </button>

                          {/* State Progression Controls */}
                          {r.status === 'RETURN_REQUESTED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAdvance(r, 'RETURN_APPROVED')}
                              className="h-7 text-[10px] bg-amazon-yellow hover:bg-amazon-yellow-dark text-[#0f1111] border border-[#fcd200] font-bold"
                            >
                              Approve Return
                            </Button>
                          )}

                          {r.status === 'RETURN_APPROVED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAdvance(r, 'RETURNED')}
                              className="h-7 text-[10px] text-blue-700 hover:bg-blue-50 border-blue-200"
                            >
                              Mark Received
                            </Button>
                          )}

                          {r.status === 'RETURNED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAdvance(r, 'REFUND_PENDING')}
                              className="h-7 text-[10px] text-amber-700 hover:bg-amber-50 border-amber-200"
                            >
                              Queue Refund
                            </Button>
                          )}

                          {r.status === 'REFUND_PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAdvance(r, 'REFUNDED')}
                              className="h-7 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300"
                            >
                              Disburse Refund
                            </Button>
                          )}

                          {r.status === 'REFUNDED' && (
                            <span className="text-[11px] text-emerald-600 font-bold px-1 flex items-center gap-0.5">
                              <CheckCircle2 size={13} />
                              Complete
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Details Modal ── */}
        {selectedReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSelectedReturn(null)}
            />
            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl z-10 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Return Claim #{selectedReturn.id.slice(-8)}
                  </h3>
                  <p className="text-xs text-slate-400">Order: #{selectedReturn.orderId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-100">
                <span className="text-xs font-bold text-slate-600">Status:</span>
                {getStatusStepBadge(selectedReturn.status)}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Item:</span>
                  <p className="text-slate-900 mt-0.5 font-semibold">{selectedReturn.itemTitle}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Return Reason:</span>
                  <p className="text-slate-600 mt-0.5">{selectedReturn.reason}</p>
                </div>
                {selectedReturn.note && (
                  <div>
                    <span className="font-bold text-slate-700">Customer Comments:</span>
                    <p className="text-slate-600 mt-0.5 italic">{selectedReturn.note}</p>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
                  <span>Refund Amount:</span>
                  <span className="text-emerald-700 text-sm">{formatPrice(selectedReturn.refundAmount)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReturn(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Confirmation Modal ── */}
        <ConfirmationModal
          isOpen={confirmModalOpen}
          title="Advance Return / Refund Workflow"
          message={`Are you sure you want to transition this return request to "${nextStatus}"? This will update the return status across customer account, order history, and platform metrics.`}
          confirmText="Confirm State Update"
          variant="primary"
          isLoading={actionLoading}
          onConfirm={handleExecuteAdvance}
          onCancel={() => {
            setConfirmModalOpen(false);
            setTargetReturn(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}

'use client';
// ============================================================================
// Admin Sellers Management — Merchant Oversight, Store Health & Governance
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Store,
  Search,
  RefreshCw,
  Package,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  UserCheck,
  UserX,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import {
  fetchAdminSellers,
  updateAdminUserStatus,
  approveAdminSeller,
  rejectAdminSeller,
  type SellerOverview,
} from '@/services/adminService';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');

  // Details Modal
  const [selectedSeller, setSelectedSeller] = useState<SellerOverview | null>(null);

  // Confirm Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [targetSeller, setTargetSeller] = useState<SellerOverview | null>(null);
  const [targetAction, setTargetAction] = useState<'suspend' | 'activate' | 'approve' | 'reject'>('suspend');
  const [actionLoading, setActionLoading] = useState(false);

  const loadSellers = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminSellers();
    if (res.success && res.data) {
      setSellers(res.data);
    } else {
      setError(res.error || 'Failed to load seller directory.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      const name = s.user.displayName?.toLowerCase() || '';
      const email = s.user.email?.toLowerCase() || '';
      const uid = s.user.uid.toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = q === '' || name.includes(q) || email.includes(q) || uid.includes(q);
      const isSuspended = s.user.status === 'suspended';
      const isPending = s.user.status === 'pending';
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'suspended'
          ? isSuspended
          : statusFilter === 'pending'
            ? isPending
            : s.user.status === 'active' || (!isSuspended && !isPending));

      return matchesSearch && matchesStatus;
    });
  }, [sellers, searchQuery, statusFilter]);

  const pendingSellersCount = sellers.filter((s) => s.user.status === 'pending').length;

  const handleOpenConfirm = (
    seller: SellerOverview,
    action: 'suspend' | 'activate' | 'approve' | 'reject',
  ) => {
    setTargetSeller(seller);
    setTargetAction(action);
    setConfirmModalOpen(true);
  };

  const handleExecuteAction = async () => {
    if (!targetSeller) return;
    setActionLoading(true);

    try {
      if (targetAction === 'approve') {
        const res = await approveAdminSeller(targetSeller.user.uid);
        if (res.success) {
          setSuccessMessage(
            `Seller "${targetSeller.user.displayName || targetSeller.user.email}" has been verified & approved. Their products are now live in the marketplace!`,
          );
          setSellers((prev) =>
            prev.map((s) =>
              s.user.uid === targetSeller.user.uid
                ? {
                    ...s,
                    user: {
                      ...s.user,
                      status: 'active',
                      sellerApplication: s.user.sellerApplication
                        ? { ...s.user.sellerApplication, verificationStatus: 'approved' }
                        : undefined,
                    },
                  }
                : s,
            ),
          );
        } else {
          setError(res.error || 'Failed to approve seller.');
        }
      } else if (targetAction === 'reject') {
        const res = await rejectAdminSeller(targetSeller.user.uid);
        if (res.success) {
          setSuccessMessage(
            `Seller application for "${targetSeller.user.displayName || targetSeller.user.email}" has been declined.`,
          );
          setSellers((prev) =>
            prev.map((s) =>
              s.user.uid === targetSeller.user.uid
                ? {
                    ...s,
                    user: {
                      ...s.user,
                      status: 'suspended',
                      sellerApplication: s.user.sellerApplication
                        ? { ...s.user.sellerApplication, verificationStatus: 'rejected' }
                        : undefined,
                    },
                  }
                : s,
            ),
          );
        } else {
          setError(res.error || 'Failed to reject seller.');
        }
      } else {
        const nextStatus = targetAction === 'suspend' ? 'suspended' : 'active';
        const res = await updateAdminUserStatus(targetSeller.user.uid, nextStatus);

        if (res.success) {
          setSuccessMessage(`Seller ${targetSeller.user.displayName || targetSeller.user.email} is now ${nextStatus}.`);
          setSellers((prev) =>
            prev.map((s) =>
              s.user.uid === targetSeller.user.uid
                ? { ...s, user: { ...s.user, status: nextStatus } }
                : s,
            ),
          );
        } else {
          setError(res.error || 'Failed to update seller status.');
        }
      }
    } finally {
      setActionLoading(false);
      setConfirmModalOpen(false);
      setTargetSeller(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-[#0f1111] flex items-center gap-2">
              <Store className="h-6 w-6 text-amazon-orange" />
              Sellers & Merchants
            </h1>
            <p className="text-xs text-[#565959] mt-1">
              Oversee marketplace sellers, monitor catalog volume, fulfillments, and manage merchant privileges.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadSellers}
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
              placeholder="Search by store name, email, or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#565959]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs rounded border border-[#d5d9d9] bg-white text-[#0f1111] focus:border-[#e77600] focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Verification ({pendingSellersCount})</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Pending Verification Banner */}
        {pendingSellersCount > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                {pendingSellersCount}
              </div>
              <div className="text-xs text-amber-950">
                <p className="font-bold text-sm">
                  {pendingSellersCount} Merchant Application{pendingSellersCount > 1 ? 's' : ''} Awaiting Review
                </p>
                <p className="text-amber-800">
                  New sellers registered via /sell are pending your approval before their products become officially listed.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('pending')}
              className="text-xs border-amber-400 text-amber-950 hover:bg-amber-100 whitespace-nowrap"
            >
              View Verification Queue
            </Button>
          </div>
        )}

        {/* Sellers Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading sellers...</div>
          ) : filteredSellers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No sellers registered or found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Merchant Store</th>
                    <th className="py-3 px-4">Products</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Gross Revenue</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSellers.map((s) => (
                    <tr key={s.user.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-800 font-black flex items-center justify-center shrink-0">
                            <Store size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {s.user.displayName || 'Merchant Partner'}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{s.user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{s.totalProducts} Total</span>
                          <span className="text-[10px] text-emerald-600 font-medium">
                            {s.activeProducts} Active
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-800">
                        {s.totalOrders}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {formatPrice(s.totalRevenue)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                            s.user.status === 'pending'
                              ? 'text-amber-600'
                              : s.user.status === 'suspended'
                                ? 'text-red-600'
                                : 'text-emerald-600'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              s.user.status === 'pending'
                                ? 'bg-amber-500'
                                : s.user.status === 'suspended'
                                  ? 'bg-red-500'
                                  : 'bg-emerald-500'
                            }`}
                          />
                          {s.user.status === 'pending'
                            ? 'Pending Verification'
                            : s.user.status === 'suspended'
                              ? 'Suspended'
                              : 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSeller(s)}
                            className="p-1.5 rounded text-[#565959] hover:text-[#007185] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Inspect Merchant"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/products?seller=${encodeURIComponent(s.user.uid)}`}
                            className="text-[11px] font-semibold text-[#007185] hover:text-[#c7511f] hover:underline px-1.5"
                          >
                            Products
                          </Link>

                          {s.user.status === 'pending' ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenConfirm(s, 'approve')}
                                className="h-7 text-[11px] bg-amazon-yellow hover:bg-amazon-yellow-dark text-[#0f1111] border border-[#fcd200] font-bold"
                              >
                                Approve & Verify
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenConfirm(s, 'reject')}
                                className="h-7 text-[11px] border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : s.user.status === 'suspended' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenConfirm(s, 'activate')}
                              className="h-7 text-[11px] border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            >
                              Activate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenConfirm(s, 'suspend')}
                              className="h-7 text-[11px] border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Suspend
                            </Button>
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

        {/* ── Seller Details Modal ── */}
        {selectedSeller && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSelectedSeller(null)}
            />
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl z-10 border border-[#d5d9d9] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eaeded]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 text-amazon-orange flex items-center justify-center border border-amber-200">
                    <Store size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0f1111]">
                      {selectedSeller.user.displayName || 'Merchant Partner'}
                    </h3>
                    <p className="text-xs text-[#565959] font-mono">UID: {selectedSeller.user.uid}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSeller(null)}
                  className="text-slate-400 hover:text-[#0f1111] p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded bg-[#f7fafa] p-3 border border-[#d5d9d9]">
                  <span className="text-[10px] uppercase font-bold text-[#565959]">Total Listings</span>
                  <p className="text-lg font-bold text-[#0f1111] mt-1">
                    {selectedSeller.totalProducts}
                  </p>
                </div>
                <div className="rounded bg-[#f7fafa] p-3 border border-[#d5d9d9]">
                  <span className="text-[10px] uppercase font-bold text-[#565959]">Active Listings</span>
                  <p className="text-lg font-bold text-[#007600] mt-1">
                    {selectedSeller.activeProducts}
                  </p>
                </div>
                <div className="rounded bg-[#f7fafa] p-3 border border-[#d5d9d9]">
                  <span className="text-[10px] uppercase font-bold text-[#565959]">Orders Fulfilled</span>
                  <p className="text-lg font-bold text-[#0f1111] mt-1">
                    {selectedSeller.totalOrders}
                  </p>
                </div>
                <div className="rounded bg-[#f7fafa] p-3 border border-[#d5d9d9]">
                  <span className="text-[10px] uppercase font-bold text-[#565959]">Total Revenue</span>
                  <p className="text-sm font-bold text-[#007600] mt-1 truncate">
                    {formatPrice(selectedSeller.totalRevenue)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#eaeded]">
                  <span className="text-[#565959]">Contact Email:</span>
                  <span className="font-semibold text-[#0f1111]">{selectedSeller.user.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eaeded]">
                  <span className="text-[#565959]">Merchant Account Status:</span>
                  <span className="font-semibold text-[#0f1111] capitalize">
                    {selectedSeller.user.status || 'Active'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eaeded]">
                  <span className="text-[#565959]">Joined Marketplace:</span>
                  <span className="font-semibold text-[#0f1111]">
                    {new Date(selectedSeller.user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#eaeded] flex items-center justify-between">
                <Link
                  href={`/admin/products?seller=${encodeURIComponent(selectedSeller.user.uid)}`}
                  className="text-xs font-bold text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1"
                >
                  <span>Inspect Seller Catalog</span>
                  <ExternalLink size={12} />
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSeller(null)}
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
          title={
            targetAction === 'approve'
              ? 'Approve & Verify Merchant Store'
              : targetAction === 'reject'
                ? 'Decline Merchant Application'
                : targetAction === 'suspend'
                  ? 'Suspend Merchant Store'
                  : 'Activate Merchant Store'
          }
          message={
            targetAction === 'approve'
              ? `Are you sure you want to approve "${targetSeller?.user.displayName || targetSeller?.user.email}"? This will officially verify their seller account and publish all of their products to the marketplace!`
              : targetAction === 'reject'
                ? `Decline seller application for "${targetSeller?.user.displayName || targetSeller?.user.email}"?`
                : targetAction === 'suspend'
                  ? `Are you sure you want to suspend merchant "${targetSeller?.user.displayName || targetSeller?.user.email}"? Their active products will become restricted and they will lose access to Seller Central.`
                  : `Re-activate merchant privileges for "${targetSeller?.user.displayName || targetSeller?.user.email}"?`
          }
          confirmText={
            targetAction === 'approve'
              ? 'Yes, Approve & Verify'
              : targetAction === 'reject'
                ? 'Decline Application'
                : targetAction === 'suspend'
                  ? 'Yes, Suspend Merchant'
                  : 'Activate Merchant'
          }
          variant={targetAction === 'suspend' || targetAction === 'reject' ? 'danger' : 'primary'}
          isLoading={actionLoading}
          onConfirm={handleExecuteAction}
          onCancel={() => {
            setConfirmModalOpen(false);
            setTargetSeller(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}

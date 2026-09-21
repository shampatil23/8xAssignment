'use client';
// ============================================================================
// Admin Promotions — Promotional Coupons, Discount Rates & Validity Windows
// ============================================================================
import React, { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Calendar,
  DollarSign,
  Percent,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import {
  fetchAdminPromotions,
  saveAdminPromotion,
  deleteAdminPromotion,
} from '@/services/adminService';
import type { Promotion } from '@/types';
import { Button } from '@/components/ui/Button';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Modal Create/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [promoId, setPromoId] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete Confirm
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetPromo, setTargetPromo] = useState<Promotion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPromotions = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminPromotions();
    if (res.success && res.data) {
      setPromotions(res.data);
    } else {
      setError(res.error || 'Failed to load promotions.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const filteredPromotions = promotions.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      q === '' ||
      p.code.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setPromoId(`promo-${Date.now()}`);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderAmount(0);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (promo: Promotion) => {
    setIsEditing(true);
    setPromoId(promo.id);
    setCode(promo.code);
    setDescription(promo.description);
    setDiscountType(promo.discountType);
    setDiscountValue(promo.discountValue);
    setMinOrderAmount(promo.minOrderAmount || 0);
    setStartDate(promo.startDate.split('T')[0]);
    setEndDate(promo.endDate.split('T')[0]);
    setIsActive(promo.isActive);
    setModalOpen(true);
  };

  const handleToggleActive = async (promo: Promotion) => {
    const updated: Promotion = { ...promo, isActive: !promo.isActive };
    const res = await saveAdminPromotion(updated);
    if (res.success) {
      setSuccessMessage(`Promotion "${promo.code}" is now ${updated.isActive ? 'active' : 'disabled'}.`);
      setPromotions((prev) => prev.map((p) => (p.id === promo.id ? updated : p)));
    } else {
      setError(res.error || 'Failed to toggle promotion status.');
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Promo code is required.');
      return;
    }
    if (discountValue <= 0) {
      setError('Discount value must be greater than zero.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Promotion = {
      id: promoId,
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive,
      createdAt: isEditing
        ? promotions.find((p) => p.id === promoId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    const res = await saveAdminPromotion(payload);
    if (res.success) {
      setSuccessMessage(`Promotion "${payload.code}" saved.`);
      setPromotions((prev) => {
        const idx = prev.findIndex((p) => p.id === payload.id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = payload;
          return arr;
        }
        return [...prev, payload];
      });
      setModalOpen(false);
    } else {
      setError(res.error || 'Failed to save promotion.');
    }
    setSaving(false);
  };

  const handleDeletePromo = async () => {
    if (!targetPromo) return;
    setDeleting(true);
    const res = await deleteAdminPromotion(targetPromo.id);
    if (res.success) {
      setSuccessMessage(`Promotion "${targetPromo.code}" deleted.`);
      setPromotions((prev) => prev.filter((p) => p.id !== targetPromo.id));
    } else {
      setError(res.error || 'Failed to delete promotion.');
    }
    setDeleting(false);
    setDeleteModalOpen(false);
    setTargetPromo(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-[#0f1111] flex items-center gap-2">
              <Tag className="h-6 w-6 text-amazon-orange" />
              Promotions & Coupons
            </h1>
            <p className="text-xs text-[#565959] mt-1">
              Create marketing campaigns, configure percent/fixed discounts, and schedule promotional eligibility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPromotions}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-[#0f1111] border-[#d5d9d9] hover:bg-[#f7fafa] cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-amazon-orange' : 'text-[#565959]'} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 text-xs bg-amazon-yellow hover:bg-amazon-yellow-dark text-[#0f1111] border border-[#fcd200] font-bold cursor-pointer"
            >
              <Plus size={14} />
              <span>New Promotion</span>
            </Button>
          </div>
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

        {/* Search */}
        <div className="bg-white p-4 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#565959]" />
            <input
              type="text"
              placeholder="Search by promo code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
            />
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-xs text-[#565959]">
              Loading active promotions...
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-[#565959]">
              No promotional campaigns found. Click &quot;New Promotion&quot; to configure one.
            </div>
          ) : (
            filteredPromotions.map((promo) => {
              const isExpired = new Date(promo.endDate).getTime() < Date.now();
              return (
                <div
                  key={promo.id}
                  className={`rounded-lg border p-5 shadow-xs flex flex-col justify-between transition-colors bg-white ${
                    !promo.isActive || isExpired ? 'border-[#d5d9d9] bg-[#f7fafa] opacity-75' : 'border-[#d5d9d9]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-[#0f1111] tracking-wider">
                            {promo.code}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              !promo.isActive
                                ? 'bg-slate-100 text-[#565959]'
                                : isExpired
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-[#ebf8fa] text-[#007600] border border-[#a2d8df]'
                            }`}
                          >
                            {!promo.isActive ? 'Disabled' : isExpired ? 'Expired' : 'Active'}
                          </span>
                        </div>
                        <p className="text-xs text-[#565959] mt-1">{promo.description}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(promo)}
                          className="p-1 rounded text-[#565959] hover:text-[#007185] hover:bg-slate-100 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetPromo(promo);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Benefit:</span>
                        <span className="font-bold text-slate-900">
                          {promo.discountType === 'percentage'
                            ? `${promo.discountValue}% OFF`
                            : `$${promo.discountValue} OFF`}
                        </span>
                      </div>
                      {promo.minOrderAmount ? (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Min Order:</span>
                          <span className="font-semibold text-slate-800">${promo.minOrderAmount}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Valid Through:</span>
                        <span className="text-slate-700">
                          {new Date(promo.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(promo)}
                      className={`text-xs font-semibold hover:underline cursor-pointer ${
                        promo.isActive ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {promo.isActive ? 'Disable Campaign' : 'Enable Campaign'}
                    </button>
                    <span className="text-[10px] text-slate-400">ID: {promo.id.slice(-6)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Create / Edit Modal ── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setModalOpen(false)}
            />
            <form
              onSubmit={handleSavePromo}
              className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl z-10 border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {isEditing ? 'Edit Promotion' : 'Create Promotion'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Promo Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PRIME20, SUMMER50"
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0f1111] block mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 20% discount on orders over $50"
                    className="w-full px-3 py-2 text-xs rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#0f1111] block mb-1">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full py-2 px-2.5 text-xs rounded border border-[#d5d9d9] bg-white text-[#0f1111] focus:border-[#e77600] focus:outline-hidden"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#0f1111] block mb-1">
                      Discount Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#0f1111] block mb-1">
                    Minimum Order Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0 for no minimum"
                    className="w-full px-3 py-2 text-xs rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#0f1111] block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[#d5d9d9] bg-white text-[#0f1111]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#0f1111] block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[#d5d9d9] bg-white text-[#0f1111]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActivePromo"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-amazon-orange focus:ring-amazon-orange cursor-pointer"
                  />
                  <label htmlFor="isActivePromo" className="text-xs font-bold text-[#0f1111] cursor-pointer">
                    Enable this promotion immediately
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#eaeded] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                  className="bg-amazon-yellow hover:bg-amazon-yellow-dark text-[#0f1111] border border-[#fcd200] font-bold"
                >
                  {isEditing ? 'Save Changes' : 'Publish Promotion'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Delete Promotional Campaign"
          message={`Are you sure you want to delete promo code "${targetPromo?.code}"? Customers will no longer be able to apply it at checkout.`}
          confirmText="Yes, Delete Promo"
          variant="danger"
          isLoading={deleting}
          onConfirm={handleDeletePromo}
          onCancel={() => {
            setDeleteModalOpen(false);
            setTargetPromo(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}

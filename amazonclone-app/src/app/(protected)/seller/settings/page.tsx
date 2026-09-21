'use client';
// ============================================================================
// Seller Settings Page — /seller/settings
// Store profile, business info, and merchant fulfillment configurations
// ============================================================================
import React, { useState } from 'react';
import {
  Settings,
  Store,
  Mail,
  Phone,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { updateSellerSettings } from '@/services/sellerService';

export default function SellerSettingsPage() {
  const { user } = useAuth();

  const [storeName, setStoreName] = useState(user?.displayName || 'My Marketplace Store');
  const [businessEmail, setBusinessEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 (800) 555-0199');
  const [storeDescription, setStoreDescription] = useState(
    'Premier provider of certified consumer electronics, computers, and home essentials.',
  );
  const [standardDeliveryDays, setStandardDeliveryDays] = useState(2);
  const [returnWindowDays, setReturnWindowDays] = useState(30);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!storeName.trim()) {
      setErrorMessage('Store Name cannot be blank.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await updateSellerSettings(user.uid, {
        storeName: storeName.trim(),
        businessEmail: businessEmail.trim(),
        phone: phone.trim(),
        storeDescription: storeDescription.trim(),
        standardDeliveryDays,
        returnWindowDays,
      });

      if (res.success) {
        setSuccessMessage('Store settings updated successfully.');
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage(res.error || 'Failed to update store settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-3xl space-y-6 text-xs">
        {/* Toast alerts */}
        {successMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-bounce">
            <CheckCircle2 size={18} strokeWidth={3} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Store Profile &amp; Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your merchant identity, customer-facing contact details, and default delivery policies
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* ── Merchant Identity ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Store size={16} className="text-amazon-orange" />
              <h2 className="text-sm font-bold text-gray-900">Merchant Identity</h2>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                Store / Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none font-semibold text-gray-900"
                required
              />
              <p className="text-[11px] text-gray-500 mt-1">
                This name is displayed to customers on product pages (&ldquo;Sold by {storeName}&rdquo;).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-800 mb-1">
                  Business Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                    required
                  />
                  <Mail size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-800 mb-1">
                  Customer Support Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                  />
                  <Phone size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                Storefront Description
              </label>
              <textarea
                rows={3}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="Tell customers about your company and values..."
                className="w-full rounded-md border border-gray-300 p-2.5 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
              />
            </div>
          </div>

          {/* ── Fulfillment Defaults ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Clock size={16} className="text-amazon-orange" />
              <h2 className="text-sm font-bold text-gray-900">Fulfillment &amp; Policy Defaults</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-800 mb-1">
                  Default Handling &amp; Transit Time (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={standardDeliveryDays}
                  onChange={(e) => setStandardDeliveryDays(parseInt(e.target.value, 10))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Used for calculating standard estimated delivery dates.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-800 mb-1">
                  Return Window (Days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="90"
                  value={returnWindowDays}
                  onChange={(e) => setReturnWindowDays(parseInt(e.target.value, 10))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Standard Amazon marketplace return window is 30 days.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-3 border border-green-200 flex items-start gap-2 text-green-800 text-[11px]">
              <ShieldCheck size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Verified Seller Protections Active</p>
                <p className="mt-0.5">
                  Your store transactions are protected by Amazon Clone merchant guarantees and 256-bit SSL encrypted checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="buy-now"
              disabled={saving}
              className="text-xs font-bold px-6 py-2.5 shadow-xs flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <span>Save Store Settings</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}

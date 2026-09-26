'use client';
// ============================================================================
// Seller Settings Page — /seller/settings
// Valenza Maison Partner Atelier Profile & Policies Configuration
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
  Crown,
  Gem,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { useAuth } from '@/hooks/useAuth';
import { updateSellerSettings } from '@/services/sellerService';

export default function SellerSettingsPage() {
  const { user } = useAuth();

  const [storeName, setStoreName] = useState(user?.displayName || 'My Atelier Store');
  const [businessEmail, setBusinessEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 (800) 555-0199');
  const [storeDescription, setStoreDescription] = useState(
    'Premier provider of Swiss horology, haute joaillerie, and bespoke artisan creations.',
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
      setErrorMessage('Atelier Name cannot be blank.');
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
        setSuccessMessage('Atelier settings updated successfully.');
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage(res.error || 'Failed to update atelier settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-3xl space-y-6 text-xs text-[#141312] dark:text-[#f8f5ee]">
        
        {/* Toast alerts */}
        {successMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#141312] dark:bg-[#1c2230] text-[#f8f5ee] px-5 py-3.5 shadow-2xl border border-[#c5a059]/50 text-xs flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={16} className="text-[#dfba73] shrink-0" />
            <span className="font-serif font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl bg-red-50 dark:bg-[#241012] p-4 text-xs text-red-700 dark:text-red-300 border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span className="font-serif">{errorMessage}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f1e6] dark:bg-[#1c2333] border border-[#d6be90]/40 dark:border-[#c5a059]/30 text-[10px] font-serif font-bold uppercase tracking-[0.24em] text-[#8a6827] dark:text-[#dfba73] mb-2.5 shadow-2xs">
            <Crown size={11} className="text-[#c5a059]" />
            <span>Atelier Profile</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
            Maison Atelier Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] leading-relaxed">
            Manage your partner atelier credentials, client-facing contact details, and default transit policies.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* ── Merchant Identity ── */}
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-sm font-serif font-bold text-[#141312] dark:text-[#f8f5ee] border-b border-[#f0eae0] dark:border-[#1e2433] pb-3 flex items-center gap-2">
              <Store size={15} className="text-[#c5a059]" />
              <span>Atelier Brand &amp; Identity</span>
            </h2>

            <div>
              <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
                Atelier / Store Name <span className="text-[#c5a059]">*</span>
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
                  Business Concierge Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] pl-9 pr-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-[#9e978b]" />
                </div>
              </div>

              <div>
                <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
                  Concierge Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] pl-9 pr-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
                  />
                  <Phone size={14} className="absolute left-3 top-3 text-[#9e978b]" />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
                Atelier Provenance &amp; Bio
              </label>
              <textarea
                rows={3}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] p-3.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* ── Transit & Policy ── */}
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-sm font-serif font-bold text-[#141312] dark:text-[#f8f5ee] border-b border-[#f0eae0] dark:border-[#1e2433] pb-3 flex items-center gap-2">
              <Clock size={15} className="text-[#c5a059]" />
              <span>Fulfillment &amp; Concierge Policies</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
                  Standard Transit Time (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={standardDeliveryDays}
                  onChange={(e) => setStandardDeliveryDays(parseInt(e.target.value, 10))}
                  className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
                  Private Return Window (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={returnWindowDays}
                  onChange={(e) => setReturnWindowDays(parseInt(e.target.value, 10))}
                  className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── Submit Action ── */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-2.5 rounded-full text-xs font-serif tracking-widest uppercase font-bold text-[#121110] bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#9b7532] hover:brightness-105 active:scale-98 border border-[#c5a059]/50 shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Save Atelier Settings</span>
            </button>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}

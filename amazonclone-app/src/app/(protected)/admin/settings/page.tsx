'use client';
// ============================================================================
// Admin Settings — Marketplace Platform Configuration & Admin Profile
// ============================================================================
import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  Globe,
  Sliders,
  DollarSign,
  User,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchAdminSettings, saveAdminSettings } from '@/services/adminService';
import type { PlatformSettings } from '@/types';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminSettings();
    if (res.success && res.data) {
      setSettings(res.data);
    } else {
      setError(res.error || 'Failed to load platform settings.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);

    const res = await saveAdminSettings(settings);
    if (res.success) {
      setSuccessMessage('Platform settings have been saved successfully.');
    } else {
      setError(res.error || 'Failed to update platform settings.');
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-[#0f1111] flex items-center gap-2">
              <Settings className="h-6 w-6 text-amazon-orange" />
              Platform Settings
            </h1>
            <p className="text-xs text-[#565959] mt-1">
              Configure marketplace-wide business logic, shipping rules, tax settings, and system flags.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadSettings}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-[#0f1111] border-[#d5d9d9] hover:bg-[#f7fafa] cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-amazon-orange' : 'text-[#565959]'} />
            <span>Reload Settings</span>
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

        {loading || !settings ? (
          <div className="bg-white rounded-lg border border-[#d5d9d9] p-12 text-center text-xs text-[#565959]">
            Loading settings configuration...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* General Marketplace Configuration */}
            <div className="bg-white rounded-lg border border-[#d5d9d9] p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#0f1111] flex items-center gap-2 pb-3 border-b border-[#eaeded]">
                <Globe size={16} className="text-amazon-orange" />
                Marketplace Identity & Support
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-[#0f1111] block mb-1">Store / Site Name</label>
                  <input
                    type="text"
                    required
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0f1111] block mb-1">Customer Support Email</label>
                  <input
                    type="email"
                    required
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0f1111] block mb-1">Platform Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#d5d9d9] bg-white text-[#0f1111] focus:border-[#e77600] focus:outline-hidden"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial & Shipping Logistics */}
            <div className="bg-white rounded-lg border border-[#d5d9d9] p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#0f1111] flex items-center gap-2 pb-3 border-b border-[#eaeded]">
                <DollarSign size={16} className="text-[#007600]" />
                Shipping Rules & Taxation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-[#0f1111] block mb-1">
                    Free Shipping Threshold ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={settings.freeShippingThreshold}
                    onChange={(e) =>
                      setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
                  />
                  <p className="text-[10px] text-[#565959] mt-1">
                    Orders above this threshold qualify for free shipping.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-[#0f1111] block mb-1">
                    Standard Shipping Fee ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={settings.standardShippingFee}
                    onChange={(e) =>
                      setSettings({ ...settings, standardShippingFee: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
                  />
                  <p className="text-[10px] text-[#565959] mt-1">Default fee for non-prime orders.</p>
                </div>

                <div>
                  <label className="font-bold text-[#0f1111] block mb-1">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={settings.taxRatePercent}
                    onChange={(e) =>
                      setSettings({ ...settings, taxRatePercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
                  />
                  <p className="text-[10px] text-[#565959] mt-1">Applied during checkout calculation.</p>
                </div>
              </div>
            </div>

            {/* Platform Controls & Flags */}
            <div className="bg-white rounded-lg border border-[#d5d9d9] p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#0f1111] flex items-center gap-2 pb-3 border-b border-[#eaeded]">
                <Sliders size={16} className="text-[#007185]" />
                System Flags & Moderation Policy
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded bg-[#f7fafa] border border-[#d5d9d9]">
                  <div>
                    <p className="font-bold text-[#0f1111]">Auto-Approve Customer Reviews</p>
                    <p className="text-[#565959] text-[11px]">
                      When enabled, new verified customer reviews appear immediately without pending moderation.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoApproveReviews}
                    onChange={(e) =>
                      setSettings({ ...settings, autoApproveReviews: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-amazon-orange focus:ring-amazon-orange cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-[#f7fafa] border border-[#d5d9d9]">
                  <div>
                    <p className="font-bold text-[#0f1111]">Allow New Customer Registrations</p>
                    <p className="text-[#565959] text-[11px]">
                      Permit new accounts to sign up on the storefront.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowNewRegistrations}
                    onChange={(e) =>
                      setSettings({ ...settings, allowNewRegistrations: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-amazon-orange focus:ring-amazon-orange cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-red-50/50 border border-red-200">
                  <div>
                    <p className="font-bold text-red-900">Platform Maintenance Mode</p>
                    <p className="text-red-700 text-[11px]">
                      Display a maintenance banner to all non-admin visitors.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({ ...settings, maintenanceMode: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Admin Account Credentials Summary */}
            <div className="bg-white rounded-lg border border-[#d5d9d9] p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-[#0f1111] flex items-center gap-2 pb-3 border-b border-[#eaeded]">
                <User size={16} className="text-[#131921]" />
                Active Administrator Profile
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#f7fafa] rounded border border-[#d5d9d9]">
                  <span className="text-[10px] uppercase font-bold text-[#565959]">Account Email</span>
                  <p className="font-bold text-[#0f1111] mt-0.5">{user?.email}</p>
                </div>
                <div className="p-3 bg-[#f7fafa] rounded border border-[#d5d9d9]">
                  <span className="text-[10px] uppercase font-bold text-[#565959]">Role Verification</span>
                  <p className="font-bold text-[#b12704] uppercase mt-0.5 flex items-center gap-1">
                    <ShieldCheck size={14} />
                    {user?.role}
                  </p>
                </div>
                <div className="p-3 bg-[#f7fafa] rounded border border-[#d5d9d9]">
                  <span className="text-[10px] uppercase font-bold text-[#565959]">Admin UID</span>
                  <p className="font-mono text-[11px] text-[#565959] mt-0.5 truncate">{user?.uid}</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={saving}
                className="inline-flex items-center gap-2 bg-amazon-yellow hover:bg-amazon-yellow-dark text-[#0f1111] border border-[#fcd200] font-bold"
              >
                <Save size={16} />
                <span>Save Platform Settings</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

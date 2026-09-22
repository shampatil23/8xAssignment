'use client';
// ============================================================================
// Customer Profile & Preferences Page — /account/profile
// ============================================================================
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, User, Check, Camera, Bell, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, updatePreferences, fetchUserProfile } from '@/services/userService';
import type { UserPreferences } from '@/types';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    currency: 'INR',
    orderUpdates: true,
    promotionalEmails: true,
    securityAlerts: true,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');

      fetchUserProfile(user.uid).then((p) => {
        if (p?.preferences) {
          setPreferences((prev) => ({
            ...prev,
            ...p.preferences,
          }));
        }
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setMessage(null);

    const res = await updateProfile(user.uid, {
      displayName: displayName.trim(),
      photoURL: photoURL || undefined,
    });

    setSavingProfile(false);
    if (res.success) {
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ text: res.error || 'Failed to update profile.', type: 'error' });
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPrefs(true);
    setMessage(null);

    const res = await updatePreferences(user.uid, preferences);
    setSavingPrefs(false);
    if (res.success) {
      setMessage({ text: 'Preferences saved successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ text: res.error || 'Failed to save preferences.', type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/account" className="hover:text-amazon-link hover:underline">
          Your Account
        </Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-gray-800">Profile &amp; Preferences</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile &amp; Preferences</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your personal details, avatar, language, and communication preferences.
          </p>
        </div>
        <Link
          href="/account"
          className="text-xs text-amazon-link hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={13} />
          <span>Back to Account</span>
        </Link>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-md p-3 text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <Check size={14} /> : null}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs text-center">
            <div className="relative mx-auto mb-4 h-24 w-24 rounded-full overflow-hidden border-2 border-amazon-orange bg-gray-100 flex items-center justify-center">
              {photoURL ? (
                <img src={photoURL} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>

            <h2 className="text-base font-bold text-gray-900">{displayName || 'Customer'}</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 rounded bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 uppercase">
              Role: {user?.role ?? 'customer'}
            </span>

            {/* Avatar Selection presets */}
            <div className="mt-6 border-t pt-4 text-left">
              <label className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-1.5">
                <Camera size={14} className="text-amazon-orange" />
                Choose Avatar Preset
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoURL(preset)}
                    className={`h-10 w-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                      photoURL === preset ? 'border-amazon-orange ring-2 ring-amazon-orange' : 'border-gray-200'
                    }`}
                  >
                    <img src={preset} alt={`Avatar ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Custom Image URL */}
              <div className="mt-4">
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Or enter Image URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customPhotoInput}
                    onChange={(e) => setCustomPhotoInput(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-amazon-orange focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customPhotoInput.trim()) {
                        setPhotoURL(customPhotoInput.trim());
                        setCustomPhotoInput('');
                      }
                    }}
                    className="rounded bg-gray-100 border border-gray-300 px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b pb-3 mb-4">
              Personal Information
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-amazon-orange focus:outline-hidden focus:ring-1 focus:ring-amazon-orange"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  To modify your email address or password, visit{' '}
                  <Link href="/account/security" className="text-amazon-link hover:underline">
                    Login &amp; Security
                  </Link>
                  .
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded bg-amazon-yellow px-5 py-2 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Regional & Communication Preferences */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
              <Globe size={18} className="text-amazon-orange" />
              Regional &amp; Communication Preferences
            </h2>

            <form onSubmit={handleSavePreferences} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={preferences.language || 'en'}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, language: e.target.value }))
                    }
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-amazon-orange focus:outline-hidden"
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">हिन्दी - Hindi (HI)</option>
                    <option value="es">Español - Spanish (ES)</option>
                    <option value="fr">Français - French (FR)</option>
                    <option value="de">Deutsch - German (DE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Display Currency
                  </label>
                  <select
                    value={preferences.currency || 'INR'}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, currency: e.target.value }))
                    }
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-amazon-orange focus:outline-hidden"
                  >
                    <option value="INR">₹ INR - Indian Rupee</option>
                    <option value="USD">$ USD - US Dollar</option>
                    <option value="EUR">€ EUR - Euro</option>
                    <option value="GBP">£ GBP - British Pound</option>
                  </select>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="border-t pt-4">
                <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                  <Bell size={14} className="text-amazon-orange" />
                  Notification Preferences
                </h3>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.orderUpdates ?? true}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, orderUpdates: e.target.checked }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        Order &amp; Shipping Updates
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Receive instant alerts when orders are placed, shipped, out for delivery, or delivered.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.promotionalEmails ?? true}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          promotionalEmails: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        Promotions, Deals &amp; Recommendations
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Get notified about Lightning Deals, price drops on your wishlist, and exclusive promo codes.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.securityAlerts ?? true}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, securityAlerts: e.target.checked }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        Account Security Notices
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Important alerts regarding password modifications, logins from new devices, or profile changes.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="rounded bg-amazon-yellow px-5 py-2 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                >
                  {savingPrefs ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

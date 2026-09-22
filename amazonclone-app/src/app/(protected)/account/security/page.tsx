'use client';
// ============================================================================
// Login & Security Page — /account/security
// Authentic Amazon layout with inline edit for Name, Mobile Phone, and Password
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, updatePhone, changeUserPassword } from '@/services/userService';

export default function AccountSecurityPage() {
  const { user } = useAuth();

  // Inline edit state
  const [editingSection, setEditingSection] = useState<'name' | 'phone' | 'password' | null>(null);

  // Form states
  const [nameInput, setNameInput] = useState(user?.displayName || '');
  const [phoneInput, setPhoneInput] = useState(user?.phoneNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!nameInput.trim()) {
      setFeedback({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }
    setLoading(true);
    setFeedback(null);
    const res = await updateProfile(user.uid, { displayName: nameInput.trim() });
    setLoading(false);
    if (res.success) {
      setFeedback({ text: 'Name updated successfully.', type: 'success' });
      setEditingSection(null);
    } else {
      setFeedback({ text: res.error || 'Failed to update name.', type: 'error' });
    }
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setFeedback(null);
    const res = await updatePhone(user.uid, phoneInput.trim());
    setLoading(false);
    if (res.success) {
      setFeedback({ text: 'Phone number updated successfully.', type: 'success' });
      setEditingSection(null);
    } else {
      setFeedback({ text: res.error || 'Failed to update phone.', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 6) {
      setFeedback({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    const res = await changeUserPassword(currentPassword, newPassword);
    setLoading(false);
    if (res.success) {
      setFeedback({ text: 'Password changed successfully.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setEditingSection(null);
    } else {
      setFeedback({ text: res.error || 'Failed to update password.', type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/account" className="hover:text-amazon-link hover:underline">
          Your Account
        </Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-gray-800">Login &amp; Security</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Login &amp; Security</h1>
        <Link
          href="/account"
          className="text-xs text-amazon-link hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={13} />
          <span>Back to Account</span>
        </Link>
      </div>

      {feedback && (
        <div
          className={`mb-6 rounded-md p-3 text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Amazon-style security card list */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-xs divide-y divide-gray-200">
        {/* Name Row */}
        <div className="p-5">
          {editingSection === 'name' ? (
            <form onSubmit={handleUpdateName} className="space-y-3">
              <h2 className="text-sm font-bold text-gray-900">Change your name</h2>
              <p className="text-xs text-gray-600">
                If you want to change the name associated with your Amazon Clone customer account, you may do so below.
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">New name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  className="w-full max-w-sm rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-amazon-orange focus:outline-hidden"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-amazon-yellow px-4 py-1.5 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Name:</span>
                <span className="text-xs text-gray-700">{user?.displayName || 'Not provided'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNameInput(user?.displayName || '');
                  setEditingSection('name');
                  setFeedback(null);
                }}
                className="rounded border border-gray-300 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-100 shadow-xs"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Email Row */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Email:</span>
              <span className="text-xs text-gray-700">{user?.email}</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-400 italic">Primary login</span>
          </div>
        </div>

        {/* Primary Mobile Phone Row */}
        <div className="p-5">
          {editingSection === 'phone' ? (
            <form onSubmit={handleUpdatePhone} className="space-y-3">
              <h2 className="text-sm font-bold text-gray-900">Change Mobile Phone Number</h2>
              <p className="text-xs text-gray-600">
                Provide a mobile number for order delivery coordination and carrier notifications.
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile number</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full max-w-sm rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-amazon-orange focus:outline-hidden"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-amazon-yellow px-4 py-1.5 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Primary mobile number:</span>
                <span className="text-xs text-gray-700">
                  {user?.phoneNumber || 'No mobile phone number added'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhoneInput(user?.phoneNumber || '');
                  setEditingSection('phone');
                  setFeedback(null);
                }}
                className="rounded border border-gray-300 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-100 shadow-xs"
              >
                {user?.phoneNumber ? 'Edit' : 'Add'}
              </button>
            </div>
          )}
        </div>

        {/* Password Row */}
        <div className="p-5">
          {editingSection === 'password' ? (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <h2 className="text-sm font-bold text-gray-900">Change Password</h2>
              <p className="text-xs text-gray-600">
                Use at least 6 characters. A strong password has letters, numbers, and symbols.
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full max-w-sm rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-amazon-orange focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full max-w-sm rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-amazon-orange focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Re-enter new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full max-w-sm rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-amazon-orange focus:outline-hidden"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-amazon-yellow px-4 py-1.5 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(null);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Password:</span>
                <span className="text-xs text-gray-700">••••••••</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSection('password');
                  setFeedback(null);
                }}
                className="rounded border border-gray-300 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-100 shadow-xs"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Account Info summary */}
        <div className="p-5 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div>
            <span>Account Status: </span>
            <span className="font-bold text-green-700">Active</span>
          </div>
          <div>
            <span>Account Type: </span>
            <span className="font-bold text-gray-700 uppercase">{user?.role ?? 'customer'}</span>
          </div>
        </div>
      </div>

      {/* Done button */}
      <div className="mt-6 flex justify-end">
        <Link
          href="/account"
          className="rounded bg-amazon-yellow hover:bg-amazon-yellow-hover px-6 py-2 text-xs font-bold text-gray-900 shadow-xs"
        >
          Done
        </Link>
      </div>
    </div>
  );
}

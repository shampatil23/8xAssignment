'use client';
// ============================================================================
// Admin Dashboard
// Accessible only by users with 'admin' role
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Users, ShoppingBag, DollarSign, ArrowLeft } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <AuthGuard requiredRole="admin">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Platform administration, permissions, and system oversight. Signed in as {user?.email}.
            </p>
          </div>

          <Link href="/account">
            <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Account
            </Button>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Total Users</span>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">Active</p>
            <p className="mt-1 text-xs text-gray-500">Managed via Firebase Auth & RTDB</p>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Catalog Size</span>
              <ShoppingBag className="h-5 w-5 text-amazon-orange" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">0 Items</p>
            <p className="mt-1 text-xs text-gray-500">Phase 3 catalog integration</p>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Platform GMV</span>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">$0.00</p>
            <p className="mt-1 text-xs text-gray-500">Phase 5 checkout integration</p>
          </div>
        </div>

        {/* Administration info */}
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
          <h2 className="text-base font-semibold text-purple-900 mb-2">
            Role-Based Access Control (RBAC) Verified
          </h2>
          <p className="text-sm text-purple-800 leading-relaxed">
            This route is protected by both client-side <code>AuthGuard</code> and Next.js Edge Middleware.
            Only accounts with <code>role: &apos;admin&apos;</code> in Firebase Realtime Database are permitted to view this view.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}

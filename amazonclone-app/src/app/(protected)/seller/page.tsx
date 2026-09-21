'use client';
// ============================================================================
// Seller Central Portal
// Accessible only by users with 'seller' or 'admin' role
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { Store, PlusCircle, PackageCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function SellerPage() {
  const { user } = useAuth();

  return (
    <AuthGuard requiredRole={['seller', 'admin']}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-amazon-orange" />
              <h1 className="text-2xl font-bold text-gray-900">Seller Central</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.displayName}. Manage your store inventory, orders, and sales performance.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/account">
              <Button variant="outline" size="sm">
                Back to Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Active Listings</span>
              <PackageCheck className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
            <p className="mt-1 text-xs text-gray-500">Phase 3 product catalog ready</p>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Total Sales</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">$0.00</p>
            <p className="mt-1 text-xs text-gray-500">Lifetime revenue</p>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Pending Orders</span>
              <AlertCircle className="h-5 w-5 text-amazon-orange" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
            <p className="mt-1 text-xs text-gray-500">Requires fulfillment</p>
          </div>
        </div>

        {/* Action placeholder */}
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <Store className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Product Management Coming in Phase 3
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            In the upcoming phase, sellers will be able to create listings with Cloudinary image uploads, set pricing, manage stock, and edit categories.
          </p>
          <Button variant="secondary" size="sm" disabled className="inline-flex items-center gap-2">
            <PlusCircle size={16} /> Add New Product (Phase 3)
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
}

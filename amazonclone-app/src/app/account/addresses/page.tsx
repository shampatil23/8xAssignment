'use client';
// ============================================================================
// Customer Addresses Management Page — /account/addresses
// ============================================================================
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AddressManager } from '@/components/checkout/AddressManager';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  setAsDefaultAddress,
} from '@/services/addressService';
import type { Address } from '@/types';

export default function AccountAddressesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const list = await fetchAddresses(user.uid);
        if (isMounted) setAddresses(list);
      } catch (err) {
        console.error('Failed to load customer addresses', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!authLoading) {
      load();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  if (!authLoading && !user) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Addresses
          </h1>
          <p className="text-xs text-gray-600 mb-6">
            Please sign in to view and manage your saved delivery addresses.
          </p>
          <button
            type="button"
            onClick={() => router.push('/auth/sign-in?redirect=/account/addresses')}
            className="rounded bg-amazon-yellow px-6 py-2 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover"
          >
            Sign in
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-lg px-4 py-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 text-xs text-gray-500"
        >
          <Link href="/account" className="hover:text-amazon-link hover:underline">
            Your Account
          </Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-gray-800">Your Addresses</span>
        </nav>

        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Addresses</h1>
          <Link
            href="/account"
            className="text-xs text-amazon-link hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Back to Account</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-36 bg-gray-200 rounded-lg" />
            <div className="h-36 bg-gray-200 rounded-lg" />
          </div>
        ) : (
          <AddressManager
            addresses={addresses}
            selectedAddressId={addresses.find((a) => a.isDefault)?.id || addresses[0]?.id}
            onSelectAddress={(addr) => setAsDefaultAddress(user!.uid, addr.id)}
            onAddAddress={async (data) => {
              const res = await addAddress(user!.uid, data);
              if (res.success && res.data) {
                setAddresses((prev) => [...prev, res.data!]);
                return true;
              }
              return false;
            }}
            onUpdateAddress={async (data) => {
              const res = await updateAddress(user!.uid, data);
              if (res.success) {
                setAddresses((prev) =>
                  prev.map((a) => (a.id === data.id ? data : a)),
                );
                return true;
              }
              return false;
            }}
            onDeleteAddress={async (id) => {
              const res = await removeAddress(user!.uid, id);
              if (res.success) {
                setAddresses((prev) => prev.filter((a) => a.id !== id));
                return true;
              }
              return false;
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}

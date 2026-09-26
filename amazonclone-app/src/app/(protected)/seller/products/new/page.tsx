'use client';
// ============================================================================
// Add New Masterpiece Page — /seller/products/new
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Crown, Sparkles } from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { SellerProductForm } from '@/components/seller/SellerProductForm';
import { useAuth } from '@/hooks/useAuth';
import { createSellerProduct } from '@/services/sellerService';
import type { Product } from '@/types';

export default function AddProductPage() {
  const { user } = useAuth();

  const handleCreateProduct = async (formData: Partial<Product>) => {
    if (!user) return { success: false, error: 'Authentication required' };
    return await createSellerProduct(
      user.uid,
      user.displayName || 'Merchant Partner',
      formData,
    );
  };

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto space-y-6 text-[#141312] dark:text-[#f8f5ee]">
        <div>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1 text-xs font-serif font-bold uppercase tracking-wider text-[#8a6827] dark:text-[#dfba73] hover:underline mb-3"
          >
            <ChevronLeft size={14} />
            Back to Atelier Catalog
          </Link>

          <div className="flex items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f6f1e6] dark:bg-[#1c2333] border border-[#d6be90]/40 dark:border-[#c5a059]/30 text-[9px] font-serif font-bold uppercase tracking-[0.24em] text-[#8a6827] dark:text-[#dfba73]">
              <Crown size={10} className="text-[#c5a059]" />
              <span>Catalog Commission</span>
            </div>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
            Add New Masterpiece
          </h1>
          <p className="text-xs text-[#786b58] dark:text-[#9e978b] mt-0.5">
            Fill in the details below to curate a new listing and publish it to Valenza salons.
          </p>
        </div>

        <SellerProductForm onSubmit={handleCreateProduct} isEditing={false} />
      </div>
    </SellerLayout>
  );
}

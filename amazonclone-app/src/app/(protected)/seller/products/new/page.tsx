'use client';
// ============================================================================
// Add New Product Page — /seller/products/new
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1 text-xs text-amazon-link hover:underline font-medium mb-3"
          >
            <ChevronLeft size={14} />
            Back to Products
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Fill in the details below to create a listing and publish it to the marketplace catalog.
          </p>
        </div>

        <SellerProductForm onSubmit={handleCreateProduct} isEditing={false} />
      </div>
    </SellerLayout>
  );
}

'use client';
// ============================================================================
// Edit Masterpiece Page — /seller/products/[id]/edit
// ============================================================================
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, AlertCircle, Crown, Gem } from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { SellerProductForm } from '@/components/seller/SellerProductForm';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchSellerProductById,
  updateSellerProduct,
} from '@/services/sellerService';
import type { Product } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const { user, isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchSellerProductById(user!.uid, id, isAdmin);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError(res.error || 'Unable to access product.');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [user, id, isAdmin]);

  const handleUpdateProduct = async (formData: Partial<Product>) => {
    if (!user) return { success: false, error: 'Authentication required' };
    return await updateSellerProduct(user.uid, id, formData, isAdmin);
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
              <span>Catalog Revision</span>
            </div>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
            Edit Masterpiece Listing
          </h1>
          <p className="text-xs text-[#786b58] dark:text-[#9e978b] mt-0.5">
            Modify pricing, specifications, images, and inventory for piece ID: <strong className="font-mono text-[#8a6827] dark:text-[#dfba73]">{id}</strong>
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] p-12 text-center text-xs text-[#786b58] font-serif animate-pulse">
            Loading workpiece details...
          </div>
        ) : error || !product ? (
          <div className="rounded-3xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-[#241012] p-8 text-center text-xs text-red-800 dark:text-red-300">
            <AlertCircle size={36} className="text-red-600 mx-auto mb-3" />
            <h2 className="font-serif text-base font-bold mb-1">Access Denied / Not Found</h2>
            <p className="max-w-md mx-auto mb-4">{error || 'This masterpiece does not exist or does not belong to your atelier account.'}</p>
            <Link href="/seller/products">
              <button
                type="button"
                className="px-5 py-2 rounded-full border border-[#d6be90] dark:border-[#2f384d] text-xs font-serif font-bold text-[#8a6827] dark:text-[#dfba73] hover:bg-white transition-all cursor-pointer"
              >
                Return to Atelier Catalog
              </button>
            </Link>
          </div>
        ) : (
          <SellerProductForm
            initialData={product}
            onSubmit={handleUpdateProduct}
            isEditing={true}
          />
        )}
      </div>
    </SellerLayout>
  );
}

'use client';
// ============================================================================
// Edit Product Page — /seller/products/[id]/edit
// Enforces seller data ownership before allowing edits
// ============================================================================
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, AlertCircle, Package } from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { SellerProductForm } from '@/components/seller/SellerProductForm';
import { Button } from '@/components/ui/Button';
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1 text-xs text-amazon-link hover:underline font-medium mb-3"
          >
            <ChevronLeft size={14} />
            Back to Products
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Edit Product Listing</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Modify pricing, specifications, images, and inventory for product ID: <strong className="font-mono text-gray-700">{id}</strong>
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500 animate-pulse">
            Loading product details...
          </div>
        ) : error || !product ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-xs text-red-800">
            <AlertCircle size={36} className="text-red-600 mx-auto mb-3" />
            <h2 className="text-base font-bold mb-1">Access Denied / Not Found</h2>
            <p className="max-w-md mx-auto mb-4">{error || 'This product does not exist or does not belong to your seller account.'}</p>
            <Link href="/seller/products">
              <Button variant="secondary" className="text-xs">
                Return to Product List
              </Button>
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

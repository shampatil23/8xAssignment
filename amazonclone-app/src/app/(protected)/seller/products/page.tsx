'use client';
// ============================================================================
// Seller Products Page — /seller/products
// View, filter, publish/unpublish, edit, and delete seller's catalog items
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchSellerProducts,
  deleteSellerProduct,
  toggleProductStatus,
} from '@/services/sellerService';
import type { Product, ProductStatus } from '@/types';

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus | 'low_stock'>('all');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchSellerProducts(user.uid);
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load seller products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  // Handle Quick Status Toggle (Active <-> Draft)
  const handleToggleStatus = async (product: Product) => {
    if (!user) return;
    const newStatus: ProductStatus = product.status === 'active' ? 'draft' : 'active';
    const res = await toggleProductStatus(user.uid, product.id, newStatus);
    if (res.success) {
      setNoticeMessage(`"${product.title}" is now ${newStatus.toUpperCase()}`);
      setTimeout(() => setNoticeMessage(null), 3000);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p)),
      );
    }
  };

  // Handle Delete
  const handleDeleteProduct = async (product: Product) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete "${product.title}"? This cannot be undone.`)) {
      return;
    }

    const res = await deleteSellerProduct(user.uid, product.id);
    if (res.success) {
      setNoticeMessage(`"${product.title}" has been deleted.`);
      setTimeout(() => setNoticeMessage(null), 3000);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'low_stock') {
        list = list.filter((p) => p.stock > 0 && p.stock <= 5);
      } else {
        list = list.filter((p) => p.status === statusFilter);
      }
    }

    return list;
  }, [products, searchQuery, statusFilter]);

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Toast alert */}
        {noticeMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-bounce">
            <CheckCircle2 size={18} strokeWidth={3} />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* ── Page Header & Add CTA ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and manage your store&apos;s product listings ({products.length} total)
            </p>
          </div>

          <Link href="/seller/products/new">
            <Button variant="buy-now" className="text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-xs">
              <PlusCircle size={15} />
              <span>Add New Product</span>
            </Button>
          </Link>
        </div>

        {/* ── Filters & Search Strip ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs text-xs">
          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, or brand..."
              className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-amazon-orange focus:outline-none"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-amazon-orange focus:outline-none cursor-pointer"
            >
              <option value="all">All Listings</option>
              <option value="active">Active Only</option>
              <option value="draft">Drafts Only</option>
              <option value="low_stock">Low Stock (≤ 5)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* ── Products Table ── */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500 animate-pulse">
            Loading products catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs">
            <Package size={40} className="text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">
              No products found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter settings.'
                : "You haven't listed any products yet. Get started by creating your first listing!"}
            </p>
            <Link href="/seller/products/new">
              <Button variant="buy-now" className="text-xs font-bold px-6 py-2">
                Create First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Stock</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredProducts.map((p) => {
                    const img =
                      p.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                    const isLowStock = p.stock > 0 && p.stock <= 5;
                    const isOut = p.stock <= 0 || p.status === 'out_of_stock';

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Product Title & Thumbnail */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded border bg-white p-0.5 flex-shrink-0">
                              <Image
                                src={img}
                                alt={p.title}
                                fill
                                sizes="48px"
                                className="object-contain"
                              />
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-sm">
                              <p className="font-semibold text-gray-900 line-clamp-1">
                                {p.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-gray-400">
                                  {p.brand || 'No Brand'}
                                </span>
                                <Link
                                  href={`/product/${p.slug}`}
                                  target="_blank"
                                  className="text-[11px] text-amazon-link hover:underline inline-flex items-center gap-0.5"
                                  title="View on customer site"
                                >
                                  <span>View</span>
                                  <ExternalLink size={10} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-3 font-mono text-[11px] text-gray-600">
                          {p.sku || '—'}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 text-gray-600 capitalize">
                          {p.categoryName || p.category}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-gray-900">
                            ${p.price.toFixed(2)}
                          </span>
                          {p.compareAtPrice && p.compareAtPrice > p.price && (
                            <span className="block text-[10px] text-gray-400 line-through">
                              ${p.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              isOut
                                ? 'bg-red-100 text-red-700'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              p.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : p.status === 'draft'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {p.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Publish / Draft */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 cursor-pointer"
                              title={p.status === 'active' ? 'Set to Draft' : 'Publish Product'}
                            >
                              {p.status === 'active' ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/seller/products/${p.id}/edit`}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-amazon-orange cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 size={15} />
                            </Link>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}

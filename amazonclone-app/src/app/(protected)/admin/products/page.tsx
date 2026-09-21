'use client';
// ============================================================================
// Admin Products Oversight — Global Catalog Management & Moderation
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Store,
  Tag,
  Boxes,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import {
  fetchAdminProducts,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminCategories,
} from '@/services/adminService';
import type { Product, ProductStatus, Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const sellerQueryParam = searchParams.get('seller');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sellerFilter, setSellerFilter] = useState<string>(sellerQueryParam || 'all');

  // Inline Stock Edit State
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);

  // Selected Product Details Modal
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const [prodRes, catRes] = await Promise.all([
      fetchAdminProducts(),
      fetchAdminCategories(),
    ]);

    if (prodRes.success && prodRes.data) {
      setProducts(prodRes.data);
    } else {
      setError(prodRes.error || 'Failed to load products.');
    }

    if (catRes.success && catRes.data) {
      setCategories(catRes.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false);

      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesSeller =
        sellerFilter === 'all' ||
        p.sellerId === sellerFilter ||
        p.seller?.id === sellerFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesSeller;
    });
  }, [products, searchQuery, categoryFilter, statusFilter, sellerFilter]);

  const handleToggleStatus = async (product: Product, newStatus: ProductStatus) => {
    const res = await updateAdminProduct(product.id, { status: newStatus });
    if (res.success) {
      setSuccessMessage(`Product "${product.title}" status changed to ${newStatus}.`);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p)),
      );
    } else {
      setError(res.error || 'Failed to update product status.');
    }
  };

  const handleSaveStock = async (productId: string) => {
    if (newStockVal < 0) return;
    const res = await updateAdminProduct(productId, {
      stock: newStockVal,
      status: newStockVal === 0 ? 'out_of_stock' : 'active',
    });
    if (res.success) {
      setSuccessMessage('Product inventory stock updated.');
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock: newStockVal, status: newStockVal === 0 ? 'out_of_stock' : 'active' }
            : p,
        ),
      );
      setEditingStockId(null);
    } else {
      setError(res.error || 'Failed to update stock.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!targetProduct) return;
    setActionLoading(true);
    try {
      const res = await deleteAdminProduct(targetProduct.id);
      if (res.success) {
        setSuccessMessage(`Product "${targetProduct.title}" has been purged from catalog.`);
        setProducts((prev) => prev.filter((p) => p.id !== targetProduct.id));
      } else {
        setError(res.error || 'Failed to delete product.');
      }
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
      setTargetProduct(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-amber-600" />
              Catalog Oversight
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Inspect all marketplace products, toggle visibility, adjust live inventory, and manage listings.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between text-emerald-800 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-900"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between text-red-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, SKU, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="archived">Archived</option>
            </select>

            {sellerFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSellerFilter('all')}
                className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1 hover:bg-amber-100"
              >
                <span>Clear Seller Filter</span>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading catalog items...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No products found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
                            {p.images?.[0]?.url ? (
                              <Image
                                src={p.images[0].url}
                                alt={p.title}
                                fill
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                <Package size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[240px]">
                            <p className="font-bold text-slate-900 truncate" title={p.title}>
                              {p.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>SKU: {p.sku}</span>
                              {p.brand && <span>• {p.brand}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 capitalize">
                        {p.category}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatPrice(p.price)}
                      </td>

                      <td className="py-3 px-4">
                        {editingStockId === p.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={newStockVal}
                              onChange={(e) => setNewStockVal(parseInt(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 text-xs rounded border border-purple-400"
                            />
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              className="text-[10px] text-purple-600 font-bold hover:underline"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="text-[10px] text-slate-400 hover:text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingStockId(p.id);
                              setNewStockVal(p.stock);
                            }}
                            className={`font-semibold hover:underline cursor-pointer ${
                              p.stock === 0
                                ? 'text-red-600'
                                : p.stock < 5
                                  ? 'text-amber-600'
                                  : 'text-slate-700'
                            }`}
                            title="Click to edit inventory stock"
                          >
                            {p.stock} units
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={p.status}
                          onChange={(e) => handleToggleStatus(p, e.target.value as ProductStatus)}
                          className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 border cursor-pointer ${
                            p.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.status === 'out_of_stock'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-[120px]">
                        {p.sellerName || p.seller?.name || 'Amazon Official'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${p.slug || p.id}`}
                            target="_blank"
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="View on Customer Storefront"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setInspectProduct(p)}
                            className="p-1.5 rounded text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTargetProduct(p);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product from Platform"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Product Details Modal ── */}
        {inspectProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setInspectProduct(null)}
            />
            <div className="relative w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl z-10 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 truncate max-w-[400px]">
                    {inspectProduct.title}
                  </h3>
                  <p className="text-xs text-slate-400">SKU: {inspectProduct.sku}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectProduct(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Price</span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {formatPrice(inspectProduct.price)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Stock</span>
                  <p className="text-base font-black text-purple-600 mt-0.5">
                    {inspectProduct.stock} units
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Rating</span>
                  <p className="text-base font-black text-amber-500 mt-0.5">
                    ★ {inspectProduct.rating} ({inspectProduct.reviewCount})
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-700">Description:</span>
                  <p className="text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                    {inspectProduct.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400">Category:</span>{' '}
                    <span className="font-semibold text-slate-700">{inspectProduct.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Brand:</span>{' '}
                    <span className="font-semibold text-slate-700">{inspectProduct.brand || 'Generic'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Seller:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {inspectProduct.sellerName || inspectProduct.seller?.name || 'Amazon'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>{' '}
                    <span className="font-semibold text-slate-700 uppercase">{inspectProduct.status}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/products/${inspectProduct.slug || inspectProduct.id}`}
                  target="_blank"
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                >
                  <span>Open Storefront Page</span>
                  <ExternalLink size={12} />
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectProduct(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Confirmation Modal ── */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Delete Product Listing"
          message={`Are you sure you want to permanently delete "${targetProduct?.title}"? This will remove the listing and inventory from the marketplace.`}
          confirmText="Yes, Delete Listing"
          variant="danger"
          isLoading={actionLoading}
          onConfirm={handleDeleteProduct}
          onCancel={() => {
            setDeleteModalOpen(false);
            setTargetProduct(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}

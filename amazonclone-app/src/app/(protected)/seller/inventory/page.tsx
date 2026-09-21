'use client';
// ============================================================================
// Seller Inventory Page — /seller/inventory
// Real-time stock management, low-stock warnings, and inline updates
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  PackageX,
  PackageCheck,
  Save,
  Plus,
  Minus,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { fetchSellerProducts, updateSellerStock } from '@/services/sellerService';
import type { Product } from '@/types';

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export default function SellerInventoryPage() {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');

  // Stock edit tracking
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadInventory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchSellerProducts(user.uid);
      if (res.success && res.data) {
        setProducts(res.data);
        const initialMap: Record<string, number> = {};
        res.data.forEach((p) => {
          initialMap[p.id] = p.stock;
        });
        setEditingStock(initialMap);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [user]);

  // Handle inline stock change
  const handleStockChange = (id: string, value: number) => {
    const val = Math.max(0, isNaN(value) ? 0 : value);
    setEditingStock((prev) => ({ ...prev, [id]: val }));
  };

  // Save stock to Firebase RTDB
  const handleSaveStock = async (product: Product) => {
    if (!user) return;
    const newQty = editingStock[product.id];
    if (newQty === undefined || newQty === product.stock) return;

    setSavingId(product.id);
    try {
      const res = await updateSellerStock(user.uid, product.id, newQty, isAdmin);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  stock: newQty,
                  status: newQty === 0 ? 'out_of_stock' : p.status === 'out_of_stock' ? 'active' : p.status,
                }
              : p,
          ),
        );
        setToastMessage(`Updated stock for "${product.title}" to ${newQty}.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } finally {
      setSavingId(null);
    }
  };

  // Filtered inventory
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

    if (filter === 'low_stock') {
      list = list.filter((p) => p.stock > 0 && p.stock <= 5);
    } else if (filter === 'out_of_stock') {
      list = list.filter((p) => p.stock <= 0 || p.status === 'out_of_stock');
    } else if (filter === 'in_stock') {
      list = list.filter((p) => p.stock > 5 && p.status === 'active');
    }

    return list;
  }, [products, searchQuery, filter]);

  const inStockCount = products.filter((p) => p.stock > 5 && p.status === 'active').length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0 || p.status === 'out_of_stock').length;

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-bounce">
            <CheckCircle2 size={18} strokeWidth={3} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Health &amp; Stock</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live inventory tracking and inline stock adjustments for all product listings
            </p>
          </div>
        </div>

        {/* ── Stock Health Overview Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Healthy Stock */}
          <button
            type="button"
            onClick={() => setFilter(filter === 'in_stock' ? 'all' : 'in_stock')}
            className={`rounded-xl border p-4 text-left transition-all cursor-pointer bg-white ${
              filter === 'in_stock' ? 'border-green-600 ring-2 ring-green-600/20 shadow-sm' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between text-green-700">
              <span className="text-xs font-semibold uppercase">In Stock (Healthy)</span>
              <PackageCheck size={18} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">{inStockCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">&gt; 5 items available</p>
          </button>

          {/* Low Stock */}
          <button
            type="button"
            onClick={() => setFilter(filter === 'low_stock' ? 'all' : 'low_stock')}
            className={`rounded-xl border p-4 text-left transition-all cursor-pointer bg-white ${
              filter === 'low_stock' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-semibold uppercase">Low Stock Alert</span>
              <AlertTriangle size={18} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">{lowStockCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">1 to 5 items remaining</p>
          </button>

          {/* Out of Stock */}
          <button
            type="button"
            onClick={() => setFilter(filter === 'out_of_stock' ? 'all' : 'out_of_stock')}
            className={`rounded-xl border p-4 text-left transition-all cursor-pointer bg-white ${
              filter === 'out_of_stock' ? 'border-red-600 ring-2 ring-red-600/20 shadow-sm' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between text-red-600">
              <span className="text-xs font-semibold uppercase">Out of Stock</span>
              <PackageX size={18} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">{outOfStockCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">0 items remaining</p>
          </button>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs text-xs">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inventory by title or SKU..."
              className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-amazon-orange focus:outline-none"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StockFilter)}
              className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-amazon-orange focus:outline-none cursor-pointer"
            >
              <option value="all">All Inventory ({products.length})</option>
              <option value="in_stock">In Stock ({inStockCount})</option>
              <option value="low_stock">Low Stock ({lowStockCount})</option>
              <option value="out_of_stock">Out of Stock ({outOfStockCount})</option>
            </select>
          </div>
        </div>

        {/* ── Inventory Quick-Edit Table ── */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500 animate-pulse">
            Loading inventory items...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs text-xs text-gray-500">
            No inventory items found matching your filter.
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Available Stock</th>
                    <th className="px-4 py-3 text-right">Update Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredProducts.map((p) => {
                    const img =
                      p.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
                    const currentVal = editingStock[p.id] ?? p.stock;
                    const hasChanged = currentVal !== p.stock;
                    const isSaving = savingId === p.id;
                    const isLow = currentVal > 0 && currentVal <= 5;
                    const isOut = currentVal === 0;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Product Title & Image */}
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
                            <div className="min-w-0 max-w-xs sm:max-w-md">
                              <p className="font-semibold text-gray-900 line-clamp-1">
                                {p.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-gray-400">
                                  ${p.price.toFixed(2)}
                                </span>
                                <Link
                                  href={`/product/${p.slug}`}
                                  target="_blank"
                                  className="text-[11px] text-amazon-link hover:underline inline-flex items-center gap-0.5"
                                  title="View on customer site"
                                >
                                  <span>View PDP</span>
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

                        {/* Health Status Badge */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              isOut
                                ? 'bg-red-100 text-red-700'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>

                        {/* Stock Adjustment Controls */}
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStockChange(p.id, currentVal - 1)}
                              disabled={currentVal <= 0}
                              className="h-7 w-7 rounded border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                              title="Decrease stock"
                            >
                              <Minus size={12} />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={currentVal}
                              onChange={(e) =>
                                handleStockChange(p.id, parseInt(e.target.value, 10))
                              }
                              className={`w-16 rounded border text-center py-1 text-xs font-bold focus:ring-1 focus:ring-amazon-orange focus:outline-none ${
                                isOut
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : isLow
                                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() => handleStockChange(p.id, currentVal + 1)}
                              className="h-7 w-7 rounded border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                              title="Increase stock"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>

                        {/* Save Action */}
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="buy-now"
                            size="sm"
                            disabled={!hasChanged || isSaving}
                            onClick={() => handleSaveStock(p)}
                            className={`text-xs px-3 py-1 font-bold ${
                              hasChanged ? 'animate-pulse' : 'opacity-60'
                            }`}
                          >
                            {isSaving ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <span className="flex items-center gap-1">
                                <Save size={13} />
                                <span>Save</span>
                              </span>
                            )}
                          </Button>
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

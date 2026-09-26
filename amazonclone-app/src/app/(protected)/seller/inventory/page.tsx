'use client';
// ============================================================================
// Seller Inventory Page — /seller/inventory
// Valenza Maison Partner Atelier Vault Inventory & Stock Control
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
  Crown,
  Gem,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchSellerProducts, updateSellerStock } from '@/services/sellerService';
import { formatPrice } from '@/lib/utils';
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
        setToastMessage(`Updated vault stock for "${product.title}" to ${newQty}.`);
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
      <div className="space-y-6 text-[#141312] dark:text-[#f8f5ee]">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#141312] dark:bg-[#1c2230] text-[#f8f5ee] px-5 py-3.5 shadow-2xl border border-[#c5a059]/50 text-xs flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={16} className="text-[#dfba73] shrink-0" />
            <span className="font-serif font-medium">{toastMessage}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f1e6] dark:bg-[#1c2333] border border-[#d6be90]/40 dark:border-[#c5a059]/30 text-[10px] font-serif font-bold uppercase tracking-[0.24em] text-[#8a6827] dark:text-[#dfba73] mb-2.5 shadow-2xs">
            <Crown size={11} className="text-[#c5a059]" />
            <span>Vault Inventory</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
            Vault Inventory &amp; Stock Levels
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] leading-relaxed max-w-2xl">
            Real-time atelier vault tracking, depletion warnings, and inline stock balance adjustments.
          </p>
        </div>

        {/* ── Stock Health Overview Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Healthy Stock */}
          <button
            type="button"
            onClick={() => setFilter(filter === 'in_stock' ? 'all' : 'in_stock')}
            className={`rounded-3xl border p-5 text-left transition-all cursor-pointer bg-white/90 dark:bg-[#121620]/90 shadow-xs ${
              filter === 'in_stock'
                ? 'border-[#c5a059] ring-2 ring-[#c5a059]/20'
                : 'border-[#ebe2d1] dark:border-[#262c3d] hover:border-[#c5a059]/50'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider">Pristine Vault Stock</span>
              <PackageCheck size={16} />
            </div>
            <p className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee] mt-2">{inStockCount}</p>
            <p className="text-[10px] text-[#786b58] dark:text-[#9e978b] mt-0.5">&gt; 5 units available</p>
          </button>

          {/* Low Stock */}
          <button
            type="button"
            onClick={() => setFilter(filter === 'low_stock' ? 'all' : 'low_stock')}
            className={`rounded-3xl border p-5 text-left transition-all cursor-pointer bg-white/90 dark:bg-[#121620]/90 shadow-xs ${
              filter === 'low_stock'
                ? 'border-amber-500 ring-2 ring-amber-500/20'
                : 'border-[#ebe2d1] dark:border-[#262c3d] hover:border-amber-400/50'
            }`}
          >
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider">Depletion Alert</span>
              <AlertTriangle size={16} />
            </div>
            <p className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee] mt-2">{lowStockCount}</p>
            <p className="text-[10px] text-[#786b58] dark:text-[#9e978b] mt-0.5">1 to 5 units remaining</p>
          </button>

          {/* Out of Stock */}
          <button
            type="button"
            onClick={() => setFilter(filter === 'out_of_stock' ? 'all' : 'out_of_stock')}
            className={`rounded-3xl border p-5 text-left transition-all cursor-pointer bg-white/90 dark:bg-[#121620]/90 shadow-xs ${
              filter === 'out_of_stock'
                ? 'border-red-500 ring-2 ring-red-500/20'
                : 'border-[#ebe2d1] dark:border-[#262c3d] hover:border-red-400/50'
            }`}
          >
            <div className="flex items-center justify-between text-red-700 dark:text-red-300">
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider">Vault Depleted</span>
              <PackageX size={16} />
            </div>
            <p className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee] mt-2">{outOfStockCount}</p>
            <p className="text-[10px] text-[#786b58] dark:text-[#9e978b] mt-0.5">0 units remaining</p>
          </button>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vault items by title or SKU..."
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] pl-9 pr-4 py-2 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-[#9e978b]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-serif text-[#786b58] dark:text-[#9e978b]">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StockFilter)}
              className="rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-3 py-1.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none cursor-pointer"
            >
              <option value="all">All Inventory ({products.length})</option>
              <option value="in_stock">In Stock ({inStockCount})</option>
              <option value="low_stock">Low Stock ({lowStockCount})</option>
              <option value="out_of_stock">Vault Depleted ({outOfStockCount})</option>
            </select>
          </div>
        </div>

        {/* ── Inventory Quick-Edit Table ── */}
        {loading ? (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] p-12 text-center text-xs text-[#786b58] font-serif animate-pulse">
            Loading vault inventory...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] p-12 text-center shadow-xs text-xs text-[#786b58] dark:text-[#8e98ac]">
            No inventory items found matching your filter.
          </div>
        ) : (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-[#faf7f2] to-[#f4eee4] dark:from-[#151924] dark:to-[#0f1219] border-b border-[#ebe2d1] dark:border-[#232938] text-[10px] font-serif font-bold uppercase tracking-[0.16em] text-[#8a7b68] dark:text-[#8e98ac]">
                    <th className="py-3.5 px-4 font-semibold">Masterpiece</th>
                    <th className="py-3.5 px-4 font-semibold">SKU</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Available Units</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Update Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5efe5] dark:divide-[#1a202c]">
                  {filteredProducts.map((p) => {
                    const currentEditing = editingStock[p.id] ?? p.stock;
                    const hasChanged = currentEditing !== p.stock;
                    const isSaving = savingId === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-[#faf7f2]/60 dark:hover:bg-[#161a25] transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl border border-[#ede4d4] dark:border-[#232938] bg-[#fbf9f6] dark:bg-[#171c26] flex-shrink-0 relative overflow-hidden shadow-2xs">
                              <Image
                                src={p.images?.[0]?.url || '/images/placeholder-product.png'}
                                alt={p.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <span className="font-serif font-medium text-xs text-[#141312] dark:text-[#f8f5ee] line-clamp-1 max-w-sm">
                              {p.title}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] text-[#8a7b68] dark:text-[#8e98ac]">
                          {p.sku || '—'}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-serif font-bold uppercase tracking-wider ${
                              p.status === 'active'
                                ? 'bg-emerald-50 dark:bg-[#132816] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-[#261d10] text-amber-800 dark:text-amber-300 border border-amber-200'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-[#f8f4ec] dark:bg-[#1a202c] p-1 rounded-xl border border-[#dfd6c5] dark:border-[#2f384d]">
                            <button
                              type="button"
                              onClick={() => handleStockChange(p.id, currentEditing - 1)}
                              className="p-1 text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                            >
                              <Minus size={11} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={currentEditing}
                              onChange={(e) => handleStockChange(p.id, parseInt(e.target.value, 10))}
                              className="w-12 text-center bg-transparent font-serif font-bold text-xs text-[#141312] dark:text-[#f8f5ee] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleStockChange(p.id, currentEditing + 1)}
                              className="p-1 text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            disabled={!hasChanged || isSaving}
                            onClick={() => handleSaveStock(p)}
                            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-serif font-bold uppercase tracking-wider text-[#121110] bg-gradient-to-r from-[#c5a059] to-[#dfba73] hover:brightness-105 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                            <span>Save</span>
                          </button>
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

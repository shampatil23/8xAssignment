'use client';
// ============================================================================
// Seller Products Page — /seller/products
// Valenza Maison Partner Atelier Catalog & Masterpiece Management
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
  Crown,
  Gem,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchSellerProducts,
  deleteSellerProduct,
  toggleProductStatus,
} from '@/services/sellerService';
import { formatPrice } from '@/lib/utils';
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
    if (!confirm(`Are you sure you want to retire "${product.title}" from the catalog?`)) {
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

    if (statusFilter === 'all') return list;
    if (statusFilter === 'low_stock') return list.filter((p) => p.stock > 0 && p.stock <= 5);
    return list.filter((p) => p.status === statusFilter);
  }, [products, searchQuery, statusFilter]);

  return (
    <SellerLayout>
      <div className="space-y-6 text-[#141312] dark:text-[#f8f5ee]">
        
        {/* ── Top Header Banner ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f1e6] dark:bg-[#1c2333] border border-[#d6be90]/40 dark:border-[#c5a059]/30 text-[10px] font-serif font-bold uppercase tracking-[0.24em] text-[#8a6827] dark:text-[#dfba73] mb-2.5 shadow-2xs">
              <Crown size={11} className="text-[#c5a059]" />
              <span>Catalog &amp; Masterpieces</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
              Manage Atelier Catalog
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] leading-relaxed">
              Curate, edit pricing, update specifications, and control marketplace visibility for your pieces.
            </p>
          </div>

          <Link href="/seller/products/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-serif tracking-widest uppercase font-bold text-[#121110] bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#9b7532] hover:brightness-105 active:scale-98 border border-[#c5a059]/50 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <PlusCircle size={14} strokeWidth={2.2} />
              <span>Add New Piece</span>
            </button>
          </Link>
        </div>

        {/* ── Notice Message ── */}
        {noticeMessage && (
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-[#102415] p-4 flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs shadow-md animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-serif font-medium">{noticeMessage}</span>
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, brand, or model..."
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] pl-9 pr-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] placeholder:text-[#9e978b] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 transition-all"
            />
            <Search size={14} className="absolute left-3 top-3 text-[#9e978b]" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(
              [
                { id: 'all', label: `All Pieces (${products.length})` },
                { id: 'active', label: 'Active in Salons' },
                { id: 'draft', label: 'Drafts & Pending' },
                { id: 'low_stock', label: 'Low Stock (< 5)' },
                { id: 'out_of_stock', label: 'Sold Out' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-4 py-2 rounded-xl text-xs font-serif tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-[#171513] to-[#25201a] dark:from-[#1b2230] dark:to-[#121620] text-[#dfba73] border border-[#c5a059]/50 shadow-xs font-bold'
                    : 'bg-[#f8f4ec] dark:bg-[#161b26] text-[#6d6356] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] border border-transparent hover:border-[#dfd6c5] dark:hover:border-[#2f384d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Products Grid / Table ── */}
        {loading ? (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] p-12 text-center text-xs text-[#786b58] font-serif animate-pulse">
            Loading catalog pieces...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] p-12 text-center shadow-xs text-xs text-[#786b58] dark:text-[#8e98ac]">
            <Package size={36} className="text-[#c5a059]/40 mx-auto mb-3" />
            <p className="font-serif font-bold text-base text-[#141312] dark:text-[#f8f5ee]">
              No Products Found
            </p>
            <p className="mt-1 text-xs text-[#786b58] dark:text-[#8e98ac]">
              No pieces match your selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-[#faf7f2] to-[#f4eee4] dark:from-[#151924] dark:to-[#0f1219] border-b border-[#ebe2d1] dark:border-[#232938] text-[10px] font-serif font-bold uppercase tracking-[0.16em] text-[#8a7b68] dark:text-[#8e98ac]">
                    <th className="py-3.5 px-4 font-semibold">Masterpiece</th>
                    <th className="py-3.5 px-4 font-semibold">Category / Salon</th>
                    <th className="py-3.5 px-4 font-semibold">Valuation</th>
                    <th className="py-3.5 px-4 font-semibold">Vault Stock</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5efe5] dark:divide-[#1a202c]">
                  {filteredProducts.map((p) => {
                    const isDraft = p.status === 'draft';
                    const isOutOfStock = p.stock <= 0;
                    return (
                      <tr key={p.id} className="hover:bg-[#faf7f2]/60 dark:hover:bg-[#161a25] transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3.5">
                            <div className="h-12 w-12 rounded-xl border border-[#ede4d4] dark:border-[#232938] bg-[#fbf9f6] dark:bg-[#171c26] flex-shrink-0 relative overflow-hidden shadow-2xs">
                              <Image
                                src={p.images?.[0]?.url || '/images/placeholder-product.png'}
                                alt={p.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/product/${p.slug}`}
                                className="font-serif font-medium text-xs text-[#141312] dark:text-[#f8f5ee] hover:text-[#8a6827] dark:hover:text-[#dfba73] transition-colors line-clamp-1"
                              >
                                {p.title}
                              </Link>
                              <div className="text-[10px] text-[#8a7b68] dark:text-[#8e98ac] font-mono mt-0.5">
                                SKU: {p.sku || 'N/A'} {p.brand && `• ${p.brand}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-serif text-[11px] text-[#6d6356] dark:text-[#a0a6b5] capitalize">
                          {p.categoryName || p.category}
                        </td>

                        <td className="py-4 px-4 font-serif font-bold text-xs text-[#141312] dark:text-[#f8f5ee]">
                          {formatPrice(p.price)}
                        </td>

                        <td className="py-4 px-4 font-sans font-medium">
                          {p.stock <= 0 ? (
                            <span className="text-red-600 dark:text-red-400 font-bold">0 (Depleted)</span>
                          ) : p.stock <= 5 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">{p.stock} (Low)</span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{p.stock} Units</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-serif font-bold uppercase tracking-wider ${
                              p.status === 'active'
                                ? 'bg-emerald-50 dark:bg-[#132816] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : p.status === 'draft'
                                ? 'bg-amber-50 dark:bg-[#261d10] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-red-50 dark:bg-[#281315] text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              title={p.status === 'active' ? 'Unpublish to Draft' : 'Publish Live'}
                              className="p-1.5 rounded-lg border border-[#dfd6c5] dark:border-[#2f384d] hover:bg-[#f5ede0] dark:hover:bg-[#1c2333] text-[#786b58] dark:text-[#a0a6b5] hover:text-[#8a6827] dark:hover:text-[#dfba73] transition-all cursor-pointer"
                            >
                              {p.status === 'active' ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>

                            <Link href={`/seller/products/${p.id}/edit`}>
                              <button
                                type="button"
                                title="Edit Masterpiece"
                                className="p-1.5 rounded-lg border border-[#dfd6c5] dark:border-[#2f384d] hover:bg-[#f5ede0] dark:hover:bg-[#1c2333] text-[#786b58] dark:text-[#a0a6b5] hover:text-[#8a6827] dark:hover:text-[#dfba73] transition-all cursor-pointer"
                              >
                                <Edit2 size={13} />
                              </button>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p)}
                              title="Delete Piece"
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 size={13} />
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

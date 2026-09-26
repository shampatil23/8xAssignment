'use client';
// ============================================================================
// Seller Analytics Page — /seller/analytics
// Valenza Maison Partner Atelier Performance & Financial Valuation Analytics
// ============================================================================
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Award,
  Boxes,
  Clock,
  ArrowUpRight,
  Crown,
  Gem,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchSellerAnalytics } from '@/services/sellerService';
import { formatPrice } from '@/lib/utils';
import type { SellerAnalyticsMetrics } from '@/types';

export default function SellerAnalyticsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SellerAnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchSellerAnalytics(user!.uid);
        if (res.success && res.data) {
          setMetrics(res.data);
        }
      } catch (err) {
        console.error('Failed to load seller analytics', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const avgOrderValue =
    metrics && metrics.totalOrders > 0
      ? metrics.totalRevenue / metrics.totalOrders
      : 0;

  return (
    <SellerLayout>
      <div className="space-y-6 text-[#141312] dark:text-[#f8f5ee]">
        
        {/* ── Page Header ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f1e6] dark:bg-[#1c2333] border border-[#d6be90]/40 dark:border-[#c5a059]/30 text-[10px] font-serif font-bold uppercase tracking-[0.24em] text-[#8a6827] dark:text-[#dfba73] mb-2.5 shadow-2xs">
            <Crown size={11} className="text-[#c5a059]" />
            <span>Valuation &amp; Velocity</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
            Sales &amp; Performance Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] leading-relaxed max-w-2xl">
            Real-time financial performance, product sales velocity, and inventory statistics across Valenza salons.
          </p>
        </div>

        {/* ── Core KPI Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 bg-white dark:bg-[#121620] rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Sales Revenue */}
            <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#8a7b68] dark:text-[#8e98ac] mb-2">
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider">Gross Valuation</span>
                <DollarSign size={16} className="text-[#8a6827] dark:text-[#dfba73]" />
              </div>
              <p className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee]">
                {formatPrice(metrics?.totalRevenue || 0)}
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-serif font-semibold mt-1 flex items-center gap-0.5">
                <ArrowUpRight size={12} />
                <span>Gross marketplace acquisitions</span>
              </p>
            </div>

            {/* Total Units Sold */}
            <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#8a7b68] dark:text-[#8e98ac] mb-2">
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider">Commissions Sold</span>
                <ShoppingBag size={16} className="text-[#8a6827] dark:text-[#dfba73]" />
              </div>
              <p className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee]">
                {metrics?.totalUnitsSold || 0}
              </p>
              <p className="text-[10px] text-[#786b58] dark:text-[#9e978b] mt-1 font-sans">
                Across {metrics?.totalOrders || 0} client purchases
              </p>
            </div>

            {/* Average Order Value */}
            <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#8a7b68] dark:text-[#8e98ac] mb-2">
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider">Average Commission</span>
                <TrendingUp size={16} className="text-[#8a6827] dark:text-[#dfba73]" />
              </div>
              <p className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee]">
                {formatPrice(avgOrderValue)}
              </p>
              <p className="text-[10px] text-[#786b58] dark:text-[#9e978b] mt-1 font-sans">
                Per checkout transaction
              </p>
            </div>

            {/* Active Vault Listings */}
            <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#8a7b68] dark:text-[#8e98ac] mb-2">
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider">Active Portfolio</span>
                <Package size={16} className="text-[#8a6827] dark:text-[#dfba73]" />
              </div>
              <p className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee]">
                {metrics?.activeProducts || 0}
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-serif font-medium mt-1">
                Allocated masterworks
              </p>
            </div>
          </div>
        )}

        {/* ── Top Performing Masterpieces ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#1e2433] pb-4">
            <div>
              <h2 className="font-serif text-xl font-light text-[#141312] dark:text-[#f8f5ee] tracking-tight">
                Top Performing Atelier Pieces
              </h2>
              <p className="text-xs text-[#786b58] dark:text-[#9e978b] mt-0.5">
                Masterworks ranked by client demand and gross acquisition volume
              </p>
            </div>
            <Award size={18} className="text-[#c5a059]" />
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#786b58] font-serif animate-pulse">
              Aggregating portfolio performance...
            </div>
          ) : !metrics?.topProducts || metrics.topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#786b58] dark:text-[#8e98ac]">
              Sales velocity data will populate here as client orders are fulfilled.
            </div>
          ) : (
            <div className="divide-y divide-[#f5efe5] dark:divide-[#1a202c]">
              {metrics.topProducts.map((p, idx) => (
                <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="w-6 text-center font-serif font-bold text-xs text-[#8a6827] dark:text-[#dfba73]">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-serif font-medium text-xs text-[#141312] dark:text-[#f8f5ee]">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-[#786b58] dark:text-[#9e978b] mt-0.5">
                        {p.unitsSold} units commissioned
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-xs text-[#141312] dark:text-[#f8f5ee]">
                      {formatPrice(p.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}

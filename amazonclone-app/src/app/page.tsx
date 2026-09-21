'use client';
// ============================================================================
// Amazon Clone — Home Page
// ============================================================================
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { fetchCategories } from '@/services/categoryService';
import { fetchProducts } from '@/services/productService';
import type { Category, Product } from '@/types';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);

        if (!isMounted) return;

        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
        }
      } catch (err) {
        console.error('[HomePage] failed to load catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const featuredTech = products.filter((p) => p.category === 'electronics' || p.category === 'computers').slice(0, 4);

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 py-6">
        {/* ── Hero Banner ── */}
        <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-[#131921] via-[#232f3e] to-[#131921] p-8 md:p-12 text-white shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amazon-orange/20 px-3 py-1 text-xs font-semibold text-amazon-orange mb-4 border border-amazon-orange/30">
              <Sparkles size={14} /> Marketplace Catalog Live
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3">
              Explore Millions of Products with <span className="text-amazon-orange">Fast Delivery</span>
            </h1>
            <p className="text-gray-300 text-sm md:text-base mb-6 leading-relaxed">
              Shop top brands in Electronics, Computers, Fashion, Home Living, and Bestselling Books with real-time stock and dynamic variants.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/category/electronics"
                className="rounded-md bg-amazon-yellow px-5 py-2.5 text-xs font-bold text-amazon-dark hover:bg-amazon-yellow-dark transition-colors"
              >
                Shop Electronics
              </Link>
              <Link
                href="/category/computers"
                className="rounded-md bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors border border-white/20"
              >
                Explore Computers
              </Link>
            </div>
          </div>
        </div>

        {/* ── Value Props Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <Truck className="h-8 w-8 text-amazon-orange flex-shrink-0" />
            <div>
              <h2 className="text-xs font-bold text-gray-900">Fast, Free Shipping</h2>
              <p className="text-[11px] text-gray-500">Free 1-day delivery on eligible Prime orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <ShieldCheck className="h-8 w-8 text-amazon-orange flex-shrink-0" />
            <div>
              <h2 className="text-xs font-bold text-gray-900">100% Secure Checkout</h2>
              <p className="text-[11px] text-gray-500">Encrypted payment &amp; verified merchant guarantees</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <RotateCcw className="h-8 w-8 text-amazon-orange flex-shrink-0" />
            <div>
              <h2 className="text-xs font-bold text-gray-900">Easy 30-Day Returns</h2>
              <p className="text-[11px] text-gray-500">Hassle-free refunds and product replacements</p>
            </div>
          </div>
        </div>

        {/* ── Category Cards Grid ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <span className="text-xs text-gray-500">
              {categories.length} Departments Available
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-amazon-link transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                    {cat.itemCount ? `${cat.itemCount} items` : 'Browse collection'}
                  </p>
                </div>

                <div className="relative my-3 h-28 w-full overflow-hidden rounded bg-gray-50">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      Category
                    </div>
                  )}
                </div>

                <span className="text-xs font-medium text-amazon-link group-hover:underline flex items-center gap-1">
                  Shop now <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Best Sellers Section ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Today&apos;s Best Sellers
              </h2>
              <p className="text-xs text-gray-500">Top rated and most popular customer choices</p>
            </div>
            <Link
              href="/category/electronics"
              className="text-xs font-semibold text-amazon-link hover:underline hover:text-amazon-link-hover"
            >
              See all deals &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* ── Featured Tech & Devices Section ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Featured Tech &amp; Workstation Essentials
              </h2>
              <p className="text-xs text-gray-500">High performance laptops, audio, and accessories</p>
            </div>
            <Link
              href="/category/computers"
              className="text-xs font-semibold text-amazon-link hover:underline hover:text-amazon-link-hover"
            >
              View Computers &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {featuredTech.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

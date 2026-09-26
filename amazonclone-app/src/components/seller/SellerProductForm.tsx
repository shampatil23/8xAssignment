'use client';
// ============================================================================
// SellerProductForm — Valenza Maison Partner Atelier Product Creation & Edit
// Ultra-Luxury Interface: Cloudinary Image Upload, Specifications, Variants, Validation
// ============================================================================
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  DollarSign,
  Package,
  Truck,
  Image as ImageIcon,
  Gem,
  Crown,
} from 'lucide-react';
import { uploadProductImage } from '@/services/imageService';
import { fetchCategories } from '@/services/categoryService';
import { SEARCH_CATEGORIES } from '@/lib/constants';
import type { Product, ProductImage, ProductVariant, Category } from '@/types';

interface SellerProductFormProps {
  initialData?: Product;
  onSubmit: (formData: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  isEditing?: boolean;
}

export function SellerProductForm({
  initialData,
  onSubmit,
  isEditing = false,
}: SellerProductFormProps) {
  const router = useRouter();

  // Basic Info
  const [title, setTitle] = useState(initialData?.title || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [category, setCategory] = useState(initialData?.category || 'electronics');
  const [status, setStatus] = useState<Product['status']>(initialData?.status || 'active');
  const [isPrimeEligible, setIsPrimeEligible] = useState(initialData?.isPrimeEligible ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);

  // Pricing & Stock
  const [price, setPrice] = useState<number | ''>(initialData?.price ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(
    initialData?.compareAtPrice ?? '',
  );
  const [stock, setStock] = useState<number | ''>(initialData?.stock ?? 10);

  // Description & Features
  const [description, setDescription] = useState(initialData?.description || '');
  const [features, setFeatures] = useState<string[]>(
    initialData?.features || [
      'Handcrafted with noble metals and exquisite atelier finishing',
      'Complimentary Valenza insured white-glove transit included',
    ],
  );
  const [newFeatureText, setNewFeatureText] = useState('');

  // Images
  const [images, setImages] = useState<ProductImage[]>(
    initialData?.images || [
      {
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        alt: 'Product image',
        isPrimary: true,
      },
    ],
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Specifications
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>(
    initialData?.specifications
      ? Object.entries(initialData.specifications).map(([key, value]) => ({ key, value }))
      : [
          { key: 'Provenance', value: 'Swiss Manufacture Atelier' },
          { key: 'Condition', value: 'Pristine / Unworn Masterwork' },
        ],
  );
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || []);
  const [variantTitle, setVariantTitle] = useState('');
  const [variantAttrKey, setVariantAttrKey] = useState('Edition');
  const [variantAttrVal, setVariantAttrVal] = useState('');
  const [variantPrice, setVariantPrice] = useState<number | ''>('');
  const [variantStock, setVariantStock] = useState<number | ''>('');

  // Categories list with default luxury categories
  const [categoriesList, setCategoriesList] = useState<Category[]>(() =>
    SEARCH_CATEGORIES.filter((c) => c.value !== 'all').map((c) => ({
      id: `cat-${c.value}`,
      name: c.label,
      slug: c.value,
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setCategoriesList(res.data);
      }
    });
  }, []);

  // Discount calculation preview
  const discountPercent =
    typeof price === 'number' && typeof compareAtPrice === 'number' && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  // Cloudinary image upload handler
  const handleImageFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setUploadError(null);

    try {
      const uploadedImages: ProductImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadProductImage(file);
        if (res.success && res.data) {
          uploadedImages.push({
            url: res.data.url,
            publicId: res.data.publicId,
            alt: title || file.name,
            isPrimary: images.length === 0 && i === 0,
          });
        } else {
          setUploadError(res.error || `Failed to upload image "${file.name}"`);
        }
      }

      if (uploadedImages.length > 0) {
        setImages((prev) => [...prev, ...uploadedImages]);
      }
    } catch (err) {
      setUploadError((err as Error).message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const makeImagePrimary = (indexToPrimary: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === indexToPrimary,
      })),
    );
  };

  // Feature Bullets handlers
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  // Specs handlers
  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setSpecifications((prev) => [
      ...prev,
      { key: newSpecKey.trim(), value: newSpecVal.trim() },
    ]);
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== idx));
  };

  // Variants handlers
  const handleAddVariant = () => {
    if (!variantTitle.trim()) return;
    const vPrice = typeof variantPrice === 'number' ? variantPrice : typeof price === 'number' ? price : 0;
    const vStock = typeof variantStock === 'number' ? variantStock : typeof stock === 'number' ? stock : 0;

    const newV: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: variantTitle.trim(),
      sku: `${sku || 'VAR'}-${variantTitle.replace(/\s+/g, '-').toUpperCase()}`,
      price: vPrice,
      stock: vStock,
      attributes: {
        [variantAttrKey || 'Option']: variantAttrVal || variantTitle,
      },
    };

    setVariants((prev) => [...prev, newV]);
    setVariantTitle('');
    setVariantAttrVal('');
    setVariantPrice('');
    setVariantStock('');
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please provide a product title.');
      return;
    }
    if (typeof price !== 'number' || price <= 0) {
      setFormError('Please enter a valid product price greater than $0.');
      return;
    }
    if (typeof stock !== 'number' || stock < 0) {
      setFormError('Please enter a valid stock count (0 or greater).');
      return;
    }
    if (!category) {
      setFormError('Please choose a product category.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedCatObj = categoriesList.find((c) => c.slug === category);

      // Convert specifications array to record
      const specRecord: Record<string, string> = {};
      specifications.forEach((s) => {
        if (s.key && s.value) specRecord[s.key] = s.value;
      });

      const payload: Partial<Product> = {
        title: title.trim(),
        sku: sku.trim() || undefined,
        brand: brand.trim() || undefined,
        category,
        categoryName: selectedCatObj?.name,
        price: Number(price.toFixed(2)),
        compareAtPrice: typeof compareAtPrice === 'number' ? Number(compareAtPrice.toFixed(2)) : undefined,
        stock: Number(stock),
        status,
        description: description.trim(),
        features,
        specifications: specRecord,
        variants,
        images,
        isPrimeEligible,
        isFeatured,
      };

      const res = await onSubmit(payload);
      if (!res.success) {
        setFormError(res.error || 'Failed to save product listing.');
      } else {
        router.push('/seller/products');
      }
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs text-[#141312] dark:text-[#f8f5ee]">
      {formError && (
        <div className="rounded-2xl bg-red-50 dark:bg-[#241012] p-4 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-3 shadow-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-serif font-bold">Error saving workpiece</p>
            <p className="mt-0.5">{formError}</p>
          </div>
        </div>
      )}

      {/* ── Section 1: Basic Information ── */}
      <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-sm font-serif font-bold text-[#141312] dark:text-[#f8f5ee] border-b border-[#f0eae0] dark:border-[#1e2433] pb-3 flex items-center gap-2">
          <Layers size={15} className="text-[#c5a059]" />
          <span>Masterpiece Identity &amp; Classification</span>
        </h2>

        <div>
          <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
            Piece Title <span className="text-[#c5a059]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Audemars Piguet Royal Oak Double Balance Wheel Openworked"
            className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:ring-2 focus:ring-[#c5a059]/20 focus:outline-none transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
              Salon / Category <span className="text-[#c5a059]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none transition-all cursor-pointer"
              required
            >
              {categoriesList.map((c) => (
                <option 
                  key={c.id || c.slug} 
                  value={c.slug}
                  className="bg-white dark:bg-[#121622] text-[#141312] dark:text-[#f8f5ee] py-1"
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
              Maison / Atelier Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Patek Philippe, Cartier, Hermès"
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
              SKU Reference Code
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. AP-15407ST-OO"
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none uppercase font-mono transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-[#f0eae0] dark:border-[#1e2433]">
          <div>
            <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
              Exhibition Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none cursor-pointer"
            >
              <option value="active">Active (Visible in client salons)</option>
              <option value="draft">Draft (Private archive)</option>
              <option value="out_of_stock">Vault Depleted (Out of stock)</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 pt-7">
            <input
              type="checkbox"
              id="prime-check"
              checked={isPrimeEligible}
              onChange={(e) => setIsPrimeEligible(e.target.checked)}
              className="rounded border-[#dfd6c5] dark:border-[#2f384d] text-[#c5a059] focus:ring-[#c5a059] cursor-pointer accent-[#c5a059] h-4 w-4"
            />
            <label htmlFor="prime-check" className="font-serif text-xs text-[#141312] dark:text-[#f8f5ee] cursor-pointer select-none">
              Complimentary Insured Courier Transit
            </label>
          </div>

          <div className="flex items-center gap-2.5 pt-7">
            <input
              type="checkbox"
              id="featured-check"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-[#dfd6c5] dark:border-[#2f384d] text-[#c5a059] focus:ring-[#c5a059] cursor-pointer accent-[#c5a059] h-4 w-4"
            />
            <label htmlFor="featured-check" className="font-serif text-xs text-[#141312] dark:text-[#f8f5ee] cursor-pointer select-none">
              Feature on Maison Homepage
            </label>
          </div>
        </div>
      </div>

      {/* ── Section 2: Pricing & Vault Allocation ── */}
      <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-sm font-serif font-bold text-[#141312] dark:text-[#f8f5ee] border-b border-[#f0eae0] dark:border-[#1e2433] pb-3 flex items-center gap-2">
          <DollarSign size={15} className="text-[#c5a059]" />
          <span>Valuation &amp; Vault Allocation</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
              Valuation Price ($) <span className="text-[#c5a059]">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="0.00"
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:ring-2 focus:ring-[#c5a059]/20 focus:outline-none font-serif font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
              Original List Valuation ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="0.00"
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
            />
            {discountPercent > 0 && (
              <span className="text-[10px] font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-1 inline-block">
                Shows {discountPercent}% Private Preview Privilege
              </span>
            )}
          </div>

          <div>
            <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
              Vault Stock Quantity <span className="text-[#c5a059]">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="0"
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none font-serif font-bold"
              required
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Cloudinary Product Images ── */}
      <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#1e2433] pb-3">
          <h2 className="text-sm font-serif font-bold text-[#141312] dark:text-[#f8f5ee] flex items-center gap-2">
            <ImageIcon size={15} className="text-[#c5a059]" />
            <span>Masterpiece Gallery (Cloudinary High-Res Media)</span>
          </h2>
          <span className="text-xs font-serif text-[#8a7b68] dark:text-[#8e98ac]">{images.length} masterworks</span>
        </div>

        {uploadError && (
          <div className="rounded-2xl bg-red-50 dark:bg-[#241012] p-3 text-xs text-red-700 dark:text-red-300 border border-red-200">
            {uploadError}
          </div>
        )}

        {/* Upload Button Strip */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#9b7532] px-5 py-2.5 text-xs font-serif font-bold uppercase tracking-wider text-[#121110] hover:brightness-105 shadow-xs transition-all">
            {uploadingImage ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Uploading to Cloudinary...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Upload Media Files</span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={uploadingImage}
              onChange={handleImageFilesSelected}
              className="hidden"
            />
          </label>
          <span className="text-[11px] text-[#786b58] dark:text-[#9e978b] font-sans">
            Supports multiple high-resolution PNG, JPG, and WEBP photographs via Cloudinary CDN.
          </span>
        </div>

        {/* Gallery Thumbnails Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border p-2 bg-[#fdfcf9] dark:bg-[#171c26] flex flex-col justify-between ${
                img.isPrimary
                  ? 'border-[#c5a059] ring-2 ring-[#c5a059]/30'
                  : 'border-[#ede4d4] dark:border-[#282f3f]'
              }`}
            >
              <div className="relative h-24 w-full rounded-xl overflow-hidden mb-1.5 bg-[#f5efe5] dark:bg-[#12151e]">
                <Image
                  src={img.url}
                  alt={img.alt || 'Masterpiece photo'}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#f0eae0] dark:border-[#1e2433] text-[10px]">
                <button
                  type="button"
                  onClick={() => makeImagePrimary(idx)}
                  className={`cursor-pointer font-serif ${
                    img.isPrimary ? 'text-[#8a6827] dark:text-[#dfba73] font-bold' : 'text-[#8a8277] hover:underline'
                  }`}
                >
                  {img.isPrimary ? '★ Primary' : 'Set Primary'}
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-red-500 hover:text-red-700 cursor-pointer p-0.5"
                  title="Remove photograph"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Description & Bullet Features ── */}
      <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-sm font-serif font-bold text-[#141312] dark:text-[#f8f5ee] border-b border-[#f0eae0] dark:border-[#1e2433] pb-3">
          Masterpiece Narrative &amp; Craft Highlights
        </h2>

        <div>
          <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-1.5">
            Curatorial Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a comprehensive provenance, architectural context, and finishing details..."
            className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] p-3.5 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Feature bullets */}
        <div>
          <label className="block font-serif font-semibold text-xs text-[#141312] dark:text-[#f8f5ee] mb-2">
            Salient Atelier Highlights (&quot;About this piece&quot;)
          </label>
          <div className="space-y-2.5 mb-3.5">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059] flex-shrink-0" />
                <span className="flex-1 text-[#4a433a] dark:text-[#d0c9bd] font-serif text-xs">{feat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              placeholder="Add another hallmark / craft highlight..."
              className="flex-1 rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2 rounded-2xl border border-[#d6be90] dark:border-[#2f384d] text-xs font-serif font-bold text-[#8a6827] dark:text-[#dfba73] hover:bg-[#faf7f2] dark:hover:bg-[#1e2433] transition-colors"
            >
              Add Highlight
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 5: Technical Specifications ── */}
      <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-sm font-serif font-bold text-[#141312] dark:text-[#f8f5ee] border-b border-[#f0eae0] dark:border-[#1e2433] pb-3">
          Provenance &amp; Specifications
        </h2>

        <div className="space-y-2.5">
          {specifications.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-40 font-serif font-semibold text-[#8a6827] dark:text-[#dfba73] truncate">
                {spec.key}:
              </span>
              <span className="flex-1 text-[#4a433a] dark:text-[#d0c9bd]">{spec.value}</span>
              <button
                type="button"
                onClick={() => handleRemoveSpec(idx)}
                className="text-gray-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <input
            type="text"
            value={newSpecKey}
            onChange={(e) => setNewSpecKey(e.target.value)}
            placeholder="Dimension / Calibre / Material"
            className="w-full sm:w-52 rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
          />
          <input
            type="text"
            value={newSpecVal}
            onChange={(e) => setNewSpecVal(e.target.value)}
            placeholder="e.g. 18K Rose Gold, 41mm Diameter"
            className="flex-1 rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] px-4 py-2 text-xs text-[#141312] dark:text-[#f8f5ee] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddSpec}
            className="px-4 py-2 rounded-2xl border border-[#d6be90] dark:border-[#2f384d] text-xs font-serif font-bold text-[#8a6827] dark:text-[#dfba73] hover:bg-[#faf7f2] dark:hover:bg-[#1e2433] transition-colors"
          >
            Add Specification
          </button>
        </div>
      </div>

      {/* ── Submit Action Strip ── */}
      <div className="pt-4 flex items-center justify-end gap-3.5">
        <button
          type="button"
          onClick={() => router.push('/seller/products')}
          className="px-5 py-2.5 rounded-full border border-[#d6be90] dark:border-[#2f384d] text-xs font-serif font-semibold text-[#6d6356] dark:text-[#a0a6b5] hover:bg-[#faf7f2] dark:hover:bg-[#1e2433] transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="px-7 py-2.5 rounded-full text-xs font-serif tracking-widest uppercase font-bold text-[#121110] bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#9b7532] hover:brightness-105 active:scale-98 border border-[#c5a059]/50 shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Saving Masterpiece...</span>
            </>
          ) : (
            <span>{isEditing ? 'Save Revisions' : 'Publish Masterpiece'}</span>
          )}
        </button>
      </div>
    </form>
  );
}

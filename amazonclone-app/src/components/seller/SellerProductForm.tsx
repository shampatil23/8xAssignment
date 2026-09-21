'use client';
// ============================================================================
// SellerProductForm — Amazon Seller Central Product Creation & Editing Form
// Multiple Cloudinary image uploads, variants, specifications, validation
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { uploadProductImage } from '@/services/imageService';
import { fetchCategories } from '@/services/categoryService';
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
  const [category, setCategory] = useState(initialData?.category || '');
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
    initialData?.features || ['High quality materials and craftsmanship', 'Full manufacturer warranty included'],
  );
  const [newFeatureText, setNewFeatureText] = useState('');

  // Images
  const [images, setImages] = useState<ProductImage[]>(
    initialData?.images || [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
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
          { key: 'Warranty', value: '1 Year Limited' },
          { key: 'Condition', value: 'Brand New' },
        ],
  );
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || []);
  const [variantTitle, setVariantTitle] = useState('');
  const [variantAttrKey, setVariantAttrKey] = useState('Color');
  const [variantAttrVal, setVariantAttrVal] = useState('');
  const [variantPrice, setVariantPrice] = useState<number | ''>('');
  const [variantStock, setVariantStock] = useState<number | ''>('');

  // Categories list
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then((res) => {
      if (res.success && res.data) {
        setCategoriesList(res.data);
        if (!category && res.data.length > 0) {
          setCategory(res.data[0].slug);
        }
      }
    });
  }, [category]);

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
          setUploadError(res.error || `Failed to upload ${file.name}`);
        }
      }

      if (uploadedImages.length > 0) {
        setImages((prev) => [...prev, ...uploadedImages]);
      }
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const makeImagePrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  };

  // Features handlers
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  // Specifications handlers
  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setSpecifications((prev) => [
      ...prev,
      { key: newSpecKey.trim(), value: newSpecVal.trim() },
    ]);
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Variants handlers
  const handleAddVariant = () => {
    if (!variantTitle.trim()) return;
    const vPrice = typeof variantPrice === 'number' ? variantPrice : typeof price === 'number' ? price : 0;
    const vStock = typeof variantStock === 'number' ? variantStock : typeof stock === 'number' ? stock : 0;

    const newV: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      sku: `${sku || 'SKU'}-${variantTitle.replace(/\s+/g, '-').toUpperCase()}`,
      title: variantTitle.trim(),
      price: vPrice,
      stock: vStock,
      image: images[0]?.url,
      attributes: {
        [variantAttrKey.trim()]: variantAttrVal.trim() || variantTitle.trim(),
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
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {formError && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error saving product</p>
            <p className="mt-0.5">{formError}</p>
          </div>
        </div>
      )}

      {/* ── Section 1: Basic Information ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Layers size={16} className="text-amazon-orange" />
          <span>Product Identity &amp; Classification</span>
        </h2>

        <div>
          <label className="block font-semibold text-gray-800 mb-1">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Canceling Headphones"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-amazon-orange focus:outline-none"
              required
            >
              {categoriesList.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Sony, Apple, Nike"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. SNY-WH1000XM5-BLK"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none uppercase font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Listing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-amazon-orange focus:outline-none"
            >
              <option value="active">Active (Visible in catalog)</option>
              <option value="draft">Draft (Hidden from customers)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="prime-check"
              checked={isPrimeEligible}
              onChange={(e) => setIsPrimeEligible(e.target.checked)}
              className="rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange cursor-pointer"
            />
            <label htmlFor="prime-check" className="font-semibold text-gray-700 cursor-pointer">
              Prime Fast Delivery Eligible
            </label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="featured-check"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange cursor-pointer"
            />
            <label htmlFor="featured-check" className="font-semibold text-gray-700 cursor-pointer">
              Featured on Homepage
            </label>
          </div>
        </div>
      </div>

      {/* ── Section 2: Pricing & Inventory ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <DollarSign size={16} className="text-amazon-orange" />
          <span>Pricing &amp; Inventory</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="0.00"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Compare-At / List Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="0.00"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
            />
            {discountPercent > 0 && (
              <span className="text-[11px] font-bold text-green-700 mt-1 inline-block">
                Shows {discountPercent}% OFF discount badge
              </span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none font-bold"
              required
            />
            {typeof stock === 'number' && stock <= 5 && stock > 0 && (
              <span className="text-[11px] font-semibold text-amber-700 mt-1 inline-block">
                Low stock alert triggers under 5 items
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 3: Cloudinary Product Images ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon size={16} className="text-amazon-orange" />
            <span>Product Gallery (Cloudinary Images)</span>
          </h2>
          <span className="text-xs text-gray-500">{images.length} images</span>
        </div>

        {uploadError && (
          <div className="rounded bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
            {uploadError}
          </div>
        )}

        {/* Upload Button Strip */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-amazon-yellow px-4 py-2 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover border border-[#fcd200] shadow-2xs">
            {uploadingImage ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Uploading to Cloudinary...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Upload Product Images</span>
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
          <span className="text-[11px] text-gray-500">
            Supports multiple high-res PNG, JPG, WEBP uploads via Cloudinary.
          </span>
        </div>

        {/* Gallery Thumbnails Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative rounded-lg border p-1 bg-white flex flex-col justify-between ${
                img.isPrimary ? 'border-amazon-orange ring-2 ring-amazon-orange/20' : 'border-gray-200'
              }`}
            >
              <div className="relative h-24 w-full rounded overflow-hidden mb-1">
                <Image
                  src={img.url}
                  alt={img.alt || 'Product image'}
                  fill
                  sizes="120px"
                  className="object-contain p-1"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px]">
                <button
                  type="button"
                  onClick={() => makeImagePrimary(idx)}
                  className={`cursor-pointer font-semibold ${
                    img.isPrimary ? 'text-amazon-orange font-bold' : 'text-gray-500 hover:underline'
                  }`}
                >
                  {img.isPrimary ? 'Primary' : 'Set Primary'}
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-red-500 hover:text-red-700 cursor-pointer p-0.5"
                  title="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Description & Bullet Features ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
          Product Description &amp; Key Features
        </h2>

        <div>
          <label className="block font-semibold text-gray-800 mb-1">
            Detailed Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a clear, comprehensive description of this product..."
            className="w-full rounded-md border border-gray-300 p-3 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
          />
        </div>

        {/* Feature bullets */}
        <div>
          <label className="block font-semibold text-gray-800 mb-1">
            Key Features (&quot;About this item&quot;)
          </label>
          <div className="space-y-2 mb-3">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amazon-orange flex-shrink-0" />
                <span className="flex-1 text-gray-700">{feat}</span>
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

          <div className="flex gap-2">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              placeholder="Add another highlight / feature bullet..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddFeature}
              className="text-xs px-3 py-1.5"
            >
              Add Bullet
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section 5: Variants (Options) ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Package size={16} className="text-amazon-orange" />
            <span>Product Variants (Colors, Sizes, Configurations)</span>
          </h2>
          <span className="text-xs text-gray-500">{variants.length} active variants</span>
        </div>

        {variants.length > 0 && (
          <div className="divide-y divide-gray-100 border rounded-md overflow-hidden bg-white">
            {variants.map((v) => (
              <div key={v.id} className="p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{v.title}</p>
                  <p className="text-[11px] text-gray-500">
                    SKU: {v.sku} · Price: ${v.price.toFixed(2)} · Stock: {v.stock}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(v.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Variant Form */}
        <div className="rounded-lg bg-gray-50 p-3 border border-gray-200 space-y-3">
          <p className="font-semibold text-gray-800">Add New Variant Option:</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 mb-0.5">Variant Title</label>
              <input
                type="text"
                value={variantTitle}
                onChange={(e) => setVariantTitle(e.target.value)}
                placeholder="e.g. 256GB / Space Gray"
                className="w-full rounded border border-gray-300 p-1.5 text-xs bg-white focus:ring-1 focus:ring-amazon-orange focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-0.5">Attribute Name</label>
              <input
                type="text"
                value={variantAttrKey}
                onChange={(e) => setVariantAttrKey(e.target.value)}
                placeholder="Color / Size / Storage"
                className="w-full rounded border border-gray-300 p-1.5 text-xs bg-white focus:ring-1 focus:ring-amazon-orange focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-0.5">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={variantPrice}
                onChange={(e) => setVariantPrice(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder={typeof price === 'number' ? `${price.toFixed(2)}` : '0.00'}
                className="w-full rounded border border-gray-300 p-1.5 text-xs bg-white focus:ring-1 focus:ring-amazon-orange focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-0.5">Stock Qty</label>
              <input
                type="number"
                value={variantStock}
                onChange={(e) => setVariantStock(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder={typeof stock === 'number' ? `${stock}` : '0'}
                className="w-full rounded border border-gray-300 p-1.5 text-xs bg-white focus:ring-1 focus:ring-amazon-orange focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddVariant}
              className="text-xs px-3 py-1 font-semibold"
            >
              Add Variant
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section 6: Specifications ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
          Technical Specifications
        </h2>

        <div className="space-y-2">
          {specifications.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-36 font-semibold text-gray-700 truncate">{spec.key}:</span>
              <span className="flex-1 text-gray-600">{spec.value}</span>
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

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <input
            type="text"
            value={newSpecKey}
            onChange={(e) => setNewSpecKey(e.target.value)}
            placeholder="Spec Name (e.g. Battery Life)"
            className="w-full sm:w-48 rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
          />
          <input
            type="text"
            value={newSpecVal}
            onChange={(e) => setNewSpecVal(e.target.value)}
            placeholder="Spec Value (e.g. Up to 30 hours)"
            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddSpec}
            className="text-xs px-3 py-1.5"
          >
            Add Spec
          </Button>
        </div>
      </div>

      {/* ── Submit Action Strip ── */}
      <div className="pt-4 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/seller/products')}
          className="text-xs px-5 py-2 font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="buy-now"
          disabled={submitting || uploadingImage}
          className="text-xs px-6 py-2.5 font-bold shadow-xs flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Product...</span>
            </>
          ) : (
            <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
          )}
        </Button>
      </div>
    </form>
  );
}

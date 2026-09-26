'use client';
// ============================================================================
// Admin — Hero Banners & Promotional Offers Management
// Provides complete CMS capabilities for the dynamic storefront Hero Slideshow,
// promotional campaign tags, discount codes, and direct Cloudinary image uploads.
// ============================================================================
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Eye,
  Tag,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import {
  fetchHeroBanners,
  saveHeroBanner,
  deleteHeroBanner,
  uploadHeroBannerImage,
} from '@/services/bannerService';
import type { HeroBanner } from '@/types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal Create/Edit State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bannerId, setBannerId] = useState('');
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [primaryHref, setPrimaryHref] = useState('');
  const [primaryCta, setPrimaryCta] = useState('');
  const [secondaryHref, setSecondaryHref] = useState('');
  const [secondaryCta, setSecondaryCta] = useState('');
  const [highlightTag, setHighlightTag] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Cloudinary Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Saving State
  const [saving, setSaving] = useState(false);

  // Delete Confirm Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetBanner, setTargetBanner] = useState<HeroBanner | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Preview Selected Banner
  const [previewBanner, setPreviewBanner] = useState<HeroBanner | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHeroBanners(false);
      if (res.success && res.data) {
        setBanners(res.data);
        if (res.data.length > 0 && !previewBanner) {
          setPreviewBanner(res.data[0]);
        }
      } else {
        setError(res.error || 'Failed to load banners.');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const filteredBanners = banners.filter((b) => {
    const matchesSearch =
      searchQuery === '' ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.offerCode && b.offerCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.discountText && b.discountText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && b.isActive) ||
      (filterStatus === 'inactive' && !b.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setBannerId(`banner-${Date.now()}`);
    setBadge('EXCLUSIVE MAISON • SALON 2026');
    setTitle('New Haute Exhibition Showcase');
    setSubtitle('CURATED ARTISAN COLLECTION');
    setDescription('Immerse yourself in precision craftsmanship and bespoke luxury design.');
    setImage('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2400&auto=format&fit=crop');
    setImagePublicId('');
    setPrimaryHref('/category/fashion');
    setPrimaryCta('Explore Collection');
    setSecondaryHref('/deals');
    setSecondaryCta('Private Access');
    setHighlightTag('Limited Commission');
    setDiscountText('Special 20% Privilege');
    setOfferCode('MAISON20');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setOrder(banners.length + 1);
    setIsActive(true);
    setUploadProgress(0);
    setUploadError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: HeroBanner) => {
    setIsEditing(true);
    setBannerId(b.id);
    setBadge(b.badge || '');
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setDescription(b.description || '');
    setImage(b.image || '');
    setImagePublicId(b.imagePublicId || '');
    setPrimaryHref(b.primaryHref || '');
    setPrimaryCta(b.primaryCta || '');
    setSecondaryHref(b.secondaryHref || '');
    setSecondaryCta(b.secondaryCta || '');
    setHighlightTag(b.highlightTag || '');
    setDiscountText(b.discountText || '');
    setOfferCode(b.offerCode || '');
    setStartDate(b.startDate ? b.startDate.split('T')[0] : '');
    setEndDate(b.endDate ? b.endDate.split('T')[0] : '');
    setOrder(b.order ?? 1);
    setIsActive(b.isActive !== false);
    setUploadProgress(0);
    setUploadError(null);
    setModalOpen(true);
  };

  const handleDuplicate = (b: HeroBanner) => {
    setIsEditing(false);
    setBannerId(`banner-${Date.now()}`);
    setBadge(b.badge);
    setTitle(`${b.title} (Copy)`);
    setSubtitle(b.subtitle);
    setDescription(b.description);
    setImage(b.image);
    setImagePublicId(b.imagePublicId || '');
    setPrimaryHref(b.primaryHref);
    setPrimaryCta(b.primaryCta);
    setSecondaryHref(b.secondaryHref || '');
    setSecondaryCta(b.secondaryCta || '');
    setHighlightTag(b.highlightTag || '');
    setDiscountText(b.discountText || '');
    setOfferCode(b.offerCode || '');
    setStartDate(b.startDate ? b.startDate.split('T')[0] : '');
    setEndDate(b.endDate ? b.endDate.split('T')[0] : '');
    setOrder(banners.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  // Cloudinary File Upload Handler
  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB) and type
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please upload an optimized image.');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const res = await uploadHeroBannerImage(file, (pct) => {
        setUploadProgress(pct);
      });

      if (res.success && res.data) {
        setImage(res.data.url);
        setImagePublicId(res.data.publicId);
        setUploadProgress(100);
        setSuccessMessage('Cloudinary image uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setUploadError(res.error || 'Failed to upload image to Cloudinary.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Image upload error.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    const updated: HeroBanner = { ...banner, isActive: !banner.isActive };
    const res = await saveHeroBanner(updated);
    if (res.success) {
      setSuccessMessage(`Banner "${banner.title}" is now ${updated.isActive ? 'Active' : 'Disabled'}.`);
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(res.error || 'Failed to toggle status.');
    }
  };

  const handleMoveOrder = async (banner: HeroBanner, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex((b) => b.id === banner.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === banners.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newBanners = [...banners];
    const temp = newBanners[currentIndex];
    newBanners[currentIndex] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    // Update order numbers
    newBanners.forEach((b, idx) => {
      b.order = idx + 1;
    });

    setBanners(newBanners);

    // Save both updated items
    await Promise.all([
      saveHeroBanner(newBanners[currentIndex]),
      saveHeroBanner(newBanners[targetIndex]),
    ]);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Slide title is required.');
      return;
    }
    if (!image.trim()) {
      setError('Banner image URL or Cloudinary upload is required.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload: HeroBanner = {
      id: bannerId,
      badge: badge.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      image: image.trim(),
      imagePublicId: imagePublicId.trim() || undefined,
      primaryHref: primaryHref.trim() || '/deals',
      primaryCta: primaryCta.trim() || 'Explore',
      secondaryHref: secondaryHref.trim() || undefined,
      secondaryCta: secondaryCta.trim() || undefined,
      highlightTag: highlightTag.trim() || undefined,
      discountText: discountText.trim() || undefined,
      offerCode: offerCode.trim() ? offerCode.trim().toUpperCase() : undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      order: Number(order) || 1,
      isActive,
      createdAt: isEditing
        ? banners.find((b) => b.id === bannerId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    const res = await saveHeroBanner(payload);
    if (res.success && res.data) {
      setSuccessMessage(`Hero banner "${payload.title}" saved successfully!`);
      setModalOpen(false);
      await loadBanners();
      setPreviewBanner(payload);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setError(res.error || 'Failed to save banner.');
    }
    setSaving(false);
  };

  const handleDeleteClick = (banner: HeroBanner) => {
    setTargetBanner(banner);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetBanner) return;
    setDeleting(true);
    const res = await deleteHeroBanner(targetBanner.id);
    if (res.success) {
      setSuccessMessage(`Banner "${targetBanner.title}" was removed.`);
      setBanners((prev) => prev.filter((b) => b.id !== targetBanner.id));
      if (previewBanner?.id === targetBanner.id) {
        setPreviewBanner(banners.find((b) => b.id !== targetBanner.id) || null);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(res.error || 'Failed to delete banner.');
    }
    setDeleting(false);
    setDeleteModalOpen(false);
    setTargetBanner(null);
  };

  const activeCount = banners.filter((b) => b.isActive).length;
  const offersCount = banners.filter((b) => b.offerCode || b.discountText).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ── Top Header & Stats ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-amber-500" size={22} />
              <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
                Hero Banners & Promotional Offers
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Curate dynamic homepage slideshows, exclusive promo coupon codes, and Cloudinary-stored campaign visuals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadBanners}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-amber-500' : ''} />
              <span>Refresh</span>
            </button>
            <button
              id="create-banner-btn"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfba73] hover:brightness-105 text-[#121110] font-bold text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus size={18} />
              <span>Add Offer Banner</span>
            </button>
          </div>
        </div>

        {/* ── Summary Stat Pills ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#131921] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-gray-500">Total Slides</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{banners.length}</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Layers size={22} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#131921] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-gray-500">Active on Storefront</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#131921] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-gray-500">Active Promo Codes</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{offersCount}</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Tag size={22} />
            </div>
          </div>
        </div>

        {/* ── Notification Feedback ── */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center justify-between text-red-700 dark:text-red-300 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Interactive Live Preview of Selected Hero Banner ── */}
        {previewBanner && (
          <div className="bg-white dark:bg-[#131921] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Live Storefront Preview Simulation: {previewBanner.title}
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400">Order #{previewBanner.order}</span>
            </div>

            <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden shadow-inner flex flex-col justify-center px-6 sm:px-12 bg-neutral-900">
              {/* Background */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-75"
                style={{ backgroundImage: `url(${previewBanner.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

              {/* Content */}
              <div className="relative z-10 max-w-xl text-white space-y-2">
                <h3 className="font-serif text-xl sm:text-2xl font-light text-white leading-tight">
                  {previewBanner.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 max-w-md font-normal">
                  {previewBanner.description}
                </p>

                {(previewBanner.discountText || previewBanner.offerCode) && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 dark:bg-black/50 border border-[#dfba73]/40 text-xs font-serif font-semibold text-[#dfba73] backdrop-blur-md">
                    <Tag size={13} className="text-[#dfba73]" />
                    <span>{previewBanner.discountText || 'Exclusive Offer'}</span>
                    {previewBanner.offerCode && (
                      <span className="bg-[#1a1815] px-2 py-0.5 rounded font-mono text-white border border-[#c5a059]/40 tracking-wider">
                        {previewBanner.offerCode}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <span className="px-5 py-2 rounded-full bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#aa8038] text-[#121110] font-serif font-bold text-xs uppercase tracking-widest shadow-md">
                    {previewBanner.primaryCta || 'Explore Collection'}
                  </span>
                  {previewBanner.secondaryCta && (
                    <span className="px-5 py-2 rounded-full backdrop-blur-md bg-white/20 border border-[#c5a059]/70 text-white font-serif font-semibold text-xs uppercase tracking-widest shadow-xs">
                      {previewBanner.secondaryCta}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Filters & Search Controls ── */}
        <div className="bg-white dark:bg-[#131921] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by title, badge, promo code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All ({banners.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterStatus === 'inactive'
                    ? 'bg-gray-400 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Inactive ({banners.length - activeCount})
              </button>
            </div>
          </div>
        </div>

        {/* ── Banners List ── */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center bg-white dark:bg-[#131921] rounded-2xl border border-gray-200 dark:border-gray-800">
              <RefreshCw className="animate-spin text-amber-500 mx-auto mb-2" size={28} />
              <p className="text-sm text-gray-500">Loading hero offer banners from database...</p>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#131921] rounded-2xl border border-gray-200 dark:border-gray-800">
              <Layers className="text-gray-300 dark:text-gray-600 mx-auto mb-2" size={40} />
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">No Hero Banners Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                {searchQuery ? 'No banners match your search filter.' : 'Create your first dynamic hero banner to display on the storefront.'}
              </p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-gray-900 font-semibold text-xs uppercase tracking-wider"
              >
                <Plus size={16} /> Add Offer Banner
              </button>
            </div>
          ) : (
            filteredBanners.map((b, index) => (
              <div
                key={b.id}
                className={`bg-white dark:bg-[#131921] p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  previewBanner?.id === b.id
                    ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {/* Left: Thumbnail & Main Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Order & Reorder arrows */}
                  <div className="flex flex-col items-center justify-center gap-1">
                    <button
                      onClick={() => handleMoveOrder(b, 'up')}
                      disabled={index === 0}
                      title="Move slide up"
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <span className="text-xs font-mono font-bold text-gray-400">#{b.order ?? index + 1}</span>
                    <button
                      onClick={() => handleMoveOrder(b, 'down')}
                      disabled={index === filteredBanners.length - 1}
                      title="Move slide down"
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Thumbnail Image */}
                  <div
                    onClick={() => setPreviewBanner(b)}
                    className="relative w-28 h-18 sm:w-36 sm:h-22 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 cursor-pointer group shadow-xs"
                  >
                    <img
                      src={b.image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye size={18} />
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {b.badge && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 uppercase tracking-wider">
                          {b.badge}
                        </span>
                      )}
                      {b.isActive ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active Live
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-500/10 text-gray-500 border border-gray-500/20">
                          Disabled
                        </span>
                      )}
                      {b.imagePublicId && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          Cloudinary CDN
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-serif font-bold text-gray-900 dark:text-white truncate">
                      {b.title}
                    </h4>

                    {b.subtitle && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium tracking-wider uppercase truncate">
                        {b.subtitle}
                      </p>
                    )}

                    {/* Offer Tag & Code */}
                    {(b.discountText || b.offerCode) && (
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600 dark:text-gray-300">
                        {b.discountText && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Tag size={12} /> {b.discountText}
                          </span>
                        )}
                        {b.offerCode && (
                          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[11px] font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                            Code: {b.offerCode}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                  {/* Toggle Active Button */}
                  <button
                    onClick={() => handleToggleActive(b)}
                    title={b.isActive ? 'Deactivate banner' : 'Activate banner'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      b.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {b.isActive ? 'Active' : 'Enable'}
                  </button>

                  <button
                    onClick={() => setPreviewBanner(b)}
                    title="Simulate Preview"
                    className="p-2 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={() => handleDuplicate(b)}
                    title="Duplicate Banner"
                    className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                  >
                    <Copy size={16} />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(b)}
                    title="Edit Banner"
                    className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(b)}
                    title="Delete Banner"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Add / Edit Modal ── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-[#131921] rounded-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl my-8 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
                    {isEditing ? 'Edit Hero Offer Banner' : 'Create New Hero Offer Banner'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveBanner} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* 1. Category Badge & Highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Category / Salon Badge *
                    </label>
                    <input
                      type="text"
                      required
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. HAUTE HORLOGERIE • SALON 2026"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Highlight Tag (Optional)
                    </label>
                    <input
                      type="text"
                      value={highlightTag}
                      onChange={(e) => setHighlightTag(e.target.value)}
                      placeholder="e.g. Limited to 25 Pieces Worldwide"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 2. Title & Subtitle */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Main Headline / Slide Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Masterpieces of Perpetual Motion"
                      className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Subtitle Tagline
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. THE APEX OF SWISS CRAFTSMANSHIP"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Detailed Narrative / Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Immerse yourself in precision mechanical art..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 3. Promotional Offer & Discount Code */}
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    <Tag size={14} />
                    <span>Special Promotional Offer & Coupon Tag</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Discount / Offer Label
                      </label>
                      <input
                        type="text"
                        value={discountText}
                        onChange={(e) => setDiscountText(e.target.value)}
                        placeholder="e.g. Up to 40% Off Exhibition"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Promo Coupon Code (One-click copyable)
                      </label>
                      <input
                        type="text"
                        value={offerCode}
                        onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                        placeholder="e.g. VALENZA2026"
                        className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Cloudinary Image Storage & Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Cloudinary Banner Image *
                  </label>

                  {/* Image Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center hover:border-amber-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleCloudinaryUpload}
                      className="hidden"
                    />

                    {image ? (
                      <div className="space-y-3">
                        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 cursor-pointer"
                          >
                            <Upload size={13} />
                            <span>Replace on Cloudinary</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="py-4 cursor-pointer flex flex-col items-center"
                      >
                        <Upload size={24} className="text-gray-400 mb-1" />
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Click to upload high-res image to Cloudinary
                        </p>
                        <p className="text-[11px] text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    )}

                    {uploadingImage && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-amber-600 font-medium">
                          <span>Uploading to Cloudinary...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">{uploadError}</p>
                    )}
                  </div>

                  {/* Direct Image URL input fallback */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Or Paste Image Direct URL:
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* 5. CTAs & Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Primary Button Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={primaryCta}
                      onChange={(e) => setPrimaryCta(e.target.value)}
                      placeholder="e.g. Explore Timepieces"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Primary Target URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={primaryHref}
                      onChange={(e) => setPrimaryHref(e.target.value)}
                      placeholder="e.g. /category/electronics or /deals"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Secondary Button Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={secondaryCta}
                      onChange={(e) => setSecondaryCta(e.target.value)}
                      placeholder="e.g. Private Viewing"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Secondary Target URL
                    </label>
                    <input
                      type="text"
                      value={secondaryHref}
                      onChange={(e) => setSecondaryHref(e.target.value)}
                      placeholder="e.g. /deals or /registry"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* 6. Display Order & Active Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Display Priority / Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Active on Storefront</p>
                      <p className="text-[11px] text-gray-500">Slide is displayed in customer slideshow.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>
                </div>

                {/* Submit / Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingImage}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfba73] hover:brightness-105 text-[#121110] font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>{isEditing ? 'Update Hero Banner' : 'Create Banner'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Hero Offer Banner?"
          message={`Are you sure you want to permanently remove "${targetBanner?.title}"? This banner will no longer appear on the storefront.`}
          confirmText={deleting ? 'Deleting...' : 'Delete Banner'}
          cancelText="Cancel"
          variant="danger"
          isLoading={deleting}
        />
      </div>
    </AdminLayout>
  );
}

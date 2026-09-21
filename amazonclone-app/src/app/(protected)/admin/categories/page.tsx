'use client';
// ============================================================================
// Admin Categories Management — Taxonomy, Creation, Editing & Deletion
// ============================================================================
import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Package,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import {
  fetchAdminCategories,
  saveAdminCategory,
  deleteAdminCategory,
} from '@/services/adminService';
import type { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { slugify } from '@/lib/utils';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [catId, setCatId] = useState('');
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete Confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminCategories();
    if (res.success && res.data) {
      setCategories(res.data);
    } else {
      setError(res.error || 'Failed to load categories.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      q === '' ||
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCatId(`cat-${Date.now()}`);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatImage('');
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setIsEditing(true);
    setCatId(category.id);
    setCatName(category.name);
    setCatSlug(category.slug);
    setCatDesc(category.description || '');
    setCatImage(category.image || '');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setError('Category name is required.');
      return;
    }
    const finalSlug = catSlug.trim() || slugify(catName);

    setSaving(true);
    setError(null);

    const payload: Category = {
      id: catId,
      name: catName.trim(),
      slug: finalSlug,
      description: catDesc.trim(),
      image: catImage.trim() || undefined,
    };

    const res = await saveAdminCategory(payload);
    if (res.success) {
      setSuccessMessage(`Category "${payload.name}" saved successfully.`);
      setCategories((prev) => {
        const index = prev.findIndex((c) => c.id === payload.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = payload;
          return updated;
        }
        return [...prev, payload];
      });
      setModalOpen(false);
    } else {
      setError(res.error || 'Failed to save category.');
    }
    setSaving(false);
  };

  const handleDeleteCategory = async () => {
    if (!targetCategory) return;
    setDeleting(true);
    const res = await deleteAdminCategory(targetCategory.id);
    if (res.success) {
      setSuccessMessage(`Category "${targetCategory.name}" removed.`);
      setCategories((prev) => prev.filter((c) => c.id !== targetCategory.id));
    } else {
      setError(res.error || 'Failed to delete category.');
    }
    setDeleting(false);
    setDeleteModalOpen(false);
    setTargetCategory(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Layers className="h-6 w-6 text-purple-600" />
              Product Categories
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Maintain the marketplace category taxonomy, department trees, and navigation classifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCategories}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </Button>
          </div>
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

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search category name, slug, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              Loading categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No categories found.
            </div>
          ) : (
            filteredCategories.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
                        <Layers size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">/{c.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                        title="Edit Category"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetCategory(c);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {c.description || 'No description provided for this department category.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">ID: {c.id}</span>
                  <span className="text-purple-600 font-semibold uppercase text-[10px]">Active</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Create / Edit Modal ── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setModalOpen(false)}
            />
            <form
              onSubmit={handleSaveCategory}
              className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl z-10 border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {isEditing ? 'Edit Category' : 'Create Category'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value);
                      if (!isEditing) setCatSlug(slugify(e.target.value));
                    }}
                    placeholder="e.g. Electronics, Home & Kitchen"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="e.g. electronics"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Brief description of products in this category..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden resize-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isEditing ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Delete Category"
          message={`Are you sure you want to remove category "${targetCategory?.name}"? Products under this category will remain, but the category navigation node will be removed.`}
          confirmText="Yes, Delete Category"
          variant="danger"
          isLoading={deleting}
          onConfirm={handleDeleteCategory}
          onCancel={() => {
            setDeleteModalOpen(false);
            setTargetCategory(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  stockQuantity: number;
  imageUrl: string;
  categoryId: string;
  category: Category;
  createdAt: string | Date;
}

interface ProductManagementClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductManagementClient({
  initialProducts,
  categories,
}: ProductManagementClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    categoryId: categories[0]?.id || '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      stockQuantity: '',
      imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
      categoryId: categories[0]?.id || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setModalMode('edit');
    setCurrentId(p.id);
    setFormData({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price.toString(),
      stockQuantity: p.stockQuantity.toString(),
      imageUrl: p.imageUrl,
      categoryId: p.categoryId,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create product');

        setProducts([data, ...products]);
      } else {
        const res = await fetch(`/api/products/${currentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update product');

        setProducts(products.map((p) => (p.id === currentId ? data : p)));
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      setProducts(products.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Product Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Create, update catalog inventory, adjust pricing, and organize categories
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Data Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Stock Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <a
                            href={`/product/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 flex items-center gap-1"
                          >
                            {p.name}
                            <ExternalLink className="h-3 w-3 text-slate-400" />
                          </a>
                          <span className="text-[11px] text-slate-400 font-mono">
                            /{p.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {p.category.name}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      ${Number(p.price).toFixed(2)}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          p.stockQuantity === 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : p.stockQuantity <= 5
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {p.stockQuantity} in stock
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors dark:hover:bg-slate-800"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-950/40"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirm Product Deletion
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this product from PostgreSQL? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {modalMode === 'create' ? 'Create New Product' : 'Edit Product Details'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ergonomic Split Keyboard"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99.99"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="50"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Custom Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ergonomic-split-keyboard"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of product features..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : modalMode === 'create' ? (
                    'Create Product'
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

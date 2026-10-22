import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  Search,
  Upload,
  AlertCircle,
  Image as ImageIcon,
  UtensilsCrossed,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem } from '../../types';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

export const AdminMenuPage: React.FC = () => {
  const {
    menuItems,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    toggleItemFeatured,
  } = useRestaurant();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: categories[0]?.id || '',
    is_available: true,
    is_featured: false,
    badge: '',
    sort_order: 1,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: categories[0]?.id || '',
      is_available: true,
      is_featured: false,
      badge: '',
      sort_order: menuItems.length + 1,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image_url: item.image_url,
      category_id: item.category_id,
      is_available: item.is_available,
      is_featured: item.is_featured,
      badge: item.badge || '',
      sort_order: item.sort_order,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Image Upload handler (supports base64 conversion or Supabase public URL preview)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({ ...prev, image_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numPrice = parseFloat(formData.price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError('Please enter a valid price (greater than or equal to 0).');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Please enter the food name.');
      return;
    }

    const categoryObj = categories.find((c) => c.id === formData.category_id);
    const categoryName = categoryObj?.name || 'Meal';
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingItem) {
      const res = await updateMenuItem(editingItem.id, {
        name: formData.name.trim(),
        slug,
        description: formData.description.trim(),
        price: numPrice,
        image_url: formData.image_url.trim() || editingItem.image_url,
        category_id: formData.category_id,
        category_name: categoryName,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        badge: formData.badge.trim() || undefined,
        sort_order: Number(formData.sort_order),
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to update menu item.');
        return;
      }
    } else {
      const res = await addMenuItem({
        name: formData.name.trim(),
        slug,
        description: formData.description.trim(),
        price: numPrice,
        image_url:
          formData.image_url.trim() ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        category_id: formData.category_id,
        category_name: categoryName,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        badge: formData.badge.trim() || undefined,
        sort_order: Number(formData.sort_order),
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to add menu item.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMenuItem(id);
    setDeleteConfirmId(null);
  };

  // Filter items
  const filtered = menuItems.filter((item) => {
    const matchesCat = categoryFilter === 'all' || item.category_id === categoryFilter;
    const matchesQuery =
      search.trim() === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-[#171717]">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Add new dishes, update prices, change availability, and curate featured meals.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#C62828] hover:bg-[#b02222] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-hidden focus:border-[#C62828] cursor-pointer"
          >
            <option value="all">All Categories ({menuItems.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Dish</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No dishes found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Dish Preview & Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                          <ImageWithFallback
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-stone-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-stone-400 line-clamp-1">{item.description}</p>
                          {item.badge && (
                            <span className="inline-block mt-0.5 text-[10px] bg-red-100 text-[#C62828] font-bold px-1.5 py-0.2 rounded">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-700 font-medium">
                      {item.category_name ||
                        categories.find((c) => c.id === item.category_id)?.name ||
                        'Dish'}
                    </td>

                    {/* Price in GH₵ */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-stone-900">
                      GH₵{item.price.toFixed(2)}
                    </td>

                    {/* Available Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          item.is_available
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                        title="Click to toggle availability"
                      >
                        {item.is_available ? 'Available' : 'Sold Out'}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleItemFeatured(item.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          item.is_featured
                            ? 'text-[#F57C00] bg-orange-50 hover:bg-orange-100'
                            : 'text-stone-300 hover:text-stone-500'
                        }`}
                        title="Toggle homepage featured status"
                      >
                        <Star className={`w-4 h-4 ${item.is_featured ? 'fill-[#F57C00]' : ''}`} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-stone-500 hover:text-[#C62828] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {deleteConfirmId === item.id ? (
                        <div className="inline-flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                          <span className="text-[10px] text-red-700 font-bold px-1">Delete?</span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                            title="Confirm delete"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-stone-200 text-stone-700 p-1 rounded hover:bg-stone-300"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h2 className="font-['Poppins'] font-bold text-xl text-[#171717]">
                {editingItem ? 'Edit Dish Details' : 'Add New Ghanaian Meal'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jales Special Jollof"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Price (GH₵) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45.00"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Delicious spices, served with chicken and shito..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
              </div>

              {/* Image Preview & Upload Field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Food Photography (URL or File Upload)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://... or choose file below"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                  />

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#F57C00]" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    {formData.image_url && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-stone-200">
                          <img
                            src={formData.image_url}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-green-600 font-semibold">
                          Preview ready
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Badge / Label (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Popular, Chef's Special"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                  />
                </div>
              </div>

              {/* Availability & Featured Checkboxes */}
              <div className="pt-2 flex items-center gap-6 text-xs text-stone-800">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="rounded text-[#C62828] focus:ring-0"
                  />
                  <span>Currently Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded text-[#C62828] focus:ring-0"
                  />
                  <span>Feature on Home Page</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C62828] hover:bg-[#b02222] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

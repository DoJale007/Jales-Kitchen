import React, { useState, useMemo } from 'react';
import { Search, Utensils, Sparkles, Filter, X } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { FoodCard } from '../components/food/FoodCard';

export const MenuPage: React.FC = () => {
  const { menuItems, categories } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active categories list
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.is_active);
  }, [categories]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category_id === selectedCategory ||
        item.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());

      // Search filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category_name?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 sm:space-y-12 pb-20">
      {/* 1. PAGE HEADER */}
      <section className="bg-gradient-to-b from-orange-50/70 to-transparent pt-10 sm:pt-14 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-[#C62828] text-xs font-bold uppercase tracking-wider mb-3">
            <Utensils className="w-3.5 h-3.5" />
            <span>AUTHENTIC GHANAIAN DISHES</span>
          </div>
          <h1 className="font-['Poppins'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171717] tracking-tight">
            Our Menu
          </h1>
          <p className="text-base sm:text-lg text-stone-600 mt-3 leading-relaxed">
            Explore the Ghanaian meals you love, prepared to make every bite enjoyable.
          </p>
        </div>
      </section>

      {/* 2. SEARCH AND CATEGORY FILTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-5">
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Jollof, Waakye, Banku, Tilapia, Sobolo)..."
              className="w-full pl-12 pr-10 py-3 text-sm sm:text-base bg-white border border-stone-200 rounded-full shadow-xs focus:outline-hidden focus:border-[#C62828] focus:ring-2 focus:ring-red-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#C62828] text-white shadow-md'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              All Meals ({menuItems.length})
            </button>

            {activeCategories.map((cat) => {
              const count = menuItems.filter((i) => i.category_id === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C62828] text-white shadow-md'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat.name} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. MENU ITEMS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results summary if searching */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between text-xs sm:text-sm text-stone-500">
            <span>
              Showing results for <strong className="text-stone-800">"{searchQuery}"</strong>
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#C62828] hover:underline font-semibold cursor-pointer"
            >
              Reset search
            </button>
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#C62828] flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="font-['Poppins'] font-bold text-lg text-[#171717] mb-2">
              No Meals Match Your Search
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-6 leading-relaxed">
              We couldn't find any dishes matching your keywords or filter. Try searching for something else or view all meals.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="bg-[#C62828] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#b02222] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* 4. ORDERING INFORMATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-['Poppins'] font-bold text-lg text-[#171717]">
              Want a customized portion or catering for an office gathering?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              We prepare special bulk orders for events, families, and offices across Accra.
            </p>
          </div>
          <a
            href="https://wa.me/233571570126?text=Hello%20Jales%20Kitchen%2C%20I%20would%20like%20to%20enquire%20about%20a%20special%20order%20or%20catering."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full flex items-center gap-2 shadow-xs transition-colors"
          >
            <span>Chat Catering on WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};

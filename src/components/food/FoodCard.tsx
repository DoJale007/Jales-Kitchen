import React from 'react';
import { MenuItem } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { useRestaurant } from '../../context/RestaurantContext';
import { Plus, Check, ShoppingBag } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { openOrderModal, addToCart, cart } = useRestaurant();
  const inCart = cart.find((i) => i.menuItem.id === item.id);

  const handleOrderDirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    openOrderModal(item);
  };

  const handleAddOne = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item, 1);
  };

  return (
    <div
      onClick={() => openOrderModal(item)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Food Image Container */}
      <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-stone-100">
        <ImageWithFallback
          src={item.image_url}
          alt={item.name}
          fallbackText={item.name}
          width={480}
          quality={72}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Badge / Availability */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!item.is_available ? (
            <span className="bg-stone-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs tracking-wider uppercase">
              Sold Out
            </span>
          ) : item.badge ? (
            <span className="bg-[#C62828] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md tracking-wide">
              {item.badge}
            </span>
          ) : item.is_featured ? (
            <span className="bg-[#F57C00] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md tracking-wide">
              Featured
            </span>
          ) : null}
        </div>

        {/* Price Tag Floating over bottom of image */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-stone-100">
          <span className="text-xs font-semibold text-stone-500">GH₵</span>
          <span className="text-base font-bold text-[#171717] ml-0.5">
            {Number(item.price).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-['Poppins'] font-bold text-base sm:text-lg text-[#171717] group-hover:text-[#C62828] transition-colors line-clamp-1">
              {item.name}
            </h3>
          </div>
          <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3 sm:mb-4">
            {item.description}
          </p>
        </div>

        {/* Action Controls - Mobile Friendly with 44px+ hit targets */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Quick Add Button */}
          <button
            type="button"
            onClick={handleAddOne}
            disabled={!item.is_available}
            className={`min-h-[44px] px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none active:scale-95 ${
              inCart
                ? 'bg-orange-50 text-[#F57C00] border border-orange-200'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            } ${!item.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Add to current order"
          >
            {inCart ? (
              <>
                <Check className="w-4 h-4" />
                <span>{inCart.quantity} in order</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>

          {/* Primary Order Now Button */}
          <button
            type="button"
            onClick={handleOrderDirect}
            disabled={!item.is_available}
            className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer select-none ${
              item.is_available
                ? 'bg-[#C62828] hover:bg-[#b02222] text-white active:scale-95'
                : 'bg-stone-200 text-stone-500 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{item.is_available ? 'Order Now' : 'Unavailable'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

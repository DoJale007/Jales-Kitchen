import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const CartFloatingButton: React.FC = () => {
  const { cartCount, cartTotal, openOrderModal } = useRestaurant();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-8 z-30 animate-in slide-in-from-bottom duration-300">
      <button
        onClick={() => openOrderModal()}
        className="group bg-[#C62828] hover:bg-[#b02222] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="View order tray"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-[#F57C00] text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center border border-white">
            {cartCount}
          </span>
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-200">
            View Order
          </span>
          <span className="text-sm font-bold leading-tight">
            GH₵{cartTotal.toFixed(2)}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-orange-200 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

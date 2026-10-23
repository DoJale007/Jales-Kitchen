import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const CartFloatingButton: React.FC = () => {
  const { cartCount, cartTotal, openOrderModal } = useRestaurant();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-8 sm:bottom-6 z-40 animate-in slide-in-from-bottom duration-300">
      <button
        onClick={() => openOrderModal()}
        className="group w-full sm:w-auto bg-gradient-to-r from-[#C62828] to-[#b02222] hover:from-[#b02222] hover:to-[#961c1c] text-white px-5 py-3.5 sm:py-3.5 sm:px-6 rounded-2xl sm:rounded-full shadow-2xl flex items-center justify-between sm:justify-start sm:gap-4 border-2 border-white/90 backdrop-blur-md transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer"
        aria-label="View order tray and complete order"
      >
        {/* Left: Icon & Count */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-[#F57C00] text-white font-extrabold text-[11px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {cartCount}
            </span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-200 leading-none">
              {cartCount === 1 ? '1 Dish Selected' : `${cartCount} Dishes Selected`}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white leading-tight mt-0.5">
              GH₵{cartTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Right: Checkout CTA */}
        <div className="flex items-center gap-2 pl-2">
          <span className="text-xs sm:text-sm font-bold text-white bg-white/15 px-3 py-1.5 rounded-xl flex items-center gap-1.5 group-hover:bg-white/25 transition-colors">
            <span>View & Order</span>
            <ArrowRight className="w-4 h-4 text-orange-200 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </button>
    </div>
  );
};

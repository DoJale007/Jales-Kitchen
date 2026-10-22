import React from 'react';
import { MenuItem } from '../../types';
import { FoodCard } from './FoodCard';
import { Utensils } from 'lucide-react';

interface FoodGridProps {
  items: MenuItem[];
  emptyMessage?: string;
}

export const FoodGrid: React.FC<FoodGridProps> = ({
  items,
  emptyMessage = 'No meals found matching your criteria.',
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-xs max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#C62828] flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-8 h-8" />
        </div>
        <h3 className="font-['Poppins'] font-bold text-lg text-[#171717] mb-1">
          No Meals Found
        </h3>
        <p className="text-stone-500 text-sm max-w-sm mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {items.map((item) => (
        <FoodCard key={item.id} item={item} />
      ))}
    </div>
  );
};

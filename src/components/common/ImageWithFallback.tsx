import React, { useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  // If error occurs, render a warm, styled food illustration placeholder
  if (error || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-[#FFF8F2] via-[#FFE8D6] to-[#FED7AA] flex flex-col items-center justify-center text-[#C62828] relative overflow-hidden ${className}`}
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full bg-white/80 shadow-xs flex items-center justify-center mb-2">
          <UtensilsCrossed className="w-6 h-6 text-[#C62828]" />
        </div>
        <span className="text-xs font-semibold px-3 text-center text-[#171717] line-clamp-1">
          {fallbackText || alt}
        </span>
        <span className="text-[10px] tracking-wider uppercase text-[#F57C00] font-medium mt-0.5">
          Jales Kitchen
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
          <UtensilsCrossed className="w-6 h-6 text-stone-300" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { getOptimizedImageUrl, getResponsiveSrcSet } from '../../utils/imageUrl';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  priority?: boolean;
  width?: number;
  quality?: number;
  sizes?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
  priority = false,
  width,
  quality,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Derive optimized URL and srcSet
  const optimizedSrc = getOptimizedImageUrl(src, {
    width: width || (priority ? 900 : 500),
    quality: quality || (priority ? 78 : 72),
  });

  const srcSet = getResponsiveSrcSet(src);

  useEffect(() => {
    setError(false);
    // Check if the image is already cached in memory
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  // If error occurs or empty src, render warm Ghanaian food themed placeholder
  if (error || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-[#FFF8F2] via-[#FFE8D6] to-[#FED7AA] flex flex-col items-center justify-center text-[#C62828] relative overflow-hidden select-none ${className}`}
        aria-label={alt}
      >
        <div className="w-11 h-11 rounded-full bg-white/80 shadow-xs flex items-center justify-center mb-1.5">
          <UtensilsCrossed className="w-5 h-5 text-[#C62828]" />
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
      {/* Lightweight skeleton shimmer while image arrives */}
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200/70 to-stone-100 animate-pulse flex items-center justify-center"
        >
          <UtensilsCrossed className="w-6 h-6 text-stone-300" />
        </div>
      )}

      <img
        ref={imgRef}
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        // @ts-expect-error fetchpriority is standard HTML5 attribute
        fetchpriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

/**
 * Image URL Optimization Utility
 * Automatically optimizes image URLs (especially Unsplash) for ultra-fast,
 * lightweight loading on mobile and desktop devices.
 */

interface OptimizeOptions {
  width?: number;
  quality?: number;
  fit?: 'crop' | 'max' | 'clamp' | 'scale';
}

/**
 * Transforms an image URL to include modern formatting, resolution limits,
 * and high compression (WebP/AVIF auto-negotiation) for snappy rendering.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: OptimizeOptions = {}
): string {
  if (!url || typeof url !== 'string') return '';

  const { width = 500, quality = 75, fit = 'crop' } = options;

  // If already a base64 data URI, SVG, or blob, return untouched
  if (url.startsWith('data:') || url.startsWith('blob:') || url.endsWith('.svg')) {
    return url;
  }

  // Handle Unsplash Images
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', fit);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      return urlObj.toString();
    } catch {
      // If URL parsing fails, fallback to simple string replacement
      const base = url.split('?')[0];
      return `${base}?auto=format&fit=${fit}&w=${width}&q=${quality}`;
    }
  }

  return url;
}

/**
 * Generates a responsive srcset string for Unsplash images so mobile devices
 * download smaller, byte-sized assets according to viewport DPR and width.
 */
export function getResponsiveSrcSet(
  url: string | undefined | null,
  widths: number[] = [360, 540, 720, 960]
): string | undefined {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) {
    return undefined;
  }

  return widths
    .map((w) => {
      // Use slightly higher compression for smaller viewports to maximize mobile speed
      const q = w <= 400 ? 70 : 75;
      return `${getOptimizedImageUrl(url, { width: w, quality: q })} ${w}w`;
    })
    .join(', ');
}

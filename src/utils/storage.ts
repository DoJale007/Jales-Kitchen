/**
 * Safe LocalStorage wrapper to prevent QuotaExceededError crashes
 * and gracefully handle browser storage limits.
 */

// Cleanup oversized base64 caches on startup to reclaim browser storage quota
const pruneOversizedItems = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('jales_kitchen_')) continue;
      const raw = localStorage.getItem(key);
      if (raw && raw.length > 500000) {
        // If an entry is larger than 500KB (e.g., contains raw uncompressed image uploads),
        // try cleaning base64 data URLs out of it to free space
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const pruned = parsed.map((item: any) => {
              if (
                item &&
                typeof item === 'object' &&
                typeof item.image_url === 'string' &&
                item.image_url.startsWith('data:image/') &&
                item.image_url.length > 50000
              ) {
                return { ...item, image_url: '' };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(pruned));
          } else if (parsed && typeof parsed === 'object') {
            if (
              typeof parsed.hero_image === 'string' &&
              parsed.hero_image.startsWith('data:image/') &&
              parsed.hero_image.length > 100000
            ) {
              parsed.hero_image = '';
              localStorage.setItem(key, JSON.stringify(parsed));
            }
          }
        } catch {
          // If unparseable or cannot be pruned, safely remove bloated key
          localStorage.removeItem(key);
        }
      }
    }
  } catch (e) {
    console.warn('[safeStorage] Automatic cache pruning skipped:', e);
  }
};

// Run pruning immediately on load
if (typeof window !== 'undefined') {
  pruneOversizedItems();
}

export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return fallback;
      }
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`[safeStorage] Failed to read "${key}" from localStorage:`, e);
      return fallback;
    }
  },

  setItem(key: string, value: any): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (err: any) {
      console.warn(`[safeStorage] Failed to write "${key}" to localStorage:`, err);

      const isQuotaError =
        err?.name === 'QuotaExceededError' ||
        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err?.code === 22 ||
        err?.code === 1014;

      if (isQuotaError) {
        try {
          // Attempt 1: Clear non-critical stored collections to free quota
          localStorage.removeItem('jales_kitchen_messages');
          localStorage.removeItem('jales_kitchen_cart');

          // Attempt 2: If saving an array of items (like menuItems), strip heavy base64 strings
          if (Array.isArray(value)) {
            const stripped = value.map((item: any) => {
              if (
                item &&
                typeof item === 'object' &&
                typeof item.image_url === 'string' &&
                item.image_url.startsWith('data:image/') &&
                item.image_url.length > 20000
              ) {
                // Remove large base64 image from local cache to prevent quota crash
                return { ...item, image_url: '' };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(stripped));
            return true;
          }

          // Attempt 3: If saving settings with a heavy base64 hero_image
          if (value && typeof value === 'object') {
            const strippedObj = { ...value };
            if (
              typeof strippedObj.hero_image === 'string' &&
              strippedObj.hero_image.startsWith('data:image/') &&
              strippedObj.hero_image.length > 20000
            ) {
              strippedObj.hero_image = '';
            }
            localStorage.setItem(key, JSON.stringify(strippedObj));
            return true;
          }
        } catch (retryError) {
          console.warn(`[safeStorage] Quota recovery failed for "${key}":`, retryError);
        }
      }

      return false;
    }
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[safeStorage] Failed to remove "${key}":`, e);
    }
  },
};

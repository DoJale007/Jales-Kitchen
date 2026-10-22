/**
 * Compresses an image file before storing in state and database.
 * Resizes large photos to optimal web dimensions (default 1600px max)
 * and converts to high-quality JPEG (0.85) to prevent exceeding browser
 * localStorage and database JSON quotas.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const rawResult = event.target?.result as string;
      if (!rawResult) {
        reject(new Error('Empty image payload'));
        return;
      }

      // If SVG, return as-is
      if (file.type === 'image/svg+xml') {
        resolve(rawResult);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawResult); // Fallback to raw if decoding fails
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawResult);
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(rawResult);
        }
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  });
};


/**
 * Helper to promisify canvas.toBlob
 */
function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), type, quality);
    });
}

/**
 * Compresses an image file by converting it to WebP format (or JPEG if WebP fails) and resizing it.
 * 
 * @param file The original File object
 * @param quality Quality of the image (0.0 to 1.0), default 0.8
 * @param maxWidth Maximum width of the image, default 1920px
 * @returns A Promise that resolves to a new File object
 */
export async function compressImage(
    file: File,
    quality: number = 0.8,
    maxWidth: number = 1920
): Promise<File> {
    console.log(`🖼️ Starting compression for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    // If it's not an image, return original
    if (!file.type.startsWith('image/')) {
        console.warn('⚠️ File is not an image, skipping compression.');
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = async () => {
            console.log('🖼️ Image loaded into object, dimensions:', img.width, 'x', img.height);
            URL.revokeObjectURL(url);

            let width = img.width;
            let height = img.height;

            // Resize if larger than maxWidth
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
                console.log(`🖼️ Resizing to: ${width}x${height}`);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('❌ Could not get canvas context');
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height);

            try {
                // 1. Try WebP
                let blob = await canvasToBlob(canvas, 'image/webp', quality);
                let finalType = 'image/webp';
                let extension = '.webp';

                // 2. Check if browser fell back to PNG (Safari issue)
                if (blob && blob.type === 'image/png') {
                    console.warn('⚠️ Browser does not support WebP encoding (returned PNG), falling back to JPEG.');
                    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
                    finalType = 'image/jpeg';
                    extension = '.jpg';
                }

                if (!blob) {
                    console.error('❌ Canvas toBlob failed');
                    reject(new Error('Could not compress image'));
                    return;
                }

                console.log(`✅ Compression successful. Type: ${finalType}, New size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

                // Create new File object
                const newFileName = file.name.replace(/\.[^/.]+$/, "") + extension;
                const newFile = new File([blob], newFileName, {
                    type: finalType,
                    lastModified: Date.now(),
                });

                resolve(newFile);

            } catch (err) {
                console.error('❌ Compression error:', err);
                reject(err);
            }
        };

        img.onerror = (err) => {
            console.error('❌ Image load error:', err);
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

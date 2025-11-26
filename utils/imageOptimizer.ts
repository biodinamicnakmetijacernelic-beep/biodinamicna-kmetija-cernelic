
/**
 * Compresses an image file by converting it to WebP format and resizing it if necessary.
 * 
 * @param file The original File object
 * @param quality Quality of the WebP image (0.0 to 1.0), default 0.8
 * @param maxWidth Maximum width of the image, default 1920px
 * @returns A Promise that resolves to a new File object in WebP format
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

        img.onload = () => {
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

            // Convert to WebP blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        console.error('❌ Canvas toBlob failed');
                        reject(new Error('Could not compress image'));
                        return;
                    }

                    console.log(`✅ Compression successful. New size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

                    // Create new File object
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    const newFile = new File([blob], newFileName, {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });

                    resolve(newFile);
                },
                'image/webp',
                quality
            );
        };

        img.onerror = (err) => {
            console.error('❌ Image load error:', err);
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

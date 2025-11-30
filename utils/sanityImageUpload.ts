import { getWriteClient } from '../sanityClient';

/**
 * Upload an image file to Sanity
 * @param file - The image file to upload
 * @returns Promise<string> - The Sanity image URL
 */
export async function uploadImageToSanity(file: File): Promise<string> {
    try {
        // Get write client with fresh token from localStorage
        const writeClient = getWriteClient();

        // Upload the image asset to Sanity
        const imageAsset = await writeClient.assets.upload('image', file, {
            filename: file.name,
        });

        // Return the URL of the uploaded image
        return imageAsset.url;
    } catch (error) {
        console.error('Error uploading image to Sanity:', error);
        throw new Error('Failed to upload image');
    }
}

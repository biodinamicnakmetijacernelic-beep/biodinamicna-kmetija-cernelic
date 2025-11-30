import { client } from '../sanityClient';

/**
 * Upload an image file to Sanity
 * @param file - The image file to upload
 * @returns Promise<string> - The Sanity image URL
 */
export async function uploadImageToSanity(file: File): Promise<string> {
    try {
        // Upload the image asset to Sanity
        const imageAsset = await client.assets.upload('image', file, {
            filename: file.name,
        });

        // Return the URL of the uploaded image
        return imageAsset.url;
    } catch (error) {
        console.error('Error uploading image to Sanity:', error);
        throw new Error('Failed to upload image');
    }
}

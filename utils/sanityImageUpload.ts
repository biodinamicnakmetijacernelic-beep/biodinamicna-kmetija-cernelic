import { getWriteClient } from '../sanityClient';

/**
 * Upload an image file to Sanity with explicit token
 * @param file - The image file to upload
 * @param token - The Sanity API token
 * @returns Promise<string> - The Sanity image URL
 */
export async function uploadImageToSanityWithToken(file: File, token: string): Promise<string> {
    try {
        console.log('[uploadImageToSanityWithToken] Starting upload for file:', file.name);

        const { createClient } = await import('@sanity/client');
        const { sanityConfig } = await import('../sanityConfig');

        const authClient = createClient({
            ...sanityConfig,
            token: token,
            ignoreBrowserTokenWarning: true
        });

        console.log('[uploadImageToSanityWithToken] Uploading to Sanity...');

        // Upload the image asset to Sanity
        const imageAsset = await authClient.assets.upload('image', file, {
            filename: file.name,
        });

        console.log('[uploadImageToSanityWithToken] Upload successful! URL:', imageAsset.url);

        // Return the URL of the uploaded image
        return imageAsset.url;
    } catch (error: any) {
        console.error('[uploadImageToSanityWithToken] Upload failed:', error);
        console.error('[uploadImageToSanityWithToken] Error details:', {
            message: error.message,
            response: error.response,
            statusCode: error.statusCode
        });

        // Provide user-friendly error message
        if (error.statusCode === 401) {
            alert('Napaka: API ključ nima pravic za nalaganje slik. Preverite admin token.');
        } else {
            alert(`Napaka pri nalaganju slike: ${error.message}`);
        }

        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

/**
 * Upload an image file to Sanity (checks localStorage for token)
 * @param file - The image file to upload
 * @returns Promise<string> - The Sanity image URL
 */
export async function uploadImageToSanity(file: File): Promise<string> {
    try {
        console.log('[uploadImageToSanity] Starting upload for file:', file.name);

        // Get write client with fresh token from localStorage
        const writeClient = getWriteClient();

        // Check if we have a token - try multiple sources
        let token = typeof window !== 'undefined' ? localStorage.getItem('sanityToken') : null;

        // If not found, try alternative keys that might be used
        if (!token) {
            token = typeof window !== 'undefined' ? (
                localStorage.getItem('sanityToken') ||
                localStorage.getItem('sanity_token') ||
                localStorage.getItem('SANITY_TOKEN')
            ) : null;
        }

        if (!token) {
            const error = 'No Sanity token found. Please log in to admin panel first.';
            console.error('[uploadImageToSanity]', error);
            console.log('[uploadImageToSanity] Available localStorage keys:', Object.keys(localStorage));
            alert('Napaka: Niste prijavljeni kot admin. Prosim, najprej se prijavite v admin panel.');
            throw new Error(error);
        }

        console.log('[uploadImageToSanity] Token found, uploading to Sanity...');

        // Upload the image asset to Sanity
        const imageAsset = await writeClient.assets.upload('image', file, {
            filename: file.name,
        });

        console.log('[uploadImageToSanity] Upload successful! URL:', imageAsset.url);

        // Return the URL of the uploaded image
        return imageAsset.url;
    } catch (error: any) {
        console.error('[uploadImageToSanity] Upload failed:', error);
        console.error('[uploadImageToSanity] Error details:', {
            message: error.message,
            response: error.response,
            statusCode: error.statusCode
        });

        // Provide user-friendly error message
        if (error.statusCode === 401) {
            alert('Napaka: Nimate pravic za nalaganje slik. Preverite admin token.');
        } else if (error.message && error.message.includes('Insufficient permissions')) {
            alert('Napaka: API ključ nima dovoljenja za ustvarjanje slik. Pojdite v Sanity.io -> API -> Tokens in posodobite pravice ključa.');
        } else {
            alert(`Napaka pri nalaganju slike: ${error.message}`);
        }

        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

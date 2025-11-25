
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { sanityConfig } from './sanityConfig';
import { GalleryItem, AwardItem, PreOrderItem, NewsItem, VideoGalleryItem, Order } from './types';

// Initialize the read-only client (for public display)
export const client = createClient({
  ...sanityConfig,
  ignoreBrowserTokenWarning: true
});

// Helper to generate image URLs
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Fetch Gallery Images
export async function fetchGalleryImages(): Promise<GalleryItem[]> {
  try {
    const query = `*[_type == "galleryImage"] | order(date desc) {
      _id,
      title,
      "src": coalesce(image.asset->url, null),
      category,
      date,
      description
    }`;

    const data = await client.fetch(query);

    if (!data || !Array.isArray(data)) return [];

    // Filter out images that are likely logos based on title
    const filteredData = data.filter((item: any) => {
      const titleLower = (item.title || '').toLowerCase();
      return !titleLower.includes('logo');
    });

    return filteredData.map((item: any) => ({
      id: item._id,
      src: item.src,
      alt: item.title || 'Utrinek',
      category: item.category || 'Galerija',
      date: item.date,
      description: item.description
    }));

  } catch (error) {
    console.warn("Sanity (Galerija): Povezava ni uspela. Preverite CORS nastavitve v Sanity.io.");
    return [];
  }
}

// Fetch Awards
export async function fetchAwards(): Promise<AwardItem[]> {
  try {
    const query = `*[_type == "award"] | order(year desc) {
      _id,
      year,
      title,
      issuer,
      description,
      highlight,
      "image": coalesce(image.asset->url, null)
    }`;

    const data = await client.fetch(query);

    if (!data || !Array.isArray(data)) return [];

    return data.map((item: any) => ({
      id: item._id,
      year: item.year,
      title: item.title,
      issuer: item.issuer,
      description: item.description,
      highlight: item.highlight,
      image: item.image
    }));
  } catch (error) {
    console.warn("Sanity (Priznanja): Povezava ni uspela. Uporabljam statične podatke.");
    return [];
  }
}

// Fetch Products (Live Inventory)
export async function fetchProducts(): Promise<PreOrderItem[]> {
  try {
    const query = `*[_type == "product"] | order(name asc) {
      _id,
      name,
      category,
      price,
      unit,
      status,
      "image": coalesce(image.asset->url, null)
    }`;

    const data = await client.fetch(query);

    if (!data || !Array.isArray(data)) return [];

    return data.map((item: any) => ({
      id: item._id,
      name: item.name || 'Neznan izdelek',
      category: item.category || 'fresh',
      price: item.price || 0,
      unit: item.unit || 'kos',
      status: item.status || 'available',
      image: item.image || 'https://images.unsplash.com/photo-1595855709920-4538602b186c?auto=format&fit=crop&q=80&w=400' // Fallback image
    }));
  } catch (error) {
    // Throwing error so Admin UI can detect connection issues instead of showing empty list silently
    console.error("Sanity (Izdelki): Povezava ni uspela ali shema ne obstaja.", error);
    throw error;
  }
}

// Fetch News
export async function fetchNews(): Promise<NewsItem[]> {
  try {
    // We fetch 'body' which can be string (legacy) or array (Portable Text)
    const query = `*[_type == "post"] | order(publishedAt desc)[0...3] {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      "image": coalesce(mainImage.asset->url, null),
      body
    }`;

    const data = await client.fetch(query);

    if (!data || !Array.isArray(data)) return [];

    return data.map((item: any) => ({
      id: item._id,
      title: item.title,
      slug: item.slug,
      publishedAt: item.publishedAt,
      image: item.image,
      body: item.body
    }));
  } catch (error) {
    console.warn("Sanity (Novice): Povezava ni uspela.", error);
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  try {
    const query = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      "image": coalesce(mainImage.asset->url, null),
      body
    }`;

    const data = await client.fetch(query);

    if (!data || !Array.isArray(data)) return [];

    return data.map((item: any) => ({
      id: item._id,
      title: item.title,
      slug: item.slug,
      publishedAt: item.publishedAt,
      image: item.image,
      body: item.body
    }));
  } catch (error) {
    console.warn("Sanity (Vse Novice): Povezava ni uspela.", error);
    return [];
  }
}

export async function fetchNewsBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const query = `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      "image": coalesce(mainImage.asset->url, null),
      body
    }`;

    const item = await client.fetch(query, { slug });

    if (!item) return null;

    return {
      id: item._id,
      title: item.title,
      slug: item.slug,
      publishedAt: item.publishedAt,
      image: item.image,
      body: item.body
    };
  } catch (error) {
    console.warn("Sanity (Posamezna Novica): Povezava ni uspela.", error);
    return null;
  }
}

/**
 * UPLOAD FUNCTIONALITY (Gallery)
 */
export async function uploadImageToSanity(
  file: File,
  metadata: { title: string; description: string; date: string },
  token: string
) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    const imageAsset = await authClient.assets.upload('image', file, {
      filename: file.name
    });

    const doc = {
      _type: 'galleryImage',
      title: metadata.title || 'Utrinek s kmetije',
      description: metadata.description,
      date: metadata.date,
      category: 'Utrinek',
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id
        }
      }
    };

    const createdDoc = await authClient.create(doc);
    return createdDoc;

  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

export async function updateGalleryImage(
  id: string,
  data: { title: string; description?: string },
  token: string
) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    await authClient.patch(id).set({
      title: data.title,
      description: data.description
    }).commit();
    return true;
  } catch (error) {
    console.error("Update gallery image failed:", error);
    throw error;
  }
}

export async function deleteGalleryImage(id: string, token: string) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    await authClient.delete(id);
    return true;
  } catch (error) {
    console.error("Delete gallery image failed:", error);
    throw error;
  }
}

/**
 * NEWS POSTING
 */
export async function createNewsPost(
  postData: { title: string; body: any[]; date: string },
  imageFile: File | null,
  token: string
) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    let imageAssetId = null;

    if (imageFile) {
      const asset = await authClient.assets.upload('image', imageFile, { filename: imageFile.name });
      imageAssetId = asset._id;
    }

    const doc = {
      _type: 'post',
      title: postData.title,
      slug: { _type: 'slug', current: postData.title.toLowerCase().replace(/\s+/g, '-').slice(0, 200) },
      publishedAt: postData.date,
      body: postData.body, // Now accepting array of blocks
      mainImage: imageAssetId ? {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAssetId }
      } : undefined
    };

    const createdDoc = await authClient.create(doc);
    return createdDoc;
  } catch (error) {
    console.error("Create news failed:", error);
    throw error;
  }
}

export async function updateNewsPost(
  id: string,
  postData: { title: string; body: any[]; date: string },
  imageFile: File | null,
  token: string
) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    let patch = authClient.patch(id).set({
      title: postData.title,
      publishedAt: postData.date,
      body: postData.body,
      slug: { _type: 'slug', current: postData.title.toLowerCase().replace(/\s+/g, '-').slice(0, 200) }
    });

    if (imageFile) {
      const asset = await authClient.assets.upload('image', imageFile, { filename: imageFile.name });
      patch = patch.set({
        mainImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id }
        }
      });
    }

    await patch.commit();
    return true;
  } catch (error) {
    console.error("Update news failed:", error);
    throw error;
  }
}

export async function deleteNewsPost(id: string, token: string) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    await authClient.delete(id);
    return true;
  } catch (error) {
    console.error("Delete news failed:", error);
    throw error;
  }
}

/**
 * PRODUCT CRUD OPERATIONS
 */

// Update Status Only
export async function updateProductStatus(id: string, status: string, token: string) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    await authClient
      .patch(id)
      .set({ status: status })
      .commit();
    return true;
  } catch (error) {
    console.error("Update status failed:", error);
    throw error;
  }
}

// Create New Product
export async function createProduct(
  productData: { name: string; price: number; unit: string; category: string; status: string },
  imageFile: File | null,
  token: string
) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    let imageAssetId = null;

    // Upload image if provided
    if (imageFile) {
      const asset = await authClient.assets.upload('image', imageFile, { filename: imageFile.name });
      imageAssetId = asset._id;
    }

    const doc = {
      _type: 'product',
      name: productData.name,
      price: productData.price,
      unit: productData.unit,
      category: productData.category,
      status: productData.status,
      image: imageAssetId ? {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAssetId }
      } : undefined
    };

    const createdDoc = await authClient.create(doc);
    return createdDoc;
  } catch (error) {
    console.error("Create product failed:", error);
    throw error;
  }
}

// Update Existing Product
export async function updateProduct(
  id: string,
  productData: { name: string; price: number; unit: string; category: string },
  imageFile: File | null,
  token: string
) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    let patch = authClient.patch(id).set({
      name: productData.name,
      price: productData.price,
      unit: productData.unit,
      category: productData.category
    });

    if (imageFile) {
      const asset = await authClient.assets.upload('image', imageFile, { filename: imageFile.name });
      patch = patch.set({
        image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id }
        }
      });
    }

    await patch.commit();
    return true;
  } catch (error) {
    console.error("Update product failed:", error);
    throw error;
  }
}

// Delete Product
export async function deleteProduct(id: string, token: string) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    await authClient.delete(id);
    return true;
  } catch (error) {
    console.error("Delete product failed:", error);
    throw error;
  }
}

/**
 * VIDEO GALLERY CRUD OPERATIONS
 */

// Fetch Video Gallery
export async function fetchVideoGallery(): Promise<VideoGalleryItem[]> {
  try {
    const query = `*[_type == "videoGalleryItem"] | order(_createdAt desc) {
      _id,
      title,
      videoId,
      category
    }`;

    const data = await client.fetch(query);

    if (!data || !Array.isArray(data)) return [];

    return data.map((item: any) => ({
      id: item._id,
      title: item.title,
      videoId: item.videoId,
      category: item.category
    }));
  } catch (error) {
    console.warn("Sanity (Video Gallery): Povezava ni uspela.", error);
    return [];
  }
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(input: string): string {
  // If it's already just an ID (11 characters, alphanumeric and dashes/underscores)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
    return input.trim();
  }

  // Try to extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If no pattern matched, return the input as-is (will fail validation)
  return input.trim();
}

// Create Video
export async function createVideo(
  videoData: { title: string; videoId: string; category?: string },
  token: string
) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    const extractedId = extractYouTubeId(videoData.videoId);

    const doc = {
      _type: 'videoGalleryItem',
      title: videoData.title,
      videoId: extractedId,
      category: videoData.category || ''
    };

    const createdDoc = await authClient.create(doc);
    return createdDoc;
  } catch (error) {
    console.error("Create video failed:", error);
    throw error;
  }
}

// Update Video
export async function updateVideo(
  id: string,
  videoData: { title: string; videoId: string; category?: string },
  token: string
) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    const extractedId = extractYouTubeId(videoData.videoId);

    await authClient
      .patch(id)
      .set({
        title: videoData.title,
        videoId: extractedId,
        category: videoData.category || ''
      })
      .commit();
    return true;
  } catch (error) {
    console.error("Update video failed:", error);
    throw error;
  }
}

// Delete Video
export async function deleteVideo(id: string, token: string) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    await authClient.delete(id);
    return true;
  } catch (error) {
    console.error("Delete video failed:", error);
    throw error;
  }
}

// --- ORDERS ---

export async function submitOrder(orderData: any) {
  // Note: For a public form to write to Sanity, you typically need a token with write permissions.
  // We will assume a token is available or that the dataset has public create permissions.

  const token = localStorage.getItem('sanity_token') || import.meta.env.VITE_SANITY_TOKEN;

  const writeClient = createClient({
    ...sanityConfig,
    token: token || undefined, // Use token if available
    ignoreBrowserTokenWarning: true
  });

  try {
    const doc = {
      _type: 'order',
      orderNumber: `ORD-${Date.now()}`,
      customerName: orderData.customer.name,
      customerEmail: orderData.customer.email,
      customerPhone: orderData.customer.phone,
      items: orderData.items,
      totalAmount: orderData.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      note: orderData.note
    };

    const result = await writeClient.create(doc);
    return result;
  } catch (error) {
    console.error("Error submitting order:", error);
    throw error;
  }
}

export async function fetchOrders(token: string): Promise<Order[]> {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    const query = `*[_type == "order"] | order(createdAt desc) {
      _id,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      status,
      createdAt,
      note
    }`;

    console.log("Executing Sanity query for orders:", query);
    const data = await authClient.fetch(query);
    console.log("Raw Sanity response for orders:", data);

    const mappedData = data.map((item: any) => ({
      id: item._id,
      orderNumber: item.orderNumber,
      customer: {
        name: item.customerName,
        email: item.customerEmail,
        phone: item.customerPhone
      },
      items: item.items || [],
      total: item.totalAmount,
      status: item.status,
      createdAt: item.createdAt,
      note: item.note
    }));

    console.log("Mapped orders data:", mappedData);
    return mappedData;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string, token: string) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    await authClient.patch(orderId).set({ status }).commit();
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

export async function deleteOrder(orderId: string, token: string) {
  const authClient = createClient({
    ...sanityConfig,
    token: token,
    ignoreBrowserTokenWarning: true
  });

  try {
    await authClient.delete(orderId);
    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
}


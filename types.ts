
export interface OpeningHours {
  day: string;
  time: string;
  location: string;
  address: string;
  season: string;
  note?: string;
  iconType: 'sun' | 'market' | 'home';
  mapsLink: string;
  phoneNumber?: string;
  deliveryOption?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: 'sprout' | 'recycle' | 'leaf' | 'moon';
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: string;
  date?: string;        // Added date field
  description?: string; // Added description field
}

export interface AwardItem {
  id: string;
  year: string;
  title: string;
  issuer: string;
  description: string;
  highlight: string;
  image: string;
}

export type ProductStatus = 'available' | 'sold-out' | 'coming-soon';

export interface PreOrderItem {
  id: string;
  name: string;
  category: 'fresh' | 'dry';
  price: number;
  unit: string;
  image: string;
  status: ProductStatus;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  image: string;
  body: any[]; // Changed from string to any[] to support Portable Text blocks
}

export interface VideoGalleryItem {
  id: string;
  videoId: string;  // YouTube video ID
  title: string;
  category?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'in-preparation' | 'ready-for-pickup' | 'completed' | 'rejected';
  createdAt: string;
  note?: string;
  pickupLocation?: 'home' | 'market';
}

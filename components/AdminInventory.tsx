
import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Search, RefreshCw, MousePointerClick, ShoppingBag, ClipboardList, Bell, Image as ImageIcon, Upload, Trash2, Pencil, ArrowLeft, AlertTriangle, Plus, Lock, Send, Eye, EyeOff, FileText, Type, Video, Check, LogOut, Link as LinkIcon, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, Code } from 'lucide-react';
import { GalleryItem, PreOrderItem, NewsItem, VideoGalleryItem, Order } from '../types';
import { uploadImageToSanity, fetchProducts, updateProductStatus, createProduct, updateProduct, deleteProduct, createNewsPost, fetchAllNews, updateNewsPost, deleteNewsPost, fetchVideoGallery, createVideo, updateVideo, deleteVideo, fetchOrders, updateOrderStatus, deleteOrder, fetchGalleryImages, updateGalleryImage, deleteGalleryImage, verifyTokenPermissions } from '../sanityClient';
import { createClient } from '@sanity/client';
import { sendOrderStatusUpdateEmail } from '../utils/emailService';
import { compressImage } from '../utils/imageOptimizer';

// Helper function to parse DD.MM.YYYY date format
function parseEuropeanDate(dateString: string): Date | null {
  if (!dateString) return null;
  const parts = dateString.split('.');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-based
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  return new Date(year, month, day);
}

// Function to send status update emails via Netlify function
async function sendStatusUpdateEmail(orderData: any, oldStatus: string, newStatus: string) {
  console.log('📧 Sending status update email via Netlify function:', { orderNumber: orderData.orderNumber, oldStatus, newStatus });

  try {
    const response = await fetch('/.netlify/functions/send-order-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        oldStatus,
        newStatus,
        isStatusUpdate: true
      }),
    });

    const result = await response.json();
    console.log('📧 Status update email result:', result);

    if (response.ok && result.success) {
      console.log("✅ Status update email sent successfully");
      return true;
    } else {
      console.warn("⚠️ Status update email failed:", result);
      return false;
    }
  } catch (error) {
    console.warn("⚠️ Error sending status update email:", error);
    return false;
  }
}

// Function to validate React code for custom components
function validateReactCode(code: string): { isValid: boolean; errors: string[]; suggestions: string[] } {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (!code.trim()) {
    return {
      isValid: false,
      errors: ['Koda ne sme biti prazna'],
      suggestions: ['Dodajte React komponento z export default function']
    };
  }

  // Check for basic syntax errors
  try {
    // Simple syntax check - try to parse with a basic function
    new Function('React', 'uploadImage', 'savedImages', code);
  } catch (syntaxError: any) {
    errors.push(`Sintaktična napaka: ${syntaxError.message}`);
    suggestions.push('Preverite oklepaje, narekovaje in podpičja');
  }

  // Check for default export
  if (!code.includes('export default') && !code.includes('export default function') && !code.includes('export default class')) {
    errors.push('Manjka "export default" stavek');
    suggestions.push('Dodajte "export default" pred vašo komponento funkcijo ali razred');
  }

  // Check for React import
  if (!code.includes('import React') && !code.includes("from 'react'") && !code.includes('from "react"')) {
    if (!code.includes('React.') && !code.includes('<')) {
      // Only suggest React import if React is actually used
    } else {
      suggestions.push('Dodajte: import React from \'react\';');
    }
  }

  // Check for function component structure
  if (code.includes('function') && code.includes('return')) {
    const functionMatch = code.match(/function\s+(\w+)/);
    if (functionMatch) {
      const functionName = functionMatch[1];
      if (!code.includes(`export default ${functionName}`) && !code.includes('export default function')) {
        suggestions.push(`Dodajte "export default ${functionName};" na konec datoteke`);
      }
    }
  }

  // Check for arrow function component
  if (code.includes('=>') && code.includes('return')) {
    if (!code.includes('export default') && !code.includes('const') && !code.includes('let')) {
      suggestions.push('Za arrow funkcije uporabite: const MyComponent = () => { ... }; export default MyComponent;');
    }
  }

  // Check for proper JSX structure
  const jsxElements = code.match(/<\w+/g);
  if (jsxElements && jsxElements.length > 0) {
    if (!code.includes('return')) {
      errors.push('JSX elementi morajo biti znotraj return stavka');
      suggestions.push('Ovijte JSX v return: return (<div>...</div>);');
    }
  }

  // Check for uploadImage usage
  if (code.includes('uploadImage') && !code.includes('uploadImage(')) {
    suggestions.push('uploadImage je funkcija: uploadImage(\'key\', file)');
  }

  // Check for savedImages usage
  if (code.includes('savedImages') && !code.includes('savedImages.')) {
    suggestions.push('savedImages je objekt: savedImages.keyName');
  }

  // Check for common mistakes
  if (code.includes('className=')) {
    if (code.match(/className=['"][^'"]*['"]/g)?.some(cls => cls.includes(' '))) {
      suggestions.push('Za več CSS razredov uporabite samo en niz: className="razred1 razred2"');
    }
  }

  // Check for RegenerativePost import
  if (code.includes('RegenerativePost') && !code.includes("from '../components/blog/RegenerativePost'")) {
    suggestions.push('Dodajte: import RegenerativePost from \'../components/blog/RegenerativePost\';');
  }

  // Check for proper component usage
  if (code.includes('<RegenerativePost') && !code.includes('</RegenerativePost>')) {
    errors.push('RegenerativePost komponenta ni pravilno zaprta');
    suggestions.push('Dodajte zaključni tag: </RegenerativePost>');
  }

  // Check for missing brackets in JSX
  const openTags = (code.match(/<\w+/g) || []).length;
  const closeTags = (code.match(/<\/\w+/g) || []).length;
  const selfClosingTags = (code.match(/<\w+[^>]*\/>/g) || []).length;

  if (openTags + selfClosingTags !== closeTags && openTags > 0) {
    suggestions.push('Preverite, če so vsi JSX tagi pravilno zaprti');
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}
import { sanityConfig } from '../sanityConfig';

// Order management

interface AdminProps {
  onClose: () => void;
  initialTab?: 'inventory' | 'orders' | 'gallery' | 'news' | 'videos' | 'settings';
  currentImages?: GalleryItem[];
  onAddImage?: (img: GalleryItem) => void;
  onDeleteImage?: (id: string) => void;
}

interface PendingUpload {
  file: File;
  src: string;
  description: string;
  date: string; // YYYY-MM-DD format
}

interface NewsBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'customReact';
  content?: string;
  file?: File;
  preview?: string;
  url?: string; // For button
  text?: string; // For button
  code?: string; // For customReact
  images?: Record<string, string>; // For customReact images
}

const AdminInventory: React.FC<AdminProps> = ({ onClose, initialTab = 'inventory', currentImages = [], onAddImage, onDeleteImage }) => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_session'));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'gallery' | 'news' | 'videos' | 'settings'>(initialTab);
  const [cartEnabled, setCartEnabled] = useState(true);

  // Load settings from localStorage
  useEffect(() => {
    const savedCartEnabled = localStorage.getItem('cartEnabled');
    if (savedCartEnabled !== null) {
      setCartEnabled(savedCartEnabled === 'true');
    }
  }, []);

  // Save cart setting to localStorage
  const saveCartSetting = (enabled: boolean) => {
    setCartEnabled(enabled);
    localStorage.setItem('cartEnabled', enabled.toString());
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('cartSettingChanged', { detail: { cartEnabled: enabled } }));
  };

  // Admin credentials (v produkciji shranite v environment variables!)
  const ADMIN_EMAIL = 'biodinamicnakmetijacernelic@gmail.com';
  const ADMIN_PASSWORD = 'Landini174*'; // Admin geslo za dostop

  // Sanity token from environment variables or localStorage
  const [sanityToken, setSanityToken] = useState(import.meta.env.VITE_SANITY_TOKEN || localStorage.getItem('sanityToken') || '');
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);
  const [verifyingToken, setVerifyingToken] = useState(false);

  // Update token when it changes in settings
  const handleTokenChange = async (newToken: string) => {
    setSanityToken(newToken);
    localStorage.setItem('sanityToken', newToken);

    if (newToken) {
      setVerifyingToken(true);
      try {
        const result = await verifyTokenPermissions(newToken);
        setTokenVerified(result.valid && result.canCreate);
        if (!result.valid) {
          setNotification(`⚠️ Neveljaven API ključ: ${result.error}`);
        } else if (!result.canCreate) {
          setNotification(`⚠️ API ključ nima pravic za ustvarjanje: ${result.error}`);
        } else {
          setNotification('✅ API ključ je veljaven in ima pravice za ustvarjanje');
        }
      } catch (error) {
        setTokenVerified(false);
        setNotification('⚠️ Napaka pri preverjanju API ključa');
      } finally {
        setVerifyingToken(false);
      }
    } else {
      setTokenVerified(null);
    }
  };

  // Inventory State
  const [products, setProducts] = useState<PreOrderItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectAllProducts, setSelectAllProducts] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'fresh' | 'dry'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Inventory CRUD State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', unit: '', category: 'fresh', status: 'available', quantity: '', maxQuantity: '' });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Gallery Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // News State
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], link: '' });
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);
  const newsImageRef = useRef<HTMLInputElement>(null);

  // News Editing State
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // News Blocks State (Rich Editor)
  const [newsBlocks, setNewsBlocks] = useState<NewsBlock[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [newsImages, setNewsImages] = useState<Record<string, string>>({}); // Store uploaded images for customReact blocks

  // React code validation state
  const [codeValidation, setCodeValidation] = useState<{
    blockId: string;
    errors: string[];
    suggestions: string[];
    isValid: boolean;
  } | null>(null);

  // Handle image uploads from custom React components
  const handleNewsImageUpload = (key: string, url: string) => {
    console.log('[AdminInventory] handleNewsImageUpload called:', { key, url });
    setNewsImages(prev => {
      const newImages = { ...prev, [key]: url };
      console.log('[AdminInventory] Updated newsImages:', newImages);
      return newImages;
    });
  };

  // Refs for contentEditable editors to prevent cursor loss
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Video Gallery State
  const [videos, setVideos] = useState<VideoGalleryItem[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState({ title: '', videoId: '', category: '' });

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [isEditingGallery, setIsEditingGallery] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryEditForm, setGalleryEditForm] = useState({ title: '', description: '', date: '' });

  // Order Filter State
  const [orderStatusFilter, setOrderStatusFilter] = useState<'pending' | 'in-preparation' | 'ready-for-pickup' | 'completed' | 'rejected'>('pending');
  const [pickupLocationFilter, setPickupLocationFilter] = useState<'all' | 'home' | 'market'>('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // --- Authentication ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    // Preprosta avtentikacija (v produkciji uporabite bolj varno metodo)
    if (loginEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_email', loginEmail);
      setIsLoggedIn(true);
      loadInventory();
      loadOrders();
    } else {
      setLoginError('Napačen email ali geslo');
    }

    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_email');
    setIsLoggedIn(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  // --- Initialize ---
  useEffect(() => {
    if (isLoggedIn) {
      loadInventory();
      loadOrders();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeTab === 'videos') {
      loadVideos();
    } else if (activeTab === 'orders') {
      console.log("🔄 Loading orders tab...");
      loadOrders().catch(error => {
        console.error("❌ Failed to load orders in useEffect:", error);
        setOrders([]); // Set empty array to prevent blank screen
        setIsLoadingOrders(false);
      });
    } else if (activeTab === 'gallery') {
      loadGallery();
    } else if (activeTab === 'news') {
      loadPosts();
    }
  }, [activeTab]);

  // Check for pending new post title from NewPostPopup
  useEffect(() => {
    if (isLoggedIn) {
      const pendingTitle = localStorage.getItem('pendingNewPostTitle');
      if (pendingTitle) {
        // Set active tab to news
        setActiveTab('news');
        // Set the title in the form
        setNewsForm(prev => ({ ...prev, title: pendingTitle }));
        // Start editing new post
        setIsEditingNews(true);
        // Clear the pending title
        localStorage.removeItem('pendingNewPostTitle');
      }
    }
  }, [isLoggedIn]);

  // Validate React code when blocks change
  useEffect(() => {
    const customReactBlock = newsBlocks.find(block => block.type === 'customReact' && block.code);
    if (customReactBlock) {
      const validation = validateReactCode(customReactBlock.code);
      if (validation.errors.length > 0 || validation.suggestions.length > 0) {
        setCodeValidation({
          blockId: customReactBlock.id,
          errors: validation.errors,
          suggestions: validation.suggestions,
          isValid: validation.isValid
        });
      } else {
        setCodeValidation(null);
      }
    } else {
      setCodeValidation(null);
    }
  }, [newsBlocks]);

  const loadInventory = async () => {
    setIsLoadingProducts(true);
    setConnectionError(false);
    try {
      const liveProducts = await fetchProducts();
      setProducts(liveProducts);
    } catch (e) {
      console.error("Failed to load inventory:", e);
      setConnectionError(true);
      setProducts([]);
    }
    setIsLoadingProducts(false);
  };

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const allPosts = await fetchAllNews();
      setPosts(allPosts);
    } catch (e) {
      console.error("Failed to load posts:", e);
      setPosts([]);
    }
    setIsLoadingPosts(false);
  };

  const loadVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const data = await fetchVideoGallery();
      setVideos(data);
    } catch (error) {
      console.error("Failed to load videos:", error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const loadGallery = async () => {
    setIsLoadingGallery(true);
    try {
      const data = await fetchGalleryImages();
      setGalleryImages(data);
    } catch (e) {
      console.error("Failed to load gallery:", e);
      setGalleryImages([]);
    }
    setIsLoadingGallery(false);
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const token = import.meta.env.VITE_SANITY_TOKEN;
      console.log("🔍 Loading orders - Token exists:", !!token);

      if (token) {
        console.log("🔍 Calling fetchOrders with token...");
        const data = await fetchOrders(token);
        console.log("✅ Fetched orders data:", data);
        console.log("✅ Orders count:", data ? data.length : "undefined");

        // Ensure we always set an array to prevent blank screen
        const ordersArray = Array.isArray(data) ? data : [];
        setOrders(ordersArray);
      } else {
        console.warn("❌ No sanity token found for loading orders");
        console.log("💡 Please set the token in Settings tab first");
        setOrders([]); // Set empty array to prevent blank screen
      }
    } catch (error) {
      console.error("❌ Failed to load orders:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error stack:", error.stack);

      // Always set empty array on error to prevent blank screen
      setOrders([]);
    } finally {
      console.log("🏁 loadOrders completed");
      setIsLoadingOrders(false);
    }
  };

  // Helper to check stock availability for an order
  const checkOrderStock = (orderItems: any[]) => {
    let allAvailable = true;
    const itemsWithStock = orderItems.map(item => {
      const product = products.find(p => p.name === item.name);
      const currentStock = product?.quantity !== undefined ? product.quantity : 0;
      const isEnough = currentStock >= item.quantity;

      if (!isEnough) allAvailable = false;

      return {
        ...item,
        currentStock,
        isEnough,
        productFound: !!product
      };
    });

    return { allAvailable, itemsWithStock };
  };

  const handleOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = import.meta.env.VITE_SANITY_TOKEN;
      if (!token) {
        alert('Manjka Sanity API token. Obrnite se na administratorja.');
        return;
      }

      // Find the current order to get its data for email
      const currentOrder = orders.find(order => order.id === orderId);
      if (!currentOrder) {
        alert('Naročilo ni najdeno.');
        return;
      }

      const oldStatus = currentOrder.status;

      // Update order status in Sanity
      const success = await updateOrderStatus(orderId, newStatus, token);
      if (!success) {
        alert('Napaka pri posodabljanju statusa.');
        return;
      }

      // AUTO-DEDUCT STOCK LOGIC
      // If status changes to 'in-preparation' (usually meaning confirmed), deduct stock
      if (newStatus === 'in-preparation' && oldStatus !== 'in-preparation') {
        console.log('📉 Auto-deducting stock for order:', orderId);
        try {
          // We need to iterate through items and update products
          // Note: This requires products to be loaded in state (which they are)
          for (const item of currentOrder.items) {
            // Find product by name (since order items might not have IDs stored directly, but usually we match by name or ID)
            // Ideally order items should have product ID. Let's check if we can match by name if ID is missing.
            const product = products.find(p => p.name === item.name);

            if (product && product.id && product.quantity !== undefined) {
              const currentQty = product.quantity;
              const deductQty = item.quantity;
              const newQty = Math.max(0, currentQty - deductQty);

              // Determine new status
              let newProductStatus = product.status;
              if (newQty <= 0) newProductStatus = 'sold-out';

              console.log(`📉 Updating ${product.name}: ${currentQty} -> ${newQty}`);

              // Update in Sanity
              await updateProduct(product.id, {
                name: product.name,
                price: product.price,
                unit: product.unit,
                category: product.category,
                quantity: newQty,
                maxQuantity: product.maxQuantity
              }, null, token);

              // Also update status if needed
              if (newProductStatus !== product.status) {
                await updateProductStatus(product.id, newProductStatus, token);
              }
            }
          }
          // Reload inventory to reflect changes
          loadInventory();
          setNotification('📉 Zaloga je bila samodejno zmanjšana.');
        } catch (stockError) {
          console.error('Failed to auto-deduct stock:', stockError);
          setNotification('⚠️ Status posodobljen, a napaka pri zmanjšanju zaloge.');
        }
      }

      // Send email notification to customer
      const emailOrderData = {
        ...currentOrder,
        status: newStatus as 'pending' | 'approved' | 'rejected' | 'completed'
      };

      // Send email asynchronously (don't block the UI) - skip for completed orders
      if (newStatus !== 'completed') {
        sendStatusUpdateEmail(emailOrderData, oldStatus, newStatus).catch(emailError => {
          console.warn('Failed to send status update email:', emailError);
        });
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));

      // Show success notification
      setNotification(`✅ Status naročila posodobljen na "${newStatus === 'approved' ? 'Potrjeno' : newStatus === 'rejected' ? 'Zavrnjeno' : newStatus === 'completed' ? 'Zaključeno' : 'V obdelavi'}".`);
      setTimeout(() => setNotification(null), 3000);

    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Napaka pri posodabljanju statusa naročila.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!sanityToken) return;
    if (!confirm("Ste prepričani, da želite izbrisati to naročilo?")) return;

    try {
      const success = await deleteOrder(orderId, sanityToken);
      if (success) {
        setOrders(orders.filter(order => order.id !== orderId));
        setNotification("🗑️ Naročilo izbrisano.");
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification("❌ Napaka pri brisanju naročila.");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      setNotification("❌ Napaka pri brisanju naročila.");
      setTimeout(() => setNotification(null), 3000);
    }
  };


  // --- News Block Logic ---
  const addTextBlock = () => {
    setNewsBlocks([...newsBlocks, { id: Date.now().toString(), type: 'text', content: '' }]);
  };

  const addImageBlock = () => {
    setNewsBlocks([...newsBlocks, { id: Date.now().toString(), type: 'image' }]);
  };

  const addButtonBlock = () => {
    setNewsBlocks([...newsBlocks, { id: Date.now().toString(), type: 'button', text: 'Klikni me', url: 'https://' }]);
  };

  const addCustomReactBlock = (template = 'interactive') => {
    const blockId = Date.now().toString();
    let code = '';

    if (template === 'gallery') {
      code = `export default function ImageGallery() {
  const [images, setImages] = React.useState(savedImages || {});
  const [selectedImage, setSelectedImage] = React.useState(null);

  const uploadGalleryImage = async (key) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const imageKey = \`gallery_\${key}_\${Date.now()}_\${i}\`;
          const url = await uploadImage(imageKey, file);
          setImages(prev => ({ ...prev, [imageKey]: url }));
        } catch (error) {
          alert(\`Napaka pri nalaganju slike \${file.name}: \${error.message}\`);
        }
      }
    };
    input.click();
  };

  const removeImage = (key) => {
    setImages(prev => {
      const newImages = { ...prev };
      delete newImages[key];
      return newImages;
    });
  };

  const imageKeys = Object.keys(images);

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Galerija slik</h3>
        <button
          onClick={() => uploadGalleryImage('batch')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          📸 Dodaj slike
        </button>
      </div>

      {imageKeys.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🖼️</div>
          <p>Še ni naloženih slik. Kliknite "Dodaj slike" za začetek.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageKeys.map((key) => (
            <div key={key} className="relative group">
              <img
                src={images[key]}
                alt="Gallery image"
                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedImage(images[key])}
              />
              <button
                onClick={() => removeImage(key)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-full">
            <img src={selectedImage} alt="Full size" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}`;
    } else if (template === 'form') {
      code = `export default function ContactForm() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tukaj bi dodali logiko za pošiljanje obrazca
    alert(\`Obrazec prejet!\\nIme: \${formData.name}\\nEmail: \${formData.email}\\nSporočilo: \${formData.message}\`);

    // Ponastavi obrazec
    setFormData({ name: '', email: '', message: '' });
    setSubmitted(true);

    // Ponastavi status po 3 sekundah
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Kontaktirajte nas</h3>

      {submitted ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✅</div>
          <h4 className="text-xl font-bold text-green-800 mb-2">Hvala za sporočilo!</h4>
          <p className="text-green-700">Odgovorili vam bomo v najkrajšem možnem času.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ime</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Vaše ime"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="vas.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sporočilo</label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
              placeholder="Vaše sporočilo..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
          >
            Pošlji sporočilo
          </button>
        </form>
      )}
    </div>
  );
}`;
    } else {
      // Default interactive template
      code = `export default function CustomComponent() {
  // Dostopne funkcije: uploadImage(key, file), savedImages
  const [imageUrl, setImageUrl] = React.useState(savedImages.heroImage || '');
  const [text, setText] = React.useState('Dobrodošli!');
  const [showImage, setShowImage] = React.useState(true);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Shranimo sliko pod ključem 'heroImage'
          const url = await uploadImage('heroImage', file);
          setImageUrl(url);
        } catch (error) {
          alert('Napaka pri nalaganju slike: ' + error.message);
        }
      }
    };
    input.click();
  };

  const handleTextChange = (newText) => {
    setText(newText);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 shadow-sm">
      {/* Glavni naslov */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {text}
      </h2>

      {/* Gumbi za urejanje */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <button
          onClick={handleImageUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md flex items-center gap-2"
        >
          📷 {imageUrl ? 'Spremeni sliko' : 'Dodaj sliko'}
        </button>

        <button
          onClick={() => setShowImage(!showImage)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
        >
          {showImage ? 'Skrij sliko' : 'Pokaži sliko'}
        </button>

        <button
          onClick={() => handleTextChange(prompt('Vnesite nov naslov:', text) || text)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md"
        >
          ✏️ Uredi naslov
        </button>
      </div>

      {/* Prikaz slike */}
      {showImage && imageUrl && (
        <div className="text-center">
          <img
            src={imageUrl}
            alt="Naložena slika"
            className="max-w-full h-auto rounded-lg shadow-lg mx-auto border-4 border-white"
            style={{ maxHeight: '400px' }}
          />
        </div>
      )}

      {/* Opis */}
      <div className="mt-6 text-center text-gray-600">
        <p className="text-sm">
          Ta komponenta omogoča nalaganje slik, urejanje besedila in interaktivne elemente.
          Slike se samodejno shranijo skupaj z objavo.
        </p>
      </div>
    </div>
  );
}`;
    }

    setNewsBlocks([...newsBlocks, {
      id: blockId,
      type: 'customReact',
      code: code
    }]);
  };

  const removeBlock = (id: string) => {
    setNewsBlocks(newsBlocks.filter(b => b.id !== id));
  };

  const updateBlockContent = (id: string, content: string) => {
    setNewsBlocks(newsBlocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const updateButtonBlock = (id: string, field: 'text' | 'url', value: string) => {
    setNewsBlocks(newsBlocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const updateBlockField = (id: string, field: string, value: string) => {
    setNewsBlocks(newsBlocks.map(b => b.id === id ? { ...b, [field]: value } : b));

    // Validate React code when it changes
    if (field === 'code') {
      const validation = validateReactCode(value);
      if (validation.errors.length > 0 || validation.suggestions.length > 0) {
        setCodeValidation({
          blockId: id,
          errors: validation.errors,
          suggestions: validation.suggestions,
          isValid: validation.isValid
        });
      } else {
        // Clear validation if code is valid
        setCodeValidation(prev => prev?.blockId === id ? null : prev);
      }
    }
  };

  // Function to auto-fix common React code issues
  const autoFixReactCode = (code: string): string => {
    let fixedCode = code.trim();

    // Add React import if missing and React is used
    if (!fixedCode.includes('import React') && (fixedCode.includes('React.') || fixedCode.includes('<'))) {
      fixedCode = "import React from 'react';\n\n" + fixedCode;
    }

    // Add RegenerativePost import if used
    if (fixedCode.includes('RegenerativePost') && !fixedCode.includes("from '../components/blog/RegenerativePost'")) {
      if (fixedCode.includes('import React')) {
        fixedCode = fixedCode.replace("import React from 'react';", "import React from 'react';\nimport RegenerativePost from '../components/blog/RegenerativePost';");
      } else {
        fixedCode = "import RegenerativePost from '../components/blog/RegenerativePost';\n\n" + fixedCode;
      }
    }

    // Add export default if missing
    if (!fixedCode.includes('export default')) {
      const functionMatch = fixedCode.match(/function\s+(\w+)/);
      if (functionMatch) {
        fixedCode += `\n\nexport default ${functionMatch[1]};`;
      } else if (fixedCode.includes('=>')) {
        fixedCode += '\n\nexport default MyComponent;';
      }
    }

    return fixedCode;
  };

  const applyAutoFix = (blockId: string) => {
    const block = newsBlocks.find(b => b.id === blockId);
    if (block && block.code) {
      const fixedCode = autoFixReactCode(block.code);
      updateBlockField(blockId, 'code', fixedCode);
    }
  };

  const insertLink = (blockId: string) => {
    const editor = document.getElementById(`textarea-${blockId}`) as HTMLElement;
    if (!editor) return;

    const url = prompt("Vnesite URL povezavo:", "https://");
    if (url) {
      const text = prompt('Vnesite besedilo povezave:', 'povezava') || 'povezava';
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      editor.focus();
      document.execCommand('insertHTML', false, linkHtml);
    }
  };

  const formatText = (blockId: string, command: string) => {
    const editor = document.getElementById(`textarea-${blockId}`) as HTMLElement;
    if (!editor) return;

    editor.focus();

    switch (command) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'left':
        document.execCommand('justifyLeft', false);
        break;
      case 'center':
        document.execCommand('justifyCenter', false);
        break;
      case 'right':
        document.execCommand('justifyRight', false);
        break;
    }
  };

  const changeFontSize = (blockId: string, size: string) => {
    const editor = document.getElementById(`textarea-${blockId}`) as HTMLElement;
    if (!editor) return;

    if (size && size.trim()) {
      editor.focus();
      document.execCommand('fontSize', false, size);
    }
  };

  const changeFontFamily = (blockId: string, family: string) => {
    const editor = document.getElementById(`textarea-${blockId}`) as HTMLElement;
    if (!editor) return;

    const familyMap: { [key: string]: string } = {
      'font-sans': 'Arial, sans-serif',
      'font-serif': 'Times New Roman, serif',
      'font-mono': 'Courier New, monospace'
    };

    const execFamily = familyMap[family];
    if (execFamily) {
      editor.focus();
      document.execCommand('fontName', false, execFamily);
    }
  };

  const changeTextColor = (blockId: string, color: string) => {
    const editor = document.getElementById(`textarea-${blockId}`) as HTMLElement;
    if (!editor) return;

    editor.focus();
    document.execCommand('foreColor', false, color);
  };

  const insertColor = (blockId: string) => {
    const color = prompt("Vnesite HEX barvo (npr. #FF5733):", "#");
    if (color) {
      changeTextColor(blockId, color);
    }
  };

  const insertImageAtCursor = async (blockId: string) => {
    const block = newsBlocks.find(b => b.id === blockId);
    if (!block || block.type !== 'text') return;

    const editable = document.getElementById(`textarea-${blockId}`);
    if (!editable) return;

    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Compress and convert to WebP
        const compressedFile = await compressImage(file);

        // Upload directly to Sanity assets
        const sanityToken = import.meta.env.VITE_SANITY_TOKEN;
        const authClient = createClient({
          ...sanityConfig,
          token: sanityToken,
          ignoreBrowserTokenWarning: true
        });

        const imageAsset = await authClient.assets.upload('image', compressedFile, {
          filename: compressedFile.name
        });

        if (imageAsset?.url) {
          // Create image element
          const img = document.createElement('img');
          img.src = imageAsset.url;
          img.alt = 'Slika';
          img.className = 'max-w-full h-auto my-4 rounded-lg';
          img.style.maxHeight = '400px';

          // Insert at cursor position in contenteditable
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);

            // Move cursor after image
            range.setStartAfter(img);
            range.setEndAfter(img);
            selection.removeAllRanges();
            selection.addRange(range);
          }

          // Update block content
          updateBlockContent(blockId, editable.innerHTML);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Napaka pri nalaganju slike');
      }
    };

    input.click();
  };

  const insertVideoAtCursor = (blockId: string) => {
    const editor = document.getElementById(`textarea-${blockId}`) as HTMLElement;
    if (!editor) return;

    const url = prompt("Vnesite YouTube URL:", "https://www.youtube.com/watch?v=");
    if (url) {
      // Extract video ID from YouTube URL
      let videoId = '';
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (match) videoId = match[1];

      if (videoId) {
        const embedHtml = `<div class="my-10 relative w-full" style="padding-bottom: 56.25%"><iframe src="https://www.youtube.com/embed/${videoId}" class="absolute top-0 left-0 w-full h-full rounded-2xl shadow-lg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        editor.focus();
        document.execCommand('insertHTML', false, embedHtml);
      } else {
        alert("Neveljaven YouTube URL");
      }
    }
  };

  const insertButtonAtCursor = (blockId: string) => {
    const editor = document.getElementById(`textarea-${blockId}`) as HTMLElement;
    if (!editor) return;

    const text = prompt("Besedilo gumba:", "Klikni tukaj");
    if (text) {
      const url = prompt("URL gumba:", "https://");
      if (url) {
        const buttonHtml = `<div class="my-6 text-center"><a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-xl font-semibold hover:bg-terracotta-dark transition-colors">${text}</a></div>`;
        editor.focus();
        document.execCommand('insertHTML', false, buttonHtml);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, blockId: string) => {
    const block = newsBlocks.find(b => b.id === blockId);
    if (!block || block.type !== 'text') return;

    // Get HTML from clipboard
    const html = e.clipboardData.getData('text/html');

    if (html) {
      e.preventDefault();

      // Parse HTML to extract links and preserve paragraphs
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Convert links to markdown format
      const links = doc.querySelectorAll('a');
      links.forEach(link => {
        const text = link.textContent || '';
        const href = link.getAttribute('href') || '';
        if (href) {
          link.replaceWith(document.createTextNode(`[${text}](${href})`));
        }
      });

      // Convert paragraphs and line breaks
      const paragraphs = doc.querySelectorAll('p, div, br');
      paragraphs.forEach(p => {
        if (p.tagName === 'BR') {
          p.replaceWith(document.createTextNode('\n'));
        } else {
          // Add double newline after paragraphs
          const textNode = document.createTextNode(p.textContent + '\n\n');
          p.replaceWith(textNode);
        }
      });

      // Get plain text with converted links and preserved paragraphs
      let textWithLinks = doc.body.textContent || '';
      // Clean up excessive newlines (more than 2 in a row)
      textWithLinks = textWithLinks.replace(/\n{3,}/g, '\n\n');

      // Insert at cursor position
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = block.content || '';

      const newContent = currentContent.substring(0, start) + textWithLinks + currentContent.substring(end);
      updateBlockContent(blockId, newContent);

      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + textWithLinks.length;
      }, 0);
    }
  };

  const handleBlockImageSelect = async (id: string, file: File) => {
    try {
      const compressedFile = await compressImage(file);
      const preview = URL.createObjectURL(compressedFile);
      setNewsBlocks(newsBlocks.map(b => b.id === id ? { ...b, file: compressedFile, preview } : b));
    } catch (error) {
      console.error("Error compressing block image:", error);
      const preview = URL.createObjectURL(file);
      setNewsBlocks(newsBlocks.map(b => b.id === id ? { ...b, file, preview } : b));
    }
  };

  const handleNewsImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file);
        setNewsImageFile(compressedFile);
        setNewsImagePreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Error compressing image:", error);
        // Fallback to original
        setNewsImageFile(file);
        setNewsImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const startEditNews = (post: NewsItem) => {
    setEditingNewsId(post.id);
    setNewsForm({ title: post.title, date: post.publishedAt, link: post.link || '' });
    setNewsImagePreview(post.image);
    setNewsImageFile(null);

    // Convert body back to blocks for editing
    const blocks: NewsBlock[] = [];
    const loadedImages: Record<string, string> = {};
    if (Array.isArray(post.body)) {
      post.body.forEach((block: any, index: number) => {
        if (block._type === 'block') {
          blocks.push({
            id: block._key || `block-${index}`,
            type: 'text',
            content: block.children?.map((child: any) => child.text).join('') || ''
          });
        } else if (block._type === 'image') {
          blocks.push({
            id: block._key || `img-${index}`,
            type: 'image',
            preview: block.asset ? '' : undefined // We can't easily get the URL here
          });
        } else if (block._type === 'button') {
          blocks.push({
            id: block._key || `btn-${index}`,
            type: 'button',
            text: block.text || 'Gumb',
            url: block.url || 'https://'
          });
        } else if (block._type === 'customReact') {
          blocks.push({
            id: block._key || `react-${index}`,
            type: 'customReact',
            code: block.code || ''
          });
          // Load associated images
          if (block.images) {
            console.log('[startEditNews] Loading images for customReact block:', block.images);
            Object.assign(loadedImages, block.images);
          }
        }
      });
    }
    setNewsBlocks(blocks.length > 0 ? blocks : [{ id: Date.now().toString(), type: 'text', content: '' }]);
    setNewsImages(loadedImages);
    console.log('[startEditNews] Loaded blocks and images:', { blocks: blocks.length, images: Object.keys(loadedImages).length, loadedImages });
    setIsEditingNews(true);
  };

  const handleSaveNews = async () => {
    if (!sanityToken) {
      setNotification("⚠️ Manjka API ključ!");
      return;
    }
    if (!newsForm.title) {
      setNotification("⚠️ Naslov je obvezen.");
      return;
    }

    setIsUploading(true);
    try {
      // Prepare auth client for inline image uploads
      const authClient = createClient({
        ...sanityConfig,
        token: sanityToken,
        ignoreBrowserTokenWarning: true
      });

      const finalBody = [];

      // Process blocks
      for (const block of newsBlocks) {
        if (block.type === 'text') {
          // Get current content from editor ref, fallback to block.content
          const currentContent = editorRefs.current[block.id]?.innerHTML || block.content || '';
          if (currentContent.trim()) {
            finalBody.push({
              _type: 'block',
              _key: block.id,
              style: 'normal',
              children: [{
                _type: 'span',
                _key: `${block.id}-span`,
                text: currentContent
              }]
            });
          }
        } else if (block.type === 'image' && block.file) {
          // Upload inline image
          const asset = await authClient.assets.upload('image', block.file, { filename: block.file.name });
          finalBody.push({
            _type: 'image',
            _key: block.id,
            asset: { _type: 'reference', _ref: asset._id }
          });
        } else if (block.type === 'button') {
          finalBody.push({
            _type: 'button',
            _key: block.id,
            text: block.text,
            url: block.url
          });
        } else if (block.type === 'customReact') {
          console.log('[handleSaveNews] Saving customReact block:', {
            id: block.id,
            code: block.code?.substring(0, 100) + '...',
            images: newsImages
          });
          finalBody.push({
            _type: 'customReact',
            _key: block.id,
            code: block.code,
            images: newsImages // Include uploaded images for this custom React block
          });
        }
      }

      let finalDate = newsForm.date;
      const parsedEuropean = parseEuropeanDate(newsForm.date);
      if (parsedEuropean) {
        finalDate = parsedEuropean.toISOString().split('T')[0];
      }

      if (editingNewsId) {
        // Update existing post
        await updateNewsPost(editingNewsId, {
          title: newsForm.title,
          date: finalDate,
          body: finalBody,
          link: newsForm.link
        }, newsImageFile, sanityToken);
        setNotification("✅ Novica posodobljena!");
      } else {
        // Create new post
        await createNewsPost({
          title: newsForm.title,
          date: finalDate,
          body: finalBody,
          link: newsForm.link
        }, newsImageFile, sanityToken);
        setNotification("✅ Novica uspešno objavljena!");
      }

      // Reset
      setNewsForm({ title: '', date: new Date().toISOString().split('T')[0], link: '' });
      setNewsImageFile(null);
      setNewsImagePreview(null);
      setNewsBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
      setNewsImages({});
      setIsEditingNews(false);
      setEditingNewsId(null);

      loadPosts();
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
      setNotification("❌ Napaka pri shranjevanju.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteNews = async (postId?: string) => {
    const targetPostId = postId || editingNewsId;
    if (!targetPostId || !sanityToken) return;

    const confirmMessage = postId
      ? "Ste prepričani, da želite izbrisati to novico?"
      : "Ste prepričani, da želite izbrisati to novico?";

    if (!confirm(confirmMessage)) return;

    setIsUploading(true);
    try {
      await deleteNewsPost(targetPostId, sanityToken);
      setNotification("🗑️ Novica izbrisana.");

      if (postId) {
        // Individual delete - remove from selected posts if it was selected
        setSelectedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        loadPosts();
      } else {
        // Edit mode delete
        setIsEditingNews(false);
        setEditingNewsId(null);
        setNewsForm({ title: '', date: new Date().toISOString().split('T')[0], link: '' });
        setNewsImageFile(null);
        setNewsImagePreview(null);
        setNewsBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
        loadPosts();
      }
    } catch (e) {
      setNotification("❌ Napaka pri brisanju.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };


  // Bulk Selection Functions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(posts.map(post => post.id));
      setSelectedPosts(allIds);
      setSelectAll(true);
    }
  };

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
    setSelectAll(newSelected.size === posts.length);
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) {
      setNotification("❌ Izberite novice za brisanje.");
      return;
    }

    if (!confirm(`Ali ste prepričani, da želite izbrisati ${selectedPosts.size} novic?`)) return;

    setIsUploading(true);
    let deletedCount = 0;

    try {
      for (const postId of selectedPosts) {
        await deleteNewsPost(postId, sanityToken);
        deletedCount++;
      }
      setNotification(`✅ Izbrisano ${deletedCount} novic.`);
      setSelectedPosts(new Set());
      setSelectAll(false);
      loadPosts();
    } catch (error) {
      setNotification("❌ Napaka pri brisanju novic.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // --- Video Gallery Handlers ---
  const startEditVideo = (video: VideoGalleryItem) => {
    setEditingVideoId(video.id);
    setVideoForm({ title: video.title, videoId: video.videoId, category: video.category || '' });
    setIsEditingVideo(true);
  };

  const handleSaveVideo = async () => {
    if (!sanityToken) {
      setNotification("⚠️ Manjka API ključ!");
      return;
    }
    if (!videoForm.title || !videoForm.videoId) {
      setNotification("⚠️ Naslov in Video ID sta obvezna.");
      return;
    }

    setIsUploading(true);
    try {
      if (editingVideoId) {
        await updateVideo(editingVideoId, videoForm, sanityToken);
        setNotification("✅ Video posodobljen!");
      } else {
        await createVideo(videoForm, sanityToken);
        setNotification("✅ Nov video dodan!");
      }
      setIsEditingVideo(false);
      setEditingVideoId(null);
      setVideoForm({ title: '', videoId: '', category: '' });
      loadVideos();
    } catch (e) {
      setNotification("❌ Napaka pri shranjevanju.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteVideo = async () => {
    if (!editingVideoId || !sanityToken) return;
    if (!confirm("Ste prepričani, da želite izbrisati ta video?")) return;

    setIsUploading(true);
    try {
      await deleteVideo(editingVideoId, sanityToken);
      setNotification("🗑️ Video izbrisan.");
      setIsEditingVideo(false);
      setEditingVideoId(null);
      setVideoForm({ title: '', videoId: '', category: '' });
      loadVideos();
    } catch (e) {
      setNotification("❌ Napaka pri brisanju.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Util function for Slovenian status and color
  const getProductStatusProps = (status: string) => {
    switch (status) {
      case 'available':
        return { label: 'na voljo', color: 'bg-green-500', text: 'text-green-600' };
      case 'sold-out':
        return { label: 'razprodano', color: 'bg-red-500', text: 'text-red-500' };
      case 'coming-soon':
        return { label: 'kmalu', color: 'bg-yellow-400', text: 'text-yellow-600' };
      default:
        return { label: status, color: 'bg-gray-300', text: 'text-gray-500' };
    }
  };

  const handleStatusToggle = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
    // status cycle: available -> sold-out -> coming-soon -> available
    let nextStatus = '';
    if (currentStatus === 'available') nextStatus = 'sold-out';
    else if (currentStatus === 'sold-out') nextStatus = 'coming-soon';
    else nextStatus = 'available';
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus as any } : p));

    if (sanityToken) {
      try {
        await updateProductStatus(id, nextStatus, sanityToken);
        setNotification('✅ Status posodobljen!');
        setTimeout(() => setNotification(null), 2000);
      } catch (e) {
        setNotification('❌ Napaka pri shranjevanju.');
      }
    } else {
      setNotification('⚠️ Za shranjevanje potrebujete API Token.');
    }
  };

  // Bulk product selection handlers
  const handleSelectAllProducts = () => {
    if (selectAllProducts) {
      setSelectedProducts(new Set());
      setSelectAllProducts(false);
    } else {
      const allIds = new Set(filteredProducts.map(p => p.id));
      setSelectedProducts(allIds);
      setSelectAllProducts(true);
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setSelectAllProducts(newSelected.size === filteredProducts.length);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedProducts.size === 0) {
      setNotification("❌ Izberite izdelke za spremembo statusa.");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (!confirm(`Ali ste prepričani, da želite spremeniti status ${selectedProducts.size} izdelkov?`)) return;

    setIsUploading(true);
    let updatedCount = 0;

    try {
      for (const productId of selectedProducts) {
        await updateProductStatus(productId, newStatus, sanityToken);
        updatedCount++;
      }
      setNotification(`✅ Status posodobljen za ${updatedCount} izdelkov.`);
      setSelectedProducts(new Set());
      setSelectAllProducts(false);
      loadInventory();
    } catch (error) {
      setNotification("❌ Napaka pri posodabljanju statusa.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const startAddProduct = () => {
    setEditingId(null);
    setEditForm({ name: '', price: '', unit: 'kg', category: 'fresh', status: 'available', quantity: '', maxQuantity: '' });
    setEditImageFile(null);
    setEditImagePreview(null);
    setIsEditing(true);
  };

  const startEditProduct = (product: PreOrderItem) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit,
      category: product.category,
      status: product.status,
      quantity: product.quantity ? product.quantity.toString() : '',
      maxQuantity: product.maxQuantity ? product.maxQuantity.toString() : ''
    });
    setEditImageFile(null);
    setEditImagePreview(product.image);
    setIsEditing(true);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file);
        setEditImageFile(compressedFile);
        setEditImagePreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Error compressing image:", error);
        setEditImageFile(file);
        setEditImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSaveProduct = async () => {
    if (!sanityToken) { setNotification("⚠️ Manjka API ključ!"); return; }
    if (!editForm.name || !editForm.price) { setNotification("⚠️ Ime in cena sta obvezna."); return; }

    setIsUploading(true);
    try {
      const priceNum = parseFloat(editForm.price.replace(',', '.'));
      const quantityNum = editForm.quantity ? parseFloat(editForm.quantity) : undefined;
      const maxQuantityNum = editForm.maxQuantity ? parseFloat(editForm.maxQuantity) : undefined;

      // Auto-update status based on quantity
      let statusToSave = editForm.status;
      if (quantityNum !== undefined && quantityNum <= 0) {
        statusToSave = 'sold-out';
      } else if (quantityNum !== undefined && quantityNum > 0 && editForm.status === 'sold-out') {
        statusToSave = 'available';
      }

      const productDataToSave = {
        ...editForm,
        price: priceNum,
        status: statusToSave,
        quantity: quantityNum,
        maxQuantity: maxQuantityNum
      };

      if (editingId) {
        await updateProduct(editingId, productDataToSave, editImageFile, sanityToken);
        setNotification("✅ Izdelek posodobljen!");
      } else {
        await createProduct(productDataToSave, editImageFile, sanityToken);
        setNotification("✅ Nov izdelek ustvarjen!");
      }
      setIsEditing(false);
      loadInventory();
    } catch (e) {
      setNotification("❌ Napaka pri shranjevanju.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingId || !sanityToken) return;
    if (!confirm("Ste prepričani, da želite izbrisati ta izdelek?")) return;
    setIsUploading(true);
    try {
      await deleteProduct(editingId, sanityToken);
      setNotification("🗑️ Izdelek izbrisan.");
      setIsEditing(false);
      loadInventory();
    } catch (e) {
      setNotification("❌ Napaka pri brisanju.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newUploads: PendingUpload[] = [];
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Show loading or notification if needed, but for now we just process
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const compressedFile = await compressImage(file);
          const src = URL.createObjectURL(compressedFile);
          newUploads.push({ file: compressedFile, src, description: '', date: today });
        } catch (error) {
          console.error("Error compressing image:", error);
          const src = URL.createObjectURL(file);
          newUploads.push({ file, src, description: '', date: today });
        }
      }
      setPendingUploads(prev => [...prev, ...newUploads]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadConfirm = async () => {
    if (pendingUploads.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      let successCount = 0;
      try {
        for (let i = 0; i < pendingUploads.length; i++) {
          const item = pendingUploads[i];
          await uploadImageToSanity(item.file, { title: item.description || 'Utrinek', description: item.description, date: item.date }, sanityToken);
          successCount++;
          setUploadProgress(((i + 1) / pendingUploads.length) * 100);
        }
        setNotification(`✅ Uspešno naloženo: ${successCount} slik!`);
        setPendingUploads([]);
        loadGallery(); // Reload gallery instead of page refresh
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        setNotification("❌ Napaka pri nalaganju.");
      } finally {
        setIsUploading(false);
        setTimeout(() => setNotification(null), 4000);
      }
    }
  };

  const startEditGalleryImage = (image: GalleryItem) => {
    setEditingGalleryId(image.id);
    let imageDate = '';
    if (image.date) {
      // Try to parse European date format (DD.MM.YYYY) or ISO format
      const parsedDate = parseEuropeanDate(image.date);
      if (parsedDate) {
        imageDate = parsedDate.toISOString().split('T')[0];
      } else {
        // Fallback to original parsing for ISO dates
        imageDate = new Date(image.date).toISOString().split('T')[0];
      }
    }
    setGalleryEditForm({ title: image.alt || '', description: image.description || '', date: imageDate });
    setIsEditingGallery(true);
  };

  const handleSaveGalleryImage = async () => {
    if (!sanityToken || !editingGalleryId) return;
    setIsUploading(true);
    try {
      await updateGalleryImage(editingGalleryId, galleryEditForm, sanityToken);
      setNotification("✅ Slika posodobljena!");
      setIsEditingGallery(false);
      setEditingGalleryId(null);
      setGalleryEditForm({ title: '', description: '', date: '' });
      loadGallery();
    } catch (e) {
      setNotification("❌ Napaka pri shranjevanju.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!sanityToken) return;
    if (!confirm("Ste prepričani, da želite izbrisati to sliko?")) return;
    setIsUploading(true);
    try {
      await deleteGalleryImage(id, sanityToken);
      setNotification("🗑️ Slika izbrisana.");
      loadGallery();
    } catch (e) {
      setNotification("❌ Napaka pri brisanju.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredProducts = products
    .filter(p => {
      const productName = p.name || '';
      return (filter === 'all' || p.category === filter) && productName.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'sl'));

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[60] bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Prijava</h1>
            <p className="text-gray-600">Biodinamična kmetija Černelič</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-olive focus:border-transparent"
                placeholder="Vnesite email naslov"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geslo
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-olive focus:border-transparent"
                placeholder="Vnesite geslo"
                required
              />
            </div>

            {loginError && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-olive text-white rounded-xl font-semibold hover:bg-olive/90 transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'Prijava...' : 'Prijava'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Nazaj na stran
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-cream overflow-auto">
      <div className="min-h-screen w-full max-w-7xl mx-auto flex flex-col font-sans">

        {/* Header */}
        <div className="bg-white border-b border-black/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20 safe-area-top shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-olive/50 font-bold">Kmetija Černelič</span>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl text-olive-dark">Upravljanje</h2>
              {!isLoadingProducts && (
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${connectionError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                  {connectionError ? 'Napaka' : 'Živo'}
                </div>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Odjava
          </button>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} className="text-olive-dark" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-black/5 overflow-x-auto">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'inventory' ? 'text-olive border-b-2 border-olive bg-olive/5' : 'text-olive/40'}`}><ShoppingBag size={16} />Zaloga</button>
          <button onClick={() => setActiveTab('orders')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'orders' ? 'text-olive border-b-2 border-olive bg-olive/5' : 'text-olive/40'}`}><ClipboardList size={16} />Naročila</button>
          <button onClick={() => setActiveTab('news')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'news' ? 'text-olive border-b-2 border-olive bg-olive/5' : 'text-olive/40'}`}><FileText size={16} />Novice</button>
          <button onClick={() => setActiveTab('videos')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'videos' ? 'text-olive border-b-2 border-olive bg-olive/5' : 'text-olive/40'}`}><Video size={16} />Video</button>
          <button onClick={() => setActiveTab('gallery')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'gallery' ? 'text-olive border-b-2 border-olive bg-olive/5' : 'text-olive/40'}`}><ImageIcon size={16} />Galerija</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'settings' ? 'text-olive border-b-2 border-olive bg-olive/5' : 'text-olive/40'}`}><Pencil size={16} />Nastavitve</button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-olive-dark text-white px-6 py-3 rounded-full shadow-xl z-50 animate-in fade-in slide-in-from-top-5 text-sm font-medium flex items-center gap-2 whitespace-nowrap">
            <Bell size={16} className="animate-bounce" />
            {notification}
          </div>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar pb-24">
            {/* ... Inventory UI (Same as before, simplified for brevity) ... */}
            {!isEditing ? (
              <>
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-lg text-olive-dark">Seznam Izdelkov</h3>
                      {filteredProducts.length > 0 && (
                        <label className="flex items-center gap-2 text-sm text-olive/70">
                          <input
                            type="checkbox"
                            checked={selectAllProducts}
                            onChange={handleSelectAllProducts}
                            className="rounded border-olive/30 text-olive focus:ring-olive"
                          />
                          <span>Označi vse</span>
                        </label>
                      )}
                    </div>
                    <button onClick={startAddProduct} className="bg-olive text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-md"><Plus size={16} /> Nov</button>
                  </div>

                  {/* Bulk Actions */}
                  {selectedProducts.size > 0 && (
                    <div className="flex gap-2 px-1">
                      <span className="text-sm text-olive/70 self-center">Izbrano: {selectedProducts.size}</span>
                      <button
                        onClick={() => handleBulkStatusChange('available')}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold uppercase hover:bg-green-600 transition-colors"
                      >
                        Na voljo
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('sold-out')}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold uppercase hover:bg-red-600 transition-colors"
                      >
                        Razprodano
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('coming-soon')}
                        className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-bold uppercase hover:bg-yellow-600 transition-colors"
                      >
                        Kmalu
                      </button>
                    </div>
                  )}

                  {/* Product Category Tabs */}
                  <div className="flex p-1 bg-gray-100 rounded-xl self-start">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === 'all' ? 'bg-white text-olive shadow-sm' : 'text-olive/50 hover:text-olive/70'}`}
                    >
                      Vsi
                    </button>
                    <button
                      onClick={() => setFilter('fresh')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === 'fresh' ? 'bg-white text-olive shadow-sm' : 'text-olive/50 hover:text-olive/70'}`}
                    >
                      Sveže (Vrtnine/Sadje)
                    </button>
                    <button
                      onClick={() => setFilter('dry')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === 'dry' ? 'bg-white text-olive shadow-sm' : 'text-olive/50 hover:text-olive/70'}`}
                    >
                      Shramba (Moke/Olja)
                    </button>
                  </div>
                </div>
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-2xl border border-black/5 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-olive/30 text-olive focus:ring-olive"
                        />
                        <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                        <div>
                          <h4 className="font-serif text-lg text-olive-dark leading-none mb-1">{product.name}</h4>
                          <p className="text-xs text-olive/50 font-medium">{product.price.toFixed(2)}€ / {product.unit}</p>
                          <button
                            onClick={() => startEditProduct(product)}
                            className="inline-flex items-center gap-2 mt-2 px-3 py-1 text-xs font-semibold text-olive/90 bg-olive/10 border border-olive/10 rounded-xl shadow-sm hover:bg-olive/20 transition-colors"
                          >
                            <Pencil size={14} /> Uredi
                          </button>
                        </div>
                      </div>
                      <button onClick={(e) => handleStatusToggle(e, product.id, product.status)} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                        <span className={`text-[10px] uppercase font-bold ${getProductStatusProps(product.status).text}`}>{getProductStatusProps(product.status).label}</span>
                        <div className={`w-3 h-3 rounded-full ${getProductStatusProps(product.status).color}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
                <div className="flex items-center gap-2 mb-6 text-olive/50 cursor-pointer" onClick={() => setIsEditing(false)}><ArrowLeft size={16} /><span className="text-xs font-bold uppercase">Nazaj</span></div>
                <div className="space-y-4">
                  {/* Simplified Image Input */}
                  <input type="file" onChange={handleImageSelect} className="mb-4" />
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Ime Izdelka" />
                  <div className="flex gap-2">
                    <input type="number" step="0.01" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="Cena" />
                    <select value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700">
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="kos">kos</option>
                      <option value="l">l</option>
                      <option value="pack">paket</option>
                    </select>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-olive/50 mb-1 block">Kategorija</label>
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value as 'fresh' | 'dry' })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700"
                    >
                      <option value="fresh">Sveže (Vrtnine in Sadje)</option>
                      <option value="dry">Shramba (Moke, Olja, Žita)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-olive/50 mb-1 block">Trenutna Zaloga</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                        value={editForm.quantity}
                        onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                        placeholder="npr. 50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-olive/50 mb-1 block">Max / Začetna Zaloga</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                        value={editForm.maxQuantity}
                        onChange={e => setEditForm({ ...editForm, maxQuantity: e.target.value })}
                        placeholder="npr. 100"
                      />
                      <p className="text-[9px] text-olive/40 mt-1">Za prikaz drsnika na strani</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editingId && <button onClick={handleDeleteProduct} className="p-4 bg-red-50 text-red-500 rounded-xl"><Trash2 size={20} /></button>}
                    <button onClick={handleSaveProduct} className="px-8 py-4 bg-olive text-white rounded-xl font-bold uppercase" style={{ minWidth: '120px' }} disabled={isUploading}>Shrani</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- NEWS TAB (RICH EDITOR) --- */}
        {activeTab === 'news' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 pb-24">

            {!isEditingNews ? (
              <>
                {/* News List */}
                <div className="flex justify-between items-center mb-2 px-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-lg text-olive-dark">Objavljene Novice ({posts.length})</h3>
                    {posts.length > 0 && (
                      <label className="flex items-center gap-2 text-sm text-olive/70">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="rounded border-olive/30 text-olive focus:ring-olive"
                        />
                        <span>Označi vse</span>
                      </label>
                    )}
                    <button onClick={loadPosts} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-olive transition-all">
                      <RefreshCw size={16} className={isLoadingPosts ? "animate-spin" : ""} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {selectedPosts.size > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-md hover:bg-red-600 transition-colors"
                        disabled={isUploading}
                      >
                        <Trash2 size={16} /> Izbriši ({selectedPosts.size})
                      </button>
                    )}
                    <button onClick={() => { setIsEditingNews(true); loadPosts(); }} className="bg-olive text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-md"><Plus size={16} /> Nova</button>
                  </div>
                </div>

                {isLoadingPosts ? (
                  <div className="text-center py-8 text-olive/50"><RefreshCw className="animate-spin mx-auto mb-2" size={24} /><p className="text-sm">Nalaganje...</p></div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center text-olive/50"><FileText size={32} className="mx-auto mb-2" /><p className="text-sm">Še ni objavljenih novic</p></div>
                ) : (
                  [...posts]
                    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                    .map((post) => (
                      <div key={post.id} className="bg-white p-4 rounded-2xl border border-black/5 flex flex-col gap-2 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center mr-3 mt-1">
                            <input
                              type="checkbox"
                              checked={selectedPosts.has(post.id)}
                              onChange={() => handleSelectPost(post.id)}
                              className="rounded border-olive/30 text-olive focus:ring-olive"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif text-lg text-olive-dark leading-tight mb-1">{post.title}</h4>
                            <p className="text-xs text-olive/50 font-medium mb-2">{new Date(post.publishedAt).toLocaleDateString('sl-SI')}</p>
                            <div className="flex gap-2">
                              <button onClick={() => startEditNews(post)} className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-olive/90 bg-olive/10 border border-olive/10 rounded-xl shadow-sm hover:bg-olive/20 transition-colors">
                                <Pencil size={14} /> Uredi
                              </button>
                              <button onClick={() => handleDeleteNews(post.id)} className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl shadow-sm hover:bg-red-100 transition-colors">
                                <Trash2 size={14} /> Izbriši
                              </button>
                            </div>
                          </div>
                          {post.image && <img src={post.image} className="w-16 h-16 rounded-lg object-cover bg-gray-50" />}
                        </div>
                      </div>
                    ))
                )}
              </>
            ) : (
              <div className={`bg-white rounded-3xl p-6 shadow-sm border border-black/5 ${!sanityToken ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-2 mb-6 text-olive/50 cursor-pointer" onClick={() => { setIsEditingNews(false); setEditingNewsId(null); setNewsForm({ title: '', date: new Date().toISOString().split('T')[0], link: '' }); setNewsImageFile(null); setNewsImagePreview(null); setNewsBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]); setNewsImages({}); }}><ArrowLeft size={16} /><span className="text-xs font-bold uppercase">Nazaj</span></div>

                <h3 className="font-serif text-xl text-olive-dark mb-4">{editingNewsId ? 'Uredi Objavo' : 'Nova Objava'}</h3>

                <div className="space-y-4">
                  {/* Main Header Image */}
                  <div className="relative h-40 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => newsImageRef.current?.click()}>
                    {newsImagePreview ? (
                      <img src={newsImagePreview} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-olive/40">
                        <ImageIcon size={32} />
                        <span className="text-xs font-bold uppercase mt-2">Naslovna Slika</span>
                      </div>
                    )}
                    <input type="file" ref={newsImageRef} className="hidden" accept="image/*" onChange={handleNewsImageSelect} />
                  </div>

                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta font-serif text-lg"
                    value={newsForm.title}
                    onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                    placeholder="Naslov Novice"
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase text-olive/50 ml-1">Datum objave (DD.MM.YYYY)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta font-sans"
                      value={newsForm.date}
                      onChange={e => setNewsForm({ ...newsForm, date: e.target.value })}
                      placeholder="npr. 29.11.2025"
                    />
                  </div>

                  {/* Block Editor Area */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-olive/50 block">Vsebina</label>

                    {newsBlocks.map((block, index) => (
                      <div key={block.id} className="relative group">
                        {block.type === 'text' && (
                          <div className="relative">
                            {/* Formatting Toolbar */}
                            <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-100 rounded-lg border border-gray-200">
                              <button onClick={() => formatText(block.id, 'bold')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Krepko">
                                <Bold size={14} />
                              </button>
                              <button onClick={() => formatText(block.id, 'italic')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Ležeče">
                                <Italic size={14} />
                              </button>
                              <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                              <button onClick={() => formatText(block.id, 'left')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Poravnava levo">
                                <AlignLeft size={14} />
                              </button>
                              <button onClick={() => formatText(block.id, 'center')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Sredinsko">
                                <AlignCenter size={14} />
                              </button>
                              <button onClick={() => formatText(block.id, 'right')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Poravnava desno">
                                <AlignRight size={14} />
                              </button>
                              <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                              <button onClick={() => insertColor(block.id)} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Barva besedila">
                                <Palette size={14} />
                              </button>
                              <button onClick={() => insertLink(block.id)} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi povezavo">
                                <LinkIcon size={14} />
                              </button>
                              <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    changeFontSize(block.id, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                className="text-xs bg-transparent border-none focus:ring-0 text-olive/70 font-medium cursor-pointer"
                              >
                                <option value="">Velikost</option>
                                <option value="2">Majhna</option>
                                <option value="3">Normalna</option>
                                <option value="4">Velika</option>
                                <option value="5">Zelo velika</option>
                                <option value="6">Ogromna</option>
                              </select>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    changeFontFamily(block.id, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                className="text-xs bg-transparent border-none focus:ring-0 text-olive/70 font-medium cursor-pointer"
                              >
                                <option value="">Pisava</option>
                                <option value="font-sans">Sans-Serif</option>
                                <option value="font-serif">Serif</option>
                                <option value="font-mono">Mono</option>
                              </select>
                              <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                              <button onClick={() => insertImageAtCursor(block.id)} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi sliko">
                                <ImageIcon size={14} />
                              </button>
                              <button onClick={() => insertVideoAtCursor(block.id)} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi video (YouTube)">
                                <Video size={14} />
                              </button>
                              <button onClick={() => insertButtonAtCursor(block.id)} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi gumb">
                                <MousePointerClick size={14} />
                              </button>
                            </div>

                            <div
                              ref={(el) => {
                                editorRefs.current[block.id] = el;
                                if (el && el.innerHTML === '' && block.content) {
                                  el.innerHTML = block.content;
                                }
                              }}
                              contentEditable
                              suppressContentEditableWarning
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta font-serif min-h-[300px] overflow-auto"
                              onPaste={(e) => {
                                e.preventDefault();
                                const text = e.clipboardData.getData('text/plain');
                                document.execCommand('insertText', false, text);
                              }}
                              style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                              }}
                            />
                          </div>
                        )}
                        {block.type !== 'text' && (
                          <div className="relative bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                            {block.preview ? (
                              <img src={block.preview} className="max-h-40 rounded-lg object-contain" />
                            ) : (
                              <div className="text-center py-4">
                                <ImageIcon className="mx-auto text-olive/30 mb-2" />
                                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleBlockImageSelect(block.id, e.target.files[0])} className="text-xs text-olive/60" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Remove Block Button */}
                        {newsBlocks.length > 1 && (
                          <button onClick={() => removeBlock(block.id)} className="absolute -right-2 -top-2 bg-red-100 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200">
                            <X size={14} />
                          </button>
                        )}

                        {block.type === 'button' && (
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-xs font-bold uppercase text-olive/50 mb-1 block">Besedilo gumba</label>
                              <input
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-terracotta"
                                value={block.text}
                                onChange={(e) => updateButtonBlock(block.id, 'text', e.target.value)}
                                placeholder="npr. Preberi več"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-bold uppercase text-olive/50 mb-1 block">Povezava (URL)</label>
                              <input
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-terracotta"
                                value={block.url}
                                onChange={(e) => updateButtonBlock(block.id, 'url', e.target.value)}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'customReact' && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs font-bold uppercase text-olive/50 mb-1 block">React koda (JavaScript)</label>
                              <textarea
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta font-mono min-h-[200px]"
                                value={block.code || ''}
                                onChange={(e) => updateBlockField(block.id, 'code', e.target.value)}
                                placeholder={`import React from 'react';
import RegenerativePost from '../components/blog/RegenerativePost';

export default function MyBlogComponent() {
  return (
    <RegenerativePost />
  );
}`}
                              />

                              {/* Code Validation Results */}
                              {codeValidation && codeValidation.blockId === block.id && (
                                <div className={`mt-3 rounded-xl p-4 border ${codeValidation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                  <div className="flex items-start gap-2">
                                    {codeValidation.isValid ? (
                                      <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 text-sm">
                                      {codeValidation.errors.length > 0 && (
                                        <div className="mb-2">
                                          <strong className="text-red-800">Napake:</strong>
                                          <ul className="mt-1 space-y-1">
                                            {codeValidation.errors.map((error, idx) => (
                                              <li key={idx} className="text-red-700 text-xs">• {error}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {codeValidation.suggestions.length > 0 && (
                                        <div>
                                          <strong className={codeValidation.errors.length > 0 ? 'text-blue-800' : 'text-green-800'}>
                                            {codeValidation.errors.length > 0 ? 'Predlogi:' : 'Izboljšave:'}
                                          </strong>
                                          <ul className="mt-1 space-y-1">
                                            {codeValidation.suggestions.map((suggestion, idx) => (
                                              <li key={idx} className={`text-xs ${codeValidation.errors.length > 0 ? 'text-blue-700' : 'text-green-700'}`}>
                                                • {suggestion}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                    {!codeValidation.isValid && codeValidation.errors.length > 0 && (
                                      <button
                                        onClick={() => applyAutoFix(block.id)}
                                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                                        title="Poskusi samodejno popraviti pogoste napake"
                                      >
                                        🔧 Popravi
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <div className="flex items-start gap-2">
                                <Code size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                  <strong>Živi urejevalnik:</strong> Komponenta se izvaja v živo - lahko takoj dodajate slike in vidite spremembe.
                                  Za RegenerativePost uporabite: <code className="bg-blue-100 px-1 rounded">import RegenerativePost from '../components/blog/RegenerativePost'; export default function MyComponent() {'{'} return &lt;RegenerativePost /&gt;; {'}'}</code>
                                  Sistem samodejno preveri sintakso in da predloge za izboljšave.
                                  Slike se samodejno shranijo skupaj z objavo.
                                </div>
                              </div>
                            </div>
                            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold uppercase text-olive/50">Živi urejevalnik komponente</label>
                                {Object.keys(newsImages).length > 0 && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    📸 {Object.keys(newsImages).length} slik naloženih
                                  </span>
                                )}
                              </div>
                              {block.code ? (
                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                  <DynamicReactRenderer
                                    code={block.code}
                                    imageData={newsImages}
                                    onImageUpload={handleNewsImageUpload}
                                    sanityToken={sanityToken}
                                  />
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Code size={32} className="mx-auto mb-2 opacity-50" />
                                  <p>Vnesite React kodo zgoraj, da vidite komponento v živo</p>
                                </div>
                              )}
                              {Object.keys(newsImages).length > 0 && (
                                <div className="mt-3 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
                                  💡 <strong>Nasvet:</strong> Slike so shranjene v komponenti. Kliknite "Shrani" na dnu strani, da shranite objavo s slikami.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Block Type Selector */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="text-xs font-bold uppercase text-olive/50 mb-3 block">Dodaj nov blok</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={addTextBlock}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                      >
                        <Type size={16} />
                        Besedilo
                      </button>
                      <button
                        onClick={addImageBlock}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                      >
                        <ImageIcon size={16} />
                        Slika
                      </button>
                      <button
                        onClick={addButtonBlock}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                      >
                        <MousePointerClick size={16} />
                        Gumb
                      </button>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={addCustomReactBlock}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm hover:bg-blue-100 transition-colors text-blue-700"
                        >
                          <Code size={16} />
                          Interaktivna komponenta
                        </button>
                        <button
                          onClick={() => addCustomReactBlock('gallery')}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm hover:bg-purple-100 transition-colors text-purple-700"
                        >
                          <ImageIcon size={16} />
                          Galerija slik
                        </button>
                        <button
                          onClick={() => addCustomReactBlock('form')}
                          className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm hover:bg-green-100 transition-colors text-green-700"
                        >
                          <FileText size={16} />
                          Kontakt obrazec
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    {editingNewsId && <button onClick={handleDeleteNews} className="p-4 bg-red-50 text-red-500 rounded-xl"><Trash2 size={20} /></button>}
                    <button
                      onClick={handleSaveNews}
                      disabled={isUploading}
                      className="flex-1 bg-olive text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-olive-dark transition-all flex items-center justify-center gap-2 relative"
                    >
                      {isUploading ? <RefreshCw className="animate-spin" /> : <Send size={16} />}
                      {editingNewsId ? 'Posodobi' : 'Objavi'}
                      {Object.keys(newsImages).length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {Object.keys(newsImages).length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 pb-24">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-serif text-2xl text-olive-dark mb-1 flex items-center gap-2">
                  Upravljanje Naročil
                  {orders.filter(o => o.status === 'pending').length > 0 && (
                    <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold">
                      {orders.filter(o => o.status === 'pending').length} novih
                    </span>
                  )}
                </h2>
                <p className="text-olive/60 text-sm">Pregled in urejanje prejetih povpraševanj.</p>
              </div>
              <button
                onClick={loadOrders}
                className="p-3 bg-white rounded-full shadow-md hover:shadow-lg text-olive transition-all"
                title="Osveži"
              >
                <RefreshCw size={20} className={isLoadingOrders ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-olive/40" size={18} />
                <input
                  type="text"
                  placeholder="Išči po imenu ali emailu..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-olive transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setOrderStatusFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${orderStatusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white text-olive/60 hover:bg-yellow-50'}`}
              >
                V čakanju ({orders.filter(o => o.status === 'pending').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('in-preparation')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${orderStatusFilter === 'in-preparation' ? 'bg-green-500 text-white' : 'bg-white text-olive/60 hover:bg-green-50'}`}
              >
                V pripravi ({orders.filter(o => o.status === 'in-preparation').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('ready-for-pickup')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${orderStatusFilter === 'ready-for-pickup' ? 'bg-cyan-500 text-white' : 'bg-white text-olive/60 hover:bg-cyan-50'}`}
              >
                Pripravljeno ({orders.filter(o => o.status === 'ready-for-pickup').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('completed')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${orderStatusFilter === 'completed' ? 'bg-emerald-500 text-white' : 'bg-white text-olive/60 hover:bg-emerald-50'}`}
              >
                Zaključeno ({orders.filter(o => o.status === 'completed').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('rejected')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${orderStatusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-white text-olive/60 hover:bg-red-50'}`}
              >
                Zavrnjeno ({orders.filter(o => o.status === 'rejected').length})
              </button>
            </div>

            {/* Pickup Location Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setPickupLocationFilter('home')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${pickupLocationFilter === 'home' ? 'bg-blue-500 text-white' : 'bg-white text-olive/60 hover:bg-blue-50'}`}
              >
                Prevzem doma ({orders.filter(o => o.pickupLocation === 'home').length})
              </button>
              <button
                onClick={() => setPickupLocationFilter('market')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${pickupLocationFilter === 'market' ? 'bg-purple-500 text-white' : 'bg-white text-olive/60 hover:bg-purple-50'}`}
              >
                Prevzem tržnica ({orders.filter(o => o.pickupLocation === 'market').length})
              </button>
            </div>

            {isLoadingOrders ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-olive"></div>
                <p className="mt-4 text-olive/60">Nalaganje naročil...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-black/5 shadow-sm">
                <ClipboardList size={48} className="mx-auto text-olive/20 mb-4" />
                <h3 className="text-xl text-olive-dark font-serif mb-2">Ni novih naročil</h3>
                <p className="text-olive/60">Trenutno ni nobenih oddanih povpraševanj.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {(orders || [])
                  .filter(order => {
                    // If searching, search across all statuses and locations
                    if (orderSearchTerm) {
                      const searchLower = orderSearchTerm.toLowerCase();
                      const matchesSearch = (
                        order.customer.name.toLowerCase().includes(searchLower) ||
                        order.customer.email.toLowerCase().includes(searchLower)
                      );
                      const matchesLocation = pickupLocationFilter === 'all' || order.pickupLocation === pickupLocationFilter;
                      return matchesSearch && matchesLocation;
                    }
                    // If not searching, filter by selected status and location
                    const matchesStatus = order.status === orderStatusFilter;
                    const matchesLocation = pickupLocationFilter === 'all' || order.pickupLocation === pickupLocationFilter;
                    return matchesStatus && matchesLocation;
                  })
                  .map((order) => {
                    // Calculate stock status for this order
                    const { allAvailable, itemsWithStock } = checkOrderStock(order.items);

                    return (
                      <div key={order.id} className="bg-white rounded-[2rem] p-6 border border-black/5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          {/* Order Header & Customer Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{order.orderNumber}</span>
                              <span className="text-xs text-olive/40 uppercase tracking-widest font-bold">
                                {new Date(order.createdAt).toLocaleString('sl-SI')}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                order.status === 'in-preparation' ? 'bg-green-50 text-green-600 border-green-200' :
                                  order.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                    order.status === 'ready-for-pickup' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' :
                                      'bg-emerald-50 text-emerald-600 border-emerald-200'
                                }`}>
                                {order.status === 'pending' ? 'V čakanju' :
                                  order.status === 'in-preparation' ? 'V pripravi' :
                                    order.status === 'rejected' ? 'Zavrnjeno' :
                                      order.status === 'ready-for-pickup' ? 'Pripravljeno' : 'Zaključeno'}
                              </span>

                              {/* Stock Availability Badge (Only for Pending orders) */}
                              {order.status === 'pending' && (
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${allAvailable ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                  {allAvailable ? <Check size={12} /> : <AlertTriangle size={12} />}
                                  {allAvailable ? 'Zaloga OK' : 'Ni zaloge'}
                                </span>
                              )}
                            </div>

                            <h3 className="font-serif text-xl text-olive-dark mb-1">{order.customer.name}</h3>
                            <div className="text-sm text-olive/60 space-y-1 mb-4">
                              <p className="flex items-center gap-2"><span className="w-4"><Send size={12} /></span> {order.customer.email}</p>
                              <p className="flex items-center gap-2"><span className="w-4"><Bell size={12} /></span> {order.customer.phone}</p>
                              <p className="flex items-center gap-2"><span className="w-4">📍</span>
                                {order.pickupLocation === 'home' ? 'Prevzem na kmetiji' :
                                  order.pickupLocation === 'market' ? 'Prevzem na tržnici Ljubljana' :
                                    'Prevzem ni določen'}
                              </p>
                            </div>

                            {order.note && (
                              <div className="bg-cream/50 p-3 rounded-xl text-sm text-olive/80 italic border border-olive/5">
                                "{order.note}"
                              </div>
                            )}
                          </div>

                          {/* Order Items */}
                          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-olive/40 mb-3">Naročeno</h4>
                            <div className="space-y-2 mb-4">
                              {itemsWithStock.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-olive-dark flex items-center gap-2">
                                    <span className="font-bold text-terracotta">{item.quantity}x</span>
                                    <span>{item.name}</span>
                                    {/* Stock Info */}
                                    {order.status === 'pending' && (
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.isEnough ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'}`}>
                                        (Zaloga: {item.currentStock} {item.unit})
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-olive/60">{(item.price * item.quantity).toFixed(2)}€</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                              <span className="font-bold text-olive-dark">Skupaj</span>
                              <span className="font-serif text-xl text-olive-dark">{order.total.toFixed(2)}€</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                            {/* Pending: Can approve or reject */}
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleOrderStatus(order.id, 'in-preparation')}
                                  className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                >
                                  <Check size={14} /> Potrdi
                                </button>
                                <button
                                  onClick={() => handleOrderStatus(order.id, 'rejected')}
                                  className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                >
                                  <X size={14} /> Zavrni
                                </button>
                              </>
                            )}

                            {/* In Preparation: Can mark ready or reject */}
                            {order.status === 'in-preparation' && (
                              <>
                                <button
                                  onClick={() => handleOrderStatus(order.id, 'ready-for-pickup')}
                                  className="w-full bg-cyan-50 text-cyan-700 hover:bg-cyan-100 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                >
                                  📦 Pripravljeno
                                </button>
                                <button
                                  onClick={() => handleOrderStatus(order.id, 'rejected')}
                                  className="w-full bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                >
                                  <X size={14} /> Zavrni
                                </button>
                              </>
                            )}

                            {/* Ready for Pickup: Can complete or go back to preparation */}
                            {order.status === 'ready-for-pickup' && (
                              <>
                                <button
                                  onClick={() => handleOrderStatus(order.id, 'completed')}
                                  className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                >
                                  ✅ Zaključi
                                </button>
                                <button
                                  onClick={() => handleOrderStatus(order.id, 'in-preparation')}
                                  className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                >
                                  ← V pripravo
                                </button>
                              </>
                            )}

                            {/* Final statuses: No actions */}
                            {(order.status === 'rejected' || order.status === 'completed') && (
                              <div className="text-center text-xs text-olive/40 italic py-2">
                                {order.status === 'rejected' ? 'Zavrnjeno' : 'Zaključeno'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* --- VIDEO GALLERY TAB --- */}
        {activeTab === 'videos' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 pb-24">

            {!isEditingVideo ? (
              <>
                {/* Video List */}
                <div className="flex justify-between items-center mb-2 px-1">
                  <h3 className="font-serif text-lg text-olive-dark">Video Galerija</h3>
                  <button onClick={() => { setIsEditingVideo(true); setEditingVideoId(null); setVideoForm({ title: '', videoId: '', category: '' }); }} className="bg-olive text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-md"><Plus size={16} /> Dodaj Video</button>
                </div>

                {isLoadingVideos ? (
                  <div className="text-center py-8 text-olive/50"><RefreshCw className="animate-spin mx-auto mb-2" size={24} /><p className="text-sm">Nalaganje...</p></div>
                ) : videos.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center text-olive/50"><Video size={32} className="mx-auto mb-2" /><p className="text-sm">Še ni dodanih videov</p></div>
                ) : (
                  videos.map((video) => (
                    <div key={video.id} className="bg-white p-4 rounded-2xl border border-black/5 flex flex-col gap-2 shadow-sm">
                      <div className="flex items-start gap-4">
                        <img src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} className="w-24 h-16 rounded-lg object-cover bg-gray-50" alt={video.title} />
                        <div className="flex-1">
                          <h4 className="font-serif text-lg text-olive-dark leading-tight mb-1">{video.title}</h4>
                          {video.category && <p className="text-xs text-olive/50 font-medium mb-1">{video.category}</p>}
                          <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-terracotta hover:underline">Poglej na YouTube</a>
                          <button onClick={() => startEditVideo(video)} className="inline-flex items-center gap-2 mt-2 px-3 py-1 text-xs font-semibold text-olive/90 bg-olive/10 border border-olive/10 rounded-xl shadow-sm hover:bg-olive/20 transition-colors">
                            <Pencil size={14} /> Uredi
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div className={`bg-white rounded-3xl p-6 shadow-sm border border-black/5 ${!sanityToken ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-2 mb-6 text-olive/50 cursor-pointer" onClick={() => { setIsEditingVideo(false); setEditingVideoId(null); setVideoForm({ title: '', videoId: '', category: '' }); }}><ArrowLeft size={16} /><span className="text-xs font-bold uppercase">Nazaj</span></div>

                <h3 className="font-serif text-xl text-olive-dark mb-4">{editingVideoId ? 'Uredi Video' : 'Dodaj Video'}</h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta"
                    value={videoForm.title}
                    onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                    placeholder="Naslov videa"
                  />

                  <div>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta"
                      value={videoForm.videoId}
                      onChange={e => setVideoForm({ ...videoForm, videoId: e.target.value })}
                      placeholder="YouTube URL ali Video ID (npr. dQw4w9WgXcQ)"
                    />
                    <p className="text-xs text-olive/50 mt-1 px-2">Vnesite celoten YouTube URL ali samo 11-mestni video ID</p>
                  </div>

                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta"
                    value={videoForm.category}
                    onChange={e => setVideoForm({ ...videoForm, category: e.target.value })}
                    placeholder="Kategorija (neobvezno)"
                  />

                  <div className="flex gap-2 mt-6">
                    {editingVideoId && <button onClick={handleDeleteVideo} className="p-4 bg-red-50 text-red-500 rounded-xl"><Trash2 size={20} /></button>}
                    <button
                      onClick={handleSaveVideo}
                      disabled={isUploading}
                      className="flex-1 bg-olive text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-olive-dark transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? <RefreshCw className="animate-spin" /> : <Save size={16} />}
                      {editingVideoId ? 'Posodobi' : 'Dodaj'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* --- GALLERY TAB --- */}
        {activeTab === 'gallery' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 pb-24">

            {!isEditingGallery ? (
              <>
                {/* Upload Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 mb-6">
                  <h3 className="font-serif text-xl text-olive-dark mb-4 flex items-center gap-2"><Upload size={20} /> Naloži nove fotografije</h3>
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" multiple />
                  <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-olive/20 rounded-2xl p-8 flex flex-col items-center justify-center text-olive/60 hover:border-olive transition-all">
                    <ImageIcon size={32} />
                    <span className="mt-2 text-xs font-bold uppercase">Izberi slike</span>
                  </button>

                  {/* Pending uploads with title input */}
                  {pendingUploads.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-bold text-olive-dark">Pripravljene slike ({pendingUploads.length})</h4>
                      {pendingUploads.map((upload, idx) => (
                        <div key={idx} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl">
                          <div className="flex items-center gap-3">
                            <img src={upload.src} className="w-16 h-16 object-cover rounded-lg" alt="Preview" />
                            <input
                              type="text"
                              placeholder="Naslov slike..."
                              value={upload.description}
                              onChange={(e) => {
                                const updated = [...pendingUploads];
                                updated[idx].description = e.target.value;
                                setPendingUploads(updated);
                              }}
                              className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                              onClick={() => setPendingUploads(prev => prev.filter((_, i) => i !== idx))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <input
                            type="date"
                            value={upload.date}
                            onChange={(e) => {
                              const updated = [...pendingUploads];
                              updated[idx].date = e.target.value;
                              setPendingUploads(updated);
                            }}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      ))}
                      <button
                        onClick={handleUploadConfirm}
                        className="w-full bg-olive text-white py-4 rounded-2xl font-bold uppercase shadow-lg hover:bg-olive-dark"
                        disabled={isUploading}
                      >
                        {isUploading ? 'Nalaganje...' : 'Objavi vse'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Gallery List */}
                <div className="flex justify-between items-center mb-2 px-1">
                  <h3 className="font-serif text-lg text-olive-dark">Vse slike ({galleryImages.length})</h3>
                  <button onClick={loadGallery} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-olive transition-all">
                    <RefreshCw size={16} className={isLoadingGallery ? "animate-spin" : ""} />
                  </button>
                </div>

                {isLoadingGallery ? (
                  <div className="text-center py-8 text-olive/50">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-sm">Nalaganje...</p>
                  </div>
                ) : galleryImages.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center text-olive/50">
                    <ImageIcon size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Še ni naloženih slik</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((image) => (
                      <div key={image.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        <div className="relative aspect-square">
                          <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEditGalleryImage(image)}
                              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Pencil size={16} className="text-olive" />
                            </button>
                            <button
                              onClick={() => handleDeleteGalleryImage(image.id)}
                              className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-olive-dark truncate">{image.alt}</p>
                          {image.description && <p className="text-xs text-olive/60 truncate">{image.description}</p>}
                          {image.date && <p className="text-xs text-olive/40 mt-1">{parseEuropeanDate(image.date)?.toLocaleDateString('sl-SI')}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={`bg-white rounded-3xl p-6 shadow-sm border border-black/5 ${!sanityToken ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-2 mb-6 text-olive/50 cursor-pointer" onClick={() => { setIsEditingGallery(false); setEditingGalleryId(null); setGalleryEditForm({ title: '', description: '', date: '' }); }}>
                  <ArrowLeft size={16} />
                  <span className="text-xs font-bold uppercase">Nazaj</span>
                </div>

                <h3 className="font-serif text-xl text-olive-dark mb-4">Uredi sliko</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-olive/50 block mb-2">Naslov</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta"
                      value={galleryEditForm.title}
                      onChange={e => setGalleryEditForm({ ...galleryEditForm, title: e.target.value })}
                      placeholder="Naslov slike"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-olive/50 block mb-2">Opis (neobvezno)</label>
                    <textarea
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta min-h-[100px] resize-y"
                      value={galleryEditForm.description}
                      onChange={e => setGalleryEditForm({ ...galleryEditForm, description: e.target.value })}
                      placeholder="Opis slike..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-olive/50 block mb-2">Datum</label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta"
                      value={galleryEditForm.date}
                      onChange={e => setGalleryEditForm({ ...galleryEditForm, date: e.target.value })}
                    />
                  </div>

                  <button
                    onClick={handleSaveGalleryImage}
                    disabled={isUploading}
                    className="w-full bg-olive text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-olive-dark transition-all flex items-center justify-center gap-2"
                  >
                    {isUploading ? <RefreshCw className="animate-spin" /> : <Save size={16} />}
                    Shrani
                  </button>
                </div>
              </div>
            )}
          </div>
        )}





        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-24">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl text-olive-dark mb-6 flex items-center gap-3">
                <Pencil size={24} />
                Nastavitve Spletne Strani
              </h2>

              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h3 className="font-serif text-lg text-olive-dark mb-4 flex items-center gap-2">
                  <ShoppingBag size={20} />
                  Košarica in Naročila
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-cream/50 rounded-2xl">
                    <div>
                      <label className="font-medium text-olive-dark text-sm">
                        Omogoči košarico na spletni strani
                      </label>
                      <p className="text-xs text-olive/60 mt-1">
                        Če je izklopljeno, se sekcija naročil ne bo prikazovala
                      </p>
                    </div>
                    <button
                      onClick={() => saveCartSetting(!cartEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cartEnabled ? 'bg-olive' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cartEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>

                  <div className="text-sm text-olive/60 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Nasvet:</strong> Izklopi košarico kadar ni ničesar na zalogi ali med vzdrževanjem.
                        Obiskovalci bodo videli samo kontaktne podatke.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Settings */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mt-6">
                <h3 className="font-serif text-lg text-olive-dark mb-4 flex items-center gap-2">
                  <Lock size={20} />
                  API Povezava
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-olive-dark text-sm block mb-2">
                      Sanity API Token
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={sanityToken}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta pr-10"
                        placeholder="sk-..."
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-olive/40">
                        {verifyingToken ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-terracotta"></div>
                        ) : sanityToken && tokenVerified === true ? (
                          <Check size={16} className="text-green-500" />
                        ) : sanityToken && tokenVerified === false ? (
                          <AlertTriangle size={16} className="text-red-500" />
                        ) : sanityToken ? (
                          <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                        ) : (
                          <AlertTriangle size={16} className="text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {tokenVerified === false
                        ? 'API ključ nima pravic za ustvarjanje. Pojdite v Sanity.io -> API -> Tokens in dodajte "Create" pravice.'
                        : 'API ključ potrebuje "Create" pravice za slike in dokumente.'
                      }
                    </p>
                    <p className="text-xs text-olive/60 mt-2">
                      Token je potreben za urejanje zaloge in nalaganje slik. Če je polje prazno, se uporabi sistemska nastavitev.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminInventory;


import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Search, RefreshCw, ShoppingBag, ClipboardList, Bell, Image as ImageIcon, Upload, Trash2, Pencil, ArrowLeft, AlertTriangle, Plus, Lock, Send, Eye, EyeOff, FileText, Type, Video, Check, LogOut } from 'lucide-react';
import { GalleryItem, PreOrderItem, NewsItem, VideoGalleryItem, Order } from '../types';
import { uploadImageToSanity, fetchProducts, updateProductStatus, createProduct, updateProduct, deleteProduct, createNewsPost, fetchAllNews, updateNewsPost, deleteNewsPost, fetchVideoGallery, createVideo, updateVideo, deleteVideo, fetchOrders, updateOrderStatus, deleteOrder, fetchGalleryImages, updateGalleryImage, deleteGalleryImage } from '../sanityClient';
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
import { createClient } from '@sanity/client';
import { sanityConfig } from '../sanityConfig';

// Order management

interface AdminProps {
  onClose: () => void;
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
  type: 'text' | 'image';
  content?: string;
  file?: File;
  preview?: string;
}

const AdminInventory: React.FC<AdminProps> = ({ onClose, currentImages = [], onAddImage, onDeleteImage }) => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_session'));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'gallery' | 'news' | 'videos' | 'settings'>('inventory');
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

  // Update token when it changes in settings
  const handleTokenChange = (newToken: string) => {
    setSanityToken(newToken);
    localStorage.setItem('sanityToken', newToken);
  };

  // Inventory State
  const [products, setProducts] = useState<PreOrderItem[]>([]);
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
  const [newsForm, setNewsForm] = useState({ title: '', date: new Date().toISOString().split('T')[0] });
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
    }
  }, [activeTab]);

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

  const removeBlock = (id: string) => {
    setNewsBlocks(newsBlocks.filter(b => b.id !== id));
  };

  const updateBlockContent = (id: string, content: string) => {
    setNewsBlocks(newsBlocks.map(b => b.id === id ? { ...b, content } : b));
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
    setNewsForm({ title: post.title, date: post.publishedAt });
    setNewsImagePreview(post.image);
    setNewsImageFile(null);

    // Convert body back to blocks for editing
    const blocks: NewsBlock[] = [];
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
        }
      });
    }
    setNewsBlocks(blocks.length > 0 ? blocks : [{ id: Date.now().toString(), type: 'text', content: '' }]);
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
        if (block.type === 'text' && block.content?.trim()) {
          finalBody.push({
            _type: 'block',
            _key: block.id,
            style: 'normal',
            children: [{
              _type: 'span',
              _key: `${block.id}-span`,
              text: block.content
            }]
          });
        } else if (block.type === 'image' && block.file) {
          // Upload inline image
          const asset = await authClient.assets.upload('image', block.file, { filename: block.file.name });
          finalBody.push({
            _type: 'image',
            _key: block.id,
            asset: { _type: 'reference', _ref: asset._id }
          });
        }
      }

      if (editingNewsId) {
        // Update existing post
        await updateNewsPost(editingNewsId, {
          title: newsForm.title,
          date: newsForm.date,
          body: finalBody
        }, newsImageFile, sanityToken);
        setNotification("✅ Novica posodobljena!");
      } else {
        // Create new post
        await createNewsPost({
          title: newsForm.title,
          date: newsForm.date,
          body: finalBody
        }, newsImageFile, sanityToken);
        setNotification("✅ Novica uspešno objavljena!");
      }

      // Reset
      setNewsForm({ title: '', date: new Date().toISOString().split('T')[0] });
      setNewsImageFile(null);
      setNewsImagePreview(null);
      setNewsBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
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
        setNewsForm({ title: '', date: new Date().toISOString().split('T')[0] });
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

  const filteredProducts = products.filter(p => {
    const productName = p.name || '';
    return (filter === 'all' || p.category === filter) && productName.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
                <div className="flex justify-between items-center mb-2 px-1">
                  <h3 className="font-serif text-lg text-olive-dark">Seznam Izdelkov</h3>
                  <button onClick={startAddProduct} className="bg-olive text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-md"><Plus size={16} /> Nov</button>
                </div>
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-2xl border border-black/5 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2 mb-6 text-olive/50 cursor-pointer" onClick={() => { setIsEditingNews(false); setEditingNewsId(null); setNewsForm({ title: '', date: new Date().toISOString().split('T')[0] }); setNewsImageFile(null); setNewsImagePreview(null); setNewsBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]); }}><ArrowLeft size={16} /><span className="text-xs font-bold uppercase">Nazaj</span></div>

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
                    <label className="text-xs font-bold uppercase text-olive/50 ml-1">Datum objave</label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta font-sans"
                      value={newsForm.date}
                      onChange={e => setNewsForm({ ...newsForm, date: e.target.value })}
                    />
                  </div>

                  {/* Block Editor Area */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-olive/50 block">Vsebina</label>

                    {newsBlocks.map((block, index) => (
                      <div key={block.id} className="relative group">
                        {block.type === 'text' ? (
                          <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta min-h-[100px] resize-y"
                            value={block.content}
                            onChange={e => updateBlockContent(block.id, e.target.value)}
                            placeholder="Napišite odstavek..."
                          />
                        ) : (
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
                      </div>
                    ))}

                    {/* Add Block Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button onClick={addTextBlock} className="flex-1 py-2 border border-olive/20 rounded-xl text-olive/70 text-xs font-bold uppercase hover:bg-olive/5 flex items-center justify-center gap-2">
                        <Type size={14} /> Dodaj Besedilo
                      </button>
                      <button onClick={addImageBlock} className="flex-1 py-2 border border-olive/20 rounded-xl text-olive/70 text-xs font-bold uppercase hover:bg-olive/5 flex items-center justify-center gap-2">
                        <ImageIcon size={14} /> Dodaj Sliko
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    {editingNewsId && <button onClick={handleDeleteNews} className="p-4 bg-red-50 text-red-500 rounded-xl"><Trash2 size={20} /></button>}
                    <button
                      onClick={handleSaveNews}
                      disabled={isUploading}
                      className="flex-1 bg-olive text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-olive-dark transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? <RefreshCw className="animate-spin" /> : <Send size={16} />}
                      {editingNewsId ? 'Posodobi' : 'Objavi'}
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
                        {sanityToken ? <Check size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-yellow-500" />}
                      </div>
                    </div>
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

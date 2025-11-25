import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Search, RefreshCw, ShoppingBag, ClipboardList, Settings, Bell, Image as ImageIcon, Upload, Trash2, Pencil, ArrowLeft, AlertTriangle, Plus, Lock, Send, Eye, EyeOff, FileText, Type, Video } from 'lucide-react';
import { GalleryItem, PreOrderItem, NewsItem, VideoGalleryItem, Order } from '../types';
import { uploadImageToSanity, fetchProducts, updateProductStatus, createProduct, updateProduct, deleteProduct, createNewsPost, fetchAllNews, updateNewsPost, deleteNewsPost, fetchVideoGallery, createVideo, updateVideo, deleteVideo, fetchOrders, updateOrderStatus } from '../sanityClient';
import { createClient } from '@sanity/client';
import { sanityConfig } from '../sanityConfig';

interface AdminProps {
  onClose: () => void;
  currentImages?: GalleryItem[];
  onAddImage?: (img: GalleryItem) => void;
  onDeleteImage?: (id: string) => void;
}

const AdminInventory: React.FC<AdminProps> = ({ onClose, currentImages = [], onAddImage, onDeleteImage }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'gallery' | 'news' | 'videos' | 'settings'>('inventory');

  // Settings / API Token State
  const [sanityToken, setSanityToken] = useState(localStorage.getItem('sanity_token') || 'skfLb49oZf7DkswLGeSd8OgU4lrwWApK141Xcd0AOoeeM8gROXL045ZlHcWB0tgfQc4foFr0M72H95j7NwPdBqbb2w8ut4cXqVfhrPGExcUyatX6WNdk31jx1R4g3SBAeGIlUhRNFJfCvBQw5hIgHQx6negfr5annw1QeQTgH6CbZBAaQFqw');
  const [showToken, setShowToken] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // --- Initialize ---
  useEffect(() => {
    const savedToken = localStorage.getItem('sanity_token');
    if (savedToken) setSanityToken(savedToken);
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const token = localStorage.getItem('sanity_token');
      if (token) {
        const data = await fetchOrders(token);
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('sanity_token');
      if (!token) {
        alert('Admin token ni nastavljen. Kontaktirajte podporo.');
        return;
      }

      const success = await updateOrderStatus(orderId, newStatus, token);
      if (success) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        ));
        setNotification(`✅ Status naročila posodobljen na "${newStatus}".`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert('Napaka pri posodabljanju statusa.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Napaka pri posodabljanju statusa naročila.');
    }
  };

  const handleSaveToken = () => {
    localStorage.setItem('sanity_token', sanityToken);
    setNotification("🔑 Token shranjen!");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h1 className="font-serif text-2xl text-olive-dark">Admin Panel</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="p-6 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-3xl text-olive-dark mb-2">Upravljanje Naročil</h2>
                  <p className="text-olive/60">Pregled in urejanje prejetih povpraševanj.</p>
                </div>
                <button
                  onClick={loadOrders}
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg text-olive transition-all"
                  title="Osveži"
                >
                  <RefreshCw size={20} className={isLoadingOrders ? "animate-spin" : ""} />
                </button>
              </div>

              {isLoadingOrders ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-olive"></div>
                  <p className="mt-4 text-olive/60">Nalaganje naročil...</p>
                </div>
              ) : (!orders || orders.length === 0) ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-black/5 shadow-sm">
                  <ClipboardList size={48} className="mx-auto text-olive/20 mb-4" />
                  <h3 className="text-xl text-olive-dark font-serif mb-2">Ni novih naročil</h3>
                  <p className="text-olive/60">Trenutno ni nobenih oddanih povpraševanj.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {orders.map((order) => (
                    <div key={order.id || order._id} className="bg-white rounded-[2rem] p-6 border border-black/5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">
                              #{order.orderNumber || order._id}
                            </span>
                            <span className="text-xs text-olive/40 uppercase tracking-widest font-bold">
                              {new Date(order.createdAt).toLocaleString('sl-SI')}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                              order.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                              order.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                              order.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                              {order.status === 'pending' ? 'V obdelavi' :
                               order.status === 'approved' ? 'Potrjeno' :
                               order.status === 'rejected' ? 'Zavrnjeno' : 'Zaključeno'}
                            </span>
                          </div>

                          <h3 className="font-serif text-xl text-olive-dark mb-1">{order.customer.name}</h3>
                          <div className="text-sm text-olive/60 space-y-1 mb-4">
                            <p className="flex items-center gap-2"><span className="w-4"><Send size={12} /></span> {order.customer.email}</p>
                            <p className="flex items-center gap-2"><span className="w-4"><Bell size={12} /></span> {order.customer.phone}</p>
                          </div>

                          {order.note && (
                            <div className="bg-cream/50 p-3 rounded-xl text-sm text-olive/80 italic border border-olive/5">
                              "{order.note}"
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleOrderStatus(order.id, 'approved')}
                                className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                              >
                                <Check size={14} /> Potrdi
                              </button>
                              <button
                                onClick={() => handleOrderStatus(order.id, 'rejected')}
                                className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                              >
                                <X size={14} /> Zavrni
                              </button>
                            </>
                          )}
                          {order.status !== 'pending' && (
                            <div className="text-center text-xs text-olive/40 italic py-2">
                              Status urejen
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="p-6 bg-gray-50">
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                <h3 className="font-serif text-lg text-olive-dark mb-4">API Konfiguracija</h3>
                <div className="relative mb-4">
                  <input
                    type={showToken ? "text" : "password"}
                    value={sanityToken}
                    onChange={(e) => setSanityToken(e.target.value)}
                    placeholder="Vnesite Sanity API token"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
                  />
                  <button onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button onClick={handleSaveToken} className="w-full py-3 bg-olive text-white rounded-xl text-xs font-bold uppercase">
                  Shrani povezavo
                </button>

                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mt-4">
                  <div className="font-medium mb-1">Status povezave:</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${localStorage.getItem('sanity_token') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{localStorage.getItem('sanity_token') ? 'Povezan' : 'Ni povezan'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-olive/10 bg-white">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'inventory' ? 'text-olive border-t-2 border-olive bg-olive/5' : 'text-olive/40'}`}>
            <ShoppingBag size={16} />Izdelki
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'orders' ? 'text-olive border-t-2 border-olive bg-olive/5' : 'text-olive/40'}`}>
            <ClipboardList size={16} />Naročila
          </button>
          <button onClick={() => setActiveTab('gallery')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'gallery' ? 'text-olive border-t-2 border-olive bg-olive/5' : 'text-olive/40'}`}>
            <ImageIcon size={16} />Galerija
          </button>
          <button onClick={() => setActiveTab('news')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'news' ? 'text-olive border-t-2 border-olive bg-olive/5' : 'text-olive/40'}`}>
            <FileText size={16} />Novice
          </button>
          <button onClick={() => setActiveTab('videos')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'videos' ? 'text-olive border-t-2 border-olive bg-olive/5' : 'text-olive/40'}`}>
            <Video size={16} />Video
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-2 transition-colors ${activeTab === 'settings' ? 'text-olive border-t-2 border-olive bg-olive/5' : 'text-olive/40'}`}>
            <Settings size={16} />Nastavitve
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow-lg">
            {notification}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;

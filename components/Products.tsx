import React, { useState, useEffect, useRef } from 'react';
import { PREORDER_PRODUCTS } from '../constants';
import { PreOrderItem } from '../types';
import FadeIn from './FadeIn';
import { ShoppingCart, X, Plus, Minus, Check, ArrowRight, Info, ShoppingBag, Truck, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { submitOrder, fetchProducts } from '../sanityClient';

// --- Type Definitions & Helpers ---

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-olive-dark border-green-200';
    case 'sold-out': return 'bg-red-50 text-red-600 border-red-200';
    case 'coming-soon': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    default: return 'bg-gray-100';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return 'Na Voljo';
    case 'sold-out': return 'Razprodano';
    case 'coming-soon': return 'Kmalu';
    default: return '';
  }
};

interface ProductItemProps {
  product: PreOrderItem;
  quantity: number;
  onQuantityChange: (id: string, delta: number) => void;
}

// --- Sub-Components (Defined outside for performance & type safety) ---

const ProductCard: React.FC<ProductItemProps> = ({ product, quantity, onQuantityChange }) => {
  const isAvailable = product.status === 'available';

  return (
    <div className={`group relative bg-white border border-black/5 rounded-[2rem] overflow-hidden transition-all duration-300 flex flex-col h-full ${isAvailable ? 'hover:shadow-xl hover:border-olive/20' : 'opacity-70'}`}>
      {/* Status Badge */}
      <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyles(product.status)}`}>
        {getStatusLabel(product.status)}
      </div>

      {/* Image */}
      <div className="h-40 sm:h-48 overflow-hidden bg-gray-50 relative shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {!isAvailable && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        {/* Product Name */}
        <h4 className="font-serif text-sm sm:text-lg text-olive-dark leading-tight mb-2">{product.name}</h4>

        {/* Price */}
        <div className="mb-2">
          <span className="font-bold text-terracotta text-base sm:text-lg">{product.price.toFixed(2)}€</span>
          <span className="text-[9px] text-olive/40 uppercase font-bold ml-1">/ {product.unit}</span>
        </div>

        {/* Stock Slider */}
        {isAvailable && product.quantity !== undefined && product.maxQuantity !== undefined && product.maxQuantity > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] text-olive/40 font-bold uppercase tracking-wider">zaloga</span>
            <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${(product.quantity / product.maxQuantity) < 0.2 ? 'bg-red-500' :
                  (product.quantity / product.maxQuantity) < 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                style={{ width: `${Math.min(100, Math.max(0, (product.quantity / product.maxQuantity) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Quantity Control - Pushed to bottom */}
        <div className={`mt-auto flex items-center justify-center ${!isAvailable ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="inline-flex items-center gap-2 bg-cream rounded-full p-1">
            <button
              onClick={() => onQuantityChange(product.id, -1)}
              className="w-6 h-6 rounded-full bg-white shadow-sm text-olive flex items-center justify-center hover:bg-olive hover:text-white transition-colors disabled:opacity-50"
              disabled={quantity === 0}
            >
              <Minus size={12} />
            </button>

            <span className="w-8 text-center font-bold text-olive-dark text-sm">{quantity > 0 ? quantity : <span className="text-olive/20">0</span>}</span>

            <button
              onClick={() => onQuantityChange(product.id, 1)}
              className="w-6 h-6 rounded-full bg-olive text-white shadow-md flex items-center justify-center hover:bg-olive-dark transition-transform active:scale-90 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={product.quantity !== undefined && quantity >= product.quantity}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DryProductItem: React.FC<ProductItemProps> = ({ product, quantity, onQuantityChange }) => {
  const isAvailable = product.status === 'available';

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-black/5 rounded-[1.5rem] transition-all duration-300 h-full ${isAvailable ? 'hover:shadow-md' : 'opacity-60'}`}>
      <div className="w-full sm:w-16 h-32 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-grow min-w-0 text-center sm:text-left">
        <h4 className="font-serif text-base text-olive-dark truncate">{product.name}</h4>
        <p className="text-sm text-terracotta font-bold">
          {product.price.toFixed(2)}€ <span className="text-olive/40 font-normal">/ {product.unit}</span>
        </p>
      </div>

      <div className={`flex items-center gap-2 bg-cream rounded-full p-1 ${!isAvailable ? 'pointer-events-none' : ''}`}>
        <button onClick={() => onQuantityChange(product.id, -1)} disabled={quantity === 0} className="w-7 h-7 rounded-full bg-white text-olive flex items-center justify-center hover:bg-olive hover:text-white transition-colors disabled:opacity-50"><Minus size={12} /></button>
        <span className="w-6 text-center font-bold text-sm">{quantity}</span>
        <button onClick={() => onQuantityChange(product.id, 1)} className="w-7 h-7 rounded-full bg-olive text-white flex items-center justify-center hover:bg-olive-dark transition-colors"><Plus size={12} /></button>
      </div>
    </div>
  );
};

const Products: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [showMobileCartBar, setShowMobileCartBar] = useState(false);
  const [isCartEnabled, setIsCartEnabled] = useState(true);

  // Pagination State
  const [visibleFreshCount, setVisibleFreshCount] = useState(12);
  const [visibleDryCount, setVisibleDryCount] = useState(12);

  const sectionRef = useRef<HTMLElement>(null);

  // Check cart setting on mount and listen for changes
  useEffect(() => {
    const checkCartSetting = () => {
      const savedCartEnabled = localStorage.getItem('cartEnabled');
      if (savedCartEnabled !== null) {
        setIsCartEnabled(savedCartEnabled === 'true');
      }
    };

    checkCartSetting();

    const handleCartSettingChange = (e: CustomEvent) => {
      setIsCartEnabled(e.detail.cartEnabled);
    };

    window.addEventListener('cartSettingChanged', handleCartSettingChange as EventListener);
    return () => {
      window.removeEventListener('cartSettingChanged', handleCartSettingChange as EventListener);
    };
  }, []);

  // LIVE PRODUCTS STATE
  const [displayProducts, setDisplayProducts] = useState<PreOrderItem[]>(PREORDER_PRODUCTS);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    note: '',
    pickupLocation: 'home' as 'home' | 'market'
  });

  useEffect(() => {
    // 1. Setup Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMobileCartBar(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // 2. Fetch Live Data from Sanity
    const loadLiveProducts = async () => {
      const liveData = await fetchProducts();
      if (liveData && liveData.length > 0) {
        setDisplayProducts(liveData);
      }
    };
    loadLiveProducts();

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const product = displayProducts.find(p => p.id === id);

      // If adding (delta > 0) and product has stock limit
      if (delta > 0 && product?.quantity !== undefined) {
        if (current >= product.quantity) {
          return prev; // Don't increase if limit reached
        }
      }

      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 handleCheckout function called!');
    console.log('🛒 Starting checkout process...');
    console.log('📋 Form data:', customerForm);
    console.log('🛍️ Cart items:', cartItemsList);
    console.log('💰 Total price:', totalPrice);
    setIsSubmittingOrder(true);

    try {
      const orderItems = cartItemsList.map(item => ({
        name: item.name,
        quantity: quantities[item.id],
        price: item.price,
        unit: item.unit
      }));

      const orderResult = await submitOrder({
        customer: customerForm,
        items: orderItems,
        total: totalPrice,
        note: customerForm.note
      });

      console.log('📧 Preparing to send emails via Netlify function...');

      // Send emails via Netlify function
      try {
        const emailOrderData = {
          id: orderResult._id,
          orderNumber: orderResult.orderNumber,
          customer: customerForm,
          items: orderItems,
          total: totalPrice,
          status: orderResult.status,
          createdAt: orderResult.createdAt,
          note: customerForm.note
        };

        console.log('📧 Calling Netlify function with data:', emailOrderData);

        const response = await fetch('/.netlify/functions/send-order-emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailOrderData),
        });

        const result = await response.json();
        console.log('📧 Netlify function response:', result);

        if (response.ok && result.success) {
          console.log("✅ All emails sent successfully");
          if (result.customerEmail) console.log("✅ Customer confirmation email sent");
          if (result.adminEmail) console.log("✅ Admin notification email sent");
        } else {
          console.warn("⚠️ Some emails failed:", result);
        }
      } catch (emailError) {
        console.warn("⚠️ Error calling Netlify function:", emailError);
        // Don't block the success flow if email fails
      }

      setOrderSuccess(true);
      setQuantities({}); // Clear cart
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCheckoutModalOpen(false);
        setIsCartModalOpen(false);
        setCustomerForm({ name: '', email: '', phone: '', note: '', pickupLocation: 'home' });
      }, 3000);
    } catch (error) {
      console.error('❌ Order submission error:', error);
      console.error('❌ Error details:', error);
      alert(`Prišlo je do napake pri oddaji povpraševanja: ${error.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const freshProducts = displayProducts
    .filter(p => p.category === 'fresh')
    .sort((a, b) => a.name.localeCompare(b.name, 'sl'));

  const dryProducts = displayProducts
    .filter(p => p.category === 'dry')
    .sort((a, b) => a.name.localeCompare(b.name, 'sl'));

  // Explicit type casting to fix 'unknown' type errors
  const quantityValues = Object.values(quantities) as number[];
  const totalItems = quantityValues.reduce((a, b) => a + b, 0);
  console.log('🛒 Cart status:', { totalItems, quantities });

  const totalPrice = displayProducts.reduce((sum, product) => {
    const qty = quantities[product.id] || 0;
    return sum + (qty * product.price);
  }, 0);

  const cartItemsList = displayProducts.filter(p => (quantities[p.id] || 0) > 0);

  return (
    <section id="ponudba" ref={sectionRef} className="py-24 bg-cream dark:bg-cream-dim rounded-t-[3rem] -mt-10 relative z-20 min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-[90rem]"> {/* Wider container for 3 cols + sidebar */}

        <div className="text-center mb-16 max-w-3xl mx-auto">
          <FadeIn>
            <span className="text-terracotta font-bold uppercase tracking-widest text-xs mb-3 block">Trenutno v Ponudbi</span>
            <h2 className="font-serif text-4xl md:text-5xl text-olive-dark mb-6">Pridelki, polni življenjske energije</h2>
            <p className="text-lg text-olive/60 font-light mb-4">
              Neposredno z njive v vašo kuhinjo. Izberite izdelke, mi pa jih pripravimo za prevzem ali pošiljanje.
            </p>
          </FadeIn>
        </div>

        {/* PRODUCTS GRID CONTAINER - Full Width */}
        <div className="w-full">

          {/* FRESH SECTION */}
          <div className="mb-20">
            <FadeIn>
              <div className="flex items-center gap-4 mb-10 border-b border-olive/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-olive text-white flex items-center justify-center shadow-lg shadow-olive/20">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl text-olive-dark">Vrtnine in Sadje</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1">
                    <p className="text-[10px] text-olive/50 uppercase tracking-widest font-bold">Sveže nabrano • Osebni prevzem</p>

                    {/* Last Updated Label */}
                    {displayProducts.length > 0 && (
                      <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-olive/5 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-olive/60 font-medium whitespace-nowrap">
                          Stanje zaloge osveženo: {new Date(Math.max(...displayProducts.map(p => p._updatedAt ? new Date(p._updatedAt).getTime() : 0))).toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mobile Only Last Updated Label */}
                  {displayProducts.length > 0 && (
                    <div className="md:hidden flex items-center gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] text-olive/60 font-medium">
                        Osveženo: {new Date(Math.max(...displayProducts.map(p => p._updatedAt ? new Date(p._updatedAt).getTime() : 0))).toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* UPDATED GRID: 3 cols on Mobile, 4 on Desktop */}
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {freshProducts.slice(0, visibleFreshCount).map((p, idx) => (
                <FadeIn key={p.id} delay={idx * 50} className="h-full">
                  <ProductCard
                    product={p}
                    quantity={quantities[p.id] || 0}
                    onQuantityChange={handleQuantityChange}
                  />
                </FadeIn>
              ))}
              {freshProducts.length === 0 && (
                <div className="col-span-full text-center py-10 text-olive/40 italic">
                  Trenutno ni svežih pridelkov v ponudbi. Preverite kmalu!
                </div>
              )}
            </div>

            {/* Load More Button - Fresh */}
            {visibleFreshCount < freshProducts.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleFreshCount(prev => prev + 12)}
                  className="group inline-flex items-center gap-2 px-6 py-2 rounded-full border border-olive/20 text-olive hover:bg-olive hover:text-white transition-all duration-300"
                >
                  <span className="text-xs font-bold uppercase tracking-widest">Prikaži več</span>
                  <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* DRY SECTION */}
          <div>
            <FadeIn>
              <div className="flex items-center gap-4 mb-10 border-b border-olive/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center shadow-lg shadow-terracotta/20">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl text-olive-dark">Moke, Olja in Žita</h3>
                  <p className="text-[10px] text-olive/50 uppercase tracking-widest font-bold mt-1">Shramba • Možno pošiljanje</p>
                </div>
              </div>
            </FadeIn>
            {/* UPDATED GRID: 3 cols on Mobile, 4 on Desktop */}
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dryProducts.slice(0, visibleDryCount).map((p, idx) => (
                <FadeIn key={p.id} delay={idx * 50} className="h-full">
                  <ProductCard
                    product={p}
                    quantity={quantities[p.id] || 0}
                    onQuantityChange={handleQuantityChange}
                  />
                </FadeIn>
              ))}
              {dryProducts.length === 0 && (
                <div className="col-span-full text-center py-10 text-olive/40 italic">
                  Trenutno ni izdelkov v shrambi.
                </div>
              )}
            </div>

            {/* Load More Button - Dry */}
            {visibleDryCount < dryProducts.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleDryCount(prev => prev + 12)}
                  className="group inline-flex items-center gap-2 px-6 py-2 rounded-full border border-olive/20 text-olive hover:bg-olive hover:text-white transition-all duration-300"
                >
                  <span className="text-xs font-bold uppercase tracking-widest">Prikaži več</span>
                  <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* FLOATING CART BUTTON (DESKTOP & MOBILE) */}
      {isCartEnabled && (
        <div className={`fixed z-40 transition-all duration-500 ${showMobileCartBar ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} 
          bottom-6 right-6 left-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2`}
        >
          <button
            onClick={() => setIsCartModalOpen(true)}
            className="group flex items-center gap-3 bg-olive-dark text-cream p-4 rounded-full shadow-2xl border border-white/10 backdrop-blur-md active:scale-95 transition-all hover:bg-olive hover:scale-105"
          >
            <div className="relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-terracotta text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-olive-dark">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="flex flex-col items-start pr-2">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Košarica</span>
              <span className="text-sm font-serif text-white leading-none">{totalPrice.toFixed(2)} €</span>
            </div>
          </button>
        </div>
      )}

      {/* MOBILE CART MODAL (Popup) */}
      {isCartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/5">
              <h3 className="font-serif text-2xl text-olive-dark">Pregled Košarice</h3>
              <button
                onClick={() => setIsCartModalOpen(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} className="text-olive-dark" />
              </button>
            </div>

            {totalItems === 0 ? (
              <div className="text-center py-8 text-olive/40">
                <p>Vaša košarica je trenutno prazna.</p>
              </div>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto space-y-4 mb-6 custom-scrollbar pr-2">
                {cartItemsList.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-cream/50 p-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex flex-col">
                        <span className="font-bold text-olive-dark text-sm">{p.name}</span>
                        <span className="text-xs text-olive/50">{(p.price * (quantities[p.id] || 0)).toFixed(2)} €</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm">
                      <button onClick={() => handleQuantityChange(p.id, -1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><Minus size={12} /></button>
                      <span className="w-4 text-center font-bold text-xs">{quantities[p.id]}</span>
                      <button onClick={() => handleQuantityChange(p.id, 1)} className="w-6 h-6 rounded-full bg-olive text-white flex items-center justify-center"><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <div className="flex justify-between items-end mb-6">
                <span className="text-olive/60 text-sm font-bold uppercase">Za Plačilo</span>
                <span className="text-3xl font-serif text-olive-dark">{totalPrice.toFixed(2)}€</span>
              </div>
              <button
                onClick={() => { setIsCartModalOpen(false); setIsCheckoutModalOpen(true); }}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${totalItems > 0 ? 'bg-terracotta text-white shadow-lg hover:bg-terracotta/90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={totalItems === 0}
              >
                <span>Oddaj Povpraševanje</span>
                <Check size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCheckoutModalOpen(false)}></div>

          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl text-olive-dark">Zaključek Povpraševanja</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} className="text-olive-dark" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} />
                </div>
                <h4 className="font-serif text-2xl text-olive-dark mb-2">Hvala za vaše povpraševanje!</h4>
                <p className="text-olive/60">Na vaš e-mail naslov boste prejeli potrdilo. Kmalu vas bomo kontaktirali.</p>
              </div>
            ) : (
              <form onSubmit={(e) => {
                console.log('🎯 Form submit triggered!');
                handleCheckout(e);
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-olive/50 mb-1 ml-1">Ime in Priimek</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="Janez Novak"
                    value={customerForm.name}
                    onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-olive/50 mb-1 ml-1">E-mail Naslov <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="janez@primer.si"
                    value={customerForm.email}
                    onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-olive/50 mb-1 ml-1">Telefonska Številka</label>
                  <input
                    required
                    type="tel"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="041 123 456"
                    value={customerForm.phone}
                    onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-olive/50 mb-1 ml-1">Opombe (Opcijsko)</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-terracotta transition-colors h-24 resize-none"
                    placeholder="Posebne želje, čas prevzema..."
                    value={customerForm.note}
                    onChange={e => setCustomerForm({ ...customerForm, note: e.target.value })}
                  ></textarea>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-olive/50 mb-2 ml-1">Prevzem pridelkov</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="pickup-home"
                        name="pickupLocation"
                        value="home"
                        checked={customerForm.pickupLocation === 'home'}
                        onChange={e => setCustomerForm({ ...customerForm, pickupLocation: e.target.value as 'home' | 'market' })}
                        className="h-4 w-4 text-olive focus:ring-olive border-gray-300"
                      />
                      <label htmlFor="pickup-home" className="text-sm text-olive/70">
                        Prevzem na kmetiji (Dečno selo 48, 8253 Artiče)
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="pickup-market"
                        name="pickupLocation"
                        value="market"
                        checked={customerForm.pickupLocation === 'market'}
                        onChange={e => setCustomerForm({ ...customerForm, pickupLocation: e.target.value as 'home' | 'market' })}
                        className="h-4 w-4 text-olive focus:ring-olive border-gray-300"
                      />
                      <label htmlFor="pickup-market" className="text-sm text-olive/70">
                        Prevzem na tržnici Ljubljana (Pogačarjev trg)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 pb-2">
                  <div className="flex items-start gap-3">
                    <input
                      required
                      type="checkbox"
                      id="terms"
                      className="mt-1 h-4 w-4 text-olive focus:ring-olive border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="text-xs text-olive/70 leading-relaxed">
                      Strinjam se s <Link to="/pravno#pogoji" target="_blank" className="text-terracotta hover:underline font-bold">Splošnimi pogoji poslovanja</Link> in <Link to="/pravno#zasebnost" target="_blank" className="text-terracotta hover:underline font-bold">Politiko zasebnosti</Link>. Potrjujem, da sem seznanjen, da za sveže pridelke ni možnosti odstopa od pogodbe.
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingOrder || totalItems === 0}
                    onClick={() => console.log('🔘 Submit button clicked!', { isSubmitting: isSubmittingOrder, totalItems })}
                    className="w-full bg-olive text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-olive-dark transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Pošiljanje...</span>
                      </>
                    ) : (
                      <>
                        <span>Pošlji Povpraševanje</span>
                        <ArrowRight size={18} /> {/* Using ArrowRight instead of Check for submit */}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  );
};

export default Products;

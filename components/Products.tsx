
import React, { useState, useEffect, useRef } from 'react';
import { PREORDER_PRODUCTS } from '../constants';
import { PreOrderItem } from '../types';
import FadeIn from './FadeIn';
import { ShoppingBag, Truck, Plus, Minus, Check, ShoppingCart, Trash2, X, ChevronUp, ArrowRight } from 'lucide-react';
import { fetchProducts, submitOrder } from '../sanityClient';
import { sendOrderConfirmationEmail, addContactToAudience } from '../utils/emailService';

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
      <div className="h-48 overflow-hidden bg-gray-50 relative shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {!isAvailable && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-serif text-lg text-olive-dark leading-tight">{product.name}</h4>
          <div className="text-right">
            <span className="block font-bold text-terracotta text-base">{product.price.toFixed(2)}€</span>
            <span className="text-[9px] text-olive/40 uppercase font-bold">na {product.unit}</span>
          </div>
        </div>

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
              className="w-6 h-6 rounded-full bg-olive text-white shadow-md flex items-center justify-center hover:bg-olive-dark transition-transform active:scale-90"
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

// --- Main Component ---

const Products: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [showMobileCartBar, setShowMobileCartBar] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
    newsletterSubscribe: false
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
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Send confirmation email to customer
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

        const emailSent = await sendOrderConfirmationEmail(emailOrderData);
        if (emailSent) {
          console.log("✅ Confirmation email sent successfully");
        } else {
          console.warn("⚠️ Failed to send confirmation email");
        }

        // Add to newsletter audience if subscribed
        if (customerForm.newsletterSubscribe) {
          try {
            const contactAdded = await addContactToAudience(customerForm.email, customerForm.name);
            if (contactAdded) {
              console.log("✅ Contact added to newsletter audience");
            } else {
              console.warn("⚠️ Failed to add contact to newsletter audience");
            }
          } catch (contactError) {
            console.warn("⚠️ Error adding contact to newsletter audience:", contactError);
            // Don't block the success flow if contact addition fails
          }
        }
      } catch (emailError) {
        console.warn("⚠️ Error sending confirmation email:", emailError);
        // Don't block the success flow if email fails
      }

      setOrderSuccess(true);
      setQuantities({}); // Clear cart
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCheckoutModalOpen(false);
        setIsCartModalOpen(false);
        setCustomerForm({ name: '', email: '', phone: '', note: '', newsletterSubscribe: false });
      }, 3000);
    } catch (error) {
      console.error('Order submission error:', error);
      alert(`Prišlo je do napake pri oddaji povpraševanja: ${error.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const freshProducts = displayProducts.filter(p => p.category === 'fresh');
  const dryProducts = displayProducts.filter(p => p.category === 'dry');

  // Explicit type casting to fix 'unknown' type errors
  const quantityValues = Object.values(quantities) as number[];
  const totalItems = quantityValues.reduce((a, b) => a + b, 0);

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
            <h2 className="font-serif text-4xl md:text-6xl text-olive-dark mb-6">Pridelki, polni življenjske energije</h2>
            <p className="text-lg text-olive/60 font-light">
              Neposredno z njive v vašo kuhinjo. Izberite izdelke, mi pa jih pripravimo za prevzem ali pošiljanje.
            </p>
          </FadeIn>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 lg:gap-12 relative">

          {/* LEFT COLUMN: PRODUCTS (Expanded width) */}
          <div className="flex-1 min-w-0">

            {/* FRESH SECTION */}
            <div className="mb-20">
              <FadeIn>
                <div className="flex items-center gap-4 mb-10 border-b border-olive/5 pb-4">
                  <div className="w-10 h-10 rounded-full bg-olive text-white flex items-center justify-center shadow-lg shadow-olive/20">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl text-olive-dark">Vrtnine in Sadje</h3>
                    <p className="text-[10px] text-olive/50 uppercase tracking-widest font-bold mt-1">Sveže nabrano • Osebni prevzem</p>
                  </div>
                </div>
              </FadeIn>
              {/* UPDATED GRID: 3 cols on Large (Tablet Landscape/Small Laptop), 2 on Medium, 1 on Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freshProducts.map((p, idx) => (
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
              {/* UPDATED GRID: Matching layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dryProducts.map((p, idx) => (
                  <FadeIn key={p.id} delay={idx * 50} className="h-full">
                    <DryProductItem
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
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY SMART CART (XL Desktop Only) */}
          <div className="hidden xl:block w-80 xl:w-96 relative shrink-0">
            <div className="sticky top-32">
              <div className="bg-white border border-black/5 rounded-[2rem] p-6 shadow-2xl shadow-olive/5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                  <h3 className="font-serif text-xl text-olive-dark">Vaša Košarica</h3>
                  <div className="relative">
                    <ShoppingCart size={22} className="text-olive" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-terracotta text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-bounce">
                        {totalItems}
                      </span>
                    )}
                  </div>
                </div>

                {totalItems === 0 ? (
                  <div className="text-center py-12 text-olive/40">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Košarica je prazna.</p>
                    <p className="text-xs mt-2">Izberite pridelke seznama.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                      {cartItemsList.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0"><img src={p.image} className="w-full h-full object-cover" /></div>
                            <div className="flex flex-col">
                              <span className="text-olive-dark font-medium leading-tight">{p.name}</span>
                              <span className="text-olive/50 text-[10px]">x{quantities[p.id]} {p.unit}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-olive-dark">{(p.price * (quantities[p.id] || 0)).toFixed(2)}€</span>
                            <button onClick={() => setQuantities(prev => ({ ...prev, [p.id]: 0 }))} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-black/5 pt-4">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-olive/60 text-sm uppercase tracking-widest">Skupaj</span>
                        <span className="text-2xl font-serif text-olive-dark">{totalPrice.toFixed(2)}€</span>
                      </div>
                      <p className="text-[10px] text-olive/40 text-right mb-6">* DDV je vključen</p>

                      <button
                        onClick={() => setIsCheckoutModalOpen(true)}
                        className="w-full bg-olive text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-olive-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 text-sm"
                      >
                        <span>Oddaj Povpraševanje</span>
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE/TABLET FLOATING BAR (Visible below XL) */}
      <div
        className={`xl:hidden fixed bottom-6 left-4 right-4 z-40 transition-all duration-500 transform ${showMobileCartBar ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
      >
        <button
          onClick={() => setIsCartModalOpen(true)}
          className="w-full bg-olive-dark text-cream p-4 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="bg-terracotta p-2 rounded-full text-white relative">
              <ShoppingCart size={18} />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-olive-dark"></span>}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-white/50 uppercase tracking-widest">Moja Košarica</span>
              <span className="text-lg font-serif text-white leading-none">{totalItems} artiklov</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">{totalPrice.toFixed(2)} €</span>
            <ChevronUp size={20} className="text-white/50" />
          </div>
        </button>
      </div>

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
              <form onSubmit={handleCheckout} className="space-y-4">
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

                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="newsletterSubscribe"
                    checked={customerForm.newsletterSubscribe}
                    onChange={e => setCustomerForm({ ...customerForm, newsletterSubscribe: e.target.checked })}
                    className="mt-1 h-4 w-4 text-olive focus:ring-olive border-gray-300 rounded"
                  />
                  <label htmlFor="newsletterSubscribe" className="text-sm text-olive/70 leading-relaxed">
                    Želim prejemati novice in obvestila o novih izdelkih ter dogodkih na kmetiji
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="w-full bg-olive text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-olive-dark transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                  <p className="text-[10px] text-center text-olive/40 mt-3">
                    S klikom na gumb se strinjate z obdelavo osebnih podatkov za namen priprave ponudbe.
                  </p>
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

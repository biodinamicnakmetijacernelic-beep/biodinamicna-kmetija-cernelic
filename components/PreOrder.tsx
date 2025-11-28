
import React, { useState, useRef, useEffect } from 'react';
import { PREORDER_PRODUCTS } from '../constants';
import { PreOrderItem } from '../types';
import FadeIn from './FadeIn';
import CheckoutForm from './CheckoutForm';
import { ShoppingBag, Truck, Info, Plus, Minus, Check } from 'lucide-react';

const PreOrder: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [cartEnabled, setCartEnabled] = useState(true);
  const [isProductsVisible, setIsProductsVisible] = useState(false);
  const productsSectionRef = useRef<HTMLDivElement>(null);

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const freshProducts = PREORDER_PRODUCTS.filter(p => p.category === 'fresh');
  const dryProducts = PREORDER_PRODUCTS.filter(p => p.category === 'dry');

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-olive-dark border-green-200';
      case 'sold-out':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'coming-soon':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100';
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

  const handleSubmitOrder = () => {
    const totalItems = Object.values(quantities).reduce((a: number, b: number) => a + b, 0);
    if (totalItems === 0) {
      alert('Prosimo, izberite vsaj en izdelek pred oddajo naročila.');
      return;
    }
    setShowCheckout(true);
  };

  const handleBackToSelection = () => {
    setShowCheckout(false);
  };

  const handleOrderSubmitted = () => {
    setOrderSubmitted(true);
    setShowCheckout(false);
  };

  // Load cart enabled setting from localStorage
  useEffect(() => {
    const savedCartEnabled = localStorage.getItem('cartEnabled');
    if (savedCartEnabled !== null) {
      setCartEnabled(savedCartEnabled === 'true');
    }

    // Listen for cart setting changes from admin panel
    const handleCartSettingChange = (e: CustomEvent) => {
      setCartEnabled(e.detail.cartEnabled);
    };

    window.addEventListener('cartSettingChanged', handleCartSettingChange as EventListener);
    return () => window.removeEventListener('cartSettingChanged', handleCartSettingChange as EventListener);
  }, []);

  // Intersection Observer for products section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsProductsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: '-100px 0px -100px 0px' // Offset for navbar and some buffer
      }
    );

    if (productsSectionRef.current) {
      observer.observe(productsSectionRef.current);
    }

    return () => {
      if (productsSectionRef.current) {
        observer.unobserve(productsSectionRef.current);
      }
    };
  }, []);

  const ProductCard: React.FC<{ product: PreOrderItem }> = ({ product }) => {
    const isAvailable = product.status === 'available';
    const quantity = quantities[product.id] || 0;

    return (
      <div className={`relative bg-white border rounded-3xl overflow-hidden transition-all duration-300 ${isAvailable ? 'border-gray-100 hover:shadow-lg hover:border-olive/20' : 'border-gray-100 opacity-80 grayscale-[0.5]'}`}>
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyles(product.status)}`}>
          {getStatusLabel(product.status)}
        </div>

        {/* Image Area */}
        <div className="h-48 overflow-hidden bg-gray-50">
           <img 
             src={product.image} 
             alt={product.name} 
             className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
           />
        </div>

        {/* Content */}
        <div className="p-6">
           <div className="flex justify-between items-start mb-2">
              <h4 className="font-serif text-xl text-olive-dark">{product.name}</h4>
              <span className="font-sans font-bold text-terracotta">
                {product.price.toFixed(2)} € <span className="text-xs text-olive/50 font-normal">/ {product.unit}</span>
              </span>
           </div>

           {/* Quantity Control */}
           <div className="mt-6 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-olive/40 font-bold">Količina</span>
              
              <div className={`flex items-center gap-4 bg-cream rounded-full px-2 py-1 ${!isAvailable ? 'opacity-50 pointer-events-none' : ''}`}>
                 <button 
                   onClick={() => handleQuantityChange(product.id, -1)}
                   className="w-8 h-8 rounded-full bg-white text-olive flex items-center justify-center hover:bg-olive hover:text-white transition-colors disabled:opacity-50"
                   disabled={quantity === 0}
                 >
                   <Minus size={14} />
                 </button>
                 
                 <span className="w-8 text-center font-bold text-olive-dark">{quantity}</span>
                 
                 <button 
                   onClick={() => handleQuantityChange(product.id, 1)}
                   className="w-8 h-8 rounded-full bg-white text-olive flex items-center justify-center hover:bg-olive hover:text-white transition-colors"
                 >
                   <Plus size={14} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const DryProductItem: React.FC<{ product: PreOrderItem }> = ({ product }) => {
    const isAvailable = product.status === 'available';
    const quantity = quantities[product.id] || 0;

    return (
      <div className={`flex flex-col md:flex-row items-center gap-6 p-6 bg-white border border-gray-100 rounded-3xl transition-all ${isAvailable ? 'hover:shadow-md' : 'opacity-70'}`}>
        
        {/* Image Thumbnail */}
        <div className="w-full md:w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
           <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-grow text-center md:text-left">
           <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
             <h4 className="font-serif text-xl text-olive-dark">{product.name}</h4>
             <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border w-max mx-auto md:mx-0 ${getStatusStyles(product.status)}`}>
               {getStatusLabel(product.status)}
             </span>
           </div>
           <p className="text-terracotta font-bold">
             {product.price.toFixed(2)} € <span className="text-sm text-olive/50 font-normal">/ {product.unit}</span>
           </p>
        </div>

        {/* Quantity */}
        <div className={`flex items-center gap-3 bg-cream rounded-full px-2 py-2 ${!isAvailable ? 'opacity-50 pointer-events-none' : ''}`}>
           <button 
             onClick={() => handleQuantityChange(product.id, -1)}
             className="w-8 h-8 rounded-full bg-white text-olive flex items-center justify-center hover:bg-olive hover:text-white transition-colors disabled:opacity-50"
             disabled={quantity === 0}
           >
             <Minus size={14} />
           </button>
           
           <span className="w-8 text-center font-bold text-olive-dark">{quantity}</span>
           
           <button 
             onClick={() => handleQuantityChange(product.id, 1)}
             className="w-8 h-8 rounded-full bg-white text-olive flex items-center justify-center hover:bg-olive hover:text-white transition-colors"
           >
             <Plus size={14} />
           </button>
        </div>
      </div>
    );
  };

  // If cart is disabled, show message instead
  if (!cartEnabled) {
    return (
      <section id="narocilo" className="py-24 bg-cream border-t border-olive/5">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-lg">
            <ShoppingBag size={48} className="text-olive/30 mx-auto mb-6" />
            <h2 className="font-serif text-3xl text-olive-dark mb-4">
              Naročila trenutno niso na voljo
            </h2>
            <p className="text-lg text-olive/60 mb-6">
              Trenutno ni izdelkov na zalogi. Kontaktirajte nas za več informacij.
            </p>
            <div className="text-sm text-olive/40">
              Za vprašanja nas pokličite: +386 51 363 447
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="narocilo" className="py-24 bg-cream border-t border-olive/5">
       <div className="container mx-auto px-6 max-w-7xl">
         
         {/* Header */}
         <div className="text-center mb-16 max-w-3xl mx-auto">
           <FadeIn>
             <h2 className="font-serif text-4xl md:text-5xl text-olive-dark mb-4">Tedenska biodinamična tržnica</h2>
             <p className="text-lg text-olive/60 font-light">
               Izberite količino pridelkov, ki so trenutno na voljo, in oddajte naročilnico. 
               Zaloga se sproti osvežuje.
             </p>
           </FadeIn>
         </div>

         {/* BLOCK 1: Fresh (Grid Layout) */}
         <div ref={productsSectionRef} className="mb-20">
            <FadeIn>
               <div className="flex items-center gap-3 mb-8 pb-4 border-b border-olive/10">
                  <div className="p-2 bg-olive/10 rounded-full text-olive">
                     <ShoppingBag size={20} />
                  </div>
                  <div>
                     <h3 className="font-serif text-2xl text-olive-dark">Vrtnine in Sadje</h3>
                     <p className="text-xs text-olive/50 uppercase tracking-wider">Osebni prevzem na Kmetiji ali Tržnici</p>
                  </div>
               </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {freshProducts.map((p, idx) => (
                  <FadeIn key={p.id} delay={idx * 50}>
                     <ProductCard product={p} />
                  </FadeIn>
               ))}
            </div>
         </div>

         {/* BLOCK 2: Dry (List Layout) */}
         <div className="mb-20 max-w-4xl mx-auto">
            <FadeIn>
               <div className="flex items-center gap-3 mb-8 pb-4 border-b border-olive/10">
                  <div className="p-2 bg-terracotta/10 rounded-full text-terracotta">
                     <Truck size={20} />
                  </div>
                  <div>
                     <h3 className="font-serif text-2xl text-olive-dark">Moke in Olja</h3>
                     <p className="text-xs text-olive/50 uppercase tracking-wider">Na voljo tudi za pošiljanje po pošti</p>
                  </div>
               </div>
            </FadeIn>
            
            <div className="flex flex-col gap-4">
               {dryProducts.map((p, idx) => (
                  <FadeIn key={p.id} delay={idx * 50}>
                     <DryProductItem product={p} />
                  </FadeIn>
               ))}
            </div>
         </div>

         {/* Footer / CTA */}
         <FadeIn>
            <div className={`${isProductsVisible ? 'md:sticky md:bottom-6' : 'relative'} z-40 bg-olive-dark/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/10 max-w-2xl mx-auto flex items-center justify-between`}>
               <div className="flex flex-col px-4">
                  <span className="text-cream/50 text-xs uppercase tracking-widest">Skupaj izdelkov</span>
                  <span className="text-2xl text-white font-serif">
                     {Object.values(quantities).reduce((a: number, b: number) => a + b, 0)} <span className="text-base font-sans font-normal opacity-50">kos</span>
                  </span>
               </div>
               
               <button
                 onClick={handleSubmitOrder}
                 className="bg-terracotta text-olive-dark px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg flex items-center gap-2"
               >
                  <span>Oddaj Naročilnico</span>
                  <Check size={18} />
               </button>
            </div>
            <p className="text-center text-olive/40 text-xs mt-6">
               * Plačilo se izvede ob prevzemu. Cene vključujejo DDV.
            </p>
         </FadeIn>

       </div>

       {/* Checkout Form */}
       {showCheckout && (
         <CheckoutForm
           quantities={quantities}
           onBack={handleBackToSelection}
           onOrderSubmitted={handleOrderSubmitted}
         />
       )}

       {/* Order Success Message */}
       {orderSubmitted && (
         <section className="py-24 bg-cream">
           <div className="container mx-auto px-6 max-w-2xl text-center">
             <FadeIn>
               <div className="bg-white border border-green-200 rounded-3xl p-12 shadow-lg">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Check size={32} className="text-green-600" />
                 </div>
                 <h2 className="font-serif text-3xl text-olive-dark mb-4">
                   Naročilo oddano!
                 </h2>
                 <p className="text-lg text-olive/60 mb-6">
                   Hvala za vaše naročilo. Prejeli boste potrditveno e-pošto v kratkem.
                   Kontaktirali vas bomo glede termina prevzema.
                 </p>
                 <button
                   onClick={() => {
                     setOrderSubmitted(false);
                     setQuantities({});
                   }}
                   className="bg-olive text-white px-8 py-3 rounded-full font-medium hover:bg-olive/90 transition-colors"
                 >
                   Nazaj na izbiro izdelkov
                 </button>
               </div>
             </FadeIn>
           </div>
         </section>
       )}
    </section>
  );
};

export default PreOrder;

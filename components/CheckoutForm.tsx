import React, { useState, useEffect } from 'react';
import { PREORDER_PRODUCTS, PreOrderItem } from '../constants';
import { submitOrder } from '../sanityClient';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from '../utils/emailService';
import FadeIn from './FadeIn';
import { ShoppingCart, User, Phone, Mail, MessageSquare, Check, X, ArrowLeft } from 'lucide-react';

interface CheckoutFormProps {
  quantities: Record<string, number>;
  onBack: () => void;
  onOrderSubmitted: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ quantities, onBack, onOrderSubmitted }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Calculate order items and total
  const orderItems = PREORDER_PRODUCTS
    .filter(product => quantities[product.id] > 0)
    .map(product => ({
      name: product.name,
      quantity: quantities[product.id],
      price: product.price,
      unit: product.unit
    }));

  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Ime je obvezno';
    if (!formData.lastName.trim()) newErrors.lastName = 'Priimek je obvezen';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon je obvezen';
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail je obvezen';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Neveljaven e-mail naslov';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log("🛒 Starting order submission...");

      const orderData = {
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        },
        items: orderItems,
        total: total,
        note: formData.notes.trim() || undefined
      };

      console.log("🛒 Submitting order data:", orderData);

      // Submit order to Sanity (requires admin token)
      const result = await submitOrder(orderData);
      console.log("✅ Order submitted successfully:", result);

      // Send confirmation email to customer
      try {
        const emailOrderData = {
          id: result._id,
          orderNumber: result.orderNumber,
          customer: orderData.customer,
          items: orderData.items,
          total: orderData.total,
          status: result.status as 'pending' | 'in-preparation' | 'ready-for-pickup' | 'completed' | 'rejected',
          createdAt: result.createdAt,
          note: orderData.note
        };

        const emailSent = await sendOrderConfirmationEmail(emailOrderData);
        if (emailSent) {
          console.log("✅ Confirmation email sent successfully");
        } else {
          console.warn("⚠️ Failed to send confirmation email");
        }

        // Send notification to admin
        try {
          const adminEmailSent = await sendOrderNotificationToAdmin({
            ...emailOrderData,
            status: result.status as 'pending' | 'in-preparation' | 'ready-for-pickup' | 'completed' | 'rejected'
          });
          if (adminEmailSent) {
            console.log("✅ Admin notification email sent successfully");
          } else {
            console.warn("⚠️ Failed to send admin notification email");
          }
        } catch (adminEmailError) {
          console.warn("⚠️ Error sending admin notification email:", adminEmailError);
        }
      } catch (emailError) {
        console.warn("⚠️ Error sending confirmation email:", emailError);
        // Don't block the success flow if email fails
      }

      console.log("🎉 Order submission completed!");
      onOrderSubmitted();
    } catch (error: any) {
      console.error('❌ Error submitting order:', error);
      alert(`Napaka pri oddaji naročila: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onBack}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-cream rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh] md:max-h-[85vh]">

        {/* Header Bar */}
        <div className="flex items-center justify-between p-3 md:p-5 border-b border-olive/10 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-olive/10 rounded-full text-olive">
              <ShoppingCart size={18} className="md:w-5 md:h-5" />
            </div>
            <h2 className="font-serif text-lg md:text-2xl text-olive-dark">
              Zaključek naročila
            </h2>
          </div>
          <button
            onClick={onBack}
            className="p-1.5 md:p-2 hover:bg-olive/10 rounded-full transition-colors text-olive/60 hover:text-olive"
          >
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-3 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">

            {/* Order Summary (Left Column on Desktop) */}
            <div className="lg:col-span-5 space-y-4 md:space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6">
                <h3 className="font-serif text-base md:text-lg text-olive-dark mb-3 md:mb-4 flex items-center gap-2">
                  <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
                  Vaša košarica
                </h3>

                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 max-h-48 md:max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-start py-1.5 md:py-2 border-b border-gray-50 last:border-b-0">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-medium text-olive-dark text-xs md:text-sm truncate">{item.name}</div>
                        <div className="text-[10px] md:text-xs text-olive/50">
                          {item.quantity} × {item.price.toFixed(2)} € / {item.unit}
                        </div>
                      </div>
                      <span className="font-bold text-terracotta text-xs md:text-sm whitespace-nowrap">
                        {(item.quantity * item.price).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 md:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base font-bold text-olive-dark">Skupaj za plačilo</span>
                    <span className="text-lg md:text-xl font-bold text-terracotta">{total.toFixed(2)} €</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-olive/40 mt-2 text-center">
                    Plačilo se izvede ob prevzemu.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Form (Right Column on Desktop) */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8">
                <h3 className="font-serif text-base md:text-xl text-olive-dark mb-4 md:mb-6 flex items-center gap-2">
                  <User size={18} className="md:w-5 md:h-5" />
                  Podatki za naročilo
                </h3>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-olive/50 mb-1">
                        Ime *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors text-xs md:text-sm ${errors.firstName ? 'border-red-300' : 'border-gray-200'
                          }`}
                        placeholder="Janez"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-[10px] md:text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-olive/50 mb-1">
                        Priimek *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors text-xs md:text-sm ${errors.lastName ? 'border-red-300' : 'border-gray-200'
                          }`}
                        placeholder="Novak"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-[10px] md:text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-olive/50 mb-1">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors text-xs md:text-sm ${errors.phone ? 'border-red-300' : 'border-gray-200'
                          }`}
                        placeholder="041 123 456"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-[10px] md:text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-olive/50 mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors text-xs md:text-sm ${errors.email ? 'border-red-300' : 'border-gray-200'
                          }`}
                        placeholder="janez@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-[10px] md:text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-olive/50 mb-1">
                      Opombe (neobvezno)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors resize-none text-xs md:text-sm"
                      rows={2}
                      placeholder="Posebne želje glede prevzema..."
                    />
                  </div>

                  <div className="pt-3 md:pt-4 flex gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex-1 bg-gray-100 text-olive-dark px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                    >
                      Prekliči
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] bg-terracotta text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs md:text-sm shadow-lg shadow-terracotta/20"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent"></div>
                          <span className="hidden sm:inline">Pošiljanje...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} className="md:w-[18px] md:h-[18px]" />
                          <span className="hidden sm:inline">Oddaj naročilo</span>
                          <span className="sm:hidden">Oddaj</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;

import React, { useState } from 'react';
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
          status: result.status,
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
          const adminEmailSent = await sendOrderNotificationToAdmin(emailOrderData);
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
    } catch (error) {
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
    <section className="py-12 md:py-16 bg-cream border-t border-olive/5">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">

        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-olive/10 text-olive px-4 py-2 rounded-full mb-4">
              <ShoppingCart size={16} />
              <span className="text-sm font-medium uppercase tracking-wider">Oddaja Naročila</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-olive-dark mb-4">
              Potrdite vaše naročilo
            </h2>
            <p className="text-lg text-olive/60">
              Izpolnite podatke in vaše naročilo bo oddano.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Order Summary */}
          <FadeIn>
            <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6">
              <h3 className="font-serif text-2xl text-olive-dark mb-6 flex items-center gap-2">
                <ShoppingCart size={20} />
                Povzetek naročila
              </h3>

              <div className="space-y-4 mb-6">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0">
                    <div>
                      <span className="font-medium text-olive-dark">{item.name}</span>
                      <span className="text-sm text-olive/50 ml-2">
                        {item.quantity} × {item.price.toFixed(2)} € / {item.unit}
                      </span>
                    </div>
                    <span className="font-bold text-terracotta">
                      {(item.quantity * item.price).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-olive-dark">Skupaj</span>
                  <span className="text-xl font-bold text-terracotta">{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Customer Form */}
          <FadeIn delay={100}>
            <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6">
              <h3 className="font-serif text-2xl text-olive-dark mb-6 flex items-center gap-2">
                <User size={20} />
                Vaši podatki
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-olive-dark mb-2">
                      Ime *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors ${errors.firstName ? 'border-red-300' : 'border-gray-200'
                        }`}
                      placeholder="Vaše ime"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-olive-dark mb-2">
                      Priimek *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors ${errors.lastName ? 'border-red-300' : 'border-gray-200'
                        }`}
                      placeholder="Vaš priimek"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-olive-dark mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors ${errors.phone ? 'border-red-300' : 'border-gray-200'
                      }`}
                    placeholder="+386 51 123 456"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-olive-dark mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    E-mail naslov *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors ${errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                    placeholder="vas@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-olive-dark mb-2 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Dodatne opombe
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors resize-none"
                    rows={3}
                    placeholder="Posebne zahteve, čas prevzema, itd. (neobvezno)"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-100 text-olive-dark px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Nazaj
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-terracotta text-white px-6 py-3 rounded-xl font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Pošiljanje...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Oddaj naročilo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </FadeIn>
        </div>

        {/* Footer Note */}
        <FadeIn delay={200}>
          <div className="text-center mt-12 p-6 bg-white/50 border border-white rounded-2xl">
            <p className="text-olive/60 text-sm">
              * Po oddaji naročila boste prejeli potrditveno e-pošto. Plačilo se izvede ob prevzemu na kmetiji ali tržnici.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default CheckoutForm;

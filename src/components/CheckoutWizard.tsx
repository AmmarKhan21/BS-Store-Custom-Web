import React, { useState, useEffect } from 'react';
import { CartItem, Coupon, Order } from '../types';
import { ShieldCheck, CreditCard, ShoppingBag, Truck, Check, AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles, Smartphone } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { getDeliveryCharge } from '../lib/currency';
import { getCustomerProfile } from '../lib/customerAuth';
import { submitPaymentForm } from '../lib/customerAuth';

interface CheckoutWizardProps {
  cartItems: CartItem[];
  appliedCoupon: Coupon | null;
  onClose: () => void;
  onSubmitOrder: (
    order: Order,
    couponCode?: string
  ) => Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
    requiresPayment?: boolean;
    checkoutUrl?: string;
    formFields?: Record<string, string>;
  }>;
}

export default function CheckoutWizard({ cartItems, appliedCoupon, onClose, onSubmitOrder }: CheckoutWizardProps) {
  const { currency, convert, symbol } = useCurrency();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkoutError, setCheckoutError] = useState('');

  // Phase 1: Shipping States
  const [shippingName, setShippingName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('Lahore');
  const [shippingPostal, setShippingPostal] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    getCustomerProfile().then((p) => {
      if (p) {
        setShippingName(p.name);
        setShippingEmail(p.email);
        if (p.phone) setShippingPhone(p.phone);
      }
    });
  }, []);

  // Phase 2: Payment States
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PAYFAST' | 'JAZZCASH'>('COD');
  const [isProcessing, setIsProcessing] = useState(false);

  // Phase 3: Created Order State
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Compute total figures (prices stored in USD, display in selected currency)
  const subtotal = cartItems.reduce((acc, item) => acc + convert(item.product.price) * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.isActive && subtotal >= convert(appliedCoupon.minPurchase)) {
      if (appliedCoupon.discountType === 'percentage') {
        discountAmount = (subtotal * appliedCoupon.value) / 100;
      } else {
        discountAmount = convert(appliedCoupon.value);
      }
    }
  }

  const deliveryCharge = getDeliveryCharge(subtotal, currency);
  const finalTotal = Math.max(0, subtotal - discountAmount) + deliveryCharge;

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isShippingComplete =
    shippingName.trim().length >= 2 &&
    isValidEmail(shippingEmail) &&
    shippingPhone.trim().length >= 10 &&
    shippingAddress.trim().length >= 5 &&
    shippingPostal.trim().length >= 4;

  const canProceedToPayment = isShippingComplete;
  const canPlaceOrder = true;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName.trim() || !shippingEmail.trim() || !shippingPhone.trim() || !shippingAddress.trim() || !shippingPostal.trim()) {
      setCheckoutError('Please fill out all required shipping and packaging fields *');
      setTimeout(() => setCheckoutError(''), 4050);
      return;
    }
    setCheckoutError('');
    setStep(2);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (appliedCoupon) {
      if (!appliedCoupon.isActive) {
        setCheckoutError('The applied coupon is no longer active. Please remove it and try again.');
        setTimeout(() => setCheckoutError(''), 4050);
        return;
      }
      if (subtotal < convert(appliedCoupon.minPurchase)) {
        setCheckoutError(`Coupon requires a minimum purchase of ${symbol}${convert(appliedCoupon.minPurchase).toFixed(currency === 'PKR' ? 0 : 2)}.`);
        setTimeout(() => setCheckoutError(''), 4050);
        return;
      }
    }

    setCheckoutError('');
    setIsProcessing(true);

    const orderPayload: Order = {
      id: '',
      customerName: shippingName,
      customerEmail: shippingEmail,
      customerPhone: shippingPhone,
      shippingAddress: shippingAddress,
      city: shippingCity,
      postalCode: shippingPostal,
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: convert(item.product.price),
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        image: item.product.images[0]
      })),
      subtotal,
      discount: discountAmount,
      total: finalTotal,
      currency,
      paymentMethod,
      paymentStatus: 'Pending',
      status: 'Pending',
      date: new Date().toISOString(),
      notes: orderNotes
    };

    const result = await onSubmitOrder(orderPayload, appliedCoupon?.code);

    setIsProcessing(false);

    if (result.success && result.requiresPayment && result.checkoutUrl) {
      submitPaymentForm(result.checkoutUrl, result.formFields || {});
      return;
    }

    if (result.success && result.orderId) {
      setCreatedOrder({ ...orderPayload, id: result.orderId });
      setStep(3);
    } else {
      setCheckoutError(result.error || 'Failed to place order. Please try again.');
      setTimeout(() => setCheckoutError(''), 5000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-y-auto site-overlay backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6"
      id="checkout-wizard-modal"
    >
      <div className="site-panel bg-[var(--site-panel)] w-full max-w-3xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-[var(--site-border)] flex flex-col relative max-h-[95vh] sm:max-h-[92vh] text-[var(--site-ink)]">
        
        {/* Header containing progress tracks */}
        <div className="px-6 py-5 border-b border-[var(--site-border)] bg-[var(--site-surface-2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-[var(--site-ink)] uppercase tracking-wider">
              {step === 3 ? '🎉 Order Placed Successfully!' : '⚡ Secure Express Checkout'}
            </h2>
            <p className="text-xs text-[var(--site-muted)] font-sans">
              {step === 1 && 'Fill in your contact and physical shipping details'}
              {step === 2 && 'Review your basket metrics & select settlement method'}
              {step === 3 && 'Double-check receipt parameters and delivery windows'}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              step >= 1 ? 'bg-[var(--site-accent)] text-[var(--site-on-accent)] border-[var(--site-accent)]' : 'bg-[var(--site-surface)] text-[var(--site-muted)] border-[var(--site-border)]'
            }`}>
              1
            </span>
            <span className="w-6 h-0.5 bg-[var(--site-border)]" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              step >= 2 ? 'bg-[var(--site-accent)] text-[var(--site-on-accent)] border-[var(--site-accent)]' : 'bg-[var(--site-surface)] text-[var(--site-muted)] border-[var(--site-border)]'
            }`}>
              2
            </span>
            <span className="w-6 h-0.5 bg-[var(--site-border)]" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              step === 3 ? 'bg-[var(--site-accent)] text-[var(--site-on-accent)] border-[var(--site-accent)]' : 'bg-[var(--site-surface)] text-[var(--site-muted)] border-[var(--site-border)]'
            }`}>
              3
            </span>
          </div>
        </div>

        {/* Content body split layout */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-6">
          
          {/* LEFT COLUMN: Main Form Steps */}
          <div className="flex-1">
            
            {checkoutError && (
              <div id="checkout-error" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-750 text-xs font-semibold rounded-lg flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{checkoutError}</span>
              </div>
            )}
            
            {/* STEP 1: SHIPPING & CONTACT DETAILS */}
            {step === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <h3 className="font-display font-bold text-sm text-[var(--site-ink)] uppercase tracking-widest border-b border-[var(--site-border)] pb-2 mb-3">
                  1. Contact Information & Delivery Address
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--site-muted)] uppercase tracking-wider mb-1">
                      Full Customer Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="e.g. Ammar Younas"
                      className="site-input p-3 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--site-muted)] uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={shippingEmail}
                        onChange={(e) => setShippingEmail(e.target.value)}
                        placeholder="ammar@example.com"
                        className="site-input p-3 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--site-muted)] uppercase tracking-wider mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        required
                        type="tel"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        placeholder="e.g. +92 300 1234567"
                        className="site-input p-3 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--site-muted)] uppercase tracking-wider mb-1">
                      Detailed Shipping Address (Apartment, Street, Area) *
                    </label>
                    <input
                      required
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="e.g. House 42, Street 7, Sector F-11"
                      className="site-input p-3 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--site-muted)] uppercase tracking-wider mb-1">
                        Shipping City *
                      </label>
                      <select
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="site-input p-3 text-xs font-medium"
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Sialkot">Sialkot</option>
                        <option value="Quetta">Quetta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--site-muted)] uppercase tracking-wider mb-1">
                        Postal Code *
                      </label>
                      <input
                        required
                        type="text"
                        value={shippingPostal}
                        onChange={(e) => setShippingPostal(e.target.value)}
                        placeholder="e.g. 54000"
                        className="site-input p-3 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--site-muted)] uppercase tracking-wider mb-1">
                      Additional Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g., Please deliver after 2:30 PM, call upon arrival, fabric packaging specifications..."
                      rows={2}
                      className="site-input p-3 text-xs font-medium italic resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--site-border)] flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 border border-[var(--site-border)] hover:border-[var(--site-gold-soft)] text-[var(--site-ink)] text-xs font-semibold rounded-lg uppercase tracking-wider cursor-pointer bg-[var(--site-surface)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canProceedToPayment}
                    className={`px-6 py-3 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      canProceedToPayment
                        ? 'site-btn-primary cursor-pointer shadow-md hover:shadow-lg'
                        : 'bg-[var(--site-surface-2)] text-[var(--site-muted)] cursor-not-allowed'
                    }`}
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
                {!canProceedToPayment && (
                  <p className="text-[10px] text-[var(--site-muted)] text-right">
                    Fill all required fields to continue
                  </p>
                )}
              </form>
            )}

            {/* STEP 2: PAYMENT METHOD DEPLOYMENT */}
            {step === 2 && (
              <form onSubmit={handlePlaceOrder} className="space-y-5">
                <h3 className="font-display font-bold text-sm text-[var(--site-ink)] uppercase tracking-widest border-b border-[var(--site-border)] pb-2 mb-3">
                  2. Choose Payment Settlement Method
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('COD')} className={`p-4 border-2 rounded-xl text-left flex items-start gap-3 transition-all ${paymentMethod === 'COD' ? 'border-[var(--site-gold)] bg-[color-mix(in_srgb,var(--site-gold)_12%,transparent)]' : 'border-[var(--site-border)] hover:border-[var(--site-gold-soft)]'}`}>
                    <Truck size={22} className={paymentMethod === 'COD' ? 'text-[var(--site-gold)]' : 'text-[var(--site-muted)]'} />
                    <div>
                      <h4 className="font-bold text-sm text-[var(--site-ink)]">Cash on Delivery</h4>
                      <p className="text-xs text-[var(--site-muted)]">Pay when your order arrives</p>
                    </div>
                    {paymentMethod === 'COD' && <Check size={16} className="text-[var(--site-gold)] ml-auto" />}
                  </button>

                  <button type="button" onClick={() => setPaymentMethod('PAYFAST')} className={`p-4 border-2 rounded-xl text-left flex items-start gap-3 transition-all ${paymentMethod === 'PAYFAST' ? 'border-[var(--site-gold)] bg-[color-mix(in_srgb,var(--site-gold)_12%,transparent)]' : 'border-[var(--site-border)] hover:border-[var(--site-gold-soft)]'}`}>
                    <CreditCard size={22} className={paymentMethod === 'PAYFAST' ? 'text-[var(--site-gold)]' : 'text-[var(--site-muted)]'} />
                    <div>
                      <h4 className="font-bold text-sm text-[var(--site-ink)]">PayFast</h4>
                      <p className="text-xs text-[var(--site-muted)]">Cards, Raast & bank — via PayFast Pakistan</p>
                    </div>
                    {paymentMethod === 'PAYFAST' && <Check size={16} className="text-[var(--site-gold)] ml-auto" />}
                  </button>

                  <button type="button" onClick={() => setPaymentMethod('JAZZCASH')} className={`p-4 border-2 rounded-xl text-left flex items-start gap-3 transition-all ${paymentMethod === 'JAZZCASH' ? 'border-[var(--site-gold)] bg-[color-mix(in_srgb,var(--site-gold)_12%,transparent)]' : 'border-[var(--site-border)] hover:border-[var(--site-gold-soft)]'}`}>
                    <Smartphone size={22} className={paymentMethod === 'JAZZCASH' ? 'text-[var(--site-gold)]' : 'text-[var(--site-muted)]'} />
                    <div>
                      <h4 className="font-bold text-sm text-[var(--site-ink)]">JazzCash</h4>
                      <p className="text-xs text-[var(--site-muted)]">Mobile wallet & card via JazzCash</p>
                    </div>
                    {paymentMethod === 'JAZZCASH' && <Check size={16} className="text-[var(--site-gold)] ml-auto" />}
                  </button>
                </div>

                {(paymentMethod === 'PAYFAST' || paymentMethod === 'JAZZCASH') && (
                  <div className="p-4 bg-[color-mix(in_srgb,var(--site-gold)_12%,transparent)] border border-[var(--site-gold)] rounded-xl text-xs text-[var(--site-ink)] flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[var(--site-gold)]" />
                    You will be redirected to {paymentMethod === 'PAYFAST' ? 'PayFast' : 'JazzCash'} secure checkout to complete payment.
                  </div>
                )}

                {/* Processing/Submit panels */}
                <div className="pt-4 border-t border-[var(--site-border)] flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setStep(1)}
                    className="px-5 py-3 border border-[var(--site-border)] hover:border-[var(--site-gold-soft)] text-[var(--site-ink)] text-xs font-semibold rounded-lg uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 bg-[var(--site-surface)] disabled:opacity-50"
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing || !canPlaceOrder}
                    className={`px-6 py-3.5 text-sm font-bold rounded-lg uppercase tracking-wide flex items-center justify-center gap-2 min-w-[200px] transition-all ${
                      isProcessing
                        ? 'bg-[var(--site-cta)] text-[var(--site-cta-ink)] cursor-wait opacity-80'
                        : canPlaceOrder
                          ? 'site-btn-primary cursor-pointer shadow-lg hover:shadow-xl'
                          : 'bg-[var(--site-surface-2)] text-[var(--site-muted)] cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Placing Order...</span>
                      </>
                    ) : paymentMethod === 'COD' ? (
                      <>
                        <Truck size={16} />
                        <span>Place Order (COD)</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Pay via {paymentMethod === 'PAYFAST' ? 'PayFast' : 'JazzCash'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: CREATED SUCCESSFUL RECEIPT */}
            {step === 3 && createdOrder && (
              <div className="space-y-6 text-center animate-fade-in">
                <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full mb-1">
                  <Check size={40} className="stroke-[3]" />
                </div>
                
                <div>
                  <h3 className="font-display font-bold text-xl text-[var(--site-ink)] uppercase tracking-wide">
                    Excellent choice, {createdOrder.customerName}!
                  </h3>
                  <p className="text-xs text-[var(--site-muted)] mt-1 font-sans">
                    We have received your custom order basket and forwarded packing guidelines to our cotton warehouse.
                  </p>
                </div>

                <div className="p-5 bg-[var(--site-surface-2)] border border-[var(--site-border)] rounded-xl text-[var(--site-ink)] text-left space-y-4">
                  <div className="flex justify-between items-center bg-[var(--site-surface)] p-2.5 rounded-lg border border-[var(--site-border)] text-xs">
                    <span className="font-bold text-[var(--site-ink)]">TRACKING ORDER ID:</span>
                    <span className="font-mono text-[var(--site-gold)] font-bold bg-[var(--site-panel)] px-2 py-0.5 rounded shadow-xs">
                      {createdOrder.id}
                    </span>
                  </div>

                  {/* Summary parameters */}
                  <div className="space-y-2 text-xs border-b border-[var(--site-border)] pb-3">
                    <div className="flex justify-between">
                      <span className="text-[var(--site-muted)]">Contact Email:</span>
                      <span className="font-semibold text-[var(--site-ink)]">{createdOrder.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--site-muted)]">Shipping Location:</span>
                      <span className="font-semibold text-[var(--site-ink)] text-right max-w-[210px] line-clamp-1">{createdOrder.shippingAddress}, {createdOrder.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--site-muted)]">Selected Settlement:</span>
                      <span className="font-bold text-[var(--site-ink)] uppercase bg-[color-mix(in_srgb,var(--site-gold)_12%,transparent)] border border-[var(--site-gold)] px-1.5 rounded-sm">
                        {createdOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Card Verified'}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Delivery time frame */}
                  <div className="flex items-center gap-3 bg-[color-mix(in_srgb,var(--site-gold)_10%,transparent)] p-3 rounded-lg border border-[var(--site-gold-soft)] font-sans">
                    <Truck size={18} className="text-[var(--site-gold)] shrink-0" />
                    <div className="text-[11px]">
                      <h4 className="font-bold text-[var(--site-ink)]">Estimated Dispatch: tomorrow morning</h4>
                      <p className="text-[var(--site-muted)]">Our delivery partner usually contacts you 1 hour before dropping off items.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                  <button
                    onClick={onClose}
                    className="site-btn-primary px-6 py-3 text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer hover:shadow-md transition-colors"
                  >
                    Return to Storefront Catalog
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Interactive Summary Basket Card */}
          <div className="w-full md:w-76 shrink-0 bg-[var(--site-surface-2)] border border-[var(--site-border)] rounded-xl p-5 flex flex-col justify-between max-h-[380px] md:max-h-none">
            <div>
              <div className="flex items-center gap-1.5 border-b border-[var(--site-border)] pb-3 mb-4 text-[var(--site-ink)]">
                <ShoppingBag size={14} className="text-[var(--site-gold)]" />
                <h4 className="font-bold uppercase tracking-wider text-[10px] font-display">Basket Summary</h4>
              </div>

              {/* Items listing brief */}
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 mb-4" id="checkout-basket-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-2.5 items-center text-xs">
                    <img 
                      src={item.product.images[0]} 
                      alt="" 
                      className="w-10 h-10 object-cover rounded-md border border-[var(--site-border)] bg-[var(--site-surface)]" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--site-ink)] line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-[var(--site-muted)]">
                        {item.quantity}x • {item.selectedSize || 'Standard'}
                      </p>
                    </div>
                    <span className="font-bold text-[var(--site-ink)]">{symbol}{(convert(item.product.price) * item.quantity).toFixed(currency === 'PKR' ? 0 : 2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price items bottom calculation */}
            <div className="border-t border-[var(--site-border)] pt-3 space-y-2 text-xs font-sans">
              <div className="flex justify-between text-[var(--site-muted)]">
                <span>Subtotal Items</span>
                <span className="font-semibold text-[var(--site-ink)]">{symbol}{subtotal.toFixed(currency === 'PKR' ? 0 : 2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-650 font-bold">
                  <span>Coupon discount</span>
                  <span>-{symbol}{discountAmount.toFixed(currency === 'PKR' ? 0 : 2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--site-muted)]">
                <span>Shipping fee</span>
                <span className="text-[var(--site-ink)] font-medium font-sans">
                  {deliveryCharge === 0 ? 'FREE' : `${symbol}${deliveryCharge.toFixed(currency === 'PKR' ? 0 : 2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--site-ink)] border-t border-[var(--site-border)] pt-2.5">
                <span>Total checkout</span>
                <span className="text-base text-[var(--site-gold)] font-display font-black">{symbol}{finalTotal.toFixed(currency === 'PKR' ? 0 : 2)}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

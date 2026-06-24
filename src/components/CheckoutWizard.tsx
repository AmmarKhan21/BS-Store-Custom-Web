import React, { useState } from 'react';
import { CartItem, Coupon, Order } from '../types';
import { ShieldCheck, CreditCard, ShoppingBag, Truck, Check, AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface CheckoutWizardProps {
  cartItems: CartItem[];
  appliedCoupon: Coupon | null;
  onClose: () => void;
  onSubmitOrder: (order: Order) => void;
}

export default function CheckoutWizard({ cartItems, appliedCoupon, onClose, onSubmitOrder }: CheckoutWizardProps) {
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

  // Phase 2: Payment States
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Phase 3: Created Order State
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Compute total figures
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const deliveryCharge = subtotal >= 100 ? 0 : 5;
  const finalTotal = Math.max(0, subtotal - discountAmount) + deliveryCharge;

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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'CARD') {
      if (cardNumber.length < 16 || cardExpiry.length < 4 || cardCVV.length < 3 || !cardName.trim()) {
        setCheckoutError('Please provide a valid card number, expiration, and CVV *');
        setTimeout(() => setCheckoutError(''), 4050);
        return;
      }
    }

    setCheckoutError('');
    setIsProcessing(true);

    // Simulate standard card processing speed
    setTimeout(() => {
      const generatedId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: generatedId,
        customerName: shippingName,
        customerEmail: shippingEmail,
        customerPhone: shippingPhone,
        shippingAddress: shippingAddress,
        city: shippingCity,
        postalCode: shippingPostal,
        items: cartItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          image: item.product.images[0]
        })),
        subtotal,
        discount: discountAmount,
        total: finalTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'CARD' ? 'Paid' : 'Pending',
        status: 'Pending',
        date: new Date().toISOString(),
        notes: orderNotes
      };

      setCreatedOrder(newOrder);
      setIsProcessing(false);
      setStep(3);
      onSubmitOrder(newOrder);
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6"
      id="checkout-wizard-modal"
    >
      <div className="bg-white w-full max-w-3xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-205 flex flex-col relative max-h-[95vh] sm:max-h-[92vh]">
        
        {/* Header containing progress tracks */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 uppercase tracking-wider">
              {step === 3 ? '🎉 Order Placed Successfully!' : '⚡ Secure Express Checkout'}
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              {step === 1 && 'Fill in your contact and physical shipping details'}
              {step === 2 && 'Review your basket metrics & select settlement method'}
              {step === 3 && 'Double-check receipt parameters and delivery windows'}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              step >= 1 ? 'bg-indigo-650 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'
            }`}>
              1
            </span>
            <span className="w-6 h-0.5 bg-slate-200" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              step >= 2 ? 'bg-indigo-650 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'
            }`}>
              2
            </span>
            <span className="w-6 h-0.5 bg-slate-200" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              step === 3 ? 'bg-indigo-650 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'
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
                <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">
                  1. Contact Information & Delivery Address
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Full Customer Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="e.g. Ammar Younas"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={shippingEmail}
                        onChange={(e) => setShippingEmail(e.target.value)}
                        placeholder="ammar@example.com"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        required
                        type="tel"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        placeholder="e.g. +92 300 1234567"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Detailed Shipping Address (Apartment, Street, Area) *
                    </label>
                    <input
                      required
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="e.g. House 42, Street 7, Sector F-11"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Shipping City *
                      </label>
                      <select
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
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
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Postal Code *
                      </label>
                      <input
                        required
                        type="text"
                        value={shippingPostal}
                        onChange={(e) => setShippingPostal(e.target.value)}
                        placeholder="e.g. 54000"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Additional Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g., Please deliver after 2:30 PM, call upon arrival, fabric packaging specifications..."
                      rows={2}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 italic resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-150 flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 border border-slate-200 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg uppercase tracking-wider cursor-pointer"
                  >
                    Ca                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:shadow-md transition-colors"
                  >
                    <span>Proceed to Payment Select</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PAYMENT METHOD DEPLOYMENT */}
            {step === 2 && (
              <form onSubmit={handlePlaceOrder} className="space-y-5">
                <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">
                  2. Choose Payment Settlement Method
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option: Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 border rounded-xl cursor-pointer flex flex-col justify-between transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-indigo-600 bg-indigo-50/20 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800">
                        <Truck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</h4>
                        <p className="text-[10px] text-slate-500">Pay cash upon parcel dropoff at your door.</p>
                      </div>
                    </div>
                    {paymentMethod === 'COD' && (
                      <div className="mt-3 text-[10px] text-indigo-900 font-semibold bg-indigo-100/60 px-2 py-1 rounded self-start flex items-center gap-1">
                        <Check size={10} /> Active COD select
                      </div>
                    )}
                  </div>

                  {/* Option: Credit Card Secure gateway */}
                  <div
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-4 border rounded-xl cursor-pointer flex flex-col justify-between transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-indigo-600 bg-indigo-50/20 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white border border-slate-305 rounded-lg text-slate-800">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Online Card Gateway</h4>
                        <p className="text-[10px] text-slate-500">Supports Secure Visa, Master & UnionPay.</p>
                      </div>
                    </div>
                    {paymentMethod === 'CARD' && (
                      <div className="mt-3 text-[10px] text-indigo-900 font-semibold bg-indigo-100/60 px-2 py-1 rounded self-start flex items-center gap-1">
                        <Check size={10} /> Active Card select
                      </div>
                    )}
                  </div>
                </div>

                {/* Secure Gateway inputs on option CARD selected */}
                {paymentMethod === 'CARD' && (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Secure Bank SSL Connection</h4>
                      <div className="flex text-emerald-600 items-center gap-1 text-[10px] font-bold">
                        <ShieldCheck size={12} /> 128-Bit Encryption Private
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Cardholder Complete Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="e.g. AMMAR YOUNAS"
                        className="w-full p-2.5 bg-white border border-slate-250 rounded-lg font-medium tracking-wide placeholder-slate-400 capitalize text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Credit Card Number *
                      </label>
                      <input
                        required
                        type="text"
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="4214 •••• •••• 9842"
                        className="w-full p-2.5 bg-white border border-slate-250 rounded-lg font-mono font-medium tracking-widest placeholder-slate-400 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Expiry MM/YY *
                        </label>
                        <input
                          required
                          type="text"
                          maxLength={4}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, ''))}
                          placeholder="MMYY"
                          className="w-full p-2.5 bg-white border border-slate-250 rounded-lg font-mono font-medium tracking-widest placeholder-slate-400 text-center text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          CVV Security Code *
                        </label>
                        <input
                          required
                          type="password"
                          maxLength={3}
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full p-2.5 bg-white border border-slate-250 rounded-lg font-mono font-medium tracking-widest placeholder-slate-400 text-center text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing/Submit panels */}
                <div className="pt-4 border-t border-slate-200 flex justify-between gap-4">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setStep(1)}
                    className="px-5 py-3 border border-slate-200 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg uppercase tracking-wider cursor-pointer flex items-center gap-1 bg-white"
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-3 bg-indigo-650 hover:bg-indigo-705 disabled:bg-slate-200 text-white text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:shadow-md transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={13} />
                        <span>Processing Auth Security...</span>
                      </>
                    ) : (
                      <>
                        <span>Authorize & Place Order</span>
                        <Check size={13} />
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
                  <h3 className="font-display font-bold text-xl text-slate-900 uppercase tracking-wide">
                    Excellent choice, {createdOrder.customerName}!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-sans">
                    We have received your custom order basket and forwarded packing guidelines to our cotton warehouse.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 text-left space-y-4">
                  <div className="flex justify-between items-center bg-slate-200/50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900">TRACKING ORDER ID:</span>
                    <span className="font-mono text-indigo-900 font-bold bg-white px-2 py-0.5 rounded shadow-xs">
                      {createdOrder.id}
                    </span>
                  </div>

                  {/* Summary parameters */}
                  <div className="space-y-2 text-xs border-b border-slate-200 pb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contact Email:</span>
                      <span className="font-semibold text-slate-900">{createdOrder.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Shipping Location:</span>
                      <span className="font-semibold text-slate-900 text-right max-w-[210px] line-clamp-1">{createdOrder.shippingAddress}, {createdOrder.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Selected Settlement:</span>
                      <span className="font-bold text-slate-850 uppercase bg-indigo-50 border border-indigo-200 px-1.5 rounded-sm">
                        {createdOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Card Verified'}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Delivery time frame */}
                  <div className="flex items-center gap-3 bg-indigo-50/40 p-3 rounded-lg border border-indigo-200/60 font-sans">
                    <Truck size={18} className="text-indigo-600 shrink-0" />
                    <div className="text-[11px]">
                      <h4 className="font-bold text-indigo-900">Estimated Dispatch: tomorrow morning</h4>
                      <p className="text-slate-500">Our delivery partner usually contacts you 1 hour before dropping off items.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer hover:shadow-md transition-colors"
                  >
                    Return to Storefront Catalog
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Interactive Summary Basket Card */}
          <div className="w-full md:w-76 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between max-h-[380px] md:max-h-none">
            <div>
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 mb-4 text-slate-800">
                <ShoppingBag size={14} className="text-indigo-600" />
                <h4 className="font-bold uppercase tracking-wider text-[10px] font-display">Basket Summary</h4>
              </div>

              {/* Items listing brief */}
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 mb-4" id="checkout-basket-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-2.5 items-center text-xs">
                    <img 
                      src={item.product.images[0]} 
                      alt="" 
                      className="w-10 h-10 object-cover rounded-md border border-slate-200 bg-white" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.quantity}x • {item.selectedSize || 'Standard'}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price items bottom calculation */}
            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs font-sans">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Items</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-650 font-bold">
                  <span>Coupon discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping fee</span>
                <span className="text-slate-900 font-medium font-sans">
                  {subtotal >= 100 ? 'FREE' : `$${deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200/50 pt-2.5">
                <span>Total checkout</span>
                <span className="text-base text-indigo-700 font-display font-black">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

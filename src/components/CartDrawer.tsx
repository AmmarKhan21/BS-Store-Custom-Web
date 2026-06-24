import React, { useState } from 'react';
import { CartItem, Coupon } from '../types';
import { X, Trash2, Tag, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  onRemoveItem: (productId: string, size?: string, color?: string) => void;
  onProceedToCheckout: () => void;
  availableCoupons: Coupon[];
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  availableCoupons,
  appliedCoupon,
  onApplyCoupon,
}: CartDrawerProps) {
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  // Compute Cart math figures
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  // Calculate coupons
  let discountAmount = 0;
  if (appliedCoupon && appliedCoupon.isActive) {
    if (subtotal >= appliedCoupon.minPurchase) {
      if (appliedCoupon.discountType === 'percentage') {
        discountAmount = (subtotal * appliedCoupon.value) / 100;
      } else {
        discountAmount = appliedCoupon.value;
      }
    } else {
      // Automatic removal of coupon if subtotal falls below requirement limit
      onApplyCoupon(null);
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Handle checking validation of coupon code
  const handleValidateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const trimmedInput = couponCodeInput.trim().toUpperCase();
    if (!trimmedInput) return;

    const findCoupon = availableCoupons.find(c => c.code.toUpperCase() === trimmedInput);
    
    if (!findCoupon) {
      setCouponError('Invalid coupon code. Try BISMILLAH10 !');
      return;
    }

    if (!findCoupon.isActive) {
      setCouponError('This coupon discount code has expired.');
      return;
    }

    if (subtotal < findCoupon.minPurchase) {
      setCouponError(`Minimum purchase size of $${findCoupon.minPurchase} is required for this code.`);
      return;
    }

    onApplyCoupon(findCoupon);
    setCouponSuccess(`Coupon code "${trimmedInput}" applied successfully!`);
    setCouponCodeInput('');
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="shopping-cart-drawer">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10 animate-slide-in">
        <div className="w-screen max-w-md bg-white flex flex-col justify-between shadow-2xl border-l border-slate-200">
          
          {/* Header */}
          <div className="px-5 sm:px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-indigo-600" />
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 uppercase tracking-wide">
                Your Shopping Cart
              </h2>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
 
          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 text-center text-slate-500">
                <ShoppingBag size={48} className="text-slate-300 stroke-[1.5] mb-4" />
                <h3 className="font-semibold text-slate-800 text-sm mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">Browse our fine cotton wear and top athletic gear to fill your collection matches.</p>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-medium text-xs rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const itemTotal = item.product.price * item.quantity;
                return (
                  <div 
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                    className="flex gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors animate-fade-in"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-150 bg-white">
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h4 className="font-semibold text-xs text-slate-900 font-sans line-clamp-1">
                          {item.product.name}
                        </h4>
                        
                        {/* Config (Size, Color) */}
                        <div className="flex gap-2.5 mt-1 text-[10px] text-slate-500 font-medium">
                          {item.selectedSize && (
                            <span className="px-1.5 py-0.5 bg-slate-200/60 rounded text-slate-700">Size: {item.selectedSize}</span>
                          )}
                          {item.selectedColor && (
                            <span className="flex items-center gap-1 dropdown-text">
                              Color: 
                              <span 
                                style={{ backgroundColor: item.selectedColor }} 
                                className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block"
                              />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity tools and Line price */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded bg-white overflow-hidden scale-90 origin-left">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 text-slate-500 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 min-w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-2 py-1 text-slate-500 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        {/* Price tag */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-slate-400 font-medium">${item.product.price} x {item.quantity}</span>
                          <span className="font-semibold text-xs text-slate-900 font-sans">${itemTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete block */}
                    <button
                      onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                      className="text-slate-400 hover:text-red-500 p-1 mt-1 transition-colors self-start cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing parameters and controls */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-250 bg-slate-50 px-6 py-5 space-y-4">
              
              {/* Promo Coupon Form */}
              <form onSubmit={handleValidateCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="ENTER PROMO (e.g. BISMILLAH10)"
                      className="w-full text-xs py-2 pl-8 pr-3.5 bg-white border border-slate-200 rounded-lg placeholder-slate-400 text-slate-800 uppercase font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {couponError && <p className="text-[10px] text-red-600 font-semibold">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold">{couponSuccess}</p>}

                {appliedCoupon && (
                  <div className="flex items-center justify-between p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-950 font-bold">
                      <Tag size={11} className="text-indigo-600" />
                      <span>Code "{appliedCoupon.code}" Active</span>
                      <span className="text-[10px] bg-indigo-600 text-white font-mono font-medium px-1.5 py-0.2 rounded">
                        {appliedCoupon.discountType === 'percentage' ? `-${appliedCoupon.value}%` : `-$${appliedCoupon.value}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-slate-500 hover:text-red-600 font-bold underline cursor-pointer"
                    >
                      Remove Code
                    </button>
                  </div>
                )}
              </form>

              {/* Price Calculations */}
              <div className="space-y-2.5 text-sm pt-2 border-t border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Amount</span>
                  <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Coupon Applied Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Delivery</span>
                  <span className="text-emerald-600 font-semibold text-xs">
                    {subtotal >= 100 ? 'FREE DELIVERY OVER $100' : '$5.00 Standard'}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-slate-950 pt-2 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span className="text-lg text-indigo-750 font-display font-black">
                    ${(finalTotal + (subtotal >= 100 || subtotal === 0 ? 0 : 5)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout buttons */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer uppercase tracking-wider"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

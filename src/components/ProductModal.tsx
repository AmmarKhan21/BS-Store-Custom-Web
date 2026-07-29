import React, { useEffect, useState } from 'react';
import { Product, Review } from '../types';
import { Star, X, ShoppingCart, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  onAddReview: (productId: string, review: Review) => void;
}

export default function ProductModal({ product, onClose, onAddToCart, onAddReview }: ProductModalProps) {
  const { format } = useCurrency();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);

  const [reviewerName, setReviewerName] = useState('');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');
  const [reviewErrorMessage, setReviewErrorMessage] = useState('');

  const isOutOfStock = product.stock <= 0;
  const saveAmount =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleAddToCartSubmit = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
    onClose();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !commentInput.trim()) {
      setReviewErrorMessage('Please provide your name and some feedback comments!');
      setTimeout(() => setReviewErrorMessage(''), 4000);
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      reviewerName: reviewerName.trim(),
      rating: ratingInput,
      comment: commentInput.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    onAddReview(product.id, newReview);
    setReviewerName('');
    setCommentInput('');
    setRatingInput(5);
    setReviewErrorMessage('');
    setReviewSuccessMessage('Review added successfully! Thank you for your feedback.');
    setTimeout(() => setReviewSuccessMessage(''), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-slate-900/65 backdrop-blur-sm"
      id="product-quickview-modal"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-full items-start justify-center px-3 py-4 sm:items-center sm:px-4 sm:py-6 md:p-6">
        <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:max-h-[90vh] md:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-[5] rounded-full bg-slate-100 p-2.5 text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="w-full shrink-0 border-b border-slate-100 bg-slate-50 p-4 sm:p-6 md:w-1/2 md:border-r md:border-b-0">
            <div className="relative mx-auto aspect-square max-h-[36svh] w-full overflow-hidden rounded-xl border border-slate-100 bg-white md:max-h-none">
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1" id="thumbnails-tray">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white transition-all sm:h-16 sm:w-16 ${
                      selectedImage === img
                        ? 'border-[#0e3d34] ring-2 ring-[#0e3d34]/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 hidden space-y-2.5 border-t border-slate-200 pt-4 text-xs text-slate-600 md:block">
              <div className="flex items-center gap-2.5">
                <Truck size={14} className="text-[#1f6b55]" />
                <span>Free Delivery across Pakistan for orders above $100</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={14} className="text-[#1f6b55]" />
                <span>100% Genuine Guarantee</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw size={14} className="text-[#1f6b55]" />
                <span>Easy 7-Day Refund/Exchange Window</span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col p-4 sm:p-5 md:min-h-0 md:w-1/2 md:overflow-y-auto md:overscroll-contain md:p-6">
            <span className="mb-1.5 block text-[10px] font-bold tracking-widest text-[#1f6b55] uppercase">
              {product.category}
            </span>
            <h2 className="mb-2 font-display text-xl leading-tight font-bold text-slate-900 md:text-2xl">
              {product.name}
            </h2>

            <div className="mb-4 flex items-center gap-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                    className={i < Math.round(product.rating) ? 'text-amber-500' : 'text-slate-300'}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {product.rating.toFixed(1)} Rating
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500">{product.reviews.length} written reviews</span>
            </div>

            <div className="mb-5 flex flex-wrap items-baseline gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5">
              <span className="text-2xl font-bold text-slate-900">{format(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="font-medium text-slate-400 line-through">
                    {format(product.originalPrice)}
                  </span>
                  {saveAmount > 0 && (
                    <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      Save {format(saveAmount)}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="mb-5">
              <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-800 uppercase">
                Product Details
              </h4>
              <p className="font-sans text-xs leading-relaxed text-slate-600 md:text-sm">
                {product.description}
              </p>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                    Select Style Size
                  </h4>
                  <span className="shrink-0 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                    {selectedSize}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2" id="size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedSize === size
                          ? 'border-[#0e3d34] bg-[#0e3d34] text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-800 uppercase">
                  Select Style Color
                </h4>
                <div className="flex items-center gap-2.5" id="color-options">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 transition-all focus:outline-none ${
                        selectedColor === color
                          ? 'scale-110 shadow-xs ring-2 ring-[#0e3d34] ring-offset-2'
                          : 'hover:scale-105'
                      }`}
                      title={color}
                    >
                      {selectedColor === color && (
                        <Check
                          size={12}
                          className={color.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6 border-t border-slate-150 pt-5" id="buy-action-panel">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-bold tracking-wider text-slate-800 uppercase">
                  Configure Quantity
                </span>
                <span
                  className={`font-semibold ${
                    isOutOfStock
                      ? 'text-red-500'
                      : product.stock < 10
                        ? 'text-amber-500'
                        : 'text-emerald-600'
                  }`}
                >
                  {isOutOfStock
                    ? 'Sold Out'
                    : product.stock < 10
                      ? `Only ${product.stock} items left!`
                      : 'In Stock'}
                </span>
              </div>

              <div className="flex gap-3">
                <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    disabled={isOutOfStock || quantity <= 1}
                    className="p-3.5 text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-11 select-none px-4 py-1 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="p-3.5 text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCartSubmit}
                  disabled={isOutOfStock}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0e3d34] px-5 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#145a4a] hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <ShoppingCart size={16} />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-slate-200 pt-4 text-xs text-slate-600 md:hidden">
              <div className="flex items-center gap-2.5">
                <Truck size={14} className="shrink-0 text-[#1f6b55]" />
                <span>Free Delivery across Pakistan for orders above $100</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={14} className="shrink-0 text-[#1f6b55]" />
                <span>100% Genuine Guarantee</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw size={14} className="shrink-0 text-[#1f6b55]" />
                <span>Easy 7-Day Refund/Exchange</span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6 pb-2">
              <h3 className="mb-4 font-display text-base font-bold tracking-wider text-slate-900 uppercase">
                Customer Feedbacks ({product.reviews.length})
              </h3>

              <div className="mb-6 max-h-[220px] space-y-4 overflow-y-auto pr-1" id="reviews-feed">
                {product.reviews.length === 0 ? (
                  <p className="py-2 text-xs text-slate-500 italic">
                    No reviews have been written for this product yet. Be the first to share your
                    experience!
                  </p>
                ) : (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="rounded-lg border border-slate-150 bg-slate-50 p-3">
                      <div className="mb-1 flex items-center justify-between rounded bg-slate-100/40 px-2 py-0.5">
                        <span className="text-xs font-bold text-slate-800">{rev.reviewerName}</span>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              fill={i < rev.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600">{rev.comment}</p>
                      <span className="mt-1 block text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-3">
                {reviewSuccessMessage && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    {reviewSuccessMessage}
                  </p>
                )}
                {reviewErrorMessage && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                    {reviewErrorMessage}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="Your name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#0e3d34] focus:ring-1 focus:ring-[#0e3d34]/20"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Rating
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRatingInput(n)}
                        className="text-amber-500"
                      >
                        <Star size={16} fill={n <= ratingInput ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Share your experience…"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#0e3d34] focus:ring-1 focus:ring-[#0e3d34]/20"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 py-3 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-slate-800"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

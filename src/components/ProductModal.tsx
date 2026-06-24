import React, { useState } from 'react';
import { Product, Review } from '../types';
import { Star, X, ShoppingCart, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  onAddReview: (productId: string, review: Review) => void;
}

export default function ProductModal({ product, onClose, onAddToCart, onAddReview }: ProductModalProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  
  // Review writer state
  const [reviewerName, setReviewerName] = useState('');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');
  const [reviewErrorMessage, setReviewErrorMessage] = useState('');

  const isOutOfStock = product.stock <= 0;

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCartSubmit = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
    // Dynamic close after small comfort feedback
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
      date: new Date().toISOString().split('T')[0]
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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 template-modal"
      id="product-quickview-modal"
    >
      <div className="bg-white w-full max-w-4xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-[5] p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Left Side: Product Images Portfolio */}
        <div className="w-full md:w-1/2 p-6 bg-slate-50 flex flex-col justify-between">
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-white shadow-xs border border-slate-100 relative">
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-300" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Mini-thumbnails portfolio slider */}
          {product.images.length > 1 && (
            <div className="flex gap-3.5 mt-4 overflow-x-auto pb-1" id="thumbnails-tray">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-md overflow-hidden bg-white border cursor-pointer shrink-0 transition-all ${
                    selectedImage === img ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Guarantee Highlights */}
          <div className="mt-6 space-y-2.5 border-t border-slate-200 pt-4 text-xs text-slate-600 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Truck size={14} className="text-indigo-600" />
              <span>Free Delivery across Pakistan for orders above $100</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={14} className="text-indigo-600" />
              <span>100% Genuine Guarantee - Fine Cotton Collection Checked</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw size={14} className="text-indigo-600" />
              <span>Easy 7-Day Refund/Exchange Window</span>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration & Interactive reviews */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col justify-between md:max-h-[85vh] md:overflow-y-auto">
          {/* Main Info */}
          <div>
            <span className="text-[10px] tracking-widest uppercase font-bold text-indigo-650 mb-1.5 block">
              {product.category}
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 leading-tight mb-2">
              {product.name}
            </h2>

            {/* Stars rating total */}
            <div className="flex items-center gap-2 mb-4">
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
              <span className="text-xs text-slate-500">
                {product.reviews.length} written reviews
              </span>
            </div>

            {/* Price Tag with discount review */}
            <div className="flex items-baseline gap-3 mb-5 py-2.5 px-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-2xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-slate-400 font-medium line-through">${product.originalPrice.toFixed(2)}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-650 rounded">
                    Save ${ (product.originalPrice - product.price).toFixed(2) }
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Product Details</h4>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">{product.description}</p>
            </div>

            {/* Interactivity: Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Style Size</h4>
                  <span className="text-[11px] font-semibold text-slate-550">{selectedSize}</span>
                </div>
                <div className="flex gap-2 flex-wrap" id="size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'border-indigo-650 bg-indigo-600 text-white shadow-xs'
                          : 'border-slate-200 text-slate-750 hover:border-slate-400 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactivity: Color Picker */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Style Color</h4>
                </div>
                <div className="flex gap-2.5 items-center" id="color-options">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full border border-slate-300 relative transition-all cursor-pointer focus:outline-none flex items-center justify-center ${
                        selectedColor === color 
                          ? 'scale-110 ring-2 ring-indigo-600 ring-offset-2 shadow-xs' 
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

            {/* Interactive Buy Tray */}
            <div className="border-t border-slate-150 pt-5 mb-6" id="buy-action-panel">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider">Configure Quantity</span>
                <span className={`font-semibold ${
                  isOutOfStock 
                    ? 'text-red-500' 
                    : product.stock < 10 
                      ? 'text-amber-500' 
                      : 'text-emerald-600'
                }`}>
                  {isOutOfStock ? 'Sold Out' : product.stock < 10 ? `Only ${product.stock} items left!` : 'In Stock'}
                </span>
              </div>

              <div className="flex gap-3">
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                  <button
                    onClick={handleDecreaseQuantity}
                    disabled={isOutOfStock || quantity <= 1}
                    className="p-3.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-1 text-sm font-bold text-slate-900 w-11 text-center select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQuantity}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="p-3.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCartSubmit}
                  disabled={isOutOfStock}
                  className="flex-1 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-all hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Shopping Cart'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Segment: Interactive reviews & rating logs */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-display font-bold text-base text-slate-900 mb-4 uppercase tracking-wider">
              Customer Feedbacks ({product.reviews.length})
            </h3>

            {/* List Reviews */}
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 mb-6" id="reviews-feed">
              {product.reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No reviews have been written for this product yet. Be the first to share your experience!</p>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                    <div className="flex justify-between items-center mb-1 bg-slate-100/40 px-2 py-0.5 rounded">
                      <span className="font-bold text-xs text-slate-800">{rev.reviewerName}</span>
                      <span className="text-[10px] text-slate-500">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-500 mb-1.5 shrink-0 px-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={10} 
                          fill={i < rev.rating ? 'currentColor' : 'none'} 
                          className={i < rev.rating ? 'text-amber-500' : 'text-slate-305'}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 font-sans leading-relaxed px-2 pl-2 border-l-2 border-indigo-600/40">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Form to post reviews */}
            <form onSubmit={handleSubmitReview} className="p-4 bg-slate-50 border border-slate-250 rounded-xl">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Write a Customer Review</h4>
              
              {reviewSuccessMessage && (
                <div className="mb-3 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100">
                  {reviewSuccessMessage}
                </div>
              )}

              {reviewErrorMessage && (
                <div className="mb-3 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-100">
                  {reviewErrorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Reviewer Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Salim Siddiqui"
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 italic text-slate-800"
                  />
                </div>
                {/* Clickable Rating Selector */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Your Rating</label>
                  <div className="flex gap-1.5 items-center h-9">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRatingInput(starVal)}
                        className="text-amber-500 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                      >
                        <Star 
                          size={18} 
                          fill={starVal <= ratingInput ? 'currentColor' : 'none'}
                          className={starVal <= ratingInput ? 'text-amber-500' : 'text-slate-300'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-500 ml-1">({ratingInput}/5)</span>
                  </div>
                </div>
              </div>

              {/* Comment text */}
              <div className="mb-3">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1 font-display">Your Written Feedback</label>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Share details about the fabric soft quality, weight, fittings, or overall comfort feel..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 italic resize-none text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors uppercase tracking-wider"
              >
                Submit Review
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

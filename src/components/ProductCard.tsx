import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { Star, ShoppingCart, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  key?: string;
  product: Product;
  onOpenQuickView: (product: Product) => void;
  onAddToCartDirectly: (product: Product) => void;
}

export default function ProductCard({ product, onOpenQuickView, onAddToCartDirectly }: ProductCardProps) {
  const { format } = useCurrency();
  // Calculate discount percentage if original price exists
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg flex flex-col relative"
      id={`product-card-${product.id}`}
    >
      {/* Badges container */}
      <div className="absolute top-3 left-3 z-[2] flex flex-col gap-1.5 pointer-events-none">
        {discountPercent > 0 && (
          <span className="bg-red-500 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            Save {discountPercent}%
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-indigo-600 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
            <Sparkles size={8} /> Featured
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-slate-500 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            Sold Out
          </span>
        )}
      </div>

      {/* Main product photo viewer with overlay actions */}
      <div 
        onClick={() => onOpenQuickView(product)}
        className="relative aspect-square w-full bg-slate-50 overflow-hidden cursor-pointer" 
        id={`img-container-${product.id}`}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Soft elegant vignette */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Hover Action Triggers */}
        <div className="absolute inset-0 bg-transparent flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="p-3 bg-white hover:bg-indigo-50 text-slate-900 rounded-full shadow-md hover:text-indigo-600 transition-colors cursor-pointer"
            title="Quick View Details"
          >
            <Eye size={18} />
          </button>
          {!isOutOfStock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCartDirectly(product);
              }}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-colors cursor-pointer"
              title="Quick Add to Cart"
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Product Content info panel */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category title */}
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 mb-1 block">
            {product.category}
          </span>
          {/* Main Name */}
          <h3 
            className="font-display font-semibold text-slate-900 group-hover:text-indigo-600 text-[13px] sm:text-sm md:text-base leading-snug line-clamp-2 mb-1.5 transition-colors"
          >
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>

          {/* Rating system */}
          <div className="flex items-center gap-1 mb-2.5">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={10} 
                  fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} 
                  className={i < Math.round(product.rating) ? 'text-amber-500' : 'text-slate-300'}
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              ({product.reviews.length || 0})
            </span>
          </div>
        </div>

        {/* Price Tag with actions */}
        <div className="border-t border-slate-150 pt-2.5 flex flex-row items-center justify-between gap-2">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-slate-900">
              {format(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {format(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCartDirectly(product);
            }}
            className={`text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-center ${
              isOutOfStock 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-indigo-650 shadow-sm'
            }`}
          >
            {isOutOfStock ? 'Sold Out' : 'Buy'}
          </button>
        </div>
      </div>
    </div>
  );
}

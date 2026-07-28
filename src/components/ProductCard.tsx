import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { Star, ShoppingCart, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  key?: string;
  product: Product;
  onOpenQuickView: (product: Product) => void;
  onAddToCartDirectly: (product: Product) => void;
  index?: number;
}

export default function ProductCard({
  product,
  onOpenQuickView,
  onAddToCartDirectly,
  index = 0,
}: ProductCardProps) {
  const { format } = useCurrency();
  const cardRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 220, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 220, damping: 18 });
  const glareBg = useTransform([springX, springY], ([rx, ry]) => {
    const x = 50 + Number(ry) * 2.5;
    const y = 50 - Number(rx) * 2.5;
    return `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.55), transparent 55%)`;
  });

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const isOutOfStock = product.stock <= 0;

  const handleMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 14);
    rotateY.set((px - 0.5) * 14);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
        perspective: 900,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#1a332e]/12 bg-[#faf8f4] shadow-[0_8px_30px_-12px_rgba(6,22,20,0.25)] transition-shadow duration-300 hover:shadow-[0_20px_50px_-18px_rgba(6,22,20,0.4)]"
      id={`product-card-${product.id}`}
    >
      <div className="pointer-events-none absolute left-3 top-3 z-[2] flex flex-col gap-1.5">
        {discountPercent > 0 && (
          <span className="rounded-full bg-[#b4533a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Save {discountPercent}%
          </span>
        )}
        {product.isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0e3d34] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e2c08a]">
            <Sparkles size={8} /> Featured
          </span>
        )}
        {isOutOfStock && (
          <span className="rounded-full bg-slate-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Sold Out
          </span>
        )}
      </div>

      <div
        onClick={() => onOpenQuickView(product)}
        className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden bg-[#e8e4dc]"
        id={`img-container-${product.id}`}
        style={{ transform: 'translateZ(24px)' }}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBg }}
        />

        <div className="absolute inset-0 flex translate-y-3 items-center justify-center gap-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="cursor-pointer rounded-full bg-white/95 p-3 text-[#0e3d34] shadow-lg transition-colors hover:bg-[#f4efe6]"
            title="Quick View"
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
              className="cursor-pointer rounded-full bg-[#0e3d34] p-3 text-[#e2c08a] shadow-lg transition-colors hover:bg-[#145a4a]"
              title="Add to Cart"
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4" style={{ transform: 'translateZ(16px)' }}>
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b7355]">
            {product.category}
          </span>
          <h3 className="mb-1.5 line-clamp-2 font-display text-[13px] font-semibold leading-snug text-[#0e1f1c] transition-colors group-hover:text-[#1f6b55] sm:text-sm md:text-base">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <div className="mb-2.5 flex items-center gap-1">
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

        <div className="flex flex-row items-center justify-between gap-2 border-t border-[#1a332e]/10 pt-2.5">
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="text-sm font-bold text-[#0e1f1c] sm:text-base">{format(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-slate-400 line-through sm:text-xs">
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
            className={`cursor-pointer rounded-full px-3 py-1.5 text-center text-[10px] font-bold transition-all sm:text-xs ${
              isOutOfStock
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-[#0e3d34] text-[#f4efe6] hover:bg-[#145a4a]'
            }`}
          >
            {isOutOfStock ? 'Sold Out' : 'Buy'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

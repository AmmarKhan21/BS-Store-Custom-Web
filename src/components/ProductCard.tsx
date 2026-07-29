import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { Star, ShoppingCart, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
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
  const springX = useSpring(rotateX, { stiffness: 240, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 240, damping: 20 });
  const glareBg = useTransform([springX, springY], ([rx, ry]) => {
    const x = 50 + Number(ry) * 2.5;
    const y = 50 - Number(rx) * 2.5;
    return `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.45), transparent 55%)`;
  });

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const isOutOfStock = product.stock <= 0;

  const handleMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 5);
    rotateY.set((px - 0.5) * 5);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-36px' }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
        perspective: 900,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="store-card group relative flex flex-col overflow-hidden"
      id={`product-card-${product.id}`}
    >
      <div className="pointer-events-none absolute top-3 left-3 z-[2] flex flex-col gap-1.5">
        {discountPercent > 0 && (
          <span className="rounded-full bg-[#b4533a] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
            Save {discountPercent}%
          </span>
        )}
        {product.isFeatured && (
          <span className="store-btn-accent inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase">
            <Sparkles size={8} /> Featured
          </span>
        )}
        {isOutOfStock && (
          <span className="rounded-full bg-[var(--store-muted)] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
            Sold Out
          </span>
        )}
      </div>

      <div
        onClick={() => onOpenQuickView(product)}
        className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden"
        style={{ background: 'var(--store-img-bg)', transform: 'translateZ(20px)' }}
        id={`img-container-${product.id}`}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          referrerPolicy="no-referrer"
        />
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBg }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--store-surface)]/80 to-transparent opacity-80" />

        <div className="absolute inset-0 flex translate-y-3 items-center justify-center gap-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="cursor-pointer rounded-full bg-[var(--store-surface)] p-3 text-[var(--store-ink)] shadow-lg ring-1 ring-[var(--store-border)] transition hover:scale-105"
            title="Quick View"
          >
            <Eye size={17} />
          </button>
          {!isOutOfStock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCartDirectly(product);
              }}
              className="store-btn-primary cursor-pointer rounded-full p-3 shadow-lg transition hover:scale-105"
              title="Add to Cart"
            >
              <ShoppingCart size={17} />
            </button>
          )}
        </div>
      </div>

      <div
        className="flex flex-1 flex-col justify-between p-3.5 sm:p-4"
        style={{ transform: 'translateZ(14px)' }}
      >
        <div>
          <span className="mb-1 block text-[10px] font-bold tracking-[0.2em] text-[var(--store-accent)] uppercase">
            {product.category}
          </span>
          <h3 className="mb-1.5 line-clamp-2 font-display text-[13px] font-semibold leading-snug text-[var(--store-ink)] transition-colors group-hover:text-[var(--store-accent-2)] sm:text-sm md:text-[15px]">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <div className="mb-2.5 flex items-center gap-1">
            <div className="flex text-[var(--store-accent)]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                  className={
                    i < Math.round(product.rating) ? '' : 'text-[var(--store-muted)] opacity-30'
                  }
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-[var(--store-muted)]">
              ({product.reviews.length || 0})
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-2 border-t border-[var(--store-border)] pt-2.5">
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="text-sm font-bold text-[var(--store-ink)] sm:text-base">
              {format(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-[var(--store-muted)] line-through sm:text-xs">
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
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-center text-[10px] font-bold tracking-wide transition sm:text-xs ${
              isOutOfStock
                ? 'cursor-not-allowed bg-[var(--store-surface-2)] text-[var(--store-muted)]'
                : 'store-btn-primary hover:brightness-110'
            }`}
          >
            {isOutOfStock ? 'Sold Out' : 'Buy'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

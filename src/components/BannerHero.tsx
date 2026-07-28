import React, { Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight, MousePointer2 } from 'lucide-react';
import { Product } from '../types';
import GalleryErrorBoundary from './GalleryErrorBoundary';

const ProductGallery3D = lazy(() => import('./ProductGallery3D'));

interface BannerHeroProps {
  onSelectCategory: (category: string) => void;
  activeCategory: string;
  products: Product[];
  onOpenProduct: (product: Product) => void;
}

export default function BannerHero({
  onSelectCategory,
  products,
  onOpenProduct,
}: BannerHeroProps) {
  const shopCotton = () => {
    onSelectCategory('Cotton Collection');
    document.getElementById('store-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const shopSports = () => {
    onSelectCategory('Sports Wear');
    document.getElementById('store-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative w-full min-h-[100svh] overflow-hidden bg-[#061614]"
      id="banner-hero-container"
      aria-label="Bismillah Cotton and Sports Hub"
    >
      {/* Atmosphere */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 75% 45%, #0f3d34 0%, #061614 55%, #040f0d 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute -right-10 top-10 h-[60vmin] w-[60vmin] rounded-full blur-3xl opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(201,166,107,0.45), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute left-0 bottom-0 h-[40vmin] w-[40vmin] rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(46,157,124,0.5), transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1400px] grid-cols-1 items-center gap-2 px-4 pb-20 pt-24 md:grid-cols-2 md:gap-6 md:px-8 md:pb-16 lg:px-12">
        {/* Brand copy */}
        <div className="order-2 md:order-1">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.8rem,7vw,5.25rem)] font-semibold leading-[0.9] tracking-tight text-[#f4efe6]"
          >
            Bismillah
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="mt-2 font-display text-[clamp(1rem,2.5vw,1.6rem)] font-medium uppercase tracking-[0.2em] text-[#c9a66b]"
          >
            Cotton & Sports Hub
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-7 max-w-md font-sans text-lg font-medium leading-snug text-[#e8e2d6] md:text-xl"
          >
            Spin our collection in 3D
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-3 max-w-md text-sm leading-relaxed text-[#b8b0a0] md:text-[15px]"
          >
            Drag the carousel, click any piece, and shop Egyptian cotton or sportswear — COD across Pakistan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.38 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <button
              type="button"
              onClick={shopCotton}
              className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#c9a66b] px-7 py-3.5 text-sm font-bold text-[#0a1a16] transition-all hover:bg-[#e2c08a]"
            >
              Shop cotton
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={shopSports}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#f4efe6]/35 px-7 py-3.5 text-sm font-bold text-[#f4efe6] transition-all hover:bg-white/5"
            >
              Shop sports
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#8a9a94] md:flex"
          >
            <MousePointer2 size={14} className="text-[#c9a66b]" />
            Drag right panel to explore products
          </motion.p>
        </div>

        {/* Visible 3D product carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 relative h-[58vh] min-h-[360px] w-full md:order-2 md:h-[78vh] md:min-h-[520px]"
        >
          <div className="absolute inset-0 rounded-3xl border border-[#c9a66b]/20 bg-[#0a221e]/40 shadow-[0_0_80px_-20px_rgba(201,166,107,0.45)] backdrop-blur-[2px]">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#c9a66b] border-t-transparent" />
                </div>
              }
            >
              <GalleryErrorBoundary>
                <ProductGallery3D products={products} onSelectProduct={onOpenProduct} />
              </GalleryErrorBoundary>
            </Suspense>
          </div>
        </motion.div>
      </div>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        onClick={() =>
          document.getElementById('store-grid-section')?.scrollIntoView({ behavior: 'smooth' })
        }
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-1 text-[#b8b0a0]"
        aria-label="Scroll to products"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Shop all</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={16} />
        </motion.span>
      </motion.button>
    </section>
  );
}

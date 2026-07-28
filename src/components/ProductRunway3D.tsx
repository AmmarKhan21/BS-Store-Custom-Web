import React, { Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { Hand } from 'lucide-react';
import { Product } from '../types';

import GalleryErrorBoundary from './GalleryErrorBoundary';

const ProductGallery3D = lazy(() => import('./ProductGallery3D'));

type Props = {
  products: Product[];
  onOpen: (product: Product) => void;
};

export default function ProductRunway3D({ products, onOpen }: Props) {
  const list = products.slice(0, 8);

  return (
    <section
      className="relative overflow-hidden bg-[#0a1f1b] py-14 md:py-20"
      aria-label="3D product runway"
      id="product-3d-runway"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(201,166,107,0.2), transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(31,107,85,0.35), transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-6 flex flex-col items-center text-center md:mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a66b]">
            Live 3D runway
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#f4efe6] md:text-5xl">
            Touch the collection
          </h2>
          <p className="mt-3 flex max-w-md items-center justify-center gap-2 text-sm text-[#b8c9c2]">
            <Hand size={14} className="text-[#c9a66b]" />
            Drag to rotate · Tap a product to open it
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto h-[420px] w-full overflow-hidden rounded-[2rem] border border-[#c9a66b]/25 bg-[#061614]/70 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] sm:h-[480px] md:h-[560px]"
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-[#c9a66b]">
                Loading 3D gallery…
              </div>
            }
          >
            <GalleryErrorBoundary>
              <ProductGallery3D products={list} onSelectProduct={onOpen} />
            </GalleryErrorBoundary>
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
}

import React, { useMemo } from 'react';
import { motion, useTransform, MotionValue } from 'motion/react';
import { Product } from '../types';
import { DARAZ_TROPHY, TROPHY_REVEAL_BEATS } from '../data/darazTrophies';
import { useCurrency } from '../context/CurrencyContext';

/** Clamp keyframes to [0,1] and force strictly increasing (WAAPI / Motion requirement). */
function clampKeys(keys: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < keys.length; i++) {
    let v = Math.min(1, Math.max(0, keys[i]));
    if (i > 0 && v <= out[i - 1]) {
      v = Math.min(1, out[i - 1] + 0.001);
    }
    out.push(v);
  }
  return out;
}

function RevealFrame({
  progress,
  start,
  end,
  src,
  alt,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  src: string;
  alt: string;
}) {
  const fadeKeys = clampKeys([start, start + 0.03, end - 0.03, end]);
  const opacity = useTransform(progress, fadeKeys, [0, 1, 1, 0]);
  const scale = useTransform(progress, clampKeys([start, end]), [0.92, 1.06]);
  const rotateY = useTransform(progress, clampKeys([start, end]), [-8, 8]);
  const y = useTransform(progress, clampKeys([start, end]), [40, -20]);

  return (
    <motion.div
      style={{ opacity, scale, rotateY, y, transformStyle: 'preserve-3d' }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative h-[58vh] w-[min(78vw,340px)] overflow-hidden rounded-sm border border-[#c9a66b]/35 bg-[#0a1613] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background:
              'radial-gradient(ellipse at 40% 20%, rgba(245,180,80,0.18), transparent 55%)',
          }}
        />
        <img
          src={src}
          alt={alt}
          className="relative z-[1] h-full w-full object-cover"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-1/3 bg-gradient-to-t from-[#050d0b] to-transparent" />
      </div>
    </motion.div>
  );
}

function SpecPlaque({
  progress,
  start,
  end,
  text,
  side,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  text: string;
  side: 'left' | 'right';
}) {
  const mid = start + (end - start) * 0.35;
  const mid2 = start + (end - start) * 0.75;
  const opacity = useTransform(progress, clampKeys([start, mid, mid2, end]), [0, 1, 1, 0]);
  const x = useTransform(progress, clampKeys([start, end]), [side === 'left' ? -36 : 36, 0]);

  return (
    <motion.div
      style={{ opacity, x }}
      className={`pointer-events-none absolute top-[22%] z-20 max-w-[200px] rounded-md border border-[#c9a66b]/35 bg-[#050d0b]/60 px-4 py-3 backdrop-blur-md ${
        side === 'left' ? 'left-4 md:left-14' : 'right-4 md:right-14'
      }`}
    >
      <div className="mb-2 h-px w-12 bg-gradient-to-r from-[#c9a66b] to-transparent" />
      <p className="font-display text-[11px] leading-relaxed tracking-[0.06em] text-[#e2c08a]">
        {text}
      </p>
    </motion.div>
  );
}

/**
 * Octaboot-style product feature reel → scroll-scrubbed with REAL Daraz trophy photos.
 */
export default function TrophyArchiveScene({
  progress,
  products,
  onOpen,
}: {
  progress: MotionValue<number>;
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  const { format } = useCurrency();

  const product = useMemo(() => {
    const found =
      products.find((p) => p.id === DARAZ_TROPHY.id) ||
      products.find((p) => /trophy/i.test(`${p.category} ${p.name}`));
    if (found) return found;
    return {
      id: DARAZ_TROPHY.id,
      name: DARAZ_TROPHY.name,
      description: DARAZ_TROPHY.description,
      price: DARAZ_TROPHY.price,
      originalPrice: DARAZ_TROPHY.originalPrice,
      category: DARAZ_TROPHY.category,
      images: [...DARAZ_TROPHY.images],
      rating: 5,
      reviews: [],
      stock: 20,
      isFeatured: true,
      dateAdded: '2026-07-12',
    } satisfies Product;
  }, [products]);

  const bgY = useTransform(progress, [0, 1], ['0%', '-10%']);
  const amberX = useTransform(progress, [0, 1], ['-8%', '35%']);
  const gridRotate = useTransform(progress, [0, 1], [0, 24]);
  const gridOpacity = useTransform(progress, [0, 0.1, 0.9, 1], [0, 0.4, 0.3, 0]);
  const titleOpacity = useTransform(progress, [0, 0.06, 0.18], [0, 1, 0.35]);
  const ctaOpacity = useTransform(progress, [0.82, 0.92], [0, 1]);

  const beatCount = TROPHY_REVEAL_BEATS.length;
  // Leave headroom so last keyframes never exceed 1.0
  const beatWindow = 0.96 / beatCount;

  return (
    <div
      className="relative flex h-full items-center overflow-hidden bg-[#020605]"
      data-cursor="trophy"
      data-cursor-label="VIEW TROPHY"
    >
      {/* Layer 1 — onyx void + soft amber */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, #0d2a22 0%, #050d0b 45%, #010403 100%)',
          }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute top-[20%] h-[45vh] w-[55vw] rounded-full blur-3xl"
        style={{
          x: amberX,
          background: 'radial-gradient(circle, rgba(245,180,80,0.2), transparent 70%)',
        }}
      />

      {/* Layer 2 — museum wireframe */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ opacity: gridOpacity, rotate: gridRotate }}
        aria-hidden
      >
        <svg className="h-[130%] w-[130%]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="trophy-grid" width="7" height="7" patternUnits="userSpaceOnUse">
              <path
                d="M 7 0 L 0 0 0 7"
                fill="none"
                stroke="rgba(201,166,107,0.2)"
                strokeWidth="0.12"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#trophy-grid)" />
          <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(226,192,138,0.22)" strokeWidth="0.2" />
        </svg>
      </motion.div>

      <motion.div
        style={{ opacity: titleOpacity }}
        className="pointer-events-none absolute left-0 right-0 top-14 z-20 px-6 text-center"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a66b]">
          Winner’s Circle · Real Product
        </p>
        <h2 className="mt-3 font-display text-[clamp(2.2rem,5.5vw,4rem)] font-semibold text-[#f4efe6]">
          Gold Metallic Trophy
        </h2>
        <p className="mx-auto mt-2 max-w-lg font-display text-sm italic text-[#e2c08a] md:text-base">
          Scroll to orbit every angle — the same cup from your Daraz listing.
        </p>
      </motion.div>

      {/* Layer 3 — sequential real photos */}
      <div className="relative z-10 mx-auto h-full w-full max-w-4xl">
        {TROPHY_REVEAL_BEATS.map((beat, i) => {
          const start = 0.02 + i * beatWindow;
          const end = start + beatWindow * 0.92;
          return (
            <RevealFrame
              key={beat.key}
              progress={progress}
              start={start}
              end={end}
              src={beat.image}
              alt={`${DARAZ_TROPHY.name} — ${beat.label}`}
            />
          );
        })}
      </div>

      {/* Layer 4 — plaques */}
      {TROPHY_REVEAL_BEATS.map((beat, i) => {
        const start = 0.02 + i * beatWindow;
        const end = start + beatWindow * 0.92;
        return (
          <SpecPlaque
            key={`plaque-${beat.key}`}
            progress={progress}
            start={start}
            end={end}
            text={beat.plaque}
            side={i % 2 === 0 ? 'left' : 'right'}
          />
        );
      })}

      <motion.div
        style={{ opacity: ctaOpacity }}
        className="absolute bottom-16 left-0 right-0 z-30 flex flex-col items-center gap-3 px-6"
      >
        <p className="font-display text-lg text-[#f4efe6]">{format(product.price)}</p>
        <button
          type="button"
          onClick={() => onOpen(product)}
          className="shop-daraz-cta cursor-pointer rounded-full bg-[#c9a66b] px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0a1a16] shadow-[0_0_40px_rgba(201,166,107,0.35)] hover:bg-[#e2c08a]"
          data-cursor-pulse
          data-cursor-label="SHOP TROPHY"
          data-cursor-hover
        >
          Open trophy details
        </button>
      </motion.div>
    </div>
  );
}

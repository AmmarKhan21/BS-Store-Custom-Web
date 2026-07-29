import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from 'motion/react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import GalleryErrorBoundary from './GalleryErrorBoundary';
import TrophyArchiveScene from './TrophyArchiveScene';

const ProductGallery3D = lazy(() => import('./ProductGallery3D'));

type Props = {
  products: Product[];
  onSelectCategory: (category: string) => void;
  onOpenProduct: (product: Product) => void;
};

const CHAPTERS = [
  { id: 'overture', label: 'Overture', roman: '◆' },
  { id: 'weave', label: 'The Weave', roman: 'I' },
  { id: 'arena', label: 'The Arena', roman: 'II' },
  { id: 'archive', label: 'Trophy', roman: '★' },
  { id: 'collection', label: 'Collection', roman: 'III' },
  { id: 'shop', label: 'The Shop', roman: 'IV' },
];

/** Tall wrapper: sticky viewport + scroll distance that scrubs the scene */
function ScrollScene({
  id,
  height = '280vh',
  children,
}: {
  id: string;
  height?: string;
  children: (progress: MotionValue<number>) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={ref} id={id} style={{ height }} className="relative">
      <div className="sticky top-0 h-[100svh] overflow-hidden">{children(scrollYProgress)}</div>
    </div>
  );
}

function ChapterNav({ active }: { active: string }) {
  return (
    <nav
      className="pointer-events-auto fixed bottom-5 left-1/2 z-40 -translate-x-1/2"
      aria-label="Story chapters"
    >
      <ul className="flex items-center gap-0.5 rounded-full border border-white/10 bg-black/60 px-1.5 py-1.5 shadow-2xl backdrop-blur-xl sm:gap-1 sm:px-2">
        {CHAPTERS.map((ch) => (
          <li key={ch.id}>
            <a
              href={`#${ch.id === 'overture' ? 'chapter-overture' : `chapter-${ch.id}`}`}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] transition-all sm:px-3 sm:text-[10px] ${
                active === ch.id
                  ? 'bg-[#c9a66b] text-[#0a1a16]'
                  : 'text-[#9aa8a2] hover:text-[#f4efe6]'
              }`}
            >
              <span className="opacity-70">{ch.roman}</span>
              <span className="hidden md:inline">{ch.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Scroll-scrubbed golden house emblem (trophy-like) — no video needed */
function GoldenEmblem({ progress }: { progress: MotionValue<number> }) {
  const rotate = useTransform(progress, [0, 0.5, 1], [12, -8, 18]);
  const scale = useTransform(progress, [0, 0.35, 0.7, 1], [0.55, 1.15, 1.05, 0.7]);
  const y = useTransform(progress, [0, 0.5, 1], [80, 0, -60]);
  const glow = useTransform(progress, [0, 0.4, 1], [0.2, 0.85, 0.35]);
  const opacity = useTransform(progress, [0, 0.08, 0.85, 1], [0, 1, 1, 0.15]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ opacity }}
      aria-hidden
    >
      <motion.div style={{ rotate, scale, y }} className="relative">
        <motion.div
          className="absolute -inset-16 rounded-full blur-3xl"
          style={{
            opacity: glow,
            background: 'radial-gradient(circle, rgba(201,166,107,0.55), transparent 70%)',
          }}
        />
        <svg width="200" height="240" viewBox="0 0 200 240" fill="none" className="relative drop-shadow-2xl">
          <path
            d="M100 28 L118 78 L172 78 L128 112 L144 168 L100 136 L56 168 L72 112 L28 78 L82 78 Z"
            fill="url(#goldGrad)"
            stroke="#e2c08a"
            strokeWidth="2"
          />
          <rect x="88" y="160" width="24" height="36" rx="3" fill="#c9a66b" />
          <rect x="70" y="196" width="60" height="14" rx="4" fill="#e2c08a" />
          <ellipse cx="100" cy="212" rx="48" ry="10" fill="#8b6914" opacity="0.5" />
          <defs>
            <linearGradient id="goldGrad" x1="40" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f5e6c8" />
              <stop offset="0.45" stopColor="#c9a66b" />
              <stop offset="1" stopColor="#8b6914" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </motion.div>
  );
}

function OvertureScene({ progress }: { progress: MotionValue<number> }) {
  const titleY = useTransform(progress, [0, 0.35, 0.7], [0, -40, -120]);
  const titleScale = useTransform(progress, [0, 0.5, 1], [1, 1.08, 0.85]);
  const titleOpacity = useTransform(progress, [0, 0.55, 0.85], [1, 1, 0]);
  const subOpacity = useTransform(progress, [0, 0.2, 0.45, 0.7], [0, 1, 1, 0]);
  const lineScale = useTransform(progress, [0.15, 0.4], [0, 1]);
  const hintOpacity = useTransform(progress, [0, 0.12, 0.28], [1, 0.6, 0]);
  const bgShift = useTransform(progress, [0, 1], [0, 80]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#050d0b] px-5 text-center">
      <motion.div
        className="absolute inset-0"
        style={{
          y: bgShift,
          background:
            'radial-gradient(ellipse 90% 70% at 50% 42%, #12352e 0%, #050d0b 55%, #020605 100%)',
        }}
      />
      <div className="mg-grain absolute inset-0" />
      <GoldenEmblem progress={progress} />

      <motion.div style={{ y: titleY, scale: titleScale, opacity: titleOpacity }} className="relative z-10">
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.45em] text-[#c9a66b]">
          A cinematic house · Pakistan · MMXXVI
        </p>
        <h1 className="font-display text-[clamp(3.5rem,12vw,8.5rem)] font-semibold leading-[0.85] tracking-tight text-[#f4efe6]">
          Bismillah
        </h1>
        <motion.p
          style={{ opacity: subOpacity }}
          className="mt-3 font-display text-[clamp(1.1rem,3vw,2rem)] font-medium italic text-[#c9a66b]"
        >
          for Cotton &amp; Glory
        </motion.p>
        <motion.div
          style={{ scaleX: lineScale }}
          className="mx-auto mt-8 h-px w-44 origin-center bg-gradient-to-r from-transparent via-[#c9a66b] to-transparent"
        />
        <motion.p
          style={{ opacity: subOpacity }}
          className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-[#a8b5af] md:text-base"
        >
          Two threads. One house. Scroll — and the story unfolds beat by beat.
        </motion.p>
      </motion.div>

      <motion.div
        style={{ opacity: hintOpacity }}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#c9a66b]/80">
          Scroll to begin
        </p>
        <div className="h-10 w-px bg-gradient-to-b from-[#c9a66b] to-transparent" />
      </motion.div>
    </div>
  );
}

const WEAVE_BEATS = [
  {
    n: '01',
    title: 'Egyptian Cotton',
    line: 'Thread count that survives Lahore heat and Karachi nights.',
  },
  {
    n: '02',
    title: 'Unstitched Suits',
    line: 'Fabric first — cut for the tailor, owned by the wearer.',
  },
  {
    n: '03',
    title: 'Soft Polos',
    line: 'Breathable ease for the office, the road, the friday gathering.',
  },
];

function ScrollBeatCard({
  progress,
  start,
  end,
  beat,
  fromX,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  beat: { n: string; title: string; line: string };
  fromX: number;
}) {
  const fadeEnd = end >= 0.998 ? 1 : Math.min(end + 0.2, 0.999);
  const opacity = useTransform(
    progress,
    fadeEnd > end ? [start, end, fadeEnd] : [start, Math.max(start, end - 0.001), end],
    [0, 1, 1]
  );
  const x = useTransform(progress, [start, end], [fromX, 0]);
  const blur = useTransform(progress, [start, end], [8, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div
      style={{ opacity, x, filter }}
      className="rounded-2xl border border-white/10 bg-black/40 p-5 text-left backdrop-blur-md"
    >
      <p className="text-[10px] font-bold tracking-[0.3em] text-[#c9a66b]">{beat.n}</p>
      <p className="mt-2 font-display text-xl font-semibold text-[#f4efe6]">{beat.title}</p>
      <p className="mt-2 text-sm text-[#a8b5af]">{beat.line}</p>
    </motion.div>
  );
}

function ProductScrollCard({
  progress,
  start,
  product,
  index,
  onOpen,
  format,
}: {
  progress: MotionValue<number>;
  start: number;
  product: Product;
  index: number;
  onOpen: (p: Product) => void;
  format: (n: number) => string;
}) {
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1]);
  const y = useTransform(progress, [start, start + 0.12], [40, 0]);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(product)}
      style={{ opacity, y }}
      className="cursor-pointer rounded-xl border border-white/10 bg-black/40 p-3 text-left backdrop-blur-sm"
    >
      <p className="text-[9px] font-bold tracking-[0.25em] text-[#c9a66b]">
        {String(index + 1).padStart(2, '0')}
      </p>
      <p className="mt-1 line-clamp-2 font-display text-sm font-semibold text-[#f4efe6]">
        {product.name}
      </p>
      <p className="mt-1 text-xs font-bold text-[#c9a66b]">{format(product.price)}</p>
    </motion.button>
  );
}

function WeaveScene({
  progress,
  onCta,
}: {
  progress: MotionValue<number>;
  onCta: () => void;
}) {
  const imgScale = useTransform(progress, [0, 1], [1.25, 1]);
  const imgY = useTransform(progress, [0, 1], ['0%', '-8%']);
  const headingOpacity = useTransform(progress, [0, 0.12, 0.55], [0, 1, 1]);
  const headingY = useTransform(progress, [0, 0.2], [60, 0]);
  const veil = useTransform(progress, [0, 0.3], [0.85, 0.45]);

  return (
    <div className="relative flex h-full items-center overflow-hidden bg-[#050d0b]">
      <motion.div className="absolute inset-0" style={{ scale: imgScale, y: imgY }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=1600&auto=format&fit=crop')",
          }}
        />
      </motion.div>
      <motion.div className="absolute inset-0 bg-[#050d0b]" style={{ opacity: veil }} />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:px-12">
        <motion.div style={{ opacity: headingOpacity, y: headingY }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a66b]">
            Chapter I · The Weave
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.92] text-[#f4efe6]">
            Cotton that remembers
          </h2>
          <p className="mt-5 max-w-sm font-display text-lg italic text-[#e2c08a]">
            Every scroll reveals another thread of the house.
          </p>
          <button
            type="button"
            onClick={onCta}
            className="mt-10 cursor-pointer border-b border-[#c9a66b] pb-1 text-xs font-bold uppercase tracking-[0.25em] text-[#e2c08a]"
          >
            Shop cotton →
          </button>
        </motion.div>

        <div className="flex flex-col justify-center gap-4">
          {WEAVE_BEATS.map((beat, i) => {
            const start = 0.2 + i * 0.18;
            const end = start + 0.14;
            return (
              <ScrollBeatCard
                key={beat.n}
                progress={progress}
                start={start}
                end={end}
                beat={beat}
                fromX={80}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

const ARENA_BEATS = [
  { n: '01', title: 'Performance Wear', line: 'Dry-fit layers built for the whistle, not the shelf.' },
  { n: '02', title: 'Court & Pitch', line: 'Rackets, tension, and gear that travels with you.' },
  { n: '03', title: 'Street Ready', line: 'Athletic silhouettes that leave the gym and keep going.' },
];

function ArenaScene({
  progress,
  onCta,
}: {
  progress: MotionValue<number>;
  onCta: () => void;
}) {
  const imgScale = useTransform(progress, [0, 1], [1.2, 1]);
  const headingOpacity = useTransform(progress, [0, 0.15], [0, 1]);
  const headingY = useTransform(progress, [0, 0.2], [50, 0]);
  const veil = useTransform(progress, [0, 0.35], [0.88, 0.5]);

  return (
    <div className="relative flex h-full items-center overflow-hidden bg-[#050d0b]">
      <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1600&auto=format&fit=crop')",
          }}
        />
      </motion.div>
      <motion.div className="absolute inset-0 bg-[#050d0b]" style={{ opacity: veil }} />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-end gap-10 px-6 py-20 text-right md:px-12">
        <motion.div style={{ opacity: headingOpacity, y: headingY }} className="max-w-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a66b]">
            Chapter II · The Arena
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.92] text-[#f4efe6]">
            Built for motion
          </h2>
          <p className="mt-5 font-display text-lg italic text-[#e2c08a]">
            Scroll — each beat lands like a new set.
          </p>
          <button
            type="button"
            onClick={onCta}
            className="mt-10 cursor-pointer border-b border-[#c9a66b] pb-1 text-xs font-bold uppercase tracking-[0.25em] text-[#e2c08a]"
          >
            Shop sports →
          </button>
        </motion.div>

        <div className="flex w-full max-w-md flex-col gap-4">
          {ARENA_BEATS.map((beat, i) => {
            const start = 0.22 + i * 0.18;
            const end = start + 0.14;
            return (
              <ScrollBeatCard
                key={beat.n}
                progress={progress}
                start={start}
                end={end}
                beat={beat}
                fromX={-70}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CollectionScene({
  progress,
  products,
  onOpen,
}: {
  progress: MotionValue<number>;
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  const { format } = useCurrency();
  const list = (products.filter((p) => p.isFeatured).length
    ? products.filter((p) => p.isFeatured)
    : products
  ).slice(0, 4);

  const titleOpacity = useTransform(progress, [0, 0.12, 0.75, 0.95], [0, 1, 1, 0.3]);
  const galleryOpacity = useTransform(progress, [0.08, 0.25, 0.8, 1], [0, 1, 1, 0.4]);
  const galleryY = useTransform(progress, [0.08, 0.3], [80, 0]);
  const galleryScale = useTransform(progress, [0.1, 0.35], [0.88, 1]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#050d0b] pt-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, #134a3e 0%, #050d0b 55%, #020605 100%)',
        }}
      />
      <motion.div style={{ opacity: titleOpacity }} className="relative z-10 px-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a66b]">
          Chapter III · The Collection
        </p>
        <h2 className="mt-3 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-semibold text-[#f4efe6]">
          Touch the orbit
        </h2>
        <p className="mt-3 font-display text-base italic text-[#e2c08a]">
          Keep scrolling — then drag the pieces.
        </p>
      </motion.div>

      <motion.div
        style={{ opacity: galleryOpacity, y: galleryY, scale: galleryScale }}
        className="relative z-10 mx-auto mt-6 h-[38vh] w-full max-w-5xl px-4 sm:h-[46vh]"
        data-cursor="drag"
      >
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-[#c9a66b]">
              Loading orbit…
            </div>
          }
        >
          <GalleryErrorBoundary>
            <ProductGallery3D products={products} onSelectProduct={onOpen} />
          </GalleryErrorBoundary>
        </Suspense>
      </motion.div>

      <div className="relative z-10 mx-auto mt-auto grid w-full max-w-5xl grid-cols-2 gap-3 px-4 pb-24 md:grid-cols-4 md:pb-28">
        {list.map((p, i) => (
          <ProductScrollCard
            key={p.id}
            progress={progress}
            start={0.35 + i * 0.1}
            product={p}
            index={i}
            onOpen={onOpen}
            format={format}
          />
        ))}
      </div>
    </div>
  );
}

function ShopGateScene({
  progress,
  onCta,
}: {
  progress: MotionValue<number>;
  onCta: () => void;
}) {
  const scale = useTransform(progress, [0, 0.4, 1], [0.85, 1, 1.05]);
  const opacity = useTransform(progress, [0, 0.2, 0.85, 1], [0, 1, 1, 1]);
  const y = useTransform(progress, [0, 0.35], [70, 0]);
  const ringScale = useTransform(progress, [0.2, 0.7], [0.6, 1.4]);
  const ringOpacity = useTransform(progress, [0.2, 0.5, 0.9], [0, 0.5, 0]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#050d0b] px-6 text-center">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, #1a4a3e 0%, #050d0b 55%, #020605 100%)',
        }}
      />
      <motion.div
        className="pointer-events-none absolute h-64 w-64 rounded-full border border-[#c9a66b]/40"
        style={{ scale: ringScale, opacity: ringOpacity }}
      />
      <motion.div style={{ scale, opacity, y }} className="relative z-10 max-w-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a66b]">
          Chapter IV · The Shop
        </p>
        <h2 className="mt-5 font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[0.95] text-[#f4efe6]">
          One will wear it.
          <br />
          <span className="italic text-[#c9a66b]">The rest will browse.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm text-[#a8b5af]">
          COD across Pakistan. PayFast &amp; JazzCash ready. The atelier is open.
        </p>
        <button
          type="button"
          onClick={onCta}
          className="mt-10 cursor-pointer rounded-full bg-[#c9a66b] px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#0a1a16] shadow-[0_0_40px_rgba(201,166,107,0.35)] hover:bg-[#e2c08a]"
        >
          Enter the shop
        </button>
      </motion.div>
    </div>
  );
}

export default function CinematicExperience({
  products,
  onSelectCategory,
  onOpenProduct,
}: Props) {
  const [activeChapter, setActiveChapter] = useState('overture');
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 28 });
  const progressWidth = useTransform(smooth, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const ids = [
      'chapter-overture',
      'chapter-weave',
      'chapter-arena',
      'chapter-archive',
      'chapter-collection',
      'chapter-shop',
    ];
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveChapter(visible.target.id.replace('chapter-', ''));
        }
      },
      { threshold: [0.15, 0.35] }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const goShop = (cat?: string) => {
    if (cat) onSelectCategory(cat);
    document.getElementById('store-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-[#050d0b] text-[#f4efe6]" id="cinematic-story">
      <motion.div
        className="fixed left-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-[#1f6b55] via-[#c9a66b] to-[#e2c08a]"
        style={{ width: progressWidth }}
      />
      <ChapterNav active={activeChapter} />

      {/* Each scene is pinned; scroll distance scrubs the animation timeline */}
      <ScrollScene id="chapter-overture" height="320vh">
        {(p) => <OvertureScene progress={p} />}
      </ScrollScene>

      <ScrollScene id="chapter-weave" height="300vh">
        {(p) => <WeaveScene progress={p} onCta={() => goShop('Cotton Collection')} />}
      </ScrollScene>

      <ScrollScene id="chapter-arena" height="300vh">
        {(p) => <ArenaScene progress={p} onCta={() => goShop('Sports Wear')} />}
      </ScrollScene>

      <ScrollScene id="chapter-archive" height="360vh">
        {(p) => (
          <TrophyArchiveScene progress={p} products={products} onOpen={onOpenProduct} />
        )}
      </ScrollScene>

      <ScrollScene id="chapter-collection" height="280vh">
        {(p) => (
          <CollectionScene progress={p} products={products} onOpen={onOpenProduct} />
        )}
      </ScrollScene>

      <ScrollScene id="chapter-shop" height="200vh">
        {(p) => <ShopGateScene progress={p} onCta={() => goShop()} />}
      </ScrollScene>
    </div>
  );
}

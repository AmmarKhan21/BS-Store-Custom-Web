import React, { useEffect, useMemo, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from 'motion/react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { DARAZ_TROPHY } from '../data/darazTrophies';

type Props = {
  products: Product[];
  onSelectCategory: (category: string) => void;
  onOpenProduct: (product: Product) => void;
};

/** Frames from your Instagram reference reel — NOT Daraz store photos */
const REEL_FRAMES = [
  '/reel/frame-00.jpg',
  '/reel/frame-01.jpg',
  '/reel/frame-02.jpg',
  '/reel/frame-03.jpg',
  '/reel/frame-04.jpg',
  '/reel/frame-05.jpg',
  '/reel/frame-06.jpg',
  '/reel/frame-07.jpg',
  '/reel/frame-08.jpg',
  '/reel/frame-09.jpg',
  '/reel/frame-10.jpg',
  '/reel/frame-11.jpg',
] as const;

const CHAPTERS = [
  { id: 'overture', label: 'Overture', roman: '◆', at: 0, line: 'A cinematic house · Pakistan · MMXXVI' },
  { id: 'focus', label: 'The Focus', roman: 'I', at: 0.12, line: 'One golden object. Stadium gravity.' },
  { id: 'inspect', label: 'The Inspect', roman: 'II', at: 0.28, line: 'Premium quality — every facet remembers light.' },
  { id: 'detail', label: 'The Detail', roman: 'III', at: 0.44, line: 'Emerald base. Gold has a long memory.' },
  { id: 'variants', label: 'The Variants', roman: 'IV', at: 0.58, line: 'Ballon · World Cup · UCL · Golden Boot.' },
  { id: 'glory', label: 'The Glory', roman: 'V', at: 0.74, line: 'One will touch it. The rest will browse.' },
  { id: 'shop', label: 'The Shop', roman: 'VI', at: 0.88, line: 'Enter the atelier.' },
];

function keys(vals: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < vals.length; i++) {
    let v = Math.min(0.999, Math.max(0, vals[i]));
    if (i > 0 && v <= out[i - 1]) v = Math.min(0.999, out[i - 1] + 0.002);
    out.push(v);
  }
  return out;
}

function FrameLayer({
  progress,
  index,
  total,
  src,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  src: string;
}) {
  const start = index / total;
  const peak = (index + 0.42) / total;
  const end = Math.min((index + 1.05) / total, 0.999);

  const opacity = useTransform(
    progress,
    keys([
      index === 0 ? 0 : start,
      peak,
      index === total - 1 ? 0.999 : end,
    ]),
    index === 0 ? [1, 1, 0] : index === total - 1 ? [0, 1, 1] : [0, 1, 0]
  );

  return (
    <motion.img
      src={src}
      alt=""
      style={{ opacity }}
      className="absolute inset-0 h-full w-full object-cover"
      draggable={false}
    />
  );
}

function ReelFrames({ progress }: { progress: MotionValue<number> }) {
  const scale = useTransform(progress, keys([0, 0.25, 0.6, 1]), [1.1, 1, 1.05, 1]);

  return (
    <motion.div className="absolute inset-0 overflow-hidden bg-[#020605]" style={{ scale }}>
      {REEL_FRAMES.map((src, i) => (
        <FrameLayer key={src} progress={progress} index={i} total={REEL_FRAMES.length} src={src} />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#020605]/45 via-transparent to-[#020605]/78" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 42%, transparent 18%, rgba(2,6,5,0.45) 78%)',
        }}
      />
    </motion.div>
  );
}

function ChapterCopy({
  progress,
  chapter,
  index,
}: {
  progress: MotionValue<number>;
  chapter: (typeof CHAPTERS)[number];
  index: number;
}) {
  const next = CHAPTERS[index + 1]?.at ?? 1;
  const fadeIn = chapter.at;
  const hold = fadeIn + (next - fadeIn) * 0.55;
  const fadeOut = Math.max(hold + 0.01, next - 0.02);
  const opacity = useTransform(
    progress,
    keys([fadeIn, fadeIn + 0.035, hold, fadeOut]),
    index === CHAPTERS.length - 1 ? [0, 1, 1, 1] : index === 0 ? [1, 1, 1, 0] : [0, 1, 1, 0]
  );
  const y = useTransform(progress, keys([fadeIn, hold]), [40, 0]);
  const isOverture = chapter.id === 'overture';

  return (
    <motion.div
      style={{ opacity, y }}
      className={`pointer-events-none absolute inset-x-0 z-20 px-6 text-center ${
        isOverture ? 'top-[20%] sm:top-[24%]' : 'top-[11%] sm:top-14'
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#c9a66b]">
        {isOverture ? 'A CINEMATIC PROPHECY · SUMMER MMXXVI' : `CHAPTER ${chapter.roman}`}
      </p>
      {isOverture ? (
        <>
          <h1 className="mt-5 font-display text-[clamp(3.2rem,11vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.02em] text-[#f4efe6]">
            BISMILLAH
          </h1>
          <p className="mt-2 font-display text-[clamp(1.4rem,4vw,2.6rem)] italic text-[#e2c08a]">
            for Cotton &amp; Glory
          </p>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-[#a8b5af] sm:text-base">
            One golden object still bends the gravity of the house. Scroll — and the story unfolds beat by beat.
          </p>
          <p className="mt-10 text-[10px] font-bold tracking-[0.4em] text-white/55">SCROLL TO BEGIN THE STORY</p>
        </>
      ) : (
        <>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.92] text-[#f4efe6]">
            {chapter.label.replace(/^The /, '')}
          </h2>
          <p className="mx-auto mt-4 max-w-md font-display text-base italic text-[#e2c08a] sm:text-lg">
            {chapter.line}
          </p>
        </>
      )}
    </motion.div>
  );
}

function ChapterNav({ active }: { active: string }) {
  return (
    <nav
      className="pointer-events-auto fixed bottom-5 left-1/2 z-40 max-w-[96vw] -translate-x-1/2 overflow-x-auto"
      aria-label="Story chapters"
    >
      <ul className="mx-auto flex w-max items-center gap-0.5 rounded-full border border-white/10 bg-black/65 px-1.5 py-1.5 shadow-2xl backdrop-blur-xl sm:gap-1 sm:px-2">
        {CHAPTERS.map((ch) => (
          <li key={ch.id}>
            <a
              href={`#reel-${ch.id}`}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-all sm:px-3 sm:text-[10px] ${
                active === ch.id
                  ? 'bg-[#c9a66b] text-[#0a1a16]'
                  : 'text-[#9aa8a2] hover:text-[#f4efe6]'
              }`}
            >
              <span className="opacity-70">{ch.roman}</span>
              <span className="hidden lg:inline">{ch.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Last Dance–style cinematic homepage.
 * Scroll scrubs YOUR reference video frames (public/reel), not store product shots.
 * @see https://lastdanceforglory.world/
 */
export default function CinematicExperience({
  products,
  onSelectCategory,
  onOpenProduct,
}: Props) {
  const { format } = useCurrency();
  const [active, setActive] = useState('overture');
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 28 });
  const progressWidth = useTransform(smooth, [0, 1], ['0%', '100%']);
  const ctaOpacity = useTransform(scrollYProgress, keys([0.86, 0.92, 1]), [0, 1, 1]);
  const ctaY = useTransform(scrollYProgress, keys([0.86, 0.94]), [40, 0]);

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
      stock: 25,
      isFeatured: true,
      dateAdded: '2026-07-12',
    } satisfies Product;
  }, [products]);

  useEffect(() => {
    REEL_FRAMES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      const ch = [...CHAPTERS].reverse().find((c) => v >= c.at) ?? CHAPTERS[0];
      setActive(ch.id);
    });
    return () => unsub();
  }, [scrollYProgress]);

  const goShop = () => {
    onSelectCategory('Trophy');
    onOpenProduct(product);
    document.getElementById('store-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-[#020605] text-[#f4efe6]" id="cinematic-story">
      <motion.div
        className="fixed left-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-[#1f6b55] via-[#c9a66b] to-[#e2c08a]"
        style={{ width: progressWidth }}
      />
      <ChapterNav active={active} />

      <div ref={ref} className="relative h-[780vh]">
        {CHAPTERS.map((ch) => (
          <div
            key={ch.id}
            id={`reel-${ch.id}`}
            className="pointer-events-none absolute left-0 w-px"
            style={{ top: `${ch.at * 100}%`, height: '1px' }}
          />
        ))}

        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <ReelFrames progress={scrollYProgress} />

          {CHAPTERS.map((ch, i) => (
            <ChapterCopy key={ch.id} progress={scrollYProgress} chapter={ch} index={i} />
          ))}

          <motion.div
            style={{ opacity: ctaOpacity, y: ctaY }}
            className="absolute bottom-24 left-0 right-0 z-30 flex flex-col items-center gap-3 px-6"
          >
            <p className="font-display text-lg italic text-[#e2c08a]">One will wear it. The rest will browse.</p>
            <p className="text-sm text-white/70">{format(product.price)} · 17.5cm gold metallic</p>
            <button
              type="button"
              onClick={goShop}
              className="shop-daraz-cta cursor-pointer rounded-full bg-[#c9a66b] px-12 py-4 text-xs font-bold uppercase tracking-[0.35em] text-[#0a1a16] shadow-[0_0_50px_rgba(201,166,107,0.45)] hover:bg-[#e2c08a]"
              data-cursor-pulse
              data-cursor-label="ENTER SHOP"
              data-cursor-hover
            >
              Enter the shop
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

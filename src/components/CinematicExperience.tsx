import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import GalleryErrorBoundary from './GalleryErrorBoundary';

const ProductGallery3D = lazy(() => import('./ProductGallery3D'));

type Props = {
  products: Product[];
  onSelectCategory: (category: string) => void;
  onOpenProduct: (product: Product) => void;
};

const CHAPTERS = [
  { id: 'overture', label: 'Overture' },
  { id: 'weave', label: 'The Weave' },
  { id: 'arena', label: 'The Arena' },
  { id: 'collection', label: 'The Collection' },
  { id: 'shop', label: 'Enter the Shop' },
];

function ChapterNav({ active }: { active: string }) {
  return (
    <nav
      className="pointer-events-auto fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 md:block"
      aria-label="Story chapters"
    >
      <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2 py-1.5 backdrop-blur-xl">
        {CHAPTERS.map((ch, i) => (
          <li key={ch.id}>
            <a
              href={`#chapter-${ch.id}`}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
                active === ch.id
                  ? 'bg-[#c9a66b] text-[#0a1a16]'
                  : 'text-[#9aa8a2] hover:text-[#f4efe6]'
              }`}
            >
              <span className="opacity-60">{i === 0 ? '◆' : String(i).padStart(1, '0')}</span>
              <span className="hidden lg:inline">{ch.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-200/90">
        Scroll to begin the story
      </p>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="h-10 w-px bg-amber-200/80"
      />
    </motion.div>
  );
}

export default function CinematicExperience({
  products,
  onSelectCategory,
  onOpenProduct,
}: Props) {
  const { format } = useCurrency();
  const [activeChapter, setActiveChapter] = useState('overture');
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const showcase = featured.length > 0 ? featured : products.slice(0, 4);

  useEffect(() => {
    const nodes = CHAPTERS.map((c) => document.getElementById(`chapter-${c.id}`)).filter(
      Boolean
    ) as HTMLElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveChapter(visible.target.id.replace('chapter-', ''));
        }
      },
      { threshold: [0.35, 0.55], rootMargin: '-10% 0px -30% 0px' }
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
      {/* Reading progress */}
      <motion.div
        className="fixed left-0 top-0 z-50 h-[2px] bg-[#c9a66b]"
        style={{ width: progressWidth }}
      />

      <ChapterNav active={activeChapter} />

      {/* ── OVERTURE ── */}
      <section
        id="chapter-overture"
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 text-center"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 40%, #12352e 0%, #050d0b 55%, #020605 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 mb-8 text-[10px] font-bold uppercase tracking-[0.45em] text-[#c9a66b]"
        >
          A cinematic house · Pakistan · MMXXVI
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 font-display text-[clamp(3.5rem,12vw,8.5rem)] font-semibold leading-[0.85] tracking-tight text-[#f4efe6]"
        >
          Bismillah
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.28 }}
          className="relative z-10 mt-3 font-display text-[clamp(1.1rem,3vw,2rem)] italic font-medium text-[#c9a66b]"
        >
          for Cotton &amp; Glory
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="relative z-10 mt-10 max-w-lg text-sm leading-relaxed text-[#a8b5af] md:text-base"
        >
          Two threads. One house. Egyptian cotton that breathes — and gear built for the pitch,
          the court, the street.
        </motion.p>

        <ScrollHint />
      </section>

      {/* ── CHAPTER I · THE WEAVE ── */}
      <section
        id="chapter-weave"
        className="relative min-h-[100svh] overflow-hidden border-t border-white/5"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(5,13,11,0.92) 0%, rgba(5,13,11,0.55) 45%, rgba(5,13,11,0.75) 100%), url('https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=1600&auto=format&fit=crop')",
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-24 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a66b]">
              Chapter I
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,8vw,5rem)] font-semibold leading-[0.95] tracking-tight">
              The Weave
            </h2>
            <p className="mt-4 max-w-md font-display text-lg italic text-[#c9a66b] md:text-xl">
              Every myth of comfort begins with a thread that refuses to quit.
            </p>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-[#b8c4be] md:text-[15px]">
              Premium Egyptian cotton — unstitched suits, soft polos, breathable fabric that
              carries Lahore heat and Karachi evenings with equal grace.
            </p>
            <button
              type="button"
              onClick={() => goShop('Cotton Collection')}
              className="mt-10 inline-flex cursor-pointer items-center gap-3 border-b border-[#c9a66b] pb-1 text-xs font-bold uppercase tracking-[0.25em] text-[#e2c08a] transition-colors hover:text-[#f4efe6]"
            >
              Enter cotton →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── CHAPTER II · THE ARENA ── */}
      <section
        id="chapter-arena"
        className="relative min-h-[100svh] overflow-hidden border-t border-white/5"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(270deg, rgba(5,13,11,0.92) 0%, rgba(5,13,11,0.5) 50%, rgba(5,13,11,0.8) 100%), url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1600&auto=format&fit=crop')",
          }}
        />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col items-end justify-center px-6 py-24 text-right md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a66b]">
              Chapter II
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,8vw,5rem)] font-semibold leading-[0.95] tracking-tight">
              The Arena
            </h2>
            <p className="mt-4 font-display text-lg italic text-[#c9a66b] md:text-xl">
              Dry-fit. High tension. Gear that shows up when the whistle does.
            </p>
            <p className="mt-8 text-sm leading-relaxed text-[#b8c4be] md:text-[15px]">
              Sportswear and athletic instruments — hoodies, rackets, performance pieces built
              for motion, not museum shelves.
            </p>
            <button
              type="button"
              onClick={() => goShop('Sports Wear')}
              className="mt-10 inline-flex cursor-pointer items-center gap-3 border-b border-[#c9a66b] pb-1 text-xs font-bold uppercase tracking-[0.25em] text-[#e2c08a] transition-colors hover:text-[#f4efe6]"
            >
              Enter sports →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── CHAPTER III · THE COLLECTION (3D) ── */}
      <section
        id="chapter-collection"
        className="relative min-h-[100svh] border-t border-white/5 bg-[#050d0b] py-16 md:py-20"
      >
        <div className="mx-auto max-w-6xl px-6 text-center md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a66b]">
              Chapter III
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[0.95]">
              The Collection
            </h2>
            <p className="mx-auto mt-4 max-w-md font-display text-lg italic text-[#c9a66b]">
              Drag the orbit. Touch a piece. The house answers.
            </p>
          </motion.div>
        </div>

        <div className="relative mx-auto mt-10 h-[420px] w-full max-w-5xl px-4 sm:h-[500px] md:h-[560px]">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-[#c9a66b]">
                Loading the orbit…
              </div>
            }
          >
            <GalleryErrorBoundary>
              <ProductGallery3D products={products} onSelectProduct={onOpenProduct} />
            </GalleryErrorBoundary>
          </Suspense>
        </div>

        {/* Storyline product strip */}
        {showcase.length > 0 && (
          <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-0 border-t border-white/10 px-6 md:grid-cols-2 md:px-12 lg:grid-cols-4">
            {showcase.map((p, i) => (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => onOpenProduct(p)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group cursor-pointer border-b border-white/10 px-0 py-8 text-left transition-colors hover:bg-white/[0.03] md:border-b-0 md:border-r md:border-white/10 md:px-5 md:last:border-r-0"
              >
                <p className="text-[10px] font-bold tracking-[0.3em] text-[#c9a66b]">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-3 font-display text-xl font-semibold leading-tight text-[#f4efe6] group-hover:text-[#e2c08a]">
                  {p.name}
                </p>
                <p className="mt-2 font-display text-sm italic text-[#8a9a94]">{p.category}</p>
                <p className="mt-4 text-sm font-bold text-[#c9a66b]">{format(p.price)}</p>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* ── CHAPTER IV · ENTER THE SHOP ── */}
      <section
        id="chapter-shop"
        className="relative flex min-h-[70svh] flex-col items-center justify-center overflow-hidden border-t border-white/5 px-6 text-center"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, #1a4a3e 0%, #050d0b 60%, #020605 100%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a66b]">
            Chapter IV
          </p>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[0.95]">
            One will wear it.
            <br />
            <span className="italic text-[#c9a66b]">The rest will browse.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[#a8b5af]">
            COD across Pakistan. PayFast &amp; JazzCash ready. The atelier is open.
          </p>
          <button
            type="button"
            onClick={() => goShop()}
            className="mt-10 cursor-pointer rounded-full bg-[#c9a66b] px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#0a1a16] transition-colors hover:bg-[#e2c08a]"
          >
            Enter the shop
          </button>
        </motion.div>
      </section>
    </div>
  );
}

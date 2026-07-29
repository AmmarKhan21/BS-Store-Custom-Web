import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  MotionValue,
} from 'motion/react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';

const FRAME_COUNT = 270;
const FRAME_PAD = 4;
const FRAMES_BASE = '/frames';
const EASING = 0.12;
const SCROLL_HEIGHT = '620vh';
/** Unified stage — never paint the frame’s grey plate as page bg */
const THEME_BG = '#050d0b';

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function padNumber(n: number, width: number) {
  return String(n).padStart(width, '0');
}

/** Scroll-scrubbed chapter panel: slides, fades, and soft-blurs in/out */
function ChapterPanel({
  progress,
  enter,
  hold,
  exit,
  children,
  className = '',
}: {
  progress: MotionValue<number>;
  enter: number;
  hold: number;
  exit: number;
  children: React.ReactNode;
  className?: string;
}) {
  const isFirst = enter <= 0;
  const opacity = useTransform(
    progress,
    isFirst
      ? [0, hold, exit - 0.04, exit]
      : [enter, enter + 0.045, hold, exit - 0.04, exit],
    isFirst ? [1, 1, 1, 0] : [0, 1, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    isFirst
      ? [0, hold, exit - 0.04, exit]
      : [enter, enter + 0.05, hold, exit - 0.04, exit],
    isFirst ? [0, 0, -12, -36] : [48, 0, 0, -12, -36]
  );
  const x = useTransform(
    progress,
    isFirst
      ? [0, hold, exit]
      : [enter, enter + 0.05, hold, exit],
    isFirst ? [0, 0, -16] : [-28, 0, 0, -16]
  );
  const filter = useTransform(
    progress,
    isFirst
      ? [0, hold, exit - 0.03, exit]
      : [enter, enter + 0.05, hold, exit - 0.03, exit],
    isFirst
      ? ['blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(8px)']
      : ['blur(12px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(8px)']
  );
  const scale = useTransform(
    progress,
    isFirst
      ? [0, hold, exit]
      : [enter, enter + 0.05, hold, exit],
    isFirst ? [1, 1, 0.98] : [0.96, 1, 1, 0.98]
  );
  const pointerEvents = useTransform(opacity, (v) => (v > 0.2 ? 'auto' : 'none'));

  return (
    <motion.div
      className={`absolute inset-0 flex flex-col justify-center ${className}`}
      style={{ opacity, y, x, filter, scale, pointerEvents }}
    >
      {children}
    </motion.div>
  );
}

function GoldRule({
  progress,
  enter,
  exit,
}: {
  progress: MotionValue<number>;
  enter: number;
  exit: number;
}) {
  const isFirst = enter <= 0.03;
  const width = useTransform(
    progress,
    isFirst
      ? [0, 0.06, exit - 0.05, exit]
      : [enter, enter + 0.06, exit - 0.05, exit],
    isFirst ? ['42%', '42%', '42%', '0%'] : ['0%', '42%', '42%', '0%']
  );
  return (
    <motion.div
      className="mb-6 h-px origin-left bg-gradient-to-r from-[#c9a66b] via-[#e2c08a] to-transparent"
      style={{ width }}
    />
  );
}

type Props = {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onGoShop: () => void;
};

export default function ScrollFrameHero({ products, onOpenProduct, onGoShop }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const targetProgressRef = useRef(0);
  const readyRef = useRef(false);
  const canvasSizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const rafRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [progressPct, setProgressPct] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);

  const { format } = useCurrency();
  const trophyProduct =
    products.find((p) => p.category?.toLowerCase().includes('trophy')) ?? products[0];

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 28 });

  const progressWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const scrollCueOpacity = useTransform(smoothProgress, [0, 0.1, 0.2], [1, 1, 0]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    canvas.width = w;
    canvas.height = h;
    canvasSizeRef.current = { w, h, dpr };
  }, []);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    const images = imagesRef.current;
    if (!canvas || !ctx || !readyRef.current) return;

    const img = images[frameIndex];
    if (!img) return;

    const { w: canvasW, h: canvasH, dpr } = canvasSizeRef.current;

    // Always clear with theme emerald — never the frame grey plate
    ctx.fillStyle = THEME_BG;
    ctx.fillRect(0, 0, canvasW, canvasH);

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const fit = Math.min(canvasW / iw, canvasH / ih);
    const scale = Math.min(fit, dpr) * 0.82;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (canvasW - dw) / 2;
    const dy = (canvasH - dh) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);

    // Dissolve the rectangular plate edges into THEME_BG
    const featherX = dw * 0.22;
    const featherY = dh * 0.18;

    // Left / right plate fade
    {
      const g = ctx.createLinearGradient(dx, 0, dx + featherX, 0);
      g.addColorStop(0, THEME_BG);
      g.addColorStop(1, 'rgba(5,13,11,0)');
      ctx.fillStyle = g;
      ctx.fillRect(dx - 1, dy - 1, featherX + 2, dh + 2);
    }
    {
      const g = ctx.createLinearGradient(dx + dw, 0, dx + dw - featherX, 0);
      g.addColorStop(0, THEME_BG);
      g.addColorStop(1, 'rgba(5,13,11,0)');
      ctx.fillStyle = g;
      ctx.fillRect(dx + dw - featherX - 1, dy - 1, featherX + 2, dh + 2);
    }
    // Top / bottom plate fade
    {
      const g = ctx.createLinearGradient(0, dy, 0, dy + featherY);
      g.addColorStop(0, THEME_BG);
      g.addColorStop(1, 'rgba(5,13,11,0)');
      ctx.fillStyle = g;
      ctx.fillRect(dx - 1, dy - 1, dw + 2, featherY + 2);
    }
    {
      const g = ctx.createLinearGradient(0, dy + dh, 0, dy + dh - featherY);
      g.addColorStop(0, THEME_BG);
      g.addColorStop(1, 'rgba(5,13,11,0)');
      ctx.fillStyle = g;
      ctx.fillRect(dx - 1, dy + dh - featherY - 1, dw + 2, featherY + 2);
    }

    // Soft radial vignette — trophy floats on one continuous stage
    const cx = dx + dw / 2;
    const cy = dy + dh * 0.42;
    const radial = ctx.createRadialGradient(
      cx,
      cy,
      Math.min(dw, dh) * 0.18,
      cx,
      cy,
      Math.max(dw, dh) * 0.72
    );
    radial.addColorStop(0, 'rgba(5,13,11,0)');
    radial.addColorStop(0.55, 'rgba(5,13,11,0)');
    radial.addColorStop(0.82, 'rgba(5,13,11,0.55)');
    radial.addColorStop(1, THEME_BG);
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    imagesRef.current = images;

    let firstFrameLoaded = false;
    let cancelled = false;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const idx = i - 1;
      const src = `${FRAMES_BASE}/frame_${padNumber(i, FRAME_PAD)}.jpg`;
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.onload = () => {
        if (cancelled) return;
        if (!firstFrameLoaded && idx === 0) {
          firstFrameLoaded = true;
          resizeCanvas();
          readyRef.current = true;
          drawFrame(0);
          setLoading(false);
        }
      };
      images[idx] = img;
      img.src = src;
    }

    const onResize = () => {
      resizeCanvas();
      if (readyRef.current) drawFrame(Math.round(currentFrameRef.current));
    };
    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => {
      resizeCanvas();
      if (readyRef.current) drawFrame(Math.round(currentFrameRef.current));
    });

    const tick = () => {
      const targetFrame = Math.round(targetProgressRef.current * (FRAME_COUNT - 1));
      if (readyRef.current) {
        if (prefersReducedMotion) {
          currentFrameRef.current = targetFrame;
        } else {
          currentFrameRef.current += (targetFrame - currentFrameRef.current) * EASING;
        }
        const show = Math.round(currentFrameRef.current);
        const img = images[show];
        if (img && (img.naturalWidth || img.width)) drawFrame(show);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [drawFrame, resizeCanvas]);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (p) => {
      const v = clamp01(p);
      targetProgressRef.current = v;
      setProgressPct(Math.round(v * 100));
      if (v < 0.26) setActiveChapter(0);
      else if (v < 0.55) setActiveChapter(1);
      else if (v < 0.82) setActiveChapter(2);
      else setActiveChapter(3);
    });
    return () => unsub();
  }, [scrollYProgress]);

  const chapters = ['I', 'II', 'III', 'IV'];

  return (
    <div
      ref={scrollRef}
      id="cinematic-story"
      className="relative bg-[#050d0b]"
      style={{ height: SCROLL_HEIGHT }}
    >
      <motion.div
        className="fixed left-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-[#1f6b55] via-[#c9a66b] to-[#e2c08a]"
        style={{ width: progressWidth }}
      />

      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#050d0b]">
        {/* Shared atmosphere across both columns */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_20%_50%,rgba(31,107,85,0.2),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_78%_48%,rgba(201,166,107,0.1),transparent_58%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col lg:flex-row">
          {/* ── LEFT: animated copy ── */}
          <aside className="relative z-20 flex h-[42%] w-full flex-col justify-center px-6 pb-2 pt-24 sm:px-10 lg:h-full lg:w-[44%] lg:justify-center lg:px-12 lg:pb-8 lg:pt-28 xl:px-16">
            <div className="mb-5 flex items-center gap-3 lg:mb-8">
              {chapters.map((roman, i) => (
                <div key={roman} className="flex items-center gap-3">
                  <motion.span
                    animate={{
                      color: activeChapter === i ? '#c9a66b' : 'rgba(244,239,230,0.28)',
                      scale: activeChapter === i ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.35 }}
                    className="font-display text-sm tracking-[0.18em]"
                  >
                    {roman}
                  </motion.span>
                  {i < chapters.length - 1 && (
                    <span className="h-px w-4 bg-[#f4efe6]/15" />
                  )}
                </div>
              ))}
              <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-[#c9a66b]/60">
                {progressPct}%
              </span>
            </div>

            <div className="relative h-[min(38vh,280px)] w-full lg:h-[min(58vh,460px)]">
              <ChapterPanel progress={smoothProgress} enter={0} hold={0.18} exit={0.28}>
                <GoldRule progress={smoothProgress} enter={0.02} exit={0.28} />
                <p className="mb-3 text-[10px] font-bold tracking-[0.35em] text-[#c9a66b] uppercase">
                  Bismillah Cotton & Sports
                </p>
                <h1 className="font-display text-[2.35rem] font-semibold leading-[1.05] tracking-tight text-[#f4efe6] sm:text-5xl xl:text-6xl">
                  Crafted for
                  <span className="mt-1 block bg-gradient-to-r from-[#c9a66b] via-[#e2c08a] to-[#c9a66b] bg-clip-text text-transparent">
                    Glory
                  </span>
                </h1>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#f4efe6]/55">
                  Scroll to spin the reel — every frame, a closer look at championship gold.
                </p>
                <motion.p
                  className="mt-8 text-[10px] tracking-[0.3em] text-[#c9a66b]/70 uppercase lg:hidden"
                  animate={{ opacity: [0.4, 1, 0.4], y: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Scroll ↓
                </motion.p>
              </ChapterPanel>

              <ChapterPanel progress={smoothProgress} enter={0.24} hold={0.42} exit={0.56}>
                <GoldRule progress={smoothProgress} enter={0.26} exit={0.56} />
                <p className="mb-3 text-[10px] tracking-[0.32em] text-[#1f6b55] uppercase">
                  The motion
                </p>
                <h2 className="font-display text-[2.1rem] font-medium leading-[1.1] text-[#f4efe6] sm:text-4xl xl:text-5xl">
                  Spin.
                  <br />
                  Shine.
                  <br />
                  <span className="bg-gradient-to-r from-[#c9a66b] to-[#e2c08a] bg-clip-text text-transparent">
                    Celebrate.
                  </span>
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#f4efe6]/55">
                  Premium metallic trophies — captured frame by frame as you scroll.
                </p>
              </ChapterPanel>

              <ChapterPanel progress={smoothProgress} enter={0.52} hold={0.68} exit={0.84}>
                <GoldRule progress={smoothProgress} enter={0.54} exit={0.84} />
                {trophyProduct && (
                  <>
                    <p className="mb-3 text-[10px] tracking-[0.28em] text-[#c9a66b] uppercase">
                      Featured trophy
                    </p>
                    <h3 className="font-display text-2xl font-medium leading-snug text-[#f4efe6] sm:text-3xl xl:text-4xl">
                      {trophyProduct.name}
                    </h3>
                    <p className="mt-3 text-sm text-[#f4efe6]/55">
                      {format(trophyProduct.price)}
                      <span className="mx-2 text-[#c9a66b]/40">·</span>
                      17.5cm gold metallic
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenProduct(trophyProduct)}
                      className="pointer-events-auto mt-6 w-fit rounded-full border border-[#c9a66b]/45 bg-[#0a1a16]/50 px-6 py-2.5 text-[11px] font-semibold tracking-[0.2em] text-[#c9a66b] uppercase backdrop-blur-sm transition hover:border-[#c9a66b] hover:bg-[#1f6b55]/25"
                    >
                      View product
                    </button>
                  </>
                )}
              </ChapterPanel>

              <ChapterPanel progress={smoothProgress} enter={0.78} hold={0.9} exit={1.05}>
                <GoldRule progress={smoothProgress} enter={0.8} exit={1.05} />
                <p className="mb-3 text-[10px] tracking-[0.3em] text-[#f4efe6]/40 uppercase">
                  The atelier awaits
                </p>
                <h2 className="font-display text-[2.1rem] font-medium text-[#f4efe6] sm:text-4xl">
                  Shop the
                  <span className="block text-[#c9a66b]">collection</span>
                </h2>
                <p className="mt-4 max-w-sm text-sm text-[#f4efe6]/55">
                  Egyptian cotton, polo wear & athletic essentials — and trophies built to shine.
                </p>
                <button
                  type="button"
                  onClick={onGoShop}
                  className="pointer-events-auto group relative mt-7 w-fit overflow-hidden rounded-full bg-gradient-to-r from-[#1f6b55] to-[#2a8a6e] px-8 py-3.5 text-[11px] font-bold tracking-[0.22em] text-[#f4efe6] uppercase shadow-[0_0_40px_rgba(31,107,85,0.4)] transition hover:shadow-[0_0_60px_rgba(201,166,107,0.25)]"
                >
                  <span className="relative z-10">Enter the store</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-full" />
                </button>
              </ChapterPanel>
            </div>

            <motion.div
              className="mt-8 hidden items-center gap-3 text-[10px] tracking-[0.28em] text-[#c9a66b]/55 uppercase lg:flex"
              style={{ opacity: scrollCueOpacity }}
            >
              <span className="inline-block h-8 w-px bg-gradient-to-b from-[#c9a66b] to-transparent" />
              Scroll to reveal
            </motion.div>
          </aside>

          {/* ── RIGHT: trophy on same theme stage ── */}
          <div className="relative h-[58%] w-full flex-1 lg:h-full lg:w-[56%]">
            {/* Ambient gold pool behind trophy */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-[46%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,166,107,0.12),transparent_68%)]" />

            <div
              ref={canvasWrapRef}
              className="absolute inset-0 overflow-hidden bg-[#050d0b]"
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full bg-[#050d0b]"
                style={{
                  // Soft oval reveal — kills the hard grey rectangle
                  WebkitMaskImage:
                    'radial-gradient(ellipse 58% 72% at 50% 46%, #000 35%, rgba(0,0,0,0.85) 58%, transparent 78%)',
                  maskImage:
                    'radial-gradient(ellipse 58% 72% at 50% 46%, #000 35%, rgba(0,0,0,0.85) 58%, transparent 78%)',
                }}
                aria-hidden
              />
            </div>

            {loading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050d0b]/90">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="rounded-full border border-[#c9a66b]/30 bg-[#0a1a16]/80 px-5 py-2.5 text-[11px] tracking-[0.25em] uppercase text-[#c9a66b] backdrop-blur-md"
                >
                  Loading frames…
                </motion.div>
              </div>
            )}

            <div className="pointer-events-none absolute bottom-5 right-5 z-20 hidden items-end gap-2 text-right lg:flex">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#f4efe6]/35">
                FRAME{' '}
                {String(Math.round((progressPct / 100) * (FRAME_COUNT - 1)) + 1).padStart(3, '0')}
              </span>
              <span className="text-[10px] text-[#c9a66b]/40">/ {FRAME_COUNT}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

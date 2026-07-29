import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, X, ZoomIn } from 'lucide-react';

type GalleryProps = {
  images: string[];
  alt: string;
  className?: string;
  previewClassName?: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_MS = 300;
const SWIPE_THRESHOLD = 50;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function ProductImageGallery({
  images,
  alt,
  className = '',
  previewClassName = '',
}: GalleryProps) {
  const safeImages = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  if (safeImages.length === 0) {
    return (
      <div
        className={`flex aspect-square items-center justify-center rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] text-xs text-[var(--site-muted)] ${className}`}
      >
        No image
      </div>
    );
  }

  const current = safeImages[clamp(index, 0, safeImages.length - 1)];

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={`group relative mx-auto block w-full overflow-hidden rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] aspect-square ${previewClassName}`}
        aria-label="Open image zoom"
      >
        <img
          src={current}
          alt={alt}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          referrerPolicy="no-referrer"
          draggable={false}
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
          <Maximize2 size={12} />
          Zoom
        </span>
        {safeImages.length > 1 && (
          <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
            {index + 1} / {safeImages.length}
          </span>
        )}
      </button>

      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {safeImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-[var(--site-surface)] transition sm:h-16 sm:w-16 ${
                i === index
                  ? 'border-[var(--site-gold)] ring-2 ring-[var(--site-gold)]/30'
                  : 'border-[var(--site-border)] opacity-80 hover:opacity-100'
              }`}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
            >
              <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}

      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={safeImages}
        index={index}
        onIndexChange={setIndex}
        alt={alt}
      />
    </div>
  );
}

type LightboxProps = {
  open: boolean;
  onClose: () => void;
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  alt: string;
};

type Transform = { scale: number; x: number; y: number };

function ImageLightbox({ open, onClose, images, index, onIndexChange, alt }: LightboxProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const transformRef = useRef<Transform>({ scale: 1, x: 0, y: 0 });
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });

  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    mode: 'pan' | 'swipe';
  } | null>(null);
  const lastTapRef = useRef(0);
  const indexRef = useRef(index);
  indexRef.current = index;

  const applyTransform = useCallback((next: Transform) => {
    const scale = clamp(next.scale, MIN_SCALE, MAX_SCALE);
    const finalScale = scale <= 1.01 ? 1 : scale;
    const x = finalScale === 1 ? 0 : next.x;
    const y = finalScale === 1 ? 0 : next.y;
    const value = { scale: finalScale, x, y };
    transformRef.current = value;
    setTransform(value);
  }, []);

  const resetZoom = useCallback(() => {
    applyTransform({ scale: 1, x: 0, y: 0 });
  }, [applyTransform]);

  const zoomTo = useCallback(
    (nextScale: number, cx?: number, cy?: number) => {
      const prev = transformRef.current;
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      if (cx == null || cy == null || !stageRef.current) {
        applyTransform({ scale, x: prev.x, y: prev.y });
        return;
      }
      const rect = stageRef.current.getBoundingClientRect();
      const px = cx - rect.left - rect.width / 2;
      const py = cy - rect.top - rect.height / 2;
      const ratio = scale / (prev.scale || 1);
      applyTransform({
        scale,
        x: px - (px - prev.x) * ratio,
        y: py - (py - prev.y) * ratio,
      });
    },
    [applyTransform]
  );

  const zoomBy = useCallback(
    (delta: number) => {
      const stage = stageRef.current;
      if (!stage) {
        applyTransform({
          scale: transformRef.current.scale + delta,
          x: transformRef.current.x,
          y: transformRef.current.y,
        });
        return;
      }
      const rect = stage.getBoundingClientRect();
      zoomTo(
        transformRef.current.scale + delta,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    },
    [applyTransform, zoomTo]
  );

  const go = useCallback(
    (dir: -1 | 1) => {
      if (images.length < 2) return;
      const next = (indexRef.current + dir + images.length) % images.length;
      resetZoom();
      onIndexChange(next);
    },
    [images.length, onIndexChange, resetZoom]
  );

  useEffect(() => {
    if (!open) return;
    resetZoom();
  }, [open, index, resetZoom]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomBy(0.45);
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomBy(-0.45);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, go, zoomBy]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let remove: (() => void) | undefined;
    let raf = 0;
    let tries = 0;

    const attach = () => {
      if (cancelled) return;
      const stage = stageRef.current;
      if (!stage) {
        if (tries++ < 30) raf = requestAnimationFrame(attach);
        return;
      }

      const touchDist = (touches: TouchList) =>
        Math.hypot(
          touches[0].clientX - touches[1].clientX,
          touches[0].clientY - touches[1].clientY
        );

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        zoomTo(transformRef.current.scale + (e.deltaY > 0 ? -0.25 : 0.25), e.clientX, e.clientY);
      };

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length >= 2) {
          e.preventDefault();
          pinchRef.current = { dist: touchDist(e.touches), scale: transformRef.current.scale };
          dragRef.current = null;
          return;
        }
        const t = e.touches[0];
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_MS) {
          e.preventDefault();
          lastTapRef.current = 0;
          if (transformRef.current.scale > 1.15) resetZoom();
          else zoomTo(2.5, t.clientX, t.clientY);
          return;
        }
        lastTapRef.current = now;
        dragRef.current = {
          startX: t.clientX,
          startY: t.clientY,
          originX: transformRef.current.x,
          originY: transformRef.current.y,
          mode: transformRef.current.scale > 1.05 ? 'pan' : 'swipe',
        };
      };

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length >= 2) {
          e.preventDefault();
          if (!pinchRef.current) {
            pinchRef.current = { dist: touchDist(e.touches), scale: transformRef.current.scale };
            return;
          }
          const dist = touchDist(e.touches);
          if (pinchRef.current.dist < 8) return;
          const next = pinchRef.current.scale * (dist / pinchRef.current.dist);
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          zoomTo(next, midX, midY);
          return;
        }

        const drag = dragRef.current;
        if (!drag || e.touches.length !== 1) return;
        const t = e.touches[0];
        if (drag.mode === 'pan') {
          e.preventDefault();
          applyTransform({
            scale: transformRef.current.scale,
            x: drag.originX + (t.clientX - drag.startX),
            y: drag.originY + (t.clientY - drag.startY),
          });
        }
      };

      const onTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
          pinchRef.current = null;
          if (transformRef.current.scale < 1.05) resetZoom();
        }
        const drag = dragRef.current;
        if (drag?.mode === 'swipe' && e.changedTouches[0] && e.touches.length === 0) {
          const t = e.changedTouches[0];
          const dx = t.clientX - drag.startX;
          const dy = t.clientY - drag.startY;
          if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            go(dx < 0 ? 1 : -1);
          }
        }
        if (e.touches.length === 0) dragRef.current = null;
      };

      const onDblClick = (e: MouseEvent) => {
        e.preventDefault();
        if (transformRef.current.scale > 1.15) resetZoom();
        else zoomTo(2.5, e.clientX, e.clientY);
      };

      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType === 'touch' || e.button !== 0) return;
        if (transformRef.current.scale <= 1.05) return;
        stage.setPointerCapture(e.pointerId);
        dragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          originX: transformRef.current.x,
          originY: transformRef.current.y,
          mode: 'pan',
        };
      };

      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        const drag = dragRef.current;
        if (!drag || drag.mode !== 'pan') return;
        applyTransform({
          scale: transformRef.current.scale,
          x: drag.originX + (e.clientX - drag.startX),
          y: drag.originY + (e.clientY - drag.startY),
        });
      };

      const onPointerUp = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        dragRef.current = null;
      };

      stage.addEventListener('wheel', onWheel, { passive: false });
      stage.addEventListener('touchstart', onTouchStart, { passive: false });
      stage.addEventListener('touchmove', onTouchMove, { passive: false });
      stage.addEventListener('touchend', onTouchEnd);
      stage.addEventListener('touchcancel', onTouchEnd);
      stage.addEventListener('dblclick', onDblClick);
      stage.addEventListener('pointerdown', onPointerDown);
      stage.addEventListener('pointermove', onPointerMove);
      stage.addEventListener('pointerup', onPointerUp);
      stage.addEventListener('pointercancel', onPointerUp);

      remove = () => {
        stage.removeEventListener('wheel', onWheel);
        stage.removeEventListener('touchstart', onTouchStart);
        stage.removeEventListener('touchmove', onTouchMove);
        stage.removeEventListener('touchend', onTouchEnd);
        stage.removeEventListener('touchcancel', onTouchEnd);
        stage.removeEventListener('dblclick', onDblClick);
        stage.removeEventListener('pointerdown', onPointerDown);
        stage.removeEventListener('pointermove', onPointerMove);
        stage.removeEventListener('pointerup', onPointerUp);
        stage.removeEventListener('pointercancel', onPointerUp);
      };
    };

    // Wait a frame so AnimatePresence has mounted the stage
    raf = requestAnimationFrame(attach);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      remove?.();
    };
  }, [open, images.length, applyTransform, zoomTo, resetZoom, go]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[220] flex flex-col bg-black/93"
          role="dialog"
          aria-modal="true"
          aria-label="Product image viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="relative z-30 flex shrink-0 items-center justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-5">
            <p className="min-w-0 truncate text-xs font-semibold text-white/80 sm:text-sm">
              {alt}
              {images.length > 1 && (
                <span className="ml-2 font-mono text-white/45">
                  {index + 1}/{images.length}
                </span>
              )}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => zoomBy(-0.45)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white"
                aria-label="Zoom out"
              >
                <Minus size={18} />
              </button>
              <span className="min-w-[3rem] text-center font-mono text-xs text-white/70">
                {Math.round(transform.scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => zoomBy(0.45)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white"
                aria-label="Zoom in"
              >
                <Plus size={18} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white"
                aria-label="Close viewer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div
            ref={stageRef}
            className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden"
            style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
          >
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white md:left-4"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white md:right-4"
                  aria-label="Next image"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <img
              key={images[index]}
              src={images[index]}
              alt={`${alt} — ${index + 1}`}
              referrerPolicy="no-referrer"
              draggable={false}
              className="max-h-[min(78svh,920px)] max-w-[min(96vw,1100px)] select-none object-contain"
              style={{
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
                transformOrigin: 'center center',
                cursor: transform.scale > 1.05 ? 'grab' : 'zoom-in',
                willChange: 'transform',
              }}
            />
          </div>

          <div className="relative z-30 shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-5">
            <p className="mb-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/50 sm:text-[11px]">
              <ZoomIn size={12} />
              <span className="sm:hidden">Pinch / double-tap zoom · swipe for photos</span>
              <span className="hidden sm:inline">Scroll to zoom · double-click · drag to pan · Esc closes</span>
            </p>
            {images.length > 1 && (
              <div className="mx-auto flex max-w-xl justify-center gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={`${img}-lb-${i}`}
                    type="button"
                    onClick={() => {
                      resetZoom();
                      onIndexChange(i);
                    }}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border sm:h-14 sm:w-14 ${
                      i === index ? 'border-white ring-2 ring-white/40' : 'border-white/20 opacity-70'
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

import React, { useEffect, useRef, useState } from 'react';

type CursorMode = 'default' | 'hover' | 'drag';

const HOVER_SELECTOR =
  'a, button, [role="button"], input, textarea, select, label, summary, .product-card, [data-cursor-hover]';

function GoldSpark() {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="cursor-gold-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4e4c1" />
          <stop offset="45%" stopColor="#e2c08a" />
          <stop offset="100%" stopColor="#c9a66b" />
        </radialGradient>
        <filter id="cursor-gold-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M16 2 L18.2 13.8 L30 16 L18.2 18.2 L16 30 L13.8 18.2 L2 16 L13.8 13.8 Z"
        fill="url(#cursor-gold-core)"
        filter="url(#cursor-gold-glow)"
        stroke="#a8874f"
        strokeWidth="0.4"
      />
    </svg>
  );
}

/**
 * Desktop-only cinematic cursor: gold spark + lagging ring.
 * Shows [ DRAG ] over elements with data-cursor="drag".
 */
export default function CinematicCursor() {
  const sparkRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const label = useRef({ x: -100, y: -100 });
  const raf = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');

  useEffect(() => {
    const mqFine = window.matchMedia('(pointer: fine)');
    const mqWide = window.matchMedia('(min-width: 768px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => {
      const on = mqFine.matches && mqWide.matches && !mqMotion.matches;
      setEnabled(on);
      document.documentElement.classList.toggle('cinematic-cursor-on', on);
    };

    sync();
    mqFine.addEventListener('change', sync);
    mqWide.addEventListener('change', sync);
    mqMotion.addEventListener('change', sync);
    return () => {
      mqFine.removeEventListener('change', sync);
      mqWide.removeEventListener('change', sync);
      mqMotion.removeEventListener('change', sync);
      document.documentElement.classList.remove('cinematic-cursor-on');
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return 'default';
      if (target.closest('[data-cursor="drag"]')) return 'drag';
      if (target.closest(HOVER_SELECTOR)) return 'hover';
      return 'default';
    };

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      setVisible(true);
      setMode(resolveMode(e.target));
    };

    const onLeave = () => setVisible(false);
    const onOver = (e: MouseEvent) => setMode(resolveMode(e.target));

    const tick = () => {
      const { x, y } = mouse.current;
      ring.current.x += (x - ring.current.x) * 0.12;
      ring.current.y += (y - ring.current.y) * 0.12;
      label.current.x += (x - label.current.x) * 0.18;
      label.current.y += (y - label.current.y) * 0.18;

      if (sparkRef.current) {
        sparkRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${label.current.x + 28}px, ${label.current.y + 18}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  const hover = mode === 'hover' || mode === 'drag';

  return (
    <div
      className={`cinematic-cursor pointer-events-none fixed inset-0 z-[9999] ${visible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden
    >
      <div
        ref={sparkRef}
        className={`cinematic-cursor__spark absolute top-0 left-0 will-change-transform ${hover ? 'is-hover' : ''}`}
      >
        <GoldSpark />
      </div>
      <div
        ref={ringRef}
        className={`cinematic-cursor__ring absolute top-0 left-0 will-change-transform ${hover ? 'is-hover' : ''} ${
          mode === 'drag' ? 'is-drag' : ''
        }`}
      />
      <div
        ref={labelRef}
        className={`cinematic-cursor__label absolute top-0 left-0 will-change-transform ${
          mode === 'drag' ? 'is-visible' : ''
        }`}
      >
        [ DRAG ]
      </div>
    </div>
  );
}

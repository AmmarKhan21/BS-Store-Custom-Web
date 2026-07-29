import React, { useEffect, useRef, useState } from 'react';

type CursorMode = 'default' | 'hover' | 'drag' | 'trophy';

const HOVER_SELECTOR =
  'a, button, [role="button"], input, textarea, select, label, summary, .product-card, [data-cursor-hover]';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

function GoldPoint() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="orbit-gold-point" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6e0" />
          <stop offset="40%" stopColor="#e2c08a" />
          <stop offset="100%" stopColor="#c9a66b" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="4.2" fill="url(#orbit-gold-point)" />
      <circle cx="12" cy="12" r="7" fill="none" stroke="rgba(226,192,138,0.45)" strokeWidth="0.8" />
    </svg>
  );
}

/** Orbit Halo — velocity trail + trophy labels (octaboot-style product cursor) */
export default function CinematicCursor() {
  const sparkRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const labelPos = useRef({ x: -100, y: -100 });
  const velocity = useRef(0);
  const particles = useRef<Particle[]>([]);
  const modeRef = useRef<CursorMode>('default');
  const raf = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [label, setLabel] = useState('');
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

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

    const resolve = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return { mode: 'default' as CursorMode, label: '' };
      if (target.closest('[data-cursor="drag"]')) {
        return { mode: 'drag' as CursorMode, label: '[ DRAG ]' };
      }
      const trophy = target.closest('[data-cursor="trophy"], [data-cursor="view"]');
      if (trophy) {
        const custom = trophy.getAttribute('data-cursor-label');
        return {
          mode: 'trophy' as CursorMode,
          label: custom ? `[ ${custom} ]` : '[ VIEW TROPHY ]',
        };
      }
      if (target.closest(HOVER_SELECTOR)) {
        const tagged = target.closest('[data-cursor-label]');
        const custom = tagged?.getAttribute('data-cursor-label');
        return {
          mode: 'hover' as CursorMode,
          label: custom ? `[ ${custom} ]` : '[ REVEAL DETAIL ]',
        };
      }
      return { mode: 'default' as CursorMode, label: '' };
    };

    const onMove = (e: MouseEvent) => {
      const m = mouse.current;
      const dx = e.clientX - m.x;
      const dy = e.clientY - m.y;
      const speed = Math.min(Math.hypot(dx, dy), 80);
      velocity.current = velocity.current * 0.75 + speed * 0.25;
      m.x = e.clientX;
      m.y = e.clientY;
      setVisible(true);
      const next = resolve(e.target);
      setMode(next.mode);
      setLabel(next.label);

      if (speed > 4 && next.mode !== 'trophy') {
        const count = Math.min(Math.floor(speed / 8), 4);
        for (let i = 0; i < count; i++) {
          particles.current.push({
            x: e.clientX - dx * (i / count) * 0.4,
            y: e.clientY - dy * (i / count) * 0.4,
            vx: -dx * 0.04 + (Math.random() - 0.5) * 0.6,
            vy: -dy * 0.04 + (Math.random() - 0.5) * 0.6,
            life: 1,
            size: 1.5 + Math.random() * 2.5,
          });
        }
        if (particles.current.length > 80) {
          particles.current.splice(0, particles.current.length - 80);
        }
      }
    };

    const onLeave = () => setVisible(false);
    const onOver = (e: MouseEvent) => {
      const next = resolve(e.target);
      setMode(next.mode);
      setLabel(next.label);
    };
    const onDown = () => {
      setPulsing(true);
      document.body.classList.add('cursor-pulse-flash');
      window.setTimeout(() => {
        setPulsing(false);
        document.body.classList.remove('cursor-pulse-flash');
      }, 420);
    };

    const resizeCanvas = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = window.innerWidth * devicePixelRatio;
      c.height = window.innerHeight * devicePixelRatio;
      c.style.width = `${window.innerWidth}px`;
      c.style.height = `${window.innerHeight}px`;
    };
    resizeCanvas();

    const tick = () => {
      const { x, y } = mouse.current;
      const lag = modeRef.current === 'trophy' ? 0.18 : 0.12;
      ring.current.x += (x - ring.current.x) * lag;
      ring.current.y += (y - ring.current.y) * lag;
      labelPos.current.x += (x - labelPos.current.x) * 0.2;
      labelPos.current.y += (y - labelPos.current.y) * 0.2;
      velocity.current *= 0.92;
      const velScale = 1 + Math.min(velocity.current / 40, 0.55);

      if (sparkRef.current) {
        sparkRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${velScale})`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${labelPos.current.x + 30}px, ${labelPos.current.y + 22}px, 0)`;
      }
      if (pulseRef.current) {
        pulseRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles.current = particles.current.filter((p) => p.life > 0.02);
        for (const p of particles.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.life *= 0.9;
          ctx.beginPath();
          ctx.fillStyle = `rgba(226, 192, 138, ${p.life * 0.7})`;
          ctx.shadowColor = 'rgba(201, 166, 107, 0.8)';
          ctx.shadowBlur = 8;
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('resize', resizeCanvas);
    document.documentElement.addEventListener('mouseleave', onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', resizeCanvas);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf.current);
      document.body.classList.remove('cursor-pulse-flash');
    };
  }, [enabled]);

  if (!enabled) return null;

  const interactive = mode !== 'default';

  return (
    <div
      className={`cinematic-cursor pointer-events-none fixed inset-0 z-[9999] ${visible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div ref={pulseRef} className="cinematic-cursor__pulse absolute top-0 left-0">
        <span className={pulsing ? 'is-on' : ''} />
      </div>
      <div
        ref={sparkRef}
        className={`cinematic-cursor__spark absolute top-0 left-0 will-change-transform ${interactive ? 'is-hover' : ''}`}
      >
        <GoldPoint />
      </div>
      <div
        ref={ringRef}
        className={`cinematic-cursor__ring absolute top-0 left-0 will-change-transform ${interactive ? 'is-hover' : ''} ${
          mode === 'drag' ? 'is-drag' : ''
        } ${mode === 'trophy' ? 'is-trophy' : ''}`}
      />
      <div
        ref={labelRef}
        className={`cinematic-cursor__label absolute top-0 left-0 will-change-transform ${label ? 'is-visible' : ''}`}
      >
        <span className="cinematic-cursor__label-line" />
        {label}
      </div>
    </div>
  );
}

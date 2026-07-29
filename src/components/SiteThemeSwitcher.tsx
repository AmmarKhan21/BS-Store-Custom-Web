import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Palette, X, Sparkles } from 'lucide-react';
import { SITE_THEMES, SiteThemeId } from '../theme/siteThemes';

type Props = {
  active: SiteThemeId;
  onChange: (id: SiteThemeId) => void;
  /** Hide while product modal / cart / checkout are open so they stay usable */
  hidden?: boolean;
};

export default function SiteThemeSwitcher({ active, onChange, hidden = false }: Props) {
  const [open, setOpen] = useState(false);
  const activeMeta = SITE_THEMES.find((t) => t.id === active) ?? SITE_THEMES[0];

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (hidden) return null;

  return (
    <>
      {/* Floating trigger — bottom-right so it doesn't cover product copy */}
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--site-gold)]/45 bg-[var(--site-surface)] text-[var(--site-ink)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:right-6 sm:bottom-6 sm:h-auto sm:w-auto sm:gap-2.5 sm:px-4 sm:py-3"
        aria-label="Change homepage theme"
      >
        <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
          <span className="absolute inset-0 flex">
            {activeMeta.swatches.slice(0, 3).map((c) => (
              <span key={c} className="flex-1" style={{ background: c }} />
            ))}
          </span>
          <Palette size={14} className="relative text-white drop-shadow" />
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-[9px] font-bold tracking-[0.22em] text-[var(--site-gold)] uppercase">
            Theme
          </span>
          <span className="block text-xs font-semibold text-[var(--site-ink)]">
            {activeMeta.name}
          </span>
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              aria-label="Close themes"
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="theme-panel-title"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative z-10 flex max-h-[min(92svh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-[var(--site-border)] bg-[var(--site-bg)] shadow-[0_40px_100px_rgba(0,0,0,0.55)] sm:rounded-3xl"
            >
              {/* Header glow */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-80 sm:h-40"
                style={{
                  background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${activeMeta.swatches[1]}55, transparent 70%)`,
                }}
              />

              {/* Mobile drag cue */}
              <div className="relative flex shrink-0 justify-center pt-3 sm:hidden" aria-hidden>
                <span className="h-1 w-10 rounded-full bg-[var(--site-ink)]/25" />
              </div>

              <div className="relative flex shrink-0 items-start justify-between gap-3 px-4 pt-3 pb-2 sm:gap-4 sm:px-5 sm:pt-5 md:px-7 md:pt-7">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.28em] text-[var(--site-gold)] uppercase">
                    <Sparkles size={11} /> Homepage looks
                  </p>
                  <h2
                    id="theme-panel-title"
                    className="mt-1 font-display text-xl font-semibold text-[var(--site-ink)] sm:text-2xl md:text-3xl"
                  >
                    Choose your atmosphere
                  </h2>
                  <p className="mt-1 max-w-md text-[11px] leading-snug text-[var(--site-muted)] sm:text-xs md:text-sm">
                    Five full-site directions — hero, nav, store & footer shift together.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-full border border-[var(--site-border)] bg-[var(--site-surface)] p-2.5 text-[var(--site-ink)] transition hover:border-[var(--site-gold)]"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2 sm:px-5 md:px-7 [-webkit-overflow-scrolling:touch]">
                <div className="grid grid-cols-1 gap-2.5 pt-1 pb-2 min-[380px]:grid-cols-2 md:grid-cols-3 md:gap-4 md:pb-3">
                  {SITE_THEMES.map((theme, i) => {
                    const isActive = active === theme.id;
                    return (
                      <motion.button
                        key={theme.id}
                        type="button"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.03 * i }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onChange(theme.id);
                          setTimeout(() => setOpen(false), 280);
                        }}
                        className={`group relative overflow-hidden rounded-2xl border p-2.5 text-left transition sm:p-3 ${
                          isActive
                            ? 'border-[var(--site-gold)] ring-2 ring-[var(--site-gold)]/35'
                            : 'border-white/10 hover:border-[var(--site-gold)]/40'
                        }`}
                        style={{ background: theme.swatches[0] }}
                      >
                        <div className="mb-2 flex h-12 overflow-hidden rounded-xl shadow-inner sm:mb-3 sm:h-16">
                          {theme.swatches.map((c) => (
                            <span key={c} className="flex-1" style={{ background: c }} />
                          ))}
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold tracking-[0.2em] text-white/45 uppercase">
                              {theme.mood}
                            </span>
                            <p className="font-display text-[14px] font-semibold text-[#f4efe6] sm:text-[15px]">
                              {theme.name}
                            </p>
                            <p className="mt-0.5 text-[10px] leading-snug text-white/55">
                              {theme.tagline}
                            </p>
                          </div>
                          {isActive && (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--site-gold)] text-[var(--site-bg)]">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <p className="relative shrink-0 border-t border-[var(--site-border)]/60 px-4 py-3 text-center text-[10px] text-[var(--site-muted)] sm:px-5 md:px-7">
                Your pick is saved for next visit · Esc to close
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

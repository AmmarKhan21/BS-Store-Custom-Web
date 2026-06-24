import React, { useEffect, useState } from 'react';

type AppLoaderProps = {
  visible: boolean;
  variant?: 'store' | 'admin';
  message?: string;
};

const DEFAULT_MESSAGES = {
  store: 'Curating premium cotton & sports wear…',
  admin: 'Preparing your merchant dashboard…',
};

export default function AppLoader({
  visible,
  variant = 'store',
  message,
}: AppLoaderProps) {
  const [mounted, setMounted] = useState(visible);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setExiting(false);
      return;
    }
    setExiting(true);
    const timer = setTimeout(() => setMounted(false), 550);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!mounted) return null;

  const isAdmin = variant === 'admin';
  const statusText = message ?? DEFAULT_MESSAGES[variant];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-500 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${
        isAdmin
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950'
          : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Ambient glow */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full blur-3xl opacity-40 pointer-events-none ${
          isAdmin ? 'bg-indigo-600' : 'bg-indigo-300'
        }`}
        style={{ animation: 'loader-pulse 2.4s ease-in-out infinite' }}
      />

      <div className="relative flex flex-col items-center text-center px-6 max-w-sm">
        {/* Logo ring */}
        <div className="relative mb-8">
          <div
            className={`absolute inset-0 rounded-2xl blur-md opacity-60 ${
              isAdmin ? 'bg-indigo-500' : 'bg-indigo-400'
            }`}
            style={{ animation: 'loader-pulse 2s ease-in-out infinite' }}
          />
          <div
            className={`relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl border ${
              isAdmin
                ? 'bg-indigo-600 border-indigo-400/30 text-white'
                : 'bg-white border-indigo-100 text-indigo-700'
            }`}
          >
            <span className="font-display font-black text-3xl tracking-tight">B</span>
          </div>
          <div
            className="absolute -inset-3 rounded-3xl border-2 border-transparent border-t-indigo-500 border-r-indigo-400/40"
            style={{ animation: 'loader-spin 1.1s linear infinite' }}
          />
          <div
            className="absolute -inset-5 rounded-[1.35rem] border border-indigo-500/20"
            style={{ animation: 'loader-spin 2.2s linear infinite reverse' }}
          />
        </div>

        <h2
          className={`font-display font-bold text-lg tracking-tight mb-1 ${
            isAdmin ? 'text-white' : 'text-slate-900'
          }`}
        >
          Bismillah Store
        </h2>
        <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-6 ${
          isAdmin ? 'text-indigo-300' : 'text-indigo-600'
        }`}>
          Cotton & Sports Hub
        </p>

        {/* Progress bar */}
        <div
          className={`w-48 h-1 rounded-full overflow-hidden mb-4 ${
            isAdmin ? 'bg-slate-700' : 'bg-slate-200'
          }`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400"
            style={{ animation: 'loader-bar 1.4s ease-in-out infinite' }}
          />
        </div>

        <p className={`text-xs font-medium ${isAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
          {statusText}
        </p>

        {/* Bouncing dots */}
        <div className="flex items-center gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-indigo-400' : 'bg-indigo-500'}`}
              style={{ animation: `loader-dot 1.2s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes loader-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes loader-pulse {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.35; }
          50% { transform: translate(-50%, 0) scale(1.08); opacity: 0.55; }
        }
        @keyframes loader-bar {
          0% { width: 8%; margin-left: 0; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 8%; margin-left: 92%; }
        }
        @keyframes loader-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X, ChevronRight } from 'lucide-react';

type Props = {
  customerName: string | null;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onLogoClick: () => void;
  onGoShop: () => void;
  categories: string[];
  onSelectCategory: (cat: string) => void;
};

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'contact', label: 'Contact', href: '/contact' },
] as const;

export default function StoreNavbar({
  customerName,
  cartCount,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onLogoClick,
  onGoShop,
  categories,
  onSelectCategory,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNav = (id: string) => {
    setMobileOpen(false);
    if (id === 'home') {
      onLogoClick();
      return;
    }
    if (id === 'shop') onGoShop();
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    setMobileSearchOpen(false);
    onGoShop();
  };

  const linkCls =
    'rounded-full px-3.5 py-2 text-[11px] font-semibold tracking-[0.14em] text-[var(--site-ink)]/70 uppercase transition hover:bg-white/5 hover:text-[var(--site-gold-soft)]';

  return (
    <>
      <header
        id="global-header"
        className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300 ${
          scrolled || mobileOpen
            ? 'site-nav-solid border-b shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        {!scrolled && !mobileOpen && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--site-bg)]/85 via-[var(--site-bg)]/35 to-transparent" />
        )}

        <div className="relative mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 md:h-[4.25rem] md:px-8">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onLogoClick();
            }}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--site-gold)] font-display text-lg font-bold text-[var(--site-bg)] shadow-[0_0_24px_color-mix(in_srgb,var(--site-gold)_35%,transparent)] md:h-10 md:w-10">
              B
            </span>
            <span className="hidden text-left sm:block">
              <span className="block font-display text-base font-bold leading-none tracking-tight text-[var(--site-ink)] md:text-lg">
                Bismillah
              </span>
              <span className="mt-0.5 block text-[9px] font-bold tracking-[0.2em] text-[var(--site-gold)] uppercase md:text-[10px]">
                Cotton & Sports Hub
              </span>
            </span>
          </button>

          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) =>
              'href' in link && link.href ? (
                <Link key={link.id} to={link.href} className={linkCls}>
                  {link.label}
                </Link>
              ) : (
                <button key={link.id} type="button" onClick={() => handleNav(link.id)} className={linkCls}>
                  {link.label}
                </button>
              )
            )}
          </nav>

          <form onSubmit={submitSearch} className="relative mx-auto hidden min-w-0 max-w-md flex-1 md:block lg:mx-8">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--site-muted)]" size={15} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search cotton, sports, trophies…"
              className="w-full rounded-full border border-[var(--site-border)] bg-white/[0.06] py-2.5 pr-4 pl-10 text-xs text-[var(--site-ink)] placeholder-[var(--site-muted)] outline-none transition focus:border-[var(--site-gold)]/50 focus:ring-1 focus:ring-[var(--site-gold)]/35"
            />
          </form>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[var(--site-ink)] transition hover:border-[var(--site-gold)]/50 hover:text-[var(--site-gold-soft)] md:hidden"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {customerName ? (
              <Link
                to="/account"
                className="hidden items-center gap-1.5 rounded-full border border-[var(--site-border)] bg-white/5 px-3 py-2 text-[11px] font-semibold text-[var(--site-gold-soft)] transition hover:border-[var(--site-gold)]/40 sm:flex"
              >
                <User size={14} />
                {customerName.split(' ')[0]}
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full border border-[var(--site-border)] bg-white/5 px-3.5 py-2 text-[11px] font-semibold tracking-[0.12em] text-[var(--site-muted)] uppercase transition hover:border-[var(--site-gold)]/40 hover:text-[var(--site-ink)] sm:inline-flex"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[var(--site-ink)] transition hover:border-[var(--site-gold)]/50"
              aria-label={`Shopping cart, ${cartCount} items`}
            >
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--site-gold)] px-1 text-[10px] font-bold text-[var(--site-bg)] ring-2 ring-[var(--site-bg)]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[var(--site-ink)] transition hover:border-[var(--site-gold)]/40 lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <form onSubmit={submitSearch} className="border-t border-[var(--site-border)] bg-[var(--site-bg)]/95 px-4 py-3 md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--site-muted)]" size={15} />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search the collection…"
                className="w-full rounded-full border border-[var(--site-border)] bg-white/[0.06] py-2.5 pr-4 pl-10 text-sm text-[var(--site-ink)] outline-none focus:border-[var(--site-gold)]/50"
              />
            </div>
          </form>
        )}
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--site-bg)]/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 right-0 bottom-0 flex w-full max-w-sm flex-col border-l border-[var(--site-border)] bg-[var(--site-surface)] shadow-2xl">
            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <p className="mb-3 text-[10px] font-bold tracking-[0.28em] text-[var(--site-gold)] uppercase">Navigate</p>
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    {'href' in link && link.href ? (
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-3.5 text-sm font-semibold text-[var(--site-ink)] transition hover:bg-white/5"
                      >
                        {link.label}
                        <ChevronRight size={16} className="text-[var(--site-gold)]/60" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNav(link.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left text-sm font-semibold text-[var(--site-ink)] transition hover:bg-white/5"
                      >
                        {link.label}
                        <ChevronRight size={16} className="text-[var(--site-gold)]/60" />
                      </button>
                    )}
                  </li>
                ))}
                <li>
                  <Link
                    to={customerName ? '/account' : '/login'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3.5 text-sm font-semibold text-[var(--site-ink)] transition hover:bg-white/5"
                  >
                    {customerName ? 'My Account' : 'Sign In'}
                    <ChevronRight size={16} className="text-[var(--site-gold)]/60" />
                  </Link>
                </li>
              </ul>

              {categories.length > 0 && (
                <>
                  <p className="mt-8 mb-3 text-[10px] font-bold tracking-[0.28em] text-[var(--site-gold)] uppercase">
                    Collections
                  </p>
                  <ul className="space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory('All');
                          setMobileOpen(false);
                          onGoShop();
                        }}
                        className="w-full rounded-xl px-3 py-3 text-left text-sm text-[var(--site-ink)]/80 transition hover:bg-white/5 hover:text-[var(--site-gold-soft)]"
                      >
                        All products
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCategory(cat);
                            setMobileOpen(false);
                            onGoShop();
                          }}
                          className="w-full rounded-xl px-3 py-3 text-left text-sm text-[var(--site-ink)]/80 transition hover:bg-white/5 hover:text-[var(--site-gold-soft)]"
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </nav>

            <div className="border-t border-[var(--site-border)] p-5">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onGoShop();
                }}
                className="site-cta-btn w-full rounded-full py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase shadow-lg"
              >
                Shop the collection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

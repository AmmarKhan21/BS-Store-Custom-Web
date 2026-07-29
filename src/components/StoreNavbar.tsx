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
    if (id === 'shop') {
      onGoShop();
    }
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    setMobileSearchOpen(false);
    onGoShop();
  };

  return (
    <>
      <header
        id="global-header"
        className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300 ${
          scrolled || mobileOpen
            ? 'border-b border-white/10 bg-[#050d0b]/90 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        {!scrolled && !mobileOpen && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050d0b]/85 via-[#050d0b]/35 to-transparent" />
        )}

        <div className="relative mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 md:h-[4.25rem] md:px-8">
          {/* Brand */}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onLogoClick();
            }}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Bismillah Cotton & Sports Hub — Home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c9a66b] font-display text-lg font-bold text-[#0a1a16] shadow-[0_0_24px_rgba(201,166,107,0.25)] md:h-10 md:w-10">
              B
            </span>
            <span className="hidden text-left sm:block">
              <span className="block font-display text-base font-bold leading-none tracking-tight text-[#f4efe6] md:text-lg">
                Bismillah
              </span>
              <span className="mt-0.5 block text-[9px] font-bold tracking-[0.2em] text-[#c9a66b] uppercase md:text-[10px]">
                Cotton & Sports Hub
              </span>
            </span>
          </button>

          {/* Desktop links */}
          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) =>
              'href' in link && link.href ? (
                <Link
                  key={link.id}
                  to={link.href}
                  className="rounded-full px-3.5 py-2 text-[11px] font-semibold tracking-[0.14em] text-[#f4efe6]/70 uppercase transition hover:bg-white/5 hover:text-[#e2c08a]"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNav(link.id)}
                  className="rounded-full px-3.5 py-2 text-[11px] font-semibold tracking-[0.14em] text-[#f4efe6]/70 uppercase transition hover:bg-white/5 hover:text-[#e2c08a]"
                >
                  {link.label}
                </button>
              )
            )}
          </nav>

          {/* Desktop search */}
          <form
            onSubmit={submitSearch}
            className="relative mx-auto hidden min-w-0 max-w-md flex-1 md:block lg:mx-8"
          >
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#8a857a]"
              size={15}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search cotton, sports, trophies…"
              className="w-full rounded-full border border-white/10 bg-white/[0.06] py-2.5 pr-4 pl-10 text-xs text-[#f4efe6] placeholder-[#7a756c] outline-none transition focus:border-[#c9a66b]/50 focus:bg-white/[0.1] focus:ring-1 focus:ring-[#c9a66b]/35"
            />
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#f4efe6] transition hover:border-[#c9a66b]/40 hover:text-[#e2c08a] md:hidden"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {customerName ? (
              <Link
                to="/account"
                className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-[#e2c08a] transition hover:border-[#c9a66b]/40 hover:text-[#f4efe6] sm:flex"
              >
                <User size={14} />
                {customerName.split(' ')[0]}
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[11px] font-semibold tracking-[0.12em] text-[#b8b0a0] uppercase transition hover:border-[#c9a66b]/40 hover:text-[#f4efe6] sm:inline-flex"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#f4efe6] transition hover:border-[#c9a66b]/50 hover:bg-white/10"
              aria-label={`Shopping cart, ${cartCount} items`}
            >
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c9a66b] px-1 text-[10px] font-bold text-[#0a1a16] ring-2 ring-[#050d0b]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#f4efe6] transition hover:border-[#c9a66b]/40 lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile search strip */}
        {mobileSearchOpen && (
          <form
            onSubmit={submitSearch}
            className="border-t border-white/10 bg-[#050d0b]/95 px-4 py-3 md:hidden"
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#8a857a]"
                size={15}
              />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search the collection…"
                className="w-full rounded-full border border-white/10 bg-white/[0.06] py-2.5 pr-4 pl-10 text-sm text-[#f4efe6] placeholder-[#7a756c] outline-none focus:border-[#c9a66b]/50"
              />
            </div>
          </form>
        )}
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-[#050d0b]/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 right-0 bottom-0 flex w-full max-w-sm flex-col border-l border-white/10 bg-[#0a1613] shadow-2xl">
            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <p className="mb-3 text-[10px] font-bold tracking-[0.28em] text-[#c9a66b] uppercase">
                Navigate
              </p>
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    {'href' in link && link.href ? (
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-3.5 text-sm font-semibold text-[#f4efe6] transition hover:bg-white/5"
                      >
                        {link.label}
                        <ChevronRight size={16} className="text-[#c9a66b]/60" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNav(link.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left text-sm font-semibold text-[#f4efe6] transition hover:bg-white/5"
                      >
                        {link.label}
                        <ChevronRight size={16} className="text-[#c9a66b]/60" />
                      </button>
                    )}
                  </li>
                ))}
                <li>
                  <Link
                    to={customerName ? '/account' : '/login'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3.5 text-sm font-semibold text-[#f4efe6] transition hover:bg-white/5"
                  >
                    {customerName ? 'My Account' : 'Sign In'}
                    <ChevronRight size={16} className="text-[#c9a66b]/60" />
                  </Link>
                </li>
              </ul>

              {categories.length > 0 && (
                <>
                  <p className="mt-8 mb-3 text-[10px] font-bold tracking-[0.28em] text-[#c9a66b] uppercase">
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
                        className="w-full rounded-xl px-3 py-3 text-left text-sm text-[#f4efe6]/80 transition hover:bg-white/5 hover:text-[#e2c08a]"
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
                          className="w-full rounded-xl px-3 py-3 text-left text-sm text-[#f4efe6]/80 transition hover:bg-white/5 hover:text-[#e2c08a]"
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </nav>

            <div className="border-t border-white/10 p-5">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onGoShop();
                }}
                className="w-full rounded-full bg-gradient-to-r from-[#1f6b55] to-[#2a8a6e] py-3.5 text-[11px] font-bold tracking-[0.2em] text-[#f4efe6] uppercase shadow-[0_0_30px_rgba(31,107,85,0.35)]"
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

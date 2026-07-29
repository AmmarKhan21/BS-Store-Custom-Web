import React from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Check,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Truck,
  ShieldCheck,
  CreditCard,
  X,
} from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

type SortBy = 'popular' | 'price-low' | 'price-high';

type Props = {
  products: Product[];
  categories: string[];
  sortedProducts: Product[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  showInStockOnly: boolean;
  setShowInStockOnly: (v: boolean) => void;
  showFeaturedOnly: boolean;
  setShowFeaturedOnly: (v: boolean) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  isMobileFiltersOpen: boolean;
  setIsMobileFiltersOpen: (v: boolean) => void;
  onClearFilters: () => void;
  onOpenQuickView: (p: Product) => void;
  onAddToCartDirectly: (p: Product) => void;
};

function shortLabel(cat: string) {
  const map: Record<string, string> = {
    'Cotton Collection': 'Cotton',
    Clothing: 'Clothing',
    'Sports Wear': 'Sports',
    'Sports Gear': 'Gear',
    Trophies: 'Trophies',
    Trophy: 'Trophies',
  };
  return map[cat] || cat;
}

function FilterPanel(props: {
  products: Product[];
  categories: string[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  showInStockOnly: boolean;
  setShowInStockOnly: (v: boolean) => void;
  showFeaturedOnly: boolean;
  setShowFeaturedOnly: (v: boolean) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  onClearFilters: () => void;
}) {
  const {
    products,
    categories,
    activeCategory,
    setActiveCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    showInStockOnly,
    setShowInStockOnly,
    showFeaturedOnly,
    setShowFeaturedOnly,
    minRating,
    setMinRating,
    onClearFilters,
  } = props;

  const row = (active: boolean) =>
    `flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
      active
        ? 'store-pill-active border-transparent'
        : 'border-[var(--store-border)] text-[var(--store-muted)] hover:border-[var(--store-accent)]/40 hover:text-[var(--store-ink)]'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--store-border)] pb-3">
        <div className="flex items-center gap-2 font-display text-sm font-semibold text-[var(--store-ink)]">
          <Filter size={14} className="text-[var(--store-accent-2)]" />
          Filters
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] text-[var(--store-accent)] uppercase transition hover:opacity-80"
        >
          <RotateCcw size={10} /> Reset
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-bold tracking-[0.22em] text-[var(--store-accent)] uppercase">
          Collections
        </h3>
        <button type="button" onClick={() => setActiveCategory('All')} className={row(activeCategory === 'All')}>
          <span>All products</span>
          <span className="rounded-full bg-black/10 px-2 py-0.5 font-mono text-[10px]">{products.length}</span>
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={row(activeCategory === cat)}
            >
              <span className="truncate">{cat}</span>
              <span className="rounded-full bg-black/10 px-2 py-0.5 font-mono text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-[var(--store-border)] pt-5">
        <h3 className="text-[10px] font-bold tracking-[0.22em] text-[var(--store-accent)] uppercase">
          Price range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="store-input w-full rounded-xl px-3 py-2.5 text-xs"
          />
          <span className="text-[var(--store-muted)]">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="store-input w-full rounded-xl px-3 py-2.5 text-xs"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-[var(--store-border)] pt-5">
        <h3 className="text-[10px] font-bold tracking-[0.22em] text-[var(--store-accent)] uppercase">
          Availability
        </h3>
        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[var(--store-muted)]">
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={(e) => setShowInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--store-border)] accent-[var(--store-accent-2)]"
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[var(--store-muted)]">
          <input
            type="checkbox"
            checked={showFeaturedOnly}
            onChange={(e) => setShowFeaturedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--store-border)] accent-[var(--store-accent-2)]"
          />
          Featured only
        </label>
      </div>

      <div className="space-y-2 border-t border-[var(--store-border)] pt-5">
        <h3 className="text-[10px] font-bold tracking-[0.22em] text-[var(--store-accent)] uppercase">
          Minimum rating
        </h3>
        {[4.5, 4, 3].map((stars) => (
          <button
            key={stars}
            type="button"
            onClick={() => setMinRating(minRating === stars ? 0 : stars)}
            className={row(minRating === stars)}
          >
            <span className="flex items-center gap-1.5">
              <span className="flex text-[var(--store-accent)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    fill={i < Math.floor(stars) ? 'currentColor' : 'none'}
                    className={i < Math.floor(stars) ? '' : 'opacity-25'}
                  />
                ))}
              </span>
              {stars}+
            </span>
            {minRating === stars && <Check size={12} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="store-chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold">
      {children}
      <button type="button" onClick={onClear} aria-label="Remove" className="opacity-60 hover:opacity-100">
        <X size={10} />
      </button>
    </span>
  );
}

export default function StoreCatalog(props: Props) {
  const {
    products,
    categories,
    sortedProducts,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    showInStockOnly,
    setShowInStockOnly,
    showFeaturedOnly,
    setShowFeaturedOnly,
    minRating,
    setMinRating,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
    onClearFilters,
    onOpenQuickView,
    onAddToCartDirectly,
  } = props;

  const filtersOn =
    (activeCategory !== 'All' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (showInStockOnly ? 1 : 0) +
    (showFeaturedOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  const hasChips = filtersOn > 0;

  const filterProps = {
    products,
    categories,
    activeCategory,
    setActiveCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    showInStockOnly,
    setShowInStockOnly,
    showFeaturedOnly,
    setShowFeaturedOnly,
    minRating,
    setMinRating,
    onClearFilters,
  };

  return (
    <main id="store-grid-section" className="store-shell relative z-10 w-full flex-1 bg-[var(--site-bg)]">
      <div className="store-panel relative mx-auto max-w-7xl rounded-t-[1.75rem] px-4 py-12 md:rounded-t-[2.5rem] md:px-8 md:py-14">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="text-[10px] font-bold tracking-[0.28em] text-[var(--store-accent)] uppercase">
                The atelier opens
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-[var(--store-ink)] sm:text-4xl md:text-5xl">
                Shop the collection
              </h2>
              <p className="mt-2 max-w-md text-sm text-[var(--store-muted)]">
                Egyptian cotton, polo wear, athletic essentials & championship trophies.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {[
                { icon: Truck, label: 'COD nationwide' },
                { icon: CreditCard, label: 'PayFast · JazzCash' },
                { icon: ShieldCheck, label: '7-day returns' },
              ].map(({ icon: Icon, label }) => (
                <motion.span
                  key={label}
                  whileHover={{ y: -2 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--store-border)] bg-[var(--store-surface)] px-3 py-1.5 text-[10px] font-semibold tracking-wide text-[var(--store-muted)]"
                >
                  <Icon size={12} className="text-[var(--store-accent-2)]" />
                  {label}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition ${
                activeCategory === 'All' ? 'store-pill-active' : 'store-pill'
              }`}
            >
              All · {products.length}
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition ${
                    activeCategory === cat ? 'store-pill-active' : 'store-pill'
                  }`}
                >
                  {shortLabel(cat)} · {count}
                </button>
              );
            })}
          </div>

          <div className="flex items-start gap-8">
            <aside className="store-aside sticky top-24 hidden w-64 shrink-0 self-start rounded-2xl p-5 md:block">
              <FilterPanel {...filterProps} />
            </aside>

            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex flex-col gap-3 border-b border-[var(--store-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-xs text-[var(--store-muted)] sm:text-left">
                  <strong className="font-semibold text-[var(--store-ink)]">{sortedProducts.length}</strong>{' '}
                  {sortedProducts.length === 1 ? 'piece' : 'pieces'}
                  {activeCategory !== 'All' && (
                    <>
                      {' '}
                      in <span className="font-semibold text-[var(--store-accent-2)]">{activeCategory}</span>
                    </>
                  )}
                </p>

                <div className="flex items-center justify-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="store-pill inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-bold md:hidden"
                  >
                    <SlidersHorizontal size={13} />
                    Filters{filtersOn > 0 ? ` (${filtersOn})` : ''}
                  </button>

                  <label className="flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-[var(--store-accent)] uppercase">
                    Sort
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="store-input rounded-full px-3 py-2 text-[11px] font-semibold tracking-normal normal-case"
                    >
                      <option value="popular">Best rated</option>
                      <option value="price-low">Price · Low to high</option>
                      <option value="price-high">Price · High to low</option>
                    </select>
                  </label>
                </div>
              </div>

              {hasChips && (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] p-3">
                  <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--store-accent)] uppercase">
                    Active
                  </span>
                  {activeCategory !== 'All' && (
                    <Chip onClear={() => setActiveCategory('All')}>{activeCategory}</Chip>
                  )}
                  {searchQuery && <Chip onClear={() => setSearchQuery('')}>“{searchQuery}”</Chip>}
                  {(minPrice || maxPrice) && (
                    <Chip
                      onClear={() => {
                        setMinPrice('');
                        setMaxPrice('');
                      }}
                    >
                      {minPrice || '0'} – {maxPrice || '∞'}
                    </Chip>
                  )}
                  {showInStockOnly && <Chip onClear={() => setShowInStockOnly(false)}>In stock</Chip>}
                  {showFeaturedOnly && <Chip onClear={() => setShowFeaturedOnly(false)}>Featured</Chip>}
                  {minRating > 0 && <Chip onClear={() => setMinRating(0)}>{minRating}★+</Chip>}
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="ml-auto text-[10px] font-bold text-[var(--store-muted)] underline-offset-2 hover:text-[var(--store-accent)] hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {sortedProducts.length === 0 ? (
                <div className="store-aside rounded-2xl px-6 py-16 text-center">
                  <AlertCircle size={36} className="mx-auto mb-3 text-[var(--store-muted)] opacity-40" />
                  <h3 className="font-display text-lg font-semibold text-[var(--store-ink)]">
                    No matching pieces
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--store-muted)]">
                    Try widening filters — the atelier has more to show.
                  </p>
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="store-btn-primary mt-5 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-[0.16em] uppercase"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  id="storefront-product-grid"
                  className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
                  style={{ perspective: 1200 }}
                >
                  {sortedProducts.map((prod, i) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      index={i}
                      onOpenQuickView={onOpenQuickView}
                      onAddToCartDirectly={onAddToCartDirectly}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close filters"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full max-w-sm flex-col bg-[var(--store-bg)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--store-border)] px-4 py-4">
              <div className="flex items-center gap-2 font-display text-sm font-semibold text-[var(--store-ink)]">
                <Filter size={15} className="text-[var(--store-accent-2)]" />
                Filter & refine
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="rounded-full bg-[var(--store-surface)] p-2 text-[var(--store-ink)]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel {...filterProps} />
            </div>
            <div className="flex gap-2 border-t border-[var(--store-border)] p-4">
              <button
                type="button"
                onClick={() => {
                  onClearFilters();
                  setIsMobileFiltersOpen(false);
                }}
                className="store-pill flex-1 rounded-full py-3 text-[11px] font-bold tracking-[0.14em] uppercase"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="store-btn-primary flex-[1.4] rounded-full py-3 text-[11px] font-bold tracking-[0.14em] uppercase"
              >
                Show {sortedProducts.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

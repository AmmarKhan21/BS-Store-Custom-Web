import React from 'react';
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

function activeCount(props: {
  activeCategory: string;
  minPrice: string;
  maxPrice: string;
  showInStockOnly: boolean;
  showFeaturedOnly: boolean;
  minRating: number;
  searchQuery: string;
}) {
  return (
    (props.activeCategory !== 'All' ? 1 : 0) +
    (props.searchQuery ? 1 : 0) +
    (props.minPrice || props.maxPrice ? 1 : 0) +
    (props.showInStockOnly ? 1 : 0) +
    (props.showFeaturedOnly ? 1 : 0) +
    (props.minRating > 0 ? 1 : 0)
  );
}

function FilterPanel({
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
  compact = false,
}: {
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
  compact?: boolean;
}) {
  const chip = (active: boolean) =>
    active
      ? 'bg-[#0e3d34] text-[#e2c08a] border-[#0e3d34]'
      : 'bg-transparent text-[#3d4f49] border-[#1a332e]/15 hover:border-[#1f6b55]/40 hover:text-[#0e1f1c]';

  return (
    <div className={compact ? 'space-y-6' : 'space-y-6'}>
      <div className="flex items-center justify-between border-b border-[#1a332e]/10 pb-3">
        <div className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-[#0e1f1c]">
          <Filter size={14} className="text-[#1f6b55]" />
          Filters
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] text-[#8b7355] uppercase transition hover:text-[#1f6b55]"
        >
          <RotateCcw size={10} /> Reset
        </button>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-[10px] font-bold tracking-[0.22em] text-[#8b7355] uppercase">
          Collections
        </h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${chip(activeCategory === 'All')}`}
          >
            <span>All products</span>
            <span className="rounded-full bg-black/5 px-2 py-0.5 font-mono text-[10px]">
              {products.length}
            </span>
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${chip(activeCategory === cat)}`}
              >
                <span className="truncate">{cat}</span>
                <span className="rounded-full bg-black/5 px-2 py-0.5 font-mono text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5 border-t border-[#1a332e]/10 pt-5">
        <h3 className="text-[10px] font-bold tracking-[0.22em] text-[#8b7355] uppercase">
          Price range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-xl border border-[#1a332e]/15 bg-[#faf8f4] px-3 py-2.5 text-xs text-[#0e1f1c] outline-none transition focus:border-[#1f6b55]/50 focus:ring-1 focus:ring-[#1f6b55]/25"
          />
          <span className="text-[#8b7355]/50">—</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-xl border border-[#1a332e]/15 bg-[#faf8f4] px-3 py-2.5 text-xs text-[#0e1f1c] outline-none transition focus:border-[#1f6b55]/50 focus:ring-1 focus:ring-[#1f6b55]/25"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-[#1a332e]/10 pt-5">
        <h3 className="text-[10px] font-bold tracking-[0.22em] text-[#8b7355] uppercase">
          Availability
        </h3>
        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#3d4f49]">
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={(e) => setShowInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[#1a332e]/25 text-[#1f6b55] focus:ring-[#1f6b55]"
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#3d4f49]">
          <input
            type="checkbox"
            checked={showFeaturedOnly}
            onChange={(e) => setShowFeaturedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[#1a332e]/25 text-[#1f6b55] focus:ring-[#1f6b55]"
          />
          Featured only
        </label>
      </div>

      <div className="space-y-2 border-t border-[#1a332e]/10 pt-5">
        <h3 className="text-[10px] font-bold tracking-[0.22em] text-[#8b7355] uppercase">
          Minimum rating
        </h3>
        {[4.5, 4, 3].map((stars) => (
          <button
            key={stars}
            type="button"
            onClick={() => setMinRating(minRating === stars ? 0 : stars)}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${chip(minRating === stars)}`}
          >
            <span className="flex items-center gap-1.5">
              <span className="flex text-[#c9a66b]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    fill={i < Math.floor(stars) ? 'currentColor' : 'none'}
                    className={i < Math.floor(stars) ? '' : 'text-[#1a332e]/20'}
                  />
                ))}
              </span>
              {stars}+
            </span>
            {minRating === stars && <Check size={12} className="text-[#e2c08a]" />}
          </button>
        ))}
      </div>
    </div>
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

  const filtersOn = activeCount(props);
  const hasChips =
    activeCategory !== 'All' ||
    searchQuery ||
    minPrice ||
    maxPrice ||
    showInStockOnly ||
    showFeaturedOnly ||
    minRating > 0;

  return (
    <main
      id="store-grid-section"
      className="relative z-10 w-full flex-1 bg-[#0a1613]"
    >
      <div className="mx-auto max-w-7xl rounded-t-[1.75rem] bg-[#f4efe6] px-4 py-12 text-[#0e1f1c] shadow-[0_-30px_80px_rgba(0,0,0,0.35)] md:rounded-t-[2.5rem] md:px-8 md:py-14">
        {/* Intro */}
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] text-[#8b7355] uppercase">
              The atelier opens
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-[#0e1f1c] sm:text-4xl">
              Shop the collection
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-[#5c6b66]">
              Egyptian cotton, polo wear, athletic essentials & championship trophies.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {[
              { icon: Truck, label: 'COD nationwide' },
              { icon: CreditCard, label: 'PayFast · JazzCash' },
              { icon: ShieldCheck, label: '7-day returns' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#1a332e]/12 bg-white/60 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-[#3d4f49]"
              >
                <Icon size={12} className="text-[#1f6b55]" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition ${
              activeCategory === 'All'
                ? 'bg-[#0e3d34] text-[#e2c08a] shadow-[0_8px_24px_rgba(14,61,52,0.25)]'
                : 'border border-[#1a332e]/12 bg-white/70 text-[#3d4f49] hover:border-[#1f6b55]/35'
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
                  activeCategory === cat
                    ? 'bg-[#0e3d34] text-[#e2c08a] shadow-[0_8px_24px_rgba(14,61,52,0.25)]'
                    : 'border border-[#1a332e]/12 bg-white/70 text-[#3d4f49] hover:border-[#1f6b55]/35'
                }`}
              >
                {shortLabel(cat)} · {count}
              </button>
            );
          })}
        </div>

        <div className="flex items-start gap-8">
          {/* Desktop filters */}
          <aside className="sticky top-24 hidden w-64 shrink-0 self-start rounded-2xl border border-[#1a332e]/10 bg-white/80 p-5 shadow-[0_12px_40px_-24px_rgba(6,22,20,0.35)] backdrop-blur-sm md:block">
            <FilterPanel
              products={products}
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              showInStockOnly={showInStockOnly}
              setShowInStockOnly={setShowInStockOnly}
              showFeaturedOnly={showFeaturedOnly}
              setShowFeaturedOnly={setShowFeaturedOnly}
              minRating={minRating}
              setMinRating={setMinRating}
              onClearFilters={onClearFilters}
            />
          </aside>

          <div className="min-w-0 flex-1 space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b border-[#1a332e]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-xs text-[#5c6b66] sm:text-left">
                <strong className="font-semibold text-[#0e1f1c]">{sortedProducts.length}</strong>{' '}
                {sortedProducts.length === 1 ? 'piece' : 'pieces'}
                {activeCategory !== 'All' && (
                  <>
                    {' '}
                    in <span className="font-semibold text-[#1f6b55]">{activeCategory}</span>
                  </>
                )}
              </p>

              <div className="flex items-center justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1a332e]/15 bg-white px-3.5 py-2 text-[11px] font-bold text-[#0e1f1c] md:hidden"
                >
                  <SlidersHorizontal size={13} />
                  Filters{filtersOn > 0 ? ` (${filtersOn})` : ''}
                </button>

                <label className="flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-[#8b7355] uppercase">
                  Sort
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="rounded-full border border-[#1a332e]/15 bg-white px-3 py-2 text-[11px] font-semibold tracking-normal text-[#0e1f1c] normal-case outline-none focus:border-[#1f6b55]/50"
                  >
                    <option value="popular">Best rated</option>
                    <option value="price-low">Price · Low to high</option>
                    <option value="price-high">Price · High to low</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Active chips */}
            {hasChips && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#1f6b55]/15 bg-[#0e3d34]/[0.04] p-3">
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#1f6b55] uppercase">
                  Active
                </span>
                {activeCategory !== 'All' && (
                  <Chip onClear={() => setActiveCategory('All')}>{activeCategory}</Chip>
                )}
                {searchQuery && (
                  <Chip onClear={() => setSearchQuery('')}>“{searchQuery}”</Chip>
                )}
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
                {showInStockOnly && (
                  <Chip onClear={() => setShowInStockOnly(false)}>In stock</Chip>
                )}
                {showFeaturedOnly && (
                  <Chip onClear={() => setShowFeaturedOnly(false)}>Featured</Chip>
                )}
                {minRating > 0 && (
                  <Chip onClear={() => setMinRating(0)}>{minRating}★+</Chip>
                )}
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="ml-auto text-[10px] font-bold tracking-wide text-[#8b7355] underline-offset-2 hover:text-[#1f6b55] hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {sortedProducts.length === 0 ? (
              <div className="rounded-2xl border border-[#1a332e]/10 bg-white/80 px-6 py-16 text-center">
                <AlertCircle size={36} className="mx-auto mb-3 text-[#1a332e]/25" />
                <h3 className="font-display text-lg font-semibold text-[#0e1f1c]">
                  No matching pieces
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-[#5c6b66]">
                  Try widening price, rating, or clearing search — the atelier has more to show.
                </p>
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="mt-5 rounded-full bg-[#0e3d34] px-5 py-2.5 text-[11px] font-bold tracking-[0.16em] text-[#f4efe6] uppercase"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                id="storefront-product-grid"
                className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-3"
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#050d0b]/50 backdrop-blur-[2px]"
            aria-label="Close filters"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full max-w-sm flex-col bg-[#f4efe6] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a332e]/10 px-4 py-4">
              <div className="flex items-center gap-2 font-display text-sm font-semibold text-[#0e1f1c]">
                <Filter size={15} className="text-[#1f6b55]" />
                Filter & refine
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="rounded-full bg-[#0e3d34]/10 p-2 text-[#0e1f1c]"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel
                products={products}
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                showInStockOnly={showInStockOnly}
                setShowInStockOnly={setShowInStockOnly}
                showFeaturedOnly={showFeaturedOnly}
                setShowFeaturedOnly={setShowFeaturedOnly}
                minRating={minRating}
                setMinRating={setMinRating}
                onClearFilters={onClearFilters}
                compact
              />
            </div>
            <div className="flex gap-2 border-t border-[#1a332e]/10 p-4">
              <button
                type="button"
                onClick={() => {
                  onClearFilters();
                  setIsMobileFiltersOpen(false);
                }}
                className="flex-1 rounded-full border border-[#1a332e]/15 py-3 text-[11px] font-bold tracking-[0.14em] text-[#3d4f49] uppercase"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-[1.4] rounded-full bg-[#0e3d34] py-3 text-[11px] font-bold tracking-[0.14em] text-[#f4efe6] uppercase"
              >
                Show {sortedProducts.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Chip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1f6b55]/20 bg-white px-2.5 py-1 text-[10px] font-bold text-[#0e3d34]">
      {children}
      <button type="button" onClick={onClear} aria-label="Remove filter" className="text-[#8b7355] hover:text-[#0e3d34]">
        <X size={10} />
      </button>
    </span>
  );
}

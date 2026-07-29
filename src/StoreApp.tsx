import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, CartItem, Order, Coupon } from './types';
import { CATEGORIES } from './mockData';
import { customerFetch, getCustomerProfile } from './lib/customerAuth';
import { useCurrency } from './context/CurrencyContext';
import { usePageMeta } from './hooks/usePageMeta';
import CinematicExperience from './components/CinematicExperience';
import StoreNavbar from './components/StoreNavbar';
import StoreCatalog from './components/StoreCatalog';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutWizard from './components/CheckoutWizard';
import AppLoader from './components/AppLoader';
import SiteThemeSwitcher from './components/SiteThemeSwitcher';
import { Sparkles } from 'lucide-react';
import { loadSiteTheme, saveSiteTheme, SiteThemeId } from './theme/siteThemes';

export default function StoreApp() {
  const { currency, format, country, loading: currencyLoading } = useCurrency();
  usePageMeta({
    title: 'Shop',
    description: 'Bismillah Cotton & Sports Hub — premium cotton fabrics, clothing & sports wear. COD, PayFast & JazzCash.',
  });
  const [customerName, setCustomerName] = useState<string | null>(null);
  // --- REAL LIVE DATABASE STATE ENGINE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  
  // Shopping Cart still utilizes client-side local cache for state recovery between page refresh
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bismillah_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState('');

  // Local sync for cart cache
  useEffect(() => {
    localStorage.setItem('bismillah_cart', JSON.stringify(cart));
  }, [cart]);

  // Load persistent SQL assets from Express API on first mount
  const loadDatabaseAssets = async () => {
    setIsLoading(true);
    try {
      const [prodRes, coupRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/coupons"),
        fetch("/api/categories")
      ]);

      const prods = await prodRes.json();
      const coups = await coupRes.json();
      const cats = await catRes.json();
      if (Array.isArray(prods)) {
        setProducts(prods);
        // Dynamically extract and register any custom categories from database products list
        const derivedCategories = Array.isArray(cats) && cats.length > 0
          ? cats.map((c: { name: string }) => c.name)
          : Array.from(new Set(prods.map((p: any) => p.category))) as string[];
        if (derivedCategories.length > 0) {
          setCategories(derivedCategories);
        }
      } else {
        console.error("Expected products to be an array, got:", prods);
        setProducts([]);
      }

      if (Array.isArray(coups)) {
        setCoupons(coups);
      } else {
        console.error("Expected coupons to be an array, got:", coups);
        setCoupons([]);
      }
    } catch (err) {
      console.error("SQL Database connection error:", err);
      triggerToast("Unable to load products. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseAssets();
    getCustomerProfile().then((p) => setCustomerName(p?.name || null));
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high'>('popular');

  // Multi-filters states
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showInStockOnly, setShowInStockOnly] = useState<boolean>(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [siteTheme, setSiteTheme] = useState<SiteThemeId>(() => loadSiteTheme());
  const [themeFlash, setThemeFlash] = useState(false);

  const handleSiteThemeChange = (id: SiteThemeId) => {
    setSiteTheme(id);
    saveSiteTheme(id);
    setThemeFlash(true);
    window.setTimeout(() => setThemeFlash(false), 700);
  };


  // Interactive Overlays
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // --- USER TRIGGERS / HANDLERS ---
  const handleOpenQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Cart operations
  const handleAddToCartDirectly = (product: Product) => {
    const quantityToAdd = 1;
    const defaultSize = product.sizes?.[0] || 'Standard';
    const defaultColor = product.colors?.[0] || '';

    handleAddToCart(product, quantityToAdd, defaultSize, defaultColor);
  };

  const handleAddToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    if (product.stock <= 0) {
      triggerToast('Hurry, this product is sold out!');
      return;
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && 
                  item.selectedSize === size && 
                  item.selectedColor === color
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + quantity;
        
        if (newQty > product.stock) {
          updated[existingIdx].quantity = product.stock;
          triggerToast(`Adjusted cart item quantity to maximum available stock (${product.stock} items).`);
        } else {
          updated[existingIdx].quantity = newQty;
          triggerToast(`Updated "${product.name}" quantity in shopping cart.`);
        }
        return updated;
      } else {
        triggerToast(`Added "${product.name}" to shopping cart.`);
        return [...prevCart, { product, quantity, selectedSize: size, selectedColor: color }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && 
        item.selectedSize === size && 
        item.selectedColor === color
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string, size?: string, color?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
    triggerToast('Item removed from cart.');
  };

  // Live SQL review submission
  const handleAddReview = async (productId: string, newReview: any) => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerName: newReview.reviewerName,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("Thank you! Your review has been posted.");
        
        // Fetch fresh products list containing newly submitted reviews
        const prodRes = await fetch("/api/products");
        const freshProducts = await prodRes.json();
        setProducts(freshProducts);

        // Instantly refresh modal product view if open
        const updatedProduct = freshProducts.find((p: Product) => p.id === productId);
        if (updatedProduct) {
          setSelectedProduct(updatedProduct);
        }
      }
    } catch (e) {
      console.error("Failed to post review:", e);
      triggerToast("Error saving review. Please try again.");
    }
  };

  // Submit complete order to backend (Supabase/Prisma or local JSON)
  const handleSubmitOrder = async (
    newOrder: Order,
    couponCode?: string
  ): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
    requiresPayment?: boolean;
    checkoutUrl?: string;
    formFields?: Record<string, string>;
  }> => {
    try {
      const response = await customerFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: newOrder.customerName,
          customerEmail: newOrder.customerEmail,
          customerPhone: newOrder.customerPhone,
          shippingAddress: newOrder.shippingAddress,
          city: newOrder.city,
          postalCode: newOrder.postalCode,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          total: newOrder.total,
          currency: newOrder.currency || currency,
          paymentMethod: newOrder.paymentMethod,
          notes: newOrder.notes,
          couponCode
        })
      });

      const data = await response.json();
      if (data.success) {
        if (!data.requiresPayment) {
          triggerToast(`Order ${data.orderId} placed successfully! Thank you.`);
        }

        const prodRes = await fetch("/api/products");
        setProducts(await prodRes.json());
        setCart([]);
        setAppliedCoupon(null);

        return {
          success: true,
          orderId: data.orderId,
          requiresPayment: data.requiresPayment,
          checkoutUrl: data.checkoutUrl,
          formFields: data.formFields,
        };
      }

      return { success: false, error: data.error || "Failed to place order." };
    } catch (e) {
      console.error("Order error:", e);
      return { success: false, error: "Database connection error. Please try again." };
    }
  };

  // --- HIGH FIDELITY MULTI-FILTER INSTANT ENGINE ---
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesMinPrice = minPrice === "" || p.price >= Number(minPrice);
    const matchesMaxPrice = maxPrice === "" || p.price <= Number(maxPrice);
    
    const matchesStock = !showInStockOnly || p.stock > 0;
    const matchesFeatured = !showFeaturedOnly || p.isFeatured;
    const matchesRating = p.rating >= minRating;
    
    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesStock && matchesFeatured && matchesRating;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    return b.rating - a.rating; // default rating popularity
  });

  const handleClearFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setShowInStockOnly(false);
    setShowFeaturedOnly(false);
    setMinRating(0);
  };

  return (
    <>
      <AppLoader
        visible={isLoading || currencyLoading}
        variant="store"
        message="Loading products & prices…"
      />
    <div
      data-site-theme={siteTheme}
      className="flex min-h-screen flex-col justify-between bg-[var(--site-bg)] font-sans text-[var(--site-ink)] selection:bg-[var(--site-gold)]/35"
    >
      {themeFlash && <div className="site-theme-flash" aria-hidden />}

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-[100] flex animate-bounce items-center gap-2.5 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-xs font-semibold text-[var(--site-ink)] shadow-2xl">
          <Sparkles size={14} className="text-[var(--site-gold)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <SiteThemeSwitcher
        active={siteTheme}
        onChange={handleSiteThemeChange}
        hidden={Boolean(selectedProduct) || isCartOpen || isCheckoutOpen}
      />

      <StoreNavbar
        customerName={customerName}
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onLogoClick={() => {
          setActiveCategory('All');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onGoShop={() => {
          document.getElementById('store-grid-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        categories={categories}
        onSelectCategory={setActiveCategory}
      />

      {/* Cinematic scroll story */}
      <CinematicExperience
        products={products}
        onOpenProduct={handleOpenQuickView}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          document.getElementById('store-grid-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <StoreCatalog
        products={products}
        categories={categories}
        sortedProducts={sortedProducts}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
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
        isMobileFiltersOpen={isMobileFiltersOpen}
        setIsMobileFiltersOpen={setIsMobileFiltersOpen}
        onClearFilters={handleClearFilters}
        onOpenQuickView={handleOpenQuickView}
        onAddToCartDirectly={handleAddToCartDirectly}
      />

      {/* FOOTER SECTION */}
      <footer className="mt-0 border-t border-[var(--site-border)] bg-[var(--site-bg)] px-4 py-12 text-xs font-sans text-[var(--site-muted)] md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--site-gold)] font-display text-base font-bold text-[var(--site-bg)]">
                B
              </span>
              <div>
                <h3 className="font-display text-sm font-semibold tracking-tight text-[var(--site-ink)]">
                  Bismillah Store
                </h3>
                <p className="text-[9px] font-bold tracking-[0.2em] text-[var(--site-gold)] uppercase">
                  Cotton & Sports Hub
                </p>
              </div>
            </div>
            <p className="max-w-sm text-[11px] leading-relaxed text-[var(--site-muted)]">
              Premium Egyptian cotton, athletic wear, and championship trophies — crafted for everyday elegance and victory.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-[0.22em] text-[var(--site-gold)] uppercase">
              Collections
            </h4>
            <ul className="space-y-2 text-[11px]">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat);
                      document.getElementById('store-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-left text-[var(--site-muted)] transition hover:text-[var(--site-gold-soft)]"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-[0.22em] text-[var(--site-gold)] uppercase">
              Support
            </h4>
            <ul className="space-y-2 text-[11px] text-[var(--site-muted)]">
              <li>
                <Link to="/contact" className="transition hover:text-[var(--site-gold-soft)]">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition hover:text-[var(--site-gold-soft)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition hover:text-[var(--site-gold-soft)]">
                  Terms & Conditions
                </Link>
              </li>
              <li>Cash on Delivery · Pakistan-wide</li>
              <li>PayFast & JazzCash accepted</li>
              <li>7-Day Free Return Policy</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-[var(--site-border)] pt-6 text-center text-[10px] text-[var(--site-muted)]/70">
          <p>© {new Date().getFullYear()} Bismillah Cotton and Sports Hub. All rights reserved.</p>
        </div>
      </footer>

      {/* BACKPLANE MODALS & DRAWERS FOR THE STOREFRONT */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={handleCloseQuickView} 
          onAddToCart={handleAddToCart} 
          onAddReview={handleAddReview} 
        />
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        onUpdateQuantity={handleUpdateCartQuantity} 
        onRemoveItem={handleRemoveFromCart} 
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }} 
        availableCoupons={coupons}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
      />

      {isCheckoutOpen && (
        <CheckoutWizard 
          cartItems={cart} 
          appliedCoupon={appliedCoupon} 
          onClose={() => setIsCheckoutOpen(false)} 
          onSubmitOrder={handleSubmitOrder} 
        />
      )}

    </div>
    </>
  );
}

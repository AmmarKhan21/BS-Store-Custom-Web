import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, CartItem, Order, Coupon } from './types';
import { CATEGORIES } from './mockData';
import { customerFetch, getCustomerProfile } from './lib/customerAuth';
import { useCurrency } from './context/CurrencyContext';
import { usePageMeta } from './hooks/usePageMeta';
import BannerHero from './components/BannerHero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutWizard from './components/CheckoutWizard';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles, 
  AlertCircle,
  Star,
  Check,
  SlidersHorizontal,
  X,
  RotateCcw,
  User
} from 'lucide-react';

export default function StoreApp() {
  const { currency, format, country } = useCurrency();
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 flex flex-col justify-between">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-3 bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Sparkles size={14} className="text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CORE PRIMARY NAVIGATION HEADER */}
      <header className="sticky top-0 z-35 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between" id="global-header">
        
        {/* Brand Logo & slogan */}
        <div 
          onClick={() => {
            setActiveCategory('All');
            setSearchQuery('');
          }} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 md:w-11 md:h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-xl font-display shadow-md">
            B
          </div>
          <div>
            <h1 className="font-display font-bold text-base md:text-xl text-slate-900 tracking-tight leading-none uppercase">Bismillah</h1>
            <p className="text-[10px] md:text-xs text-indigo-700 font-bold tracking-widest mt-0.5 uppercase">Cotton & Sports Hub</p>
          </div>
        </div>

        {/* Global Catalog search bar */}
        <div className="hidden md:flex relative max-w-md w-full mx-8">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search soft cotton fabrics, sports wears, rackets, running shoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium transition-colors"
          />
        </div>

        {/* Cart Trigger Badge */}
        <div className="flex items-center gap-3.5">
          {customerName ? (
            <Link to="/account" className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1">
              <User size={14} /> {customerName.split(' ')[0]}
            </Link>
          ) : (
            <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-indigo-700 hidden sm:block">
              Sign In
            </Link>
          )}

          <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-indigo-700 rounded-xl border border-slate-200 relative transition-all cursor-pointer flex items-center gap-2"
              title="Open Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={16} />
              <span className="hidden md:inline text-xs font-bold font-sans uppercase tracking-wider text-slate-700"></span>
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </button>

          {/* <div className="text-[11px] font-semibold text-slate-500 bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200 hidden lg:block">
            Support: <strong>COD & Online pay SSL</strong>
          </div> */}
        </div>
      </header>

      {/* CUSTOMER STOREFRONT LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-8">
          
          {/* Slideshow Promotions and indicators */}
          <BannerHero 
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              const gridElement = document.getElementById('store-grid-section');
              if (gridElement) {
                gridElement.scrollIntoView({ behavior: 'smooth' });
              }
            }} 
            activeCategory={activeCategory} 
          />

          {/* Grid control desk section */}
          <div className="pt-4 border-t border-slate-200/60" id="store-grid-section">
            
            {/* Section Header */}
            <div className="w-full text-center md:text-left mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-widest font-extrabold text-indigo-650 uppercase">Bismillah collections hub</span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight mt-1">
                  Shop by Categorized Collections
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Filter premier Traditional Egyptian Cotton fabrics, Polo wear & athletic training accessories</p>
              </div>

              {/* Mobile Filter Trigger Button */}
              <div className="flex md:hidden items-center justify-center gap-2">
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors w-full justify-center"
                >
                  <SlidersHorizontal size={14} />
                  <span>Filter & Refine ({
                    (activeCategory !== 'All' ? 1 : 0) +
                    (minPrice !== '' || maxPrice !== '' ? 1 : 0) +
                    (showInStockOnly ? 1 : 0) +
                    (showFeaturedOnly ? 1 : 0) +
                    (minRating > 0 ? 1 : 0)
                  })</span>
                </button>
              </div>
            </div>

            {/* Mobile-Only Category circular stories (Hidden on desktop) */}
            <div className="md:hidden">
              <div 
                className="flex items-center justify-start gap-4 overflow-x-auto pb-4 pt-1 -mx-4 px-4 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" 
                id="categories-stories-tray"
              >
                {/* ALL COLLECTIONS Bubble */}
                <button
                  type="button"
                  onClick={() => setActiveCategory('All')}
                  className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer"
                >
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center p-0.5 transition-all transform duration-300 ${
                      activeCategory === 'All'
                        ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 shadow-md ring-2 ring-indigo-200 ring-offset-2'
                        : 'bg-slate-200 border border-slate-200'
                    }`}>
                      <div className="w-full h-full bg-white rounded-full p-0.5">
                        <img 
                          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200&auto=format&fit=crop" 
                          alt="All Collections" 
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <span className="absolute -top-1 -right-1 bg-slate-900 border border-white text-white text-[8px] font-bold px-1 py-0.5 rounded-full shadow-xs">
                      {products.length}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold mt-1.5 transition-colors max-w-[70px] truncate ${
                    activeCategory === 'All' ? 'text-indigo-600 font-extrabold' : 'text-slate-500'
                  }`}>
                    All
                  </span>
                </button>

                {/* Iterate Categories */}
                {categories.map((cat) => {
                  const categoryCount = products.filter(p => p.category === cat).length;
                  const catMetadataLookup: Record<string, { image: string; label: string }> = {
                    'Cotton Collection': { 
                      image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=200&auto=format&fit=crop', 
                      label: 'Cotton' 
                    },
                    'Clothing': { 
                      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200&auto=format&fit=crop', 
                      label: 'Clothing' 
                    },
                    'Sports Wear': { 
                      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop', 
                      label: 'Sports' 
                    },
                    'Sports Gear': { 
                      image: 'https://images.unsplash.com/photo-1617083934335-e10df2e53efb?q=80&w=200&auto=format&fit=crop', 
                      label: 'Gear' 
                    }
                  };
                  const currentMeta = catMetadataLookup[cat] || {
                    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=200&auto=format&fit=crop',
                    label: cat
                  };

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer"
                    >
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center p-0.5 transition-all transform duration-300 ${
                          activeCategory === cat
                            ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 shadow-md ring-2 ring-indigo-200 ring-offset-2'
                            : 'bg-slate-200 border border-slate-200'
                        }`}>
                          <div className="w-full h-full bg-white rounded-full p-0.5">
                            <img 
                              src={currentMeta.image} 
                              alt={cat} 
                              className="w-full h-full object-cover rounded-full"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <span className="absolute -top-1 -right-1 bg-slate-900 border border-white text-white text-[8px] font-bold px-1 py-0.5 rounded-full shadow-xs">
                          {categoryCount}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold mt-1.5 transition-colors max-w-[70px] truncate ${
                        activeCategory === cat ? 'text-indigo-600 font-extrabold' : 'text-slate-500'
                      }`}>
                        {currentMeta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SPLIT LAYOUT CONTAINER: left is persistent filter sidebar, right is products display */}
            <div className="flex gap-8 items-start mt-4">
              
              {/* DESKTOP SIDEBAR WITH MULTI-FILTERS (Hidden on mobile) */}
              <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border border-slate-200 rounded-2xl p-5 space-y-6 shadow-sm sticky top-24 self-start">
                
                {/* Sidebar Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-display font-black text-slate-900 text-sm tracking-tight">
                    <Filter size={14} className="text-indigo-600" />
                    <span>Filter Products</span>
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase cursor-pointer"
                  >
                    Reset All
                  </button>
                </div>

                {/* Multi-Filter 1: Categories / Collections (Vertical list) */}
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Collections</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveCategory('All')}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all ${
                        activeCategory === 'All'
                          ? 'bg-indigo-55 text-indigo-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>All Products</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500">
                        {products.length}
                      </span>
                    </button>

                    {categories.map((cat) => {
                      const count = products.filter((p) => p.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all ${
                            activeCategory === cat
                              ? 'bg-indigo-55 text-indigo-700 font-bold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Multi-Filter 2: Price Boundary Filters */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Price Range ($)</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full pl-6 pr-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <span className="text-slate-400 text-xs">—</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full pl-6 pr-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Multi-Filter 3: Availability & Highlights */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Status</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showInStockOnly}
                        onChange={(e) => setShowInStockOnly(e.target.checked)}
                        className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold">Hide Out of Stock</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFeaturedOnly}
                        onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                        className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold">Featured Items Only</span>
                    </label>
                  </div>
                </div>

                {/* Multi-Filter 4: Ratings Star Threshold */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Minimum Rating</h3>
                  <div className="space-y-1">
                    {[4.5, 4.0, 3.0].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                        className={`w-full flex items-center justify-between p-1.5 rounded-md text-xs font-semibold transition-colors ${
                          minRating === stars 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={11} 
                                fill={i < Math.floor(stars) ? "currentColor" : "none"} 
                                className="stroke-1.5"
                              />
                            ))}
                          </div>
                          <span>{stars} & above</span>
                        </div>
                        {minRating === stars && <Check size={11} className="text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* PRODUCTS CATALOG SECTION */}
              <div className="flex-1 space-y-5">
                
                {/* Control bar: sorting dropdown, results summary */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-3 border-b border-slate-150 font-sans">
                  
                  {/* Result Statements */}
                  <div className="text-slate-500 text-xs text-center sm:text-left">
                    We found <strong className="text-slate-900 font-extrabold">{sortedProducts.length}</strong> matching lifestyle {sortedProducts.length === 1 ? 'item' : 'items'}
                    {activeCategory !== 'All' && <span> in <span className="text-indigo-600 font-bold">{activeCategory}</span></span>}
                  </div>

                  {/* Sorter Selector */}
                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
                    <div className="flex items-center gap-1 text-slate-400 shrink-0">
                      <Filter size={11} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sort:</span>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="p-1.5 px-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer"
                    >
                      <option value="popular">Best Customer Rating</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Active Filter Tags (if any are active) */}
                {((activeCategory !== 'All') || searchQuery || minPrice || maxPrice || showInStockOnly || showFeaturedOnly || minRating > 0) && (
                  <div className="flex flex-wrap items-center gap-2 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/60">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mr-1">Active:</span>
                    
                    {activeCategory !== 'All' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700">
                        <span>Category: {activeCategory}</span>
                        <X size={10} className="cursor-pointer text-indigo-400 hover:text-indigo-700" onClick={() => setActiveCategory('All')} />
                      </span>
                    )}

                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700">
                        <span>Search: "{searchQuery}"</span>
                        <X size={10} className="cursor-pointer text-indigo-400 hover:text-indigo-700" onClick={() => setSearchQuery('')} />
                      </span>
                    )}

                    {(minPrice || maxPrice) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700">
                        <span>Price: ${minPrice || '0'} - ${maxPrice || '∞'}</span>
                        <X size={10} className="cursor-pointer text-indigo-400 hover:text-indigo-700" onClick={() => { setMinPrice(''); setMaxPrice(''); }} />
                      </span>
                    )}

                    {showInStockOnly && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700">
                        <span>In Stock Only</span>
                        <X size={10} className="cursor-pointer text-indigo-400 hover:text-indigo-700" onClick={() => setShowInStockOnly(false)} />
                      </span>
                    )}

                    {showFeaturedOnly && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700">
                        <span>Featured Only</span>
                        <X size={10} className="cursor-pointer text-indigo-400 hover:text-indigo-700" onClick={() => setShowFeaturedOnly(false)} />
                      </span>
                    )}

                    {minRating > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700">
                        <span>Rating: {minRating} ★+</span>
                        <X size={10} className="cursor-pointer text-indigo-400 hover:text-indigo-700" onClick={() => setMinRating(0)} />
                      </span>
                    )}

                    <button
                      onClick={handleClearFilters}
                      className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 underline underline-offset-2 ml-auto cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {/* LOADING PLACEHOLDER */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-xs text-slate-500 font-sans">Loading products...</p>
                  </div>
                ) : sortedProducts.length === 0 ? (
                  /* EMPTY SEARCH RESULT STATE */
                  <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-6">
                    <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
                    <h3 className="font-display font-bold text-base text-slate-900">No matching items found</h3>
                    <p className="text-xs text-slate-500 font-sans mt-1 max-w-md mx-auto">We couldn't track products matching your current multi-filters. Try loosening your price boundaries, ratings threshold, or search queries.</p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  /* Product Grid Display */
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5" id="storefront-product-grid">
                    {sortedProducts.map((prod) => (
                      <ProductCard 
                        key={prod.id} 
                        product={prod} 
                        onOpenQuickView={handleOpenQuickView} 
                        onAddToCartDirectly={handleAddToCartDirectly} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE SLIDE-OVER BOTTOM SHEET FILTERS */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden md:hidden flex justify-end" id="mobile-filter-backplane">
              {/* Backplane Blur */}
              <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={() => setIsMobileFiltersOpen(false)}
              />
              
              {/* Filter Drawer Body */}
              <div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl z-10">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-display font-black text-slate-900 text-sm">
                    <Filter size={15} className="text-indigo-600" />
                    <span>Filter & Refine</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Scrollable Filters section */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select Collection</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActiveCategory('All')}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all text-center truncate ${
                          activeCategory === 'All'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        All Products ({products.length})
                      </button>
                      {categories.map((cat) => {
                        const count = products.filter(p => p.category === cat).length;
                        return (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`p-2 rounded-lg text-xs font-bold border transition-all text-center truncate ${
                              activeCategory === cat
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {cat} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price boundaries */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Price Range ($)</h3>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <span className="text-slate-400 text-xs">—</span>
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Status checklist */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 text-xs text-slate-700 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showInStockOnly}
                          onChange={(e) => setShowInStockOnly(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span>In Stock Items Only</span>
                      </label>
                      <label className="flex items-center gap-3 text-xs text-slate-700 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showFeaturedOnly}
                          onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Featured Items Only</span>
                      </label>
                    </div>
                  </div>

                  {/* Rating Threshold */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Minimum Rating</h3>
                    <div className="space-y-2">
                      {[4.5, 4.0, 3.0].map((stars) => (
                        <button
                          key={stars}
                          onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold border transition-colors ${
                            minRating === stars 
                              ? 'bg-indigo-55 border-indigo-200 text-indigo-700' 
                              : 'border-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="flex text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={11} 
                                  fill={i < Math.floor(stars) ? "currentColor" : "none"} 
                                  className="stroke-1.5"
                                />
                              ))}
                            </div>
                            <span>{stars} Stars & above</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                  <button
                    onClick={() => { handleClearFilters(); setIsMobileFiltersOpen(false); }}
                    className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-850 text-xs font-bold rounded-xl"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Apply Filters
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-slate-200 py-10 px-4 md:px-8 text-xs font-sans mt-12 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo signature area */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold font-display uppercase">B</span>
              <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">Bismillah Store</h3>
            </div>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              Committed to providing unmatched organic unstitched and stitched Egyptian cotton fabrics and premium international athletic instruments.
            </p>
          </div>

          {/* Quick shop navigations */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white uppercase tracking-widest text-[11px]">Shopping Categories</h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              {categories.map((cat) => (
                <li key={cat}>
                  <button 
                    onClick={() => { setActiveCategory(cat); }} 
                    className="hover:text-indigo-400 text-left transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-[11px] italic text-slate-500">No custom collections defined yet</li>
              )}
            </ul>
          </div>

          {/* Dummy trust parameters */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-white uppercase tracking-widest text-[11px]">Customer Support Hub</h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms & Conditions</Link></li>
              <li>Cash on Delivery Support (Pakistan-wide)</li>
              <li>PayFast & JazzCash accepted</li>
              <li>7-Day Free Return Policy</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-6 mt-8 text-center text-slate-500 text-[10px]">
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
  );
}

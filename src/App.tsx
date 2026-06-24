import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, Coupon } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_COUPONS, CATEGORIES } from './mockData';
import BannerHero from './components/BannerHero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutWizard from './components/CheckoutWizard';
import AdminPortal from './components/AdminPortal';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles, 
  ChevronRight, 
  Compass, 
  Settings, 
  HelpCircle, 
  AlertCircle,
  Tag 
} from 'lucide-react';

export default function App() {
  // --- STATE PERSISTENCE LAUNCHER ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bismillah_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('bismillah_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('bismillah_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bismillah_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('bismillah_categories');
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  // Synchronization with LocalStorage
  useEffect(() => {
    localStorage.setItem('bismillah_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bismillah_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bismillah_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('bismillah_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bismillah_categories', JSON.stringify(categories));
  }, [categories]);

  // --- VIEW PORTS & CONTROL PORTALS ---
  const [activeTab, setActiveTab] = useState<'storefront' | 'admin'>('storefront');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high'>('popular');

  // Interactive Overlays
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
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
      // Find matching item in existing array (matches same ID, size, color)
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && 
                  item.selectedSize === size && 
                  item.selectedColor === color
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + quantity;
        
        // Stock barrier checks
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

  // Review submission
  const handleAddReview = (productId: string, newReview: { id: string; reviewerName: string; rating: number; comment: string; date: string }) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const updatedReviews = [newReview, ...p.reviews];
          // Recompute stars average
          const avgStars = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...p,
            reviews: updatedReviews,
            rating: parseFloat(avgStars.toFixed(1))
          };
        }
        return p;
      })
    );
  };

  // Submit complete order from checkout wizard
  const handleSubmitOrder = (newOrder: Order) => {
    // Add to orders list
    setOrders((prevOrders) => [newOrder, ...prevOrders]);

    // Decrease products stock quantities immediately in inventory!
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const orderLine = newOrder.items.find((it) => it.productId === prod.id);
        if (orderLine) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - orderLine.quantity)
          };
        }
        return prod;
      })
    );

    // Clear cart and close indicators
    setCart([]);
    setAppliedCoupon(null);
  };

  // --- MERCHANT PORTAL HANDLERS ---
  const handleMerchantAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    triggerToast(`"${newProduct.name}" listed successfully in storefront catalog.`);
  };

  const handleMerchantUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    // Sync cart items with the newly updated product details
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );
    triggerToast(`"${updatedProduct.name}" details updated successfully.`);
  };

  const handleMerchantDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    triggerToast('Product removed from active catalog.');
  };

  const handleMerchantUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const handleMerchantUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    triggerToast(`Order status updated to "${status}".`);
  };

  const handleMerchantAddCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
    triggerToast(`Coupon Code "${newCoupon.code}" published successfully!`);
  };

  const handleMerchantDeleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    triggerToast('Discount structure deleted.');
  };

  const handleMerchantAddCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      triggerToast('This category already exists!');
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    triggerToast(`Category "${trimmed}" created successfully.`);
  };

  const handleMerchantDeleteCategory = (categoryName: string) => {
    setCategories((prev) => prev.filter((c) => c !== categoryName));
    setProducts((prev) =>
      prev.map((p) =>
        p.category === categoryName ? { ...p, category: 'Uncategorized' } : p
      )
    );
    triggerToast(`Category removed. Affected products moved to "Uncategorized".`);
  };

  const handleMerchantUpdateCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    if (categories.some((c) => c !== oldName && c.toLowerCase() === trimmed.toLowerCase())) {
      triggerToast('A category with that name already exists!');
      return;
    }
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p))
    );
    triggerToast(`Category updated to "${trimmed}".`);
  };

  // --- FILTER & SEARCH IMPLEMENTATIONS ---
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    return b.rating - a.rating; // default: popular rating ratio
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 flex flex-col justify-between">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-3 bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Sparkles size={14} className="text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* FLOATING ADMIN/CUSTOMER MODE TOGGLE HEADER BANNER */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs py-2 px-3 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-2 relative z-40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="font-mono text-slate-350 text-[10px] sm:text-xs">
            <span className="hidden lg:inline">Storefront Sandbox Sandbox: Toggle between Customer view and Partner Merchant panel</span>
            <span className="inline lg:hidden">Developer Sandbox: Tab Switcher</span>
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-850 p-0.5 rounded-lg border border-slate-700/60 text-[11px]">
          <button
            onClick={() => {
              setActiveTab('storefront');
              setIsCheckoutOpen(false);
            }}
            className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'storefront' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-350 hover:text-white'
            }`}
          >
            <Compass size={11} />
            <span className="hidden xs:inline">Customer Storefront</span>
            <span className="inline xs:hidden">Storefront</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('admin');
              setIsCheckoutOpen(false);
            }}
            className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-350 hover:text-white'
            }`}
          >
            <Settings size={11} />
            <span className="hidden xs:inline">Shopify Merchant Admin</span>
            <span className="inline xs:hidden">Merchant Admin</span>
          </button>
        </div>
      </div>

      {/* CORE PRIMARY NAVIGATION HEADER */}
      <header className="sticky top-0 z-35 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between" id="global-header">
        
        {/* Brand Logo & slogan */}
        <div 
          onClick={() => {
            setActiveTab('storefront');
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
        {activeTab === 'storefront' && (
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
        )}

        {/* Cart Trigger Badge / Settings icons */}
        <div className="flex items-center gap-3.5">
          {activeTab === 'storefront' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-indigo-700 rounded-xl border border-slate-200 relative transition-all cursor-pointer flex items-center gap-2"
              title="Open Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={16} />
              <span className="hidden md:inline text-xs font-bold font-sans uppercase tracking-wider text-slate-700">Basket</span>
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </button>
          )}

          <div className="text-[11px] font-semibold text-slate-500 bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200 hidden lg:block">
            Support: <strong>COD & Online pay SSL</strong>
          </div>
        </div>
      </header>

      {/* CUSTOMER STOREFRONT LAYOUT ENTRY */}
      {activeTab === 'storefront' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
          
          {/* Slideshow Promotions and indicators */}
          <BannerHero 
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              // scroll smooth directly into grid
              const gridElement = document.getElementById('store-grid-section');
              if (gridElement) {
                gridElement.scrollIntoView({ behavior: 'smooth' });
              }
            }} 
            activeCategory={activeCategory} 
          />

          {/* Grid control desk section */}
          <div className="pt-6 border-t border-slate-200/60" id="store-grid-section">
            
            {/* Section Header */}
            <div className="w-full text-center md:text-left mb-6">
              <span className="text-[10px] tracking-widest font-extrabold text-indigo-650 uppercase">Bismillah collections hub</span>
              <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight mt-1">
                Shop by Categorized Collections
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">Filter premier Traditional Egyptian Cotton fabrics, Polo wear & athletic training accessories</p>
            </div>

            {/* Category choice visual circular story slider - Touch responsive, hidden scrollbar with notifications badge */}
            <div 
              className="flex items-center justify-start md:justify-center gap-5 sm:gap-7 overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 w-auto md:w-full scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" 
              id="categories-stories-tray"
            >
              {/* ALL COLLECTIONS Story Bubble */}
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer"
              >
                <div className="relative">
                  {/* Ring Container styled with double layout */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center p-0.5 transition-all duration-300 transform group-hover:scale-105 ${
                    activeCategory === 'All'
                      ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 shadow-md ring-2 ring-indigo-200 ring-offset-2'
                      : 'bg-slate-200 group-hover:bg-slate-350 border border-slate-200'
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
                  {/* Floating relative count badge */}
                  <span className={`absolute -top-1 -right-1 border border-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm font-mono transition-colors ${
                    activeCategory === 'All'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-105 text-slate-600'
                  }`}>
                    {products.length}
                  </span>
                </div>
                <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mt-2 w-20 sm:w-24 text-center transition-colors truncate ${
                  activeCategory === 'All' ? 'text-indigo-600 font-extrabold' : 'text-slate-600 group-hover:text-slate-900'
                }`}>
                  All Products
                </span>
              </button>

              {/* Categories Iteration Stories */}
              {categories.map((cat) => {
                const categoryCount = products.filter(p => p.category === cat).length;
                
                // Category Portrait Metadata Images matching e-commerce aesthetics
                const catMetadataLookup: Record<string, { image: string; label: string }> = {
                  'Cotton Collection': { 
                    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=200&auto=format&fit=crop', 
                    label: 'Premium Cotton' 
                  },
                  'Clothing': { 
                    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200&auto=format&fit=crop', 
                    label: 'Formal Shirts' 
                  },
                  'Sports Wear': { 
                    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop', 
                    label: 'Athletic Wear' 
                  },
                  'Sports Gear': { 
                    image: 'https://images.unsplash.com/photo-1617083934335-e10df2e53efb?q=80&w=200&auto=format&fit=crop', 
                    label: 'Premium Gear' 
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
                      {/* Ring Container styled with double layout */}
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center p-0.5 transition-all duration-300 transform group-hover:scale-105 ${
                        activeCategory === cat
                          ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 shadow-md ring-2 ring-indigo-200 ring-offset-2'
                          : 'bg-slate-200 group-hover:bg-slate-350 border border-slate-200'
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
                        {/* Floating relative count badge */}
                        <span className={`absolute -top-1 -right-1 border border-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm font-mono transition-colors ${
                          activeCategory === cat
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-105 text-slate-600'
                        }`}>
                          {categoryCount}
                        </span>
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mt-2 w-20 sm:w-24 text-center transition-colors truncate ${
                        activeCategory === cat ? 'text-indigo-600 font-extrabold' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {currentMeta.label}
                      </span>
                    </button>
                  );
                })}
                {/* Spacer block to prevent last capsule from clipping on mobile screen edges */}
                <div className="w-4 shrink-0 sm:hidden" />
              </div>

            {/* Mid Desk filtering bar results counter & sort controller */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-5 mb-6 pb-4 border-b border-slate-100 font-sans">
              <div className="text-slate-500 text-xs text-center sm:text-left">
                Showing <strong className="text-slate-900 font-bold">{sortedProducts.length}</strong> premium lifestyle {sortedProducts.length === 1 ? 'item' : 'items'} in <span className="text-indigo-600 font-bold">{activeCategory === 'All' ? 'All Collections' : activeCategory}</span>
              </div>
              
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Filter size={11} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sort Selection:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-1 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 hover:bg-slate-100 text-slate-850 transition-colors cursor-pointer"
                >
                  <option value="popular">Best Customer Ratings</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Mobile Search block */}
            <div className="md:hidden relative w-full mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search premium cotton fabric, gym wear or gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Empty view search filter state */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-24 bg-white border border-slate-200 rounded-2xl">
                <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-slate-900">No matching items found</h3>
                <p className="text-xs text-slate-500 font-sans mt-1">We couldn't track products matching your current category filter or search query.</p>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                  }}
                  className="mt-5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              /* Product Grid Display */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-6" id="storefront-product-grid">
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

        </main>
      )}

      {/* MERCHANDISE ADMIN PANEL VIEWPORT */}
      {activeTab === 'admin' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
          <AdminPortal 
            products={products}
            orders={orders}
            coupons={coupons}
            categories={categories}
            onAddProduct={handleMerchantAddProduct}
            onUpdateProduct={handleMerchantUpdateProduct}
            onDeleteProduct={handleMerchantDeleteProduct}
            onUpdateProductStock={handleMerchantUpdateStock}
            onUpdateOrderStatus={handleMerchantUpdateOrderStatus}
            onAddCoupon={handleMerchantAddCoupon}
            onDeleteCoupon={handleMerchantDeleteCoupon}
            onAddCategory={handleMerchantAddCategory}
            onDeleteCategory={handleMerchantDeleteCategory}
            onUpdateCategory={handleMerchantUpdateCategory}
          />
        </main>
      )}

      {/* FOOTER SECTION BRAND SIGNATURE */}
      <footer className="border-t border-slate-200 py-10 px-4 md:px-8 text-xs font-sans mt-12 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
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
                    onClick={() => { setActiveTab('storefront'); setActiveCategory(cat); }} 
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
              <li>Cash on Delivery Support (Pakistan-wide)</li>
              <li>Verified SSL Credit Card Online Portal</li>
              <li>7-Day Free Return Policy</li>
              <li>Shipping warehouse address: Lahore Karkhana Market</li>
            </ul>
          </div>

          {/* Interactive quick sandbox helper */}
          <div className="space-y-3.5 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-display font-semibold text-indigo-400 uppercase tracking-widest text-[11px] flex items-center gap-1.5">
              <Sparkles size={11} /> Sandbox Evaluation Codes
            </h4>
            <p className="text-[10px] leading-relaxed text-slate-300">
              Go to checkout of any product, enter active coupons database codes:
            </p>
            <div className="font-mono text-[9px] text-indigo-200 font-semibold space-y-1">
              <p>• <strong className="text-white">BISMILLAH10</strong> - 10% Flat off</p>
              <p>• <strong className="text-white">COTTONSUPREME</strong> - $15 off on $50 purchase</p>
              <p>• <strong className="text-white">SPORTSFREE</strong> - 15% Flat off on any item</p>
              <p>• <strong className="text-white" title="Special large purchase coupon">SAVE100</strong> - $100 off on $250 purchase</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-6 mt-8 text-center text-slate-500 text-[10px]">
          <p>© {new Date().getFullYear()} Bismillah Cotton and Sports Hub. Powered by Shopify sandboxed engine. Created via AI Studio. All rights reserved.</p>
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

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Product, Order, Coupon, StoreStats, AdminCustomer, StatsDateRange } from './types';
import { CATEGORIES } from './mockData';
import AdminPortal from './components/AdminPortal';
import AdminLogin from './components/AdminLogin';
import { adminFetch, verifyAdminSession, logoutAdmin, getAdminToken } from './lib/auth';
import { Sparkles, LogOut, Store } from 'lucide-react';

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [statsRange, setStatsRange] = useState<StatsDateRange>({ days: 7 });
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const buildStatsUrl = (range: StatsDateRange) => {
    const params = new URLSearchParams();
    if (range.from && range.to) {
      params.set('from', range.from);
      params.set('to', range.to);
    } else {
      params.set('days', String(range.days ?? 7));
    }
    return `/api/stats?${params}`;
  };

  const loadStats = async (range: StatsDateRange = statsRange) => {
    try {
      const statsRes = await adminFetch(buildStatsUrl(range));
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleStatsRangeChange = (range: StatsDateRange) => {
    setStatsRange(range);
    loadStats(range);
  };

  const loadAdminData = async () => {
    try {
      const [prodRes, ordRes, coupRes, catRes, statsRes, custRes] = await Promise.all([
        adminFetch('/api/products'),
        adminFetch('/api/orders'),
        adminFetch('/api/coupons'),
        adminFetch('/api/categories'),
        adminFetch(buildStatsUrl(statsRange)),
        adminFetch('/api/admin/customers'),
      ]);

      if (prodRes.status === 401 || ordRes.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      const prods = await prodRes.json();
      const ords = await ordRes.json();
      const coups = await coupRes.json();
      const cats = await catRes.json();

      if (Array.isArray(prods)) {
        setProducts(prods);
      }

      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats.map((c: { name: string }) => c.name));
      } else if (Array.isArray(prods)) {
        const derivedCategories = Array.from(
          new Set(prods.map((p: Product) => p.category))
        ) as string[];
        if (derivedCategories.length > 0) setCategories(derivedCategories);
      }

      if (Array.isArray(ords)) setOrders(ords);
      if (Array.isArray(coups)) setCoupons(coups);
      if (statsRes.ok) setStats(await statsRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
      triggerToast('Unable to load dashboard data.');
    }
  };

  useEffect(() => {
    verifyAdminSession().then((valid) => {
      setIsAuthenticated(valid);
      if (valid) loadAdminData();
    });
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  const handleMerchantAddProduct = async (newProduct: Product) => {
    try {
      const response = await adminFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        triggerToast(`"${newProduct.name}" listed successfully.`);
        const prodRes = await adminFetch('/api/products');
        setProducts(await prodRes.json());
      }
    } catch (e) {
      console.error('Product insert failure:', e);
    }
  };

  const handleMerchantUpdateProduct = async (updatedProduct: Product) => {
    try {
      const response = await adminFetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProduct),
      });
      if (response.ok) {
        triggerToast(`"${updatedProduct.name}" updated successfully.`);
        const prodRes = await adminFetch('/api/products');
        setProducts(await prodRes.json());
      }
    } catch (e) {
      console.error('Product update failure:', e);
    }
  };

  const handleMerchantDeleteProduct = async (productId: string) => {
    try {
      const response = await adminFetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        triggerToast('Product deleted.');
        const prodRes = await adminFetch('/api/products');
        setProducts(await prodRes.json());
      }
    } catch (e) {
      console.error('Product delete failure:', e);
    }
  };

  const handleMerchantUpdateStock = async (productId: string, newStock: number) => {
    try {
      const response = await adminFetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...products.find((p) => p.id === productId),
          stock: newStock,
        }),
      });
      if (response.ok) {
        const prodRes = await adminFetch('/api/products');
        setProducts(await prodRes.json());
      }
    } catch (e) {
      console.error('Stock update failure:', e);
    }
  };

  const handleMerchantUpdateOrderStatus = async (
    orderId: string,
    status: Order['status']
  ) => {
    try {
      const response = await adminFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        triggerToast(`Order status updated to "${status}".`);
        const ordRes = await adminFetch('/api/orders');
        setOrders(await ordRes.json());
      }
    } catch (e) {
      console.error('Order status update failure:', e);
    }
  };

  const handleMerchantUpdateOrderPaymentStatus = async (
    orderId: string,
    paymentStatus: Order['paymentStatus']
  ) => {
    try {
      const response = await adminFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus }),
      });
      if (response.ok) {
        triggerToast(`Payment status updated to "${paymentStatus}".`);
        const ordRes = await adminFetch('/api/orders');
        setOrders(await ordRes.json());
      }
    } catch (e) {
      console.error('Payment status update failure:', e);
    }
  };

  const handleUpdateOrderTracking = async (orderId: string, trackingNumber: string) => {
    try {
      const response = await adminFetch(`/api/orders/${orderId}/tracking`, {
        method: 'PUT',
        body: JSON.stringify({ trackingNumber }),
      });
      if (response.ok) {
        triggerToast(trackingNumber ? 'Tracking saved — customer notified by email.' : 'Tracking cleared.');
        const ordRes = await adminFetch('/api/orders');
        setOrders(await ordRes.json());
      }
    } catch (e) {
      console.error('Tracking update failure:', e);
    }
  };

  const handleUploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = getAdminToken();
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return data.url ?? null;
      }
      triggerToast('Image upload failed.');
    } catch (e) {
      console.error('Upload failure:', e);
    }
    return null;
  };

  const handleMerchantAddCoupon = async (newCoupon: Coupon) => {
    try {
      const response = await adminFetch('/api/coupons', {
        method: 'POST',
        body: JSON.stringify(newCoupon),
      });
      if (response.ok) {
        triggerToast(`Discount code "${newCoupon.code}" saved.`);
        const coupRes = await adminFetch('/api/coupons');
        setCoupons(await coupRes.json());
      }
    } catch (e) {
      console.error('Coupon registration failure:', e);
    }
  };

  const handleMerchantDeleteCoupon = async (code: string) => {
    try {
      const response = await adminFetch(`/api/coupons/${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        triggerToast(`Coupon "${code}" deactivated.`);
        const coupRes = await adminFetch('/api/coupons');
        setCoupons(await coupRes.json());
      }
    } catch (e) {
      console.error('Coupon delete failure:', e);
    }
  };

  const handleMerchantAddCategory = async (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    try {
      const response = await adminFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed }),
      });
      if (response.ok) {
        triggerToast(`Category "${trimmed}" saved.`);
        const catRes = await adminFetch('/api/categories');
        const cats = await catRes.json();
        setCategories(cats.map((c: { name: string }) => c.name));
      }
    } catch (e) {
      console.error('Category add failure:', e);
    }
  };

  const handleMerchantDeleteCategory = async (categoryName: string) => {
    const cat = (await (await adminFetch('/api/categories')).json()).find(
      (c: { name: string }) => c.name === categoryName
    );
    if (!cat) return;
    try {
      const response = await adminFetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      if (response.ok) {
        triggerToast('Category removed.');
        const catRes = await adminFetch('/api/categories');
        const cats = await catRes.json();
        setCategories(cats.map((c: { name: string }) => c.name));
        const prodRes = await adminFetch('/api/products');
        setProducts(await prodRes.json());
      }
    } catch (e) {
      console.error('Category delete failure:', e);
    }
  };

  const handleMerchantUpdateCategory = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    const cats = await (await adminFetch('/api/categories')).json();
    const cat = cats.find((c: { name: string }) => c.name === oldName);
    if (!cat) return;
    try {
      const response = await adminFetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: trimmed }),
      });
      if (response.ok) {
        triggerToast(`Category renamed to "${trimmed}".`);
        const catRes = await adminFetch('/api/categories');
        const updated = await catRes.json();
        setCategories(updated.map((c: { name: string }) => c.name));
        const prodRes = await adminFetch('/api/products');
        setProducts(await prodRes.json());
      }
    } catch (e) {
      console.error('Category update failure:', e);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (location.pathname === '/admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return (
      <AdminLogin
        onSuccess={() => {
          setIsAuthenticated(true);
          loadAdminData();
          navigate('/admin', { replace: true });
        }}
      />
    );
  }

  if (location.pathname === '/admin/login') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-3 bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2.5">
          <Sparkles size={14} className="text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="sticky top-0 z-35 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base font-display shadow-md">
            B
          </div>
          <div>
            <h1 className="font-display font-bold text-base md:text-lg text-slate-900 tracking-tight leading-none">
              Merchant Dashboard
            </h1>
            <p className="text-[10px] text-indigo-700 font-bold tracking-widest mt-0.5 uppercase">
              Bismillah Cotton & Sports Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <Store size={14} />
            <span className="hidden sm:inline">View Store</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

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
          onUpdateOrderPaymentStatus={handleMerchantUpdateOrderPaymentStatus}
          onAddCoupon={handleMerchantAddCoupon}
          onDeleteCoupon={handleMerchantDeleteCoupon}
          onAddCategory={handleMerchantAddCategory}
          onDeleteCategory={handleMerchantDeleteCategory}
          onUpdateCategory={handleMerchantUpdateCategory}
          stats={stats}
          customers={customers}
          statsRange={statsRange}
          onStatsRangeChange={handleStatsRangeChange}
          onUpdateOrderTracking={handleUpdateOrderTracking}
          onUploadImage={handleUploadImage}
        />
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { Product, Order, Coupon, StoreStats } from '../types';
import { 
  BarChart, 
  TrendingUp, 
  ShoppingBag, 
  Check, 
  Trash2, 
  Plus, 
  Upload, 
  DollarSign, 
  Package, 
  Search, 
  Tag, 
  Layers, 
  PlusCircle, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle,
  Sparkles,
  AlertCircle,
  Edit3,
  FolderOpen
} from 'lucide-react';

interface AdminPortalProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  categories: string[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateOrderPaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
}

export default function AdminPortal({
  products,
  orders,
  coupons,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateProductStock,
  onUpdateOrderStatus,
  onUpdateOrderPaymentStatus,
  onAddCoupon,
  onDeleteCoupon,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
}: AdminPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'products' | 'orders' | 'coupons'>('dashboard');

  // Add Product Form States
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState(categories[0] || 'Cotton Collection');
  const [newProductPrice, setNewProductPrice] = useState('39');
  const [newProductOrigPrice, setNewProductOrigPrice] = useState('');
  const [newProductImg, setNewProductImg] = useState('');
  const [newProductStock, setNewProductStock] = useState('30');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductSizes, setNewProductSizes] = useState('S, M, L, XL');
  const [newProductColors, setNewProductColors] = useState('#FFFFFF, #000000, #eedbc5');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Manager States
  const [isCategoryMgrOpen, setIsCategoryMgrOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCategoryOldName, setEditingCategoryOldName] = useState<string | null>(null);
  const [editingCategoryNewName, setEditingCategoryNewName] = useState('');

  // Add Coupon Form States
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState('10');
  const [newCouponMin, setNewCouponMin] = useState('30');

  // Input Validation Error States
  const [formError, setFormError] = useState('');
  const [couponFormError, setCouponFormError] = useState('');

  // Customer Orders Filters
  const [orderQuery, setOrderQuery] = useState('');

  // -------------------------------------------------------------
  // Math & Statistics compiling for the Shopify dashboard overview
  // -------------------------------------------------------------
  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, order) => acc + order.total, 0);

  const totalOrders = orders.length;
  
  const activeProducts = products.length;
  
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  // Compile daily revenue metrics (mock and live custom checkouts integrated)
  const revenueChartData = [
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 245 },
    { label: 'Wed', value: 190 },
    { label: 'Thu', value: 310 },
    { label: 'Fri', value: 430 },
    { label: 'Sat', value: 512 },
    { label: 'Sun', value: Math.max(80, totalSales * 0.45) } // Scale dynamically with customer actions
  ];

  const maxChartVal = Math.max(...revenueChartData.map(d => d.value)) * 1.15;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice || !newProductStock) {
      setFormError('Please fill out Name, Price, and Stock limits.');
      setTimeout(() => setFormError(''), 4000);
      return;
    }
    setFormError('');

    // Process comma separated lists
    const sizeArr = newProductSizes.split(',').map(s => s.trim()).filter(s => s !== '');
    const colorArr = newProductColors.split(',').map(c => c.trim()).filter(c => c !== '');
    const finalImg = newProductImg.trim() || 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=700&auto=format&fit=crop';

    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        name: newProductName.trim(),
        description: newProductDesc.trim() || 'Premium classic fabric clothing style suited for best elegance & luxurious casual standards.',
        price: parseFloat(newProductPrice),
        originalPrice: newProductOrigPrice ? parseFloat(newProductOrigPrice) : undefined,
        category: newProductCategory,
        images: [finalImg],
        sizes: sizeArr.length > 0 ? sizeArr : undefined,
        colors: colorArr.length > 0 ? colorArr : undefined,
        stock: parseInt(newProductStock),
      };
      onUpdateProduct(updatedProduct);
      setEditingProduct(null);
    } else {
      const cleanProduct: Product = {
        id: `prod-${Date.now()}`,
        name: newProductName.trim(),
        description: newProductDesc.trim() || 'Premium classic fabric clothing style suited for best elegance & luxurious casual standards.',
        price: parseFloat(newProductPrice),
        originalPrice: newProductOrigPrice ? parseFloat(newProductOrigPrice) : undefined,
        category: newProductCategory,
        images: [finalImg],
        sizes: sizeArr.length > 0 ? sizeArr : undefined,
        colors: colorArr.length > 0 ? colorArr : undefined,
        rating: 5.0,
        reviews: [],
        stock: parseInt(newProductStock),
        isFeatured: true,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      onAddProduct(cleanProduct);
    }
    
    // Clear state
    setNewProductName('');
    setNewProductPrice('39');
    setNewProductOrigPrice('');
    setNewProductImg('');
    setNewProductStock('30');
    setNewProductDesc('');
    setNewProductSizes('S, M, L, XL');
    setNewProductColors('#FFFFFF, #000000, #eedbc5');
    setIsAddFormOpen(false);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponValue) {
      setCouponFormError('Please fill out Coupon Code & value parameters.');
      setTimeout(() => setCouponFormError(''), 4000);
      return;
    }
    setCouponFormError('');

    const cleanCoupon: Coupon = {
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      value: parseFloat(newCouponValue),
      minPurchase: parseFloat(newCouponMin) || 0,
      isActive: true
    };

    onAddCoupon(cleanCoupon);
    setNewCouponCode('');
    setNewCouponValue('10');
    setNewCouponMin('30');
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"><Clock size={11} /> Pending</span>;
      case 'Processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-850"><Layers size={11} /> Processing</span>;
      case 'Shipped':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800"><Truck size={11} /> Shipped</span>;
      case 'Delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle size={11} /> Delivered</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle size={11} /> Cancelled</span>;
    }
  };

  const filteredOrders = orders.filter(
    order => order.customerName.toLowerCase().includes(orderQuery.toLowerCase()) || 
             order.id.toLowerCase().includes(orderQuery.toLowerCase()) ||
             order.city.toLowerCase().includes(orderQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="admin-panel-container">
      
      {/* Title block with Sub-Tab Navigations */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 bg-indigo-650 rounded text-[10px] font-bold tracking-widest font-mono uppercase">Merchant Mode</span>
            <span className="text-slate-400 text-xs font-mono">• Shopify Engine v2.4</span>
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white mt-1">Bismillah Cotton Store Admin Portal</h2>
        </div>

        {/* Dynamic sub navigation controls */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 w-full md:w-auto overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'dashboard' ? 'bg-indigo-650 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Store Stats & Overview
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'products' ? 'bg-indigo-650 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Manage Products ({activeProducts})
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'orders' ? 'bg-indigo-650 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Manage Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('coupons')}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'coupons' ? 'bg-indigo-650 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Discount Coupons
          </button>
        </div>
      </div>

      {/* ACTIVE SCREEN: GENERAL MERCHANT STATS DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div className="p-6 space-y-6">
          
          {/* Main KPI widget indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-banner">
            
            {/* KPI 1: Sales */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden group hover:border-indigo-400/50 transition-colors">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Accumulated Net Revenue</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-bold text-slate-900">${totalSales.toFixed(2)}</span>
                <span className="text-[10px] text-indigo-600 font-bold px-1.5 py-0.2 bg-indigo-50 rounded">Live</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-sans">Excluding manual Cancelled baskets</p>
              <div className="absolute right-4 bottom-4 text-indigo-900/10 group-hover:scale-105 transition-transform">
                <DollarSign size={40} className="stroke-[1.5]" />
              </div>
            </div>

            {/* KPI 2: Order size */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden group hover:border-indigo-400/50 transition-colors">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Fulfillment Base Orders</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-bold text-slate-900">{totalOrders} Orders</span>
                <span className="text-[10px] text-indigo-600 font-bold px-1.5 py-0.2 bg-indigo-50 rounded">Realtime</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Placed across COD and Cards select</p>
              <div className="absolute right-4 bottom-4 text-indigo-900/10 group-hover:scale-105 transition-transform">
                <ShoppingBag size={40} className="stroke-[1.5]" />
              </div>
            </div>

            {/* KPI 3: Average customer basket value */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden group hover:border-indigo-400/50 transition-colors">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Avg Transaction Size</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-bold text-slate-900">${averageOrderValue.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Dynamic checkouts average ratio</p>
              <div className="absolute right-4 bottom-4 text-indigo-900/10 group-hover:scale-105 transition-transform">
                <TrendingUp size={40} className="stroke-[1.5]" />
              </div>
            </div>

            {/* KPI 4: Alert status out-of-stock count */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden group hover:border-indigo-400/50 transition-colors">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Out of Stock Warnings</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-red-650' : 'text-slate-900'}`}>
                  {outOfStockCount} Items
                </span>
                {outOfStockCount === 0 && (
                  <span className="text-[10px] text-indigo-600 font-bold px-1.5 py-0.2 bg-indigo-50 rounded">Healthy</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Need replenishment parameters soon</p>
              <div className="absolute right-4 bottom-4 text-indigo-900/10 group-hover:scale-105 transition-transform">
                <Package size={40} className="stroke-[1.5]" />
              </div>
            </div>

          </div>

          {/* Graphical Analytics Charts Row & Ratios */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-graphs-shelf">
            
            {/* Custom Interactive CSS Bar Chart representing daily performance */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">Weekly Revenue Analytics</h3>
                  <p className="text-[10px] text-slate-500 font-sans">Visual representation of gross transactions checkout metrics</p>
                </div>
                <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                  Total Mon-Sun: ${totalSales.toFixed(0)}
                </div>
              </div>

              {/* Graphical bars construct */}
              <div className="h-48 flex items-end justify-between gap-2.5 px-2 pt-6 pb-2" id="analyst-chart">
                {revenueChartData.map((data, index) => {
                  const percentageHeight = (data.value / maxChartVal) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative z-[2]">
                      
                      {/* Tooltip dynamic hover */}
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded shadow-lg whitespace-nowrap mb-1 transition-all z-[3] pointer-events-none">
                        {data.label}: ${data.value.toFixed(1)}
                      </div>

                      {/* Bar fill */}
                      <div 
                        style={{ height: `${Math.max(8, percentageHeight)}%` }}
                        className="w-full bg-slate-200 hover:bg-indigo-600 rounded-t-sm transition-all duration-500 cursor-pointer ease-out relative overflow-hidden"
                      >
                        {data.label === 'Sun' && <div className="absolute inset-0 bg-indigo-500/30 animate-pulse" />}
                      </div>
                      
                      {/* Label */}
                      <span className="text-[10px] text-slate-500 font-semibold mt-2">{data.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Catalog Categories distribution panel */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
                Categories Split Weight
              </h3>
              
              <div className="space-y-4" id="categories-ratios">
                {['Cotton Collection', 'Clothing', 'Sports Wear', 'Sports Gear'].map((cat, i) => {
                  const catProducts = products.filter(p => p.category === cat);
                  const percentage = products.length > 0 ? (catProducts.length / products.length) * 100 : 0;
                  
                  return (
                    <div key={i} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium text-slate-700">
                        <span>{cat}</span>
                        <span className="font-bold text-slate-900">
                          {catProducts.length} items ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      {/* CSS progress bar */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${percentage}%` }}
                          className={`h-full rounded-full ${
                            i === 0 ? 'bg-indigo-805' :
                            i === 1 ? 'bg-slate-800' :
                            i === 2 ? 'bg-indigo-600' : 'bg-indigo-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notice panel */}
              <div className="mt-5 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/60 flex items-start gap-2 text-[10px] text-indigo-950">
                <Sparkles size={14} className="shrink-0 text-indigo-700" />
                <p>New categories like <strong>"Bismillah Premium Garments"</strong> or <strong>"Athletic Accessories"</strong> can be defined simply by typing them during product creation.</p>
              </div>
            </div>

          </div>

          {/* Panel: Recent Activity Orders */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <span>Incoming Customer Purchases Stream</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-850 font-bold py-1 px-2.5 border border-emerald-100 rounded-full">Active</span>
            </h3>

            <div className="overflow-x-auto" id="recent-purchases-table">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <th className="py-3 px-4">OrderID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Settlement</th>
                    <th className="py-3 px-4">Tracking Status</th>
                    <th className="py-3 px-4 text-right">Sum Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-indigo-50/10 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{ord.id}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(ord.date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{ord.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{ord.city}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          ord.paymentMethod !== 'COD' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-indigo-50 text-indigo-750 border border-indigo-100'
                        }`}>
                          {ord.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(ord.status)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">${ord.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ACTIVE SCREEN: PRODUCT MANAGER CRUDS */}
      {activeSubTab === 'products' && (
        <div className="p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 uppercase tracking-wider">Catalog Inventory Controller</h3>
              <p className="text-[10px] text-slate-500 font-sans">Create products, monitor stocks, and modify listing values</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setIsCategoryMgrOpen(!isCategoryMgrOpen);
                  setIsAddFormOpen(false);
                }}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isCategoryMgrOpen ? 'bg-indigo-650 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FolderOpen size={14} />
                <span>{isCategoryMgrOpen ? 'Hide Collections' : 'Manage Collections'}</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setNewProductName('');
                  setNewProductCategory(categories[0] || 'Cotton Collection');
                  setNewProductPrice('39');
                  setNewProductOrigPrice('');
                  setNewProductImg('');
                  setNewProductStock('30');
                  setNewProductDesc('');
                  setNewProductSizes('S, M, L, XL');
                  setNewProductColors('#FFFFFF, #000000, #eedbc5');

                  setIsAddFormOpen(!isAddFormOpen);
                  setIsCategoryMgrOpen(false);
                }}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isAddFormOpen && !editingProduct ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-950'
                }`}
              >
                <PlusCircle size={14} />
                <span>{isAddFormOpen && !editingProduct ? 'Close Creator' : 'Register New Fabric / Sports Gear'}</span>
              </button>
            </div>
          </div>

          {/* Category Management Block */}
          {isCategoryMgrOpen && (
            <div className="p-5 bg-indigo-50/20 border border-indigo-200/60 rounded-xl space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-1.5">
                <FolderOpen size={14} className="text-indigo-800" /> Collections & Categories Management
              </h4>

              {/* Add category inline form */}
              <div className="flex gap-2.5 max-w-md">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="Create New Collection (e.g. Lawn Fabric, Winter Wear)"
                  className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newCategoryInput.trim();
                    if (!trimmed) return;
                    onAddCategory(trimmed);
                    setNewCategoryInput('');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer transition-colors whitespace-nowrap"
                >
                  Create
                </button>
              </div>

              {/* Grid listings of existing categories */}
              <div className="pt-2">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Active Collections ({categories.length})</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {categories.map((cat) => (
                    <div key={cat} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2.5 hover:shadow-xs transition-shadow">
                      {editingCategoryOldName === cat ? (
                        <div className="flex items-center gap-1 w-full">
                          <input
                            type="text"
                            value={editingCategoryNewName}
                            onChange={(e) => setEditingCategoryNewName(e.target.value)}
                            className="p-1 border border-slate-300 rounded text-xs font-semibold flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editingCategoryNewName.trim() && editingCategoryNewName.trim() !== cat) {
                                onUpdateCategory(cat, editingCategoryNewName.trim());
                              }
                              setEditingCategoryOldName(null);
                            }}
                            className="px-2 py-1 bg-emerald-600 text-white text-[10px] uppercase font-bold rounded"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryOldName(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] uppercase font-bold rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-slate-900 capitalize">{cat}</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {products.filter(p => p.category === cat).length} listed products
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryOldName(cat);
                                setEditingCategoryNewName(cat);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded select-none"
                              title="Rename Category"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${cat}" collection? Products in this collection will be marked "Uncategorized".`)) {
                                  onDeleteCategory(cat);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded"
                              title="Delete Category"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-slate-400 italic">
                      No custom collections defined yet. Create your first category above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form container: ADD PRODUCT MODAL INLINE */}
          {isAddFormOpen && (
            <form onSubmit={handleCreateProduct} className="p-5 bg-indigo-50/20 border border-indigo-200/60 rounded-xl space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-1">
                <Sparkles size={13} className="text-indigo-800" />
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Catalog Registry Form'}
              </h4>

              {formError && (
                <div id="product-form-error" className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Product Complete Title *</label>
                  <input
                    required
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Traditional Fine Cotton Shalwar Kameez Suit"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Select Category Code</label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      {!categories.includes(newProductCategory) && newProductCategory !== 'Uncategorized' && (
                        <option value={newProductCategory}>{newProductCategory}</option>
                      )}
                      <option value="Uncategorized">Uncategorized</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Initial Stock count *</label>
                    <input
                      required
                      type="number"
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value)}
                      placeholder="30"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 font-display">Special Product Price ($) *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="39"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Retail Original Price ($) (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProductOrigPrice}
                      onChange={(e) => setNewProductOrigPrice(e.target.value)}
                      placeholder="e.g. 55"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Unsplash/External Image URL Select</label>
                  <input
                    type="url"
                    value={newProductImg}
                    onChange={(e) => setNewProductImg(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Available Sizes (Comma separated)</label>
                  <input
                    type="text"
                    value={newProductSizes}
                    onChange={(e) => setNewProductSizes(e.target.value)}
                    placeholder="S, M, L, XL"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Available Hex Colors (Comma separated)</label>
                  <input
                    type="text"
                    value={newProductColors}
                    onChange={(e) => setNewProductColors(e.target.value)}
                    placeholder="#FFFFFF, #000000, #eedbc5"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Detailed Description Context</label>
                <textarea
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Specify texture specifications, thread count, materials quality, physical characteristics..."
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-xs italic resize-none"
                />
              </div>

              <div className="flex justify-end gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg uppercase tracking-wider cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer font-sans"
                >
                  {editingProduct ? 'Save Product Details' : 'Commit Product Registry'}
                </button>
              </div>
            </form>
          )}

          {/* Table displaying all products */}
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl" id="products-catalog-inventory">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-150">
                  <th className="py-3 px-4">Photo Preview</th>
                  <th className="py-3 px-4">Title / Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price tags</th>
                  <th className="py-3 px-4">Available Stock Level</th>
                  <th className="py-3 px-3 text-center">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-indigo-50/10 transition-colors">
                    
                    {/* Photo preview */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden shadow-xs border border-slate-200">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Title Name description */}
                    <td className="py-3 px-4 max-w-sm">
                      <h4 className="font-bold text-slate-900 text-sm font-sans line-clamp-1">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>
                    </td>

                    {/* Category Title snippet */}
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-indigo-50 text-indigo-750 border border-indigo-100 rounded">
                        {p.category}
                      </span>
                    </td>

                    {/* Price figures */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-xs font-semibold">
                        <span className="text-slate-900 font-bold">${p.price.toFixed(2)}</span>
                        {p.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">${p.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </td>

                    {/* Stock parameters with manual slider */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${p.stock <= 0 ? 'bg-red-500' : p.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                          <input
                            type="number"
                            value={p.stock}
                            onChange={(e) => onUpdateProductStock(p.id, parseInt(e.target.value) || 0)}
                            className="bg-transparent font-bold w-12 text-slate-800 text-center focus:outline-none"
                            aria-label={`Update stock for ${p.name}`}
                          />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Units</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions control */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(p);
                            setNewProductName(p.name);
                            setNewProductCategory(p.category);
                            setNewProductPrice(p.price.toString());
                            setNewProductOrigPrice(p.originalPrice ? p.originalPrice.toString() : '');
                            setNewProductImg(p.images[0] || '');
                            setNewProductStock(p.stock.toString());
                            setNewProductDesc(p.description);
                            setNewProductSizes(p.sizes ? p.sizes.join(', ') : '');
                            setNewProductColors(p.colors ? p.colors.join(', ') : '');
                            
                            setIsAddFormOpen(true);
                            setIsCategoryMgrOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-55 rounded transition-all cursor-pointer"
                          title="Edit product parameters"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-55 rounded transition-all cursor-pointer"
                          title="Delete product out of catalog"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ACTIVE SCREEN: ORDER STATUS MANAGEMENTS */}
      {activeSubTab === 'orders' && (
        <div className="p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 uppercase tracking-wider">Purchase Orders Central</h3>
              <p className="text-[10px] text-slate-500 font-sans">View delivery addresses, payment checks, and update tracking statuses</p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full text-xs py-2 pl-8 pr-4 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Orders stream list container */}
          <div className="space-y-4" id="orders-fulfillment-flow">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <AlertCircle size={32} className="text-slate-300 mx-auto mb-2.5" />
                <p className="text-xs text-slate-500 font-sans italic">No matching transaction logs found.</p>
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div key={ord.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400/50 transition-colors space-y-4">
                  
                  {/* Row 1: Header metadata */}
                  <div className="flex flex-col sm:flex-row justify-between bg-slate-50 p-3.5 rounded-lg border border-slate-200 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-indigo-700">{ord.id}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 font-medium">{new Date(ord.date).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-900">
                        Customer: {ord.customerName} • {ord.customerEmail} • {ord.customerPhone}
                      </p>
                    </div>

                    {/* Order action status updater dropdown */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          ord.paymentMethod !== 'COD'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {ord.paymentMethod === 'COD' ? 'COD' : ord.paymentMethod}
                        </span>
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-zinc-700 font-display">Dispatch:</label>
                        <select
                          value={ord.status}
                          onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                          className="p-1.5 pr-8 bg-white border border-slate-300 rounded text-xs font-semibold focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-zinc-700 font-display">Payment:</label>
                        <select
                          value={ord.paymentStatus}
                          onChange={(e) => onUpdateOrderPaymentStatus(ord.id, e.target.value as Order['paymentStatus'])}
                          className="p-1.5 pr-8 bg-white border border-slate-300 rounded text-xs font-semibold focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Basket items review */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                                   {/* Basket items list */}
                    <div className="md:col-span-2 space-y-2 border-r border-slate-100 pr-5">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Basket Items</h4>
                      {ord.items.map((item, index) => (
                        <div key={index} className="flex gap-2.5 items-center">
                          <img src={item.image} alt="" className="w-8 h-8 object-cover rounded border border-slate-250 bg-white" />
                          <div className="flex-1 min-w-0 font-medium text-slate-800">
                            <span className="font-bold text-slate-950">{item.productName}</span>
                            <p className="text-[10px] text-slate-400">
                              Qty: {item.quantity} • Size: {item.selectedSize || 'Standard'} • Color: {item.selectedColor ? <span style={{ backgroundColor: item.selectedColor }} className="w-2.5 h-2.5 rounded-full inline-block border text-[0]" /> : 'Auto'}
                            </p>
                          </div>
                          <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipment Address details & math */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shipping Coordinates</h4>
                        <p className="font-semibold text-slate-900">{ord.shippingAddress}</p>
                        <p className="text-slate-600 mt-0.5">{ord.city}, {ord.postalCode}</p>
                        {ord.notes && (
                          <p className="text-[10px] text-indigo-900 bg-indigo-50/50 p-1.5 rounded mt-1.5 border border-indigo-250 font-sans leading-relaxed">
                            <strong>Note:</strong> {ord.notes}
                          </p>
                        )}
                      </div>

                      {/* Cash Math summary */}
                      <div className="pt-2 border-t border-slate-200 text-slate-800 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Subtotal Amount:</span>
                          <span className="font-medium">${ord.subtotal.toFixed(2)}</span>
                        </div>
                        {ord.discount > 0 && (
                          <div className="flex justify-between text-red-650 font-medium">
                            <span>Coupon Discount:</span>
                            <span>-${ord.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-slate-900 pt-1 text-sm">
                          <span>Total Amount:</span>
                          <span className="text-indigo-700 font-black font-display text-base">${ord.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ACTIVE SCREEN: DISCOUNT COUPONS GENERATION */}
      {activeSubTab === 'coupons' && (
        <div className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Creating Coupons Form card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <h3 className="font-display font-medium text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                Generate Coupon Code
              </h3>

              {couponFormError && (
                <div id="coupon-form-error" className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
                  {couponFormError}
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-zinc-700 font-display mb-1">
                    Coupon Promo Code *
                  </label>
                  <input
                    required
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                    placeholder="e.g. COTTONSUMMER"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg placeholder-slate-400 font-bold tracking-wider uppercase text-indigo-700 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Discount Type
                    </label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Cash ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Discount Value *
                    </label>
                    <input
                      required
                      type="number"
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(e.target.value)}
                      placeholder="15"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Minimum Spend Requirement ($)
                  </label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer font-sans"
                >
                  Publish Coupon Code
                </button>
              </form>
            </div>

            {/* Coupons listing parameters */}
            <div className="md:col-span-2 space-y-3.5">
              <h3 className="font-display font-medium text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Active Code Databases
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="coupons-database">
                {coupons.map((c) => (
                  <div 
                    key={c.code} 
                    className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs hover:shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Tag size={13} className="text-indigo-700" />
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded text-xs uppercase tracking-wider">
                          {c.code}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Discount Value: <span className="text-indigo-600">{c.discountType === 'percentage' ? `${c.value}%` : `$${c.value}`}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Require min spend: ${c.minPurchase}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteCoupon(c.code)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                      title="Delete Coupon"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerFetch, getCustomerProfile, logoutCustomer } from '../lib/customerAuth';
import { Order } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { LogOut, Package, ChevronRight } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export default function AccountPage() {
  const navigate = useNavigate();
  const { format, symbol } = useCurrency();
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  usePageMeta({ title: 'My Account', description: 'View your Bismillah Store order history.' });

  useEffect(() => {
    getCustomerProfile().then(async (p) => {
      if (!p) {
        navigate('/login');
        return;
      }
      setProfile(p);
      const res = await customerFetch('/api/account/orders');
      if (res.ok) setOrders(await res.json());
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-slate-900">Bismillah Store</Link>
        <button onClick={() => { logoutCustomer(); navigate('/'); }} className="flex items-center gap-1.5 text-xs font-bold text-red-600 cursor-pointer">
          <LogOut size={14} /> Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Hello, {profile?.name}</h1>
        <p className="text-sm text-slate-500 mb-8">{profile?.email}</p>

        <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Package size={16} /> Order History</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500 text-sm mb-4">No orders yet</p>
            <Link to="/" className="text-indigo-600 font-bold text-sm">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{order.id}</p>
                    <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">{order.items.length} item(s) · {order.paymentMethod}</p>
                {order.trackingNumber && (
                  <p className="text-xs text-green-700 mb-1">Tracking: {order.trackingNumber}</p>
                )}
                <p className="font-bold text-slate-900">{order.currency === 'PKR' ? `Rs. ${order.total.toLocaleString()}` : `${symbol}${order.total.toFixed(2)}`}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

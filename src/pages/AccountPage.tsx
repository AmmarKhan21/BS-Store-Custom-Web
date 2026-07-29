import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerFetch, getCustomerProfile, logoutCustomer } from '../lib/customerAuth';
import { Order } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { LogOut, Package, ChevronRight } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export default function AccountPage() {
  const navigate = useNavigate();
  const { symbol } = useCurrency();
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--site-bg)]">
        <div className="w-8 h-8 border-2 border-[var(--site-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--site-bg)]">
      <header className="bg-[var(--site-surface)] border-b border-[var(--site-border)] px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-[var(--site-ink)]">Bismillah Store</Link>
        <button onClick={() => { logoutCustomer(); navigate('/'); }} className="flex items-center gap-1.5 text-xs font-bold text-red-600 cursor-pointer">
          <LogOut size={14} /> Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-[var(--site-ink)] mb-1">Hello, {profile?.name}</h1>
        <p className="text-sm text-[var(--site-muted)] mb-8">{profile?.email}</p>

        <h2 className="font-bold text-[var(--site-ink)] flex items-center gap-2 mb-4"><Package size={16} /> Order History</h2>

        {orders.length === 0 ? (
          <div className="site-panel rounded-xl p-8 text-center">
            <p className="text-[var(--site-muted)] text-sm mb-4">No orders yet</p>
            <Link to="/" className="text-[var(--site-gold)] font-bold text-sm">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="site-panel block rounded-xl p-5 hover:border-[var(--site-gold)] transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-sm text-[var(--site-ink)]">{order.id}</p>
                    <p className="text-xs text-[var(--site-muted)]">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                    <ChevronRight size={14} className="text-[var(--site-muted)] group-hover:text-[var(--site-gold)]" />
                  </div>
                </div>
                <p className="text-sm text-[var(--site-muted)] mb-1">{order.items.length} item(s) · {order.paymentMethod}</p>
                {order.trackingNumber && (
                  <p className="text-xs text-green-700 mb-1">Tracking: {order.trackingNumber}</p>
                )}
                <p className="font-bold text-[var(--site-ink)]">{order.currency === 'PKR' ? `Rs. ${order.total.toLocaleString()}` : `${symbol}${order.total.toFixed(2)}`}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { customerFetch } from '../lib/customerAuth';
import { Order } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { ArrowLeft, Package, Truck } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { symbol } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  usePageMeta({
    title: order ? `Order ${order.id}` : 'Order Details',
    description: 'View your Bismillah Store order details and tracking.',
  });

  useEffect(() => {
    if (!id) return;
    customerFetch(`/api/account/orders/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          navigate('/login');
          return;
        }
        setOrder(await res.json());
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">Order not found</p>
        <Link to="/account" className="text-indigo-600 font-bold text-sm">← Back to account</Link>
      </div>
    );
  }

  const fmt = (n: number) =>
    order.currency === 'PKR' ? `Rs. ${n.toLocaleString()}` : `${symbol}${n.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/account" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600">
          <ArrowLeft size={16} /> My orders
        </Link>
        <Link to="/" className="text-xs font-bold text-indigo-600">Continue shopping</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{order.id}</h1>
              <p className="text-sm text-slate-500">{new Date(order.date).toLocaleString()}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">{order.status}</span>
          </div>

          {order.trackingNumber && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl mb-4 text-sm">
              <Truck size={16} className="text-green-600" />
              <span>Tracking: <strong>{order.trackingNumber}</strong></span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm mb-6">
            <div><span className="text-slate-500">Payment</span><p className="font-semibold">{order.paymentMethod} · {order.paymentStatus}</p></div>
            <div><span className="text-slate-500">Total</span><p className="font-bold text-indigo-700">{fmt(order.total)}</p></div>
          </div>

          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3"><Package size={14} /> Items</h2>
          <div className="space-y-3 mb-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.productName}</p>
                  <p className="text-xs text-slate-500">Qty {item.quantity}{item.selectedSize ? ` · ${item.selectedSize}` : ''}</p>
                </div>
                <p className="font-bold text-sm">{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 text-sm space-y-1">
            <p><span className="text-slate-500">Ship to:</span> {order.customerName}</p>
            <p className="text-slate-600">{order.shippingAddress}, {order.city} {order.postalCode}</p>
            <p className="text-slate-500">{order.customerPhone}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

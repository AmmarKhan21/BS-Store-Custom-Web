import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Order } from '../types';

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        const sandbox = params.get('sandbox');
        if (sandbox && data.paymentStatus === 'Pending') {
          fetch(`/api/orders/${orderId}/confirm-payment`, { method: 'POST' })
            .then(() => fetch(`/api/orders/${orderId}`).then((r) => r.json()).then(setOrder));
        }
      })
      .catch(() => {});
  }, [orderId, params]);

  return (
    <div className="min-h-screen bg-[var(--site-bg)] flex items-center justify-center p-4">
      <div className="site-panel w-full max-w-md rounded-2xl p-8 text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h1 className="font-display font-bold text-xl text-[var(--site-ink)] mb-2">Order Confirmed!</h1>
        {orderId && <p className="text-sm text-[var(--site-muted)] mb-1">Order ID: <strong className="text-[var(--site-ink)]">{orderId}</strong></p>}
        {order && (
          <p className="text-sm text-[var(--site-muted)] mb-6">
            Payment: {order.paymentMethod} · {order.paymentStatus}
            <br />A confirmation email has been sent to {order.customerEmail}
          </p>
        )}
        <Link to="/" className="site-btn-primary inline-block px-6 py-3 font-bold text-sm rounded-xl">Continue Shopping</Link>
        <Link to="/account" className="block mt-3 text-xs text-[var(--site-gold)] font-bold">View order history</Link>
      </div>
    </div>
  );
}

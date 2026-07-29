import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function OrderFailedPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div className="min-h-screen bg-[var(--site-bg)] flex items-center justify-center p-4">
      <div className="site-panel w-full max-w-md rounded-2xl p-8 text-center">
        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h1 className="font-display font-bold text-xl text-[var(--site-ink)] mb-2">Payment Failed</h1>
        <p className="text-sm text-[var(--site-muted)] mb-6">
          {orderId ? `Order ${orderId} was not paid.` : 'Your payment could not be processed.'} Please try again or choose Cash on Delivery.
        </p>
        <Link to="/" className="site-btn-primary inline-block px-6 py-3 font-bold text-sm rounded-xl">Back to Store</Link>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import StoreFooter from '../components/StoreFooter';

export default function TermsPage() {
  usePageMeta({
    title: 'Terms & Conditions',
    description: 'Terms and conditions for shopping at Bismillah Cotton & Sports Hub.',
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
        <Link to="/" className="font-display font-bold text-slate-900">← Bismillah Store</Link>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Terms & Conditions</h1>
        <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
          <p>By using Bismillah Cotton & Sports Hub, you agree to these terms.</p>
          <section>
            <h2 className="font-bold text-slate-900 mb-1">Orders & payment</h2>
            <p>All orders are subject to product availability. We accept Cash on Delivery, PayFast, and JazzCash. Prices are shown in PKR or USD based on your region.</p>
          </section>
          <section>
            <h2 className="font-bold text-slate-900 mb-1">Shipping</h2>
            <p>Orders are shipped across Pakistan. Delivery times vary by city. Free delivery may apply above minimum order values.</p>
          </section>
          <section>
            <h2 className="font-bold text-slate-900 mb-1">Returns</h2>
            <p>We offer a 7-day return policy on unused items in original packaging. Contact us to initiate a return.</p>
          </section>
          <section>
            <h2 className="font-bold text-slate-900 mb-1">Contact</h2>
            <p>See our <Link to="/contact" className="text-indigo-600 font-bold">contact page</Link> for support.</p>
          </section>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import StoreFooter from '../components/StoreFooter';

export default function PrivacyPage() {
  usePageMeta({
    title: 'Privacy Policy',
    description: 'Privacy policy for Bismillah Cotton & Sports Hub online store.',
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
        <Link to="/" className="font-display font-bold text-slate-900">← Bismillah Store</Link>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 prose prose-slate">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Bismillah Cotton & Sports Hub respects your privacy. We collect only the information needed to process orders and provide customer support.
        </p>
        <h2 className="text-lg font-bold mt-6 mb-2">Information we collect</h2>
        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
          <li>Name, email, phone number, and shipping address when you place an order</li>
          <li>Account credentials if you register (password stored encrypted)</li>
          <li>Order history linked to your account</li>
        </ul>
        <h2 className="text-lg font-bold mt-6 mb-2">How we use your data</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We use your information to fulfill orders, send confirmations, provide tracking updates, and respond to support requests. We do not sell your personal data to third parties.
        </p>
        <h2 className="text-lg font-bold mt-6 mb-2">Contact</h2>
        <p className="text-sm text-slate-600">
          Questions? Visit our <Link to="/contact" className="text-indigo-600 font-bold">contact page</Link>.
        </p>
      </main>
      <StoreFooter />
    </div>
  );
}

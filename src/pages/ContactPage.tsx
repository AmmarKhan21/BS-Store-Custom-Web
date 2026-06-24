import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import StoreFooter from '../components/StoreFooter';

export default function ContactPage() {
  usePageMeta({
    title: 'Contact Us',
    description: 'Contact Bismillah Cotton & Sports Hub for orders, support, and inquiries.',
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
        <Link to="/" className="font-display font-bold text-slate-900">← Bismillah Store</Link>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Contact Us</h1>
        <p className="text-sm text-slate-600 mb-8">We're here to help with orders, product questions, and returns.</p>

        <div className="grid gap-4">
          <a
            href="https://wa.me/923001234567?text=Hi%2C%20I%20have%20a%20question%20about%20Bismillah%20Store"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-green-400 transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <MessageCircle size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">WhatsApp</p>
              <p className="text-sm text-slate-500">Chat with us — fastest response</p>
            </div>
          </a>

          <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Mail size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Email</p>
              <p className="text-sm text-slate-500">support@bismillahstore.pk</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <MapPin size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Warehouse</p>
              <p className="text-sm text-slate-500">Lahore Karkhana Market, Pakistan</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <Phone size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Hours</p>
              <p className="text-sm text-slate-500">Mon–Sat, 10am – 7pm PKT</p>
            </div>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}

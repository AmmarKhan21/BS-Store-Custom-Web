import React from 'react';
import { Link } from 'react-router-dom';

export default function StoreFooter() {
  return (
    <footer className="border-t border-slate-200 py-10 px-4 md:px-8 text-xs font-sans mt-auto bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold font-display uppercase">B</span>
            <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">Bismillah Store</h3>
          </div>
          <p className="leading-relaxed text-slate-400 text-[11px]">
            Premium cotton fabrics and sports wear. COD & online payments across Pakistan.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-white uppercase tracking-widest text-[11px]">Support</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-white uppercase tracking-widest text-[11px]">Customer Support</h4>
          <ul className="space-y-1.5 text-slate-400 text-[11px]">
            <li>Cash on Delivery (Pakistan-wide)</li>
            <li>PayFast & JazzCash accepted</li>
            <li>7-Day Return Policy</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 pt-6 mt-8 text-center text-slate-500 text-[10px]">
        <p>© {new Date().getFullYear()} Bismillah Cotton and Sports Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}

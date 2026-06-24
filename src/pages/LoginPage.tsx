import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginCustomer, verifyCustomerOtp } from '../lib/customerAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginCustomer(email, password);
    setLoading(false);

    if (result.requiresOtp) {
      setNeedsOtp(true);
      return;
    }
    if (result.success) {
      localStorage.setItem('bismillah_customer_token', result.token);
      navigate('/account');
      return;
    }
    setError(result.error || 'Login failed');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyCustomerOtp(email, otp, 'login');
    setLoading(false);
    if (result.success) {
      navigate('/account');
    } else {
      setError(result.error || 'Invalid code');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <h1 className="font-display font-bold text-xl text-slate-900 mb-1">Sign In</h1>
        <p className="text-sm text-slate-500 mb-6">Optional — you can always checkout as a guest</p>

        {!needsOtp ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl cursor-pointer disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-slate-600">Enter the 6-digit code sent to {email}</p>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-center tracking-widest" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl cursor-pointer">
              Verify & Sign In
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          No account? <Link to="/register" className="text-indigo-600 font-bold">Create one</Link>
          {' · '}
          <Link to="/" className="text-indigo-600">Continue as guest</Link>
        </p>
      </div>
    </div>
  );
}

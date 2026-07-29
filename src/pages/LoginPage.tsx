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
    <div className="min-h-screen bg-[var(--site-bg)] flex items-center justify-center p-4">
      <div className="site-panel w-full max-w-md rounded-2xl p-8">
        <h1 className="font-display font-bold text-xl text-[var(--site-ink)] mb-1">Sign In</h1>
        <p className="text-sm text-[var(--site-muted)] mb-6">Optional — you can always checkout as a guest</p>

        {!needsOtp ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="site-input px-4 py-2.5 text-sm rounded-xl" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="site-input px-4 py-2.5 text-sm rounded-xl" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="site-btn-primary w-full py-3 font-bold text-sm rounded-xl cursor-pointer disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-[var(--site-muted)]">Enter the 6-digit code sent to {email}</p>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} required className="site-input px-4 py-2.5 text-sm rounded-xl text-center tracking-widest" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="site-btn-primary w-full py-3 font-bold text-sm rounded-xl cursor-pointer disabled:opacity-60">
              Verify & Sign In
            </button>
          </form>
        )}

        <p className="text-center text-xs text-[var(--site-muted)] mt-6">
          No account? <Link to="/register" className="text-[var(--site-gold)] font-bold">Create one</Link>
          {' · '}
          <Link to="/" className="text-[var(--site-gold)]">Continue as guest</Link>
        </p>
      </div>
    </div>
  );
}

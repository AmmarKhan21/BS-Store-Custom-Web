import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer, verifyCustomerOtp, resendOtp } from '../lib/customerAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await registerCustomer({ email, password, name, phone });
    setLoading(false);
    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyCustomerOtp(email, otp, 'register');
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
        <h1 className="font-display font-bold text-xl text-[var(--site-ink)] mb-1">Create Account</h1>
        <p className="text-sm text-[var(--site-muted)] mb-6">Optional — track orders & faster checkout</p>

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required className="site-input px-4 py-2.5 text-sm rounded-xl" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="site-input px-4 py-2.5 text-sm rounded-xl" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="site-input px-4 py-2.5 text-sm rounded-xl" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" required minLength={6} className="site-input px-4 py-2.5 text-sm rounded-xl" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="site-btn-primary w-full py-3 font-bold text-sm rounded-xl cursor-pointer disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-[var(--site-muted)]">We sent a 6-digit code to <strong className="text-[var(--site-ink)]">{email}</strong></p>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} required className="site-input px-4 py-2.5 text-sm rounded-xl text-center tracking-widest" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="site-btn-primary w-full py-3 font-bold text-sm rounded-xl cursor-pointer disabled:opacity-60">Verify Email</button>
            <button type="button" onClick={() => resendOtp(email, 'register')} className="w-full text-xs text-[var(--site-gold)] font-bold cursor-pointer">Resend code</button>
          </form>
        )}

        <p className="text-center text-xs text-[var(--site-muted)] mt-6">
          Already have an account? <Link to="/login" className="text-[var(--site-gold)] font-bold">Sign in</Link>
          {' · '}
          <Link to="/" className="text-[var(--site-gold)]">Shop as guest</Link>
        </p>
      </div>
    </div>
  );
}

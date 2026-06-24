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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <h1 className="font-display font-bold text-xl text-slate-900 mb-1">Create Account</h1>
        <p className="text-sm text-slate-500 mb-6">Optional — track orders & faster checkout</p>

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" required minLength={6} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl cursor-pointer">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-slate-600">We sent a 6-digit code to <strong>{email}</strong></p>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-center tracking-widest" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl cursor-pointer">Verify Email</button>
            <button type="button" onClick={() => resendOtp(email, 'register')} className="w-full text-xs text-indigo-600 font-bold cursor-pointer">Resend code</button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold">Sign in</Link>
          {' · '}
          <Link to="/" className="text-indigo-600">Shop as guest</Link>
        </p>
      </div>
    </div>
  );
}

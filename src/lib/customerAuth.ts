const TOKEN_KEY = 'bismillah_customer_token';

export interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export function getCustomerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearCustomerToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function customerFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getCustomerToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...options, headers });
}

export async function getCustomerProfile(): Promise<CustomerProfile | null> {
  const token = getCustomerToken();
  if (!token) return null;
  try {
    const res = await customerFetch('/api/auth/me');
    if (!res.ok) {
      clearCustomerToken();
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function loginCustomer(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function registerCustomer(data: { email: string; password: string; name: string; phone?: string }) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function verifyCustomerOtp(email: string, code: string, purpose = 'register') {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, purpose }),
  });
  const data = await res.json();
  if (data.success && data.token) {
    setCustomerToken(data.token);
  }
  return data;
}

export async function resendOtp(email: string, purpose = 'register') {
  const res = await fetch('/api/auth/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, purpose }),
  });
  return res.json();
}

export function logoutCustomer(): void {
  clearCustomerToken();
}

export function submitPaymentForm(checkoutUrl: string, formFields: Record<string, string>): void {
  if (!formFields || Object.keys(formFields).length === 0) {
    window.location.href = checkoutUrl;
    return;
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkoutUrl;
  Object.entries(formFields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

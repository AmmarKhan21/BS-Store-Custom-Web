export type Currency = 'PKR' | 'USD';

const STORAGE_KEY = 'bismillah_currency';
const COUNTRY_KEY = 'bismillah_country';

export function getStoredCurrency(): Currency | null {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'PKR' || v === 'USD' ? v : null;
}

export function setStoredCurrency(currency: Currency): void {
  localStorage.setItem(STORAGE_KEY, currency);
}

export function getStoredCountry(): string | null {
  return localStorage.getItem(COUNTRY_KEY);
}

export function setStoredCountry(country: string): void {
  localStorage.setItem(COUNTRY_KEY, country);
}

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'PKR') {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === 'PKR' ? 'Rs.' : '$';
}

export async function detectRegion(): Promise<{ country: string; currency: Currency; exchangeRate: number }> {
  const stored = getStoredCurrency();
  if (stored) {
    const res = await fetch('/api/region');
    const data = await res.json();
    return { country: getStoredCountry() || data.country, currency: stored, exchangeRate: data.exchangeRate };
  }

  try {
    const res = await fetch('/api/region');
    const data = await res.json();
    const currency = data.currency as Currency;
    setStoredCurrency(currency);
    setStoredCountry(data.country);
    return { country: data.country, currency, exchangeRate: data.exchangeRate };
  } catch {
    const fallback: Currency = Intl.DateTimeFormat().resolvedOptions().timeZone?.includes('Karachi') ? 'PKR' : 'USD';
    return { country: fallback === 'PKR' ? 'PK' : 'US', currency: fallback, exchangeRate: 280 };
  }
}

export function convertFromUsd(usd: number, currency: Currency, rate: number): number {
  if (currency === 'PKR') return Math.round(usd * rate);
  return Math.round(usd * 100) / 100;
}

export function getDeliveryCharge(subtotal: number, currency: Currency): number {
  const threshold = currency === 'PKR' ? 28000 : 100;
  const charge = currency === 'PKR' ? 1400 : 5;
  return subtotal >= threshold ? 0 : charge;
}

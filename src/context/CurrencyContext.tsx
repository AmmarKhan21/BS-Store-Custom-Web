import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Currency, detectRegion, setStoredCurrency, convertFromUsd } from '../lib/currency';

interface CurrencyContextType {
  currency: Currency;
  country: string;
  exchangeRate: number;
  setCurrency: (c: Currency) => void;
  format: (usdPrice: number) => string;
  convert: (usdPrice: number) => number;
  symbol: string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children, autoDetectOnly = false }: { children: ReactNode; autoDetectOnly?: boolean }) {
  const [currency, setCurrencyState] = useState<Currency>('PKR');
  const [country, setCountry] = useState('PK');
  const [exchangeRate, setExchangeRate] = useState(280);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectRegion({ respectStored: !autoDetectOnly }).then((r) => {
      setCurrencyState(r.currency);
      setCountry(r.country);
      setExchangeRate(r.exchangeRate);
      setLoading(false);
    });
  }, [autoDetectOnly]);

  const setCurrency = (c: Currency) => {
    if (autoDetectOnly) return;
    setCurrencyState(c);
    setStoredCurrency(c);
  };

  const convert = (usdPrice: number) => convertFromUsd(usdPrice, currency, exchangeRate);
  const format = (usdPrice: number) => {
    const amount = convert(usdPrice);
    return currency === 'PKR' ? `Rs. ${amount.toLocaleString('en-PK')}` : `$${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        country,
        exchangeRate,
        setCurrency,
        format,
        convert,
        symbol: currency === 'PKR' ? 'Rs.' : '$',
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

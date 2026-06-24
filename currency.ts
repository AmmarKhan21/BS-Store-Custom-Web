export type Currency = "PKR" | "USD";

const PKR_RATE = Number(process.env.PKR_EXCHANGE_RATE || 280);

export function getExchangeRate(): number {
  return PKR_RATE;
}

export function detectCurrencyFromCountry(countryCode?: string): Currency {
  const code = (countryCode || "").toUpperCase();
  return code === "PK" ? "PKR" : "USD";
}

export function convertPrice(usdAmount: number, currency: Currency): number {
  if (currency === "PKR") {
    return Math.round(usdAmount * PKR_RATE);
  }
  return Math.round(usdAmount * 100) / 100;
}

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "PKR") {
    return `Rs. ${amount.toLocaleString("en-PK")}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === "PKR" ? "Rs." : "$";
}

/** Payment gateways in Pakistan require amount in paisa (PKR × 100) */
export function toPaymentAmount(total: number, currency: Currency): number {
  if (currency === "PKR") {
    return Math.round(total * 100);
  }
  return Math.round(total * 100);
}

export function getDeliveryCharge(subtotal: number, currency: Currency): number {
  const threshold = currency === "PKR" ? 28000 : 100;
  const charge = currency === "PKR" ? 1400 : 5;
  return subtotal >= threshold ? 0 : charge;
}

import crypto from "crypto";

const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID || "";
const PASSWORD = process.env.JAZZCASH_PASSWORD || "";
const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT || "";
const SANDBOX = process.env.JAZZCASH_SANDBOX !== "false";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const CHECKOUT_URL = SANDBOX
  ? "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform"
  : "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform";

export function isJazzCashConfigured(): boolean {
  return !!(MERCHANT_ID && PASSWORD && INTEGRITY_SALT);
}

function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function generateSecureHash(fields: Record<string, string>): string {
  const sortedKeys = Object.keys(fields)
    .filter((k) => fields[k] !== "" && fields[k] != null)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const values = sortedKeys.map((k) => fields[k]).join("&");
  const hashString = INTEGRITY_SALT + "&" + values;

  return crypto.createHmac("sha256", INTEGRITY_SALT).update(hashString).digest("hex");
}

export interface JazzCashCheckoutParams {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

export function createJazzCashCheckout(params: JazzCashCheckoutParams): {
  checkoutUrl: string;
  formFields: Record<string, string>;
} {
  if (!isJazzCashConfigured()) {
    const successUrl = `${APP_URL}/order/success?orderId=${params.orderId}&gateway=jazzcash&sandbox=1`;
    return { checkoutUrl: successUrl, formFields: {} };
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + 60 * 60 * 1000);
  const txnRef = params.orderId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);

  const fields: Record<string, string> = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: MERCHANT_ID,
    pp_SubMerchantID: "",
    pp_Password: PASSWORD,
    pp_BankID: "TBANK",
    pp_ProductID: "RETL",
    pp_TxnRefNo: txnRef,
    pp_Amount: String(params.amount),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: formatDateTime(now),
    pp_BillReference: params.orderId,
    pp_Description: params.description.slice(0, 200),
    pp_TxnExpiryDateTime: formatDateTime(expiry),
    pp_ReturnURL: `${APP_URL}/api/payments/jazzcash/callback`,
    pp_SecureHash: "",
    ppmpf_1: params.customerEmail,
    ppmpf_2: params.customerPhone.replace(/\D/g, "").slice(-11),
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  fields.pp_SecureHash = generateSecureHash(fields);

  return { checkoutUrl: CHECKOUT_URL, formFields: fields };
}

export function verifyJazzCashCallback(body: Record<string, string>): boolean {
  if (!INTEGRITY_SALT) return process.env.NODE_ENV !== "production";

  const receivedHash = body.pp_SecureHash || "";
  const fields = { ...body };
  delete fields.pp_SecureHash;

  const expected = generateSecureHash(fields);
  const responseCode = body.pp_ResponseCode || "";

  return receivedHash === expected && (responseCode === "000" || responseCode === "121");
}

import crypto from "crypto";

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "";
const SECURED_KEY = process.env.PAYFAST_SECURED_KEY || "";
const SANDBOX = process.env.PAYFAST_SANDBOX !== "false";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const TOKEN_URL = SANDBOX
  ? "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken"
  : "https://ipg1.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken";

const CHECKOUT_URL = SANDBOX
  ? "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction"
  : "https://ipg1.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";

export function isPayFastConfigured(): boolean {
  return !!(MERCHANT_ID && SECURED_KEY);
}

async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      MERCHANT_ID: MERCHANT_ID,
      SECURED_KEY: SECURED_KEY,
    }),
  });

  if (!res.ok) {
    throw new Error("PayFast token request failed");
  }

  const data = (await res.json()) as { ACCESS_TOKEN?: string; token?: string };
  return data.ACCESS_TOKEN || data.token || "";
}

export interface PayFastCheckoutParams {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

export async function createPayFastCheckout(
  params: PayFastCheckoutParams
): Promise<{ checkoutUrl: string; formFields: Record<string, string> }> {
  if (!isPayFastConfigured()) {
    return createPayFastSandboxMock(params);
  }

  const token = await getAccessToken();
  const basketId = params.orderId;
  const txnAmt = String(params.amount);
  const orderDate = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const signature = crypto
    .createHash("md5")
    .update(`${MERCHANT_ID}:${process.env.PAYFAST_MERCHANT_NAME || "Bismillah Store"}:${txnAmt}:${basketId}`)
    .digest("hex");

  const formFields: Record<string, string> = {
    MERCHANT_ID,
    TOKEN: token,
    BASKET_ID: basketId,
    TXNAMT: txnAmt,
    ORDER_DATE: orderDate,
    SUCCESS_URL: `${APP_URL}/order/success?orderId=${params.orderId}&gateway=payfast`,
    FAILURE_URL: `${APP_URL}/order/failed?orderId=${params.orderId}&gateway=payfast`,
    CHECKOUT_URL: `${APP_URL}/order/failed?orderId=${params.orderId}&gateway=payfast`,
    CUSTOMER_EMAIL_ADDRESS: params.customerEmail,
    CUSTOMER_MOBILE_NO: params.customerPhone.replace(/\D/g, "").slice(-11),
    SIGNATURE: signature,
    CURRENCY_CODE: params.currency === "PKR" ? "PKR" : "USD",
    VERSION: "MERCHANTCART-0.1",
    TXNDESC: params.description.slice(0, 200),
  };

  return { checkoutUrl: CHECKOUT_URL, formFields };
}

function createPayFastSandboxMock(params: PayFastCheckoutParams) {
  const successUrl = `${APP_URL}/order/success?orderId=${params.orderId}&gateway=payfast&sandbox=1`;
  return {
    checkoutUrl: successUrl,
    formFields: {} as Record<string, string>,
  };
}

export function verifyPayFastCallback(body: Record<string, string>): boolean {
  if (!SECURED_KEY) return process.env.NODE_ENV !== "production";
  const errCode = body.err_code || body.ERR_CODE || "";
  return errCode === "000" || errCode === "00";
}

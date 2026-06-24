import crypto from "crypto";

const CUSTOMER_SESSION_SECRET =
  process.env.CUSTOMER_SESSION_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  "customer-session-secret-change-me";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createCustomerSessionToken(customerId: string): string {
  const payload = {
    role: "customer",
    customerId,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", CUSTOMER_SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifyCustomerSessionToken(
  token: string | undefined
): { valid: boolean; customerId?: string } {
  if (!token) return { valid: false };

  const [data, signature] = token.split(".");
  if (!data || !signature) return { valid: false };

  const expected = crypto
    .createHmac("sha256", CUSTOMER_SESSION_SECRET)
    .update(data)
    .digest("base64url");

  if (signature !== expected) return { valid: false };

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    ) as { role?: string; customerId?: string; exp?: number };

    if (
      payload.role !== "customer" ||
      !payload.customerId ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return { valid: false };
    }

    return { valid: true, customerId: payload.customerId };
  } catch {
    return { valid: false };
  }
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

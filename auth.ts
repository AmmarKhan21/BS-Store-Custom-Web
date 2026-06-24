import crypto from "crypto";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "bismillah-admin-change-me";
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || ADMIN_PASSWORD + "-session";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function verifyCredentials(
  username: string,
  password: string
): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createSessionToken(): string {
  const payload = {
    role: "admin",
    exp: Date.now() + SESSION_TTL_MS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const [data, signature] = token.split(".");
  if (!data || !signature) return false;

  const expected = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");

  if (signature !== expected) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    ) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function extractToken(
  authHeader: string | undefined,
  customHeader: string | string[] | undefined
): string | undefined {
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  if (typeof customHeader === "string") {
    return customHeader;
  }
  return undefined;
}

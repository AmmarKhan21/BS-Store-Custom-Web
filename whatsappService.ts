const WHATSAPP_ADMIN_PHONE = process.env.WHATSAPP_ADMIN_PHONE || "";
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || "";
const WHATSAPP_CLOUD_TOKEN = process.env.WHATSAPP_CLOUD_TOKEN || "";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WHATSAPP_ORDER_TEMPLATE = process.env.WHATSAPP_ORDER_TEMPLATE || "order_confirmation";
const WHATSAPP_SHIPPED_TEMPLATE = process.env.WHATSAPP_SHIPPED_TEMPLATE || "order_shipped";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export type OrderWhatsAppPayload = {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  total: number;
  currency: string;
  paymentMethod: string;
  items: { productName: string; quantity: number }[];
  trackingNumber?: string;
};

/** Normalize Pakistani/local numbers to international digits (e.g. 0321… → 92321…) */
export function normalizePhone(phone: string, defaultCountryCode = "92"): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = defaultCountryCode + digits.slice(1);
  if (!digits.startsWith(defaultCountryCode) && digits.length === 10) {
    digits = defaultCountryCode + digits;
  }
  return digits;
}

function formatMoney(total: number, currency: string): string {
  const symbol = currency === "PKR" ? "Rs." : "$";
  return currency === "PKR"
    ? `${symbol} ${total.toLocaleString("en-PK")}`
    : `${symbol}${total.toFixed(2)}`;
}

function formatItems(items: { productName: string; quantity: number }[]): string {
  return items.map((i) => `${i.productName} x${i.quantity}`).join(", ");
}

function buildAdminMessage(order: OrderWhatsAppPayload): string {
  return [
    "🛒 *New order — Bismillah Store*",
    "",
    `Order: *${order.id}*`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `City: ${order.city}`,
    `Items: ${formatItems(order.items)}`,
    `Total: ${formatMoney(order.total, order.currency)}`,
    `Payment: ${order.paymentMethod}`,
    "",
    `Admin: ${APP_URL}/admin`,
  ].join("\n");
}

function buildCustomerConfirmationMessage(order: OrderWhatsAppPayload): string {
  return [
    `Assalam o Alaikum ${order.customerName}! 👋`,
    "",
    "Thank you for shopping at *Bismillah Cotton & Sports Hub*.",
    "",
    `✅ Your order *${order.id}* is confirmed.`,
    "",
    `📦 Items: ${formatItems(order.items)}`,
    `💰 Total: ${formatMoney(order.total, order.currency)}`,
    `💳 Payment: ${order.paymentMethod}`,
    `📍 Delivery: ${order.city}`,
    "",
    "We'll message you when your order ships. JazakAllah!",
    "",
    `Track orders: ${APP_URL}/account`,
  ].join("\n");
}

function buildCustomerShippedMessage(order: OrderWhatsAppPayload): string {
  return [
    `Assalam o Alaikum ${order.customerName}!`,
    "",
    `🚚 Your order *${order.id}* has been shipped.`,
    order.trackingNumber ? `Tracking: *${order.trackingNumber}*` : "",
    "",
    `Items: ${formatItems(order.items)}`,
    "",
    "Thank you for shopping with Bismillah Store!",
    `${APP_URL}/account/orders/${order.id}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendViaCallMeBot(phone: string, message: string): Promise<boolean> {
  if (!CALLMEBOT_API_KEY || !phone) return false;
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("CallMeBot failed:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.warn("CallMeBot error:", err);
    return false;
  }
}

/** Meta WhatsApp Cloud API — works for any customer phone (needs Business API + approved template) */
async function sendViaMetaCloud(
  phone: string,
  templateName: string,
  bodyParams: string[]
): Promise<boolean> {
  if (!WHATSAPP_CLOUD_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) return false;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_CLOUD_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: bodyParams.map((text) => ({ type: "text", text: text.slice(0, 1024) })),
              },
            ],
          },
        }),
      }
    );
    if (!res.ok) {
      console.warn("Meta WhatsApp API failed:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Meta WhatsApp error:", err);
    return false;
  }
}

async function sendWhatsAppToPhone(phone: string, message: string): Promise<boolean> {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;

  // CallMeBot only delivers to the phone you registered — use for admin
  const adminNormalized = WHATSAPP_ADMIN_PHONE ? normalizePhone(WHATSAPP_ADMIN_PHONE) : "";
  if (CALLMEBOT_API_KEY && normalized === adminNormalized) {
    if (await sendViaCallMeBot(normalized, message)) {
      console.log(`📱 WhatsApp sent to ${normalized} via CallMeBot`);
      return true;
    }
  }

  // Meta Cloud API — plain text (only works inside 24h reply window; templates preferred)
  if (WHATSAPP_CLOUD_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_CLOUD_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: normalized,
            type: "text",
            text: { body: message },
          }),
        }
      );
      if (res.ok) {
        console.log(`📱 WhatsApp sent to ${normalized} via Meta Cloud API`);
        return true;
      }
      const errText = await res.text();
      console.warn(`Meta text message to ${normalized} failed (use templates for new customers):`, errText);
    } catch (err) {
      console.warn("Meta WhatsApp text error:", err);
    }
  }

  const waLink = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  console.log(`\n📱 WhatsApp (manual link) → ${normalized}:\n${waLink}\n`);
  return false;
}

async function sendCustomerOrderViaTemplate(order: OrderWhatsAppPayload): Promise<boolean> {
  const phone = normalizePhone(order.customerPhone);
  if (!phone || !WHATSAPP_CLOUD_TOKEN) return false;

  return sendViaMetaCloud(phone, WHATSAPP_ORDER_TEMPLATE, [
    order.customerName,
    order.id,
    formatItems(order.items),
    formatMoney(order.total, order.currency),
  ]);
}

async function sendCustomerShippedViaTemplate(order: OrderWhatsAppPayload): Promise<boolean> {
  const phone = normalizePhone(order.customerPhone);
  if (!phone || !WHATSAPP_CLOUD_TOKEN) return false;

  return sendViaMetaCloud(phone, WHATSAPP_SHIPPED_TEMPLATE, [
    order.customerName,
    order.id,
    order.trackingNumber || "—",
  ]);
}

/** Notify admin: new order received */
export async function sendWhatsAppAdminNewOrder(order: OrderWhatsAppPayload): Promise<void> {
  const message = buildAdminMessage(order);
  const adminPhone = WHATSAPP_ADMIN_PHONE ? normalizePhone(WHATSAPP_ADMIN_PHONE) : "";

  if (!adminPhone) {
    console.log("📱 Admin WhatsApp skipped — set WHATSAPP_ADMIN_PHONE in .env");
    return;
  }

  let sent = false;
  if (CALLMEBOT_API_KEY) {
    sent = await sendViaCallMeBot(adminPhone, message);
    if (sent) console.log("📱 Admin notified on WhatsApp (CallMeBot)");
  }

  if (!sent) {
    sent = await sendWhatsAppToPhone(adminPhone, message);
  }

  if (!sent && adminPhone) {
    console.log(`📱 Admin WhatsApp link logged above for ${adminPhone}`);
  }
}

/** Notify customer: order confirmed */
export async function sendWhatsAppCustomerOrderConfirmation(order: OrderWhatsAppPayload): Promise<void> {
  const phone = normalizePhone(order.customerPhone);
  if (!phone) {
    console.log("📱 Customer WhatsApp skipped — no phone on order");
    return;
  }

  const message = buildCustomerConfirmationMessage(order);
  let sent = false;

  if (WHATSAPP_CLOUD_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
    sent = await sendCustomerOrderViaTemplate(order);
    if (sent) {
      console.log(`📱 Customer ${phone} notified — order confirmation (Meta template)`);
      return;
    }
  }

  sent = await sendWhatsAppToPhone(phone, message);
  if (sent) {
    console.log(`📱 Customer ${phone} notified — order confirmation`);
  }
}

/** Notify customer: order shipped with tracking */
export async function sendWhatsAppCustomerShipped(order: OrderWhatsAppPayload): Promise<void> {
  const phone = normalizePhone(order.customerPhone);
  if (!phone) return;

  const message = buildCustomerShippedMessage(order);
  let sent = false;

  if (WHATSAPP_CLOUD_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
    sent = await sendCustomerShippedViaTemplate(order);
    if (sent) {
      console.log(`📱 Customer ${phone} notified — shipped (Meta template)`);
      return;
    }
  }

  await sendWhatsAppToPhone(phone, message);
}

/** Send both admin + customer WhatsApp on new order */
export async function sendWhatsAppOrderAlert(order: OrderWhatsAppPayload): Promise<void> {
  await Promise.all([
    sendWhatsAppAdminNewOrder(order),
    sendWhatsAppCustomerOrderConfirmation(order),
  ]);
}

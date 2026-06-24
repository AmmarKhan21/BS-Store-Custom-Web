import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || "noreply@bismillahstore.pk";
const ADMIN_ORDER_EMAIL = process.env.ADMIN_ORDER_EMAIL || SMTP_USER || "";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    console.log("\n📧 EMAIL (dev mode — configure SMTP_USER/SMTP_PASS to send real emails)");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body preview: ${html.replace(/<[^>]+>/g, " ").slice(0, 200)}...\n`);
    return true;
  }

  try {
    await transport.sendMail({ from: FROM_EMAIL, to, subject, html });
    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}

export async function sendOtpEmail(email: string, code: string, purpose: string): Promise<boolean> {
  const subject =
    purpose === "register"
      ? "Verify your Bismillah Store account"
      : "Your Bismillah Store login code";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#4f46e5;margin:0 0 8px">Bismillah Cotton & Sports Hub</h2>
      <p style="color:#64748b;margin:0 0 24px">Your verification code</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#0f172a">${code}</span>
      </div>
      <p style="color:#64748b;font-size:14px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

export async function sendOrderConfirmationEmail(
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    items: any[];
    subtotal: number;
    discount: number;
    total: number;
    currency: string;
    paymentMethod: string;
    paymentStatus: string;
  }
): Promise<boolean> {
  const symbol = order.currency === "PKR" ? "Rs." : "$";
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">${i.productName} × ${i.quantity}</td>
         <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">${symbol}${(i.price * i.quantity).toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#4f46e5">Order Confirmed!</h2>
      <p>Hi ${order.customerName}, thank you for shopping with Bismillah Cotton & Sports Hub.</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod} — ${order.paymentStatus}</p>
      <table style="width:100%;margin:16px 0">${itemsHtml}</table>
      <p>Subtotal: ${symbol}${order.subtotal.toFixed(2)}</p>
      ${order.discount > 0 ? `<p>Discount: -${symbol}${order.discount.toFixed(2)}</p>` : ""}
      <p style="font-size:18px;font-weight:bold">Total: ${symbol}${order.total.toFixed(2)}</p>
      <p style="color:#64748b;font-size:14px">We'll notify you when your order ships.</p>
    </div>
  `;

  return sendEmail(order.customerEmail, `Order ${order.id} confirmed`, html);
}

export async function sendAdminNewOrderEmail(
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    city: string;
    total: number;
    currency: string;
    paymentMethod: string;
  }
): Promise<boolean> {
  if (!ADMIN_ORDER_EMAIL) {
    console.log(`📧 Admin notification skipped — set ADMIN_ORDER_EMAIL in .env`);
    return false;
  }

  const symbol = order.currency === "PKR" ? "Rs." : "$";
  const html = `
    <div style="font-family:sans-serif;padding:24px">
      <h2>New Order: ${order.id}</h2>
      <p><strong>Customer:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.customerEmail}</p>
      <p><strong>Phone:</strong> ${order.customerPhone}</p>
      <p><strong>City:</strong> ${order.city}</p>
      <p><strong>Total:</strong> ${symbol}${order.total.toFixed(2)}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod}</p>
    </div>
  `;

  return sendEmail(ADMIN_ORDER_EMAIL, `New order ${order.id}`, html);
}

export async function sendOrderShippedEmail(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string;
  currency?: string;
}): Promise<boolean> {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#4f46e5">Your order has shipped!</h2>
      <p>Hi ${order.customerName}, great news — your order <strong>${order.id}</strong> is on its way.</p>
      ${order.trackingNumber ? `<p><strong>Tracking number:</strong> ${order.trackingNumber}</p>` : ""}
      <p style="color:#64748b;font-size:14px">Thank you for shopping with Bismillah Cotton & Sports Hub.</p>
    </div>
  `;
  return sendEmail(order.customerEmail, `Order ${order.id} shipped`, html);
}

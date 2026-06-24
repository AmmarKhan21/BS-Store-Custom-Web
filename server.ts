import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import {
  isSupabaseAvailable,
  initializeDatabase,
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  addReview,
  addOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  getCoupons,
  addCoupon,
  deleteCoupon,
  getStats
} from "./dbService";
import {
  verifyCredentials,
  createSessionToken,
  verifySessionToken,
  extractToken
} from "./auth";
import {
  createCustomerSessionToken,
  verifyCustomerSessionToken
} from "./customerAuth";
import {
  seedCategoriesIfEmpty,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  createCustomer,
  getCustomerByEmail,
  getCustomerById,
  verifyCustomerPassword,
  markCustomerVerified,
  saveOtp,
  verifyOtp,
  getCustomerOrders,
  getOrderById,
  confirmOrderPayment,
  getAllCustomersAdmin,
  getCustomerOrderById
} from "./customerDb";
import {
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendAdminNewOrderEmail,
  sendOrderShippedEmail
} from "./emailService";
import { sendWhatsAppOrderAlert, sendWhatsAppCustomerShipped } from "./whatsappService";
import {
  detectCurrencyFromCountry,
  convertPrice,
  getExchangeRate,
  toPaymentAmount,
  getDeliveryCharge
} from "./currency";
import { createPayFastCheckout, verifyPayFastCallback } from "./payments/payfast";
import { createJazzCashCheckout, verifyJazzCashCallback } from "./payments/jazzcash";

const app = express();
const PORT = 3000;
const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

async function notifyNewOrder(order: any) {
  await sendOrderConfirmationEmail(order);
  await sendAdminNewOrderEmail(order);
  await sendWhatsAppOrderAlert({
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    city: order.city,
    total: order.total,
    currency: order.currency || "PKR",
    paymentMethod: order.paymentMethod,
    items: order.items,
  });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

// Initialize SQL databases on server startup (Prisma or SQLite Fallback)
initializeDatabase();
seedCategoriesIfEmpty();

const requireCustomer = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = extractToken(req.headers.authorization, req.headers["x-customer-token"]);
  const result = verifyCustomerSessionToken(token);
  if (!result.valid || !result.customerId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as any).customerId = result.customerId;
  next();
};

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = extractToken(
    req.headers.authorization,
    req.headers["x-admin-token"]
  );
  if (!verifySessionToken(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

/* --- ADMIN AUTH ENDPOINTS --- */

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body ?? {};
  if (!verifyCredentials(username, password)) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }
  const token = createSessionToken();
  res.json({ success: true, token });
});

app.get("/api/admin/me", requireAdmin, (_req, res) => {
  res.json({ success: true, role: "admin" });
});

app.post("/api/admin/logout", (_req, res) => {
  res.json({ success: true });
});

/* --- REGION & CURRENCY --- */

app.get("/api/region", (req, res) => {
  const country =
    (req.headers["cf-ipcountry"] as string) ||
    (req.query.country as string) ||
    "PK";
  const currency = detectCurrencyFromCountry(country);
  res.json({
    country: country.toUpperCase(),
    currency,
    exchangeRate: getExchangeRate(),
  });
});

/* --- CATEGORIES --- */

app.get("/api/categories", async (_req, res) => {
  try {
    res.json(await getAllCategories());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/categories", requireAdmin, async (req, res) => {
  try {
    const cat = await addCategory(req.body.name, req.body.image);
    res.status(201).json({ success: true, category: cat });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/categories/:id", requireAdmin, async (req, res) => {
  try {
    const cat = await updateCategory(req.params.id, req.body.name);
    res.json({ success: true, category: cat });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* --- CUSTOMER AUTH --- */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body ?? {};
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    await createCustomer(email, password, name, phone);
    const code = await saveOtp(email, "register");
    await sendOtpEmail(email, code, "register");

    res.json({ success: true, message: "Account created. Check your email for verification code." });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, code, purpose } = req.body ?? {};
    const valid = await verifyOtp(email, code, purpose || "register");
    if (!valid) {
      return res.status(400).json({ success: false, error: "Invalid or expired code" });
    }

    if ((purpose || "register") === "register") {
      await markCustomerVerified(email);
    }

    const customer = await getCustomerByEmail(email);
    if (!customer) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    const token = createCustomerSessionToken(customer.id);
    res.json({
      success: true,
      token,
      customer: { id: customer.id, email: customer.email, name: customer.name, phone: customer.phone },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/resend-otp", async (req, res) => {
  try {
    const { email, purpose } = req.body ?? {};
    const customer = await getCustomerByEmail(email);
    if (!customer) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }
    const code = await saveOtp(email, purpose || "register");
    await sendOtpEmail(email, code, purpose || "register");
    res.json({ success: true, message: "Verification code sent" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const customer = await verifyCustomerPassword(email, password);
    if (!customer) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }
    if (!customer.isVerified) {
      const code = await saveOtp(email, "login");
      await sendOtpEmail(email, code, "login");
      return res.json({ success: false, requiresOtp: true, message: "Please verify with the code sent to your email" });
    }

    const token = createCustomerSessionToken(customer.id);
    res.json({
      success: true,
      token,
      customer: { id: customer.id, email: customer.email, name: customer.name, phone: customer.phone },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/auth/me", requireCustomer, async (req, res) => {
  try {
    const customer = await getCustomerById((req as any).customerId);
    if (!customer) return res.status(404).json({ error: "Not found" });
    res.json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/account/orders", requireCustomer, async (req, res) => {
  try {
    const orders = await getCustomerOrders((req as any).customerId);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/account/orders/:id", requireCustomer, async (req, res) => {
  try {
    const customer = await getCustomerById((req as any).customerId);
    if (!customer) return res.status(404).json({ error: "Not found" });
    const order = await getCustomerOrderById(customer.id, customer.email, req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* --- ADMIN CUSTOMERS & UPLOAD --- */

app.get("/api/admin/customers", requireAdmin, async (_req, res) => {
  try {
    res.json(await getAllCustomersAdmin());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/upload", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }
  const base = process.env.APP_URL || `http://localhost:${PORT}`;
  res.json({ success: true, url: `${base}/uploads/${req.file.filename}` });
});

app.put("/api/orders/:id/tracking", requireAdmin, async (req, res) => {
  try {
    const { trackingNumber } = req.body ?? {};
    await updateOrderTracking(req.params.id, trackingNumber || "");
    const order = await getOrderById(req.params.id);
    if (order?.trackingNumber && order.customerEmail) {
      await sendOrderShippedEmail(order);
      await sendWhatsAppCustomerShipped({
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        city: order.city,
        total: order.total,
        currency: order.currency || "PKR",
        paymentMethod: order.paymentMethod,
        items: order.items,
        trackingNumber: order.trackingNumber,
      });
    }
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* --- PAYMENTS --- */

app.post("/api/payments/payfast/callback", async (req, res) => {
  try {
    const body = req.body ?? {};
    const orderId = body.basket_id || body.BASKET_ID || req.query.orderId;
    if (verifyPayFastCallback(body) && orderId) {
      await confirmOrderPayment(String(orderId), body.transaction_id || body.TXN_ID);
      const order = await getOrderById(String(orderId));
      if (order) {
        await notifyNewOrder(order);
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/payments/jazzcash/callback", async (req, res) => {
  try {
    const body = { ...req.body, ...req.query } as Record<string, string>;
    const orderId = body.pp_BillReference;
    if (verifyJazzCashCallback(body) && orderId) {
      await confirmOrderPayment(orderId, body.pp_TxnRefNo);
      const order = await getOrderById(orderId);
      if (order) {
        await notifyNewOrder(order);
      }
      return res.redirect(`${process.env.APP_URL || "http://localhost:3000"}/order/success?orderId=${orderId}&gateway=jazzcash`);
    }
    return res.redirect(`${process.env.APP_URL || "http://localhost:3000"}/order/failed?orderId=${orderId || ""}&gateway=jazzcash`);
  } catch {
    return res.redirect(`${process.env.APP_URL || "http://localhost:3000"}/order/failed?gateway=jazzcash`);
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders/:id/confirm-payment", async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.paymentStatus !== "Paid") {
      await confirmOrderPayment(req.params.id, req.body?.paymentRef || "confirmed");
      const updated = await getOrderById(req.params.id);
      if (updated) {
        await notifyNewOrder(updated);
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* --- DATABASE BACKEND ENDPOINTS --- */

// GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const productsList = await getAllProducts(
      category as string,
      search as string,
      sort as string
    );
    // console.log("productsList",productsList)
    res.json(productsList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE PRODUCT WITH SPECIFIC REVIEWS
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProduct(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADD NEW PRODUCT FROM THE ADMIN CONSOLE
app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const newProd = await addProduct(req.body);
    res.status(201).json({ ...newProd, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PRODUCT IN DATABASE
app.put("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await updateProduct(id, req.body);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE PRODUCT FROM DATABASE
app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SUBMIT NEW PRODUCT REVIEW WITH RECALCULATED AVERAGE RATING
app.post("/api/products/:id/reviews", async (req, res) => {
  try {
    const productId = req.params.id;
    const review = await addReview(productId, req.body);
    res.json({ success: true, review });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PLACE NEW ORDER - WITH STOCK ADJUSTMENT RELATIONS
app.post("/api/orders", async (req, res) => {
  try {
    const body = req.body ?? {};
    const customerToken = extractToken(req.headers.authorization, undefined);
    const customerSession = verifyCustomerSessionToken(customerToken);

    const result = await addOrder({
      ...body,
      customerId: customerSession.valid ? customerSession.customerId : body.customerId || null,
    });

    const order = await getOrderById(result.id);
    const isOnline = body.paymentMethod === "PAYFAST" || body.paymentMethod === "JAZZCASH";

    if (isOnline && order) {
      const paymentAmount = toPaymentAmount(order.total, order.currency || "PKR");
      const checkoutParams = {
        orderId: order.id,
        amount: paymentAmount,
        currency: order.currency || "PKR",
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        description: `Order ${order.id}`,
      };

      if (body.paymentMethod === "PAYFAST") {
        const checkout = await createPayFastCheckout(checkoutParams);
        return res.status(201).json({
          success: true,
          orderId: result.id,
          total: result.total,
          currency: result.currency,
          requiresPayment: true,
          paymentMethod: "PAYFAST",
          checkoutUrl: checkout.checkoutUrl,
          formFields: checkout.formFields,
        });
      }

      if (body.paymentMethod === "JAZZCASH") {
        const checkout = createJazzCashCheckout(checkoutParams);
        return res.status(201).json({
          success: true,
          orderId: result.id,
          total: result.total,
          currency: result.currency,
          requiresPayment: true,
          paymentMethod: "JAZZCASH",
          checkoutUrl: checkout.checkoutUrl,
          formFields: checkout.formFields,
        });
      }
    }

    if (order) {
      await notifyNewOrder(order);
    }

    res.status(201).json({ success: true, orderId: result.id, total: result.total, currency: result.currency });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ORDERS FOR MERCHANDISE DASHBOARD
app.get("/api/orders", requireAdmin, async (req, res) => {
  try {
    const ordersList = await getAllOrders();
    res.json(ordersList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ORDER STATUS
app.put("/api/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    await updateOrderStatus(id, status, paymentStatus);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET ACTIVE PROMO COUPONS
app.get("/api/coupons", async (req, res) => {
  try {
    const couponsList = await getCoupons();
    res.json(couponsList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE PROMO COUPON FROM ADMIN TERMINAL
app.post("/api/coupons", requireAdmin, async (req, res) => {
  try {
    const codeObj = await addCoupon(req.body);
    res.json({ success: true, code: codeObj.code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DEACTIVATE PROMO COUPON FROM ADMIN TERMINAL
app.delete("/api/coupons/:code", requireAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    await deleteCoupon(code);
    res.json({ success: true, code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADVANCED METRIC DASHBOARD STATS GENERATION VIA AGGREGATES
app.get("/api/stats", requireAdmin, async (req, res) => {
  try {
    const { days, from, to } = req.query;
    const fromStr = typeof from === "string" ? from.trim() : "";
    const toStr = typeof to === "string" ? to.trim() : "";
    const statsObj =
      fromStr && toStr
        ? await getStats({ from: fromStr, to: toStr })
        : await getStats({
            days: (() => {
              const parsed =
                typeof days === "string" && days.trim() !== ""
                  ? parseInt(days, 10)
                  : NaN;
              return !Number.isNaN(parsed) ? parsed : 7;
            })(),
          });
    res.json(statsObj);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* INTEGRATE VITE FOR BROWSER INJECTION */
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite HMR Dev Server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode serving precompiled client...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bismillah E-Commerce database server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Critical server startup failure:", err);
});

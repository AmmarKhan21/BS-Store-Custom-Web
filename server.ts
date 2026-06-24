import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import {
  isSupabaseEnabled,
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
  getCoupons,
  addCoupon,
  deleteCoupon,
  getStats
} from "./dbService";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize SQL databases on server startup (Prisma or SQLite Fallback)
initializeDatabase();

/* --- DATABASE BACKEND ENDPOINTS --- */

// GET ENGINE STATUS (Supabase Prisma vs. JSON-File Sandbox)
app.get("/api/db-status", (req, res) => {
  res.json({
    success: true,
    isSupabaseEnabled: isSupabaseAvailable,
    engine: isSupabaseAvailable ? "Supabase Cloud DB (Prisma)" : "Local JSON-File Sandbox"
  });
});

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
app.post("/api/products", async (req, res) => {
  try {
    const newProd = await addProduct(req.body);
    res.status(201).json({ ...newProd, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PRODUCT IN DATABASE
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await updateProduct(id, req.body);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE PRODUCT FROM DATABASE
app.delete("/api/products/:id", async (req, res) => {
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
    const result = await addOrder(req.body);
    res.status(201).json({ success: true, orderId: result.id, total: result.total });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ORDERS FOR MERCHANDISE DASHBOARD
app.get("/api/orders", async (req, res) => {
  try {
    const ordersList = await getAllOrders();
    res.json(ordersList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ORDER STATUS
app.put("/api/orders/:id/status", async (req, res) => {
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
app.post("/api/coupons", async (req, res) => {
  try {
    const codeObj = await addCoupon(req.body);
    res.json({ success: true, code: codeObj.code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DEACTIVATE PROMO COUPON FROM ADMIN TERMINAL
app.delete("/api/coupons/:code", async (req, res) => {
  try {
    const { code } = req.params;
    await deleteCoupon(code);
    res.json({ success: true, code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADVANCED METRIC DASHBOARD STATS GENERATION VIA AGGREGATES
app.get("/api/stats", async (req, res) => {
  try {
    const statsObj = await getStats();
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


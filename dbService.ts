import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Detect if Supabase is requested / configured via environment variable
export const isSupabaseEnabled = !!process.env.DATABASE_URL;
export let isSupabaseAvailable = isSupabaseEnabled;

let prismaClient: PrismaClient | null = null;

// Initialize Prisma Client lazily to prevent crashing if database is offline or not configured yet
export function getPrisma(): PrismaClient {
  if (!isSupabaseEnabled) {
    throw new Error("Supabase is not configured. DATABASE_URL is missing.");
  }
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prismaClient;
}

// Local JSON Database Fallback
const dbPath = path.resolve(process.cwd(), "database.json");

interface LocalDbSchema {
  products: any[];
  reviews: any[];
  orders: any[];
  coupons: any[];
}

// Helper to read JSON DB synchronously
function readJsonDb(): LocalDbSchema {
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Local JSON Database Read Error:", err);
  }
  return { products: [], reviews: [], orders: [], coupons: [] };
}

// Helper to write JSON DB synchronously
function writeJsonDb(data: LocalDbSchema) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Local JSON Database Write Error:", err);
  }
}

// Seed data array to initialize empty databases with beautiful products
const seedProducts = [
  {
    id: 'prod-1',
    name: 'Bismillah Premium Royal Cotton Unstitched Suit',
    description: 'Experience pure luxury with our signature 100% fine Egyptian cotton fabric. Breathable, comfortable, and perfect for elegant traditional wear. Known for rich texture and high color-retention capabilities.',
    price: 35,
    originalPrice: 49,
    category: 'Cotton Collection',
    images: [
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=700&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=700&auto=format&fit=crop'
    ],
    sizes: ['4 Meters', '4.5 Meters', '5 Meters'],
    colors: ['#EDEAE0', '#000080', '#0B132B', '#E5D3B3'],
    rating: 4.8,
    stock: 45,
    isFeatured: 1,
    dateAdded: '2026-06-01',
    reviews: [
      { id: 'rev-1', reviewerName: 'Hassan Ali', rating: 5, comment: 'Exceptional quality. Soft, cool fabric ideal for hot summers.', date: '2026-06-15' },
      { id: 'rev-2', reviewerName: 'Zainab Bibi', rating: 4, comment: 'Nice packaging and original color matches the photos correctly.', date: '2026-06-18' }
    ]
  },
  {
    id: 'prod-2',
    name: 'Classic White Soft Cotton Shalwar Kameez',
    description: 'Beautifully tailored, pre-shrunk, premium soft cotton Shalwar Kameez. Features a classic band collar with minimal modern embroidery on the placket.',
    price: 49,
    originalPrice: 75,
    category: 'Cotton Collection',
    images: [
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=700&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#FFFFFF', '#F2F2F2', '#E1E6E1'],
    rating: 4.9,
    stock: 24,
    isFeatured: 1,
    dateAdded: '2026-05-20',
    reviews: [
      { id: 'rev-3', reviewerName: 'Muhammad Ahmed', rating: 5, comment: 'Fitting was spot-on. Stitching is clean and very robust. Highly recommended!', date: '2026-06-10' }
    ]
  },
  {
    id: 'prod-3',
    name: 'Bismillah Breathable Cotton Polo Tee',
    description: 'A relaxed everyday smart-casual wear polo t-shirt crafted entirely from combed pique cotton. Offers superior thermal dynamics and super soft ribbing on collars and cuffs.',
    price: 18,
    originalPrice: 24,
    category: 'Clothing',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=700&auto=format&fit=crop'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#1A365D', '#E2E8F0', '#2D3748'],
    rating: 4.5,
    stock: 60,
    isFeatured: 0,
    dateAdded: '2026-06-05',
    reviews: [
      { id: 'rev-4', reviewerName: 'Daniyal Khan', rating: 4, comment: 'Very soft, nice regular fit. Comfortable for afternoon strolls.', date: '2026-06-20' }
    ]
  },
  {
    id: 'prod-4',
    name: 'Ultra-Comfort Sweat-Wicking Gym Hoodie',
    description: 'Engineered for high performance, this light-weight stretch athletic hoodie ensures your muscles stay warm while providing dry-fit airflow properties.',
    price: 29,
    originalPrice: 39,
    category: 'Sports Wear',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=700&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#3F3F46', '#27272A', '#D4D4D8'],
    rating: 4.6,
    stock: 18,
    isFeatured: 1,
    dateAdded: '2026-06-12',
    reviews: [
      { id: 'rev-5', reviewerName: 'Usman Ghani', rating: 5, comment: 'Best hoodies ever. Dries quickly after high-intensity training.', date: '2026-06-08' }
    ]
  },
  {
    id: 'prod-5',
    name: 'Ergonomic Aero-Strike Tennis Racket',
    description: 'Carbon-fiber frame delivering supreme swing weight control, stability, and tennis ball propulsion. Featuring double anti-shock dampening wraps on the handle grip.',
    price: 110,
    originalPrice: 150,
    category: 'Sports Gear',
    images: [
      'https://images.unsplash.com/photo-1617083934335-e10df2e53efb?q=80&w=700&auto=format&fit=crop'
    ],
    sizes: ['Standard grip size 4 3/8', 'Standard grip size 4 1/4'],
    colors: ['#FF4500', '#1E90FF'],
    rating: 4.7,
    stock: 12,
    isFeatured: 1,
    dateAdded: '2026-05-18',
    reviews: [
      { id: 'rev-6', reviewerName: 'Sajid S.', rating: 5, comment: 'Stiff racket with awesome sweet spot. Highly interactive performance.', date: '2026-06-02' }
    ]
  }
];

const seedCoupons = [
  { code: 'BISMILLAH10', discountType: 'percentage', value: 10, minPurchase: 20, isActive: 1 },
  { code: 'COTTONSUPREME', discountType: 'fixed', value: 15, minPurchase: 50, isActive: 1 },
  { code: 'SPORTSFREE', discountType: 'percentage', value: 15, minPurchase: 0, isActive: 1 },
  { code: 'SAVE100', discountType: 'fixed', value: 100, minPurchase: 250, isActive: 1 }
];

const seedOrders = [
  {
    id: 'ORD-8942',
    customerName: 'Ammar Younas',
    customerEmail: 'ammar.younas@xcorebit.com',
    customerPhone: '+92 301 2345678',
    shippingAddress: 'DHA Phase 6, Block C',
    city: 'Lahore',
    postalCode: '54000',
    items: [
      {
        productId: 'prod-1',
        productName: 'Bismillah Premium Royal Cotton Unstitched Suit',
        price: 35,
        quantity: 2,
        selectedSize: '4.5 Meters',
        selectedColor: '#EDEAE0',
        image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=700&auto=format&fit=crop'
      }
    ],
    subtotal: 70,
    discount: 7,
    total: 63,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    status: 'Processing',
    date: '2026-06-21T14:30:00Z',
    notes: 'Please double-check the packing. Gift wrapping requested.'
  }
];

// Initialize and Seed Databases dynamically on server startup
export async function initializeDatabase() {
  if (isSupabaseEnabled) {
    console.log("Supabase Connection String detected! Bootstrapping Prisma Engine...");
    try {
      const prisma = getPrisma();
      
      // Perform dynamic count to check if we should seed the remote Postgres instance
      const productCount = await prisma.product.count();
      if (productCount === 0) {
        console.log("Supabase database is empty. Seeding Bismillah assets via Prisma...");
        for (const p of seedProducts) {
          await prisma.product.create({
            data: {
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              originalPrice: p.originalPrice,
              category: p.category,
              images: JSON.stringify(p.images),
              sizes: JSON.stringify(p.sizes),
              colors: JSON.stringify(p.colors),
              rating: p.rating,
              stock: p.stock,
              isFeatured: p.isFeatured,
              dateAdded: p.dateAdded,
            }
          });

          for (const r of p.reviews) {
            await prisma.review.create({
              data: {
                id: r.id,
                productId: p.id,
                reviewerName: r.reviewerName,
                rating: r.rating,
                comment: r.comment,
                date: r.date
              }
            });
          }
        }

        for (const c of seedCoupons) {
          await prisma.coupon.create({
            data: {
              code: c.code,
              discountType: c.discountType,
              value: c.value,
              minPurchase: c.minPurchase,
              isActive: c.isActive
            }
          });
        }

        for (const o of seedOrders) {
          await prisma.order.create({
            data: {
              id: o.id,
              customerName: o.customerName,
              customerEmail: o.customerEmail,
              customerPhone: o.customerPhone,
              shippingAddress: o.shippingAddress,
              city: o.city,
              postalCode: o.postalCode,
              items: JSON.stringify(o.items),
              subtotal: o.subtotal,
              discount: o.discount,
              total: o.total,
              paymentMethod: o.paymentMethod,
              paymentStatus: o.paymentStatus,
              status: o.status,
              date: o.date,
              notes: o.notes
            }
          });
        }
        console.log("Supabase database seeding completed successfully.");
      } else {
        console.log("Supabase tables already initialized. Seeding bypassed.");
      }
    } catch (err: any) {
      console.error("CRITICAL: Failed to initialize Supabase schema. Make sure to run 'npm run db:push' first. Error:", err.message);
      isSupabaseAvailable = false;
    }
  } else {
    console.log("No DATABASE_URL found. Initializing Local JSON database...");
    
    // Check if the JSON DB already exists
    if (!fs.existsSync(dbPath)) {
      console.log("Local JSON database is empty. Seeding local records...");
      
      const seededProductsList: any[] = [];
      const seededReviewsList: any[] = [];
      
      seedProducts.forEach((p) => {
        // Flatten seed reviews list
        p.reviews.forEach((r) => {
          seededReviewsList.push({
            id: r.id,
            productId: p.id,
            reviewerName: r.reviewerName,
            rating: r.rating,
            comment: r.comment,
            date: r.date
          });
        });

        seededProductsList.push({
          id: p.id,
          name: p.name,
          description: p.description || null,
          price: p.price,
          originalPrice: p.originalPrice || null,
          category: p.category,
          images: JSON.stringify(p.images),
          sizes: JSON.stringify(p.sizes),
          colors: JSON.stringify(p.colors),
          rating: p.rating,
          stock: p.stock,
          isFeatured: p.isFeatured,
          dateAdded: p.dateAdded
        });
      });

      const seededCouponsList = seedCoupons.map(c => ({
        code: c.code,
        discountType: c.discountType,
        value: c.value,
        minPurchase: c.minPurchase,
        isActive: c.isActive
      }));

      const seededOrdersList = seedOrders.map(o => ({
        id: o.id,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        shippingAddress: o.shippingAddress,
        city: o.city,
        postalCode: o.postalCode,
        items: JSON.stringify(o.items),
        subtotal: o.subtotal,
        discount: o.discount,
        total: o.total,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        status: o.status,
        date: o.date,
        notes: o.notes
      }));

      writeJsonDb({
        products: seededProductsList,
        reviews: seededReviewsList,
        coupons: seededCouponsList,
        orders: seededOrdersList
      });

      console.log("Local JSON database seeded completed successfully.");
    } else {
      console.log("Local JSON database already exists at:", dbPath);
    }
  }
}

// --- UNIFIED API OPERATIONS FOR EXPRESS ROUTING ---

export async function getAllProducts(category?: string, search?: string, sort?: string): Promise<any[]> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      let whereClause: any = {};
      if (category && category !== "All") {
        whereClause.category = category;
      }
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ];
      }

      const orderByClause: any = {};
      if (sort === "price-low") {
        orderByClause.price = "asc";
      } else if (sort === "price-high") {
        orderByClause.price = "desc";
      } else if (sort === "popular") {
        orderByClause.rating = "desc";
      } else {
        orderByClause.dateAdded = "desc";
      }

      const list = await prisma.product.findMany({
        where: whereClause,
        orderBy: orderByClause,
        include: {
          reviews: true
        }
      });

      return list.map((p) => ({
        ...p,
        images: JSON.parse(p.images || "[]"),
        sizes: JSON.parse(p.sizes || "[]"),
        colors: JSON.parse(p.colors || "[]"),
        isFeatured: p.isFeatured === 1,
      }));
    } catch (err: any) {
      console.error("Prisma getAllProducts failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  let list = [...db.products];

  // Category Filter
  if (category && category !== "All") {
    list = list.filter(p => p.category === category);
  }

  // Search Filter
  if (search) {
    const query = search.toLowerCase();
    list = list.filter(p => 
      (p.name && p.name.toLowerCase().includes(query)) || 
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  // Sort
  if (sort === "price-low") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === "popular") {
    list.sort((a, b) => b.rating - a.rating);
  } else {
    list.sort((a, b) => {
      const dateA = a.dateAdded || "";
      const dateB = b.dateAdded || "";
      return dateB.localeCompare(dateA);
    });
  }

  return list.map(p => {
    const matchingReviews = db.reviews.filter(r => r.productId === p.id);
    return {
      ...p,
      images: JSON.parse(p.images || "[]"),
      sizes: JSON.parse(p.sizes || "[]"),
      colors: JSON.parse(p.colors || "[]"),
      isFeatured: p.isFeatured === 1,
      reviews: matchingReviews
    };
  });
}

export async function getProduct(id: string): Promise<any> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const p = await prisma.product.findUnique({
        where: { id },
        include: { reviews: true }
      });
      if (!p) return null;
      return {
        ...p,
        images: JSON.parse(p.images || "[]"),
        sizes: JSON.parse(p.sizes || "[]"),
        colors: JSON.parse(p.colors || "[]"),
        isFeatured: p.isFeatured === 1
      };
    } catch (err: any) {
      console.error("Prisma getProduct failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  const p = db.products.find(prod => prod.id === id);
  if (!p) return null;
  
  const matchingReviews = db.reviews.filter(r => r.productId === id);
  return {
    ...p,
    images: JSON.parse(p.images || "[]"),
    sizes: JSON.parse(p.sizes || "[]"),
    colors: JSON.parse(p.colors || "[]"),
    isFeatured: p.isFeatured === 1,
    reviews: matchingReviews
  };
}

export async function addProduct(p: any): Promise<any> {
  const id = p.id || "prod-" + Date.now();
  const dateAdded = p.dateAdded || new Date().toISOString().split("T")[0];

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      return await prisma.product.create({
        data: {
          id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          category: p.category,
          images: JSON.stringify(p.images || []),
          sizes: JSON.stringify(p.sizes || []),
          colors: JSON.stringify(p.colors || []),
          rating: 5.0,
          stock: Number(p.stock || 10),
          isFeatured: p.isFeatured ? 1 : 0,
          dateAdded
        }
      });
    } catch (err: any) {
      console.error("Prisma addProduct failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  const newProduct = {
    id,
    name: p.name,
    description: p.description || null,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    category: p.category,
    images: JSON.stringify(p.images || []),
    sizes: JSON.stringify(p.sizes || []),
    colors: JSON.stringify(p.colors || []),
    rating: 5.0,
    stock: Number(p.stock || 10),
    isFeatured: p.isFeatured ? 1 : 0,
    dateAdded
  };

  db.products.push(newProduct);
  writeJsonDb(db);
  return { id, success: true };
}

export async function updateProduct(id: string, p: any): Promise<any> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      return await prisma.product.update({
        where: { id },
        data: {
          name: p.name,
          description: p.description,
          price: Number(p.price),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          category: p.category,
          images: JSON.stringify(p.images || []),
          sizes: JSON.stringify(p.sizes || []),
          colors: JSON.stringify(p.colors || []),
          stock: Number(p.stock),
          isFeatured: p.isFeatured ? 1 : 0
        }
      });
    } catch (err: any) {
      console.error("Prisma updateProduct failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  const idx = db.products.findIndex(prod => prod.id === id);
  if (idx !== -1) {
    db.products[idx] = {
      ...db.products[idx],
      name: p.name,
      description: p.description || null,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      category: p.category,
      images: JSON.stringify(p.images || []),
      sizes: JSON.stringify(p.sizes || []),
      colors: JSON.stringify(p.colors || []),
      stock: Number(p.stock),
      isFeatured: p.isFeatured ? 1 : 0
    };
    writeJsonDb(db);
  }
  return { success: true, id };
}

export async function deleteProduct(id: string): Promise<any> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      return await prisma.product.delete({
        where: { id }
      });
    } catch (err: any) {
      console.error("Prisma deleteProduct failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  db.products = db.products.filter(prod => prod.id !== id);
  db.reviews = db.reviews.filter(rev => rev.productId !== id);
  writeJsonDb(db);
  return { success: true, id };
}

export async function addReview(productId: string, r: any): Promise<any> {
  const id = "rev-" + Date.now();
  const date = new Date().toISOString().split("T")[0];

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const review = await prisma.review.create({
        data: {
          id,
          productId,
          reviewerName: r.reviewerName,
          rating: Number(r.rating),
          comment: r.comment,
          date
        }
      });

      const agg = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true }
      });

      const newAvg = Number(agg._avg.rating || r.rating).toFixed(1);
      await prisma.product.update({
        where: { id: productId },
        data: { rating: Number(newAvg) }
      });

      return review;
    } catch (err: any) {
      console.error("Prisma addReview failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  
  // Add new review
  const newReview = {
    id,
    productId,
    reviewerName: r.reviewerName,
    rating: Number(r.rating),
    comment: r.comment || null,
    date
  };
  db.reviews.push(newReview);

  // Recalculate average rating
  const pReviews = db.reviews.filter(rev => rev.productId === productId);
  const avg = pReviews.reduce((sum, rev) => sum + rev.rating, 0) / pReviews.length;
  
  const prodIdx = db.products.findIndex(prod => prod.id === productId);
  if (prodIdx !== -1) {
    db.products[prodIdx].rating = Number(avg.toFixed(1));
  }

  writeJsonDb(db);
  return { id, success: true };
}

async function getCouponByCode(code: string): Promise<any | null> {
  const normalized = code.toUpperCase();

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
      if (!coupon) return null;
      return { ...coupon, isActive: coupon.isActive === 1 };
    } catch (err: any) {
      console.error("Prisma getCouponByCode failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  const coupon = db.coupons.find((c) => c.code === normalized);
  if (!coupon) return null;
  return { ...coupon, isActive: coupon.isActive === 1 };
}

function calculateCouponDiscount(coupon: any, subtotal: number): number {
  if (coupon.discountType === "percentage") {
    return (subtotal * coupon.value) / 100;
  }
  return coupon.value;
}

export async function addOrder(o: any): Promise<any> {
  for (const item of o.items) {
    const product = await getProduct(item.productId);
    if (!product) {
      throw new Error(`Product "${item.productName || item.productId}" is no longer available.`);
    }
    if (product.stock < Number(item.quantity)) {
      throw new Error(
        `Insufficient stock for "${product.name}". Only ${product.stock} left in warehouse.`
      );
    }
  }

  const subtotal = Number(o.subtotal);
  let discount = Number(o.discount || 0);

  if (o.couponCode) {
    const coupon = await getCouponByCode(o.couponCode);
    if (!coupon || !coupon.isActive) {
      throw new Error(`Coupon "${o.couponCode}" is invalid or expired.`);
    }
    const rate = Number(process.env.PKR_EXCHANGE_RATE || 280);
    const minPurchase = o.currency === "PKR" ? coupon.minPurchase * rate : coupon.minPurchase;
    if (subtotal < minPurchase) {
      const sym = o.currency === "PKR" ? "Rs." : "$";
      throw new Error(`Coupon requires a minimum purchase of ${sym}${minPurchase.toFixed(o.currency === "PKR" ? 0 : 2)}.`);
    }
    if (coupon.discountType === "percentage") {
      discount = calculateCouponDiscount(coupon, subtotal);
    } else {
      discount = o.currency === "PKR" ? coupon.value * rate : coupon.value;
    }
  }

  const deliveryCharge = o.currency === "PKR"
    ? (subtotal >= 28000 ? 0 : 1400)
    : (subtotal >= 100 ? 0 : 5);
  const expectedTotal = Math.max(0, subtotal - discount) + deliveryCharge;
  if (Math.abs(expectedTotal - Number(o.total)) > 0.01) {
    throw new Error("Order total mismatch. Please refresh your cart and try again.");
  }

  const id = "ORD-" + Math.floor(1000 + Math.random() * 9000);
  const date = new Date().toISOString();
  const isOnlinePayment = o.paymentMethod === "PAYFAST" || o.paymentMethod === "JAZZCASH";
  const paymentStatus = isOnlinePayment ? "Pending" : "Pending";
  const status = "Pending";
  const deferStock = isOnlinePayment;

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const order = await prisma.order.create({
        data: {
          id,
          customerId: o.customerId || null,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          customerPhone: o.customerPhone,
          shippingAddress: o.shippingAddress,
          city: o.city,
          postalCode: o.postalCode,
          items: JSON.stringify(o.items),
          subtotal,
          discount,
          total: expectedTotal,
          currency: o.currency || "USD",
          paymentMethod: o.paymentMethod,
          paymentStatus,
          status,
          date,
          notes: o.notes || null,
          paymentRef: null
        }
      });

      if (!deferStock) {
        for (const item of o.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: Number(item.quantity)
              }
            }
          });
        }
      }

      return { id, total: expectedTotal, currency: o.currency || "USD" };
    } catch (err: any) {
      console.error("Prisma addOrder failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  
  const newOrder = {
    id,
    customerId: o.customerId || null,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: o.shippingAddress,
    city: o.city,
    postalCode: o.postalCode,
    items: JSON.stringify(o.items),
    subtotal,
    discount,
    total: expectedTotal,
    currency: o.currency || "USD",
    paymentMethod: o.paymentMethod,
    paymentStatus,
    status,
    date,
    notes: o.notes || null,
    paymentRef: null,
    stockDeducted: !deferStock
  };
  db.orders.push(newOrder);

  if (!deferStock) {
    o.items.forEach((item: any) => {
      const prodIdx = db.products.findIndex(prod => prod.id === item.productId);
      if (prodIdx !== -1) {
        db.products[prodIdx].stock = Math.max(0, db.products[prodIdx].stock - Number(item.quantity));
      }
    });
  }

  writeJsonDb(db);
  return { id, total: expectedTotal, currency: o.currency || "USD" };
}

export async function getAllOrders(): Promise<any[]> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const list = await prisma.order.findMany({
        orderBy: { date: "desc" }
      });
      return list.map((o) => ({
        ...o,
        items: JSON.parse(o.items)
      }));
    } catch (err: any) {
      console.error("Prisma getAllOrders failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  const sorted = [...db.orders].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.map((o) => ({
    ...o,
    items: JSON.parse(o.items)
  }));
}

export async function updateOrderStatus(id: string, status?: string, paymentStatus?: string): Promise<any> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const updateData: any = {};
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      return await prisma.order.update({
        where: { id },
        data: updateData
      });
    } catch (err: any) {
      console.error("Prisma updateOrderStatus failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  const idx = db.orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    if (status) db.orders[idx].status = status;
    if (paymentStatus) db.orders[idx].paymentStatus = paymentStatus;
    writeJsonDb(db);
  }
  return { id, success: true };
}

export async function getCoupons(): Promise<any[]> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const list = await prisma.coupon.findMany({
        where: { isActive: 1 }
      });
      return list.map((c) => ({
        ...c,
        isActive: c.isActive === 1
      }));
    } catch (err: any) {
      console.error("Prisma getCoupons failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  const list = db.coupons.filter(c => c.isActive === 1);
  return list.map((c) => ({
    ...c,
    isActive: c.isActive === 1
  }));
}

export async function addCoupon(c: any): Promise<any> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      return await prisma.coupon.create({
        data: {
          code: c.code.toUpperCase(),
          discountType: c.discountType,
          value: Number(c.value),
          minPurchase: Number(c.minPurchase || 0),
          isActive: 1
        }
      });
    } catch (err: any) {
      console.error("Prisma addCoupon failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  const newCoupon = {
    code: c.code.toUpperCase(),
    discountType: c.discountType,
    value: Number(c.value),
    minPurchase: Number(c.minPurchase || 0),
    isActive: 1
  };
  db.coupons.push(newCoupon);
  writeJsonDb(db);
  return { code: c.code, success: true };
}

export async function deleteCoupon(code: string): Promise<any> {
  const normalized = code.toUpperCase();

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      return await prisma.coupon.update({
        where: { code: normalized },
        data: { isActive: 0 }
      });
    } catch (err: any) {
      console.error("Prisma deleteCoupon failed, falling back to local database. Error:", err.message);
      isSupabaseAvailable = false;
    }
  }

  const db = readJsonDb();
  const idx = db.coupons.findIndex((c) => c.code === normalized);
  if (idx !== -1) {
    db.coupons[idx].isActive = 0;
    writeJsonDb(db);
  }
  return { code: normalized, success: true };
}

export async function getStats(): Promise<any> {
  const orders = await getAllOrders();
  const nonCancelled = orders.filter((o) => o.status !== "Cancelled");

  const totalSales = nonCancelled.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = nonCancelled.length;
  const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders) : 0;

  // Revenue by days
  const revenueMap: Record<string, number> = {};
  nonCancelled.forEach((o) => {
    const day = o.date.split("T")[0];
    revenueMap[day] = (revenueMap[day] || 0) + o.total;
  });

  const revenueByDays = Object.entries(revenueMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);

  // Category sales
  const categorySalesMap: Record<string, { count: number; revenue: number }> = {
    'Cotton Collection': { count: 0, revenue: 0 },
    'Clothing': { count: 0, revenue: 0 },
    'Sports Wear': { count: 0, revenue: 0 },
    'Sports Gear': { count: 0, revenue: 0 }
  };

  nonCancelled.forEach((o) => {
    o.items.forEach((item: any) => {
      let categoryName = "Cotton Collection";
      const nameLower = item.productName.toLowerCase();
      if (nameLower.includes("polo") || nameLower.includes("shirt")) {
        categoryName = "Clothing";
      } else if (nameLower.includes("shoe") || nameLower.includes("hoodie")) {
        categoryName = "Sports Wear";
      } else if (nameLower.includes("racket") || nameLower.includes("ball") || nameLower.includes("gear")) {
        categoryName = "Sports Gear";
      }

      if (!categorySalesMap[categoryName]) {
        categorySalesMap[categoryName] = { count: 0, revenue: 0 };
      }
      categorySalesMap[categoryName].count += Number(item.quantity);
      categorySalesMap[categoryName].revenue += (Number(item.price) * Number(item.quantity));
    });
  });

  const categorySales = Object.entries(categorySalesMap).map(([category, details]) => ({
    category,
    count: details.count,
    revenue: details.revenue
  }));

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    revenueByDays,
    categorySales
  };
}

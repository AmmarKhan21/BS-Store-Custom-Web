import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { getPrisma, isSupabaseAvailable } from "./dbService";
import { generateOtpCode } from "./customerAuth";

const dbPath = path.resolve(process.cwd(), "database.json");

const SEED_CATEGORIES = [
  { name: "Cotton Collection", slug: "cotton-collection" },
  { name: "Clothing", slug: "clothing" },
  { name: "Sports Wear", slug: "sports-wear" },
  { name: "Sports Gear", slug: "sports-gear" },
];

interface LocalExtras {
  customers: any[];
  categories: any[];
  emailOtps: any[];
}

function readExtras(): LocalExtras {
  try {
    if (fs.existsSync(dbPath)) {
      const raw = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      return {
        customers: raw.customers || [],
        categories: raw.categories || [],
        emailOtps: raw.emailOtps || [],
      };
    }
  } catch {
    /* ignore */
  }
  return { customers: [], categories: [], emailOtps: [] };
}

function writeExtras(partial: Partial<LocalExtras>) {
  const full = fs.existsSync(dbPath)
    ? JSON.parse(fs.readFileSync(dbPath, "utf-8"))
    : { products: [], reviews: [], orders: [], coupons: [] };

  if (partial.customers) full.customers = partial.customers;
  if (partial.categories) full.categories = partial.categories;
  if (partial.emailOtps) full.emailOtps = partial.emailOtps;

  fs.writeFileSync(dbPath, JSON.stringify(full, null, 2), "utf-8");
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function seedCategoriesIfEmpty(): Promise<void> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const count = await prisma.category.count();
      if (count === 0) {
        for (let i = 0; i < SEED_CATEGORIES.length; i++) {
          const c = SEED_CATEGORIES[i];
          await prisma.category.create({
            data: {
              id: `cat-${i + 1}`,
              name: c.name,
              slug: c.slug,
              sortOrder: i,
              isActive: 1,
            },
          });
        }
      }
    } catch (err) {
      console.error("Category seed error:", err);
    }
    return;
  }

  const extras = readExtras();
  if (extras.categories.length === 0) {
    const categories = SEED_CATEGORIES.map((c, i) => ({
      id: `cat-${i + 1}`,
      name: c.name,
      slug: c.slug,
      image: null,
      sortOrder: i,
      isActive: 1,
    }));
    writeExtras({ categories });
  }
}

export async function getAllCategories(): Promise<any[]> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const list = await prisma.category.findMany({
        where: { isActive: 1 },
        orderBy: { sortOrder: "asc" },
      });
      return list;
    } catch {
      /* fallback */
    }
  }

  const extras = readExtras();
  if (extras.categories.length === 0) {
    await seedCategoriesIfEmpty();
    return (readExtras().categories || []).filter((c) => c.isActive === 1);
  }
  return extras.categories.filter((c) => c.isActive === 1);
}

export async function addCategory(name: string, image?: string): Promise<any> {
  const trimmed = name.trim();
  const id = "cat-" + Date.now();
  const slug = slugify(trimmed);

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      return await prisma.category.create({
        data: { id, name: trimmed, slug, image: image || null, sortOrder: 99, isActive: 1 },
      });
    } catch {
      /* fallback */
    }
  }

  const extras = readExtras();
  const categories = extras.categories || [];
  if (categories.some((c: any) => c.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error("Category already exists");
  }
  const newCat = { id, name: trimmed, slug, image: image || null, sortOrder: 99, isActive: 1 };
  categories.push(newCat);
  writeExtras({ categories });
  return newCat;
}

export async function updateCategory(id: string, name: string): Promise<any> {
  const trimmed = name.trim();
  const slug = slugify(trimmed);

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      return await prisma.category.update({
        where: { id },
        data: { name: trimmed, slug },
      });
    } catch {
      /* fallback */
    }
  }

  const extras = readExtras();
  const categories = (extras.categories || []).map((c: any) =>
    c.id === id ? { ...c, name: trimmed, slug } : c
  );
  writeExtras({ categories });
  return categories.find((c: any) => c.id === id);
}

export async function deleteCategory(id: string): Promise<void> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const cat = await prisma.category.findUnique({ where: { id } });
      if (cat) {
        await prisma.product.updateMany({
          where: { category: cat.name },
          data: { category: "Uncategorized" },
        });
        await prisma.category.delete({ where: { id } });
      }
      return;
    } catch {
      /* fallback */
    }
  }

  const extras = readExtras();
  const cat = (extras.categories || []).find((c: any) => c.id === id);
  const categories = (extras.categories || []).filter((c: any) => c.id !== id);
  writeExtras({ categories });

  if (cat && fs.existsSync(dbPath)) {
    const full = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    full.products = (full.products || []).map((p: any) =>
      p.category === cat.name ? { ...p, category: "Uncategorized" } : p
    );
    fs.writeFileSync(dbPath, JSON.stringify(full, null, 2), "utf-8");
  }
}

export async function createCustomer(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<any> {
  const normalized = email.toLowerCase().trim();
  const id = "cust-" + Date.now();
  const passwordHash = await bcrypt.hash(password, 10);
  const createdAt = new Date().toISOString();

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const existing = await prisma.customer.findUnique({ where: { email: normalized } });
      if (existing) throw new Error("Email already registered");

      return await prisma.customer.create({
        data: { id, email: normalized, passwordHash, name, phone: phone || null, isVerified: 0, createdAt },
      });
    } catch (err: any) {
      if (err.message === "Email already registered") throw err;
      /* fallback */
    }
  }

  const extras = readExtras();
  const customers = extras.customers || [];
  if (customers.some((c: any) => c.email === normalized)) {
    throw new Error("Email already registered");
  }

  const customer = { id, email: normalized, passwordHash, name, phone: phone || null, isVerified: 0, createdAt };
  customers.push(customer);
  writeExtras({ customers });
  return customer;
}

export async function getCustomerByEmail(email: string): Promise<any | null> {
  const normalized = email.toLowerCase().trim();

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      return await prisma.customer.findUnique({ where: { email: normalized } });
    } catch {
      /* fallback */
    }
  }

  const extras = readExtras();
  return (extras.customers || []).find((c: any) => c.email === normalized) || null;
}

export async function getCustomerById(id: string): Promise<any | null> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      return await prisma.customer.findUnique({ where: { id } });
    } catch {
      /* fallback */
    }
  }

  const extras = readExtras();
  return (extras.customers || []).find((c: any) => c.id === id) || null;
}

export async function verifyCustomerPassword(email: string, password: string): Promise<any | null> {
  const customer = await getCustomerByEmail(email);
  if (!customer) return null;
  const valid = await bcrypt.compare(password, customer.passwordHash);
  return valid ? customer : null;
}

export async function markCustomerVerified(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      await prisma.customer.update({
        where: { email: normalized },
        data: { isVerified: 1 },
      });
      return;
    } catch {
      /* fallback */
    }
  }

  const extras = readExtras();
  const customers = (extras.customers || []).map((c: any) =>
    c.email === normalized ? { ...c, isVerified: 1 } : c
  );
  writeExtras({ customers });
}

export async function saveOtp(email: string, purpose: string): Promise<string> {
  const normalized = email.toLowerCase().trim();
  const code = generateOtpCode();
  const id = "otp-" + Date.now();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      await prisma.emailOtp.deleteMany({ where: { email: normalized, purpose } });
      await prisma.emailOtp.create({
        data: { id, email: normalized, code, purpose, expiresAt, createdAt },
      });
      return code;
    } catch {
      /* fallback */
    }
  }

  const extras = readExtras();
  const emailOtps = (extras.emailOtps || []).filter(
    (o: any) => !(o.email === normalized && o.purpose === purpose)
  );
  emailOtps.push({ id, email: normalized, code, purpose, expiresAt, createdAt });
  writeExtras({ emailOtps });
  return code;
}

export async function verifyOtp(email: string, code: string, purpose: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();

  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const otp = await prisma.emailOtp.findFirst({
        where: { email: normalized, purpose, code },
        orderBy: { createdAt: "desc" },
      });
      if (!otp || new Date(otp.expiresAt) < new Date()) return false;
      await prisma.emailOtp.delete({ where: { id: otp.id } });
      return true;
    } catch {
      /* fallback */
    }
  }

  const extras = readExtras();
  const otp = (extras.emailOtps || []).find(
    (o: any) => o.email === normalized && o.purpose === purpose && o.code === code
  );
  if (!otp || new Date(otp.expiresAt) < new Date()) return false;

  const emailOtps = (extras.emailOtps || []).filter((o: any) => o.id !== otp.id);
  writeExtras({ emailOtps });
  return true;
}

export async function getCustomerOrders(customerId: string): Promise<any[]> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const list = await prisma.order.findMany({
        where: { customerId },
        orderBy: { date: "desc" },
      });
      return list.map((o) => ({ ...o, items: JSON.parse(o.items) }));
    } catch {
      /* fallback */
    }
  }

  if (!fs.existsSync(dbPath)) return [];
  const full = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  return (full.orders || [])
    .filter((o: any) => o.customerId === customerId)
    .map((o: any) => ({ ...o, items: typeof o.items === "string" ? JSON.parse(o.items) : o.items }))
    .sort((a: any, b: any) => b.date.localeCompare(a.date));
}

export async function getOrderById(orderId: string): Promise<any | null> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const o = await prisma.order.findUnique({ where: { id: orderId } });
      if (!o) return null;
      return { ...o, items: JSON.parse(o.items) };
    } catch {
      /* fallback */
    }
  }

  if (!fs.existsSync(dbPath)) return null;
  const full = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  const o = (full.orders || []).find((ord: any) => ord.id === orderId);
  if (!o) return null;
  return { ...o, items: typeof o.items === "string" ? JSON.parse(o.items) : o.items };
}

export async function confirmOrderPayment(orderId: string, paymentRef?: string): Promise<void> {
  if (isSupabaseAvailable) {
    try {
      const prisma = getPrisma();
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return;

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "Paid", status: "Processing", paymentRef: paymentRef || null },
      });

      const items = JSON.parse(order.items);
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: Number(item.quantity) } },
        });
      }
      return;
    } catch {
      /* fallback */
    }
  }

  if (!fs.existsSync(dbPath)) return;
  const full = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  const idx = (full.orders || []).findIndex((o: any) => o.id === orderId);
  if (idx === -1) return;

  const order = full.orders[idx];
  if (order.stockDeducted) {
    full.orders[idx] = { ...order, paymentStatus: "Paid", status: "Processing", paymentRef };
    fs.writeFileSync(dbPath, JSON.stringify(full, null, 2), "utf-8");
    return;
  }

  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  for (const item of items) {
    const pIdx = (full.products || []).findIndex((p: any) => p.id === item.productId);
    if (pIdx !== -1) {
      full.products[pIdx].stock = Math.max(0, full.products[pIdx].stock - Number(item.quantity));
    }
  }

  full.orders[idx] = {
    ...order,
    paymentStatus: "Paid",
    status: "Processing",
    paymentRef,
    stockDeducted: true,
  };
  fs.writeFileSync(dbPath, JSON.stringify(full, null, 2), "utf-8");
}

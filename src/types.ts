export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // For discount display (e.g. was $50, now $39)
  category: string;
  images: string[]; // List of image URLs
  sizes?: string[]; // e.g. ["S", "M", "L", "XL"]
  colors?: string[]; // e.g. ["#000000", "#FFFFFF", "#FF0000"]
  rating: number;
  reviews: Review[];
  stock: number;
  isFeatured?: boolean;
  dateAdded: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'COD' | 'CARD';
  paymentStatus: 'Pending' | 'Paid';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  notes?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  isActive: boolean;
}

export interface StoreStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByDays: { date: string; amount: number }[];
  categorySales: { category: string; count: number; revenue: number }[];
}

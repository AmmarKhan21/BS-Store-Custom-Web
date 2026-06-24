import { Product, Coupon, Order } from './types';

export const INITIAL_PRODUCTS: Product[] = [
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
    colors: ['#EDEAE0', '#000080', '#0B132B', '#E5D3B3'], // Off-White, Navy, Dark Slate, Beige
    rating: 4.8,
    reviews: [
      { id: 'rev-1', reviewerName: 'Hassan Ali', rating: 5, comment: 'Exceptional quality. Soft, cool fabric ideal for hot summers.', date: '2026-06-15' },
      { id: 'rev-2', reviewerName: 'Zainab Bibi', rating: 4, comment: 'Nice packaging and original color matches the photos correctly.', date: '2026-06-18' }
    ],
    stock: 45,
    isFeatured: true,
    dateAdded: '2026-06-01'
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
    reviews: [
      { id: 'rev-3', reviewerName: 'Muhammad Ahmed', rating: 5, comment: 'Fitting was spot-on. Stitching is clean and very robust. Highly recommended!', date: '2026-06-10' }
    ],
    stock: 24,
    isFeatured: true,
    dateAdded: '2026-05-20'
  },
  {
    id: 'prod-3',
    name: 'Bismillah Breathable Cotton Polo Tee',
    description: 'A relaxed everyday smart-casual wear polo t-shirt crafted entirely from combed pique cotton. Offers superior thermal dynamics and super soft ribbing on collars and cuffs.',
    price: 18,
    category: 'Clothing',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=700&auto=format&fit=crop'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#1A365D', '#E2E8F0', '#2D3748'],
    rating: 4.5,
    reviews: [
      { id: 'rev-4', reviewerName: 'Daniyal Khan', rating: 4, comment: 'Very soft, nice regular fit. Comfortable for afternoon strolls.', date: '2026-06-20' }
    ],
    stock: 60,
    isFeatured: false,
    dateAdded: '2026-06-05'
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
    colors: ['#3F3F46', '#27272A', '#D4D4D8'], // Dark Gray, Black, Gray
    rating: 4.6,
    reviews: [
      { id: 'rev-5', reviewerName: 'Usman Ghani', rating: 5, comment: 'Best hoodies ever. Dries quickly after high-intensity training.', date: '2026-06-08' }
    ],
    stock: 18,
    isFeatured: true,
    dateAdded: '2026-06-12'
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
    reviews: [
      { id: 'rev-6', reviewerName: 'Sajid S.', rating: 5, comment: 'Stiff racket with awesome sweet spot. Highly interactive performance.', date: '2026-06-02' }
    ],
    stock: 12,
    isFeatured: true,
    dateAdded: '2026-05-18'
  },
  {
    id: 'prod-6',
    name: 'Classic Full-Grain Leather Soccer Ball',
    description: 'Designed to match standard professional football specs. Hand-stitched with 32 waterproof high-density panels to retain shape excellence and precise trajectory control.',
    price: 25,
    originalPrice: 35,
    category: 'Sports Gear',
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=700&auto=format&fit=crop'
    ],
    sizes: ['Official Size 5'],
    colors: ['#FFFFFF', '#000000'],
    rating: 4.4,
    reviews: [
      { id: 'rev-7', reviewerName: 'Adnan M.', rating: 4, comment: 'Nice retro feel, robust stitches, maintains air perfectly.', date: '2026-06-14' }
    ],
    stock: 30,
    isFeatured: false,
    dateAdded: '2026-06-07'
  },
  {
    id: 'prod-7',
    name: 'Apex Speed-Cushioned Running Shoes',
    description: 'Featherlight mesh build with impact-absorbing reactive heel foam. Perfectly supports forward stride motion while preventing joint exhaustion.',
    price: 65,
    originalPrice: 89,
    category: 'Sports Wear',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=700&auto=format&fit=crop'
    ],
    sizes: ['8', '9', '10', '11'],
    colors: ['#FF0000', '#000000', '#10B981'],
    rating: 4.7,
    reviews: [],
    stock: 15,
    isFeatured: false,
    dateAdded: '2026-06-11'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'BISMILLAH10', discountType: 'percentage', value: 10, minPurchase: 20, isActive: true },
  { code: 'COTTONSUPREME', discountType: 'fixed', value: 15, minPurchase: 50, isActive: true },
  { code: 'SPORTSFREE', discountType: 'percentage', value: 15, minPurchase: 0, isActive: true },
  { code: 'SAVE100', discountType: 'fixed', value: 100, minPurchase: 250, isActive: true }
];

export const INITIAL_ORDERS: Order[] = [
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
  },
  {
    id: 'ORD-7621',
    customerName: 'Sarah Malik',
    customerEmail: 'sarah@example.com',
    customerPhone: '+92 312 9876543',
    shippingAddress: 'F-11 Sector, House 42',
    city: 'Islamabad',
    postalCode: '44000',
    items: [
      {
        productId: 'prod-5',
        productName: 'Ergonomic Aero-Strike Tennis Racket',
        price: 110,
        quantity: 1,
        selectedSize: 'Standard grip size 4 3/8',
        selectedColor: '#FF4500',
        image: 'https://images.unsplash.com/photo-1617083934335-e10df2e53efb?q=80&w=700&auto=format&fit=crop'
      },
      {
        productId: 'prod-3',
        productName: 'Bismillah Breathable Cotton Polo Tee',
        price: 18,
        quantity: 1,
        selectedSize: 'M',
        selectedColor: '#1A365D',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=700&auto=format&fit=crop'
      }
    ],
    subtotal: 128,
    discount: 15,
    total: 113,
    paymentMethod: 'PAYFAST',
    paymentStatus: 'Paid',
    status: 'Shipped',
    date: '2026-06-20T10:15:00Z'
  },
  {
    id: 'ORD-5412',
    customerName: 'Kamran Shah',
    customerEmail: 'kamran.shah@example.com',
    customerPhone: '+92 321 5567891',
    shippingAddress: 'Gulshan-e-Iqbal, Block 4',
    city: 'Karachi',
    postalCode: '75300',
    items: [
      {
        productId: 'prod-2',
        productName: 'Classic White Soft Cotton Shalwar Kameez',
        price: 49,
        quantity: 1,
        selectedSize: 'L',
        selectedColor: '#FFFFFF',
        image: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=700&auto=format&fit=crop'
      }
    ],
    subtotal: 49,
    discount: 0,
    total: 49,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    status: 'Pending',
    date: '2026-06-22T01:05:00Z',
    notes: 'Deliver after 5 PM if possible.'
  }
];

export const CATEGORIES = ['Cotton Collection', 'Clothing', 'Sports Wear', 'Sports Gear'];

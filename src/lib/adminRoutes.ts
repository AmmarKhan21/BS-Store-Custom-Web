export type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'coupons';

export const ADMIN_TAB_PATHS: Record<AdminTab, string> = {
  dashboard: '/admin',
  products: '/admin/products',
  orders: '/admin/orders',
  customers: '/admin/customers',
  coupons: '/admin/coupons',
};

export const ADMIN_PATHS = Object.values(ADMIN_TAB_PATHS);

export function isAdminDashboardPath(pathname: string): boolean {
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return ADMIN_PATHS.includes(normalized);
}

export function adminTabFromPath(pathname: string): AdminTab {
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (path.startsWith('/admin/products')) return 'products';
  if (path.startsWith('/admin/orders')) return 'orders';
  if (path.startsWith('/admin/customers')) return 'customers';
  if (path.startsWith('/admin/coupons')) return 'coupons';
  return 'dashboard';
}

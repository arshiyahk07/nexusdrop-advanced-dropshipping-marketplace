export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface ProductVariant {
  id: string;
  name: string; // e.g., "Color", "Size"
  value: string; // e.g., "Red", "Large"
  sku: string;
  priceModifier: number; // e.g., +5.00 for a larger size
  stock: number;
}
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  vendorId: string;
  variants: ProductVariant[];
  tags: string[];
  rating: number;
  reviewCount: number;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
}
export interface Vendor {
  id: string;
  name: string;
  logoUrl: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'buyer' | 'vendor' | 'admin';
}
export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Record<string, string>;
  createdAt: number;
}
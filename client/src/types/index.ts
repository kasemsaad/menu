export interface Localized {
  en: string;
  ar: string;
}

export interface Category {
  _id: string;
  name: Localized;
  description?: Localized;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Addon {
  name: Localized;
  price: number;
}

export interface Product {
  _id: string;
  categoryId: string | { _id: string; name: Localized };
  name: Localized;
  description?: Localized;
  price: number;
  image?: string;
  addons: Addon[];
  isAvailable: boolean;
  isFeatured: boolean;
  rating: number;
  ratingCount: number;
}

export interface TableInfo {
  _id: string;
  number: number;
  qrCode: string;
  capacity: number;
  status: "available" | "occupied" | "needs_bill";
}

export interface CartItem {
  productId: string;
  name: Localized;
  price: number;
  quantity: number;
  notes?: string;
  addons: Addon[];
  subtotal: number;
}

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "delivering"
  | "delivered"
  | "cancelled";

export interface Order {
  _id: string;
  orderNumber: string;
  tableId?: string | { _id: string; number: number };
  tableNumber?: number;
  type: "dine_in" | "delivery";
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "paymob";
  paymentStatus: string;
  callWaiter?: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

export type UserRole = "admin" | "chef" | "waiter" | "delivery";
export type CustomerRole = "customer";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  deliveryLat?: number;
  deliveryLng?: number;
  role: CustomerRole;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  onShift?: boolean;
  shiftStartedAt?: string;
  assignedTableIds?: string[];
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface Offer {
  _id: string;
  title: Localized;
  description?: Localized;
  discountPercent: number;
  productIds: Product[];
}

export interface NotificationSounds {
  newOrder?: string;
  urgent?: string;
  success?: string;
  update?: string;
}

export interface AppSettings {
  taxPercent: number;
  deliveryFee: number;
  currency: string;
  whatsappNumber: string;
  restaurantName: Localized;
  logo?: string;
  primaryColor: string;
  accentColor: string;
  openTime?: string;
  closeTime?: string;
  notificationSounds?: NotificationSounds;
  soundVolume?: number;
}

/** @deprecated use AppSettings */
export type Settings = AppSettings;

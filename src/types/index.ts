export type PlatformId = 'dmart' | 'blinkit' | 'jiomart' | 'instamart';

export interface Platform {
  id: PlatformId;
  name: string;
  color: string;
  logo: string;
  deliveryThreshold: number; // free delivery above this amount
  baseDeliveryFee: number;
  handlingFee: number;
  platformFee: number;
}

export interface Product {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  categoryHi: string;
  image: string;
  unit: string;
}

export interface PlatformPrice {
  productId: string;
  platformId: PlatformId;
  brand: string;
  packSize: string;
  basePrice: number;
  mrp: number;
  gstPercent: number;
  discount: number;
  couponCode?: string;
  couponDiscount?: number;
  available: boolean;
  alternativeProduct?: boolean;
  packSizeMismatch?: boolean;
  normalizedPricePerUnit?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface PlatformCartSummary {
  platformId: PlatformId;
  items: {
    productId: string;
    name: string;
    brand: string;
    packSize: string;
    basePrice: number;
    quantity: number;
    subtotal: number;
    gst: number;
    cgst: number;
    sgst: number;
    discount: number;
    couponSavings: number;
    available: boolean;
    alternativeProduct?: boolean;
    packSizeMismatch?: boolean;
  }[];
  itemsSubtotal: number;
  totalGst: number;
  totalCgst: number;
  totalSgst: number;
  deliveryFee: number;
  handlingFee: number;
  platformFee: number;
  totalDiscount: number;
  totalCouponSavings: number;
  finalTotal: number;
  unavailableCount: number;
}

export type Language = 'hi' | 'en';

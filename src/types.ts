export type BackendType = 'python' | 'java';
export type AppRole = 'customer' | 'merchant';

export interface UserLocation {
  name: string;
  area: string;
  city: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isGps?: boolean;
}

export interface KiranaShop {
  id: string;
  name: string;
  distance: string;
  distanceMeters: number;
  walkingMinutes?: number;
  address: string;
  landmark: string;
  rating: number;
  reviewsCount: number;
  timing: string;
  phone: string;
  owner: string;
  gstin: string;
  specialty: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  // Specific prices for items at this shop { itemId: priceInINR }
  itemPrices: Record<number, number>;
  colorTheme?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  category?: string;
  unit?: string;
  image?: string;
  hindiName?: string;
  description?: string;
  basePrice?: number;
  barcode?: string;
}

export interface ShopInfo {
  shop_name: string;
  shop_location: string;
  owner?: string;
  phone?: string;
  gstin?: string;
  distance?: string;
  shopId?: string;
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  backend: BackendType;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  statusText: string;
  durationMs: number;
  requestPayload?: any;
  responsePayload: any;
  headers: Record<string, string>;
}

export type MultiStoreStockMap = Record<string, Record<number, number>>;

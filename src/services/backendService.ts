import { BackendType, InventoryItem, ShopInfo, ApiLogEntry, KiranaShop, KhataEntry, MultiStoreStockMap } from '../types';
import { NEARBY_KIRANA_SHOPS } from '../data/shopsData';

export const SHOP_INFO: ShopInfo = {
  shop_name: "Sharma Kirana Store",
  shop_location: "LB Nagar, Saraswathi Nagar, Hyderabad",
  owner: "Ramesh Sharma",
  phone: "+91 98110 44219",
  gstin: "36AAACS1429B1Z8",
  distance: "750 m",
  shopId: "sharma_kirana"
};

// Initial default inventory matching user's app.py & KiranaBackend.java with standard Barcodes
export const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    name: "Rice",
    price: 50,
    basePrice: 50,
    stock: 100,
    category: "Grains & Atta",
    unit: "kg",
    barcode: "8901030001001",
    hindiName: "चावल (बासमती / सोना मसूरी)",
    description: "Premium aged Sona Masoori & Basmati rice, cleaned for daily meals and biryani.",
    image: "/src/assets/images/product_basmati_rice_1790520312952.jpg"
  },
  {
    id: 2,
    name: "Sugar",
    price: 40,
    basePrice: 40,
    stock: 50,
    category: "Daily Essentials",
    unit: "kg",
    barcode: "8901030001002",
    hindiName: "चीनी (शक्कर)",
    description: "Fine crystal refined sulfur-free white sugar for sweets, tea and baking.",
    image: "/src/assets/images/product_pure_sugar_1790520337361.jpg"
  },
  {
    id: 3,
    name: "Oil",
    price: 120,
    basePrice: 120,
    stock: 30,
    category: "Oils & Ghee",
    unit: "Litre",
    barcode: "8901030001003",
    hindiName: "सरसों तेल / सनफ्लावर ऑइल",
    description: "Cold-pressed pure kachi ghani mustard & refined sunflower cooking oil.",
    image: "/src/assets/images/product_mustard_oil_1790520325910.jpg"
  },
  {
    id: 4,
    name: "Chana Dal",
    price: 95,
    basePrice: 95,
    stock: 45,
    category: "Pulses & Dal",
    unit: "kg",
    barcode: "8901030001004",
    hindiName: "चना दाल",
    description: "Unpolished, protein-rich split Bengal gram dal with natural earthy flavor."
  },
  {
    id: 5,
    name: "Chakki Fresh Atta",
    price: 42,
    basePrice: 42,
    stock: 80,
    category: "Grains & Atta",
    unit: "kg",
    barcode: "8901030001005",
    hindiName: "गेहूं आटा",
    description: "100% whole wheat stone ground flour for soft, fluffy rotis."
  },
  {
    id: 6,
    name: "Pure Desi Ghee",
    price: 580,
    basePrice: 580,
    stock: 15,
    category: "Oils & Ghee",
    unit: "kg",
    barcode: "8901030001006",
    hindiName: "शुद्ध देसी घी",
    description: "Traditional bilona churned A2 cow milk ghee with authentic grainy texture."
  },
  {
    id: 7,
    name: "Tata Premium Tea",
    price: 140,
    basePrice: 140,
    stock: 60,
    category: "Beverages",
    unit: "pack (250g)",
    barcode: "8901030001007",
    hindiName: "टाटा चाय",
    description: "Rich blend of strong CTC granules with long tea leaves for kadak chai."
  },
  {
    id: 8,
    name: "Turmeric Powder (Haldi)",
    price: 35,
    basePrice: 35,
    stock: 40,
    category: "Spices & Masala",
    unit: "pack (200g)",
    barcode: "8901030001008",
    hindiName: "हल्दी पाउडर",
    description: "High-curcumin Salem turmeric ground fresh without added artificial colors."
  }
];

// Multi-tenant independent stocks for each store
export const DEFAULT_STORE_STOCKS: MultiStoreStockMap = {
  raju_kirana: {
    1: 85,  // Rice: 85 kg
    2: 40,  // Sugar: 40 kg
    3: 25,  // Oil: 25 Litres
    4: 35,  // Chana Dal: 35 kg
    5: 90,  // Atta: 90 kg
    6: 12,  // Ghee: 12 kg
    7: 50,  // Tea: 50 packs
    8: 30   // Haldi: 30 packs
  },
  sharma_kirana: {
    1: 120, // Rice: 120 kg
    2: 60,  // Sugar: 60 kg
    3: 40,  // Oil: 40 Litres
    4: 50,  // Chana Dal: 50 kg
    5: 75,  // Atta: 75 kg
    6: 22,  // Ghee: 22 kg
    7: 70,  // Tea: 70 packs
    8: 45   // Haldi: 45 packs
  },
  balaji_super: {
    1: 65,  // Rice: 65 kg
    2: 80,  // Sugar: 80 kg
    3: 55,  // Oil: 55 Litres
    4: 40,  // Chana Dal: 40 kg
    5: 110, // Atta: 110 kg
    6: 28,  // Ghee: 28 kg
    7: 40,  // Tea: 40 packs
    8: 50   // Haldi: 50 packs
  },
  sri_lakshmi: {
    1: 95,  // Rice: 95 kg
    2: 45,  // Sugar: 45 kg
    3: 20,  // Oil: 20 Litres
    4: 30,  // Chana Dal: 30 kg
    5: 60,  // Atta: 60 kg
    6: 10,  // Ghee: 10 kg
    7: 35,  // Tea: 35 packs
    8: 25   // Haldi: 25 packs
  }
};

const STORAGE_CATALOG_KEY = 'sharma_kirana_catalog';
const STORAGE_STORE_STOCKS_KEY = 'kirana_multi_store_stocks';
const STORAGE_KHATA_KEY = 'kirana_digital_khata_ledger';
const BACKEND_STORAGE_KEY = 'sharma_kirana_backend';
const ACTIVE_SHOP_KEY = 'kirana_active_shop_id';

class DualBackendEngine {
  private currentBackend: BackendType = 'python';
  private activeShopId: string = 'raju_kirana';
  private logs: ApiLogEntry[] = [];
  private logSubscribers: Array<(logs: ApiLogEntry[]) => void> = [];
  private inventorySubscribers: Array<(items: InventoryItem[]) => void> = [];
  private isTransactionLocked: boolean = false;

  constructor() {
    const savedBackend = localStorage.getItem(BACKEND_STORAGE_KEY);
    if (savedBackend === 'python' || savedBackend === 'java') {
      this.currentBackend = savedBackend;
    }
    const savedShop = localStorage.getItem(ACTIVE_SHOP_KEY);
    if (savedShop && NEARBY_KIRANA_SHOPS.some(s => s.id === savedShop)) {
      this.activeShopId = savedShop;
    }
    // Initialize catalog storage if missing
    if (!localStorage.getItem(STORAGE_CATALOG_KEY)) {
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(DEFAULT_INVENTORY, null, 2));
    }
    // Initialize multi-store stocks if missing
    if (!localStorage.getItem(STORAGE_STORE_STOCKS_KEY)) {
      localStorage.setItem(STORAGE_STORE_STOCKS_KEY, JSON.stringify(DEFAULT_STORE_STOCKS, null, 2));
    }
    // Initialize sample Khata ledger if missing
    if (!localStorage.getItem(STORAGE_KHATA_KEY)) {
      const initialKhata: KhataEntry[] = [
        {
          id: 'khata-1',
          customerName: 'Srinivas Rao',
          customerPhone: '+91 98480 11234',
          amount: 640,
          shopId: 'raju_kirana',
          date: '2026-09-28',
          invoiceNumber: 'INV-2026-0812',
          status: 'unpaid'
        },
        {
          id: 'khata-2',
          customerName: 'Anitha Reddy',
          customerPhone: '+91 97000 88451',
          amount: 420,
          shopId: 'raju_kirana',
          date: '2026-09-29',
          invoiceNumber: 'INV-2026-0845',
          status: 'unpaid'
        }
      ];
      localStorage.setItem(STORAGE_KHATA_KEY, JSON.stringify(initialKhata, null, 2));
    }
  }

  public getBackend(): BackendType {
    return this.currentBackend;
  }

  public getActiveShop(): KiranaShop {
    return NEARBY_KIRANA_SHOPS.find(s => s.id === this.activeShopId) || NEARBY_KIRANA_SHOPS[0];
  }

  public getActiveShopId(): string {
    return this.activeShopId;
  }

  public setActiveShop(shopId: string): void {
    const shop = NEARBY_KIRANA_SHOPS.find(s => s.id === shopId);
    if (!shop) return;
    this.activeShopId = shopId;
    localStorage.setItem(ACTIVE_SHOP_KEY, shopId);
    this.notifyInventory();

    this.recordLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      backend: this.currentBackend,
      method: 'GET',
      endpoint: `/api/shopinfo?shop_id=${shopId}`,
      status: 200,
      statusText: 'OK',
      durationMs: 14,
      responsePayload: {
        shop_name: shop.name,
        shop_location: shop.address,
        distance: shop.distance,
        rating: shop.rating,
        pricing_profile: "Loaded live item prices & independent store inventory for " + shop.name
      },
      headers: this.getHeaders(this.currentBackend)
    });
  }

  public setBackend(backend: BackendType): void {
    this.currentBackend = backend;
    localStorage.setItem(BACKEND_STORAGE_KEY, backend);
    const shop = this.getActiveShop();
    this.recordLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      backend,
      method: 'GET',
      endpoint: '/api/shopinfo',
      status: 200,
      statusText: 'OK',
      durationMs: backend === 'python' ? 42 : 18,
      responsePayload: {
        shop_name: shop.name,
        shop_location: shop.address,
        distance: shop.distance,
        active_runtime: backend === 'python' ? 'Python 3.11 / Flask 3.0' : 'Java 17 / SparkJava 2.9'
      },
      headers: this.getHeaders(backend)
    });
  }

  public subscribeLogs(cb: (logs: ApiLogEntry[]) => void): () => void {
    this.logSubscribers.push(cb);
    cb([...this.logs]);
    return () => {
      this.logSubscribers = this.logSubscribers.filter(s => s !== cb);
    };
  }

  public subscribeInventory(cb: (items: InventoryItem[]) => void): () => void {
    this.inventorySubscribers.push(cb);
    cb(this.loadInventory());
    return () => {
      this.inventorySubscribers = this.inventorySubscribers.filter(s => s !== cb);
    };
  }

  private recordLog(entry: ApiLogEntry) {
    this.logs = [entry, ...this.logs.slice(0, 49)];
    this.logSubscribers.forEach(cb => cb([...this.logs]));
  }

  private notifyInventory() {
    const current = this.loadInventory();
    this.inventorySubscribers.forEach(cb => cb(current));
  }

  private getHeaders(backend: BackendType): Record<string, string> {
    if (backend === 'python') {
      return {
        'Server': 'Werkzeug/3.0.1 Python/3.11.8 Flask/3.0.2',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Backend-Language': 'Python',
        'X-Service-Port': '5000',
        'X-Concurrency-Lock': 'ACID-Serializable-OK'
      };
    } else {
      return {
        'Server': 'Jetty(9.4.43.v20210629) SparkJava/2.9.3',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Backend-Language': 'Java',
        'X-Service-Port': '8081',
        'X-Concurrency-Lock': 'ACID-Serializable-OK'
      };
    }
  }

  // Multi-Store Independent Stock Helpers
  public getMultiStoreStocks(): MultiStoreStockMap {
    try {
      const data = localStorage.getItem(STORAGE_STORE_STOCKS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return DEFAULT_STORE_STOCKS;
  }

  private saveMultiStoreStocks(stocks: MultiStoreStockMap): void {
    localStorage.setItem(STORAGE_STORE_STOCKS_KEY, JSON.stringify(stocks, null, 2));
  }

  // Load Inventory for a specific store (or current active shop)
  public loadInventory(targetShopId?: string): InventoryItem[] {
    const shopId = targetShopId || this.activeShopId;
    let catalog: InventoryItem[] = DEFAULT_INVENTORY;
    try {
      const data = localStorage.getItem(STORAGE_CATALOG_KEY);
      if (data) {
        catalog = JSON.parse(data);
      }
    } catch {
      // fallback
    }

    const allStocks = this.getMultiStoreStocks();
    const shopStocks = allStocks[shopId] || DEFAULT_STORE_STOCKS[shopId] || {};
    const shop = NEARBY_KIRANA_SHOPS.find(s => s.id === shopId) || this.getActiveShop();

    return catalog.map(item => {
      const shopPrice = shop.itemPrices[item.id];
      const shopStock = shopStocks[item.id] !== undefined ? shopStocks[item.id] : item.stock;
      return {
        ...item,
        price: shopPrice !== undefined ? shopPrice : item.price,
        stock: shopStock
      };
    });
  }

  private saveCatalogToDisk(items: InventoryItem[]): void {
    localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(items, null, 2));
    this.notifyInventory();
  }

  // --- API Endpoints matching Python app.py & Java KiranaBackend.java ---

  // GET /api/shopinfo
  public async getShopInfo(): Promise<ShopInfo> {
    const start = performance.now();
    const delay = this.currentBackend === 'python' ? 35 : 15;
    await new Promise(r => setTimeout(r, delay));

    const shop = this.getActiveShop();
    const duration = Math.round(performance.now() - start);
    const data: ShopInfo = {
      shop_name: shop.name,
      shop_location: shop.address,
      owner: shop.owner,
      phone: shop.phone,
      gstin: shop.gstin,
      distance: shop.distance,
      shopId: shop.id
    };

    this.recordLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      backend: this.currentBackend,
      method: 'GET',
      endpoint: '/api/shopinfo',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      responsePayload: data,
      headers: this.getHeaders(this.currentBackend)
    });

    return data;
  }

  // GET /api/items
  public async getItems(): Promise<InventoryItem[]> {
    const start = performance.now();
    const delay = this.currentBackend === 'python' ? 45 : 20;
    await new Promise(r => setTimeout(r, delay));

    const items = this.loadInventory();
    const duration = Math.round(performance.now() - start);

    this.recordLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      backend: this.currentBackend,
      method: 'GET',
      endpoint: `/api/items?shop_id=${this.activeShopId}`,
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      responsePayload: items,
      headers: this.getHeaders(this.currentBackend)
    });

    return items;
  }

  // POST /api/items
  public async addItem(itemData: Partial<InventoryItem>): Promise<{ success: boolean; item?: InventoryItem; error?: string; status: number }> {
    const start = performance.now();
    const delay = this.currentBackend === 'python' ? 65 : 28;
    await new Promise(r => setTimeout(r, delay));

    if (!itemData.name || itemData.price === undefined || itemData.stock === undefined || isNaN(Number(itemData.price)) || isNaN(Number(itemData.stock))) {
      const duration = Math.round(performance.now() - start);
      const errRes = { error: "Invalid data" };
      this.recordLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        backend: this.currentBackend,
        method: 'POST',
        endpoint: '/api/items',
        status: 400,
        statusText: 'BAD REQUEST',
        durationMs: duration,
        requestPayload: itemData,
        responsePayload: errRes,
        headers: this.getHeaders(this.currentBackend)
      });
      return { success: false, error: "Invalid data", status: 400 };
    }

    const inventory = this.loadInventory();
    const maxId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) : 0;
    const newId = maxId + 1;

    const newItem: InventoryItem = {
      id: newId,
      name: itemData.name.trim(),
      price: Number(itemData.price),
      basePrice: Number(itemData.price),
      stock: Number(itemData.stock),
      category: itemData.category || "General Grocery",
      unit: itemData.unit || "unit",
      barcode: `890103000${newId.toString().padStart(4, '0')}`,
      hindiName: itemData.hindiName || "",
      description: itemData.description || `Fresh grocery item added to inventory.`
    };

    // Save in catalog
    let catalog: InventoryItem[] = DEFAULT_INVENTORY;
    try {
      const data = localStorage.getItem(STORAGE_CATALOG_KEY);
      if (data) catalog = JSON.parse(data);
    } catch {}
    catalog.push(newItem);
    this.saveCatalogToDisk(catalog);

    // Save initial stock in multi-store map for active shop
    const allStocks = this.getMultiStoreStocks();
    if (!allStocks[this.activeShopId]) allStocks[this.activeShopId] = {};
    allStocks[this.activeShopId][newId] = Number(itemData.stock);
    this.saveMultiStoreStocks(allStocks);
    this.notifyInventory();

    const duration = Math.round(performance.now() - start);
    this.recordLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      backend: this.currentBackend,
      method: 'POST',
      endpoint: '/api/items',
      status: 201,
      statusText: 'CREATED',
      durationMs: duration,
      requestPayload: itemData,
      responsePayload: newItem,
      headers: this.getHeaders(this.currentBackend)
    });

    return { success: true, item: newItem, status: 201 };
  }

  // POST /api/purchase/:id (With ACID Concurrency Lock and Multi-Store Stock Isolation)
  public async purchaseItem(itemId: number, count: number = 1): Promise<{ success: boolean; message?: string; error?: string; status: number }> {
    // Acquire Transaction Lock
    while (this.isTransactionLocked) {
      await new Promise(r => setTimeout(r, 10));
    }
    this.isTransactionLocked = true;

    try {
      const start = performance.now();
      const delay = this.currentBackend === 'python' ? 50 : 22;
      await new Promise(r => setTimeout(r, delay));

      const inventory = this.loadInventory(this.activeShopId);
      const targetItem = inventory.find(i => i.id === itemId);

      if (!targetItem) {
        const duration = Math.round(performance.now() - start);
        const errRes = { error: "Item not found in store catalog" };
        this.recordLog({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          backend: this.currentBackend,
          method: 'POST',
          endpoint: `/api/purchase/${itemId}`,
          status: 404,
          statusText: 'NOT FOUND',
          durationMs: duration,
          responsePayload: errRes,
          headers: this.getHeaders(this.currentBackend)
        });
        return { success: false, error: "Item not found", status: 404 };
      }

      if (targetItem.stock < count) {
        const duration = Math.round(performance.now() - start);
        const errRes = { error: `Insufficient stock at ${this.getActiveShop().name}. Only ${targetItem.stock} ${targetItem.unit || 'units'} available.` };
        this.recordLog({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          backend: this.currentBackend,
          method: 'POST',
          endpoint: `/api/purchase/${itemId}`,
          status: 400,
          statusText: 'BAD REQUEST',
          durationMs: duration,
          responsePayload: errRes,
          headers: this.getHeaders(this.currentBackend)
        });
        return { success: false, error: errRes.error, status: 400 };
      }

      // Decrement stock ONLY for the active store in multi-store stocks
      const allStocks = this.getMultiStoreStocks();
      if (!allStocks[this.activeShopId]) {
        allStocks[this.activeShopId] = {};
      }
      const previousStock = allStocks[this.activeShopId][itemId] ?? targetItem.stock;
      const newStock = previousStock - count;
      allStocks[this.activeShopId][itemId] = newStock;
      this.saveMultiStoreStocks(allStocks);
      this.notifyInventory();

      const duration = Math.round(performance.now() - start);
      const shop = this.getActiveShop();
      const successRes = {
        message: `Purchased ${count} ${targetItem.unit || ''} of ${targetItem.name} from ${shop.name} at ₹${targetItem.price}/${targetItem.unit}. Remaining stock: ${newStock}.`,
        transaction_id: `TXN-${Date.now().toString(36).toUpperCase()}`,
        shop_id: shop.id,
        item_id: itemId,
        stock_remaining: newStock
      };

      this.recordLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        backend: this.currentBackend,
        method: 'POST',
        endpoint: `/api/purchase/${itemId}`,
        status: 200,
        statusText: 'OK',
        durationMs: duration,
        responsePayload: successRes,
        headers: this.getHeaders(this.currentBackend)
      });

      return { success: true, message: successRes.message, status: 200 };
    } finally {
      // Release Transaction Lock
      this.isTransactionLocked = false;
    }
  }

  // Quick Restock helper (Specific to Active Shop)
  public async restockItem(itemId: number, addQuantity: number): Promise<boolean> {
    const inventory = this.loadInventory(this.activeShopId);
    const item = inventory.find(i => i.id === itemId);
    if (!item) return false;

    const allStocks = this.getMultiStoreStocks();
    if (!allStocks[this.activeShopId]) allStocks[this.activeShopId] = {};
    const currentStock = allStocks[this.activeShopId][itemId] ?? item.stock;
    const newStock = currentStock + addQuantity;
    allStocks[this.activeShopId][itemId] = newStock;
    this.saveMultiStoreStocks(allStocks);
    this.notifyInventory();

    const shop = this.getActiveShop();
    this.recordLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      backend: this.currentBackend,
      method: 'POST',
      endpoint: `/api/items/${itemId}/restock`,
      status: 200,
      statusText: 'OK',
      durationMs: 25,
      requestPayload: { quantity: addQuantity, shop_id: shop.id },
      responsePayload: { message: `Restocked ${item.name} with +${addQuantity} units for ${shop.name}. New store stock: ${newStock}` },
      headers: this.getHeaders(this.currentBackend)
    });

    return true;
  }

  // Delete item helper
  public async deleteItem(itemId: number): Promise<boolean> {
    let catalog: InventoryItem[] = DEFAULT_INVENTORY;
    try {
      const data = localStorage.getItem(STORAGE_CATALOG_KEY);
      if (data) catalog = JSON.parse(data);
    } catch {}

    const exists = catalog.some(i => i.id === itemId);
    if (!exists) return false;

    catalog = catalog.filter(i => i.id !== itemId);
    this.saveCatalogToDisk(catalog);

    // Remove from store stock maps
    const allStocks = this.getMultiStoreStocks();
    Object.keys(allStocks).forEach(sId => {
      delete allStocks[sId][itemId];
    });
    this.saveMultiStoreStocks(allStocks);
    this.notifyInventory();

    this.recordLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      backend: this.currentBackend,
      method: 'DELETE',
      endpoint: `/api/items/${itemId}`,
      status: 200,
      statusText: 'OK',
      durationMs: 25,
      responsePayload: { message: "Item deleted from catalog and all shop inventories" },
      headers: this.getHeaders(this.currentBackend)
    });

    return true;
  }

  // Digital Khata Ledger Operations
  public getKhataEntries(shopId?: string): KhataEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KHATA_KEY);
      if (data) {
        const list: KhataEntry[] = JSON.parse(data);
        if (shopId) {
          return list.filter(k => k.shopId === shopId);
        }
        return list;
      }
    } catch {}
    return [];
  }

  public addKhataEntry(entry: Omit<KhataEntry, 'id' | 'status' | 'date'>): KhataEntry {
    const list = this.getKhataEntries();
    const newEntry: KhataEntry = {
      ...entry,
      id: `khata-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'unpaid'
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KHATA_KEY, JSON.stringify(list, null, 2));

    this.recordLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      backend: this.currentBackend,
      method: 'POST',
      endpoint: '/api/khata',
      status: 201,
      statusText: 'CREATED',
      durationMs: 20,
      requestPayload: newEntry,
      responsePayload: { message: `Customer credit recorded: ₹${newEntry.amount} for ${newEntry.customerName}` },
      headers: this.getHeaders(this.currentBackend)
    });

    return newEntry;
  }

  public settleKhataEntry(entryId: string): boolean {
    const list = this.getKhataEntries();
    const target = list.find(k => k.id === entryId);
    if (!target) return false;

    target.status = 'settled';
    target.settledDate = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KHATA_KEY, JSON.stringify(list, null, 2));

    this.recordLog({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      backend: this.currentBackend,
      method: 'PUT',
      endpoint: `/api/khata/${entryId}/settle`,
      status: 200,
      statusText: 'OK',
      durationMs: 18,
      responsePayload: { message: `Khata credit of ₹${target.amount} settled for ${target.customerName}` },
      headers: this.getHeaders(this.currentBackend)
    });

    return true;
  }

  // Reset inventory to default template
  public resetToDefault(): void {
    localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(DEFAULT_INVENTORY, null, 2));
    localStorage.setItem(STORAGE_STORE_STOCKS_KEY, JSON.stringify(DEFAULT_STORE_STOCKS, null, 2));
    this.notifyInventory();
  }

  // Raw JSON exporter
  public getRawJson(): string {
    return JSON.stringify({
      catalog: this.loadInventory(),
      storeStocks: this.getMultiStoreStocks(),
      activeShop: this.getActiveShop()
    }, null, 4);
  }

  // Raw JSON importer
  public importRawJson(jsonStr: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        this.saveCatalogToDisk(parsed);
        return { success: true };
      }
      if (parsed && Array.isArray(parsed.catalog)) {
        this.saveCatalogToDisk(parsed.catalog);
        if (parsed.storeStocks) {
          this.saveMultiStoreStocks(parsed.storeStocks);
        }
        return { success: true };
      }
      return { success: false, error: "JSON must be an array of inventory items or export object" };
    } catch (e: any) {
      return { success: false, error: e.message || "Invalid JSON syntax" };
    }
  }

  // Clear API logs
  public clearLogs(): void {
    this.logs = [];
    this.logSubscribers.forEach(cb => cb([]));
  }
}

export const backendEngine = new DualBackendEngine();

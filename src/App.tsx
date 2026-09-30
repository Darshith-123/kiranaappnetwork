import React, { useState, useEffect } from 'react';
import { BackendType, InventoryItem, ApiLogEntry, CartItem, BillReceipt, UserLocation, KiranaShop, AppRole } from './types';
import { backendEngine, SHOP_INFO } from './services/backendService';
import { DEFAULT_USER_LOCATION, NEARBY_KIRANA_SHOPS } from './data/shopsData';
import { Navbar, BackgroundTheme } from './components/Navbar';
import { LocationPicker } from './components/LocationPicker';
import { NearbyShopsMap } from './components/NearbyShopsMap';
import { PriceComparisonTable } from './components/PriceComparisonTable';
import { Storefront } from './components/Storefront';
import { InventoryManager } from './components/InventoryManager';
import { POSBilling } from './components/POSBilling';
import { DigitalKhata } from './components/DigitalKhata';
import { ApiConsole } from './components/ApiConsole';
import { CodeViewer } from './components/CodeViewer';
import { CartDrawer } from './components/CartDrawer';
import { ReceiptModal } from './components/ReceiptModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('storefront');
  const [appRole, setAppRole] = useState<AppRole>('customer');
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>('sandstone');
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(DEFAULT_USER_LOCATION);
  const [activeShop, setActiveShop] = useState<KiranaShop>(backendEngine.getActiveShop());
  const [activeBackend, setActiveBackend] = useState<BackendType>(backendEngine.getBackend());
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recentReceipts, setRecentReceipts] = useState<BillReceipt[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<BillReceipt | null>(null);
  const [purchasingItemId, setPurchasingItemId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    backend?: BackendType;
  } | null>(null);

  const isDark = currentTheme === 'emerald';

  // Read URL search params on initial load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const shopParam = params.get('shop');
      const roleParam = params.get('role');
      const backendParam = params.get('backend');
      const areaParam = params.get('area');

      if (tabParam && ['storefront', 'map', 'compare', 'inventory', 'pos', 'khata', 'console', 'code'].includes(tabParam)) {
        setCurrentTab(tabParam);
      }
      if (roleParam === 'merchant' || roleParam === 'customer') {
        setAppRole(roleParam);
      }
      if (shopParam && NEARBY_KIRANA_SHOPS.some(s => s.id === shopParam)) {
        backendEngine.setActiveShop(shopParam);
        setActiveShop(backendEngine.getActiveShop());
      }
      if (backendParam === 'python' || backendParam === 'java') {
        backendEngine.setBackend(backendParam);
        setActiveBackend(backendParam);
      }
      if (areaParam) {
        setCurrentLocation(prev => ({
          ...prev,
          name: decodeURIComponent(areaParam),
          area: decodeURIComponent(areaParam)
        }));
      }
    } catch {
      // Ignore if URLSearchParams unsupported
    }
  }, []);

  // Sync URL search params when tab, shop, role, backend, or location changes
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', currentTab);
      url.searchParams.set('shop', activeShop.id);
      url.searchParams.set('role', appRole);
      url.searchParams.set('backend', activeBackend);
      if (currentLocation.area) {
        url.searchParams.set('area', currentLocation.area);
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore
    }
  }, [currentTab, activeShop.id, appRole, activeBackend, currentLocation.area]);

  // Subscribe to backend data updates
  useEffect(() => {
    const unsubInv = backendEngine.subscribeInventory((newItems) => {
      setItems(newItems);
    });
    const unsubLogs = backendEngine.subscribeLogs((newLogs) => {
      setLogs(newLogs);
    });
    return () => {
      unInv();
      unsubLogs();
    };
    function unInv() {
      unsubInv();
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success', backend?: BackendType) => {
    const id = crypto.randomUUID();
    setNotification({ id, message, type, backend });
    setTimeout(() => {
      setNotification((curr) => (curr?.id === id ? null : curr));
    }, 3800);
  };

  const handleRoleChange = (newRole: AppRole) => {
    setAppRole(newRole);
    if (newRole === 'merchant') {
      showNotification(`Unlocked Shopkeeper & POS Terminal Mode for ${activeShop.name}`, 'info');
    } else {
      showNotification(`Switched to Shopper Discovery Mode`, 'info');
    }
  };

  const handleSelectShop = (shopId: string) => {
    backendEngine.setActiveShop(shopId);
    const shop = backendEngine.getActiveShop();
    setActiveShop(shop);
    showNotification(`Active Store: ${shop.name} (${shop.distance}) · Loaded live item prices & stock!`, 'info');
  };

  const handleLocationChange = (loc: UserLocation) => {
    setCurrentLocation(loc);
    showNotification(`Location set to ${loc.name}`, 'info');
  };

  const handleBackendChange = (backend: BackendType) => {
    backendEngine.setBackend(backend);
    setActiveBackend(backend);
    showNotification(
      `Switched REST API to ${backend === 'python' ? 'Python (Flask :5000)' : 'Java (Spark :8081)'}`,
      'info',
      backend
    );
  };

  // Cart operations
  const handleAddToCart = (item: InventoryItem, qty: number = 1) => {
    if (item.stock <= 0) {
      showNotification(`${item.name} is currently out of stock at ${activeShop.name}!`, 'error');
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.item.id === item.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, item.stock);
        return prevCart.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: newQty } : ci
        );
      }
      return [...prevCart, { item, quantity: Math.min(qty, item.stock) }];
    });
    showNotification(`Added ${qty} ${item.unit || ''} of ${item.name} to cart`, 'success');
  };

  const handleUpdateCartQuantity = (itemId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (newQty > item.stock) {
      showNotification(`Maximum available stock at ${activeShop.name} is ${item.stock}`, 'error');
      return;
    }

    setCart((prevCart) =>
      prevCart.map((ci) => (ci.item.id === itemId ? { ...ci, quantity: newQty } : ci))
    );
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
    showNotification('Billing cart cleared', 'info');
  };

  // Quick purchase item directly from storefront
  const handleQuickPurchase = async (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.stock <= 0) {
      showNotification(`${item.name} is out of stock at ${activeShop.name}!`, 'error');
      return;
    }
    setPurchasingItemId(item.id);

    const res = await backendEngine.purchaseItem(item.id, 1);
    setPurchasingItemId(null);

    if (res.success) {
      showNotification(res.message || `Purchased 1 ${item.unit || 'unit'} of ${item.name}!`, 'success', activeBackend);
      
      const newReceipt: BillReceipt = {
        invoiceNumber: `SK-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        customerName: 'Quick Buy Shopper',
        paymentMode: 'Cash',
        items: [{ item, quantity: 1 }],
        subtotal: item.price,
        discount: 0,
        tax: 0,
        total: item.price,
        backendUsed: activeBackend,
        shopInfo: {
          shop_name: activeShop.name,
          shop_location: activeShop.address,
          owner: activeShop.owner,
          phone: activeShop.phone,
          gstin: activeShop.gstin,
          distance: activeShop.distance,
          shopId: activeShop.id,
        },
      };
      setRecentReceipts((prev) => [newReceipt, ...prev]);
      setActiveReceipt(newReceipt);
    } else {
      showNotification(res.error || `Purchase failed on ${activeBackend}`, 'error', activeBackend);
    }
  };

  // Inventory Management API wrappers
  const handleAddItem = async (itemData: Partial<InventoryItem>): Promise<boolean> => {
    const res = await backendEngine.addItem(itemData);
    if (res.success) {
      showNotification(`Added ${itemData.name} to ${activeShop.name} inventory!`, 'success', activeBackend);
      return true;
    } else {
      showNotification(`Error adding item: ${res.error}`, 'error', activeBackend);
      return false;
    }
  };

  const handleDeleteItem = async (id: number): Promise<boolean> => {
    const success = await backendEngine.deleteItem(id);
    if (success) {
      showNotification('Item removed from inventory catalog', 'info', activeBackend);
      return true;
    }
    return false;
  };

  const handleRestockItem = async (id: number, amount: number): Promise<boolean> => {
    const success = await backendEngine.restockItem(id, amount);
    if (success) {
      showNotification(`Restocked +${amount} units for ${activeShop.name}`, 'success', activeBackend);
      return true;
    }
    return false;
  };

  const handleResetDefault = () => {
    backendEngine.resetToDefault();
    setCart([]);
    showNotification('Inventory reset to initial default items', 'info');
  };

  const handleCheckout = async (
    customerName: string,
    customerPhone: string,
    paymentMode: 'Cash' | 'UPI / QR' | 'Khata (Credit)'
  ): Promise<BillReceipt | null> => {
    if (cart.length === 0) return null;

    // Process line items via backend purchase calls
    for (const line of cart) {
      const res = await backendEngine.purchaseItem(line.item.id, line.quantity);
      if (!res.success) {
        showNotification(`Failed to checkout ${line.item.name}: ${res.error}`, 'error', activeBackend);
        return null;
      }
    }

    const subtotal = cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
    const invoiceNumber = `SK-${Date.now().toString().slice(-6)}`;
    const newReceipt: BillReceipt = {
      invoiceNumber,
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
      paymentMode,
      items: [...cart],
      subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      backendUsed: activeBackend,
      shopInfo: {
        shop_name: activeShop.name,
        shop_location: activeShop.address,
        owner: activeShop.owner,
        phone: activeShop.phone,
        gstin: activeShop.gstin,
        distance: activeShop.distance,
        shopId: activeShop.id,
      },
    };

    setRecentReceipts((prev) => [newReceipt, ...prev]);
    setCart([]);
    showNotification(`Bill #${invoiceNumber} issued from ${activeShop.name}!`, 'success', activeBackend);
    return newReceipt;
  };

  const totalCartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className={`min-h-screen theme-${currentTheme} transition-colors duration-500 flex flex-col font-sans relative selection:bg-emerald-200 selection:text-emerald-900 ${
      isDark ? 'text-slate-100' : 'text-[#1E293B]'
    }`}>
      {/* Decorative ambient lighting radiance (fixed background) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
        {currentTheme === 'sandstone' && (
          <>
            <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-amber-100/40 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -left-32 w-[500px] h-[400px] bg-orange-100/30 rounded-full blur-3xl" />
          </>
        )}
        {currentTheme === 'emerald' && (
          <>
            <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-emerald-900/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -left-32 w-[500px] h-[400px] bg-teal-900/15 rounded-full blur-3xl" />
          </>
        )}
      </div>

      {/* Primary Top Navigation Bar with Role Access Control */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeBackend={activeBackend}
        onBackendChange={handleBackendChange}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        activeShop={activeShop}
        allShops={NEARBY_KIRANA_SHOPS}
        onSelectShop={handleSelectShop}
        appRole={appRole}
        onRoleChange={handleRoleChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Prominent Location Question & Discovery on Storefront and Map */}
        {(currentTab === 'storefront' || currentTab === 'map') && (
          <LocationPicker
            currentLocation={currentLocation}
            onLocationChange={handleLocationChange}
            nearbyShops={NEARBY_KIRANA_SHOPS}
            activeShop={activeShop}
            onSelectShop={handleSelectShop}
          />
        )}

        {/* Tab 1: Storefront with Active Shop Prices */}
        {currentTab === 'storefront' && (
          <Storefront
            items={items}
            activeBackend={activeBackend}
            activeShop={activeShop}
            allShops={NEARBY_KIRANA_SHOPS}
            onSelectShop={handleSelectShop}
            currentLocation={currentLocation}
            onQuickPurchase={handleQuickPurchase}
            onAddToCart={handleAddToCart}
            onSwitchTab={setCurrentTab}
            purchasingItemId={purchasingItemId}
            onToggleComparePrices={() => setCurrentTab('compare')}
          />
        )}

        {/* Tab 2: Interactive Google Maps Nearby View */}
        {currentTab === 'map' && (
          <NearbyShopsMap
            currentLocation={currentLocation}
            shops={NEARBY_KIRANA_SHOPS}
            activeShop={activeShop}
            onSelectShop={handleSelectShop}
            onViewComparison={() => setCurrentTab('compare')}
          />
        )}

        {/* Tab 3: Price Comparison Across All 4 Shops */}
        {currentTab === 'compare' && (
          <PriceComparisonTable
            items={items}
            shops={NEARBY_KIRANA_SHOPS}
            activeShop={activeShop}
            onSelectShop={handleSelectShop}
            onAddToCart={handleAddToCart}
            onQuickBuy={handleQuickPurchase}
          />
        )}

        {/* Tab 4: Shop Inventory Management */}
        {currentTab === 'inventory' && (
          <InventoryManager
            items={items}
            activeBackend={activeBackend}
            activeShop={activeShop}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onRestockItem={handleRestockItem}
            onResetDefault={handleResetDefault}
          />
        )}

        {/* Tab 5: POS Counter & Cash Memo Billing */}
        {currentTab === 'pos' && (
          <POSBilling
            cart={cart}
            items={items}
            activeBackend={activeBackend}
            activeShop={activeShop}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onAddToCart={handleAddToCart}
            onCheckout={handleCheckout}
            onOpenReceipt={setActiveReceipt}
            recentReceipts={recentReceipts}
          />
        )}

        {/* Tab 6: Digital Khata / Customer Credit Ledger */}
        {currentTab === 'khata' && (
          <DigitalKhata activeShop={activeShop} />
        )}

        {/* Tab 7: API Console & Telemetry */}
        {currentTab === 'console' && (
          <ApiConsole
            logs={logs}
            activeBackend={activeBackend}
            onBackendChange={handleBackendChange}
            onClearLogs={() => backendEngine.clearLogs()}
          />
        )}

        {/* Tab 8: Backend Code Viewer */}
        {currentTab === 'code' && <CodeViewer />}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        activeBackend={activeBackend}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveFromCart={handleRemoveFromCart}
        onProceedToPos={() => setCurrentTab('pos')}
      />

      {/* Printable Receipt Modal with 58mm Thermal Roll & UPI QR */}
      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white p-3.5 rounded-xl shadow-lg border border-slate-800 flex items-start gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-100">{notification.message}</p>
            {notification.backend && (
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Processed via {notification.backend === 'python' ? 'Python Flask :5000' : 'Java Spark :8081'}
              </p>
            )}
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className={`mt-auto border-t py-6 transition-colors duration-300 ${
        isDark 
          ? 'bg-[#061411]/85 border-emerald-900/40 text-emerald-200/70' 
          : 'bg-white/80 border-amber-900/10 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>KiranaNetwork</span>
            <span aria-hidden="true">·</span>
            <span>{activeShop.name} ({activeShop.distance})</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">{currentLocation.area}</span>
          </div>

          <div className={`flex items-center gap-4 ${isDark ? 'text-emerald-300/60' : 'text-slate-600'}`}>
            <span>Multi-Tenant Stock Isolation</span>
            <span aria-hidden="true">·</span>
            <span>ACID Transaction Locking</span>
            <span aria-hidden="true">·</span>
            <span>Python & Java REST Interoperability</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

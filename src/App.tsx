import React, { useState, useEffect } from 'react';
import { BackendType, InventoryItem, ApiLogEntry, UserLocation, KiranaShop, AppRole } from './types';
import { backendEngine } from './services/backendService';
import { DEFAULT_USER_LOCATION, NEARBY_KIRANA_SHOPS } from './data/shopsData';
import { Navbar, BackgroundTheme } from './components/Navbar';
import { LocationPicker } from './components/LocationPicker';
import { NearbyShopsMap } from './components/NearbyShopsMap';
import { PriceComparisonTable } from './components/PriceComparisonTable';
import { Storefront } from './components/Storefront';
import { ShoppingBasket } from './components/ShoppingBasket';
import { StoreDirectory } from './components/StoreDirectory';
import { InventoryManager } from './components/InventoryManager';
import { ApiConsole } from './components/ApiConsole';
import { CodeViewer } from './components/CodeViewer';
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
  const [basket, setBasket] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('kirana_shopping_list_v1');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });
  const [notification, setNotification] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    backend?: BackendType;
  } | null>(null);

  const isDark = currentTheme === 'emerald';

  useEffect(() => {
    try {
      localStorage.setItem('kirana_shopping_list_v1', JSON.stringify(basket));
    } catch {
      // Ignore storage failures
    }
  }, [basket]);

  // Read URL search params on initial load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const shopParam = params.get('shop');
      const roleParam = params.get('role');
      const backendParam = params.get('backend');
      const areaParam = params.get('area');

      if (tabParam && ['storefront', 'basket', 'map', 'compare', 'directory', 'inventory', 'console', 'code'].includes(tabParam)) {
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
      unsubInv();
      unsubLogs();
    };
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
      showNotification(`Demo merchant tools opened for ${activeShop.name}. Access is not protected yet.`, 'info');
    } else {
      showNotification(`Switched to Public Directory Mode`, 'info');
    }
  };

  const handleSelectShop = (shopId: string) => {
    backendEngine.setActiveShop(shopId);
    const shop = backendEngine.getActiveShop();
    setActiveShop(shop);
    showNotification(`Active Store: ${shop.name} (${shop.distance}) · Loaded price list & contact info!`, 'info');
  };

  const handleLocationChange = (loc: UserLocation) => {
    setCurrentLocation(loc);
    showNotification(`Location set to ${loc.name}`, 'info');
  };

  const handleBackendChange = (backend: BackendType) => {
    backendEngine.setBackend(backend);
    setActiveBackend(backend);
    showNotification(
      `Switched Catalog API to ${backend === 'python' ? 'Python (Flask :5000)' : 'Java (Spark :8081)'}`,
      'info',
      backend
    );
  };

  // Inventory Catalog API wrappers (pure catalog management for shopkeepers)
  const handleAddItem = async (itemData: Partial<InventoryItem>): Promise<boolean> => {
    const res = await backendEngine.addItem(itemData);
    if (res.success) {
      showNotification(`Added ${itemData.name} to ${activeShop.name} catalog!`, 'success', activeBackend);
      return true;
    } else {
      showNotification(`Error adding item: ${res.error}`, 'error', activeBackend);
      return false;
    }
  };

  const handleDeleteItem = async (id: number): Promise<boolean> => {
    const success = await backendEngine.deleteItem(id);
    if (success) {
      showNotification('Item removed from catalog directory', 'info', activeBackend);
      return true;
    }
    return false;
  };

  const handleRestockItem = async (id: number, amount: number): Promise<boolean> => {
    const success = await backendEngine.restockItem(id, amount);
    if (success) {
      showNotification(`Updated stock (+${amount} units) for ${activeShop.name}`, 'success', activeBackend);
      return true;
    }
    return false;
  };

  const handleResetDefault = () => {
    backendEngine.resetToDefault();
    setBasket({});
    showNotification('Catalog reset to initial default items', 'info');
  };

  const handleAddToBasket = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.stock <= Number(basket[itemId] || 0)) {
      showNotification(
        item ? `No more ${item.name} listed in stock at ${activeShop.name}.` : 'Item is unavailable.',
        'error'
      );
      return;
    }
    setBasket((prev) => ({ ...prev, [itemId]: Number(prev[itemId] || 0) + 1 }));
    showNotification(`Added ${item.name} to your comparison list.`, 'success');
  };

  const handleChangeBasketQuantity = (itemId: number, delta: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const nextQuantity = Number(basket[itemId] || 0) + delta;
    if (nextQuantity > item.stock) {
      showNotification(`Only ${item.stock} ${item.name} listed at ${activeShop.name}.`, 'error');
      return;
    }
    setBasket((prev) => {
      const next = { ...prev };
      if (nextQuantity <= 0) delete next[itemId];
      else next[itemId] = nextQuantity;
      return next;
    });
  };

  const basketCount = items.reduce((sum, item) => sum + Number(basket[item.id] || 0), 0);

  return (
    <div className={`min-h-screen theme-${currentTheme} transition-colors duration-500 flex flex-col font-sans relative selection:bg-emerald-200 selection:text-emerald-900 ${
      isDark ? 'text-slate-100' : 'text-[#1E293B]'
    }`}>
      {/* Decorative ambient lighting radiance */}
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

      {/* Primary Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeBackend={activeBackend}
        onBackendChange={handleBackendChange}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        activeShop={activeShop}
        allShops={NEARBY_KIRANA_SHOPS}
        onSelectShop={handleSelectShop}
        appRole={appRole}
        onRoleChange={handleRoleChange}
        basketCount={basketCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950">
          <span className="font-bold">Demo data:</span>
          <span>Store details, prices, reviews, and stock are samples. Confirm information directly with each shop.</span>
          {appRole === 'merchant' && (
            <strong className="sm:ml-auto text-rose-700">Merchant tools are not access-protected.</strong>
          )}
        </div>

        {/* Prominent Location Question & Discovery on Storefront and Map */}
        {(currentTab === 'storefront' || currentTab === 'map' || currentTab === 'directory') && (
          <LocationPicker
            currentLocation={currentLocation}
            onLocationChange={handleLocationChange}
            nearbyShops={NEARBY_KIRANA_SHOPS}
            activeShop={activeShop}
            onSelectShop={handleSelectShop}
          />
        )}

        {/* Tab 1: Storefront Catalog with Active Shop Prices */}
        {currentTab === 'storefront' && (
          <Storefront
            items={items}
            activeBackend={activeBackend}
            activeShop={activeShop}
            allShops={NEARBY_KIRANA_SHOPS}
            onSelectShop={handleSelectShop}
            currentLocation={currentLocation}
            onSwitchTab={setCurrentTab}
            onToggleComparePrices={() => setCurrentTab('compare')}
            onAddToBasket={handleAddToBasket}
          />
        )}

        {/* Tab 2: Informational Shopping List Price Comparison */}
        {currentTab === 'basket' && (
          <ShoppingBasket
            items={items}
            shops={NEARBY_KIRANA_SHOPS}
            activeShop={activeShop}
            basket={basket}
            onChangeQuantity={handleChangeBasketQuantity}
            onClearBasket={() => {
              setBasket({});
              showNotification('Cleared your shopping list.', 'info');
            }}
            onSelectShop={handleSelectShop}
            onBrowseCatalog={() => setCurrentTab('storefront')}
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
            onViewStorefront={(shopId) => {
              handleSelectShop(shopId);
              setCurrentTab('storefront');
            }}
          />
        )}

        {/* Tab 4: Store Directory & Contacts */}
        {currentTab === 'directory' && (
          <StoreDirectory
            shops={NEARBY_KIRANA_SHOPS}
            activeShop={activeShop}
            onSelectShop={handleSelectShop}
            currentLocation={currentLocation}
            onViewCatalog={(shopId) => {
              handleSelectShop(shopId);
              setCurrentTab('storefront');
            }}
            onViewMap={() => setCurrentTab('map')}
          />
        )}

        {/* Tab 5: Shop Inventory & Catalog Manager (Merchant Admin) */}
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

        {/* Tab 6: API Console & Telemetry */}
        {currentTab === 'console' && (
          <ApiConsole
            logs={logs}
            activeBackend={activeBackend}
            onBackendChange={handleBackendChange}
            onClearLogs={() => backendEngine.clearLogs()}
          />
        )}

        {/* Tab 7: Backend Code Viewer */}
        {currentTab === 'code' && <CodeViewer />}
      </main>

      {/* Notification Toast */}
      {notification && (
        <div
          role={notification.type === 'error' ? 'alert' : 'status'}
          aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white p-3.5 rounded-xl shadow-lg border border-slate-800 flex items-start gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2"
        >
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
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>RetailNet</span>
            <span aria-hidden="true">·</span>
            <span>{activeShop.name} ({activeShop.distance})</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">{currentLocation.area}</span>
          </div>

          <div className={`flex items-center gap-4 ${isDark ? 'text-emerald-300/60' : 'text-slate-600'}`}>
            <span>Retail directory</span>
            <span aria-hidden="true">·</span>
            <span>Sample listings</span>
            <span aria-hidden="true">·</span>
            <span>Price comparison</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

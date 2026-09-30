import React, { useState } from 'react';
import { BackendType, KiranaShop, AppRole } from '../types';
import { ShoppingBag, Server, Palette, Store, Share2, Check, Lock, Unlock, UserCheck, Shield } from 'lucide-react';

export type BackgroundTheme = 'sandstone' | 'emerald' | 'warm-terracotta';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  activeBackend: BackendType;
  onBackendChange: (backend: BackendType) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentTheme: BackgroundTheme;
  onThemeChange: (theme: BackgroundTheme) => void;
  activeShop: KiranaShop;
  allShops: KiranaShop[];
  onSelectShop: (shopId: string) => void;
  appRole: AppRole;
  onRoleChange: (role: AppRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  activeBackend,
  onBackendChange,
  cartCount,
  onOpenCart,
  currentTheme,
  onThemeChange,
  activeShop,
  allShops,
  onSelectShop,
  appRole,
  onRoleChange,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    }
  };

  // Role-filtered navigation links
  const customerNavItems = [
    { id: 'storefront', label: 'Storefront' },
    { id: 'map', label: 'Google Maps' },
    { id: 'compare', label: 'Compare Prices' },
  ];

  const merchantNavItems = [
    { id: 'pos', label: 'POS Billing' },
    { id: 'inventory', label: 'Stock Manager' },
    { id: 'khata', label: 'Digital Khata' },
    { id: 'storefront', label: 'Storefront Preview' },
    { id: 'compare', label: 'Market Prices' },
  ];

  const navItems = appRole === 'merchant' ? merchantNavItems : customerNavItems;

  const isDark = currentTheme === 'emerald';

  const toggleRole = () => {
    if (appRole === 'customer') {
      onRoleChange('merchant');
      onTabChange('pos');
    } else {
      onRoleChange('customer');
      onTabChange('storefront');
    }
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 border-b ${
      isDark 
        ? 'bg-[#061411]/90 border-emerald-900/50 text-slate-100' 
        : 'bg-white/85 border-amber-900/10 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark & Role Indicator */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onTabChange('storefront')}
            className={`text-left font-bold text-lg tracking-tight transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              isDark ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-700'
            }`}
          >
            <Store className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>KiranaNetwork</span>
          </button>

          {/* Role Badge */}
          <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            appRole === 'merchant'
              ? 'bg-amber-100 text-amber-900 border border-amber-200'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
          }`}>
            {appRole === 'merchant' ? (
              <>
                <Shield className="w-3 h-3 text-amber-700" />
                <span>Shopkeeper Portal</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3 h-3 text-emerald-700" />
                <span>Shopper View</span>
              </>
            )}
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className={`hidden md:flex items-center gap-4 lg:gap-6 text-xs lg:text-sm font-medium ${
          isDark ? 'text-emerald-200/70' : 'text-slate-600'
        }`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                currentTab === item.id
                  ? isDark
                    ? 'text-emerald-300 font-semibold border-b-2 border-emerald-400 -mb-[2px]'
                    : 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-[2px]'
                  : isDark
                    ? 'hover:text-white'
                    : 'hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Shop Switcher Quick Dropdown */}
          <div className="relative inline-flex items-center">
            <label htmlFor="shop-quick-selector" className="sr-only">Active Store</label>
            <div className={`flex items-center rounded-lg p-1 border text-xs ${
              isDark 
                ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-200' 
                : 'bg-emerald-50/70 border-emerald-200/60 text-emerald-950'
            }`}>
              <Store className="w-3.5 h-3.5 ml-1 mr-1 text-emerald-600 shrink-0" />
              <select
                id="shop-quick-selector"
                value={activeShop.id}
                onChange={(e) => onSelectShop(e.target.value)}
                className={`font-semibold py-1 px-1.5 rounded-md border-0 text-xs focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-[#08201A] text-emerald-100'
                    : 'bg-white text-emerald-950'
                }`}
              >
                {allShops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.distance})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Toggle Button (Customer <-> Merchant) */}
          <button
            onClick={toggleRole}
            title={appRole === 'merchant' ? 'Switch back to Customer view' : 'Enter Shopkeeper & POS Terminal mode'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
              appRole === 'merchant'
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-2xs'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-2xs'
            }`}
          >
            {appRole === 'merchant' ? (
              <>
                <Unlock className="w-3 h-3" />
                <span className="hidden xl:inline">Exit to Shopper</span>
                <span className="xl:hidden">Shopper</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span className="hidden xl:inline">Shopkeeper Login</span>
                <span className="xl:hidden">Merchant</span>
              </>
            )}
          </button>

          {/* Backend Selector */}
          <div className="hidden sm:inline-flex relative items-center">
            <label htmlFor="backend-selector" className="sr-only">Active API Backend</label>
            <div className={`flex items-center rounded-lg p-1 border text-xs ${
              isDark 
                ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-200' 
                : 'bg-slate-100/70 border-slate-200/60 text-slate-700'
            }`}>
              <span className={`text-[10px] font-mono uppercase px-1.5 flex items-center gap-1 ${
                isDark ? 'text-emerald-300' : 'text-slate-500'
              }`}>
                <Server className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-slate-400'}`} />
                API:
              </span>
              <select
                id="backend-selector"
                value={activeBackend}
                onChange={(e) => onBackendChange(e.target.value as BackendType)}
                className={`font-medium py-1 px-1.5 rounded-md border-0 text-xs shadow-xs focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-[#08201A] text-emerald-100'
                    : 'bg-white text-slate-800'
                }`}
              >
                <option value="python">Python (:5000)</option>
                <option value="java">Java (:8081)</option>
              </select>
            </div>
          </div>

          {/* Background Theme Selector */}
          <div className="hidden lg:inline-flex relative items-center">
            <label htmlFor="theme-selector" className="sr-only">Background Theme</label>
            <div className={`flex items-center rounded-lg p-1 border text-xs ${
              isDark 
                ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-200' 
                : 'bg-amber-50/70 border-amber-200/60 text-slate-700'
            }`}>
              <Palette className={`w-3.5 h-3.5 ml-1 mr-1 ${isDark ? 'text-emerald-400' : 'text-amber-700'}`} />
              <select
                id="theme-selector"
                value={currentTheme}
                onChange={(e) => onThemeChange(e.target.value as BackgroundTheme)}
                aria-label="Background Theme Selector"
                className={`font-medium py-1 px-1.5 rounded-md border-0 text-xs shadow-xs focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-[#08201A] text-emerald-100'
                    : 'bg-white text-slate-800'
                }`}
              >
                <option value="sandstone">Sandstone</option>
                <option value="emerald">Emerald</option>
                <option value="warm-terracotta">Terracotta</option>
              </select>
            </div>
          </div>

          {/* Share App URL Button */}
          <button
            onClick={handleShareUrl}
            title="Copy current page link with active filters"
            aria-label="Copy shareable URL"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
              copiedUrl
                ? 'bg-emerald-600 text-white border-emerald-600'
                : isDark
                ? 'bg-emerald-950/70 hover:bg-emerald-900/80 border-emerald-800/60 text-emerald-200'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{copiedUrl ? 'Copied Link!' : 'Share URL'}</span>
          </button>

          {/* POS Cart Bag */}
          <button
            onClick={onOpenCart}
            aria-label={`View billing cart with ${cartCount} items`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="font-mono tabular-nums bg-emerald-900/60 px-1.5 py-0.5 rounded text-[11px]">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className={`md:hidden border-t px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium ${
        isDark
          ? 'border-emerald-900/40 text-emerald-200/70'
          : 'border-slate-100 text-slate-600'
      }`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`whitespace-nowrap pb-1 cursor-pointer ${
              currentTab === item.id
                ? isDark
                  ? 'text-emerald-300 font-semibold border-b-2 border-emerald-400'
                  : 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : isDark
                  ? 'hover:text-white'
                  : 'hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

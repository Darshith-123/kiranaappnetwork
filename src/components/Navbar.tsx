import React, { useState } from 'react';
import { BackendType, KiranaShop, AppRole } from '../types';
import { Server, Palette, Store, Share2, Check, Lock, Unlock, UserCheck, Shield, MapPin, TrendingDown, BookOpen } from 'lucide-react';

export type BackgroundTheme = 'sandstone' | 'emerald' | 'warm-terracotta';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  activeBackend: BackendType;
  onBackendChange: (backend: BackendType) => void;
  currentTheme: BackgroundTheme;
  onThemeChange: (theme: BackgroundTheme) => void;
  activeShop: KiranaShop;
  allShops: KiranaShop[];
  onSelectShop: (shopId: string) => void;
  appRole: AppRole;
  onRoleChange: (role: AppRole) => void;
  basketCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  activeBackend,
  onBackendChange,
  currentTheme,
  onThemeChange,
  activeShop,
  allShops,
  onSelectShop,
  appRole,
  onRoleChange,
  basketCount = 0,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleShareUrl = async () => {
    try {
      const url = new URL(window.location.href);
      if (url.hostname.startsWith('ais-dev-')) {
        url.hostname = url.hostname.replace(/^ais-dev-/, 'ais-pre-');
      }
      await navigator.clipboard.writeText(url.toString());
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    }
  };

  // Informational Navigation Links
  const publicNavItems = [
    { id: 'storefront', label: 'Item Catalogs' },
    { id: 'basket', label: `My Basket${basketCount > 0 ? ` (${basketCount})` : ''}` },
    { id: 'compare', label: 'Compare Prices' },
    { id: 'map', label: 'Radar Map' },
    { id: 'directory', label: 'Store Directory' },
  ];

  const adminNavItems = [
    { id: 'inventory', label: 'Catalog Manager' },
    { id: 'console', label: 'API Simulator' },
    { id: 'code', label: 'Architecture' },
  ];

  const navItems = appRole === 'merchant' 
    ? [...publicNavItems, ...adminNavItems]
    : publicNavItems;

  const themes: { id: BackgroundTheme; label: string }[] = [
    { id: 'sandstone', label: 'Sandstone Warm' },
    { id: 'emerald', label: 'Emerald Dark' },
    { id: 'warm-terracotta', label: 'Terracotta' },
  ];

  const isDark = currentTheme === 'emerald';

  const toggleRole = () => {
    if (appRole === 'customer') {
      onRoleChange('merchant');
    } else {
      onRoleChange('customer');
      if (['inventory', 'console', 'code'].includes(currentTab)) {
        onTabChange('storefront');
      }
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
            className={`text-left font-bold text-lg tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              isDark ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-700'
            }`}
          >
            <Store className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>RetailNet</span>
          </button>

          {/* Directory Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
            <BookOpen className="w-3 h-3 text-emerald-700" />
            <span>Local Price & Store Directory</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links (Pure Informational) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Controls (Store Selector, Backend, Share, Theme) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Store Switcher Dropdown */}
          <div className="relative">
            <select
              value={activeShop.id}
              onChange={(e) => onSelectShop(e.target.value)}
              className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              title="Select Active Kirana Store"
            >
              {allShops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name.replace(' Store', '').replace(' Shop', '')} ({s.distance})
                </option>
              ))}
            </select>
          </div>

          {/* Dual Backend Pill Switcher */}
          <div className="hidden lg:flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              onClick={() => onBackendChange('python')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeBackend === 'python'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flask :5000
            </button>
            <button
              onClick={() => onBackendChange('java')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeBackend === 'java'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Spark :8081
            </button>
          </div>

          {/* Share App Link Button */}
          <button
            onClick={handleShareUrl}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="Copy share link"
          >
            {copiedUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-medium text-emerald-600 hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Theme Palette Switcher */}
          <div className="relative group">
            <button
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Change Background Theme"
            >
              <Palette className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-1 w-36 py-1.5 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    currentTheme === t.id
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{t.label}</span>
                  {currentTheme === t.id && <Check className="w-3 h-3 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Role Toggle Button (Shopper Directory vs Shopkeeper Portal) */}
          <button
            onClick={toggleRole}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              appRole === 'merchant'
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
            title={appRole === 'merchant' ? 'Switch to Shopper View' : 'Switch to Shopkeeper Portal'}
          >
            {appRole === 'merchant' ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Merchant tools: ON</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Merchant tools</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Secondary Tab Navigation */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-200/60 bg-slate-50/70 gap-1 text-xs">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 bg-white/70 border border-slate-200/50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

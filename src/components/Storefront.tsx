import React, { useState } from 'react';
import { InventoryItem, BackendType, KiranaShop, UserLocation } from '../types';
import { 
  Search, 
  ArrowRight, 
  Store, 
  MapPin, 
  TrendingDown, 
  Star, 
  Phone, 
  MessageSquare, 
  Info,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface StorefrontProps {
  items: InventoryItem[];
  activeBackend: BackendType;
  activeShop: KiranaShop;
  allShops: KiranaShop[];
  onSelectShop: (shopId: string) => void;
  currentLocation: UserLocation;
  onSwitchTab: (tab: string) => void;
  onToggleComparePrices: () => void;
  onAddToBasket: (itemId: number) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  items,
  activeBackend,
  activeShop,
  allShops,
  onSelectShop,
  currentLocation,
  onSwitchTab,
  onToggleComparePrices,
  onAddToBasket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Grains & Atta', 'Pulses & Dal', 'Oils & Ghee', 'Spices & Masala', 'Beverages', 'Daily Essentials'];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.hindiName && item.hindiName.includes(searchQuery)) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cleanPhone = activeShop.phone.replace(/[^0-9]/g, '');

  return (
    <div className="space-y-8 pb-16">
      {/* Active Shop & Location Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-emerald-700 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-900 text-base">{activeShop.name}</span>
              <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2 py-0.5 rounded-md">
                {activeShop.distance} away
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {activeShop.rating} ({activeShop.reviewsCount} reviews)
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeShop.timing}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeShop.address} · <span className="text-slate-700 font-medium">Near {currentLocation.area}</span> · Proprietor: <span className="font-medium text-slate-700">{activeShop.owner}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Phone Call */}
          <a
            href={`tel:${cleanPhone}`}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call Store</span>
          </a>

          {/* Compare Prices */}
          <button
            onClick={onToggleComparePrices}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200/80 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>Compare 4 Shop Prices</span>
          </button>

          {/* Directory */}
          <button
            onClick={() => onSwitchTab('directory')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Stores Directory</span>
          </button>
        </div>
      </div>

      {/* Hero Showcase Information */}
      <section className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-sm">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium tracking-wide">
              <span>{currentLocation.name}</span>
              <span aria-hidden="true">·</span>
              <span>{activeShop.distance}</span>
              <span aria-hidden="true">·</span>
              <span>Sample store listing</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Everyday groceries. Clear local prices.
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              Compare listed prices for rice, flour, oils, lentils, spices, and daily essentials. Check availability and contact local shopkeepers directly.
            </p>

            {/* Quick Informational Highlights */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Compare listed prices</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Build a shopping basket</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>Contact stores directly</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-800/70 border border-slate-700/80 rounded-xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-700 pb-2">
              <span className="font-semibold text-white">Active Store Profile</span>
              <span className="text-emerald-400 font-mono text-[11px]">{activeShop.distance}</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm">{activeShop.name}</p>
              <p className="text-slate-400 text-xs mt-0.5">{activeShop.address}</p>
            </div>
            <div className="space-y-1 text-slate-300 pt-1">
              <p><span className="text-slate-400">Timings:</span> {activeShop.timing}</p>
              <p><span className="text-slate-400">Phone:</span> {activeShop.phone}</p>
              <p><span className="text-slate-400">Specialty:</span> {activeShop.specialty}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Category Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by English or Hindi name (e.g. Rice, Chana, Dal)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all shadow-2xs"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredItems.length}</strong> items in catalog
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Catalog Grid (Informational Only) */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">No matching items found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for another term like &quot;Rice&quot;, &quot;Oil&quot;, &quot;Atta&quot;, or select &quot;All&quot; categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline pt-2"
          >
            Clear filters and view all items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isOutOfStock = item.stock <= 0;
            const isLowStock = item.stock > 0 && item.stock <= 10;

            // Check if this shop has the lowest price for this item
            const allPrices = allShops.map((s) => s.itemPrices[item.id] !== undefined ? s.itemPrices[item.id] : item.price);
            const lowestPrice = Math.min(...allPrices);
            const isLowestHere = item.price === lowestPrice;

            return (
              <div
                key={item.id}
                className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-150"
              >
                {/* Product Card Image Container */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-50 to-slate-100">
                      <span className="text-2xl font-bold text-slate-300 mb-1">
                        #{item.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        {item.category || 'Kirana Item'}
                      </span>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {isLowestHere && (
                      <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                        Lowest Price in Area
                      </div>
                    )}
                  </div>

                  {isOutOfStock ? (
                    <div className="absolute top-2.5 right-2.5 bg-rose-600/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs">
                      Out of Stock
                    </div>
                  ) : isLowStock ? (
                    <div className="absolute top-2.5 right-2.5 bg-amber-600/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs">
                      Limited Stock ({item.stock})
                    </div>
                  ) : (
                    <div className="absolute top-2.5 right-2.5 bg-emerald-700/90 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
                      In Stock
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{item.category || 'Kirana Essential'}</span>
                      <span className="font-mono text-slate-400">Item #{item.id}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors mt-0.5">
                      {item.name}
                    </h3>

                    {item.hindiName && (
                      <p className="text-xs text-slate-500 font-medium">
                        {item.hindiName}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Price and Stock Baseline */}
                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Price at {activeShop.name.replace(' Store', '').replace(' Shop', '')}:
                      </div>
                      <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                        ₹{item.price}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        / {item.unit || 'unit'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-1 font-mono tabular-nums">
                      <span>Available:</span>
                      <span className={isOutOfStock ? 'text-rose-600 font-bold' : 'text-slate-800 font-medium'}>
                        {item.stock} {item.unit || 'units'}
                      </span>
                    </div>
                  </div>

                  {/* Cross-Shop Comparison Summary */}
                  <div className="bg-slate-50/90 p-2.5 rounded-lg text-[10px] text-slate-500 space-y-1">
                    <span className="font-medium text-slate-700 block">Nearby shop price comparison:</span>
                    <div className="grid grid-cols-2 gap-1 font-mono">
                      {allShops.map((s) => (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between p-1 rounded ${
                            s.id === activeShop.id ? 'bg-emerald-100/60 font-bold text-emerald-900' : 'text-slate-600'
                          }`}
                        >
                          <span className="truncate">{s.name.split(' ')[0]}:</span>
                          <span>₹{s.itemPrices[item.id] || item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Informational Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                    {/* WhatsApp Inquiry */}
                    <a
                      href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                        `Hi ${activeShop.name}, is ${item.name} (${item.unit || '1 unit'}) available in stock at ₹${item.price}?`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Compare Across Shops Button */}
                    <button
                      onClick={onToggleComparePrices}
                      className="py-2 px-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <TrendingDown className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Compare</span>
                    </button>

                    {/* Add to Informational Shopping List */}
                    <button
                      onClick={() => onAddToBasket(item.id)}
                      aria-label={`Add ${item.name} to basket`}
                      className="py-2 px-1.5 font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <span>Add to list</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

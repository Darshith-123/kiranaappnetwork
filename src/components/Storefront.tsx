import React, { useState } from 'react';
import { InventoryItem, BackendType, KiranaShop, UserLocation } from '../types';
import { Search, ShoppingCart, Zap, ArrowRight, Store, MapPin, TrendingDown, Star } from 'lucide-react';

interface StorefrontProps {
  items: InventoryItem[];
  activeBackend: BackendType;
  activeShop: KiranaShop;
  allShops: KiranaShop[];
  onSelectShop: (shopId: string) => void;
  currentLocation: UserLocation;
  onQuickPurchase: (itemId: number) => Promise<void>;
  onAddToCart: (item: InventoryItem) => void;
  onSwitchTab: (tab: string) => void;
  purchasingItemId: number | null;
  onToggleComparePrices: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  items,
  activeBackend,
  activeShop,
  allShops,
  onSelectShop,
  currentLocation,
  onQuickPurchase,
  onAddToCart,
  onSwitchTab,
  purchasingItemId,
  onToggleComparePrices,
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

  return (
    <div className="space-y-8 pb-16">
      {/* Active Shop & Location Banner */}
      <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeShop.address} · <span className="text-slate-700 font-medium">Near {currentLocation.area}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleComparePrices}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200/80 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>Compare 4 Shop Prices</span>
          </button>

          <button
            onClick={() => onSwitchTab('map')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch Store on Map</span>
          </button>
        </div>
      </div>

      {/* Hero Showcase */}
      <section className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-sm">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium tracking-wide">
              <span>{currentLocation.name}</span>
              <span aria-hidden="true">·</span>
              <span>Shop Distance: {activeShop.distance}</span>
              <span aria-hidden="true">·</span>
              <span>Backend: {activeBackend === 'python' ? 'Python Flask (:5000)' : 'Java Spark (:8081)'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Fresh Daily Groceries at {activeShop.name}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Showing live catalog prices for <strong className="text-white">{activeShop.name}</strong> located {activeShop.distance} from {currentLocation.area}. All purchases and POS transactions execute directly on the shared <span className="font-mono text-emerald-300 text-xs px-1.5 py-0.5 bg-slate-800 rounded">inventory.json</span>.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSwitchTab('pos')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Open POS Billing Counter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onSwitchTab('inventory')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
              >
                Manage Inventory Table
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] border border-slate-700/60 shadow-lg">
              <img
                src="/src/assets/images/hero_kirana_store_1790520296336.jpg"
                alt="Kirana Store Hyderabad Spices and Grains Display"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-xs text-slate-200">
                  <span className="font-medium text-white">{activeShop.name}</span> · {activeShop.distance} from Saraswathi Nagar
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Filter Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1 bg-slate-100 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rice, sugar, oil, pulses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Results summary unboxed metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span>Showing {filteredItems.length} items at <strong>{activeShop.name}</strong></span>
            <span aria-hidden="true">·</span>
            <span>API Target: <code className="font-mono text-slate-700">{activeBackend === 'python' ? 'http://localhost:5000/api' : 'http://localhost:8081/api'}</code></span>
          </div>
          <span className="hidden sm:inline">Prices set per store location</span>
        </div>
      </section>

      {/* Product Catalog Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8">
          <p className="text-slate-600 text-sm font-medium">No items match your query.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="mt-3 text-xs text-emerald-700 font-semibold hover:underline"
          >
            Clear filters and view all items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isOutOfStock = item.stock <= 0;
            const isLowStock = item.stock > 0 && item.stock <= 10;
            const isBusy = purchasingItemId === item.id;

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
                    /* Fallback Container for Zero-Broken-Image Policy */
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
                        Lowest Price
                      </div>
                    )}
                  </div>

                  {isOutOfStock ? (
                    <div className="absolute top-2.5 right-2.5 bg-rose-600/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs">
                      Out of Stock
                    </div>
                  ) : isLowStock ? (
                    <div className="absolute top-2.5 right-2.5 bg-amber-600/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs">
                      Low Stock ({item.stock})
                    </div>
                  ) : null}
                </div>

                {/* Product Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{item.category || 'Kirana Essential'}</span>
                      <span className="font-mono text-slate-400">ID: {item.id}</span>
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
                      <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                        ₹{item.price}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        / {item.unit || 'unit'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-1 font-mono tabular-nums">
                      <span>Stock:</span>
                      <span className={isOutOfStock ? 'text-rose-600 font-bold' : isLowStock ? 'text-amber-600 font-semibold' : 'text-slate-800'}>
                        {item.stock}
                      </span>
                    </div>
                  </div>

                  {/* Other nearby shops prices comparison preview */}
                  <div className="bg-slate-50/80 p-2 rounded-lg text-[10px] text-slate-500 space-y-0.5">
                    <span className="font-medium text-slate-700">Nearby comparison:</span>
                    <div className="flex items-center justify-between font-mono">
                      {allShops.map((s) => (
                        <span
                          key={s.id}
                          className={s.id === activeShop.id ? 'font-bold text-emerald-800' : 'text-slate-500'}
                          title={`${s.name} (${s.distance})`}
                        >
                          {s.name.split(' ')[0]}: ₹{s.itemPrices[item.id] || item.price}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onQuickPurchase(item.id)}
                      disabled={isOutOfStock || isBusy}
                      title={`Calls POST /api/purchase/${item.id} on ${activeBackend}`}
                      className={`py-2 px-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isBusy
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isBusy ? 'Buying...' : 'Quick Buy (1)'}</span>
                    </button>

                    <button
                      onClick={() => onAddToCart(item)}
                      disabled={isOutOfStock}
                      className="py-2 px-2.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Bill</span>
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


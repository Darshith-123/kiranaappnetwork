import React from 'react';
import { InventoryItem, KiranaShop } from '../types';
import { Star, Sparkles, TrendingDown, ArrowRight, Store, ExternalLink } from 'lucide-react';

interface PriceComparisonTableProps {
  items: InventoryItem[];
  shops: KiranaShop[];
  activeShop: KiranaShop;
  onSelectShop: (shopId: string) => void;
  onViewStorefront: (shopId: string) => void;
}

export const PriceComparisonTable: React.FC<PriceComparisonTableProps> = ({
  items,
  shops,
  activeShop,
  onSelectShop,
  onViewStorefront,
}) => {
  // Compute total basket price for each shop
  const shopTotals = shops.map((shop) => {
    const total = items.reduce((acc, item) => {
      const p = shop.itemPrices[item.id] !== undefined ? shop.itemPrices[item.id] : item.price;
      return acc + p;
    }, 0);
    return { shop, total };
  });

  const cheapestShopEntry = [...shopTotals].sort((a, b) => a.total - b.total)[0];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header and Basket Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 tracking-wide uppercase">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Real-Time Price Intelligence · Hyderabad LB Nagar</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Compare Grocery Item Rates Across All 4 Nearby Kirana Stores
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent price matrix for everyday kitchen essentials. Click any store column to set it as your active store.
          </p>
        </div>

        {/* Basket value summary */}
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs space-y-1">
          <div className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Best Full-Basket Deal:</span>
          </div>
          <div className="font-bold text-slate-900">
            {cheapestShopEntry.shop.name} ({cheapestShopEntry.shop.distance})
          </div>
          <div className="text-xs text-emerald-900 font-mono">
            Total for all {items.length} staples: <strong className="text-emerald-700 text-sm">₹{cheapestShopEntry.total}</strong>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <th className="py-3 px-4 font-semibold whitespace-nowrap min-w-[180px]">
                Grocery Item
              </th>
              <th className="py-3 px-3 font-semibold text-center whitespace-nowrap">
                Unit
              </th>
              {shops.map((shop) => {
                const isActive = activeShop.id === shop.id;
                return (
                  <th
                    key={shop.id}
                    onClick={() => onSelectShop(shop.id)}
                    className={`py-3 px-4 text-center cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-emerald-100/60 text-emerald-950 font-bold border-x-2 border-emerald-600'
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold">{shop.name.replace(' Store', '').replace(' Shop', '')}</span>
                      <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                        {shop.distance} · ⭐ {shop.rating}
                      </span>
                      {isActive && (
                        <span className="mt-1 px-1.5 py-0.5 bg-emerald-700 text-white rounded text-[9px] uppercase tracking-wider font-semibold">
                          Active Store
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="py-3 px-4 font-semibold text-center whitespace-nowrap min-w-[140px]">
                Lowest Price Store
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              // Calculate minimum price among all 4 shops
              const prices = shops.map((s) => (s.itemPrices[item.id] !== undefined ? s.itemPrices[item.id] : item.price));
              const minPrice = Math.min(...prices);
              const cheapestShops = shops
                .map((s, idx) => ({ shop: s, price: prices[idx] }))
                .filter((p) => p.price === minPrice);

              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Item Name & Details */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    {item.hindiName && (
                      <div className="text-[11px] text-slate-500 font-medium">{item.hindiName}</div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.category}</div>
                  </td>

                  {/* Unit */}
                  <td className="py-3.5 px-3 text-center text-slate-500 font-mono">
                    /{item.unit || 'unit'}
                  </td>

                  {/* Prices for each shop */}
                  {shops.map((shop) => {
                    const price = shop.itemPrices[item.id] !== undefined ? shop.itemPrices[item.id] : item.price;
                    const isLowest = price === minPrice;
                    const isActive = activeShop.id === shop.id;

                    return (
                      <td
                        key={shop.id}
                        onClick={() => onSelectShop(shop.id)}
                        className={`py-3.5 px-4 text-center cursor-pointer transition-colors font-mono tabular-nums ${
                          isActive
                            ? 'bg-emerald-50/50 font-bold border-x-2 border-emerald-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-sm ${isLowest ? 'text-emerald-700 font-bold' : 'text-slate-800'}`}>
                            ₹{price}
                          </span>
                          {isLowest && (
                            <span className="text-[9px] font-sans font-bold text-emerald-800 bg-emerald-100 px-1 rounded mt-0.5">
                              Lowest Price
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Cheapest Store Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded text-[11px]">
                      {cheapestShops.map((c) => c.shop.name.replace(' Store', '').replace(' Shop', '')).join(', ')} (₹{minPrice})
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-200">
              <td colSpan={2} className="py-4 px-4 text-slate-900 text-sm">
                Full Basket Total (All {items.length} Staples)
              </td>
              {shops.map((shop) => {
                const totalEntry = shopTotals.find((t) => t.shop.id === shop.id)!;
                const isBest = totalEntry.shop.id === cheapestShopEntry.shop.id;
                const isActive = activeShop.id === shop.id;

                return (
                  <td
                    key={shop.id}
                    onClick={() => onSelectShop(shop.id)}
                    className={`py-4 px-4 text-center font-mono tabular-nums text-base cursor-pointer ${
                      isActive ? 'bg-emerald-100/70 text-emerald-950 border-x-2 border-emerald-600' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={isBest ? 'text-emerald-700 font-bold text-base' : 'text-slate-900'}>
                        ₹{totalEntry.total}
                      </span>
                      {isBest && (
                        <span className="text-[10px] font-sans font-bold text-emerald-800 bg-emerald-200/80 px-1.5 rounded mt-0.5">
                          Cheapest Total
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
              <td className="py-4 px-4 text-center text-xs text-slate-600 font-semibold">
                Save up to ₹{Math.max(...shopTotals.map(t => t.total)) - Math.min(...shopTotals.map(t => t.total))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Navigation to Store Directory */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>Want to view contact numbers and operating hours for each store?</span>
        </div>
        <button
          onClick={() => onViewStorefront(activeShop.id)}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5"
        >
          <span>View {activeShop.name} Catalog</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>
    </div>
  );
};

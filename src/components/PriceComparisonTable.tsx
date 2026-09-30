import React from 'react';
import { InventoryItem, KiranaShop } from '../types';
import { Check, Star, Zap, ShoppingCart, Sparkles, TrendingDown } from 'lucide-react';

interface PriceComparisonTableProps {
  items: InventoryItem[];
  shops: KiranaShop[];
  activeShop: KiranaShop;
  onSelectShop: (shopId: string) => void;
  onAddToCart: (item: InventoryItem) => void;
  onQuickBuy: (itemId: number) => void;
}

export const PriceComparisonTable: React.FC<PriceComparisonTableProps> = ({
  items,
  shops,
  activeShop,
  onSelectShop,
  onAddToCart,
  onQuickBuy,
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
            <span>Price Comparison Engine · Hyderabad LB Nagar</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Compare Grocery Item Prices Across All 4 Nearby Kirana Stores
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any column header to activate that shop. Prices update dynamically for individual items, POS billing, and cash memos.
          </p>
        </div>

        {/* Basket value summary */}
        <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs space-y-1">
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
                    className={`py-3 px-4 font-semibold text-center cursor-pointer transition-colors whitespace-nowrap select-none ${
                      isActive
                        ? 'bg-emerald-100/70 text-emerald-950 font-bold border-x-2 border-emerald-600'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <span>{shop.name}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal mt-0.5 font-mono">
                        <span className="font-bold text-emerald-700">{shop.distance}</span>
                        <span>·</span>
                        <span>{shop.rating} ★</span>
                      </div>
                    </div>
                  </th>
                );
              })}
              <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                Cheapest At
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              // Find min price for this item across all 4 shops
              const prices = shops.map((s) => ({
                shop: s,
                price: s.itemPrices[item.id] !== undefined ? s.itemPrices[item.id] : item.price,
              }));
              const minPrice = Math.min(...prices.map((p) => p.price));
              const cheapestShops = prices.filter((p) => p.price === minPrice);

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Item info */}
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <div className="font-semibold">{item.name}</div>
                    {item.hindiName && (
                      <div className="text-[11px] text-slate-500">{item.hindiName}</div>
                    )}
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
                Full Basket Total (All 8 Staples)
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
              <td className="py-4 px-4 text-center text-xs text-slate-500">
                Save up to ₹{Math.max(...shopTotals.map(t => t.total)) - Math.min(...shopTotals.map(t => t.total))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

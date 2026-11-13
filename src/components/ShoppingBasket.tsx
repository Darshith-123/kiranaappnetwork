import React from 'react';
import { InventoryItem, KiranaShop } from '../types';
import { ShoppingBag, Trash2, Plus, Minus, Sparkles, ArrowRight, Store } from 'lucide-react';

interface ShoppingBasketProps {
  items: InventoryItem[];
  shops: KiranaShop[];
  activeShop: KiranaShop;
  basket: Record<number, number>;
  onChangeQuantity: (itemId: number, delta: number) => void;
  onClearBasket: () => void;
  onSelectShop: (shopId: string) => void;
  onBrowseCatalog: () => void;
}

export const ShoppingBasket: React.FC<ShoppingBasketProps> = ({
  items,
  shops,
  activeShop,
  basket,
  onChangeQuantity,
  onClearBasket,
  onSelectShop,
  onBrowseCatalog,
}) => {
  const basketItems = items.filter((item) => Number(basket[item.id]) > 0);
  const totalUnits = basketItems.reduce((sum, item) => sum + Number(basket[item.id]), 0);

  const basketTotals = shops.map((shop) => ({
    shop,
    total: basketItems.reduce(
      (sum, item) => sum + (shop.itemPrices[item.id] ?? item.price) * Number(basket[item.id]),
      0
    ),
  }));

  const cheapestBasket = basketTotals.length
    ? basketTotals.reduce((best, entry) => (entry.total < best.total ? entry : best))
    : null;

  const maxTotal = basketTotals.length
    ? Math.max(...basketTotals.map((entry) => entry.total))
    : 0;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-slate-900 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Your Shopping List</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-0.5 tracking-tight">
            Basket Price Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare the total cost of your custom grocery list across all 4 neighborhood Kirana stores. Sample prices only — confirm availability directly with the store.
          </p>
        </div>

        {totalUnits > 0 && (
          <button
            onClick={onClearBasket}
            className="self-start sm:self-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear List</span>
          </button>
        )}
      </div>

      {basketItems.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your shopping list is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add groceries from the Item Catalogs to calculate and compare the total cost across nearby stores.
          </p>
          <button
            onClick={onBrowseCatalog}
            className="mt-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Browse Item Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[600px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-3 px-4 font-semibold">Item</th>
                  <th className="py-3 px-4 text-center font-semibold">Quantity</th>
                  <th className="py-3 px-4 text-right font-semibold">
                    Rate at {activeShop.name.replace(' Store', '').replace(' Shop', '')}
                  </th>
                  <th className="py-3 px-4 text-right font-semibold">Estimated Total</th>
                  <th className="py-3 px-4 text-right font-semibold">Listed Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {basketItems.map((item) => {
                  const quantity = Number(basket[item.id]);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500">per {item.unit || 'unit'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onChangeQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="min-w-6 text-center font-mono font-bold text-slate-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onChangeQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">₹{item.price}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{item.price * quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className={item.stock >= quantity ? 'text-emerald-700 font-medium' : 'text-rose-600 font-semibold'}>
                          {item.stock >= quantity ? `${item.stock} available` : 'Check with store'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {cheapestBasket && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Best List Match</span>
                  </div>
                  <div className="mt-1 font-bold text-slate-900 text-sm">
                    Lowest listed total: {cheapestBasket.shop.name} ({cheapestBasket.shop.distance})
                  </div>
                  <div className="text-xs text-slate-600">
                    Calculated from the quantities in your shopping list across all 4 stores.
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-extrabold text-emerald-800 font-mono">₹{cheapestBasket.total}</div>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    Save up to ₹{maxTotal - cheapestBasket.total} vs. highest local rate
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {basketTotals.map((entry) => {
              const isCheapest = cheapestBasket?.shop.id === entry.shop.id;
              const isSelected = activeShop.id === entry.shop.id;
              return (
                <button
                  key={entry.shop.id}
                  onClick={() => onSelectShop(entry.shop.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isCheapest
                      ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                      : isSelected
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">{entry.shop.name}</span>
                    <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                  <div className="mt-1.5 text-lg font-bold font-mono text-slate-900">₹{entry.total}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isCheapest ? 'Lowest listed total' : `${entry.shop.distance} away · Click to select`}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};

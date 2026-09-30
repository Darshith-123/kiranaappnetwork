import React from 'react';
import { CartItem, BackendType } from '../types';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  activeBackend: BackendType;
  onUpdateQuantity: (itemId: number, qty: number) => void;
  onRemoveFromCart: (itemId: number) => void;
  onProceedToPos: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  activeBackend,
  onUpdateQuantity,
  onRemoveFromCart,
  onProceedToPos,
}) => {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Customer Cart ({cart.reduce((s, c) => s + c.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="p-4 flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <ShoppingBag className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                <p>Your cart is empty.</p>
                <p className="text-[11px] text-slate-400">
                  Select grocery items from the storefront.
                </p>
              </div>
            ) : (
              cart.map((line) => (
                <div key={line.item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {line.item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      ₹{line.item.price} / {line.item.unit || 'unit'}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md">
                    <button
                      onClick={() => onUpdateQuantity(line.item.id, line.quantity - 1)}
                      className="p-1 text-slate-600 hover:bg-white rounded transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono tabular-nums font-semibold px-1 text-slate-800">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(line.item.id, line.quantity + 1)}
                      disabled={line.quantity >= line.item.stock}
                      className="p-1 text-slate-600 hover:bg-white rounded transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-16 text-right font-mono tabular-nums font-semibold text-slate-900">
                    ₹{line.item.price * line.quantity}
                  </div>

                  <button
                    onClick={() => onRemoveFromCart(line.item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                  ₹{total}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Active Backend:</span>
                <span className="font-mono font-medium text-slate-600">
                  {activeBackend === 'python' ? 'Python (:5000)' : 'Java (:8081)'}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onProceedToPos();
                }}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Go to POS & Print Cash Memo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

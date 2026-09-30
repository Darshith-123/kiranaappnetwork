import React, { useState } from 'react';
import { InventoryItem, CartItem, BillReceipt, BackendType, KiranaShop } from '../types';
import { backendEngine } from '../services/backendService';
import { ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle, Receipt, User, Phone, Store, Barcode, Volume2, AlertCircle } from 'lucide-react';

interface POSBillingProps {
  cart: CartItem[];
  items: InventoryItem[];
  activeBackend: BackendType;
  activeShop: KiranaShop;
  onUpdateQuantity: (itemId: number, newQty: number) => void;
  onRemoveFromCart: (itemId: number) => void;
  onClearCart: () => void;
  onAddToCart: (item: InventoryItem) => void;
  onCheckout: (customerName: string, customerPhone: string, paymentMode: 'Cash' | 'UPI / QR' | 'Khata (Credit)') => Promise<BillReceipt | null>;
  onOpenReceipt: (receipt: BillReceipt) => void;
  recentReceipts: BillReceipt[];
}

export const POSBilling: React.FC<POSBillingProps> = ({
  cart,
  items,
  activeBackend,
  activeShop,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onAddToCart,
  onCheckout,
  onOpenReceipt,
  recentReceipts,
}) => {
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI / QR' | 'Khata (Credit)'>('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const discount = 0;
  const grandTotal = subtotal - discount;

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = items.find(
      i => i.barcode === barcodeInput.trim() || i.id.toString() === barcodeInput.trim()
    );

    if (matched) {
      if (matched.stock > 0) {
        onAddToCart(matched);
        setScanMessage(`Scanned & Added: ${matched.name} (₹${matched.price})`);
      } else {
        setScanMessage(`Out of Stock: ${matched.name}`);
      }
    } else {
      setScanMessage(`Barcode ${barcodeInput} not recognized in catalog`);
    }

    setBarcodeInput('');
    setTimeout(() => setScanMessage(null), 3500);
  };

  const handleProcessBill = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const receipt = await onCheckout(customerName, customerPhone, paymentMode);
    setIsProcessing(false);

    if (receipt) {
      // If Khata (Credit) was chosen, automatically save to shop's digital ledger
      if (paymentMode === 'Khata (Credit)') {
        backendEngine.addKhataEntry({
          customerName: customerName.trim() || 'Neighborhood Customer',
          customerPhone: customerPhone.trim() || '+91 98000 00000',
          amount: receipt.total,
          shopId: activeShop.id,
          invoiceNumber: receipt.invoiceNumber
        });
      }

      // If UPI was chosen, trigger Soundbox voice announcement
      if (paymentMode === 'UPI / QR' && 'speechSynthesis' in window) {
        try {
          const text = `₹${receipt.total} prapt hue! ${activeShop.name} par UPI payment safal raha.`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'hi-IN';
          window.speechSynthesis.speak(utterance);
        } catch {}
      }

      onOpenReceipt(receipt);
    }
  };

  const searchableItems = items.filter(i =>
    i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    (i.hindiName && i.hindiName.includes(itemSearch))
  ).slice(0, 6);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-800 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              {activeShop.name}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeShop.distance} away</span>
            <span aria-hidden="true">·</span>
            <span>Active Server: {activeBackend === 'python' ? 'Python Flask (:5000)' : 'Java Spark (:8081)'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Cashier Counter & POS Billing Terminal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live billing counter for <strong className="text-slate-800">{activeShop.name}</strong>. Stock deductions and cash memos operate strictly on this store's independent ledger.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="self-start md:self-auto px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            Clear Current Cart
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Item Scanner / Adder */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hardware Barcode Scanner Quick Input */}
          <form onSubmit={handleBarcodeSubmit} className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Barcode className="w-4 h-4" />
                <span>Laser Barcode Scanner / SKU Quick Entry</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Press Enter to Add</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Scan or type barcode (e.g. 8901030001001 for Rice, 8901030001002 for Sugar)..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Scan Item
              </button>
            </div>
            {scanMessage && (
              <p className="text-[11px] font-medium text-emerald-300 animate-in fade-in">
                {scanMessage}
              </p>
            )}
          </form>

          {/* Quick Lookup Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Item Search & Quick Tap
            </h3>
            <input
              type="text"
              placeholder="Search item to quickly add (e.g. Rice, Sugar, Oil, Dal)..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            {/* Quick add suggestions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {searchableItems.map((item) => {
                const inCart = cart.find(c => c.item.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onAddToCart(item)}
                    disabled={item.stock === 0}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                      item.stock === 0
                        ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:border-emerald-500 hover:shadow-2xs border-slate-200 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.unit} · {item.barcode}</div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                      <span className="font-bold text-slate-900 font-mono">₹{item.price}</span>
                      <span className={`text-[10px] font-mono ${item.stock < 10 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                        {item.stock} in stock
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Cart Items Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Active Bill Line Items ({cart.length})</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Total Units: {cart.reduce((s, c) => s + c.quantity, 0)}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <ShoppingCart className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No items on billing counter. Use scanner or tap items above.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cart.map((line) => {
                  const lineTotal = line.item.price * line.quantity;
                  return (
                    <div key={line.item.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {line.item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ₹{line.item.price} / {line.item.unit}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(line.item.id, line.quantity - 1)}
                          className="p-1 hover:bg-white rounded text-slate-600 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono tabular-nums font-semibold px-2 text-slate-800">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(line.item.id, line.quantity + 1)}
                          disabled={line.quantity >= line.item.stock}
                          className="p-1 hover:bg-white rounded text-slate-600 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="w-20 text-right font-mono tabular-nums font-semibold text-slate-900">
                        ₹{lineTotal}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => onRemoveFromCart(line.item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Summary & Customer Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-2">
              Customer Details & Billing
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Mobile Number {paymentMode === 'Khata (Credit)' && <span className="text-rose-600">*</span>}
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-lg">
                  {(['Cash', 'UPI / QR', 'Khata (Credit)'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all whitespace-nowrap text-center cursor-pointer ${
                        paymentMode === mode
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMode === 'UPI / QR' && (
                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 text-[11px] flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Will trigger soundbox voice confirmation on checkout</span>
                </div>
              )}

              {paymentMode === 'Khata (Credit)' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Recorded into Digital Udhaar Register for {customerName}</span>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.length} unique items):</span>
                <span className="font-mono tabular-nums">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>GST / Taxes:</span>
                <span>Included (0%)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-emerald-700 tabular-nums">₹{grandTotal}</span>
              </div>
            </div>

            {/* Dispatch / Checkout Button */}
            <button
              onClick={handleProcessBill}
              disabled={cart.length === 0 || isProcessing}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              {isProcessing ? (
                <span>Generating Memo...</span>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Generate Bill & Print Cash Memo (₹{grandTotal})</span>
                </>
              )}
            </button>
          </div>

          {/* Recent Receipts List */}
          {recentReceipts.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>Today's Recent Cash Memos ({recentReceipts.length})</span>
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {recentReceipts.map((rec) => (
                  <div
                    key={rec.invoiceNumber}
                    onClick={() => onOpenReceipt(rec)}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-semibold text-slate-900">
                        {rec.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rec.customerName} · {rec.paymentMode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        ₹{rec.total}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        Reprint Slip
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

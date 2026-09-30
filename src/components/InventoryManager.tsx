import React, { useState } from 'react';
import { InventoryItem, BackendType, KiranaShop } from '../types';
import { Plus, RotateCcw, Download, Upload, Trash2, ArrowUpDown, Check, AlertTriangle, FileCode, Store, Barcode } from 'lucide-react';
import { backendEngine } from '../services/backendService';

interface InventoryManagerProps {
  items: InventoryItem[];
  activeBackend: BackendType;
  activeShop: KiranaShop;
  onAddItem: (item: Partial<InventoryItem>) => Promise<boolean>;
  onDeleteItem: (id: number) => Promise<boolean>;
  onRestockItem: (id: number, amount: number) => Promise<boolean>;
  onResetDefault: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  items,
  activeBackend,
  activeShop,
  onAddItem,
  onDeleteItem,
  onRestockItem,
  onResetDefault,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'id' | 'name' | 'price' | 'stock'>('id');
  const [sortAsc, setSortAsc] = useState(true);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Grains & Atta');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemHindi, setNewItemHindi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Raw JSON state
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonMessage, setJsonMessage] = useState<string | null>(null);

  const handleSort = (field: 'id' | 'name' | 'price' | 'stock') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredAndSorted = items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.hindiName && item.hindiName.includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = parseFloat(newItemPrice);
    const stockNum = parseInt(newItemStock, 10);

    if (!newItemName.trim()) {
      setFormError('Item name is required.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Price must be a valid positive number.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Stock quantity must be zero or greater.');
      return;
    }

    setIsSubmitting(true);
    const success = await onAddItem({
      name: newItemName.trim(),
      price: priceNum,
      stock: stockNum,
      category: newItemCategory,
      unit: newItemUnit,
      hindiName: newItemHindi.trim(),
    });

    setIsSubmitting(false);
    if (success) {
      setNewItemName('');
      setNewItemPrice('');
      setNewItemStock('');
      setNewItemHindi('');
      setShowAddModal(false);
    } else {
      setFormError('Failed to add item. Backend returned an error.');
    }
  };

  const handleOpenJsonModal = () => {
    setRawJsonText(backendEngine.getRawJson());
    setJsonMessage(null);
    setShowJsonModal(true);
  };

  const handleSaveJson = () => {
    const res = backendEngine.importRawJson(rawJsonText);
    if (res.success) {
      setJsonMessage('inventory.json saved & synced across Python and Java backends successfully!');
      setTimeout(() => setShowJsonModal(false), 1200);
    } else {
      setJsonMessage(`Error: ${res.error}`);
    }
  };

  const handleExportJson = () => {
    const jsonStr = backendEngine.getRawJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Meta Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-800 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              {activeShop.name}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeShop.address}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-700 font-medium">Independent Store Stock Ledger</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Store Inventory & Stock Ledger ({activeShop.name})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Owner: <strong className="text-slate-800">{activeShop.owner}</strong>. Restocks and additions apply specifically to {activeShop.name} with real-time {activeBackend === 'python' ? 'Python Flask' : 'Java Spark'} synchronization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item (POST /api/items)</span>
          </button>

          <button
            onClick={handleOpenJsonModal}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            title="Inspect or edit inventory.json"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-500" />
            <span>inventory.json</span>
          </button>

          <button
            onClick={handleExportJson}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            title="Download inventory.json"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset inventory back to initial default items (Rice, Sugar, Oil + essentials)?')) {
                onResetDefault();
              }
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            title="Reset to default items"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Table Metrics */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Total Catalog: <strong className="text-slate-800 font-mono tabular-nums">{items.length}</strong> items</span>
          <span aria-hidden="true">·</span>
          <span>In Stock: <strong className="text-emerald-700 font-mono tabular-nums">{items.reduce((acc, i) => acc + i.stock, 0)}</strong> units</span>
          <span aria-hidden="true">·</span>
          <span>Out of Stock: <strong className="text-rose-600 font-mono tabular-nums">{items.filter(i => i.stock === 0).length}</strong></span>
        </div>

        <input
          type="text"
          placeholder="Filter inventory table..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs font-semibold">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Item Name & Details</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Category</th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none text-right whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price (INR)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('stock')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none text-right whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Stock Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Quick Restock</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No items match the query.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((item) => {
                  const isOutOfStock = item.stock <= 0;
                  const isLow = item.stock > 0 && item.stock <= 10;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                        #{item.id}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {item.name}
                        </div>
                        {item.hindiName && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            {item.hindiName}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-500">
                        {item.category || 'General'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        ₹{item.price}
                        <span className="text-[11px] font-normal text-slate-400 ml-1">
                          /{item.unit || 'unit'}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono tabular-nums font-semibold">
                          <span
                            className={
                              isOutOfStock
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }
                          >
                            {item.stock} {item.unit || 'units'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isOutOfStock ? 'Depleted' : isLow ? 'Low Inventory' : 'Available'}
                        </div>
                      </td>

                      {/* Quick Restock Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onRestockItem(item.id, 10)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded text-[11px] font-mono tabular-nums transition-colors"
                            title="Add +10 stock"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => onRestockItem(item.id, 25)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded text-[11px] font-mono tabular-nums transition-colors"
                            title="Add +25 stock"
                          >
                            +25
                          </button>
                          <button
                            onClick={() => onRestockItem(item.id, 50)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded text-[11px] font-mono tabular-nums transition-colors"
                            title="Add +50 stock"
                          >
                            +50
                          </button>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${item.name}" from inventory?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Kirana Item</h3>
                <p className="text-xs text-slate-500 font-mono">POST /api/items via {activeBackend}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Item Name (English) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Basmati Rice, Mustard Oil, Chana Dal"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Hindi / Regional Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. बासमती चावल, सरसों तेल"
                  value={newItemHindi}
                  onChange={(e) => setNewItemHindi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    placeholder="e.g. 50"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Initial Stock Qty *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Grains & Atta">Grains & Atta</option>
                    <option value="Pulses & Dal">Pulses & Dal</option>
                    <option value="Oils & Ghee">Oils & Ghee</option>
                    <option value="Spices & Masala">Spices & Masala</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Daily Essentials">Daily Essentials</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="Litre">Litre</option>
                    <option value="pack">pack</option>
                    <option value="bottle">bottle</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Save to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raw inventory.json Live Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">inventory.json Live Sync</h3>
                <p className="text-xs text-slate-500">
                  Shared data file read and written by both Python Flask and Java Spark
                </p>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {jsonMessage && (
              <div className={`p-2.5 rounded-lg text-xs font-medium ${jsonMessage.startsWith('Error') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                {jsonMessage}
              </div>
            )}

            <div>
              <textarea
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                rows={14}
                className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                You can directly edit JSON and save to live state.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveJson}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save JSON Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

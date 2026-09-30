import React, { useState, useEffect } from 'react';
import { KhataEntry, KiranaShop } from '../types';
import { backendEngine } from '../services/backendService';
import { BookOpen, CheckCircle, Clock, Search, User, Phone, Plus, AlertCircle } from 'lucide-react';

interface DigitalKhataProps {
  activeShop: KiranaShop;
}

export const DigitalKhata: React.FC<DigitalKhataProps> = ({ activeShop }) => {
  const [entries, setEntries] = useState<KhataEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'settled'>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const loadKhata = () => {
    const list = backendEngine.getKhataEntries(activeShop.id);
    setEntries(list);
  };

  useEffect(() => {
    loadKhata();
  }, [activeShop.id]);

  const handleSettle = (entryId: string) => {
    backendEngine.settleKhataEntry(entryId);
    loadKhata();
  };

  const handleAddManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newAmount || isNaN(Number(newAmount))) return;

    backendEngine.addKhataEntry({
      customerName: newCustomerName.trim(),
      customerPhone: newCustomerPhone.trim() || '+91 98000 00000',
      amount: Number(newAmount),
      shopId: activeShop.id,
      invoiceNumber: `KHATA-${Date.now().toString().slice(-4)}`
    });

    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewAmount('');
    setNewNotes('');
    setIsAddingNew(false);
    loadKhata();
  };

  const filtered = entries.filter(e => {
    const matchesSearch = e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.customerPhone.includes(searchQuery) ||
                          e.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && e.status === filterStatus;
  });

  const totalOutstanding = entries
    .filter(e => e.status === 'unpaid')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSettled = entries
    .filter(e => e.status === 'settled')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 tracking-wide uppercase">
            <BookOpen className="w-4 h-4" />
            <span>Traditional Udhaar & Credit Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Digital Khata Register: {activeShop.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track customer credit, neighborhood store tabs, and settled payments with zero ledger paperwork.
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-right">
            <div className="text-[10px] uppercase font-bold text-rose-700">Total Udhaar (Unpaid)</div>
            <div className="text-lg font-bold text-rose-900 font-mono">₹{totalOutstanding}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Settled This Month</div>
            <div className="text-lg font-bold text-emerald-900 font-mono">₹{totalSettled}</div>
          </div>
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credit Tab</span>
          </button>
        </div>
      </div>

      {/* Manual Entry Form */}
      {isAddingNew && (
        <form onSubmit={handleAddManualEntry} className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Record New Customer Udhaar Entry
            </h3>
            <button type="button" onClick={() => setIsAddingNew(false)} className="text-xs text-slate-400 hover:text-slate-600">
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98..."
                value={newCustomerPhone}
                onChange={e => setNewCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Credit Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="₹ Amount"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Save into Khata Ledger
          </button>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or invoice..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Entries ({entries.length})
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              filterStatus === 'unpaid' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unpaid ({entries.filter(e => e.status === 'unpaid').length})
          </button>
          <button
            onClick={() => setFilterStatus('settled')}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              filterStatus === 'settled' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Settled ({entries.filter(e => e.status === 'settled').length})
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">No khata entries found matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Ref Invoice</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{entry.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{entry.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {entry.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-slate-900">
                      ₹{entry.amount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {entry.status === 'unpaid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                          <Clock className="w-3 h-3" />
                          Unpaid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          Settled {entry.settledDate && `(${entry.settledDate})`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {entry.status === 'unpaid' ? (
                        <button
                          onClick={() => handleSettle(entry.id)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

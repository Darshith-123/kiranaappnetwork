import React, { useState } from 'react';
import { BillReceipt } from '../types';
import { SHOP_INFO } from '../services/backendService';
import { Printer, X, Check, QrCode, Volume2, Smartphone, FileText } from 'lucide-react';

interface ReceiptModalProps {
  receipt: BillReceipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const [printFormat, setPrintFormat] = useState<'thermal58' | 'a4'>('thermal58');
  const [soundAnnounced, setSoundAnnounced] = useState(false);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  // Play Soundbox Voice Announcement (like Paytm / PhonePe Soundbox)
  const handlePlaySoundbox = () => {
    try {
      // 1. Play two-tone audio beep via Web Audio API
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }

      // 2. Play Speech Synthesis Voice
      if ('speechSynthesis' in window) {
        const text = `₹${receipt.total} prapt hue! ${receipt.shopInfo?.shop_name || 'Kirana Store'} par payment safal raha.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
      setSoundAnnounced(true);
      setTimeout(() => setSoundAnnounced(false), 3000);
    } catch {
      // Fallback
    }
  };

  // Real UPI Payment URI
  const upiId = `${(receipt.shopInfo?.shopId || 'kirana').replace(/[^a-z0-9]/g, '')}@upi`;
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(receipt.shopInfo?.shop_name || 'Kirana Store')}&am=${receipt.total}&cu=INR&tn=Invoice_${receipt.invoiceNumber}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Bill Generated via {receipt.backendUsed === 'python' ? 'Python Flask' : 'Java Spark'}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle: 58mm Thermal vs A4 */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-[11px]">
              <button
                onClick={() => setPrintFormat('thermal58')}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                  printFormat === 'thermal58' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                58mm Roll
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                  printFormat === 'a4' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Memo
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Soundbox Sound Chime Prompt */}
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Paytm/PhonePe Soundbox Voice Alert</span>
          </div>
          <button
            onClick={handlePlaySoundbox}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <span>{soundAnnounced ? 'Announced! 🔊' : 'Play Soundbox 🔊'}</span>
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div
          id="printable-receipt"
          className={`p-6 bg-white overflow-y-auto space-y-4 font-mono text-xs text-slate-800 ${
            printFormat === 'thermal58' ? 'max-w-[320px] mx-auto border-x border-dashed border-slate-300' : ''
          }`}
        >
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
              {receipt.shopInfo?.shop_name || SHOP_INFO.shop_name}
            </h2>
            <p className="text-[11px] text-slate-600 font-sans">
              Wholesale & Retail Kirana Merchant
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              {receipt.shopInfo?.shop_location || SHOP_INFO.shop_location}
            </p>
            <p className="text-[11px] text-slate-500">
              Mob: {receipt.shopInfo?.phone || SHOP_INFO.phone}
            </p>
            <p className="text-[10px] text-slate-400">
              GSTIN: {receipt.shopInfo?.gstin || SHOP_INFO.gstin}
            </p>
          </div>

          {/* Bill Meta */}
          <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span>Invoice No:</span>
              <span className="font-bold text-slate-900">{receipt.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold text-slate-900">{receipt.customerName}</span>
            </div>
            {receipt.customerPhone && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{receipt.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Payment Mode:</span>
              <span className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                receipt.paymentMode === 'UPI / QR'
                  ? 'bg-sky-100 text-sky-800'
                  : receipt.paymentMode === 'Khata (Credit)'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {receipt.paymentMode}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
            <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 pb-1">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Amt</span>
            </div>

            {receipt.items.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px] py-0.5">
                <span className="col-span-6 truncate font-medium text-slate-900">
                  {line.item.name}
                </span>
                <span className="col-span-2 text-center tabular-nums">
                  {line.quantity}
                </span>
                <span className="col-span-2 text-right tabular-nums">
                  {line.item.price}
                </span>
                <span className="col-span-2 text-right font-bold tabular-nums">
                  {line.item.price * line.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums">₹{receipt.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Taxes (GST Included):</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-1.5">
              <span>GRAND TOTAL:</span>
              <span className="tabular-nums">₹{receipt.total}</span>
            </div>
          </div>

          {/* Real Dynamic UPI QR Code */}
          {receipt.paymentMode === 'UPI / QR' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
              <div className="text-[11px] font-bold text-slate-800 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-sky-700" />
                <span>Scan with GPay, PhonePe, or Paytm</span>
              </div>
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                className="w-32 h-32 mx-auto border border-slate-300 rounded-lg p-1 bg-white shadow-2xs"
              />
              <div className="text-[10px] text-slate-500 font-mono">
                VPA: <strong className="text-slate-800">{upiId}</strong>
              </div>
              <a
                href={upiUrl}
                className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[10px] font-semibold"
              >
                <Smartphone className="w-3 h-3" />
                <span>Tap to Pay on Mobile</span>
              </a>
            </div>
          )}

          {/* Khata Credit Notice */}
          {receipt.paymentMode === 'Khata (Credit)' && (
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] text-center">
              <strong>Recorded in Customer Udhaar Ledger:</strong>
              <div className="font-mono text-xs mt-0.5 font-bold">
                {receipt.customerName} · ₹{receipt.total} Unpaid
              </div>
            </div>
          )}

          {/* Barcode representation */}
          <div className="text-center pt-2 border-t border-dashed border-slate-300 space-y-2 text-[10px] text-slate-500">
            <div className="font-mono tracking-widest text-slate-700 text-[11px] font-bold">
              ||| | ||||| || |||| ||| ||||| | ||
            </div>
            <p className="font-mono text-[9px] text-slate-400">*{receipt.invoiceNumber}*</p>
            <p>Goods once sold cannot be returned without receipt.</p>
            <p className="font-semibold text-slate-800 font-sans">
              Dhanyawad! Please Visit Again! 🙏
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};

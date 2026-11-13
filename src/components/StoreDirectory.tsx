import React, { useState } from 'react';
import { KiranaShop, UserLocation } from '../types';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Navigation, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Building2
} from 'lucide-react';

interface StoreDirectoryProps {
  shops: KiranaShop[];
  activeShop: KiranaShop;
  onSelectShop: (shopId: string) => void;
  currentLocation: UserLocation;
  onViewCatalog: (shopId: string) => void;
  onViewMap: () => void;
}

export const StoreDirectory: React.FC<StoreDirectoryProps> = ({
  shops,
  activeShop,
  onSelectShop,
  currentLocation,
  onViewCatalog,
  onViewMap,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filteredShops = shops.filter((shop) => {
    if (selectedTag === 'top-rated') return shop.rating >= 4.8;
    if (selectedTag === 'nearest') return shop.distanceMeters <= 800;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 tracking-wide uppercase">
            <Store className="w-3.5 h-3.5" />
            <span>Verified Local Kirana Directory · {currentLocation.area}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Nearby Kirana Stores, Owners & Contact Information
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Directly connect with local neighborhood grocers. View operating hours, store proprietor details, phone numbers, WhatsApp lines, physical addresses, and store specialties.
          </p>
        </div>

        <button
          onClick={onViewMap}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0 self-start md:self-auto shadow-xs"
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>View on Radar Map</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 text-xs font-medium mr-1">Filter stores:</span>
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            selectedTag === 'all'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Stores ({shops.length})
        </button>
        <button
          onClick={() => setSelectedTag('nearest')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            selectedTag === 'nearest'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Under 800m (Walking)
        </button>
        <button
          onClick={() => setSelectedTag('top-rated')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            selectedTag === 'top-rated'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Top Rated (4.8+ ⭐)
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredShops.map((shop) => {
          const isActive = activeShop.id === shop.id;
          const cleanPhone = shop.phone.replace(/[^0-9]/g, '');

          return (
            <div
              key={shop.id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs ${
                isActive
                  ? 'border-emerald-600 ring-2 ring-emerald-600/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Top Info */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center font-bold text-lg shrink-0">
                      <Store className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {shop.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
                            Selected Store
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Proprietor: <span className="font-medium text-slate-700">{shop.owner}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 bg-slate-900 text-white text-xs font-mono font-bold rounded-lg">
                      {shop.distance}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold justify-end mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{shop.rating}</span>
                      <span className="text-slate-400 font-normal">({shop.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* Key Attributes & Timings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Timings</span>
                      <span className="font-medium text-slate-800">{shop.timing}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block font-medium">Landmark</span>
                      <span className="font-medium text-slate-800 truncate block">{shop.landmark}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="text-xs text-slate-600">
                  <span className="font-medium text-slate-700">Full Address: </span>
                  <span>{shop.address}</span>
                </div>

                {/* Specialty */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-950 block">Store Specialty:</span>
                    <span>{shop.specialty}</span>
                  </div>
                </div>

                {/* Informational Store Badges (Zero Payment / Zero Delivery references) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Walk-in Physical Store
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-medium">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    GSTIN: {shop.gstin}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {/* Phone Call Button */}
                  <a
                    href={`tel:${cleanPhone}`}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Store</span>
                  </a>

                  {/* WhatsApp Inquiry */}
                  <a
                    href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(`Hello ${shop.name}, I am inquiring about grocery stock and item availability near ${currentLocation.area}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Google Maps Directions */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${shop.name}, ${shop.address}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Get directions in Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Directions</span>
                  </a>
                </div>

                {/* View Catalog */}
                <button
                  onClick={() => {
                    onSelectShop(shop.id);
                    onViewCatalog(shop.id);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs ml-auto"
                >
                  <span>View Item Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

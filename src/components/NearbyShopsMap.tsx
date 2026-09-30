import React, { useState } from 'react';
import { KiranaShop, UserLocation } from '../types';
import { MapPin, Navigation, ExternalLink, Star, Phone, Clock, Store, Check, ArrowRight, Layers } from 'lucide-react';

interface NearbyShopsMapProps {
  currentLocation: UserLocation;
  shops: KiranaShop[];
  activeShop: KiranaShop;
  onSelectShop: (shopId: string) => void;
  onViewComparison: () => void;
}

export const NearbyShopsMap: React.FC<NearbyShopsMapProps> = ({
  currentLocation,
  shops,
  activeShop,
  onSelectShop,
  onViewComparison,
}) => {
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  const [hoveredShopId, setHoveredShopId] = useState<string | null>(null);

  // Shop positions on our styled interactive map canvas (relative percentages)
  // Center is user: (50%, 50%)
  const shopCoordinatesMap: Record<string, { top: string; left: string; ring: string }> = {
    raju_kirana: { top: '35%', left: '65%', ring: '500m' },
    sharma_kirana: { top: '65%', left: '72%', ring: '750m' },
    balaji_kirana: { top: '22%', left: '32%', ring: '1.1km' },
    sri_lakshmi_kirana: { top: '78%', left: '26%', ring: '1.4km' },
  };

  const getGoogleMapsUrl = (shop: KiranaShop) => {
    const query = encodeURIComponent(`${shop.name}, ${shop.address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="space-y-6">
      {/* Map & List Split Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Google Maps Styled Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          {/* Map Top Bar */}
          <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Google Maps View · LB Nagar & Saraswathi Nagar</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                [17.3457° N, 78.5522° E]
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px]">
                <button
                  onClick={() => setMapMode('street')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    mapMode === 'street' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setMapMode('satellite')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    mapMode === 'satellite' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Satellite
                </button>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentLocation.name)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium flex items-center gap-1 text-[11px] shadow-2xs"
              >
                <span>Live Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Map Canvas */}
          <div className={`relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden select-none transition-colors duration-500 ${
            mapMode === 'street' ? 'bg-[#E5E3DF]' : 'bg-[#15252B]'
          }`}>
            {/* SVG Roads and Geographical Landmarks */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Distance radius circles from User Location */}
              <circle cx="50%" cy="50%" r="22%" fill="none" stroke={mapMode === 'street' ? '#94A3B8' : '#334155'} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              <circle cx="50%" cy="50%" r="42%" fill="none" stroke={mapMode === 'street' ? '#94A3B8' : '#334155'} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

              {/* Main Arterial Roads (Inner Ring Road / LB Nagar Highway) */}
              <path
                d="M -10,180 Q 200,160 550,260 T 900,320"
                stroke={mapMode === 'street' ? '#FFFFFF' : '#384B52'}
                strokeWidth="14"
                fill="none"
              />
              <path
                d="M -10,180 Q 200,160 550,260 T 900,320"
                stroke={mapMode === 'street' ? '#FDE047' : '#EAB308'}
                strokeWidth="2.5"
                fill="none"
                opacity="0.7"
              />

              {/* Saraswathi Nagar Colony Cross Roads */}
              <path d="M 280,-10 L 320,600" stroke={mapMode === 'street' ? '#FFFFFF' : '#2D3E45'} strokeWidth="8" fill="none" />
              <path d="M 460,-10 L 410,600" stroke={mapMode === 'street' ? '#FFFFFF' : '#2D3E45'} strokeWidth="7" fill="none" />
              <path d="M 50,420 L 750,380" stroke={mapMode === 'street' ? '#FFFFFF' : '#2D3E45'} strokeWidth="6" fill="none" />
              <path d="M 120,80 L 650,90" stroke={mapMode === 'street' ? '#FFFFFF' : '#2D3E45'} strokeWidth="6" fill="none" />

              {/* Metro Corridor Line */}
              <path d="M 0,90 L 800,290" stroke="#0284C7" strokeWidth="3" strokeDasharray="6 4" fill="none" opacity="0.75" />

              {/* Line routes from user to active shop */}
              {activeShop && shopCoordinatesMap[activeShop.id] && (
                <line
                  x1="50%"
                  y1="50%"
                  x2={shopCoordinatesMap[activeShop.id].left}
                  y2={shopCoordinatesMap[activeShop.id].top}
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Geographical Street Labels */}
            <div className="absolute top-4 left-6 text-[10px] font-mono font-medium text-slate-500 bg-white/70 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
              Metro Line 1 (LB Nagar Corridor)
            </div>
            <div className="absolute bottom-4 left-8 text-[10px] font-mono font-medium text-slate-500 bg-white/70 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
              Saraswathi Nagar Main Colony Road
            </div>
            <div className="absolute top-1/2 right-4 text-[10px] font-mono font-medium text-slate-500 bg-white/70 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
              RTC Colony Arch Road
            </div>

            {/* Distance Ring Indicator Labels */}
            <div className="absolute top-[28%] left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-400 bg-white/80 px-1 rounded pointer-events-none">
              500m radius
            </div>
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-400 bg-white/80 px-1 rounded pointer-events-none">
              1.0km radius
            </div>

            {/* Center Pin: USER LOCATION */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-500 opacity-40" />
                <div className="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white" />
              </div>
              <div className="mt-1 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                You are here ({currentLocation.area})
              </div>
            </div>

            {/* SHOP PINS on the Map */}
            {shops.map((shop) => {
              const coords = shopCoordinatesMap[shop.id];
              if (!coords) return null;

              const isActive = activeShop.id === shop.id;
              const isHovered = hoveredShopId === shop.id;

              return (
                <div
                  key={shop.id}
                  style={{ top: coords.top, left: coords.left }}
                  onClick={() => onSelectShop(shop.id)}
                  onMouseEnter={() => setHoveredShopId(shop.id)}
                  onMouseLeave={() => setHoveredShopId(null)}
                  className={`absolute -translate-x-1/2 -translate-y-full z-30 cursor-pointer transition-all duration-200 group ${
                    isActive ? 'scale-115 z-40' : 'hover:scale-110'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    {/* Pin Callout Box */}
                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold shadow-lg whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-slate-950 text-white border-2 border-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-900 border border-slate-300 hover:border-emerald-600'
                    }`}>
                      <Store className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className="font-bold">{shop.name}</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-emerald-800'
                      }`}>
                        {shop.distance}
                      </span>
                    </div>

                    {/* Pin Pointer Needle */}
                    <div className={`w-3 h-3 rotate-45 -mt-1.5 shadow-xs ${
                      isActive ? 'bg-slate-950 border-r-2 border-b-2 border-emerald-400' : 'bg-white border-r border-b border-slate-300'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Shop Ribbon Banner */}
          <div className="p-3 bg-emerald-50/80 border-t border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-900 font-semibold">Active Selection:</span>
              <span className="font-bold text-slate-900">{activeShop.name}</span>
              <span className="text-emerald-700 font-mono font-medium">({activeShop.distance} away)</span>
            </div>
            <button
              onClick={onViewComparison}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Compare All 4 Stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: 4 Kirana Store Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kirana Stores Near {currentLocation.area}
            </h3>
            <span className="text-xs text-slate-400">Click to load prices</span>
          </div>

          <div className="space-y-2.5">
            {shops.map((shop) => {
              const isActive = activeShop.id === shop.id;

              return (
                <div
                  key={shop.id}
                  onClick={() => onSelectShop(shop.id)}
                  onMouseEnter={() => setHoveredShopId(shop.id)}
                  onMouseLeave={() => setHoveredShopId(null)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-white border-emerald-600 shadow-md ring-1 ring-emerald-600/30'
                      : 'bg-white/90 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
                  }`}
                >
                  {/* Top line: Name, Distance Badge & Rating */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {shop.name}
                        </h4>
                        {isActive && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Active Shop</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {shop.landmark} · {shop.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-block bg-slate-900 text-emerald-400 font-mono text-xs font-bold px-2 py-0.5 rounded-lg shadow-2xs">
                        {shop.distance}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[11px] text-slate-600 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span className="font-semibold">{shop.rating}</span>
                        <span className="text-slate-400">({shop.reviewsCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialty Quote */}
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100/80">
                    <strong className="text-slate-800 font-medium">Specialty:</strong> {shop.specialty}
                  </p>

                  {/* Live Item Price Teasers for THIS shop */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50/70 p-1.5 rounded-md">
                      <div className="text-[10px] text-slate-400">Rice / kg</div>
                      <div className="font-mono font-bold text-slate-900">₹{shop.itemPrices[1]}</div>
                    </div>
                    <div className="bg-slate-50/70 p-1.5 rounded-md">
                      <div className="text-[10px] text-slate-400">Sugar / kg</div>
                      <div className="font-mono font-bold text-slate-900">₹{shop.itemPrices[2]}</div>
                    </div>
                    <div className="bg-slate-50/70 p-1.5 rounded-md">
                      <div className="text-[10px] text-slate-400">Oil / L</div>
                      <div className="font-mono font-bold text-slate-900">₹{shop.itemPrices[3]}</div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 flex items-center justify-between pt-1">
                    <a
                      href={getGoogleMapsUrl(shop)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium"
                    >
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Google Maps Directions</span>
                    </a>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700'
                      }`}
                    >
                      <span>{isActive ? 'Currently Browsing' : 'Select This Shop'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

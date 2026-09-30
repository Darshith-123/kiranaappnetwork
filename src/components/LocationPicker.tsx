import React, { useState } from 'react';
import { UserLocation, KiranaShop } from '../types';
import { PRESET_LOCATIONS } from '../data/shopsData';
import { MapPin, Navigation, Search, Check, Store, Compass, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  currentLocation: UserLocation;
  onLocationChange: (loc: UserLocation) => void;
  nearbyShops: KiranaShop[];
  activeShop: KiranaShop;
  onSelectShop: (shopId: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  currentLocation,
  onLocationChange,
  nearbyShops,
  activeShop,
  onSelectShop,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onLocationChange({
      name: customInput.trim(),
      area: customInput.trim().split(',')[0] || customInput.trim(),
      city: 'Hyderabad, Telangana',
      pincode: '500074',
      coordinates: { lat: 17.3457, lng: 78.5522 },
      isGps: false
    });
    setIsEditing(false);
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange({
          name: `Current GPS Location (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`,
          area: 'Live GPS Pinpoint',
          city: 'Hyderabad, Telangana',
          pincode: '500074',
          coordinates: { lat: latitude, lng: longitude },
          isGps: true
        });
        setIsLocatingGps(false);
      },
      (error) => {
        setIsLocatingGps(false);
        // Fallback gracefully to default area with informative notice
        setGpsError('GPS permission denied or unavailable. Using LB Nagar, Hyderabad.');
        setTimeout(() => setGpsError(null), 4000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-amber-900/10 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Top Question & Prompt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 tracking-wide uppercase">
            <MapPin className="w-3.5 h-3.5" />
            <span>Hyper-Local Discovery & Radar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            What is your current location?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pinpoint your neighbourhood in Hyderabad to discover nearby Kirana stores within 500m – 1.4km and compare live daily prices.
          </p>
        </div>

        {/* Current Active Location Pill & GPS Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDetectGps}
            disabled={isLocatingGps}
            title="Auto-detect current GPS coordinates"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            {isLocatingGps ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Compass className="w-3.5 h-3.5" />
            )}
            <span>{isLocatingGps ? 'Locating...' : 'Use Live GPS'}</span>
          </button>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 rounded-xl text-xs">
            <Navigation className={`w-4 h-4 text-emerald-600 shrink-0 ${currentLocation.isGps ? 'animate-bounce' : 'animate-pulse'}`} />
            <div>
              <div className="text-[10px] text-emerald-800/80 font-medium">Deliver / Pickup Near:</div>
              <div className="font-bold text-emerald-950 truncate max-w-[200px] sm:max-w-[220px]">
                {currentLocation.name}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="ml-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
            >
              {isEditing ? 'Close' : 'Change'}
            </button>
          </div>
        </div>
      </div>

      {gpsError && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{gpsError}</span>
          <button onClick={() => setGpsError(null)} className="font-bold text-amber-900 ml-2">×</button>
        </div>
      )}

      {/* Preset Quick Select Buttons */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
          <span>Choose or change your area:</span>
          {isEditing && (
            <span className="text-[11px] text-slate-400">Or type custom colony below</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected = currentLocation.name === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => {
                  onLocationChange(preset);
                  setIsEditing(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 text-xs ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-600 text-emerald-950 shadow-2xs font-semibold ring-1 ring-emerald-600/30'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{preset.area}</div>
                  <div className="text-[10px] text-slate-400 truncate">{preset.city}</div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>

        {isEditing && (
          <form onSubmit={handleCustomSubmit} className="pt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type your colony or landmark (e.g. Saraswathi Nagar, Kothapet, LB Nagar)..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Update Location
            </button>
          </form>
        )}
      </div>

      {/* Quick Summary of Nearby Kirana Shops Found */}
      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Found 4 Nearby Kirana Stores:</span>
        {nearbyShops.map((shop) => {
          const isActive = activeShop.id === shop.id;
          return (
            <button
              key={shop.id}
              onClick={() => onSelectShop(shop.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{shop.name}</span>
              <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                isActive ? 'bg-emerald-400 text-slate-950 font-bold' : 'bg-slate-100 text-emerald-800 font-semibold'
              }`}>
                {shop.distance}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * HelpersView Component
 * Verified Helpers Directory with interactive visual map, spatial search,
 * filters, and detailed profile modal.
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Filter,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Phone,
  Clock,
  UserCheck,
  X,
  Map as MapIcon,
  List
} from 'lucide-react';
import { Helper, Service, ServiceKey, Review } from '../types';
import { haversineDistance } from '../core/algorithms';

interface HelpersViewProps {
  helpers: Helper[];
  services: Service[];
  reviews: Review[];
  onBookHelper: (helperId: number, serviceKey?: ServiceKey) => void;
  searchQuery: string;
  onSetSearchQuery: (q: string) => void;
  cityFilter: string;
  onSetCityFilter: (city: string) => void;
  serviceFilter: string;
  onSetServiceFilter: (service: string) => void;
  sortBy: 'rating' | 'reviews' | 'name';
  onSetSortBy: (sort: 'rating' | 'reviews' | 'name') => void;
}

export const HelpersView: React.FC<HelpersViewProps> = ({
  helpers,
  services,
  reviews,
  onBookHelper,
  searchQuery,
  onSetSearchQuery,
  cityFilter,
  onSetCityFilter,
  serviceFilter,
  onSetServiceFilter,
  sortBy,
  onSetSortBy
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [inspectedHelper, setInspectedHelper] = useState<Helper | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(15);

  // Reference center point: Lusaka Central (-15.412, 28.305)
  const centerLat = -15.412;
  const centerLng = 28.305;

  const filteredHelpers = useMemo(() => {
    return helpers
      .filter((h) => {
        if (!h.isVerified) return false;
        if (onlyAvailable && !h.isAvailable) return false;
        if (cityFilter !== 'All' && h.city !== cityFilter) return false;
        if (serviceFilter !== 'All' && !h.serviceKeys.includes(serviceFilter as ServiceKey)) return false;

        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = h.name.toLowerCase().includes(q);
          const matchArea = h.area.toLowerCase().includes(q);
          const matchSkills = h.skills.toLowerCase().includes(q);
          if (!matchName && !matchArea && !matchSkills) return false;
        }

        // Distance filter
        const dist = haversineDistance(centerLat, centerLng, h.coords.lat, h.coords.lng);
        if (cityFilter === 'Lusaka' && dist > radiusKm) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        return a.name.localeCompare(b.name);
      });
  }, [helpers, searchQuery, cityFilter, serviceFilter, sortBy, onlyAvailable, radiusKm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Verified Trust Network</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Verified Helpers Directory
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Showing {filteredHelpers.length} vetted, police-cleared helpers in Zambia with guaranteed pricing.
          </p>
        </div>

        {/* View mode toggle (List vs Map) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Cards List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'map' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSetSearchQuery(e.target.value)}
              placeholder="Search helper name or skill..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden font-medium"
            />
          </div>

          {/* City filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => onSetCityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden font-medium"
            >
              <option value="All">All Cities (Zambia)</option>
              <option value="Lusaka">Lusaka</option>
              <option value="Kitwe">Kitwe</option>
              <option value="Ndola">Ndola</option>
            </select>
          </div>

          {/* Service filter */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => onSetServiceFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden font-medium"
            >
              <option value="All">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.key}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => onSetSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden font-medium"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-slate-300"
            />
            <span className="font-semibold text-slate-700">Only Available Now</span>
          </label>

          {cityFilter === 'Lusaka' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Spatial Radius:</span>
              <input
                type="range"
                min="3"
                max="30"
                step="3"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-24 accent-emerald-700"
              />
              <span className="font-bold text-emerald-900">{radiusKm} km</span>
            </div>
          )}
        </div>
      </div>

      {/* INTERACTIVE MAP VIEW */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
          <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-lime-400" />
              <span className="font-bold text-sm">Interactive Zambian Helper Map</span>
            </div>
            <span className="text-xs text-emerald-100 font-medium">Click a pin to view helper details</span>
          </div>

          <div className="relative h-[440px] bg-emerald-950/90 overflow-hidden flex items-center justify-center">
            {/* SVG Interactive Map Canvas */}
            <svg viewBox="0 0 800 500" className="w-full h-full object-cover">
              {/* Background Map Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="800" height="500" fill="#092718" />
              <rect width="800" height="500" fill="url(#grid)" />

              {/* Simplified Zambian Arterial Road Network */}
              <path
                d="M 120 420 Q 280 340 380 280 T 520 180 T 680 120"
                fill="none"
                stroke="#1b7a34"
                strokeWidth="4"
                strokeDasharray="4,4"
              />
              <path
                d="M 380 280 L 460 380 L 590 420"
                fill="none"
                stroke="#1b7a34"
                strokeWidth="3"
              />

              {/* Major District Labels */}
              <text x="360" y="260" fill="#a3e635" fontSize="13" fontWeight="bold">
                Lusaka Metropolitan
              </text>
              <text x="510" y="160" fill="#a3e635" fontSize="12" fontWeight="bold">
                Ndola
              </text>
              <text x="440" y="120" fill="#a3e635" fontSize="12" fontWeight="bold">
                Kitwe (Copperbelt)
              </text>

              {/* Helper Location Pins */}
              {filteredHelpers.map((helper, idx) => {
                // Coordinate projection formula for Lusaka region (-15.4, 28.3)
                // Normalize into 800x500 canvas
                const isLusaka = helper.city === 'Lusaka';
                const isKitwe = helper.city === 'Kitwe';
                const isNdola = helper.city === 'Ndola';

                let px = 380 + (helper.coords.lng - 28.3) * 600;
                let py = 280 + (helper.coords.lat - -15.4) * 600;

                if (isKitwe) {
                  px = 440 + (idx % 2) * 20;
                  py = 130 + (idx % 2) * 15;
                } else if (isNdola) {
                  px = 520 + (idx % 2) * 25;
                  py = 170 + (idx % 2) * 15;
                }

                const isSelected = inspectedHelper?.id === helper.id;

                return (
                  <g
                    key={helper.id}
                    onClick={() => setInspectedHelper(helper)}
                    className="cursor-pointer group"
                    transform={`translate(${px}, ${py})`}
                  >
                    {/* Ripple ring for active helpers */}
                    <circle r="16" fill="rgba(163, 230, 53, 0.25)" className="animate-ping" />
                    <circle
                      r="12"
                      fill={isSelected ? '#a3e635' : '#15803d'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="transition-transform group-hover:scale-125"
                    />
                    <text
                      y="4"
                      textAnchor="middle"
                      fill={isSelected ? '#092718' : '#ffffff'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {helper.id}
                    </text>
                    <text
                      y="-16"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 rounded"
                    >
                      {helper.name} ({helper.area})
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating helper inspection preview on map */}
            {inspectedHelper && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl p-4 shadow-2xl border border-emerald-200 animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl ${inspectedHelper.avatarBg} text-white font-bold flex items-center justify-center`}
                    >
                      {inspectedHelper.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{inspectedHelper.name}</h4>
                      <p className="text-xs text-slate-500">{inspectedHelper.area}, {inspectedHelper.city}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectedHelper(null)}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{inspectedHelper.rating}</span>
                  </span>
                  <span className="text-slate-500">({inspectedHelper.reviewCount} reviews)</span>
                  <span className="text-emerald-700 font-semibold">• {inspectedHelper.completedJobsCount} jobs</span>
                </div>

                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{inspectedHelper.skills}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => onBookHelper(inspectedHelper.id, inspectedHelper.serviceKeys[0])}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center"
                  >
                    Book Helper Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CARDS LIST VIEW */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHelpers.map((helper) => (
            <div
              key={helper.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl ${helper.avatarBg} text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md`}
                    >
                      {helper.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                        <span>{helper.name}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Helper" />
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>
                          {helper.area}, {helper.city}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      helper.isBusyNow
                        ? 'bg-amber-100 text-amber-900'
                        : helper.isAvailable
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {helper.isBusyNow ? 'On Job' : helper.isAvailable ? 'Available' : 'Off-Duty'}
                  </span>
                </div>

                {/* Badges / Rating */}
                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 font-bold rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{helper.rating}</span>
                  </span>
                  <span className="text-slate-500 font-medium">({helper.reviewCount} verified reviews)</span>
                  <span className="text-emerald-700 font-semibold">• {helper.completedJobsCount} jobs completed</span>
                </div>

                {/* Skills */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Core Skills & Proficiencies
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {helper.skills}
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Police Clearance</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>National ID (NRC)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setInspectedHelper(helper)}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onBookHelper(helper.id, helper.serviceKeys[0])}
                  disabled={helper.isBusyNow}
                  className={`flex-1 py-2.5 px-3 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 ${
                    helper.isBusyNow
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                  }`}
                >
                  <span>{helper.isBusyNow ? 'Currently Busy' : 'Select & Book'}</span>
                  {!helper.isBusyNow && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED HELPER INSPECTION MODAL */}
      {inspectedHelper && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-6">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-6 text-white relative">
              <button
                onClick={() => setInspectedHelper(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close profile modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl ${inspectedHelper.avatarBg} text-white font-black text-2xl flex items-center justify-center shadow-md`}
                >
                  {inspectedHelper.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{inspectedHelper.name}</h3>
                  <p className="text-emerald-100 text-xs flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-lime-300" />
                    <span>{inspectedHelper.area}, {inspectedHelper.city} • Joined {inspectedHelper.joinedDate}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Verification & Trust badges */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Trust & Verification Credentials</span>
                </h4>
                <p className="text-xs text-slate-700">{inspectedHelper.verificationNotes}</p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Police Criminal Record Cleared</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>NRC Biometrics Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Skills and Services */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Offered Services & Skills</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {inspectedHelper.skills}
                </p>
              </div>

              {/* Reviews Section */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center justify-between">
                  <span>Customer Reviews</span>
                  <span className="text-xs text-slate-500 font-normal">Rating: {inspectedHelper.rating} / 5.0</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {reviews.filter((r) => r.helperId === inspectedHelper.id).length > 0 ? (
                    reviews
                      .filter((r) => r.helperId === inspectedHelper.id)
                      .map((rev) => (
                        <div key={rev.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{rev.customerName}</span>
                            <div className="flex text-amber-500">
                              {'★'.repeat(rev.rating)}
                            </div>
                          </div>
                          <p className="text-slate-600">{rev.comment}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                      All recent jobs received 5-star ratings from verified clients.
                    </p>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setInspectedHelper(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const hId = inspectedHelper.id;
                    const sKey = inspectedHelper.serviceKeys[0];
                    setInspectedHelper(null);
                    onBookHelper(hId, sKey);
                  }}
                  className="flex-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors text-center"
                >
                  Proceed to Book {inspectedHelper.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

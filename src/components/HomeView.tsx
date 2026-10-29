/**
 * HomeView Component
 * Landing experience with service cards, quick booking, trust guarantees,
 * and direct multi-platform download callouts.
 */

import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Smartphone,
  Apple,
  Monitor,
  Download,
  Users,
  Award,
  Zap,
  PhoneCall,
  Layers
} from 'lucide-react';
import { Service, ServiceKey, Helper } from '../types';
import { formatKwacha } from '../core/pricing';

interface HomeViewProps {
  services: Service[];
  helpers: Helper[];
  onSelectService: (serviceKey: ServiceKey) => void;
  onNavigateToBooking: (serviceKey?: ServiceKey, helperId?: number) => void;
  onNavigateToHelpers: () => void;
  onNavigateToSdlc: () => void;
  onOpenDownloadModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  services,
  helpers,
  onSelectService,
  onNavigateToBooking,
  onNavigateToHelpers,
  onNavigateToSdlc,
  onOpenDownloadModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const verifiedHelpersCount = helpers.filter((h) => h.isVerified).length;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 rounded-b-[40px] shadow-xl">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-100 text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span>Zambia&apos;s #1 Verified Service Marketplace</span>
            <span className="text-emerald-400">•</span>
            <span className="text-lime-300">Over {verifiedHelpersCount}+ Vetted Helpers</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
            Reliable Help,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-200 to-white">
              Anytime.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-emerald-100 text-sm sm:text-lg leading-relaxed font-normal">
            Book verified house cleaners, handy technicians, laundry specialists, and errand helpers in Lusaka, Kitwe, and Ndola with transparent Kwacha pricing.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 text-slate-800 border border-emerald-100">
            <div className="flex items-center gap-2.5 px-3 py-2 w-full flex-1">
              <Search className="w-5 h-5 text-emerald-700 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What help do you need? (Cleaning, Repairs, Delivery...)"
                className="w-full text-sm sm:text-base outline-hidden text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>
            <button
              onClick={() => onNavigateToBooking()}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all text-sm shrink-0 flex items-center justify-center gap-2"
            >
              <span>Instant Book</span>
              <ArrowRight className="w-4 h-4 text-lime-300" />
            </button>
          </div>

          {/* Download App Quick Callout Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-emerald-200 font-medium">Available on:</span>
            <button
              onClick={onOpenDownloadModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-all transform hover:scale-105"
            >
              <Smartphone className="w-3.5 h-3.5 text-lime-400" />
              <span>Android APK</span>
            </button>
            <button
              onClick={onOpenDownloadModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-all transform hover:scale-105"
            >
              <Apple className="w-3.5 h-3.5 text-white" />
              <span>iOS / iPhone</span>
            </button>
            <button
              onClick={onOpenDownloadModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-all transform hover:scale-105"
            >
              <Monitor className="w-3.5 h-3.5 text-blue-300" />
              <span>PC Desktop App</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Services Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Service Catalogue</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Transparent On-Demand Services
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Fixed starting rates. No hidden broker markups. Only pay when satisfied.
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All (10)
              </button>
              <button
                onClick={() => setSelectedCategory('cleaning')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === 'cleaning'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cleaning
              </button>
              <button
                onClick={() => setSelectedCategory('maintenance')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === 'maintenance'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Repairs & Yard
              </button>
              <button
                onClick={() => setSelectedCategory('logistics')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === 'logistics'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Errands & Moving
              </button>
              <button
                onClick={() => setSelectedCategory('care')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === 'care'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Home & Tutoring
              </button>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <Zap className="w-5 h-5 text-emerald-600 group-hover:text-lime-300 transition-colors" />
                    </span>
                    {service.popular && (
                      <span className="px-2 py-0.5 rounded-full bg-lime-100 text-emerald-900 font-bold text-[10px] uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Starting from</span>
                    <div className="text-lg font-black text-emerald-800">
                      {formatKwacha(service.baseFee, false)}
                      {service.perKmRate > 0 && (
                        <span className="text-xs font-normal text-slate-500 ml-1">
                          + K{service.perKmRate}/km
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToBooking(service.key)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-xs"
                    aria-label={`Book ${service.name}`}
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Verified Helpers Teaser */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-lime-50/40 rounded-3xl p-6 sm:p-8 border border-emerald-200/70 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Local Talent</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Top-Rated Verified Helpers
              </h2>
              <p className="text-slate-600 text-sm mt-0.5">
                Police checked, NRC verified, and backed by authentic customer reviews.
              </p>
            </div>

            <button
              onClick={onNavigateToHelpers}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-xs"
            >
              <span>Explore All {helpers.length} Helpers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {helpers.slice(0, 4).map((helper) => (
              <div
                key={helper.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl ${helper.avatarBg} text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      {helper.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{helper.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>
                          {helper.area}, {helper.city}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 font-bold rounded-md border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{helper.rating}</span>
                    </span>
                    <span className="text-slate-500">({helper.reviewCount} reviews)</span>
                    <span className="text-emerald-700 font-semibold">• {helper.completedJobsCount} jobs</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{helper.skills}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Police Cleared</span>
                  </span>
                  <button
                    onClick={() => onNavigateToBooking(helper.serviceKeys[0], helper.id)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works & SDLC Engineering Highlight */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* How It Works */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">
                Transparent Process
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                How ZamHelper Works
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Select Service & Verified Helper</h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Pick from 10 everyday service categories and review verified helpers in your neighborhood.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Transparent Price Calculation</h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Exact base fee + travel distance (if applicable). Toggle urgency (1.25x) if you need immediate service.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Atomic Concurrency Lock</h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Our CSMA/CD concurrency mutex prevents double-booking so your helper is guaranteed reserved.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  4
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">WhatsApp & Mobile Money Settlement</h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Handoff to official WhatsApp (+260 772 300 053) for Airtel Money or MTN MoMo confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SDLC Models & Engineering Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between border border-slate-800">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-lime-300 text-xs font-bold border border-emerald-400/30">
                <Layers className="w-3.5 h-3.5" />
                <span>Software Engineering Standards</span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                Architected with Formal SDLC Models & Big-O Rigor
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed">
                ZamHelper integrates classic software engineering principles: Agile Scrum iterations, V-Model test pairing, Spiral risk analysis, Spatial Hash Grid O(1) geographic indexing, and Dijkstra urban routing.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-lime-300 font-black text-lg">O(1)</span>
                  <p className="text-xs text-slate-300 mt-0.5">Spatial Grid Lookup</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-lime-300 font-black text-lg">O((V+E)logV)</span>
                  <p className="text-xs text-slate-300 mt-0.5">Dijkstra Shortest Route</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onNavigateToSdlc}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-lime-400 hover:bg-lime-300 active:scale-95 text-emerald-950 font-black text-sm shadow-lg transition-all"
              >
                <span>Explore SDLC & Algorithm Interactive Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

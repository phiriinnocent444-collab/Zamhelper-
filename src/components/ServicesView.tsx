/**
 * ServicesView Component
 * Dedicated full catalogue of services with interactive pricing calculator.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Calculator,
  CheckCircle2
} from 'lucide-react';
import { Service, ServiceKey } from '../types';
import { calculatePrice, formatKwacha } from '../core/pricing';

interface ServicesViewProps {
  services: Service[];
  onBookService: (serviceKey: ServiceKey) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ services, onBookService }) => {
  const [activeServiceKey, setActiveServiceKey] = useState<ServiceKey>('cleaning');
  const [calcDistanceKm, setCalcDistanceKm] = useState<number>(5);
  const [calcIsUrgent, setCalcIsUrgent] = useState<boolean>(false);

  const selectedService = services.find((s) => s.key === activeServiceKey) || services[0];
  const price = calculatePrice(
    selectedService.baseFee,
    selectedService.perKmRate,
    calcDistanceKm,
    calcIsUrgent
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Full Service Catalogue</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          Everyday Household & On-Demand Services
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          All rates in Zambian Kwacha (ZMW). Transparent estimates, zero hidden brokerage fees.
        </p>
      </div>

      {/* Interactive Price Estimator Tool */}
      <div className="bg-gradient-to-br from-emerald-900 to-green-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-lime-300 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              <span>Instant Price Calculator</span>
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              Estimate Your Total Kwacha Cost
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-200">Estimated Total</span>
            <div className="text-3xl font-black text-lime-300">{formatKwacha(price.total)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-emerald-700/60">
          <div>
            <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider block mb-2">
              Select Service
            </label>
            <select
              value={activeServiceKey}
              onChange={(e) => setActiveServiceKey(e.target.value as ServiceKey)}
              className="w-full p-3 bg-emerald-800/80 border border-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl outline-hidden"
            >
              {services.map((s) => (
                <option key={s.id} value={s.key} className="bg-emerald-900 text-white">
                  {s.name} (Base {formatKwacha(s.baseFee, false)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2">
              <span>Travel Distance</span>
              <span className="text-white font-black">{calcDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={calcDistanceKm}
              onChange={(e) => setCalcDistanceKm(Number(e.target.value))}
              className="w-full accent-lime-400"
            />
            <span className="text-[11px] text-emerald-300 mt-1 block">
              {selectedService.perKmRate > 0
                ? `K${selectedService.perKmRate}/km applies for travel`
                : 'Free travel within district boundary'}
            </span>
          </div>

          <div className="flex flex-col justify-between">
            <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider block mb-2">
              Urgency Option
            </label>
            <button
              onClick={() => setCalcIsUrgent(!calcIsUrgent)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                calcIsUrgent
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                  : 'bg-emerald-800/80 text-emerald-100 border-emerald-600'
              }`}
            >
              <span>Urgent (+25% multiplier)</span>
              <span>{calcIsUrgent ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onBookService(activeServiceKey)}
            className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-emerald-950 font-black text-sm rounded-xl shadow-lg transition-all active:scale-95"
          >
            Book {selectedService.name} Now →
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {service.category}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-lg">{service.name}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{service.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Starting base fee</span>
                <div className="text-xl font-black text-emerald-800">
                  {formatKwacha(service.baseFee, false)}
                </div>
              </div>

              <button
                onClick={() => onBookService(service.key)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Select Service
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

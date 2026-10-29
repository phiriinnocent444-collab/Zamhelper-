/**
 * BookingWizard Component
 * Comprehensive 5-step booking flow with real-time price calculation,
 * slot scheduling validation, Dijkstra distance estimation,
 * CSMA/CD concurrency lock, and WhatsApp mobile money handoff.
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Phone,
  User,
  Check,
  Lock,
  MessageSquare
} from 'lucide-react';
import { Service, Helper, ServiceKey, Booking } from '../types';
import { calculatePrice, formatKwacha } from '../core/pricing';
import { validateBookingSlot, generateAvailableSlots } from '../core/scheduling';
import { findShortestRoute } from '../core/algorithms';

interface BookingWizardProps {
  services: Service[];
  helpers: Helper[];
  initialServiceKey?: ServiceKey | null;
  initialHelperId?: number | null;
  onBookingComplete: (newBooking: Booking) => void;
  onCancel: () => void;
  createBooking: (data: any) => Booking;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  services,
  helpers,
  initialServiceKey,
  initialHelperId,
  onBookingComplete,
  onCancel,
  createBooking
}) => {
  // Wizard Steps: 1: Service & Helper, 2: Slot & Date, 3: Location, 4: Review & Urgency, 5: Confirmation
  const [step, setStep] = useState<number>(1);

  // Form State
  const [serviceKey, setServiceKey] = useState<ServiceKey>(initialServiceKey || 'cleaning');
  const [selectedHelperId, setSelectedHelperId] = useState<number | null>(initialHelperId || null);
  const [dateStr, setDateStr] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    return tomorrow.toISOString().substring(0, 10);
  });
  const [timeStr, setTimeStr] = useState<string>('09:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(120);

  // Location
  const [city, setCity] = useState<string>('Lusaka');
  const [area, setArea] = useState<string>('Kabulonga');
  const [distanceKm, setDistanceKm] = useState<number>(5);

  // Customer Contact & Details
  const [customerName, setCustomerName] = useState<string>('Bwalya Kangwa');
  const [customerPhone, setCustomerPhone] = useState<string>('+260 978 123 456');
  const [details, setDetails] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  // Submission & Error State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Active Service object
  const currentService = useMemo(() => {
    return services.find((s) => s.key === serviceKey) || services[0];
  }, [services, serviceKey]);

  // Selected Helper object
  const currentHelper = useMemo(() => {
    if (!selectedHelperId) return null;
    return helpers.find((h) => h.id === selectedHelperId) || null;
  }, [helpers, selectedHelperId]);

  // Available Helpers for current service
  const matchingHelpers = useMemo(() => {
    return helpers.filter((h) => h.isVerified && h.serviceKeys.includes(serviceKey));
  }, [helpers, serviceKey]);

  // Price Calculation
  const priceBreakdown = useMemo(() => {
    return calculatePrice(
      currentService.baseFee,
      currentService.perKmRate,
      distanceKm,
      isUrgent
    );
  }, [currentService, distanceKm, isUrgent]);

  // Slot validation
  const slotValidation = useMemo(() => {
    if (!dateStr || !timeStr) return { isValid: false, errors: ['Select a date and time.'] };
    const combined = new Date(`${dateStr}T${timeStr}:00`);
    return validateBookingSlot(combined);
  }, [dateStr, timeStr]);

  // Available time slots generator
  const availableSlots = useMemo(() => {
    if (!dateStr) return [];
    return generateAvailableSlots(new Date(`${dateStr}T00:00:00`));
  }, [dateStr]);

  // Auto-calculate route distance when area changes (Lusaka network)
  const handleAreaChange = (newArea: string) => {
    setArea(newArea);
    const normalized = newArea.toLowerCase().replace(/\s+/g, '_');
    try {
      const route = findShortestRoute('cbd', normalized);
      if (route.totalDistanceKm > 0) {
        setDistanceKm(route.totalDistanceKm);
      }
    } catch {
      // fallback default
    }
  };

  // Submit Handler
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const scheduledStart = new Date(`${dateStr}T${timeStr}:00`).toISOString();

      const newBooking = createBooking({
        customerName,
        customerPhone,
        city,
        area,
        serviceKey,
        helperId: currentHelper?.id || null,
        helperName: currentHelper?.name || 'Assigned by Operations',
        scheduledStart,
        durationMinutes,
        distanceKm,
        isUrgent,
        baseFee: priceBreakdown.baseFee,
        travelFee: priceBreakdown.travelFee,
        urgencyFee: priceBreakdown.urgencyFee,
        estimatedFee: priceBreakdown.total,
        details: details || `${currentService.name} requested in ${area}, ${city}.`
      });

      setConfirmedBooking(newBooking);
      setStep(5);
      onBookingComplete(newBooking);
    } catch (err: any) {
      setErrorMessage(err.message || 'Booking conflict detected. Please select another helper or time.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span className={step >= 1 ? 'text-emerald-800' : ''}>1. Service & Helper</span>
          <span className={step >= 2 ? 'text-emerald-800' : ''}>2. Date & Time</span>
          <span className={step >= 3 ? 'text-emerald-800' : ''}>3. Location</span>
          <span className={step >= 4 ? 'text-emerald-800' : ''}>4. Review & Lock</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-700 h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (step / 4) * 100)}%` }}
          />
        </div>
      </div>

      {/* STEP 1: SERVICE & HELPER SELECTION */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">Step 1 of 4</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Select Your Service & Helper
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Choose the service you need and optionally select your preferred verified helper.
            </p>
          </div>

          {/* Service Dropdown/Pills */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Required Service Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {services.map((s) => {
                const isSelected = s.key === serviceKey;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setServiceKey(s.key);
                      // Clear helper if not supporting this service
                      if (currentHelper && !currentHelper.serviceKeys.includes(s.key)) {
                        setSelectedHelperId(null);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-700/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{s.name}</div>
                    <div className="text-emerald-800 font-extrabold text-xs mt-1">
                      {formatKwacha(s.baseFee, false)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Helper Picker */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center justify-between">
              <span>Choose Verified Helper (Optional)</span>
              <span className="text-slate-500 font-normal lowercase">or let operations assign best match</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Best Match */}
              <div
                onClick={() => setSelectedHelperId(null)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedHelperId === null
                    ? 'border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-700/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-lime-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Best Available Match</h4>
                    <p className="text-xs text-slate-500">Operations assigns verified helper near you</p>
                  </div>
                </div>
              </div>

              {/* Specific Helpers */}
              {matchingHelpers.map((h) => {
                const isSelected = selectedHelperId === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => {
                      if (!h.isBusyNow) setSelectedHelperId(h.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      h.isBusyNow
                        ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                        : isSelected
                        ? 'border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-700/20 cursor-pointer'
                        : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl ${h.avatarBg} text-white font-bold flex items-center justify-center`}
                        >
                          {h.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{h.name}</h4>
                          <p className="text-xs text-slate-500">
                            ★ {h.rating} ({h.reviewCount}) • {h.area}
                          </p>
                        </div>
                      </div>
                      {h.isBusyNow ? (
                        <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                          Busy
                        </span>
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 font-semibold text-sm hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Next: Date & Time</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DATE & TIME SLOT SELECTION */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">Step 2 of 4</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Select Booking Date & Time
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Operating hours: 06:00 to 21:00 (latest start 20:45). Minimum 1 hour notice.
            </p>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Service Date
            </label>
            <input
              type="date"
              value={dateStr}
              min={new Date().toISOString().substring(0, 10)}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Quick Time Slot Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Available Time Slots
            </label>
            <div className="flex flex-wrap gap-2">
              {['08:00', '09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'].map(
                (slot) => {
                  const isSelected = timeStr === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeStr(slot)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Estimated Duration
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-hidden"
            >
              <option value={60}>1 hour</option>
              <option value={120}>2 hours (Standard)</option>
              <option value={180}>3 hours (Deep Clean / Large home)</option>
              <option value={240}>4 hours (Half-day)</option>
              <option value={480}>8 hours (Full-day)</option>
            </select>
          </div>

          {/* Real-time Validation Errors */}
          {!slotValidation.isValid && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Scheduling Constraint:</span>
              </div>
              {slotValidation.errors.map((err, idx) => (
                <p key={idx} className="ml-5 list-disc">• {err}</p>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!slotValidation.isValid}
              className={`px-6 py-3 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 ${
                slotValidation.isValid
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Next: Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION & CONTACT DETAILS */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">Step 3 of 4</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Location & Contact Information
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Enter where the helper will report and how they can reach you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-hidden"
              >
                <option value="Lusaka">Lusaka</option>
                <option value="Kitwe">Kitwe</option>
                <option value="Ndola">Ndola</option>
              </select>
            </div>

            {/* Area / Neighborhood */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Area / Neighborhood
              </label>
              <select
                value={area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-hidden"
              >
                <option value="Kabulonga">Kabulonga</option>
                <option value="Woodlands">Woodlands</option>
                <option value="Rhodes Park">Rhodes Park</option>
                <option value="Roma">Roma</option>
                <option value="Olympia">Olympia</option>
                <option value="Northmead">Northmead</option>
                <option value="Avondale">Avondale</option>
                <option value="Chelstone">Chelstone</option>
                <option value="Chilenje">Chilenje</option>
                <option value="Matero">Matero</option>
              </select>
            </div>
          </div>

          {/* Distance in KM (Applies if per-km rate > 0) */}
          {currentService.perKmRate > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-950 uppercase tracking-wider">
                  Calculated Travel Distance (Dijkstra Route)
                </span>
                <span className="font-black text-emerald-800 text-sm">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <p className="text-[11px] text-slate-600">
                Rate: K{currentService.perKmRate}/km. Shortest path computed automatically across Lusaka arterial roads.
              </p>
            </div>
          )}

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Your Full Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Phone Number (WhatsApp Active)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Details / Special Instructions */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Specific Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Please bring extra surface disinfectant; house has 2 cats; gate code #1234."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-hidden text-xs sm:text-sm"
            />
          </div>

          {/* Navigation */}
          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!customerName.trim() || !customerPhone.trim()}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <span>Next: Review & Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW, URGENCY & PRICE LOCK */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">Step 4 of 4</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Review & Lock Reservation
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Inspect your transparent cost breakdown before atomic reservation.
            </p>
          </div>

          {/* Urgency Surcharge Option (1.25x Multiplier) */}
          <div
            onClick={() => setIsUrgent(!isUrgent)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
              isUrgent
                ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                isUrgent ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                <Zap className="w-5 h-5 text-lime-300" />
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Urgent Service Request</span>
                  <span className="text-[10px] uppercase font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    +25% multiplier
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Prioritizes your job in the Min-Heap dispatch queue for immediate dispatch.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
            />
          </div>

          {/* Booking Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Service:</span>
              <span className="font-bold text-slate-900">{currentService.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Assigned Helper:</span>
              <span className="font-bold text-emerald-800">
                {currentHelper ? currentHelper.name : 'Best Available Verified Helper'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Scheduled Time:</span>
              <span className="font-bold text-slate-900">
                {dateStr} at {timeStr} ({durationMinutes / 60} hrs)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Location:</span>
              <span className="font-bold text-slate-900">
                {area}, {city}
              </span>
            </div>

            {/* Price Breakdown */}
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Base Service Rate:</span>
                <span>{formatKwacha(priceBreakdown.baseFee)}</span>
              </div>
              {priceBreakdown.travelFee > 0 && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Travel Distance Fee ({distanceKm} km × K{currentService.perKmRate}):</span>
                  <span>{formatKwacha(priceBreakdown.travelFee)}</span>
                </div>
              )}
              {isUrgent && (
                <div className="flex justify-between text-xs text-amber-800 font-semibold">
                  <span>Urgent Surcharge (1.25x):</span>
                  <span>+{formatKwacha(priceBreakdown.urgencyFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base sm:text-lg font-black text-emerald-900 pt-2 border-t border-slate-200">
                <span>Total Estimated Cost:</span>
                <span className="text-emerald-700">{formatKwacha(priceBreakdown.total)}</span>
              </div>
            </div>
          </div>

          {/* Concurrency Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Booking Collision Detected:</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Security & Concurrency Guarantee */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Protected by atomic Mutex Concurrency Lock. Zero double-booking guarantee.
            </span>
          </div>

          {/* Navigation */}
          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/25 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Acquiring Lock...</span>
              ) : (
                <>
                  <Check className="w-5 h-5 text-lime-300" />
                  <span>Confirm & Lock Reservation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRMATION & WHATSAPP SETTLEMENT */}
      {step === 5 && confirmedBooking && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold text-xs uppercase tracking-wider">
              Booking Reserved Successfully
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              Reference: {confirmedBooking.bookingCode}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Your helper slot is locked. An SMS & WhatsApp confirmation has been initiated.
            </p>
          </div>

          {/* Quick Details Card */}
          <div className="bg-slate-50 rounded-2xl p-4 max-w-md mx-auto text-xs text-left space-y-2 border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="font-bold text-slate-900">{currentService.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Helper:</span>
              <span className="font-bold text-emerald-800">{confirmedBooking.helperName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Total:</span>
              <span className="font-black text-slate-900">{formatKwacha(confirmedBooking.estimatedFee)}</span>
            </div>
          </div>

          {/* WhatsApp Payment Enquiry Button */}
          <div className="max-w-md mx-auto space-y-3 pt-2">
            <a
              href={`https://wa.me/260772300053?text=${encodeURIComponent(
                `Hello ZamHelper, I have booked ${currentService.name} (Booking Ref: ${confirmedBooking.bookingCode}). Total estimated fee: ${formatKwacha(
                  confirmedBooking.estimatedFee
                )} for ${dateStr} at ${timeStr}. Please confirm helper assignment and mobile money payment details.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm shadow-md transition-all text-center"
            >
              <MessageSquare className="w-5 h-5 text-lime-300" />
              <span>Confirm via WhatsApp (+260 772 300 053)</span>
            </a>

            <button
              onClick={onCancel}
              className="w-full py-2.5 text-slate-600 hover:text-slate-900 text-xs font-bold"
            >
              Return to Marketplace Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

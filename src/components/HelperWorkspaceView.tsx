/**
 * HelperWorkspaceView Component
 * Helper profile, real-time availability toggle, assigned bookings,
 * and KYC document verification upload workspace.
 */

import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Upload,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Briefcase
} from 'lucide-react';
import { Helper, Booking, Service } from '../types';
import { formatKwacha } from '../core/pricing';

interface HelperWorkspaceViewProps {
  currentHelper: Helper;
  bookings: Booking[];
  services: Service[];
  onToggleAvailability: (helperId: number) => void;
  onUpdateBookingStatus: (bookingId: string, status: any) => void;
}

export const HelperWorkspaceView: React.FC<HelperWorkspaceViewProps> = ({
  currentHelper,
  bookings,
  services,
  onToggleAvailability,
  onUpdateBookingStatus
}) => {
  const [docType, setDocType] = useState<string>('police_clearance');
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const helperBookings = bookings.filter((b) => b.helperId === currentHelper.id);
  const activeBookings = helperBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'pending'
  );

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedDocName(e.target.files[0].name);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${currentHelper.avatarBg} text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md`}
          >
            {currentHelper.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentHelper.name}</h1>
              <ShieldCheck className="w-5 h-5 text-lime-400" />
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-lime-300" />
              <span>
                {currentHelper.area}, {currentHelper.city} • Rating: {currentHelper.rating} ★ ({currentHelper.reviewCount} reviews)
              </span>
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-4 self-start md:self-auto">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
              Live Work Status
            </span>
            <div className="text-sm font-bold text-white">
              {currentHelper.isAvailable ? '🟢 Accepting Bookings' : '🔴 Off-Duty'}
            </div>
          </div>
          <button
            onClick={() => onToggleAvailability(currentHelper.id)}
            className="p-1 text-lime-300 hover:text-white transition-colors"
            title="Toggle availability"
          >
            {currentHelper.isAvailable ? (
              <ToggleRight className="w-10 h-10 text-lime-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assigned Active Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-700" />
              <span>Assigned Service Jobs ({activeBookings.length})</span>
            </h3>
          </div>

          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500 text-sm">
              No active jobs currently assigned. Toggle your availability above to receive new customer bookings!
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {job.bookingCode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-100 text-amber-900">
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-500 block">Customer:</span>
                      <strong className="text-slate-900">{job.customerName}</strong> ({job.customerPhone})
                    </div>
                    <div>
                      <span className="text-slate-500 block">Service:</span>
                      <strong className="text-emerald-900">{job.serviceKey.toUpperCase()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location:</span>
                      <span>{job.area}, {job.city}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Scheduled:</span>
                      <span>{new Date(job.scheduledStart).toLocaleString()}</span>
                    </div>
                  </div>

                  {job.details && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      &ldquo;{job.details}&rdquo;
                    </p>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      Payout: {formatKwacha(job.estimatedFee)}
                    </span>
                    <div className="flex gap-2">
                      {job.status === 'pending' && (
                        <button
                          onClick={() => onUpdateBookingStatus(job.id, 'confirmed')}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Accept Job
                        </button>
                      )}
                      {job.status === 'confirmed' && (
                        <button
                          onClick={() => onUpdateBookingStatus(job.id, 'in_progress')}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Start Job
                        </button>
                      )}
                      {job.status === 'in_progress' && (
                        <button
                          onClick={() => onUpdateBookingStatus(job.id, 'completed', 'paid')}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Verification & KYC Document Workspace */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                KYC Trust Compliance
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Verification Documents
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload official identity files to maintain your Verified Helper badge.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-950">Police Criminal Clearance</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Approved
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-950">National Registration Card (NRC)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Approved
                </span>
              </div>
            </div>

            {/* Document Upload Simulator */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Submit Additional Document (PDF/JPG, Max 5MB)
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-hidden"
              >
                <option value="police_clearance">Police Clearance Certificate</option>
                <option value="national_id">National ID / Passport</option>
                <option value="trade_certificate">Trade / Vocational Certificate</option>
                <option value="reference_letter">Client Reference Letter</option>
              </select>

              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-emerald-50/50 transition-colors">
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700">Choose file to upload</span>
                <span className="text-[10px] text-slate-400">PDF, JPG, or PNG</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleSimulateUpload}
                  className="hidden"
                />
              </label>

              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Document &quot;{uploadedDocName}&quot; submitted for Admin review.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

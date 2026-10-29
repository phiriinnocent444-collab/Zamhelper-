/**
 * AdminOperationsView Component
 * Platform administration, helper verification management,
 * payment confirmation, and immutable audit logs.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  DollarSign,
  Users,
  Calendar,
  Search,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { Helper, Booking, AuditLog } from '../types';
import { formatKwacha } from '../core/pricing';

interface AdminOperationsViewProps {
  helpers: Helper[];
  bookings: Booking[];
  auditLogs: AuditLog[];
  onUpdateHelperVerification: (helperId: number, status: 'verified' | 'rejected', notes?: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: any, paymentStatus?: any) => void;
  onResetAllData: () => void;
}

export const AdminOperationsView: React.FC<AdminOperationsViewProps> = ({
  helpers,
  bookings,
  auditLogs,
  onUpdateHelperVerification,
  onUpdateBookingStatus,
  onResetAllData
}) => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'bookings' | 'audit'>('verifications');
  const [auditSearch, setAuditSearch] = useState('');

  const totalRevenue = bookings.reduce((sum, b) => (b.paymentStatus === 'paid' ? sum + b.estimatedFee : sum), 0);
  const unverifiedHelpers = helpers.filter((h) => h.verificationStatus === 'pending' || !h.isVerified);

  const filteredLogs = auditLogs.filter((log) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">
            Operations Control Center
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Platform Administration
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Manual trust reviews, mobile money reconciliation, and audit trail verification.
          </p>
        </div>

        <button
          onClick={onResetAllData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors self-start sm:self-auto border border-slate-200"
          title="Reset application data to initial seed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo DB</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Settled GMV</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{formatKwacha(totalRevenue)}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Airtel / MTN Verified</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase">Active Bookings</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</div>
          <span className="text-[11px] text-blue-700 font-semibold">In dispatch pipeline</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase">Verified Helpers</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {helpers.filter((h) => h.isVerified).length} / {helpers.length}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Police cleared</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase">Pending KYC Reviews</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{unverifiedHelpers.length}</div>
          <span className="text-[11px] text-amber-700 font-semibold">Requires review</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Helper KYC Approvals</span>
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Booking Payments & Overrides</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* 1. KYC VERIFICATION QUEUE */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Helper Verification & Trust Applications
            </h3>
            <p className="text-xs text-slate-500">
              Manual trust decisions require examining applicant police clearance certificates and physical NRC documentation before granting the Verified badge.
            </p>

            <div className="divide-y divide-slate-100">
              {helpers.map((helper) => (
                <div
                  key={helper.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl ${helper.avatarBg} text-white font-bold flex items-center justify-center shrink-0`}
                    >
                      {helper.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{helper.name}</span>
                        {helper.isVerified ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                            Pending Review
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {helper.area}, {helper.city} • Phone: {helper.phone} • Joined {helper.joinedDate}
                      </p>
                      {helper.verificationNotes && (
                        <p className="text-xs text-slate-600 mt-1 italic">&ldquo;{helper.verificationNotes}&rdquo;</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {!helper.isVerified ? (
                      <button
                        onClick={() =>
                          onUpdateHelperVerification(
                            helper.id,
                            'verified',
                            'Police clearance & NRC documents validated by Admin.'
                          )
                        }
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Helper</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          onUpdateHelperVerification(helper.id, 'rejected', 'Verification revoked by Admin.')
                        }
                        className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        Revoke Verification
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKINGS & PAYMENTS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Booking Status & Payment Reconciliation
            </h3>
            <p className="text-xs text-slate-500">
              Confirm payments once customer transfers via Airtel Money or MTN MoMo (+260 772 300 053).
            </p>

            <div className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {b.bookingCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{b.serviceKey.toUpperCase()}</span>
                      <span className="text-xs text-slate-500">• {b.customerName}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Assigned to: <strong className="text-emerald-900">{b.helperName}</strong> • Location: {b.area}, {b.city}
                    </p>
                    <p className="text-xs text-slate-700 mt-0.5 font-bold">
                      Fee: {formatKwacha(b.estimatedFee)} • Payment Status: <span className="uppercase text-emerald-800">{b.paymentStatus}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {b.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => onUpdateBookingStatus(b.id, b.status, 'paid')}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Mark as Paid (Airtel/MTN)
                      </button>
                    )}
                    {b.status !== 'completed' && (
                      <button
                        onClick={() => onUpdateBookingStatus(b.id, 'completed', 'paid')}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl"
                      >
                        Force Complete
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => onUpdateBookingStatus(b.id, 'cancelled')}
                        className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Platform Security & Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable record of state changes and administrative transactions.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Filter logs..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Entity ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{log.timestamp}</td>
                    <td className="p-3 font-sans font-bold text-slate-900">{log.actor}</td>
                    <td className="p-3 text-emerald-800 font-bold">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.entityType}</td>
                    <td className="p-3 text-slate-900">{log.entityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * DashboardView Component
 * Customer bookings management, status tracking, WhatsApp mobile money payment
 * enquiry handoff, and review submission.
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
  CreditCard
} from 'lucide-react';
import { Booking, BookingStatus, Helper } from '../types';
import { formatKwacha } from '../core/pricing';

interface DashboardViewProps {
  bookings: Booking[];
  helpers: Helper[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus, paymentStatus?: any) => void;
  onAddReview: (bookingId: string, helperId: number, rating: number, comment: string) => void;
  onNavigateToBooking: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bookings,
  helpers,
  onUpdateBookingStatus,
  onAddReview,
  onNavigateToBooking
}) => {
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const handleReviewSubmit = () => {
    if (!selectedBookingForReview || !selectedBookingForReview.helperId) return;
    onAddReview(
      selectedBookingForReview.id,
      selectedBookingForReview.helperId,
      reviewRating,
      reviewComment.trim() || 'Excellent service!'
    );
    setSelectedBookingForReview(null);
    setReviewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            My Service Bookings
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Track active appointments, confirm mobile money payments, and review verified helpers.
          </p>
        </div>

        <button
          onClick={onNavigateToBooking}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          + Book New Service
        </button>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Bookings Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You don&apos;t have any active or past service requests. Choose a verified helper to get started!
          </p>
          <button
            onClick={onNavigateToBooking}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isPending = booking.status === 'pending';
            const isInProgress = booking.status === 'in_progress';
            const isConfirmed = booking.status === 'confirmed';
            const isCompleted = booking.status === 'completed';
            const isCancelled = booking.status === 'cancelled';

            const helperObj = helpers.find((h) => h.id === booking.helperId);

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {booking.bookingCode}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-800'
                          : isConfirmed
                          ? 'bg-purple-100 text-purple-800'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Payment: {booking.paymentStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {booking.serviceKey.toUpperCase()} • {booking.area}, {booking.city}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{new Date(booking.scheduledStart).toLocaleDateString()} at {new Date(booking.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <span>• Helper: <strong className="text-emerald-900">{booking.helperName}</strong></span>
                    <span>• Fee: <strong className="text-slate-900">{formatKwacha(booking.estimatedFee)}</strong></span>
                  </div>

                  {booking.details && (
                    <p className="text-xs text-slate-500 italic max-w-xl">&ldquo;{booking.details}&rdquo;</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* WhatsApp Enquiry Button */}
                  <a
                    href={`https://wa.me/260772300053?text=${encodeURIComponent(
                      `Hello ZamHelper, I am following up on Booking Ref: ${booking.bookingCode} for ${booking.serviceKey} with helper ${booking.helperName}. Status: ${booking.status}. Amount: ${formatKwacha(booking.estimatedFee)}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Mark Completed trigger */}
                  {(isConfirmed || isInProgress) && (
                    <button
                      onClick={() => onUpdateBookingStatus(booking.id, 'completed', 'paid')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Complete & Pay
                    </button>
                  )}

                  {/* Leave review trigger */}
                  {isCompleted && (
                    <button
                      onClick={() => setSelectedBookingForReview(booking)}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>Review Helper</span>
                    </button>
                  )}

                  {/* Cancel if pending */}
                  {isPending && (
                    <button
                      onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                      className="px-3 py-2 text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-emerald-100 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Verified Feedback</span>
                <h3 className="text-lg font-black text-slate-900">
                  Review {selectedBookingForReview.helperName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForReview(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Star Rating Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Rating (1 to 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1.5 text-2xl transition-transform hover:scale-110 focus:outline-hidden"
                  >
                    <span className={star <= reviewRating ? 'text-amber-400' : 'text-slate-200'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Feedback / Comment</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was the punctuality, thoroughness, and communication?"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedBookingForReview(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

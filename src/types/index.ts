/**
 * ZamHelper Domain Types & Interfaces
 * Comprehensive multi-platform types for Services, Helpers, Bookings,
 * SDLC Models, and Algorithm Complexity benchmarks.
 */

export type ServiceKey =
  | 'cleaning'
  | 'laundry'
  | 'errands'
  | 'delivery'
  | 'repairs'
  | 'gardening'
  | 'tutoring'
  | 'home_assistance'
  | 'moving'
  | 'other';

export interface Service {
  id: number;
  key: ServiceKey;
  name: string;
  desc: string;
  baseFee: number; // in Zambian Kwacha (ZMW)
  perKmRate: number; // in ZMW per km
  category: 'cleaning' | 'maintenance' | 'logistics' | 'care' | 'general';
  popular?: boolean;
}

export type VerificationStatus = 'unsubmitted' | 'pending' | 'verified' | 'rejected';

export interface Helper {
  id: number;
  name: string;
  phone: string;
  city: string;
  area: string;
  skills: string;
  serviceKeys: ServiceKey[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  isAvailable: boolean;
  isBusyNow: boolean;
  activeBookingId?: string | null;
  coords: { lat: number; lng: number };
  completedJobsCount: number;
  policeClearance: boolean;
  nationalIdVerified: boolean;
  joinedDate: string;
  avatarBg: string;
}

export type BookingStatus =
  | 'pending'
  | 'contacted'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'not_required'
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  area: string;
  serviceKey: ServiceKey;
  helperId?: number | null;
  helperName?: string | null;
  scheduledStart: string; // ISO string
  durationMinutes: number;
  distanceKm: number;
  isUrgent: boolean;
  baseFee: number;
  travelFee: number;
  urgencyFee: number;
  estimatedFee: number;
  details: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentChannel?: 'WhatsApp Enquiry' | 'Airtel Money' | 'MTN MoMo' | 'Cash on Delivery';
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  helperId: number;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export type UserRole = 'customer' | 'helper' | 'admin';

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  helperId?: number;
}

export type PlatformDevice = 'pc' | 'android' | 'ios';

export type AppView =
  | 'home'
  | 'services'
  | 'helpers'
  | 'book'
  | 'dashboard'
  | 'helper-workspace'
  | 'admin'
  | 'sdlc';

// SDLC & Engineering Types
export interface SDLCModelInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  bestUsedFor: string;
  phases: { name: string; description: string; deliverable: string; status: 'completed' | 'current' | 'future' }[];
  applicationInZamHelper: string;
}

export interface ComplexityBenchmark {
  algorithm: string;
  operation: string;
  timeComplexityBest: string;
  timeComplexityAvg: string;
  timeComplexityWorst: string;
  spaceComplexity: string;
  description: string;
  practicalMetric: string;
}

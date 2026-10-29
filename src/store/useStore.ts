/**
 * ZamHelper Unified Application State Store
 * Reactive React state with localStorage persistence and synchronization.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Service,
  Helper,
  Booking,
  Review,
  AuditLog,
  PlatformDevice,
  AppView,
  UserRole,
  UserSession,
  ServiceKey
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_HELPERS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';
import { globalMutexRegistry } from '../core/concurrency';
import { SpatialHashGrid } from '../core/algorithms';

const STORAGE_KEY = 'zamhelper_app_state_v2.4';

interface AppPersistedState {
  services: Service[];
  helpers: Helper[];
  bookings: Booking[];
  reviews: Review[];
  auditLogs: AuditLog[];
  currentUser: UserSession;
  deviceMode: PlatformDevice;
}

const DEFAULT_USER: UserSession = {
  id: 'USR-CUST-1',
  name: 'Bwalya Kangwa',
  phone: '+260 978 123 456',
  role: 'customer'
};

function loadStoredState(): AppPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        services: parsed.services?.length ? parsed.services : INITIAL_SERVICES,
        helpers: parsed.helpers?.length ? parsed.helpers : INITIAL_HELPERS,
        bookings: parsed.bookings?.length ? parsed.bookings : INITIAL_BOOKINGS,
        reviews: parsed.reviews?.length ? parsed.reviews : INITIAL_REVIEWS,
        auditLogs: parsed.auditLogs?.length ? parsed.auditLogs : INITIAL_AUDIT_LOGS,
        currentUser: parsed.currentUser || DEFAULT_USER,
        deviceMode: parsed.deviceMode || 'pc'
      };
    }
  } catch (err) {
    console.error('Failed to parse stored state, falling back to initial data', err);
  }

  return {
    services: INITIAL_SERVICES,
    helpers: INITIAL_HELPERS,
    bookings: INITIAL_BOOKINGS,
    reviews: INITIAL_REVIEWS,
    auditLogs: INITIAL_AUDIT_LOGS,
    currentUser: DEFAULT_USER,
    deviceMode: 'pc'
  };
}

export function useAppStore() {
  const [state, setState] = useState<AppPersistedState>(loadStoredState);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedServiceKey, setSelectedServiceKey] = useState<ServiceKey | null>(null);
  const [selectedHelperId, setSelectedHelperId] = useState<number | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [helperSearchQuery, setHelperSearchQuery] = useState('');
  const [helperCityFilter, setHelperCityFilter] = useState<string>('All');
  const [helperServiceFilter, setHelperServiceFilter] = useState<string>('All');
  const [helperSortBy, setHelperSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist app state', err);
    }
  }, [state]);

  // Spatial index instance
  const spatialIndex = useMemo(() => {
    const grid = new SpatialHashGrid(3.0);
    grid.buildIndex(state.helpers);
    return grid;
  }, [state.helpers]);

  // Actions
  const setDeviceMode = useCallback((deviceMode: PlatformDevice) => {
    setState((prev) => ({ ...prev, deviceMode }));
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setState((prev) => {
      let newUser: UserSession;
      if (role === 'helper') {
        newUser = {
          id: 'USR-HLP-1',
          name: 'Chanda Bwalya',
          phone: '+260 971 445 210',
          role: 'helper',
          helperId: 1
        };
      } else if (role === 'admin') {
        newUser = {
          id: 'USR-ADM-1',
          name: 'ZamHelper Operations (Admin)',
          phone: '+260 772 300 053',
          role: 'admin'
        };
      } else {
        newUser = DEFAULT_USER;
      }
      return { ...prev, currentUser: newUser };
    });
  }, []);

  const addAuditLog = useCallback((action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) => {
    setState((prev) => {
      const newLog: AuditLog = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        actor: `${prev.currentUser.name} (${prev.currentUser.role})`,
        action,
        entityType,
        entityId,
        metadata,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      return {
        ...prev,
        auditLogs: [newLog, ...prev.auditLogs.slice(0, 49)]
      };
    });
  }, []);

  const createBooking = useCallback(
    (bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'status' | 'paymentStatus'>) => {
      const codeNum = Math.floor(100000 + Math.random() * 900000);
      const bookingCode = `ZAM-${codeNum}`;
      const id = `BK-${Date.now()}`;

      // Acquire concurrency lock if helper is specified
      if (bookingData.helperId) {
        const lockRes = globalMutexRegistry.acquireLock(bookingData.helperId, bookingCode);
        if (!lockRes.acquired) {
          throw new Error(lockRes.message);
        }
      }

      const newBooking: Booking = {
        ...bookingData,
        id,
        bookingCode,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString()
      };

      setState((prev) => {
        // If helper is assigned, mark helper busy
        const updatedHelpers = prev.helpers.map((h) => {
          if (h.id === bookingData.helperId) {
            return { ...h, isBusyNow: true, activeBookingId: id };
          }
          return h;
        });

        return {
          ...prev,
          bookings: [newBooking, ...prev.bookings],
          helpers: updatedHelpers
        };
      });

      addAuditLog('BOOKING_CREATED', 'booking', bookingCode, {
        service: bookingData.serviceKey,
        amount: bookingData.estimatedFee,
        helperId: bookingData.helperId
      });

      return newBooking;
    },
    [addAuditLog]
  );

  const updateBookingStatus = useCallback(
    (bookingId: string, newStatus: Booking.status, newPaymentStatus?: Booking.paymentStatus) => {
      setState((prev) => {
        let freedHelperId: number | null = null;
        const updatedBookings = prev.bookings.map((b) => {
          if (b.id === bookingId) {
            if (newStatus === 'completed' || newStatus === 'cancelled') {
              freedHelperId = b.helperId || null;
            }
            return {
              ...b,
              status: newStatus,
              ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {})
            };
          }
          return b;
        });

        // Release helper lock and busy flag if completed or cancelled
        let updatedHelpers = prev.helpers;
        if (freedHelperId) {
          globalMutexRegistry.releaseLock(freedHelperId);
          updatedHelpers = prev.helpers.map((h) => {
            if (h.id === freedHelperId) {
              return { ...h, isBusyNow: false, activeBookingId: null };
            }
            return h;
          });
        }

        return {
          ...prev,
          bookings: updatedBookings,
          helpers: updatedHelpers
        };
      });

      addAuditLog('BOOKING_STATUS_UPDATED', 'booking', bookingId, { status: newStatus, paymentStatus: newPaymentStatus });
    },
    [addAuditLog]
  );

  const updateHelperVerification = useCallback(
    (helperId: number, status: 'verified' | 'rejected', notes?: string) => {
      setState((prev) => {
        const updatedHelpers = prev.helpers.map((h) => {
          if (h.id === helperId) {
            return {
              ...h,
              isVerified: status === 'verified',
              verificationStatus: status,
              verificationNotes: notes || (status === 'verified' ? 'Approved by Admin' : 'Declined by Admin')
            };
          }
          return h;
        });
        return { ...prev, helpers: updatedHelpers };
      });

      addAuditLog('HELPER_VERIFICATION_REVIEWED', 'helper', String(helperId), { status, notes });
    },
    [addAuditLog]
  );

  const toggleHelperAvailability = useCallback((helperId: number) => {
    setState((prev) => {
      const updated = prev.helpers.map((h) => {
        if (h.id === helperId) {
          return { ...h, isAvailable: !h.isAvailable };
        }
        return h;
      });
      return { ...prev, helpers: updated };
    });
  }, []);

  const addReview = useCallback(
    (bookingId: string, helperId: number, rating: number, comment: string) => {
      const newReview: Review = {
        id: `REV-${Date.now()}`,
        bookingId,
        helperId,
        customerName: state.currentUser.name,
        rating,
        comment,
        createdAt: new Date().toISOString().substring(0, 10)
      };

      setState((prev) => {
        // Recalculate helper rating
        const helperReviews = [...prev.reviews.filter((r) => r.helperId === helperId), newReview];
        const avg = helperReviews.reduce((sum, r) => sum + r.rating, 0) / helperReviews.length;
        const roundedAvg = Math.round(avg * 10) / 10;

        const updatedHelpers = prev.helpers.map((h) => {
          if (h.id === helperId) {
            return {
              ...h,
              rating: roundedAvg,
              reviewCount: helperReviews.length
            };
          }
          return h;
        });

        return {
          ...prev,
          reviews: [newReview, ...prev.reviews],
          helpers: updatedHelpers
        };
      });

      addAuditLog('REVIEW_SUBMITTED', 'review', newReview.id, { helperId, rating });
    },
    [state.currentUser.name, addAuditLog]
  );

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      services: INITIAL_SERVICES,
      helpers: INITIAL_HELPERS,
      bookings: INITIAL_BOOKINGS,
      reviews: INITIAL_REVIEWS,
      auditLogs: INITIAL_AUDIT_LOGS,
      currentUser: DEFAULT_USER,
      deviceMode: 'pc'
    });
    setCurrentView('home');
  }, []);

  return {
    state,
    currentView,
    setCurrentView,
    selectedServiceKey,
    setSelectedServiceKey,
    selectedHelperId,
    setSelectedHelperId,
    isDownloadModalOpen,
    setIsDownloadModalOpen,
    helperSearchQuery,
    setHelperSearchQuery,
    helperCityFilter,
    setHelperCityFilter,
    helperServiceFilter,
    setHelperServiceFilter,
    helperSortBy,
    setHelperSortBy,
    spatialIndex,
    setDeviceMode,
    switchRole,
    createBooking,
    updateBookingStatus,
    updateHelperVerification,
    toggleHelperAvailability,
    addReview,
    resetAllData
  };
}

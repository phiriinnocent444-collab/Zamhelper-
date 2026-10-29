/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAppStore } from './store/useStore';
import { DeviceFrame } from './components/DeviceFrame';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ServicesView } from './components/ServicesView';
import { HelpersView } from './components/HelpersView';
import { BookingWizard } from './components/BookingWizard';
import { SdlcCenterView } from './components/SdlcCenterView';
import { DashboardView } from './components/DashboardView';
import { HelperWorkspaceView } from './components/HelperWorkspaceView';
import { AdminOperationsView } from './components/AdminOperationsView';
import { Footer } from './components/Footer';
import { DownloadModal } from './components/DownloadModal';
import { ServiceKey } from './types';

export default function App() {
  const {
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
    setDeviceMode,
    switchRole,
    createBooking,
    updateBookingStatus,
    updateHelperVerification,
    toggleHelperAvailability,
    addReview,
    resetAllData
  } = useAppStore();

  // Register service worker for offline capability & PWA install
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration:', err);
      });
    }
  }, []);

  // Handlers
  const handleSelectService = (key: ServiceKey) => {
    setSelectedServiceKey(key);
    setCurrentView('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToBooking = (serviceKey?: ServiceKey, helperId?: number) => {
    if (serviceKey) setSelectedServiceKey(serviceKey);
    if (helperId) setSelectedHelperId(helperId);
    setCurrentView('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookHelper = (helperId: number, serviceKey?: ServiceKey) => {
    setSelectedHelperId(helperId);
    if (serviceKey) setSelectedServiceKey(serviceKey);
    setCurrentView('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find active helper for workspace view
  const currentHelperProfile =
    state.helpers.find((h) => h.id === state.currentUser.helperId) || state.helpers[0];

  return (
    <DeviceFrame
      deviceMode={state.deviceMode}
      onSetDeviceMode={setDeviceMode}
      onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
    >
      <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-[#f8faf6]">
        {/* Navigation Header */}
        <Header
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          deviceMode={state.deviceMode}
          onSetDeviceMode={setDeviceMode}
          currentUserRole={state.currentUser.role}
          onSwitchRole={switchRole}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        />

        {/* Main View Router */}
        <main className="flex-1">
          {currentView === 'home' && (
            <HomeView
              services={state.services}
              helpers={state.helpers}
              onSelectService={handleSelectService}
              onNavigateToBooking={handleNavigateToBooking}
              onNavigateToHelpers={() => {
                setCurrentView('helpers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToSdlc={() => {
                setCurrentView('sdlc');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
            />
          )}

          {currentView === 'services' && (
            <ServicesView
              services={state.services}
              onBookService={(key) => handleNavigateToBooking(key)}
            />
          )}

          {currentView === 'helpers' && (
            <HelpersView
              helpers={state.helpers}
              services={state.services}
              reviews={state.reviews}
              onBookHelper={handleBookHelper}
              searchQuery={helperSearchQuery}
              onSetSearchQuery={setHelperSearchQuery}
              cityFilter={helperCityFilter}
              onSetCityFilter={setHelperCityFilter}
              serviceFilter={helperServiceFilter}
              onSetServiceFilter={setHelperServiceFilter}
              sortBy={helperSortBy}
              onSetSortBy={setHelperSortBy}
            />
          )}

          {currentView === 'book' && (
            <BookingWizard
              services={state.services}
              helpers={state.helpers}
              initialServiceKey={selectedServiceKey}
              initialHelperId={selectedHelperId}
              onBookingComplete={(newBooking) => {
                // Keep view on confirmation step inside wizard
              }}
              onCancel={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              createBooking={createBooking}
            />
          )}

          {currentView === 'sdlc' && <SdlcCenterView helpers={state.helpers} />}

          {currentView === 'dashboard' && (
            <DashboardView
              bookings={state.bookings}
              helpers={state.helpers}
              onUpdateBookingStatus={updateBookingStatus}
              onAddReview={addReview}
              onNavigateToBooking={() => {
                setCurrentView('book');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentView === 'helper-workspace' && (
            <HelperWorkspaceView
              currentHelper={currentHelperProfile}
              bookings={state.bookings}
              services={state.services}
              onToggleAvailability={toggleHelperAvailability}
              onUpdateBookingStatus={updateBookingStatus}
            />
          )}

          {currentView === 'admin' && (
            <AdminOperationsView
              helpers={state.helpers}
              bookings={state.bookings}
              auditLogs={state.auditLogs}
              onUpdateHelperVerification={updateHelperVerification}
              onUpdateBookingStatus={updateBookingStatus}
              onResetAllData={resetAllData}
            />
          )}
        </main>

        {/* Global Footer */}
        <Footer
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        />

        {/* Multi-Platform Download & Install Modal */}
        <DownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          defaultTab={state.deviceMode}
        />
      </div>
    </DeviceFrame>
  );
}

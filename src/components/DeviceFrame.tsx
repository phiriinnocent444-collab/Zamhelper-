/**
 * DeviceFrame Component
 * Renders the app in full PC responsive mode or inside realistic
 * Android (Pixel) or iOS (iPhone) frames for testing mobile experiences.
 */

import React from 'react';
import { Wifi, Battery, Signal, ArrowLeft, Home, Square } from 'lucide-react';
import { PlatformDevice } from '../types';

interface DeviceFrameProps {
  deviceMode: PlatformDevice;
  onSetDeviceMode: (mode: PlatformDevice) => void;
  onOpenDownloadModal: () => void;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceMode,
  onSetDeviceMode,
  onOpenDownloadModal,
  children
}) => {
  // If PC mode, render standard full responsive container
  if (deviceMode === 'pc') {
    return <div className="min-h-screen flex flex-col bg-[#f8faf6]">{children}</div>;
  }

  const isAndroid = deviceMode === 'android';
  const isIOS = deviceMode === 'ios';

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-2 sm:px-6 flex flex-col items-center justify-start transition-colors">
      {/* Device Mode Switcher Floating Bar */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between bg-slate-800/90 backdrop-blur border border-slate-700/80 rounded-2xl px-4 py-2 text-white text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">
            {isAndroid ? 'Android Device Simulator (Pixel 8)' : 'iOS Device Simulator (iPhone 16 Pro)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSetDeviceMode('pc')}
            className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 font-medium text-slate-200 transition-colors"
            title="Switch to PC Desktop View"
          >
            PC Mode
          </button>
          <button
            onClick={onOpenDownloadModal}
            className="px-2.5 py-1 rounded-lg bg-lime-400 text-emerald-950 font-bold hover:bg-lime-300 transition-colors"
          >
            Get App
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        className={`relative w-full max-w-[400px] h-[844px] bg-white rounded-[48px] shadow-2xl overflow-hidden border-[10px] ${
          isAndroid ? 'border-slate-800' : 'border-slate-850'
        } flex flex-col ring-1 ring-white/10`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Status Bar */}
        <div className="h-10 bg-emerald-800 text-white flex items-center justify-between px-6 select-none shrink-0 text-xs font-semibold z-40 relative">
          {/* Left: Clock */}
          <span>09:41</span>

          {/* Center: Dynamic Island (iOS) or Camera cutout (Android) */}
          {isIOS && (
            <div className="absolute left-1/2 -translate-x-1/2 top-2 h-5 w-24 bg-black rounded-full flex items-center justify-end px-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60" />
            </div>
          )}

          {isAndroid && (
            <div className="absolute left-1/2 -translate-x-1/2 top-2 h-3.5 w-3.5 bg-black rounded-full border border-slate-700/50" />
          )}

          {/* Right: Signal, Wifi, Battery */}
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8faf6]">
          {children}
        </div>

        {/* Navigation Bar / Bottom Gesture Area */}
        {isAndroid ? (
          <div className="h-11 bg-slate-900 text-slate-400 flex items-center justify-around px-8 shrink-0 select-none z-40">
            <button className="p-1 hover:text-white" aria-label="Android Back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-white" aria-label="Android Home">
              <Home className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-white" aria-label="Android Recents">
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="h-6 bg-white flex items-center justify-center shrink-0 z-40 select-none">
            <div className="w-32 h-1 bg-slate-900/60 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};

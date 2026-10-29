/**
 * ZamHelper Header Component
 * Multi-platform header with prominent Download App links, device switcher,
 * navigation tabs, and role selector.
 */

import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Apple,
  Monitor,
  Menu,
  X,
  Users,
  Calendar,
  Layers,
  Sparkles,
  Shield,
  Briefcase,
  Compass
} from 'lucide-react';
import { AppView, PlatformDevice, UserRole } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  deviceMode: PlatformDevice;
  onSetDeviceMode: (mode: PlatformDevice) => void;
  currentUserRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onOpenDownloadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  deviceMode,
  onSetDeviceMode,
  currentUserRole,
  onSwitchRole,
  onOpenDownloadModal
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs">
      {/* Top Banner: Prominent Multi-Platform Download & Device Selector */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white py-1.5 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Tagline / WhatsApp support */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-lime-400" />
            <span className="hidden sm:inline">Reliable Help, Anytime Across Zambia</span>
            <span className="text-emerald-300">•</span>
            <span className="text-lime-300 font-semibold">WhatsApp: +260 772 300 053</span>
          </div>

          {/* Quick Platform Switcher & Direct Download Trigger */}
          <div className="flex items-center gap-2.5">
            {/* Device Viewport Toggle */}
            <div className="flex items-center bg-emerald-950/60 rounded-lg p-0.5 border border-emerald-700/40">
              <button
                onClick={() => onSetDeviceMode('pc')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                  deviceMode === 'pc' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
                title="PC Desktop View"
              >
                <Monitor className="w-3 h-3" />
                <span className="hidden md:inline text-[11px]">PC</span>
              </button>
              <button
                onClick={() => onSetDeviceMode('android')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                  deviceMode === 'android' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
                title="Android View (Pixel)"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden md:inline text-[11px]">Android</span>
              </button>
              <button
                onClick={() => onSetDeviceMode('ios')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                  deviceMode === 'ios' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
                title="iOS View (iPhone)"
              >
                <Apple className="w-3 h-3" />
                <span className="hidden md:inline text-[11px]">iOS</span>
              </button>
            </div>

            {/* Easy-to-tap Download App Button */}
            <button
              onClick={onOpenDownloadModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400 hover:bg-lime-300 text-emerald-950 font-bold rounded-lg shadow-sm transition-all transform active:scale-95 text-[11px]"
              aria-label="Download ZamHelper App for Android and iOS"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download App</span>
              <span className="hidden lg:inline text-[10px] bg-emerald-900/20 px-1 py-0.5 rounded">
                Android / iOS / PC
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          aria-label="ZamHelper Home"
        >
          <img
            src="/zamhelper-badge.webp"
            alt="ZamHelper Logo"
            className="w-9 h-9 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
            onError={(e) => {
              // Fallback to favicon if webp loading fails
              (e.target as HTMLImageElement).src = '/favicon.png';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-emerald-900 font-sans">
                Zam<span className="text-emerald-600">Helper</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                Verified
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
              Home & On-Demand Services
            </p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              currentView === 'home'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              currentView === 'services'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => handleNavClick('helpers')}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              currentView === 'helpers'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Helpers Directory</span>
          </button>
          <button
            onClick={() => handleNavClick('sdlc')}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              currentView === 'sdlc'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>SDLC & Engineering</span>
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              currentView === 'dashboard'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            My Bookings
          </button>
        </nav>

        {/* Right CTA & Persona Switcher */}
        <div className="flex items-center gap-2">
          {/* Persona / Role Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => onSwitchRole('customer')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                currentUserRole === 'customer'
                  ? 'bg-white text-emerald-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => {
                onSwitchRole('helper');
                onNavigate('helper-workspace');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                currentUserRole === 'helper'
                  ? 'bg-white text-emerald-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Helper
            </button>
            <button
              onClick={() => {
                onSwitchRole('admin');
                onNavigate('admin');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                currentUserRole === 'admin'
                  ? 'bg-white text-emerald-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Book Now Primary Button */}
          <button
            onClick={() => handleNavClick('book')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all"
          >
            <Calendar className="w-4 h-4 text-lime-300" />
            <span>Book Helper</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2.5 rounded-xl text-left font-semibold text-sm ${
                currentView === 'home' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className={`px-3 py-2.5 rounded-xl text-left font-semibold text-sm ${
                currentView === 'services' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Services & Pricing
            </button>
            <button
              onClick={() => handleNavClick('helpers')}
              className={`px-3 py-2.5 rounded-xl text-left font-semibold text-sm ${
                currentView === 'helpers' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Verified Helpers Directory
            </button>
            <button
              onClick={() => handleNavClick('book')}
              className={`px-3 py-2.5 rounded-xl text-left font-semibold text-sm ${
                currentView === 'book' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Book a Service
            </button>
            <button
              onClick={() => handleNavClick('sdlc')}
              className={`px-3 py-2.5 rounded-xl text-left font-semibold text-sm ${
                currentView === 'sdlc' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              SDLC Models & Engineering Concepts
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2.5 rounded-xl text-left font-semibold text-sm ${
                currentView === 'dashboard' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              My Bookings Dashboard
            </button>
            <button
              onClick={() => handleNavClick('helper-workspace')}
              className={`px-3 py-2.5 rounded-xl text-left font-semibold text-sm ${
                currentView === 'helper-workspace' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Helper Workspace & Verification
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3 py-2.5 rounded-xl text-left font-semibold text-sm ${
                currentView === 'admin' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Admin Operations Center
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Switch Role:</span>
            <div className="flex gap-1">
              <button
                onClick={() => onSwitchRole('customer')}
                className={`px-2.5 py-1 text-xs rounded-lg ${
                  currentUserRole === 'customer' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => {
                  onSwitchRole('helper');
                  handleNavClick('helper-workspace');
                }}
                className={`px-2.5 py-1 text-xs rounded-lg ${
                  currentUserRole === 'helper' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Helper
              </button>
              <button
                onClick={() => {
                  onSwitchRole('admin');
                  handleNavClick('admin');
                }}
                className={`px-2.5 py-1 text-xs rounded-lg ${
                  currentUserRole === 'admin' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

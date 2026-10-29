/**
 * ZamHelper Footer Component
 * Platform links, download badges, WhatsApp contact, and copyright.
 */

import React from 'react';
import {
  Download,
  Smartphone,
  Apple,
  Monitor,
  ShieldCheck,
  MessageSquare,
  Layers,
  Heart
} from 'lucide-react';
import { AppView } from '../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  onOpenDownloadModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDownloadModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <img
                src="/zamhelper-badge.webp"
                alt="ZamHelper Logo"
                className="w-8 h-8 rounded-xl object-contain shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/favicon.png';
                }}
              />
              <span className="font-extrabold text-lg text-white">
                Zam<span className="text-lime-400">Helper</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Zambia&apos;s verified on-demand home & local services marketplace. Connecting homeowners and businesses with vetted helpers across Lusaka, Kitwe, and Ndola.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/260772300053"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-300 font-bold"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp: +260 772 300 053</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Services & Booking
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors">
                  All 10 Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('helpers')} className="hover:text-white transition-colors">
                  Verified Helpers Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('book')} className="hover:text-white transition-colors">
                  Instant Service Booking
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">
                  Track My Bookings
                </button>
              </li>
            </ul>
          </div>

          {/* Engineering & SDLC */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Engineering & Models
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => onNavigate('sdlc')} className="hover:text-white transition-colors">
                  Agile Scrum & V-Model
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sdlc')} className="hover:text-white transition-colors">
                  Spatial Hash Grid (O(1))
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sdlc')} className="hover:text-white transition-colors">
                  Dijkstra Urban Routing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sdlc')} className="hover:text-white transition-colors">
                  CSMA/CD Concurrency Mutex
                </button>
              </li>
            </ul>
          </div>

          {/* Download App Badges */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Multi-Platform Downloads
            </h4>
            <p className="text-slate-400 text-xs">
              Install native apps on your phone or desktop computer:
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onOpenDownloadModal}
                className="w-full flex items-center justify-between p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white text-xs">Android Version</div>
                    <div className="text-[10px] text-slate-400">Direct APK Download</div>
                  </div>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenDownloadModal}
                className="w-full flex items-center justify-between p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-slate-300" />
                  <div>
                    <div className="font-bold text-white text-xs">iOS / iPhone Version</div>
                    <div className="text-[10px] text-slate-400">WebClip Profile & PWA</div>
                  </div>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenDownloadModal}
                className="w-full flex items-center justify-between p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-bold text-white text-xs">PC & Desktop Version</div>
                    <div className="text-[10px] text-slate-400">Windows / macOS / Linux</div>
                  </div>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} ZamHelper Technologies. All rights reserved. Registered in Zambia.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Police Cleared Personnel</span>
            </span>
            <span>•</span>
            <span>Offline Capable PWA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

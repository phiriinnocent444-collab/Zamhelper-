/**
 * ZamHelper Multi-Platform Download & Install Modal
 * Provides direct download links and easy 1-tap installation guides for:
 * - Android APK & Android PWA WebAPK
 * - iOS WebClip MobileConfig Profile & Safari Home Screen setup
 * - PC / Desktop Windows, Mac & Linux PWA
 */

import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Apple,
  Monitor,
  CheckCircle2,
  ExternalLink,
  QrCode,
  ShieldCheck,
  X,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { PlatformDevice } from '../types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: PlatformDevice;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'android'
}) => {
  const [activeTab, setActiveTab] = useState<PlatformDevice>(defaultTab);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://zamhelper.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close download modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 rounded-2xl bg-lime-400 text-emerald-950 shadow-md">
              <Download className="w-6 h-6" />
            </span>
            <div>
              <h2 id="download-modal-title" className="text-2xl font-bold tracking-tight">
                Download ZamHelper
              </h2>
              <p className="text-emerald-100 text-sm">
                Install on Android, iOS, or PC for fast access & offline capability
              </p>
            </div>
          </div>

          {/* Platform Tabs */}
          <div className="flex gap-2 mt-5 bg-emerald-900/40 p-1.5 rounded-2xl border border-emerald-600/30">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'android'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-4 h-4 text-green-600" />
              <span>Android Version</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'ios'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Apple className="w-4 h-4 text-slate-800" />
              <span>iOS / iPhone</span>
            </button>
            <button
              onClick={() => setActiveTab('pc')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'pc'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Monitor className="w-4 h-4 text-blue-600" />
              <span>PC / Desktop</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Smartphone className="w-6 h-6 text-lime-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      ZamHelper for Android (v2.4.0)
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Package: com.zamhelper.app • Size: 1.8 MB • Android 8.0+
                    </p>
                  </div>
                </div>

                <a
                  href="/downloads/ZamHelper-v2.4.apk"
                  download="ZamHelper-v2.4.apk"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/20 transition-all text-center"
                >
                  <Download className="w-5 h-5 text-lime-300" />
                  <span>Download APK</span>
                </a>
              </div>

              {/* Install instructions */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-emerald-800">
                  Easy Installation Steps for Android
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                      1
                    </span>
                    <p className="font-semibold text-slate-900 text-sm">Tap Download APK</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Save the <code className="bg-slate-200 px-1 rounded">ZamHelper-v2.4.apk</code> file to your device.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                      2
                    </span>
                    <p className="font-semibold text-slate-900 text-sm">Allow Unknown Apps</p>
                    <p className="text-xs text-slate-500 mt-1">
                      If prompted by Chrome/Files, toggle &quot;Allow from this source&quot;.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                      3
                    </span>
                    <p className="font-semibold text-slate-900 text-sm">Tap Install & Open</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enjoy instant native helper booking with full offline access!
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative 1-Tap Browser Install */}
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/50 p-4 rounded-xl border-amber-100">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                  <p className="text-xs text-slate-700">
                    <strong className="text-slate-900">Chrome 1-Tap Install:</strong> You can also tap the Chrome menu (⋮) and choose <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* IOS TAB */}
          {activeTab === 'ios' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Apple className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      ZamHelper for Apple iOS (iPhone & iPad)
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Official Apple WebClip Profile & Safari Web App
                    </p>
                  </div>
                </div>

                <a
                  href="/downloads/ZamHelper.mobileconfig"
                  download="ZamHelper.mobileconfig"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-black active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all text-center"
                >
                  <Download className="w-5 h-5 text-lime-400" />
                  <span>Download Profile</span>
                </a>
              </div>

              {/* iOS Step by step */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-emerald-800">
                  Recommended: Safari 1-Tap Home Screen Setup
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs mb-2">
                      1
                    </span>
                    <p className="font-semibold text-slate-900 text-sm">Open Safari</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Navigate to this site using Apple Safari on your iPhone or iPad.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs mb-2">
                      2
                    </span>
                    <p className="font-semibold text-slate-900 text-sm">Tap Share Button</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tap the square Share icon with an arrow (<Share2 className="w-3.5 h-3.5 inline text-blue-600" />) at the bottom toolbar.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs mb-2">
                      3
                    </span>
                    <p className="font-semibold text-slate-900 text-sm">Add to Home Screen</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Scroll and tap <strong>&quot;Add to Home Screen&quot;</strong>. The ZamHelper icon appears on your home screen!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                <strong className="text-slate-900">Alternative: iOS Configuration Profile (.mobileconfig)</strong><br />
                Tapping &quot;Download Profile&quot; installs a native Apple WebClip profile to iOS Settings → Profile Downloaded → Install.
              </div>
            </div>
          )}

          {/* PC TAB */}
          {activeTab === 'pc' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Monitor className="w-6 h-6 text-lime-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      ZamHelper for PC & Desktop
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Windows 10/11, macOS, and Linux Standalone Desktop App
                    </p>
                  </div>
                </div>

                <a
                  href="/downloads/Install-ZamHelper-PC.bat"
                  download="Install-ZamHelper-PC.bat"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all text-center"
                >
                  <Download className="w-5 h-5 text-lime-300" />
                  <span>Download Desktop Setup</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Chrome / Edge 1-Click Install
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Click the install computer icon in your browser address bar (top right) or go to <strong>Menu (⋮) → &quot;Install ZamHelper...&quot;</strong>. It launches in its own dedicated window without browser tabs!
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Offline Support
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ZamHelper&apos;s Service Worker automatically caches verified helper directories, pricing calculators, and pending bookings so you can look up details even with unstable internet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Share & QR Code Footer */}
          <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>Share or scan on your mobile device:</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 w-full sm:w-60 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 shrink-0 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

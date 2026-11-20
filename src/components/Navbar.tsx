import React, { useState } from 'react';
import { Menu, ShieldCheck, X } from 'lucide-react';
import { MadrasahEmblem } from './MadrasahEmblem';

export type AppView =
  | 'landing'
  | 'register'
  | 'receipt'
  | 'acceptance-letter'
  | 'status'
  | 'admin-login'
  | 'admin-dashboard';

interface NavbarProps {
  currentView: AppView;
  isRegistrationOpen: boolean;
  isAdminLoggedIn: boolean;
  onNavigate: (view: AppView, anchorId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  isRegistrationOpen,
  isAdminLoggedIn,
  onNavigate,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (view: AppView, anchorId?: string) => {
    setMobileOpen(false);
    onNavigate(view, anchorId);
  };

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('landing')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md"
        >
          <MadrasahEmblem className="h-9 w-9 shrink-0" />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            MIS Darussalam
          </span>
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => handleLinkClick('landing')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-emerald-800 ${
              currentView === 'landing' ? 'text-emerald-800 font-semibold' : ''
            }`}
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('landing', 'alur-syarat')}
            className="whitespace-nowrap shrink-0 py-1 transition-colors hover:text-emerald-800"
          >
            Alur & Syarat
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('landing', 'jadwal')}
            className="whitespace-nowrap shrink-0 py-1 transition-colors hover:text-emerald-800"
          >
            Jadwal
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('landing', 'faq')}
            className="whitespace-nowrap shrink-0 py-1 transition-colors hover:text-emerald-800"
          >
            FAQ
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('status')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-emerald-800 ${
              currentView === 'status' ? 'text-emerald-800 font-semibold' : ''
            }`}
          >
            Cek Status
          </button>
        </nav>

        {/* Zone 3: Primary CTA + Panitia Icon */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('register')}
            disabled={!isRegistrationOpen}
            className={`hidden sm:inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
              isRegistrationOpen
                ? 'bg-emerald-700 text-white hover:bg-emerald-900'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isRegistrationOpen ? 'Daftar Sekarang' : 'Pendaftaran Tutup'}
          </button>

          <button
            type="button"
            onClick={() =>
              handleLinkClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')
            }
            aria-label={isAdminLoggedIn ? 'Dashboard Panitia' : 'Login Panitia'}
            title={isAdminLoggedIn ? 'Dashboard Panitia' : 'Login Panitia'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:border-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            <ShieldCheck className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileOpen}
            className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navigasi Mobile">
            <button
              type="button"
              onClick={() => handleLinkClick('landing')}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('landing', 'alur-syarat')}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Alur & Syarat
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('landing', 'jadwal')}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Jadwal
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('landing', 'faq')}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('status')}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cek Status
            </button>
            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleLinkClick('register')}
                disabled={!isRegistrationOpen}
                className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-500"
              >
                {isRegistrationOpen ? 'Daftar Sekarang' : 'Pendaftaran Ditutup'}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleLinkClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {isAdminLoggedIn ? 'Dashboard Panitia' : 'Login Panitia'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

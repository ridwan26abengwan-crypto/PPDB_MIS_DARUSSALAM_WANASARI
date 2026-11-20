import { useCallback, useEffect, useState } from 'react';
import { AcceptanceLetter } from './components/AcceptanceLetter';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPage } from './components/AdminLoginPage';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { LandingPage } from './components/LandingPage';
import { Navbar, type AppView } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { RegistrationReceipt } from './components/RegistrationReceipt';
import { StatusCheckPage } from './components/StatusCheckPage';
import { ToastContainer } from './components/ToastContainer';
import { DEFAULT_PPDB_SETTINGS, SEED_REGISTRATIONS } from './data/seedRegistrations';
import { ppdbService } from './services/ppdbService';
import type { AdminUser, PpdbSettings, RegistrationRecord, ToastItem } from './types/ppdb';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [settings, setSettings] = useState<PpdbSettings>(DEFAULT_PPDB_SETTINGS);
  const [records, setRecords] = useState<RegistrationRecord[]>(SEED_REGISTRATIONS);
  const [activeReceipt, setActiveReceipt] = useState<RegistrationRecord | null>(null);
  const [activeAcceptanceRecord, setActiveAcceptanceRecord] = useState<RegistrationRecord | null>(
    null
  );
  const [acceptanceReturnView, setAcceptanceReturnView] = useState<AppView>('status');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    return ppdbService.getAdminSession()?.user || null;
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (type: ToastItem['type'], title: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [publicCounts, setPublicCounts] = useState<{ totalApplicants: number; acceptedCount: number }>({
    totalApplicants: SEED_REGISTRATIONS.length,
    acceptedCount: SEED_REGISTRATIONS.filter((r) => r.status === 'Diterima').length,
  });

  // Load settings and registrations on mount
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const [loadedSettings, summary] = await Promise.all([
        ppdbService.getSettings(),
        ppdbService.getPublicSummary(),
      ]);
      if (!cancelled) {
        setSettings(loadedSettings);
        setPublicCounts(summary);
      }
      if (ppdbService.getAdminSession()) {
        const loadedRecords = await ppdbService.getAllRegistrations();
        if (!cancelled) setRecords(loadedRecords);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNavigate = (targetView: AppView, anchorId?: string) => {
    setView(targetView);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRegistrationSuccess = (created: RegistrationRecord) => {
    setRecords((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
    setPublicCounts((prev) => ({
      totalApplicants: prev.totalApplicants + 1,
      acceptedCount: prev.acceptedCount,
    }));
    setActiveReceipt(created);
    setView('receipt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = async (user: AdminUser) => {
    setAdminUser(user);
    const freshRecords = await ppdbService.getAllRegistrations();
    setRecords(freshRecords);
    setView('admin-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAcceptanceLetter = (rec: RegistrationRecord, returnTo: AppView) => {
    setActiveAcceptanceRecord(rec);
    setAcceptanceReturnView(returnTo);
    setView('acceptance-letter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const acceptedCount = adminUser
    ? records.filter((r) => r.status === 'Diterima').length
    : publicCounts.acceptedCount;
  const totalApplicants = adminUser ? records.length : publicCounts.totalApplicants;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {view !== 'admin-dashboard' && (
        <Navbar
          currentView={view}
          isRegistrationOpen={settings.isOpen}
          isAdminLoggedIn={Boolean(adminUser)}
          onNavigate={handleNavigate}
        />
      )}

      <main>
        {view === 'landing' && (
          <LandingPage
            settings={settings}
            acceptedCount={acceptedCount}
            totalApplicants={totalApplicants}
            onNavigate={handleNavigate}
          />
        )}

        {view === 'register' && (
          <RegistrationForm
            settings={settings}
            onSuccess={handleRegistrationSuccess}
            onToast={addToast}
            onCancel={() => handleNavigate('landing')}
          />
        )}

        {view === 'receipt' && activeReceipt && (
          <RegistrationReceipt
            record={activeReceipt}
            settings={settings}
            onBack={() => handleNavigate('status')}
            onViewAcceptanceLetter={(rec) => openAcceptanceLetter(rec, 'receipt')}
            onToast={addToast}
          />
        )}

        {view === 'acceptance-letter' && activeAcceptanceRecord && (
          <AcceptanceLetter
            record={activeAcceptanceRecord}
            settings={settings}
            onBack={() => handleNavigate(acceptanceReturnView)}
            backLabel={
              acceptanceReturnView === 'admin-dashboard' ? 'Kembali ke Dashboard' : 'Kembali'
            }
          />
        )}

        {view === 'status' && (
          <StatusCheckPage
            settings={settings}
            onViewReceipt={(rec) => {
              setActiveReceipt(rec);
              setView('receipt');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewAcceptanceLetter={(rec) => openAcceptanceLetter(rec, 'status')}
            onToast={addToast}
          />
        )}

        {view === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={handleAdminLoginSuccess}
            onBack={() => handleNavigate('landing')}
            onToast={addToast}
          />
        )}

        {view === 'admin-dashboard' && adminUser && (
          <AdminDashboard
            user={adminUser}
            records={records}
            settings={settings}
            onRecordsChange={setRecords}
            onSettingsChange={setSettings}
            onPrintAcceptanceLetter={(rec) => openAcceptanceLetter(rec, 'admin-dashboard')}
            onLogout={() => {
              setAdminUser(null);
              handleNavigate('landing');
              addToast('info', 'Keluar dari Panel Panitia', 'Sesi admin telah ditutup.');
            }}
            onGoPublic={() => handleNavigate('landing')}
            onToast={addToast}
          />
        )}
      </main>

      {view !== 'admin-dashboard' && <FloatingWhatsApp contactWa={settings.contactWa} />}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Printer,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { ppdbService } from '../services/ppdbService';
import type {
  AdminUser,
  GenderType,
  PpdbSettings,
  RegistrationRecord,
  RegistrationStatus,
  WaveType,
} from '../types/ppdb';
import {
  buildAcceptanceLetterNumber,
  exportRegistrationsToCsv,
  formatRecapFilterSummary,
  STATUS_META,
} from '../utils/ppdbRules';
import { AdminManualModal } from './AdminManualModal';
import { AdminOverview } from './AdminOverview';
import { AdminRecapReport, AdminRecapReportSheet } from './AdminRecapReport';
import { AdminSettings } from './AdminSettings';
import { AdminVerificationModal } from './AdminVerificationModal';

interface AdminDashboardProps {
  user: AdminUser;
  records: RegistrationRecord[];
  settings: PpdbSettings;
  onRecordsChange: (records: RegistrationRecord[]) => void;
  onSettingsChange: (settings: PpdbSettings) => void;
  onPrintAcceptanceLetter: (record: RegistrationRecord) => void;
  onLogout: () => void;
  onGoPublic: () => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

type AdminTab = 'overview' | 'registrants' | 'statements' | 'settings';

const PAGE_SIZE = 6;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  records,
  settings,
  onRecordsChange,
  onSettingsChange,
  onPrintAcceptanceLetter,
  onLogout,
  onGoPublic,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statementSearchTerm, setStatementSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RegistrationStatus>('ALL');
  const [waveFilter, setWaveFilter] = useState<'ALL' | WaveType>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | GenderType>('ALL');
  const [page, setPage] = useState(1);

  const [inspectingRecord, setInspectingRecord] = useState<RegistrationRecord | null>(null);
  const [inspectInitialEdit, setInspectInitialEdit] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<RegistrationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showRecapPreview, setShowRecapPreview] = useState(false);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return records.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (waveFilter !== 'ALL' && r.wave !== waveFilter) return false;
      if (genderFilter !== 'ALL' && r.studentData.gender !== genderFilter) return false;
      if (!q) return true;
      return (
        r.studentData.fullName.toLowerCase().includes(q) ||
        r.registrationNumber.toLowerCase().includes(q) ||
        r.studentData.nik.includes(q) ||
        r.parentsData.father.fullName.toLowerCase().includes(q)
      );
    });
  }, [records, searchTerm, statusFilter, waveFilter, genderFilter]);

  const acceptedRecords = useMemo(
    () => records.filter((r) => r.status === 'Diterima'),
    [records]
  );

  const filteredAcceptedRecords = useMemo(() => {
    const q = statementSearchTerm.trim().toLowerCase();
    if (!q) return acceptedRecords;
    return acceptedRecords.filter(
      (r) =>
        r.studentData.fullName.toLowerCase().includes(q) ||
        r.registrationNumber.toLowerCase().includes(q) ||
        r.studentData.nik.includes(q) ||
        r.parentsData.father.fullName.toLowerCase().includes(q)
    );
  }, [acceptedRecords, statementSearchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleExportCsv = () => {
    const csvContent = exportRegistrationsToCsv(filteredRecords);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_PPDB_MIS_Darussalam_${settings.academicYear.replace('/', '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(
      'success',
      'Export CSV Berhasil',
      `${filteredRecords.length} data pendaftar diunduh (Format EMIS Kemenag).`
    );
  };

  const handlePrintRecap = () => {
    setShowRecapPreview(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecordUpdated = (updated: RegistrationRecord) => {
    onRecordsChange(records.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleRecordCreated = (created: RegistrationRecord) => {
    onRecordsChange([created, ...records]);
  };

  const handleRecordDeleted = (deletedId: string) => {
    onRecordsChange(records.filter((r) => r.id !== deletedId));
  };

  const confirmRowDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      await ppdbService.deleteRegistration(deletingRecord.id);
      handleRecordDeleted(deletingRecord.id);
      onToast(
        'success',
        'Data Pendaftar Dihapus',
        `${deletingRecord.studentData.fullName} (${deletingRecord.registrationNumber}) berhasil dihapus.`
      );
      setDeletingRecord(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus data.';
      onToast('error', 'Gagal Menghapus Data', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogoutClick = () => {
    ppdbService.clearAdminSession();
    onLogout();
  };

  if (showRecapPreview) {
    return (
      <AdminRecapReport
        records={filteredRecords}
        settings={settings}
        printedBy={user.name}
        statusFilter={statusFilter}
        waveFilter={waveFilter}
        genderFilter={genderFilter}
        searchTerm={searchTerm}
        onStatusFilterChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        onWaveFilterChange={(val) => {
          setWaveFilter(val);
          setPage(1);
        }}
        onClose={() => setShowRecapPreview(false)}
      />
    );
  }

  const filterSummary = formatRecapFilterSummary({
    statusFilter,
    waveFilter,
    genderFilter,
    searchTerm,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Screen Layout */}
      <div className="no-print flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full border-b border-emerald-900 bg-emerald-950 text-emerald-100 lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
          <div className="flex h-16 items-center gap-3 border-b border-emerald-900 px-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/95 p-0.5 shadow-sm">
              <img
                src="/assets/aistudio/images_f21cb217.png"
                alt="Logo MIS Darussalam"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-white">
                Panel Panitia PPDB
              </p>
              <p className="truncate text-[11px] text-emerald-300">MIS Darussalam</p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col" aria-label="Menu Admin">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'text-emerald-200 hover:bg-emerald-900/70 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Overview Analitik</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('registrants')}
              className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'registrants'
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'text-emerald-200 hover:bg-emerald-900/70 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Data Pendaftar ({records.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('statements')}
              className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'statements'
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'text-emerald-200 hover:bg-emerald-900/70 hover:text-white'
              }`}
            >
              <FileCheck2 className="h-4 w-4 shrink-0" />
              <span>Surat Pernyataan ({acceptedRecords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'text-emerald-200 hover:bg-emerald-900/70 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>Pengaturan &amp; Kop Surat</span>
            </button>
          </nav>

          <div className="hidden lg:block mt-auto border-t border-emerald-900 p-4 space-y-2">
            <div className="rounded-lg bg-emerald-900/60 px-3 py-2.5">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate font-mono text-[11px] text-emerald-300">
                User: {user.username || 'MIS DARUSSALAM'}
              </p>
            </div>
            <button
              type="button"
              onClick={onGoPublic}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-900 hover:text-white"
            >
              <Home className="h-4 w-4" />
              <span>Lihat Portal Publik</span>
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-300 hover:bg-emerald-900"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 min-w-0">
          {/* Top Bar */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <p className="text-xs text-slate-500">
                PPDB MIS Darussalam / TA {settings.academicYear}
              </p>
              <h1 className="font-display text-lg font-bold text-slate-900">
                {activeTab === 'overview' && 'Dashboard Overview & Analitik'}
                {activeTab === 'registrants' && 'Manajemen Data & Verifikasi Pendaftar'}
                {activeTab === 'statements' && 'Cetak Surat Pernyataan Siswa Diterima'}
                {activeTab === 'settings' && 'Pengaturan PPDB, Jadwal & Kop Surat'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                <span>Export CSV (EMIS)</span>
              </button>
              <button
                type="button"
                onClick={handlePrintRecap}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-4 w-4 text-slate-700" />
                <span>Cetak Rekapitulasi</span>
              </button>
              <button
                type="button"
                onClick={() => setShowManualModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
              >
                <UserPlus className="h-4 w-4" />
                <span>Tambah Pendaftar Manual</span>
              </button>
              <button
                type="button"
                onClick={onGoPublic}
                className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <Home className="h-4 w-4" />
                <span>Portal</span>
              </button>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </button>
            </div>
          </header>

          {/* Content Area */}
          <main className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <AdminOverview
                records={records}
                settings={settings}
                onInspectRecord={(rec) => {
                  setInspectInitialEdit(false);
                  setInspectingRecord(rec);
                }}
                onGoToTable={() => setActiveTab('registrants')}
              />
            )}

            {activeTab === 'registrants' && (
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-12">
                  <div className="relative sm:col-span-5">
                    <Search className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      aria-label="Cari nama, NIK, atau nomor pendaftaran"
                      placeholder="Cari Nama, NIK, atau No. Pendaftaran..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      aria-label="Filter status verifikasi"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value as 'ALL' | RegistrationStatus);
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Berkas Perlu Perbaikan">Perlu Perbaikan</option>
                      <option value="Berkas Terverifikasi">Berkas Terverifikasi</option>
                      <option value="Diterima">Diterima</option>
                      <option value="Cadangan">Cadangan</option>
                      <option value="Tidak Diterima">Tidak Diterima</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      aria-label="Filter gelombang"
                      value={waveFilter}
                      onChange={(e) => {
                        setWaveFilter(e.target.value as 'ALL' | WaveType);
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="ALL">Semua Gelombang</option>
                      <option value="Gelombang 1">Gelombang 1</option>
                      <option value="Gelombang 2">Gelombang 2</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      aria-label="Filter jenis kelamin"
                      value={genderFilter}
                      onChange={(e) => {
                        setGenderFilter(e.target.value as 'ALL' | GenderType);
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="ALL">Semua Gender</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                        <tr>
                          <th className="px-2.5 py-3 whitespace-nowrap">No. Pendaftaran</th>
                          <th className="px-2.5 py-3">Nama Calon Siswa</th>
                          <th className="px-2.5 py-3 whitespace-nowrap">NIK / Gender</th>
                          <th className="px-2.5 py-3">Orang Tua &amp; WA</th>
                          <th className="px-2.5 py-3 whitespace-nowrap">Gel.</th>
                          <th className="px-2.5 py-3 whitespace-nowrap">Status</th>
                          <th className="px-2.5 py-3 text-right whitespace-nowrap">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedRecords.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                              Tidak ada data pendaftar yang cocok dengan filter pencarian.
                            </td>
                          </tr>
                        ) : (
                          paginatedRecords.map((item) => {
                            const meta = STATUS_META[item.status];
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/80">
                                <td className="px-2.5 py-3 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
                                  <div>{item.registrationNumber}</div>
                                  <div className="text-[11px] font-sans font-normal text-slate-500">
                                    Jalur {item.registrationChannel}
                                  </div>
                                </td>
                                <td className="px-2.5 py-3 min-w-[140px]">
                                  <div className="font-semibold text-slate-900 leading-snug">
                                    {item.studentData.fullName}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {item.studentData.originType}
                                    {item.studentData.originSchoolName
                                      ? ` · ${item.studentData.originSchoolName}`
                                      : ''}
                                  </div>
                                </td>
                                <td className="px-2.5 py-3 whitespace-nowrap">
                                  <div className="font-mono text-xs text-slate-700">
                                    {item.studentData.nik}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {item.studentData.gender}
                                  </div>
                                </td>
                                <td className="px-2.5 py-3">
                                  <div className="text-xs font-medium text-slate-800 leading-snug">
                                    {item.parentsData.father.fullName}
                                  </div>
                                  <div className="font-mono text-xs text-emerald-800 whitespace-nowrap">
                                    {item.parentsData.whatsapp}
                                  </div>
                                </td>
                                <td className="px-2.5 py-3 text-xs text-slate-700 whitespace-nowrap">
                                  {item.wave === 'Gelombang 1' ? 'Gel. 1' : 'Gel. 2'}
                                </td>
                                <td className="px-2.5 py-3 whitespace-nowrap">
                                  <span
                                    className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
                                  >
                                    {meta.shortLabel}
                                  </span>
                                </td>
                                <td className="px-2.5 py-3 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center justify-end gap-1">
                                    {item.status === 'Diterima' && (
                                      <button
                                        type="button"
                                        onClick={() => onPrintAcceptanceLetter(item)}
                                        aria-label={`Cetak Surat Pernyataan ${item.studentData.fullName}`}
                                        title="Cetak Surat Pernyataan Diterima"
                                        className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-100"
                                      >
                                        <FileCheck2 className="h-3.5 w-3.5" />
                                        <span>Surat</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInspectInitialEdit(false);
                                        setInspectingRecord(item);
                                      }}
                                      aria-label={`Verifikasi ${item.studentData.fullName}`}
                                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-700 hover:text-emerald-800"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      <span>Verifikasi</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInspectInitialEdit(true);
                                        setInspectingRecord(item);
                                      }}
                                      aria-label={`Edit ${item.studentData.fullName}`}
                                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingRecord(item)}
                                      aria-label={`Hapus ${item.studentData.fullName}`}
                                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Hapus</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
                    <span>
                      Menampilkan <strong>{paginatedRecords.length}</strong> dari{' '}
                      <strong>{filteredRecords.length}</strong> pendaftar
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded border border-slate-300 px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40"
                      >
                        Sebelumnya
                      </button>
                      <span className="px-2 font-mono font-semibold">
                        Hal {currentPage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded border border-slate-300 px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40"
                      >
                        Berikutnya
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'statements' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-sm font-bold text-emerald-950">
                        Daftar Siswa Diterima — Cetak Surat Pernyataan Resmi
                      </h2>
                      <p className="mt-0.5 text-xs text-emerald-900">
                        Setiap calon siswa berstatus <strong>Diterima</strong> dapat dicetakkan{' '}
                        <strong>Surat Pernyataan Penerimaan Peserta Didik Baru</strong> lengkap dengan kop surat resmi madrasah.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <div className="relative w-full sm:w-64">
                      <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        aria-label="Cari siswa diterima untuk cetak surat pernyataan"
                        placeholder="Cari nama, NIK, atau no. daftar..."
                        value={statementSearchTerm}
                        onChange={(e) => setStatementSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-emerald-300 bg-white py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('settings')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 whitespace-nowrap hover:bg-emerald-100"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Edit Kop Surat &amp; Logo</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                        <tr>
                          <th className="px-4 py-3 whitespace-nowrap">No. Pendaftaran</th>
                          <th className="px-4 py-3 whitespace-nowrap">Nomor Surat Pernyataan</th>
                          <th className="px-4 py-3">Nama Calon Siswa</th>
                          <th className="px-4 py-3">Orang Tua / Wali</th>
                          <th className="px-4 py-3 whitespace-nowrap">Gelombang &amp; Daftar Ulang</th>
                          <th className="px-4 py-3 text-right whitespace-nowrap">Aksi Cetak</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAcceptedRecords.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                              Belum ada pendaftar berstatus <strong>Diterima</strong> yang sesuai pencarian.
                            </td>
                          </tr>
                        ) : (
                          filteredAcceptedRecords.map((item) => {
                            const letterNo = buildAcceptanceLetterNumber(
                              item.registrationNumber,
                              settings.academicYear
                            );
                            const reRegDates =
                              item.wave === 'Gelombang 1'
                                ? settings.wave1Dates.reRegistrationDates
                                : settings.wave2Dates.reRegistrationDates;
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
                                  {item.registrationNumber}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-800 whitespace-nowrap">
                                  {letterNo}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-slate-900">
                                    {item.studentData.fullName}
                                  </div>
                                  <div className="font-mono text-[11px] text-slate-500">
                                    NIK: {item.studentData.nik}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-700">
                                  <div>
                                    {item.parentsData.father.fullName} &amp;{' '}
                                    {item.parentsData.mother.fullName}
                                  </div>
                                  <div className="font-mono text-emerald-800">
                                    {item.parentsData.whatsapp}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                                  <div className="font-semibold">{item.wave}</div>
                                  <div className="text-[11px] text-slate-500">{reRegDates}</div>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => onPrintAcceptanceLetter(item)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
                                  >
                                    <Printer className="h-3.5 w-3.5" />
                                    <span>Cetak Surat Pernyataan</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <AdminSettings
                settings={settings}
                onSaved={onSettingsChange}
                onToast={onToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* Print-Only Rekapitulasi Pendaftar (Ctrl+P langsung dari dashboard) */}
      <div className="hidden print-only p-2">
        <AdminRecapReportSheet
          records={filteredRecords}
          settings={settings}
          printedBy={user.name}
          filterSummary={filterSummary}
        />
      </div>

      {/* Modals */}
      {inspectingRecord && (
        <AdminVerificationModal
          record={inspectingRecord}
          settings={settings}
          initialEditMode={inspectInitialEdit}
          onClose={() => {
            setInspectingRecord(null);
            setInspectInitialEdit(false);
          }}
          onUpdated={handleRecordUpdated}
          onDeleted={handleRecordDeleted}
          onPrintAcceptanceLetter={(rec) => {
            setInspectingRecord(null);
            setInspectInitialEdit(false);
            onPrintAcceptanceLetter(rec);
          }}
          onToast={onToast}
        />
      )}

      {deletingRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 id="modal-delete-title" className="font-display text-base font-bold text-slate-900">
                  Konfirmasi Hapus Data Pendaftar
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Anda akan menghapus permanen data pendaftar atas nama{' '}
                  <strong className="text-slate-900">{deletingRecord.studentData.fullName}</strong>{' '}
                  (<span className="font-mono">{deletingRecord.registrationNumber}</span>). Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmRowDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:bg-slate-400"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showManualModal && (
        <AdminManualModal
          onClose={() => setShowManualModal(false)}
          onCreated={handleRecordCreated}
          onToast={onToast}
        />
      )}
    </div>
  );
};

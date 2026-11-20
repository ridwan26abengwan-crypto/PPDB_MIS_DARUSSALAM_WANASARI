import React, { useState } from 'react';
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  Info,
  Loader2,
  Printer,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import { ppdbService } from '../services/ppdbService';
import type { DocumentsData, PpdbSettings, RegistrationRecord } from '../types/ppdb';
import { STATUS_META } from '../utils/ppdbRules';
import { DocumentDropzone } from './DocumentDropzone';

interface StatusCheckPageProps {
  settings: PpdbSettings;
  onViewReceipt: (record: RegistrationRecord) => void;
  onViewAcceptanceLetter: (record: RegistrationRecord) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

const DEMO_LOOKUPS = [
  {
    label: 'Diterima',
    reg: 'PPDB-MISDS-2026-0001',
    birthDate: '2020-04-14',
  },
  {
    label: 'Perlu Perbaikan',
    reg: 'PPDB-MISDS-2026-0003',
    birthDate: '2020-03-08',
  },
  {
    label: 'Terverifikasi',
    reg: 'PPDB-MISDS-2026-0002',
    birthDate: '2020-06-22',
  },
  {
    label: 'Menunggu',
    reg: 'PPDB-MISDS-2026-0004',
    birthDate: '2020-01-19',
  },
];

export const StatusCheckPage: React.FC<StatusCheckPageProps> = ({
  settings,
  onViewReceipt,
  onViewAcceptanceLetter,
  onToast,
}) => {
  const [query, setQuery] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [record, setRecord] = useState<RegistrationRecord | null>(null);

  const [revisionDocs, setRevisionDocs] = useState<Partial<DocumentsData>>({});
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  const performSearch = async (searchQuery: string, searchBirthDate: string) => {
    setSearchError('');
    if (!searchQuery.trim() || !searchBirthDate.trim()) {
      setSearchError('Masukkan Nomor Pendaftaran/NIK dan Tanggal Lahir calon siswa.');
      return;
    }

    setIsSearching(true);
    try {
      const found = await ppdbService.checkStatus(searchQuery, searchBirthDate);
      setRecord(found);
      setRevisionDocs({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Data pendaftaran tidak ditemukan.';
      setRecord(null);
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, birthDate);
  };

  const handleSubmitRevision = async () => {
    if (!record) return;
    const hasChanges = Object.values(revisionDocs).some(Boolean);
    if (!hasChanges) {
      onToast(
        'error',
        'Pilih Berkas Pengganti',
        'Unggah minimal satu berkas perbaikan sebelum mengirim ulang.'
      );
      return;
    }

    setIsSubmittingRevision(true);
    try {
      const updated = await ppdbService.reuploadDocuments(
        record.id,
        record.studentData.birthDate,
        revisionDocs
      );
      setRecord(updated);
      setRevisionDocs({});
      onToast(
        'success',
        'Berkas Perbaikan Terkirim',
        'Status pendaftaran kembali menjadi Menunggu Verifikasi panitia.'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim ulang berkas.';
      onToast('error', 'Gagal Memperbarui Berkas', msg);
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Layanan Informasi Pendaftar
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Cek Status Pendaftaran &amp; Perbaikan Berkas
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Masukkan Nomor Pendaftaran atau NIK calon siswa beserta Tanggal Lahir untuk memantau hasil verifikasi, jadwal observasi, dan mencetak kartu.
        </p>
      </div>

      {/* Search Form Card */}
      <form
        onSubmit={handleSearchSubmit}
        className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <label htmlFor="check-query" className="block text-sm font-semibold text-slate-800">
              Nomor Pendaftaran atau NIK Siswa
            </label>
            <input
              id="check-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="PPDB-MISDS-2026-0001 atau 16 digit NIK"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="check-birthdate" className="block text-sm font-semibold text-slate-800">
              Tanggal Lahir Siswa
            </label>
            <input
              id="check-birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:bg-slate-400"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Cari</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Data Lookup */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500">Contoh cepat data simulasi:</span>
          {DEMO_LOOKUPS.map((demo) => (
            <button
              key={demo.reg}
              type="button"
              onClick={() => {
                setQuery(demo.reg);
                setBirthDate(demo.birthDate);
                performSearch(demo.reg, demo.birthDate);
              }}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-emerald-600 hover:text-emerald-800"
            >
              {demo.label} ({demo.reg.slice(-4)})
            </button>
          ))}
        </div>

        {searchError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </form>

      {/* Result Card */}
      {record && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-xs font-semibold text-slate-500">
                  {record.registrationNumber} · {record.wave}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
                  {record.studentData.fullName}
                </h2>
                <p className="text-xs text-slate-600">
                  Orang Tua: {record.parentsData.father.fullName} &amp;{' '}
                  {record.parentsData.mother.fullName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    STATUS_META[record.status].bgClass
                  } ${STATUS_META[record.status].textClass} ${
                    STATUS_META[record.status].borderClass
                  }`}
                >
                  {record.status === 'Menunggu Verifikasi' && <Clock className="h-4 w-4" />}
                  {record.status === 'Berkas Perlu Perbaikan' && (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  {record.status === 'Berkas Terverifikasi' && (
                    <CalendarCheck className="h-4 w-4" />
                  )}
                  {record.status === 'Diterima' && <Sparkles className="h-4 w-4" />}
                  {(record.status === 'Cadangan' || record.status === 'Tidak Diterima') && (
                    <Info className="h-4 w-4" />
                  )}
                  <span>{record.status}</span>
                </span>

                <button
                  type="button"
                  onClick={() => onViewReceipt(record)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Cetak Kartu Bukti</span>
                </button>

                {record.status === 'Diterima' && (
                  <button
                    type="button"
                    onClick={() => onViewAcceptanceLetter(record)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Cetak Surat Pernyataan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status Specific Guidance */}
            <div className="mt-5">
              {record.status === 'Menunggu Verifikasi' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <p className="font-bold">Data Sedang Diperiksa Panitia</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    Formulir dan dokumen ananda sudah masuk dalam antrean verifikasi. Panitia akan memeriksa kelengkapan dokumen dalam 1×24 jam kerja.
                  </p>
                  {record.adminNotes && (
                    <p className="mt-2 rounded bg-white/80 p-2.5 text-xs text-slate-700">
                      Catatan terakhir: {record.adminNotes}
                    </p>
                  )}
                </div>
              )}

              {record.status === 'Berkas Perlu Perbaikan' && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
                    <p className="font-bold">Perhatian: Berkas Perlu Diperbaiki</p>
                    <p className="mt-1 text-xs font-semibold">Catatan Panitia Verifikator:</p>
                    <p className="mt-1 rounded-lg border border-red-200 bg-white p-3 text-xs leading-relaxed text-slate-800">
                      {record.adminNotes ||
                        'Terdapat berkas yang kurang terbaca/terpotong. Silakan unggah ulang berkas yang sesuai di bawah ini.'}
                    </p>
                  </div>

                  {/* Direct Re-upload Form */}
                  <div className="border-t border-slate-200 pt-5">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Form Unggah Ulang Berkas Perbaikan
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Unggah hanya dokumen yang diminta pada catatan panitia di atas, lalu klik Kirim Perbaikan.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DocumentDropzone
                        docKey="rev-kk"
                        label="Kartu Keluarga (KK)"
                        description="Unggah ulang KK jika diminta perbaikan."
                        value={revisionDocs.familyCard ?? null}
                        onChange={(doc) =>
                          setRevisionDocs((prev) => ({ ...prev, familyCard: doc }))
                        }
                        onError={(msg) => onToast('error', 'Gagal Membaca File', msg)}
                      />
                      <DocumentDropzone
                        docKey="rev-akta"
                        label="Akta Kelahiran"
                        description="Unggah ulang Akta Kelahiran jika diminta perbaikan."
                        value={revisionDocs.birthCertificate ?? null}
                        onChange={(doc) =>
                          setRevisionDocs((prev) => ({ ...prev, birthCertificate: doc }))
                        }
                        onError={(msg) => onToast('error', 'Gagal Membaca File', msg)}
                      />
                      <DocumentDropzone
                        docKey="rev-ktp"
                        label="KTP Orang Tua / Wali"
                        description="Unggah ulang KTP jika diminta perbaikan."
                        value={revisionDocs.parentIdCard ?? null}
                        onChange={(doc) =>
                          setRevisionDocs((prev) => ({ ...prev, parentIdCard: doc }))
                        }
                        onError={(msg) => onToast('error', 'Gagal Membaca File', msg)}
                      />
                      <DocumentDropzone
                        docKey="rev-foto"
                        label="Pas Foto 3x4"
                        description="Unggah ulang Pas Foto jika diminta perbaikan."
                        value={revisionDocs.studentPhoto ?? null}
                        onChange={(doc) =>
                          setRevisionDocs((prev) => ({ ...prev, studentPhoto: doc }))
                        }
                        onError={(msg) => onToast('error', 'Gagal Membaca File', msg)}
                      />
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSubmitRevision}
                        disabled={isSubmittingRevision}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:bg-slate-400"
                      >
                        {isSubmittingRevision ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span>Kirim Berkas Perbaikan</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {record.status === 'Berkas Terverifikasi' && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                  <p className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    <span>Berkas Terverifikasi · Jadwal Observasi</span>
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed">
                    Alhamdulillah berkas ananda dinyatakan lengkap dan valid. Mohon kehadiran ananda bersama orang tua pada agenda pemetaan kesiapan belajar:
                  </p>
                  <p className="mt-2 rounded-lg border border-emerald-200 bg-white px-3.5 py-2.5 text-xs font-bold text-emerald-900">
                    {record.observationSchedule ||
                      (record.wave === 'Gelombang 1'
                        ? settings.wave1Dates.observationDate
                        : settings.wave2Dates.observationDate)}
                  </p>
                </div>
              )}

              {record.status === 'Diterima' && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-sky-950">
                  <p className="font-display text-base font-bold">
                    Selamat! Ananda Dinyatakan Lulus Seleksi (Diterima)
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed">
                    Ananda <strong>{record.studentData.fullName}</strong> diterima sebagai calon peserta didik baru MIS Darussalam Tahun Ajaran {settings.academicYear}. Silakan melakukan daftar ulang di sekretariat madrasah pada jadwal berikut:
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-sky-200 bg-white p-3.5 text-xs sm:grid-cols-2">
                    <div>
                      <span className="text-slate-500">Jadwal Daftar Ulang:</span>
                      <p className="font-bold text-slate-900">
                        {record.wave === 'Gelombang 1'
                          ? settings.wave1Dates.reRegistrationDates
                          : settings.wave2Dates.reRegistrationDates}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Rincian Daftar Ulang:</span>
                      <p className="font-semibold text-slate-900">{settings.reRegistrationFee}</p>
                    </div>
                  </div>
                </div>
              )}

              {(record.status === 'Cadangan' || record.status === 'Tidak Diterima') && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                  <p className="font-bold">Status Seleksi: {record.status}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {record.adminNotes ||
                      'Terima kasih telah mendaftar di MIS Darussalam. Silakan hubungi panitia melalui WhatsApp untuk informasi kuota dan tindak lanjut.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

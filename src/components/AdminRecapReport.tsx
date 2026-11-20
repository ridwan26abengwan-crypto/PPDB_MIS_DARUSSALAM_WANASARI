import React, { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import type {
  GenderType,
  PpdbSettings,
  RegistrationRecord,
  RegistrationStatus,
  WaveType,
} from '../types/ppdb';
import {
  computeRecapSummary,
  formatIndonesianDate,
  formatRecapFilterSummary,
} from '../utils/ppdbRules';
import { OfficialKopSurat } from './OfficialKopSurat';

interface AdminRecapReportSheetProps {
  records: RegistrationRecord[];
  settings: PpdbSettings;
  printedBy: string;
  filterSummary: string;
}

export const AdminRecapReportSheet: React.FC<AdminRecapReportSheetProps> = ({
  records,
  settings,
  printedBy,
  filterSummary,
}) => {
  const summary = computeRecapSummary(records);
  const printDate = formatIndonesianDate(new Date().toISOString().slice(0, 10));

  return (
    <article
      data-testid="recap-report-sheet"
      className="print-card recap-report-sheet rounded-2xl border border-slate-300 bg-white p-5 text-slate-950 shadow-sm sm:p-8"
    >
      <OfficialKopSurat
        config={settings.kopSurat}
        topLabel="PANITIA PENERIMAAN PESERTA DIDIK BARU"
        compact
        testId="recap-kop-surat"
      />

      {/* Judul Laporan */}
      <div className="mt-5 text-center">
        <h2 className="font-display text-base font-extrabold uppercase tracking-wide text-slate-950 sm:text-lg">
          Laporan Rekapitulasi Data Pendaftar Peserta Didik Baru
        </h2>
        <p className="mt-0.5 text-xs font-semibold text-slate-700">
          Tahun Ajaran {settings.academicYear} · Dicetak pada {printDate} · Petugas: {printedBy}
        </p>
        <p className="mt-1 text-[11px] text-slate-600">{filterSummary}</p>
      </div>

      {/* Ringkasan Statistik Laporan */}
      <div className="mt-4 grid grid-cols-3 border border-slate-800 bg-slate-50/70 text-center text-xs sm:grid-cols-6">
        <div className="border-r border-b border-slate-300 px-2 py-2 sm:border-b-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Total Data
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-950">
            {summary.total}
          </p>
        </div>
        <div className="border-r border-b border-slate-300 px-2 py-2 sm:border-b-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Diterima
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-emerald-900">
            {summary.accepted}
          </p>
        </div>
        <div className="border-b border-slate-300 px-2 py-2 sm:border-r sm:border-b-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Terverifikasi
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-950">
            {summary.verified}
          </p>
        </div>
        <div className="border-r border-slate-300 px-2 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Menunggu
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-950">
            {summary.pending}
          </p>
        </div>
        <div className="border-r border-slate-300 px-2 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Perbaikan
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-950">
            {summary.needsRevision}
          </p>
        </div>
        <div className="px-2 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            L / P
          </p>
          <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-950">
            {summary.male} / {summary.female}
          </p>
        </div>
      </div>

      {/* Tabel Rekapitulasi Resmi */}
      <div className="mt-4 overflow-x-auto">
        <table className="recap-table w-full border-collapse border border-slate-800 text-[11px] leading-snug">
          <thead>
            <tr className="bg-slate-100 text-slate-950">
              <th className="w-8 border border-slate-700 px-2 py-2 text-center font-bold">No</th>
              <th className="border border-slate-700 px-2 py-2 text-left font-bold whitespace-nowrap">
                No. Pendaftaran
              </th>
              <th className="border border-slate-700 px-2 py-2 text-left font-bold">
                Nama Calon Siswa
              </th>
              <th className="border border-slate-700 px-2 py-2 text-left font-bold whitespace-nowrap">
                NIK
              </th>
              <th className="border border-slate-700 px-2 py-2 text-left font-bold">
                L/P &amp; TTL
              </th>
              <th className="border border-slate-700 px-2 py-2 text-left font-bold">
                Orang Tua &amp; No. WA
              </th>
              <th className="border border-slate-700 px-2 py-2 text-left font-bold">
                Alamat Domisili
              </th>
              <th className="border border-slate-700 px-2 py-2 text-left font-bold whitespace-nowrap">
                Status Seleksi
              </th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="border border-slate-700 px-4 py-8 text-center text-xs text-slate-500"
                >
                  Tidak ada data pendaftar yang sesuai dengan filter laporan saat ini.
                </td>
              </tr>
            ) : (
              records.map((r, idx) => (
                <tr key={r.id} className="even:bg-slate-50/60">
                  <td className="border border-slate-700 px-2 py-1.5 text-center font-mono tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-700 px-2 py-1.5 align-top whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-950">{r.registrationNumber}</div>
                    <div className="text-[10px] text-slate-600">
                      {r.wave === 'Gelombang 1' ? 'Gel. 1' : 'Gel. 2'} · {r.registrationChannel}
                    </div>
                  </td>
                  <td className="border border-slate-700 px-2 py-1.5 align-top">
                    <div className="font-bold text-slate-950">{r.studentData.fullName}</div>
                    <div className="text-[10px] text-slate-600">
                      Asal: {r.studentData.originType}
                      {r.studentData.originSchoolName ? ` (${r.studentData.originSchoolName})` : ''}
                    </div>
                  </td>
                  <td className="border border-slate-700 px-2 py-1.5 align-top font-mono tabular-nums whitespace-nowrap">
                    {r.studentData.nik}
                  </td>
                  <td className="border border-slate-700 px-2 py-1.5 align-top">
                    <div className="font-semibold">
                      {r.studentData.gender === 'Laki-laki' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                    </div>
                    <div className="text-[10px] text-slate-700">
                      {r.studentData.birthPlace}, {formatIndonesianDate(r.studentData.birthDate)}
                    </div>
                  </td>
                  <td className="border border-slate-700 px-2 py-1.5 align-top">
                    <div className="font-semibold text-slate-900">
                      {r.parentsData.father.fullName}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Ibu: {r.parentsData.mother.fullName}
                    </div>
                    <div className="font-mono text-[10px] font-semibold text-slate-800">
                      WA: {r.parentsData.whatsapp}
                    </div>
                  </td>
                  <td className="border border-slate-700 px-2 py-1.5 align-top text-[10px] text-slate-800">
                    {r.studentData.addressStreet}, RT/RW {r.studentData.addressRtRw},{' '}
                    {r.studentData.addressVillage}, Kec. {r.studentData.addressDistrict}
                  </td>
                  <td className="border border-slate-700 px-2 py-1.5 align-top font-bold text-slate-950 whitespace-nowrap">
                    {r.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Blok Pengesahan Tanda Tangan */}
      <div className="avoid-break mt-8 grid grid-cols-2 gap-8 pt-2 text-xs text-slate-900">
        <div className="text-center">
          <p>Mengetahui,</p>
          <p className="font-bold">Kepala Madrasah MIS Darussalam</p>
          <div className="h-16" />
          <p className="mx-auto inline-block min-w-[210px] border-t border-slate-800 px-3 pt-1 font-semibold whitespace-nowrap">
            ( ........................................ )
          </p>
        </div>

        <div className="text-center">
          <p>Ciasem, {printDate}</p>
          <p className="font-bold">Ketua Panitia PPDB TA {settings.academicYear}</p>
          <div className="h-16" />
          <p className="mx-auto inline-block min-w-[210px] border-t border-slate-800 px-3 pt-1 font-semibold whitespace-nowrap">
            ( ........................................ )
          </p>
        </div>
      </div>
    </article>
  );
};

interface AdminRecapReportProps {
  records: RegistrationRecord[];
  settings: PpdbSettings;
  printedBy: string;
  statusFilter: 'ALL' | RegistrationStatus;
  waveFilter: 'ALL' | WaveType;
  genderFilter: 'ALL' | GenderType;
  searchTerm: string;
  onStatusFilterChange: (value: 'ALL' | RegistrationStatus) => void;
  onWaveFilterChange: (value: 'ALL' | WaveType) => void;
  onClose: () => void;
}

export const AdminRecapReport: React.FC<AdminRecapReportProps> = ({
  records,
  settings,
  printedBy,
  statusFilter,
  waveFilter,
  genderFilter,
  searchTerm,
  onStatusFilterChange,
  onWaveFilterChange,
  onClose,
}) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const filterSummary = formatRecapFilterSummary({
    statusFilter,
    waveFilter,
    genderFilter,
    searchTerm,
  });

  return (
    <div className="recap-print-wrapper min-h-screen bg-slate-100 py-6 px-4 sm:px-6">
      <style media="print">{`@page { size: A4 ${orientation}; margin: 10mm; }`}</style>

      <div className={`mx-auto ${orientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {/* Screen-only Control Bar */}
        <div className="no-print mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div className="shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Pratinjau Laporan Fisik PPDB
            </p>
            <h1 className="mt-0.5 font-display text-base font-bold text-slate-900">
              Cetak Rekapitulasi Data Pendaftar ({records.length} Siswa)
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter status laporan"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as 'ALL' | RegistrationStatus)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-800"
            >
              <option value="ALL">Semua Status</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Berkas Perlu Perbaikan">Perlu Perbaikan</option>
              <option value="Berkas Terverifikasi">Berkas Terverifikasi</option>
              <option value="Diterima">Diterima</option>
              <option value="Cadangan">Cadangan</option>
              <option value="Tidak Diterima">Tidak Diterima</option>
            </select>

            <select
              aria-label="Filter gelombang laporan"
              value={waveFilter}
              onChange={(e) => onWaveFilterChange(e.target.value as 'ALL' | WaveType)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-800"
            >
              <option value="ALL">Semua Gelombang</option>
              <option value="Gelombang 1">Gelombang 1</option>
              <option value="Gelombang 2">Gelombang 2</option>
            </select>

            <div
              className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-0.5 text-xs"
              role="group"
              aria-label="Orientasi Kertas A4"
            >
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`rounded-md px-2.5 py-1.5 font-semibold whitespace-nowrap transition-colors ${
                  orientation === 'landscape'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Landscape
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`rounded-md px-2.5 py-1.5 font-semibold whitespace-nowrap transition-colors ${
                  orientation === 'portrait'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Portrait
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span>Kembali ke Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap hover:bg-emerald-900"
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span>Cetak Laporan / Unduh PDF</span>
            </button>
          </div>
        </div>

        <AdminRecapReportSheet
          records={records}
          settings={settings}
          printedBy={printedBy}
          filterSummary={filterSummary}
        />
      </div>
    </div>
  );
};

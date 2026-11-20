import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CheckCircle2, FileCheck2, MessageCircle, Printer, User } from 'lucide-react';
import type { PpdbSettings, RegistrationRecord } from '../types/ppdb';
import {
  buildAcceptanceLetterNumber,
  calculateAgeAsOf,
  formatIndonesianDate,
  normalizeWhatsappForLink,
} from '../utils/ppdbRules';
import { OfficialKopSurat } from './OfficialKopSurat';

interface AcceptanceLetterProps {
  record: RegistrationRecord;
  settings: PpdbSettings;
  onBack: () => void;
  backLabel?: string;
}

export const AcceptanceLetter: React.FC<AcceptanceLetterProps> = ({
  record,
  settings,
  onBack,
  backLabel = 'Kembali',
}) => {
  const isAccepted = record.status === 'Diterima';
  const letterNumber = buildAcceptanceLetterNumber(
    record.registrationNumber,
    settings.academicYear
  );
  const age = calculateAgeAsOf(record.studentData.birthDate, '2026-07-01');
  const waveDates =
    record.wave === 'Gelombang 1' ? settings.wave1Dates : settings.wave2Dates;

  const issueDateText = formatIndonesianDate(
    record.updatedAt || new Date().toISOString().slice(0, 10)
  );
  const birthDateText = formatIndonesianDate(record.studentData.birthDate);

  const waAdminNumber = normalizeWhatsappForLink(settings.contactWa);
  const waConfirmText = encodeURIComponent(
    `Assalamu'alaikum Panitia PPDB MIS Darussalam, saya orang tua dari ananda *${record.studentData.fullName}* (${record.registrationNumber}) mengonfirmasi telah mengunduh Surat Pernyataan Penerimaan Siswa dan siap melaksanakan daftar ulang.`
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Toolbar (Screen Only) */}
      <div className="no-print mb-6 flex flex-col gap-3.5 rounded-2xl border border-emerald-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Surat Pernyataan Penerimaan Siswa Baru
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
              <span className="font-mono font-bold text-slate-900 whitespace-nowrap">
                {letterNumber}
              </span>
              <span className="text-slate-400" aria-hidden="true">
                ·
              </span>
              <span className="font-semibold text-slate-700">{record.studentData.fullName}</span>
              {!isAccepted && (
                <>
                  <span className="text-slate-400" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-amber-700">
                    Pratinjau (Status saat ini: {record.status})
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span>{backLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap hover:bg-emerald-900"
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span>Cetak Surat Pernyataan</span>
            </button>
            <a
              href={`https://wa.me/${waAdminNumber}?text=${waConfirmText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 whitespace-nowrap hover:bg-amber-400"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>Konfirmasi Daftar Ulang</span>
            </a>
          </div>
        </div>
      </div>

      {/* Printable Official Surat Pernyataan Penerimaan */}
      <article className="print-card acceptance-letter-sheet rounded-2xl border border-slate-300 bg-white p-5 text-slate-950 shadow-sm sm:p-10">
        {/* KOP SURAT RESMI MADRASAH */}
        <OfficialKopSurat config={settings.kopSurat} />

        {/* Judul Surat Pernyataan & Nomor Surat */}
        <div className="mt-6 text-center">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-widest text-black underline decoration-2 underline-offset-4 sm:text-xl">
            SURAT PERNYATAAN
          </h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-800 sm:text-sm">
            PENERIMAAN PESERTA DIDIK BARU TAHUN AJARAN {settings.academicYear}
          </p>
          <p className="mt-1 font-mono text-xs font-semibold text-slate-800 sm:text-sm">
            Nomor : {letterNumber}
          </p>
        </div>

        {/* Pembuka Surat Pernyataan */}
        <div className="mt-5 space-y-2.5 text-xs leading-relaxed text-slate-900 sm:text-sm">
          <p className="font-medium italic">
            Assalamu&apos;alaikum Warahmatullahi Wabarakatuh.
          </p>
          <p>Yang bertanda tangan di bawah ini:</p>

          {/* Identitas Pihak yang Menyatakan */}
          <table className="w-full border-collapse text-xs sm:text-sm">
            <tbody>
              <tr>
                <td className="w-40 py-1 pr-3 font-medium text-slate-700 sm:w-44">Nama / Jabatan</td>
                <td className="w-4 py-1 text-slate-700">:</td>
                <td className="py-1 font-semibold text-slate-950">
                  Kepala Madrasah / Ketua Panitia PPDB MIS Darussalam
                </td>
              </tr>
              <tr>
                <td className="py-1 pr-3 font-medium text-slate-700">Satuan Pendidikan</td>
                <td className="py-1 text-slate-700">:</td>
                <td className="py-1 font-semibold text-slate-950">
                  Madrasah Ibtidaiyah Swasta (MIS) Darussalam (YPI-DTQ)
                </td>
              </tr>
              <tr>
                <td className="py-1 pr-3 font-medium text-slate-700">Alamat Madrasah</td>
                <td className="py-1 text-slate-700">:</td>
                <td className="py-1 text-slate-900">
                  Jln. Wanasari No. 1 Desa Pinangsari Kec. Ciasem Kab. Subang 41265
                </td>
              </tr>
            </tbody>
          </table>

          <p className="pt-1 text-justify">
            Dengan ini menyatakan dengan sesungguhnya bahwa calon peserta didik baru di bawah ini:
          </p>
        </div>

        {/* Tabel Identitas Calon Peserta Didik + Pas Foto */}
        <div className="mt-3.5 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-start">
          <div className="sm:col-span-9">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="w-40 py-1.5 pr-3 font-medium text-slate-600 sm:w-44">
                    Nomor Pendaftaran
                  </td>
                  <td className="w-4 py-1.5 text-slate-600">:</td>
                  <td className="py-1.5 font-mono font-bold text-slate-950">
                    {record.registrationNumber}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 pr-3 font-medium text-slate-600">Nama Lengkap Siswa</td>
                  <td className="py-1.5 text-slate-600">:</td>
                  <td className="py-1.5 font-bold uppercase text-slate-950">
                    {record.studentData.fullName}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 pr-3 font-medium text-slate-600">NIK</td>
                  <td className="py-1.5 text-slate-600">:</td>
                  <td className="py-1.5 font-mono text-slate-900">{record.studentData.nik}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 pr-3 font-medium text-slate-600">Tempat, Tanggal Lahir</td>
                  <td className="py-1.5 text-slate-600">:</td>
                  <td className="py-1.5 text-slate-900">
                    {record.studentData.birthPlace}, {birthDateText}
                    {age ? ` (${age.years} Thn ${age.months} Bln per 1 Juli 2026)` : ''}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 pr-3 font-medium text-slate-600">Jenis Kelamin</td>
                  <td className="py-1.5 text-slate-600">:</td>
                  <td className="py-1.5 text-slate-900">{record.studentData.gender}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 pr-3 font-medium text-slate-600">Asal Sekolah</td>
                  <td className="py-1.5 text-slate-600">:</td>
                  <td className="py-1.5 text-slate-900">
                    {record.studentData.originType}
                    {record.studentData.originSchoolName
                      ? ` — ${record.studentData.originSchoolName}`
                      : ''}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 pr-3 font-medium text-slate-600">Nama Orang Tua / Wali</td>
                  <td className="py-1.5 text-slate-600">:</td>
                  <td className="py-1.5 text-slate-900">
                    {record.parentsData.father.fullName} &amp; {record.parentsData.mother.fullName}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 pr-3 font-medium text-slate-600">Alamat Domisili</td>
                  <td className="py-1.5 text-slate-600">:</td>
                  <td className="py-1.5 text-xs leading-relaxed text-slate-900">
                    {record.studentData.addressStreet}, RT/RW {record.studentData.addressRtRw},{' '}
                    {record.studentData.addressVillage}, Kec. {record.studentData.addressDistrict},{' '}
                    {record.studentData.addressCity}
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-3 font-medium text-slate-600">Gelombang / Jalur</td>
                  <td className="py-1.5 text-slate-600">:</td>
                  <td className="py-1.5 text-slate-900">
                    {record.wave} · Jalur {record.registrationChannel}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center sm:col-span-3">
            <div className="h-36 w-28 overflow-hidden rounded border border-slate-400 bg-slate-50">
              {record.documents.studentPhoto?.dataUrl ? (
                <img
                  src={record.documents.studentPhoto.dataUrl}
                  alt={`Pas Foto ${record.studentData.fullName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                  <User className="h-8 w-8" />
                  <span className="mt-1 text-[10px]">Pas Foto 3x4</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-500">Pas Foto 3x4</p>
          </div>
        </div>

        {/* Pernyataan Keputusan Penerimaan */}
        <p className="mt-4 text-justify text-xs leading-relaxed text-slate-900 sm:text-sm">
          Berdasarkan hasil verifikasi kelengkapan berkas administrasi dan pemetaan kesiapan belajar
          PPDB <strong>MIS Darussalam</strong> Tahun Ajaran{' '}
          <strong>{settings.academicYear}</strong>, dengan ini dinyatakan bahwa calon peserta didik
          tersebut:
        </p>

        {/* Kotak Keputusan Penetapan */}
        <div
          className={`avoid-break mt-3 rounded-xl border-2 px-5 py-3.5 text-center ${
            isAccepted
              ? 'border-emerald-800 bg-emerald-50/70'
              : 'border-amber-600 bg-amber-50/60'
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-700">
            Status Penetapan Penerimaan Peserta Didik Baru
          </p>
          <div className="mt-1 flex items-center justify-center gap-2">
            {isAccepted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-800" />
            ) : (
              <FileCheck2 className="h-5 w-5 text-amber-700" />
            )}
            <p
              className={`font-display text-base font-extrabold uppercase tracking-wide sm:text-lg ${
                isAccepted ? 'text-emerald-900' : 'text-amber-900'
              }`}
            >
              {isAccepted ? 'DITERIMA SEBAGAI PESERTA DIDIK BARU' : record.status.toUpperCase()}
            </p>
          </div>
          <p className="mt-0.5 text-xs font-medium text-slate-800">
            Kelas I (Satu) MIS Darussalam Tahun Ajaran {settings.academicYear}
          </p>
        </div>

        {/* Ketentuan Daftar Ulang */}
        <div className="avoid-break mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs leading-relaxed text-slate-800">
          <p className="font-bold uppercase tracking-wide text-slate-900">
            Ketentuan Pelaksanaan Daftar Ulang:
          </p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-4">
            <li>
              Jadwal daftar ulang {record.wave} dilaksanakan pada tanggal{' '}
              <strong>{waveDates.reRegistrationDates}</strong> di Sekretariat PPDB MIS Darussalam (
              {settings.secretariatHours}).
            </li>
            <li>
              Administrasi daftar ulang: <strong>{settings.reRegistrationFee}</strong>.
            </li>
            <li>
              Membawa dokumen fisik verifikasi: Fotokopi Akta Kelahiran (2 lembar), Fotokopi Kartu
              Keluarga (2 lembar), Fotokopi KTP Orang Tua (2 lembar), Pas Foto berwarna 3x4 (4
              lembar), serta Surat Pernyataan Penerimaan ini.
            </li>
          </ol>
        </div>

        {/* Penutup Surat Pernyataan */}
        <div className="mt-4 space-y-2 text-xs leading-relaxed text-slate-900 sm:text-sm">
          <p className="text-justify">
            Demikian Surat Pernyataan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan
            sebagaimana mestinya sebagai bukti sah penerimaan peserta didik baru dan syarat
            pelaksanaan daftar ulang.
          </p>
          <p className="font-medium italic">
            Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh.
          </p>
        </div>

        {/* QR Code Verifikasi & Blok Tanda Tangan */}
        <div className="avoid-break mt-6 flex flex-col items-start justify-between gap-6 border-t border-slate-200 pt-5 sm:flex-row sm:items-end">
          <div className="flex items-center gap-3.5">
            <div className="rounded-lg border border-slate-300 bg-white p-2">
              <QRCodeSVG
                value={`SP-PPDB-MISDS|${letterNumber}|${record.registrationNumber}|${record.studentData.nik}|${record.status}`}
                size={80}
                level="M"
              />
            </div>
            <div className="max-w-xs text-xs text-slate-600">
              <p className="font-bold text-slate-900">Validasi Dokumen Digital</p>
              <p className="mt-0.5 leading-relaxed">
                Surat pernyataan ini diterbitkan secara resmi melalui Sistem Informasi PPDB MIS
                Darussalam.
              </p>
            </div>
          </div>

          <div className="min-w-[240px] text-center text-xs text-slate-800 sm:text-left">
            <p>Ciasem, {issueDateText}</p>
            <p className="mt-0.5 font-semibold text-slate-800">Yang Menyatakan,</p>
            <p className="font-bold text-slate-950">Kepala Madrasah / Ketua Panitia PPDB</p>
            <p className="text-slate-600">MIS Darussalam</p>
            <div className="my-2.5 flex h-12 items-center justify-center sm:justify-start">
              <span className="rounded border border-dashed border-emerald-700/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800/75">
                Terverifikasi Panitia PPDB
              </span>
            </div>
            <p className="border-t border-slate-800 pt-1 font-bold text-slate-950 whitespace-nowrap">
              Panitia PPDB MIS Darussalam TA {settings.academicYear}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

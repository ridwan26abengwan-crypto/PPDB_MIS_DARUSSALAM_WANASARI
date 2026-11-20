import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  MessageCircle,
  Printer,
  User,
} from 'lucide-react';
import type { PpdbSettings, RegistrationRecord } from '../types/ppdb';
import {
  calculateAgeAsOf,
  normalizeWhatsappForLink,
  STATUS_META,
} from '../utils/ppdbRules';
import { MadrasahEmblem } from './MadrasahEmblem';

interface RegistrationReceiptProps {
  record: RegistrationRecord;
  settings: PpdbSettings;
  onBack: () => void;
  onViewAcceptanceLetter?: (record: RegistrationRecord) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const RegistrationReceipt: React.FC<RegistrationReceiptProps> = ({
  record,
  settings,
  onBack,
  onViewAcceptanceLetter,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(record.registrationNumber);
      setCopied(true);
      onToast('success', 'Nomor Pendaftaran Disalin', record.registrationNumber);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast('info', 'Salin Manual', `Nomor: ${record.registrationNumber}`);
    }
  };

  const age = calculateAgeAsOf(record.studentData.birthDate, '2026-07-01');
  const statusMeta = STATUS_META[record.status];
  const waAdminNumber = normalizeWhatsappForLink(settings.contactWa);
  const waConfirmText = encodeURIComponent(
    `Assalamu'alaikum Panitia PPDB MIS Darussalam, saya orang tua dari ananda *${record.studentData.fullName}* dengan Nomor Pendaftaran *${record.registrationNumber}* bermaksud mengonfirmasi pendaftaran peserta didik baru TA ${settings.academicYear}.`
  );

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Screen-only Action Bar */}
      <div className="no-print mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Kartu Bukti Pendaftaran Resmi
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-lg font-bold text-slate-900">
              {record.registrationNumber}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
          {record.status === 'Diterima' && onViewAcceptanceLetter && (
            <button
              type="button"
              onClick={() => onViewAcceptanceLetter(record)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Cetak Surat Pernyataan</span>
            </button>
          )}
          <a
            href={`https://wa.me/${waAdminNumber}?text=${waConfirmText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Konfirmasi ke WhatsApp Panitia</span>
          </a>
        </div>
      </div>

      {/* PRINTABLE CARD */}
      <article className="print-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        {/* Kop Surat */}
        <header className="flex flex-col items-center gap-4 border-b-2 border-emerald-900 pb-5 text-center sm:flex-row sm:text-left">
          <MadrasahEmblem className="h-16 w-16 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Yayasan Pendidikan Islam Darussalam
            </p>
            <h1 className="font-display text-xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-2xl">
              Madrasah Ibtidaiyah Swasta (MIS) Darussalam
            </h1>
            <p className="mt-0.5 text-xs text-slate-600">{settings.schoolAddress}</p>
            <p className="text-xs text-slate-600">
              WhatsApp Panitia PPDB: {settings.contactWa} · Jam Layanan: {settings.secretariatHours}
            </p>
          </div>
        </header>

        {/* Card Title */}
        <div className="my-6 text-center">
          <h2 className="font-display text-base font-bold uppercase tracking-wide text-slate-900 sm:text-lg">
            Kartu Bukti Pendaftaran Peserta Didik Baru TA {settings.academicYear}
          </h2>
          <div className="mt-2 inline-flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-mono font-bold text-emerald-900">
              No. Reg: {record.registrationNumber}
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-semibold text-slate-700">{record.wave}</span>
            <span className="text-slate-400">·</span>
            <span
              className={`rounded border px-2 py-0.5 font-semibold ${statusMeta.bgClass} ${statusMeta.textClass} ${statusMeta.borderClass}`}
            >
              {record.status}
            </span>
          </div>
        </div>

        {/* Biodata + Photo 3x4 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
          <div className="flex flex-col items-center sm:col-span-3">
            <div className="h-44 w-32 overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
              {record.documents.studentPhoto?.dataUrl ? (
                <img
                  src={record.documents.studentPhoto.dataUrl}
                  alt={`Pas Foto ${record.studentData.fullName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                  <User className="h-10 w-10" />
                  <span className="mt-1 text-[10px]">Foto 3x4</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-500">Pas Foto Resmi 3x4</p>
          </div>

          <div className="sm:col-span-9">
            <table className="w-full border-collapse text-sm">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-500 w-44">Nama Lengkap</td>
                  <td className="py-2 font-bold text-slate-900">{record.studentData.fullName}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-500">NIK / No. KK</td>
                  <td className="py-2 font-mono text-xs text-slate-800">
                    {record.studentData.nik} / {record.studentData.kkNumber}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-500">Tempat, Tanggal Lahir</td>
                  <td className="py-2 text-slate-800">
                    {record.studentData.birthPlace}, {record.studentData.birthDate}
                    {age ? ` (${age.years} Thn ${age.months} Bln per 1 Juli 2026)` : ''}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-500">Jenis Kelamin</td>
                  <td className="py-2 text-slate-800">{record.studentData.gender}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-500">Asal Sekolah</td>
                  <td className="py-2 text-slate-800">
                    {record.studentData.originType}
                    {record.studentData.originSchoolName
                      ? ` — ${record.studentData.originSchoolName}`
                      : ''}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-500">Nama Orang Tua</td>
                  <td className="py-2 text-slate-800">
                    {record.parentsData.father.fullName} &amp; {parentsMotherName(record)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-500">No. WhatsApp Kontak</td>
                  <td className="py-2 font-mono text-slate-800">{record.parentsData.whatsapp}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-500">Alamat</td>
                  <td className="py-2 text-xs leading-relaxed text-slate-800">
                    {record.studentData.addressStreet}, RT/RW {record.studentData.addressRtRw},{' '}
                    {record.studentData.addressVillage}, Kec. {record.studentData.addressDistrict},{' '}
                    {record.studentData.addressCity}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Kelengkapan Berkas */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Status Kelengkapan Berkas Digital
          </h3>
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {[
              { label: 'Akta Kelahiran', ok: Boolean(record.documents.birthCertificate) },
              { label: 'Kartu Keluarga (KK)', ok: Boolean(record.documents.familyCard) },
              { label: 'KTP Orang Tua', ok: Boolean(record.documents.parentIdCard) },
              { label: 'Pas Foto 3x4', ok: Boolean(record.documents.studentPhoto) },
              { label: 'Ijazah/SKL TK/RA', ok: Boolean(record.documents.tkCertificate) },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-slate-800">
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 ${item.ok ? 'text-emerald-700' : 'text-slate-300'}`}
                />
                <span>
                  {item.label}: <strong>{item.ok ? 'Ada' : 'Menyusul'}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {record.observationSchedule && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950">
            <p className="font-bold">Jadwal Observasi / Pemetaan Kesiapan Belajar:</p>
            <p className="mt-0.5">{record.observationSchedule}</p>
          </div>
        )}

        {/* Footer with QR Code & Signature */}
        <div className="mt-8 flex flex-col items-start justify-between gap-6 border-t border-slate-200 pt-6 sm:flex-row sm:items-end">
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-2">
              <QRCodeSVG
                value={`PPDB-MISDS|${record.registrationNumber}|${record.studentData.nik}`}
                size={84}
                level="M"
              />
            </div>
            <div className="text-xs text-slate-600 max-w-xs">
              <p className="font-semibold text-slate-900">Verifikasi Keaslian Kartu</p>
              <p className="mt-0.5 leading-relaxed">
                Simpan kartu bukti ini dan tunjukkan saat pelaksanaan observasi serta daftar ulang di sekretariat madrasah.
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-xs text-slate-700">
            <p>Cibinong, {printDate}</p>
            <p className="font-semibold text-slate-900">Panitia PPDB MIS Darussalam</p>
            <div className="my-5 h-10" />
            <p className="border-t border-slate-400 pt-1 font-semibold text-slate-900">
              Sekretariat PPDB TA {settings.academicYear}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

function parentsMotherName(record: RegistrationRecord): string {
  return record.parentsData.mother.fullName;
}

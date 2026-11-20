import type {
  GenderType,
  KopSuratConfig,
  PpdbSettings,
  RegistrationRecord,
  RegistrationStatus,
  SchoolOriginType,
} from '../types/ppdb';

export interface AgeCalculation {
  years: number;
  months: number;
  isEligible: boolean;
  eligibilityLabel: string;
}

/**
 * Menghitung usia calon siswa pada tanggal acuan (default: 1 Juli 2026).
 * Sesuai Permendikbud & Kemenag untuk MI/SD kelas 1: minimal 6 tahun pada 1 Juli,
 * usia 5 tahun 6 bulan - 5 tahun 11 bulan dapat dipertimbangkan dengan kesiapan psikologis.
 */
export function calculateAgeAsOf(
  birthDateStr: string,
  referenceDateStr = '2026-07-01'
): AgeCalculation | null {
  if (!birthDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(birthDateStr)) {
    return null;
  }

  const [bYear, bMonth, bDay] = birthDateStr.split('-').map(Number);
  const [rYear, rMonth, rDay] = referenceDateStr.split('-').map(Number);

  const birthDate = new Date(bYear, bMonth - 1, bDay);
  const refDate = new Date(rYear, rMonth - 1, rDay);

  if (
    Number.isNaN(birthDate.getTime()) ||
    birthDate.getFullYear() !== bYear ||
    birthDate.getMonth() !== bMonth - 1 ||
    birthDate.getDate() !== bDay
  ) {
    return null;
  }

  if (birthDate > refDate) {
    return {
      years: 0,
      months: 0,
      isEligible: false,
      eligibilityLabel: 'Tanggal lahir tidak valid (melebihi 1 Juli 2026)',
    };
  }

  let years = rYear - bYear;
  let months = rMonth - bMonth;
  if (rDay < bDay) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = years * 12 + months;
  if (totalMonths >= 72) {
    return {
      years,
      months,
      isEligible: true,
      eligibilityLabel: 'Memenuhi syarat usia minimal (6 tahun per 1 Juli 2026)',
    };
  }
  if (totalMonths >= 66) {
    return {
      years,
      months,
      isEligible: true,
      eligibilityLabel:
        'Usia 5 thn 6 bln - 5 thn 11 bln (Dapat dipertimbangkan melalui observasi kesiapan belajar)',
    };
  }

  return {
    years,
    months,
    isEligible: false,
    eligibilityLabel: 'Belum memenuhi batas usia minimal pendaftaran (min. 5 thn 6 bln)',
  };
}

export function validateNik(nik: string): boolean {
  return /^\d{16}$/.test(nik.trim());
}

export function validateWhatsapp(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()+]/g, '');
  return /^(08|628)\d{8,12}$/.test(cleaned);
}

export interface AdminEditValidationErrors {
  fullName?: string;
  nik?: string;
  kkNumber?: string;
  whatsapp?: string;
  guardianPhone?: string;
}

export interface AdminEditValidationResult {
  isValid: boolean;
  errors: AdminEditValidationErrors;
}

export function validateAdminStudentEdit(input: {
  studentData: {
    fullName: string;
    nik: string;
    kkNumber: string;
  };
  parentsData: {
    whatsapp: string;
    guardian?: {
      enabled?: boolean;
      phone?: string;
    };
  };
}): AdminEditValidationResult {
  const errors: AdminEditValidationErrors = {};

  if (!input.studentData.fullName.trim()) {
    errors.fullName = 'Nama lengkap calon siswa tidak boleh kosong.';
  }

  if (!validateNik(input.studentData.nik)) {
    errors.nik = 'NIK siswa wajib terdiri dari tepat 16 digit angka.';
  }

  if (!validateNik(input.studentData.kkNumber)) {
    errors.kkNumber = 'Nomor KK wajib terdiri dari tepat 16 digit angka.';
  }

  if (!validateWhatsapp(input.parentsData.whatsapp)) {
    errors.whatsapp =
      'Nomor telepon/WhatsApp orang tua wajib berformat 08... atau 628... (10–14 digit).';
  }

  const guardianPhone = input.parentsData.guardian?.phone?.trim() || '';
  if (input.parentsData.guardian?.enabled && guardianPhone && !validateWhatsapp(guardianPhone)) {
    errors.guardianPhone =
      'Nomor HP wali wajib berformat 08... atau 628... (10–14 digit).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function normalizeWhatsappForLink(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('0')) {
    return `62${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith('8')) {
    return `62${cleaned}`;
  }
  return cleaned;
}

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  const isoMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!isoMatch) return dateStr;
  const year = Number(isoMatch[1]);
  const monthIdx = Number(isoMatch[2]) - 1;
  const day = Number(isoMatch[3]);
  if (monthIdx < 0 || monthIdx > 11 || Number.isNaN(day) || Number.isNaN(year)) {
    return dateStr;
  }
  return `${day} ${INDONESIAN_MONTHS[monthIdx]} ${year}`;
}

export function buildAcceptanceLetterNumber(
  registrationNumber: string,
  academicYear = '2026/2027'
): string {
  const seqMatch = registrationNumber.trim().match(/(\d{4})$/);
  const seq = seqMatch ? seqMatch[1] : '0001';
  const yearMatch = academicYear.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : '2026';
  return `${seq}/SP-PPDB/MIS-DS/${year}`;
}

export interface RecapSummary {
  total: number;
  accepted: number;
  verified: number;
  pending: number;
  needsRevision: number;
  other: number;
  male: number;
  female: number;
}

export function computeRecapSummary(records: RegistrationRecord[]): RecapSummary {
  const summary: RecapSummary = {
    total: records.length,
    accepted: 0,
    verified: 0,
    pending: 0,
    needsRevision: 0,
    other: 0,
    male: 0,
    female: 0,
  };

  for (const r of records) {
    if (r.status === 'Diterima') summary.accepted += 1;
    else if (r.status === 'Berkas Terverifikasi') summary.verified += 1;
    else if (r.status === 'Menunggu Verifikasi') summary.pending += 1;
    else if (r.status === 'Berkas Perlu Perbaikan') summary.needsRevision += 1;
    else summary.other += 1;

    if (r.studentData.gender === 'Laki-laki') summary.male += 1;
    else summary.female += 1;
  }

  return summary;
}

export function formatRecapFilterSummary(filters: {
  statusFilter: string;
  waveFilter: string;
  genderFilter: string;
  searchTerm?: string;
}): string {
  const parts: string[] = [
    `Status: ${filters.statusFilter === 'ALL' ? 'Semua Status' : filters.statusFilter}`,
    `Gelombang: ${filters.waveFilter === 'ALL' ? 'Semua Gelombang' : filters.waveFilter}`,
    `Gender: ${filters.genderFilter === 'ALL' ? 'Semua Gender' : filters.genderFilter}`,
  ];
  if (filters.searchTerm && filters.searchTerm.trim()) {
    parts.push(`Kata Kunci: "${filters.searchTerm.trim()}"`);
  }
  return parts.join(' · ');
}

export const DEFAULT_KOP_SURAT_CONFIG: KopSuratConfig = {
  topLabel: 'LEMBAR PENETAPAN',
  foundationName: 'YAYASAN PENDIDIKAN ISLAM DAARUTTAQWA (YPI-DTQ)',
  madrasahName: 'MADRASAH IBTIDAIYAH DARUSSALAM',
  accreditation: 'TERAKREDITASI : B',
  decreeNumber: 'Nomor : 031/BAN-PDM/SK/2026',
  addressLine:
    'Jln. Wanasari No. 1 Desa Pinangsari Kec. Ciasem Kab. Subang 41265 Tlp. 08568639720',
  leftLogoDataUrl: null,
  rightLogoDataUrl: null,
};

export function resolveKopSuratConfig(
  kop?: Partial<KopSuratConfig> | null
): KopSuratConfig {
  return {
    topLabel:
      kop?.topLabel !== undefined ? kop.topLabel : DEFAULT_KOP_SURAT_CONFIG.topLabel,
    foundationName:
      kop?.foundationName?.trim() || DEFAULT_KOP_SURAT_CONFIG.foundationName,
    madrasahName:
      kop?.madrasahName?.trim() || DEFAULT_KOP_SURAT_CONFIG.madrasahName,
    accreditation:
      kop?.accreditation !== undefined
        ? kop.accreditation
        : DEFAULT_KOP_SURAT_CONFIG.accreditation,
    decreeNumber:
      kop?.decreeNumber !== undefined
        ? kop.decreeNumber
        : DEFAULT_KOP_SURAT_CONFIG.decreeNumber,
    addressLine:
      kop?.addressLine?.trim() || DEFAULT_KOP_SURAT_CONFIG.addressLine,
    leftLogoDataUrl: kop?.leftLogoDataUrl || null,
    rightLogoDataUrl: kop?.rightLogoDataUrl || null,
  };
}

const ALLOWED_LOGO_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
]);

export const MAX_KOP_LOGO_BYTES = 2 * 1024 * 1024;

export function validateKopSuratLogoFile(file: {
  type: string;
  size: number;
}): string | null {
  if (!ALLOWED_LOGO_MIME_TYPES.has(file.type.toLowerCase())) {
    return 'Format logo wajib berupa gambar PNG, JPG, WebP, atau SVG.';
  }
  if (file.size > MAX_KOP_LOGO_BYTES) {
    return 'Ukuran file logo maksimal 2 MB.';
  }
  return null;
}

export function generateRegistrationNumber(
  existingNumbers: string[],
  year = 2026
): string {
  const prefix = `PPDB-MISDS-${year}-`;
  let maxSeq = 0;

  for (const regNum of existingNumbers) {
    if (regNum.startsWith(prefix)) {
      const suffix = regNum.slice(prefix.length);
      const parsed = Number.parseInt(suffix, 10);
      if (!Number.isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

export function buildWhatsAppStatusMessage(
  record: RegistrationRecord,
  settings: PpdbSettings
): string {
  const name = record.studentData.fullName;
  const regNo = record.registrationNumber;

  switch (record.status) {
    case 'Menunggu Verifikasi':
      return `Assalamu'alaikum Wr. Wb. Bapak/Ibu orang tua dari ananda *${name}* (${regNo}). Terima kasih telah mendaftar di PPDB MIS Darussalam TA ${settings.academicYear}. Berkas ananda saat ini sedang dalam antrean verifikasi panitia.`;
    case 'Berkas Perlu Perbaikan':
      return `Assalamu'alaikum Wr. Wb. Bapak/Ibu orang tua dari ananda *${name}* (${regNo}). Panitia PPDB MIS Darussalam memohon perbaikan berkas dengan catatan: "${record.adminNotes || 'Mohon unggah ulang berkas yang kurang jelas'}". Silakan perbaiki melalui menu Cek Status di portal PPDB kami.`;
    case 'Berkas Terverifikasi':
      return `Assalamu'alaikum Wr. Wb. Bapak/Ibu orang tua dari ananda *${name}* (${regNo}). Alhamdulillah berkas pendaftaran telah *TERVERIFIKASI*. Mohon kehadiran ananda dan orang tua pada jadwal observasi & pemetaan: *${record.observationSchedule || 'Akan diinformasikan lebih lanjut'}*.`;
    case 'Diterima':
      return `Assalamu'alaikum Wr. Wb. Selamat! Ananda *${name}* (${regNo}) dinyatakan *DITERIMA* sebagai calon peserta didik baru MIS Darussalam TA ${settings.academicYear}. Silakan melaksanakan daftar ulang sesuai jadwal (${record.wave === 'Gelombang 1' ? settings.wave1Dates.reRegistrationDates : settings.wave2Dates.reRegistrationDates}). Info biaya daftar ulang: ${settings.reRegistrationFee}.`;
    case 'Cadangan':
      return `Assalamu'alaikum Wr. Wb. Bapak/Ibu orang tua dari ananda *${name}* (${regNo}). Saat ini ananda tercatat dalam daftar *CADANGAN* PPDB MIS Darussalam TA ${settings.academicYear}. Kami akan menghubungi Bapak/Ibu apabila terdapat kuota tersedia.`;
    case 'Tidak Diterima':
      return `Assalamu'alaikum Wr. Wb. Bapak/Ibu orang tua dari ananda *${name}* (${regNo}). Terima kasih atas kepercayaannya mendaftar di MIS Darussalam. Mohon maaf pada tahun ajaran ini ananda belum dapat kami terima karena keterbatasan kuota.`;
  }
}

export interface AdminAnalytics {
  total: number;
  pending: number;
  needsRevision: number;
  verified: number;
  accepted: number;
  reserveOrRejected: number;
  quotaPercentage: number;
  byGender: Array<{ name: GenderType; value: number }>;
  byOrigin: Array<{ name: SchoolOriginType; value: number }>;
  dailyTrend: Array<{ label: string; count: number }>;
}

export function computeAdminAnalytics(
  records: RegistrationRecord[],
  quota: number
): AdminAnalytics {
  let pending = 0;
  let needsRevision = 0;
  let verified = 0;
  let accepted = 0;
  let reserveOrRejected = 0;
  let male = 0;
  let female = 0;

  const originMap: Record<SchoolOriginType, number> = {
    TK: 0,
    RA: 0,
    PAUD: 0,
    'Belum Sekolah': 0,
  };

  const dayMap = new Map<string, number>();

  for (const r of records) {
    if (r.status === 'Menunggu Verifikasi') pending += 1;
    else if (r.status === 'Berkas Perlu Perbaikan') needsRevision += 1;
    else if (r.status === 'Berkas Terverifikasi') verified += 1;
    else if (r.status === 'Diterima') accepted += 1;
    else reserveOrRejected += 1;

    if (r.studentData.gender === 'Laki-laki') male += 1;
    else female += 1;

    const origin = r.studentData.originType;
    if (origin in originMap) {
      originMap[origin] += 1;
    }

    const dateKey = r.createdAt.slice(0, 10);
    dayMap.set(dateKey, (dayMap.get(dateKey) ?? 0) + 1);
  }

  const sortedDays = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([isoDate, count]) => {
      const [, m, d] = isoDate.split('-');
      return { label: `${d}/${m}`, count };
    });

  const safeQuota = quota > 0 ? quota : 1;
  const quotaPercentage = Math.min(100, Math.round((accepted / safeQuota) * 100));

  return {
    total: records.length,
    pending,
    needsRevision,
    verified,
    accepted,
    reserveOrRejected,
    quotaPercentage,
    byGender: [
      { name: 'Laki-laki', value: male },
      { name: 'Perempuan', value: female },
    ],
    byOrigin: (Object.keys(originMap) as SchoolOriginType[]).map((key) => ({
      name: key,
      value: originMap[key],
    })),
    dailyTrend: sortedDays,
  };
}

function escapeCsvCell(value: string | number | undefined | null): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Menghasilkan CSV berformat kompatibel EMIS Kemenag untuk rekapitulasi pendaftar.
 */
export function exportRegistrationsToCsv(records: RegistrationRecord[]): string {
  const headers = [
    'No. Pendaftaran',
    'Gelombang',
    'Jalur',
    'Status Verifikasi',
    'Nama Lengkap Siswa',
    'Nama Panggilan',
    'NIK Siswa',
    'No. KK',
    'NISN',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Jenis Kelamin',
    'Anak Ke',
    'Jumlah Saudara',
    'Status Keluarga',
    'Alamat Lengkap',
    'RT/RW',
    'Desa/Kelurahan',
    'Kecamatan',
    'Kabupaten/Kota',
    'Jarak ke Madrasah',
    'Jenis Sekolah Asal',
    'Nama Sekolah Asal',
    'Nama Ayah',
    'NIK Ayah',
    'Pendidikan Ayah',
    'Pekerjaan Ayah',
    'Penghasilan Ayah',
    'Nama Ibu',
    'NIK Ibu',
    'Pendidikan Ibu',
    'Pekerjaan Ibu',
    'Penghasilan Ibu',
    'No. WhatsApp Utama',
    'Email',
    'Jadwal Observasi',
    'Catatan Verifikator',
    'Tanggal Daftar',
  ];

  const rows = records.map((r) => {
    const s = r.studentData;
    const p = r.parentsData;
    return [
      r.registrationNumber,
      r.wave,
      r.registrationChannel,
      r.status,
      s.fullName,
      s.nickName,
      `'${s.nik}`,
      `'${s.kkNumber}`,
      s.nisn ? `'${s.nisn}` : '-',
      s.birthPlace,
      s.birthDate,
      s.gender,
      s.childOrder,
      s.totalSiblings,
      s.familyStatus,
      s.addressStreet,
      s.addressRtRw,
      s.addressVillage,
      s.addressDistrict,
      s.addressCity,
      s.distanceToSchool,
      s.originType,
      s.originSchoolName || '-',
      p.father.fullName,
      `'${p.father.nik}`,
      p.father.education,
      p.father.occupation,
      p.father.monthlyIncome,
      p.mother.fullName,
      `'${p.mother.nik}`,
      p.mother.education,
      p.mother.occupation,
      p.mother.monthlyIncome,
      `'${p.whatsapp}`,
      p.email || '-',
      r.observationSchedule || '-',
      r.adminNotes || '-',
      r.createdAt.slice(0, 10),
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

export const STATUS_META: Record<
  RegistrationStatus,
  {
    bgClass: string;
    textClass: string;
    borderClass: string;
    shortLabel: string;
  }
> = {
  'Menunggu Verifikasi': {
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
    shortLabel: 'Menunggu Verifikasi',
  },
  'Berkas Perlu Perbaikan': {
    bgClass: 'bg-red-50',
    textClass: 'text-red-800',
    borderClass: 'border-red-200',
    shortLabel: 'Perlu Perbaikan',
  },
  'Berkas Terverifikasi': {
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
    shortLabel: 'Terverifikasi',
  },
  Diterima: {
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-800',
    borderClass: 'border-sky-200',
    shortLabel: 'Diterima',
  },
  Cadangan: {
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-300',
    shortLabel: 'Cadangan',
  },
  'Tidak Diterima': {
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-600',
    borderClass: 'border-slate-200',
    shortLabel: 'Tidak Diterima',
  },
};

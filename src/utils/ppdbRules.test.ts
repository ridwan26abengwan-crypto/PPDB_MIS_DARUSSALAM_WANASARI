import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAcceptanceLetterNumber,
  buildWhatsAppStatusMessage,
  calculateAgeAsOf,
  computeAdminAnalytics,
  computeRecapSummary,
  DEFAULT_KOP_SURAT_CONFIG,
  exportRegistrationsToCsv,
  formatIndonesianDate,
  formatRecapFilterSummary,
  generateRegistrationNumber,
  normalizeWhatsappForLink,
  resolveKopSuratConfig,
  validateAdminStudentEdit,
  validateKopSuratLogoFile,
  validateNik,
  validateWhatsapp,
} from './ppdbRules';
import type { PpdbSettings, RegistrationRecord } from '../types/ppdb';

test('calculateAgeAsOf validates 6+ years eligibility accurately per July 1, 2026', () => {
  const eligible = calculateAgeAsOf('2020-05-15', '2026-07-01');
  assert.ok(eligible);
  assert.equal(eligible.years, 6);
  assert.equal(eligible.months, 1);
  assert.equal(eligible.isEligible, true);

  const borderline = calculateAgeAsOf('2020-12-20', '2026-07-01');
  assert.ok(borderline);
  assert.equal(borderline.years, 5);
  assert.equal(borderline.months, 6);
  assert.equal(borderline.isEligible, true);

  const tooYoung = calculateAgeAsOf('2021-03-01', '2026-07-01');
  assert.ok(tooYoung);
  assert.equal(tooYoung.years, 5);
  assert.equal(tooYoung.isEligible, false);
});

test('validateNik and validateWhatsapp enforce Indonesian formats', () => {
  assert.equal(validateNik('3201011505200001'), true);
  assert.equal(validateNik('320101150520001'), false);
  assert.equal(validateNik('320101150520000A'), false);

  assert.equal(validateWhatsapp('081234567890'), true);
  assert.equal(validateWhatsapp('6281234567890'), true);
  assert.equal(validateWhatsapp('0215551234'), false);
  assert.equal(normalizeWhatsappForLink('0812-3456-7890'), '6281234567890');
});

test('generateRegistrationNumber increments sequentially with zero-padding', () => {
  const next = generateRegistrationNumber(
    ['PPDB-MISDS-2026-0001', 'PPDB-MISDS-2026-0008'],
    2026
  );
  assert.equal(next, 'PPDB-MISDS-2026-0009');

  const first = generateRegistrationNumber([], 2026);
  assert.equal(first, 'PPDB-MISDS-2026-0001');
});

test('computeAdminAnalytics and exportRegistrationsToCsv summarize records cleanly', () => {
  const mockSettings: PpdbSettings = {
    id: 1,
    academicYear: '2026/2027',
    isOpen: true,
    quota: 60,
    wave1Dates: {
      label: 'Gelombang 1',
      registrationDates: '1 Jan - 28 Feb 2026',
      observationDate: '7 Mar 2026',
      announcementDate: '14 Mar 2026',
      reRegistrationDates: '16 - 25 Mar 2026',
      benefitNote: 'Potongan seragam',
    },
    wave2Dates: {
      label: 'Gelombang 2',
      registrationDates: '1 Apr - 30 Mei 2026',
      observationDate: '6 Jun 2026',
      announcementDate: '13 Jun 2026',
      reRegistrationDates: '15 - 24 Jun 2026',
      benefitNote: 'Reguler',
    },
    contactWa: '081234567890',
    schoolAddress: 'Jl. Darussalam No. 12',
    secretariatHours: '07.30 - 14.00 WIB',
    reRegistrationFee: 'Rp 1.450.000',
    registrationFee: 'Gratis',
    updatedAt: '2026-01-15T00:00:00.000Z',
  };

  const sampleRecord: RegistrationRecord = {
    id: '1',
    registrationNumber: 'PPDB-MISDS-2026-0001',
    wave: 'Gelombang 1',
    status: 'Diterima',
    adminNotes: '',
    observationSchedule: 'Sabtu, 7 Maret 2026',
    registrationChannel: 'Online',
    studentData: {
      fullName: 'Muhammad Al-Fatih',
      nickName: 'Fatih',
      nik: '3201011505200001',
      kkNumber: '3201010101150002',
      nisn: '',
      birthPlace: 'Bogor',
      birthDate: '2020-05-15',
      gender: 'Laki-laki',
      childOrder: '1',
      totalSiblings: '2',
      familyStatus: 'Anak Kandung',
      addressStreet: 'Jl. Melati No. 5',
      addressRtRw: '002/004',
      addressVillage: 'Sukamaju',
      addressDistrict: 'Cibinong',
      addressCity: 'Kab. Bogor',
      distanceToSchool: '< 1 km',
      originType: 'RA',
      originSchoolName: 'RA Al-Ikhlas',
    },
    parentsData: {
      father: {
        fullName: 'Ahmad Fauzi',
        nik: '3201011204880003',
        birthYear: '1988',
        education: 'S1',
        occupation: 'Karyawan Swasta',
        monthlyIncome: 'Rp 5.000.000 - Rp 8.000.000',
      },
      mother: {
        fullName: 'Siti Aminah',
        nik: '3201015006900004',
        birthYear: '1990',
        education: 'S1',
        occupation: 'Guru',
        monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
      },
      whatsapp: '081298765432',
      email: 'fauzi@example.com',
      guardian: {
        enabled: false,
        fullName: '',
        relationship: '',
        occupation: '',
        phone: '',
      },
    },
    documents: {
      birthCertificate: null,
      familyCard: null,
      parentIdCard: null,
      studentPhoto: null,
      tkCertificate: null,
    },
    createdAt: '2026-01-12T08:00:00.000Z',
    updatedAt: '2026-01-12T08:00:00.000Z',
  };

  const analytics = computeAdminAnalytics([sampleRecord], 60);
  assert.equal(analytics.total, 1);
  assert.equal(analytics.accepted, 1);
  assert.equal(analytics.quotaPercentage, 2);
  assert.equal(analytics.byGender[0].value, 1);

  const waMsg = buildWhatsAppStatusMessage(sampleRecord, mockSettings);
  assert.match(waMsg, /DITERIMA/);
  assert.match(waMsg, /Muhammad Al-Fatih/);

  const csv = exportRegistrationsToCsv([sampleRecord]);
  assert.match(csv, /PPDB-MISDS-2026-0001/);
  assert.match(csv, /Muhammad Al-Fatih/);
});

test('validateAdminStudentEdit enforces 16-digit NIK/KK and valid phone formats', () => {
  const validResult = validateAdminStudentEdit({
    studentData: {
      fullName: 'Muhammad Al-Fatih',
      nik: '3201011505200001',
      kkNumber: '3201010101150002',
    },
    parentsData: {
      whatsapp: '0812-3456-7890',
      guardian: { enabled: false, phone: '' },
    },
  });
  assert.equal(validResult.isValid, true);
  assert.deepEqual(validResult.errors, {});

  const invalidResult = validateAdminStudentEdit({
    studentData: {
      fullName: ' ',
      nik: '3201011505',
      kkNumber: '1234',
    },
    parentsData: {
      whatsapp: '0215551234',
      guardian: { enabled: true, phone: '08123' },
    },
  });
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.fullName);
  assert.ok(invalidResult.errors.nik);
  assert.ok(invalidResult.errors.kkNumber);
  assert.ok(invalidResult.errors.whatsapp);
  assert.ok(invalidResult.errors.guardianPhone);

  const intlPhoneResult = validateAdminStudentEdit({
    studentData: {
      fullName: 'Aisyah Humaira',
      nik: '3201016206200004',
      kkNumber: '3201010408160022',
    },
    parentsData: {
      whatsapp: '+6281377665544',
    },
  });
  assert.equal(intlPhoneResult.isValid, true);
});

test('formatIndonesianDate and buildAcceptanceLetterNumber format acceptance letter metadata', () => {
  assert.equal(formatIndonesianDate('2020-04-14'), '14 April 2020');
  assert.equal(formatIndonesianDate('2026-03-14T09:00:00.000Z'), '14 Maret 2026');
  assert.equal(formatIndonesianDate(''), '-');

  assert.equal(
    buildAcceptanceLetterNumber('PPDB-MISDS-2026-0001', '2026/2027'),
    '0001/SP-PPDB/MIS-DS/2026'
  );
  assert.equal(
    buildAcceptanceLetterNumber('PPDB-MISDS-2026-0012', '2026/2027'),
    '0012/SP-PPDB/MIS-DS/2026'
  );
});

test('computeRecapSummary and formatRecapFilterSummary aggregate physical report metrics', () => {
  const records = [
    { status: 'Diterima', studentData: { gender: 'Laki-laki' } },
    { status: 'Diterima', studentData: { gender: 'Perempuan' } },
    { status: 'Berkas Terverifikasi', studentData: { gender: 'Perempuan' } },
    { status: 'Menunggu Verifikasi', studentData: { gender: 'Laki-laki' } },
    { status: 'Berkas Perlu Perbaikan', studentData: { gender: 'Laki-laki' } },
    { status: 'Cadangan', studentData: { gender: 'Perempuan' } },
  ] as RegistrationRecord[];

  const summary = computeRecapSummary(records);
  assert.deepEqual(summary, {
    total: 6,
    accepted: 2,
    verified: 1,
    pending: 1,
    needsRevision: 1,
    other: 1,
    male: 3,
    female: 3,
  });

  const filterText = formatRecapFilterSummary({
    statusFilter: 'Diterima',
    waveFilter: 'ALL',
    genderFilter: 'Laki-laki',
    searchTerm: 'Fatih',
  });
  assert.equal(
    filterText,
    'Status: Diterima · Gelombang: Semua Gelombang · Gender: Laki-laki · Kata Kunci: "Fatih"'
  );
});

test('resolveKopSuratConfig and validateKopSuratLogoFile handle custom kop surat data and logo constraints', () => {
  const defaults = resolveKopSuratConfig(undefined);
  assert.equal(defaults.madrasahName, DEFAULT_KOP_SURAT_CONFIG.madrasahName);
  assert.equal(defaults.leftLogoDataUrl, null);
  assert.equal(defaults.rightLogoDataUrl, null);

  const custom = resolveKopSuratConfig({
    madrasahName: 'MIS DARUSSALAM SUBANG',
    topLabel: '',
    leftLogoDataUrl: 'data:image/png;base64,abc',
  });
  assert.equal(custom.madrasahName, 'MIS DARUSSALAM SUBANG');
  assert.equal(custom.topLabel, '');
  assert.equal(custom.foundationName, DEFAULT_KOP_SURAT_CONFIG.foundationName);
  assert.equal(custom.leftLogoDataUrl, 'data:image/png;base64,abc');
  assert.equal(custom.rightLogoDataUrl, null);

  assert.equal(validateKopSuratLogoFile({ type: 'image/png', size: 1024 * 500 }), null);
  assert.equal(validateKopSuratLogoFile({ type: 'image/svg+xml', size: 12000 }), null);
  assert.ok(validateKopSuratLogoFile({ type: 'application/pdf', size: 50000 }));
  assert.ok(validateKopSuratLogoFile({ type: 'image/png', size: 3 * 1024 * 1024 }));
});


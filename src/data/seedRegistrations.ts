import type { PpdbSettings, RegistrationRecord, UploadedDocument } from '../types/ppdb';
import { DEFAULT_KOP_SURAT_CONFIG } from '../utils/ppdbRules';

function makeDocumentSvgDataUrl(title: string, subtitle: string, accent: string, detailLines: string[]): string {
  const linesSvg = detailLines
    .map(
      (line, idx) =>
        `<text x="48" y="${175 + idx * 30}" font-family="sans-serif" font-size="16" fill="#1e293b">${line}</text>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
    <rect width="640" height="420" fill="#f8fafc"/>
    <rect x="20" y="20" width="600" height="380" rx="12" fill="#ffffff" stroke="${accent}" stroke-width="3"/>
    <rect x="20" y="20" width="600" height="72" rx="10" fill="${accent}"/>
    <text x="48" y="56" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${title}</text>
    <text x="48" y="78" font-family="sans-serif" font-size="13" fill="#e2e8f0">${subtitle}</text>
    <line x1="48" y1="130" x2="592" y2="130" stroke="#e2e8f0" stroke-width="2"/>
    ${linesSvg}
    <rect x="440" y="290" width="140" height="76" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="4 4"/>
    <text x="510" y="333" text-anchor="middle" font-family="monospace" font-size="12" fill="#475569">ARSIP TERVALIDASI</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeStudentPhotoSvgDataUrl(initials: string, bgColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
    <rect width="300" height="400" fill="${bgColor}"/>
    <circle cx="150" cy="145" r="56" fill="#fde68a"/>
    <path d="M55 360 C55 255, 245 255, 245 360 Z" fill="#ffffff"/>
    <path d="M90 360 C90 280, 210 280, 210 360 Z" fill="#047857"/>
    <text x="150" y="158" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="bold" fill="#064e3b">${initials}</text>
    <text x="150" y="385" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#ffffff">PAS FOTO 3x4</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildSeedDoc(
  id: string,
  label: string,
  fileName: string,
  dataUrl: string
): UploadedDocument {
  return {
    id,
    label,
    fileName,
    mimeType: 'image/svg+xml',
    sizeBytes: 42500,
    dataUrl,
    uploadedAt: '2026-02-10T09:15:00.000Z',
  };
}

export const DEFAULT_PPDB_SETTINGS: PpdbSettings = {
  id: 1,
  academicYear: '2026/2027',
  isOpen: true,
  quota: 60,
  wave1Dates: {
    label: 'Gelombang 1 (Early Bird)',
    registrationDates: '5 Januari – 28 Februari 2026',
    observationDate: 'Sabtu, 7 Maret 2026 (08.00 – 11.30 WIB)',
    announcementDate: 'Sabtu, 14 Maret 2026',
    reRegistrationDates: '16 – 25 Maret 2026',
    benefitNote: 'Prioritas kuota kelas & gratis biaya seragam olahraga.',
  },
  wave2Dates: {
    label: 'Gelombang 2 (Reguler)',
    registrationDates: '1 April – 30 Mei 2026',
    observationDate: 'Sabtu, 6 Juni 2026 (08.00 – 11.30 WIB)',
    announcementDate: 'Sabtu, 13 Juni 2026',
    reRegistrationDates: '15 – 24 Juni 2026',
    benefitNote: 'Terbuka selama kuota 60 kursi kelas 1 masih tersedia.',
  },
  contactWa: '081234567890',
  schoolAddress: 'Jl. Pendidikan Islami No. 45, Kel. Sukamaju, Kec. Cibinong, Kab. Bogor, Jawa Barat 16915',
  secretariatHours: 'Senin – Sabtu, 07.30 – 14.00 WIB',
  reRegistrationFee: 'Rp 1.450.000 (Seragam 3 Stel, Buku Paket Kurikulum Merdeka & Kemenag, Kegiatan 1 Tahun)',
  registrationFee: 'Gratis (Rp 0 — Bebas Biaya Formulir)',
  kopSurat: { ...DEFAULT_KOP_SURAT_CONFIG },
  updatedAt: '2026-01-05T07:00:00.000Z',
};

export const SEED_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: 'reg-001',
    registrationNumber: 'PPDB-MISDS-2026-0001',
    wave: 'Gelombang 1',
    status: 'Diterima',
    adminNotes: 'Berkas lengkap dan hasil pemetaan kesiapan belajar sangat baik.',
    observationSchedule: 'Sabtu, 7 Maret 2026 · Pukul 08.00 WIB (Ruang Abu Bakar)',
    registrationChannel: 'Online',
    studentData: {
      fullName: 'Muhammad Al-Fatih Pratama',
      nickName: 'Fatih',
      nik: '3201011404200001',
      kkNumber: '3201010203150011',
      nisn: '0201145678',
      birthPlace: 'Bogor',
      birthDate: '2020-04-14',
      gender: 'Laki-laki',
      childOrder: '1',
      totalSiblings: '2',
      familyStatus: 'Anak Kandung',
      addressStreet: 'Jl. Melati Indah Blok B No. 14',
      addressRtRw: '003/007',
      addressVillage: 'Sukamaju',
      addressDistrict: 'Cibinong',
      addressCity: 'Kabupaten Bogor',
      distanceToSchool: '< 1 km',
      originType: 'RA',
      originSchoolName: 'RA Darul Hikmah',
    },
    parentsData: {
      father: {
        fullName: 'Hendra Pratama, S.T.',
        nik: '3201011205870002',
        birthYear: '1987',
        education: 'S1',
        occupation: 'Pegawai Swasta',
        monthlyIncome: 'Rp 5.000.000 - Rp 8.000.000',
      },
      mother: {
        fullName: 'Nadia Rahmawati, S.Pd.',
        nik: '3201014809890005',
        birthYear: '1989',
        education: 'S1',
        occupation: 'Guru / Pendidik',
        monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
      },
      whatsapp: '081288112233',
      email: 'hendra.pratama@example.com',
      guardian: { enabled: false, fullName: '', relationship: '', occupation: '', phone: '' },
    },
    documents: {
      birthCertificate: buildSeedDoc(
        'doc-001-akta',
        'Akta Kelahiran',
        'akta_fatih.svg',
        makeDocumentSvgDataUrl('KUTIPAN AKTA KELAHIRAN', 'Dinas Kependudukan & Pencatatan Sipil', '#047857', [
          'Nama Anak: MUHAMMAD AL-FATIH PRATAMA',
          'NIK: 3201011404200001',
          'Tempat / Tgl Lahir: Bogor, 14 April 2020',
          'Ayah: Hendra Pratama | Ibu: Nadia Rahmawati',
        ])
      ),
      familyCard: buildSeedDoc(
        'doc-001-kk',
        'Kartu Keluarga',
        'kk_fatih.svg',
        makeDocumentSvgDataUrl('KARTU KELUARGA (KK)', 'No. KK: 3201010203150011', '#0f172a', [
          'Kepala Keluarga: HENDRA PRATAMA, S.T.',
          'Alamat: Jl. Melati Indah Blok B No. 14 RT 003/007',
          'Anggota: Hendra, Nadia, M. Al-Fatih, Zayd',
        ])
      ),
      parentIdCard: buildSeedDoc(
        'doc-001-ktp',
        'KTP Orang Tua',
        'ktp_hendra.svg',
        makeDocumentSvgDataUrl('KARTU TANDA PENDUDUK (KTP)', 'Provinsi Jawa Barat - Kabupaten Bogor', '#0369a1', [
          'NIK: 3201011205870002',
          'Nama: HENDRA PRATAMA, S.T.',
          'Status: Kawin · Kewarganegaraan: WNI',
        ])
      ),
      studentPhoto: buildSeedDoc(
        'doc-001-foto',
        'Pas Foto 3x4',
        'foto_fatih.svg',
        makeStudentPhotoSvgDataUrl('MF', '#b91c1c')
      ),
      tkCertificate: buildSeedDoc(
        'doc-001-skl',
        'Surat Keterangan RA',
        'skl_ra_fatih.svg',
        makeDocumentSvgDataUrl('SURAT KETERANGAN AKTIF RA', 'RA Darul Hikmah Cibinong', '#d97706', [
          'Menyatakan siswa atas nama Muhammad Al-Fatih Pratama',
          'Benar tercatat sebagai peserta didik Kelompok B',
          'Tahun Ajaran 2025/2026',
        ])
      ),
    },
    createdAt: '2026-01-12T08:30:00.000Z',
    updatedAt: '2026-03-14T09:00:00.000Z',
  },
  {
    id: 'reg-002',
    registrationNumber: 'PPDB-MISDS-2026-0002',
    wave: 'Gelombang 1',
    status: 'Berkas Terverifikasi',
    adminNotes: 'Seluruh berkas valid. Dijadwalkan mengikuti observasi kesiapan belajar.',
    observationSchedule: 'Sabtu, 7 Maret 2026 · Pukul 09.00 WIB (Ruang Umar bin Khattab)',
    registrationChannel: 'Online',
    studentData: {
      fullName: 'Aisyah Humaira Azzahra',
      nickName: 'Aisyah',
      nik: '3201016206200004',
      kkNumber: '3201010408160022',
      nisn: '',
      birthPlace: 'Depok',
      birthDate: '2020-06-22',
      gender: 'Perempuan',
      childOrder: '2',
      totalSiblings: '3',
      familyStatus: 'Anak Kandung',
      addressStreet: 'Perum Griya Asri Jl. Kenanga No. 8',
      addressRtRw: '005/002',
      addressVillage: 'Pabuaran',
      addressDistrict: 'Cibinong',
      addressCity: 'Kabupaten Bogor',
      distanceToSchool: '1 - 3 km',
      originType: 'TK',
      originSchoolName: 'TKIT Cahaya Madani',
    },
    parentsData: {
      father: {
        fullName: 'Muhammad Yusuf',
        nik: '3201011002850009',
        birthYear: '1985',
        education: 'S1',
        occupation: 'Wiraswasta',
        monthlyIncome: 'Rp 5.000.000 - Rp 8.000.000',
      },
      mother: {
        fullName: 'Fatimah Azzahra',
        nik: '3201015503880007',
        birthYear: '1988',
        education: 'D3',
        occupation: 'Ibu Rumah Tangga',
        monthlyIncome: '< Rp 1.500.000',
      },
      whatsapp: '081377665544',
      email: 'yusuf.keluarga@example.com',
      guardian: { enabled: false, fullName: '', relationship: '', occupation: '', phone: '' },
    },
    documents: {
      birthCertificate: buildSeedDoc(
        'doc-002-akta',
        'Akta Kelahiran',
        'akta_aisyah.svg',
        makeDocumentSvgDataUrl('KUTIPAN AKTA KELAHIRAN', 'Kota Depok - Jawa Barat', '#047857', [
          'Nama Anak: AISYAH HUMAIRA AZZAHRA',
          'NIK: 3201016206200004',
          'Tempat / Tgl Lahir: Depok, 22 Juni 2020',
        ])
      ),
      familyCard: buildSeedDoc(
        'doc-002-kk',
        'Kartu Keluarga',
        'kk_aisyah.svg',
        makeDocumentSvgDataUrl('KARTU KELUARGA (KK)', 'No. KK: 3201010408160022', '#0f172a', [
          'Kepala Keluarga: MUHAMMAD YUSUF',
          'Alamat: Perum Griya Asri Jl. Kenanga No. 8',
        ])
      ),
      parentIdCard: buildSeedDoc(
        'doc-002-ktp',
        'KTP Orang Tua',
        'ktp_yusuf.svg',
        makeDocumentSvgDataUrl('KARTU TANDA PENDUDUK (KTP)', 'Kabupaten Bogor', '#0369a1', [
          'NIK: 3201011002850009',
          'Nama: MUHAMMAD YUSUF',
        ])
      ),
      studentPhoto: buildSeedDoc(
        'doc-002-foto',
        'Pas Foto 3x4',
        'foto_aisyah.svg',
        makeStudentPhotoSvgDataUrl('AH', '#1d4ed8')
      ),
      tkCertificate: null,
    },
    createdAt: '2026-01-18T10:15:00.000Z',
    updatedAt: '2026-02-02T11:20:00.000Z',
  },
  {
    id: 'reg-003',
    registrationNumber: 'PPDB-MISDS-2026-0003',
    wave: 'Gelombang 1',
    status: 'Berkas Perlu Perbaikan',
    adminNotes: 'Foto Kartu Keluarga (KK) bagian nomor induk terpotong dan buram. Mohon unggah ulang foto KK yang utuh dan jelas.',
    observationSchedule: '',
    registrationChannel: 'Online',
    studentData: {
      fullName: 'Zayd Abdurrahman',
      nickName: 'Zayd',
      nik: '3201010803200008',
      kkNumber: '3201011109170033',
      nisn: '',
      birthPlace: 'Bogor',
      birthDate: '2020-03-08',
      gender: 'Laki-laki',
      childOrder: '1',
      totalSiblings: '1',
      familyStatus: 'Anak Kandung',
      addressStreet: 'Kp. Curug RT 02 RW 05 No. 27',
      addressRtRw: '002/005',
      addressVillage: 'Pakansari',
      addressDistrict: 'Cibinong',
      addressCity: 'Kabupaten Bogor',
      distanceToSchool: '1 - 3 km',
      originType: 'PAUD',
      originSchoolName: 'PAUD Tunas Harapan',
    },
    parentsData: {
      father: {
        fullName: 'Abdul Rahman Hakim',
        nik: '3201011508860004',
        birthYear: '1986',
        education: 'SMA/SMK',
        occupation: 'Teknisi / Mekanik',
        monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
      },
      mother: {
        fullName: 'Dewi Sartika',
        nik: '3201014401910002',
        birthYear: '1991',
        education: 'SMA/SMK',
        occupation: 'Pedagang / UMKM',
        monthlyIncome: 'Rp 1.500.000 - Rp 3.000.000',
      },
      whatsapp: '085611223344',
      email: '',
      guardian: { enabled: false, fullName: '', relationship: '', occupation: '', phone: '' },
    },
    documents: {
      birthCertificate: buildSeedDoc(
        'doc-003-akta',
        'Akta Kelahiran',
        'akta_zayd.svg',
        makeDocumentSvgDataUrl('KUTIPAN AKTA KELAHIRAN', 'Kabupaten Bogor', '#047857', [
          'Nama Anak: ZAYD ABDURRAHMAN',
          'NIK: 3201010803200008',
          'Lahir: Bogor, 08 Maret 2020',
        ])
      ),
      familyCard: buildSeedDoc(
        'doc-003-kk',
        'Kartu Keluarga',
        'kk_zayd_buram.svg',
        makeDocumentSvgDataUrl('DOKUMEN KK (PERLU PERBAIKAN)', 'Bagian kiri dokumen terpotong saat difoto', '#dc2626', [
          'Kepala Keluarga: ABDUL RAHMAN HAKIM',
          'Catatan: Mohon foto ulang seluruh halaman KK',
        ])
      ),
      parentIdCard: buildSeedDoc(
        'doc-003-ktp',
        'KTP Orang Tua',
        'ktp_hakim.svg',
        makeDocumentSvgDataUrl('KARTU TANDA PENDUDUK (KTP)', 'Kabupaten Bogor', '#0369a1', [
          'NIK: 3201011508860004',
          'Nama: ABDUL RAHMAN HAKIM',
        ])
      ),
      studentPhoto: buildSeedDoc(
        'doc-003-foto',
        'Pas Foto 3x4',
        'foto_zayd.svg',
        makeStudentPhotoSvgDataUrl('ZA', '#b91c1c')
      ),
      tkCertificate: null,
    },
    createdAt: '2026-01-25T13:40:00.000Z',
    updatedAt: '2026-02-04T09:10:00.000Z',
  },
  {
    id: 'reg-004',
    registrationNumber: 'PPDB-MISDS-2026-0004',
    wave: 'Gelombang 1',
    status: 'Menunggu Verifikasi',
    adminNotes: '',
    observationSchedule: '',
    registrationChannel: 'Online',
    studentData: {
      fullName: 'Khadijah Salsabila Putri',
      nickName: 'Salsa',
      nik: '3201015901200002',
      kkNumber: '3201012204140009',
      nisn: '',
      birthPlace: 'Jakarta',
      birthDate: '2020-01-19',
      gender: 'Perempuan',
      childOrder: '3',
      totalSiblings: '3',
      familyStatus: 'Anak Kandung',
      addressStreet: 'Jl. Raya Pemda No. 102',
      addressRtRw: '001/003',
      addressVillage: 'Karadenan',
      addressDistrict: 'Cibinong',
      addressCity: 'Kabupaten Bogor',
      distanceToSchool: '3 - 5 km',
      originType: 'RA',
      originSchoolName: 'RA Nurul Iman',
    },
    parentsData: {
      father: {
        fullName: 'Drs. Ridwan Kamiluddin',
        nik: '3201010507800006',
        birthYear: '1980',
        education: 'S1',
        occupation: 'ASN / PNS',
        monthlyIncome: 'Rp 5.000.000 - Rp 8.000.000',
      },
      mother: {
        fullName: 'Hj. Mariam Ulfah',
        nik: '3201014211830008',
        birthYear: '1983',
        education: 'S1',
        occupation: 'Wiraswasta',
        monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
      },
      whatsapp: '081199887766',
      email: 'ridwan.keluarga@example.com',
      guardian: { enabled: false, fullName: '', relationship: '', occupation: '', phone: '' },
    },
    documents: {
      birthCertificate: buildSeedDoc(
        'doc-004-akta',
        'Akta Kelahiran',
        'akta_salsa.svg',
        makeDocumentSvgDataUrl('KUTIPAN AKTA KELAHIRAN', 'DKI Jakarta', '#047857', [
          'Nama Anak: KHADIJAH SALSABILA PUTRI',
          'NIK: 3201015901200002',
          'Lahir: Jakarta, 19 Januari 2020',
        ])
      ),
      familyCard: buildSeedDoc(
        'doc-004-kk',
        'Kartu Keluarga',
        'kk_salsa.svg',
        makeDocumentSvgDataUrl('KARTU KELUARGA (KK)', 'No. KK: 3201012204140009', '#0f172a', [
          'Kepala Keluarga: DRS. RIDWAN KAMILUDDIN',
          'Alamat: Jl. Raya Pemda No. 102 Karadenan',
        ])
      ),
      parentIdCard: buildSeedDoc(
        'doc-004-ktp',
        'KTP Orang Tua',
        'ktp_ridwan.svg',
        makeDocumentSvgDataUrl('KARTU TANDA PENDUDUK (KTP)', 'Kabupaten Bogor', '#0369a1', [
          'NIK: 3201010507800006',
          'Nama: DRS. RIDWAN KAMILUDDIN',
        ])
      ),
      studentPhoto: buildSeedDoc(
        'doc-004-foto',
        'Pas Foto 3x4',
        'foto_salsa.svg',
        makeStudentPhotoSvgDataUrl('KS', '#1d4ed8')
      ),
      tkCertificate: null,
    },
    createdAt: '2026-02-01T09:10:00.000Z',
    updatedAt: '2026-02-01T09:10:00.000Z',
  },
  {
    id: 'reg-005',
    registrationNumber: 'PPDB-MISDS-2026-0005',
    wave: 'Gelombang 1',
    status: 'Diterima',
    adminNotes: 'Lolos seleksi & daftar ulang telah dikonfirmasi.',
    observationSchedule: 'Sabtu, 7 Maret 2026 · Pukul 08.30 WIB (Ruang Abu Bakar)',
    registrationChannel: 'Offline',
    studentData: {
      fullName: 'Ibrahim Malik Al-Habsyi',
      nickName: 'Baim',
      nik: '3201010202200009',
      kkNumber: '3201011805180015',
      nisn: '0202023344',
      birthPlace: 'Bogor',
      birthDate: '2020-02-02',
      gender: 'Laki-laki',
      childOrder: '2',
      totalSiblings: '2',
      familyStatus: 'Anak Kandung',
      addressStreet: 'Jl. KSR Dadi Kusmayadi No. 19',
      addressRtRw: '004/001',
      addressVillage: 'Tengah',
      addressDistrict: 'Cibinong',
      addressCity: 'Kabupaten Bogor',
      distanceToSchool: '< 1 km',
      originType: 'TK',
      originSchoolName: 'TK Islam Al-Azhar Syifa',
    },
    parentsData: {
      father: {
        fullName: 'Faisal Al-Habsyi',
        nik: '3201011909840001',
        birthYear: '1984',
        education: 'S2',
        occupation: 'Dosen / Akademisi',
        monthlyIncome: '> Rp 8.000.000',
      },
      mother: {
        fullName: 'Rina Marlina, M.Pd.',
        nik: '3201016004870003',
        birthYear: '1987',
        education: 'S2',
        occupation: 'Guru / Pendidik',
        monthlyIncome: 'Rp 5.000.000 - Rp 8.000.000',
      },
      whatsapp: '081233445566',
      email: 'faisal.habsyi@example.com',
      guardian: { enabled: false, fullName: '', relationship: '', occupation: '', phone: '' },
    },
    documents: {
      birthCertificate: buildSeedDoc(
        'doc-005-akta',
        'Akta Kelahiran',
        'akta_baim.svg',
        makeDocumentSvgDataUrl('KUTIPAN AKTA KELAHIRAN', 'Kabupaten Bogor', '#047857', [
          'Nama Anak: IBRAHIM MALIK AL-HABSYI',
          'NIK: 3201010202200009',
          'Lahir: Bogor, 02 Februari 2020',
        ])
      ),
      familyCard: buildSeedDoc(
        'doc-005-kk',
        'Kartu Keluarga',
        'kk_baim.svg',
        makeDocumentSvgDataUrl('KARTU KELUARGA (KK)', 'No. KK: 3201011805180015', '#0f172a', [
          'Kepala Keluarga: FAISAL AL-HABSYI',
          'Alamat: Jl. KSR Dadi Kusmayadi No. 19',
        ])
      ),
      parentIdCard: buildSeedDoc(
        'doc-005-ktp',
        'KTP Orang Tua',
        'ktp_faisal.svg',
        makeDocumentSvgDataUrl('KARTU TANDA PENDUDUK (KTP)', 'Kabupaten Bogor', '#0369a1', [
          'NIK: 3201011909840001',
          'Nama: FAISAL AL-HABSYI',
        ])
      ),
      studentPhoto: buildSeedDoc(
        'doc-005-foto',
        'Pas Foto 3x4',
        'foto_baim.svg',
        makeStudentPhotoSvgDataUrl('IM', '#b91c1c')
      ),
      tkCertificate: null,
    },
    createdAt: '2026-02-05T11:00:00.000Z',
    updatedAt: '2026-03-14T10:30:00.000Z',
  },
  {
    id: 'reg-006',
    registrationNumber: 'PPDB-MISDS-2026-0006',
    wave: 'Gelombang 1',
    status: 'Berkas Terverifikasi',
    adminNotes: 'Berkas lengkap. Menunggu kehadiran observasi.',
    observationSchedule: 'Sabtu, 7 Maret 2026 · Pukul 10.00 WIB (Ruang Umar bin Khattab)',
    registrationChannel: 'Online',
    studentData: {
      fullName: 'Hafshah Nurul Aini',
      nickName: 'Hafshah',
      nik: '3201016705200005',
      kkNumber: '3201010903190021',
      nisn: '',
      birthPlace: 'Bogor',
      birthDate: '2020-05-27',
      gender: 'Perempuan',
      childOrder: '1',
      totalSiblings: '2',
      familyStatus: 'Anak Kandung',
      addressStreet: 'Komplek Nirwana Estate Blok D3',
      addressRtRw: '006/009',
      addressVillage: 'Pakansari',
      addressDistrict: 'Cibinong',
      addressCity: 'Kabupaten Bogor',
      distanceToSchool: '1 - 3 km',
      originType: 'RA',
      originSchoolName: 'RA Al-Munawwarah',
    },
    parentsData: {
      father: {
        fullName: 'Lukmanul Hakim',
        nik: '3201012106880004',
        birthYear: '1988',
        education: 'S1',
        occupation: 'Karyawan BUMN',
        monthlyIncome: '> Rp 8.000.000',
      },
      mother: {
        fullName: 'Siti Aminah',
        nik: '3201015310900001',
        birthYear: '1990',
        education: 'S1',
        occupation: 'Apoteker',
        monthlyIncome: 'Rp 5.000.000 - Rp 8.000.000',
      },
      whatsapp: '081900112233',
      email: 'lukman.hakim@example.com',
      guardian: { enabled: false, fullName: '', relationship: '', occupation: '', phone: '' },
    },
    documents: {
      birthCertificate: buildSeedDoc(
        'doc-006-akta',
        'Akta Kelahiran',
        'akta_hafshah.svg',
        makeDocumentSvgDataUrl('KUTIPAN AKTA KELAHIRAN', 'Kabupaten Bogor', '#047857', [
          'Nama Anak: HAFSHAH NURUL AINI',
          'NIK: 3201016705200005',
          'Lahir: Bogor, 27 Mei 2020',
        ])
      ),
      familyCard: buildSeedDoc(
        'doc-006-kk',
        'Kartu Keluarga',
        'kk_hafshah.svg',
        makeDocumentSvgDataUrl('KARTU KELUARGA (KK)', 'No. KK: 3201010903190021', '#0f172a', [
          'Kepala Keluarga: LUKMANUL HAKIM',
          'Alamat: Komplek Nirwana Estate Blok D3',
        ])
      ),
      parentIdCard: buildSeedDoc(
        'doc-006-ktp',
        'KTP Orang Tua',
        'ktp_lukman.svg',
        makeDocumentSvgDataUrl('KARTU TANDA PENDUDUK (KTP)', 'Kabupaten Bogor', '#0369a1', [
          'NIK: 3201012106880004',
          'Nama: LUKMANUL HAKIM',
        ])
      ),
      studentPhoto: buildSeedDoc(
        'doc-006-foto',
        'Pas Foto 3x4',
        'foto_hafshah.svg',
        makeStudentPhotoSvgDataUrl('HN', '#1d4ed8')
      ),
      tkCertificate: null,
    },
    createdAt: '2026-02-09T14:25:00.000Z',
    updatedAt: '2026-02-11T08:00:00.000Z',
  },
  {
    id: 'reg-007',
    registrationNumber: 'PPDB-MISDS-2026-0007',
    wave: 'Gelombang 2',
    status: 'Menunggu Verifikasi',
    adminNotes: '',
    observationSchedule: '',
    registrationChannel: 'Online',
    studentData: {
      fullName: 'Bilal Arsyad Ramadhan',
      nickName: 'Bilal',
      nik: '3201011208200003',
      kkNumber: '3201011402190008',
      nisn: '',
      birthPlace: 'Bekasi',
      birthDate: '2020-08-12',
      gender: 'Laki-laki',
      childOrder: '1',
      totalSiblings: '1',
      familyStatus: 'Anak Kandung',
      addressStreet: 'Jl. Al-Falah No. 7',
      addressRtRw: '003/004',
      addressVillage: 'Sukahati',
      addressDistrict: 'Cibinong',
      addressCity: 'Kabupaten Bogor',
      distanceToSchool: '< 1 km',
      originType: 'Belum Sekolah',
      originSchoolName: '',
    },
    parentsData: {
      father: {
        fullName: 'Arif Budiman',
        nik: '3201010405920003',
        birthYear: '1992',
        education: 'S1',
        occupation: 'Desainer Grafis',
        monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
      },
      mother: {
        fullName: 'Laila Sari',
        nik: '3201014908940002',
        birthYear: '1994',
        education: 'S1',
        occupation: 'Ibu Rumah Tangga',
        monthlyIncome: '< Rp 1.500.000',
      },
      whatsapp: '082144556677',
      email: 'arif.budiman@example.com',
      guardian: { enabled: false, fullName: '', relationship: '', occupation: '', phone: '' },
    },
    documents: {
      birthCertificate: buildSeedDoc(
        'doc-007-akta',
        'Akta Kelahiran',
        'akta_bilal.svg',
        makeDocumentSvgDataUrl('KUTIPAN AKTA KELAHIRAN', 'Kota Bekasi', '#047857', [
          'Nama Anak: BILAL ARSYAD RAMADHAN',
          'NIK: 3201011208200003',
          'Lahir: Bekasi, 12 Agustus 2020',
        ])
      ),
      familyCard: buildSeedDoc(
        'doc-007-kk',
        'Kartu Keluarga',
        'kk_bilal.svg',
        makeDocumentSvgDataUrl('KARTU KELUARGA (KK)', 'No. KK: 3201011402190008', '#0f172a', [
          'Kepala Keluarga: ARIF BUDIMAN',
          'Alamat: Jl. Al-Falah No. 7 Sukahati',
        ])
      ),
      parentIdCard: buildSeedDoc(
        'doc-007-ktp',
        'KTP Orang Tua',
        'ktp_arif.svg',
        makeDocumentSvgDataUrl('KARTU TANDA PENDUDUK (KTP)', 'Kabupaten Bogor', '#0369a1', [
          'NIK: 3201010405920003',
          'Nama: ARIF BUDIMAN',
        ])
      ),
      studentPhoto: buildSeedDoc(
        'doc-007-foto',
        'Pas Foto 3x4',
        'foto_bilal.svg',
        makeStudentPhotoSvgDataUrl('BA', '#b91c1c')
      ),
      tkCertificate: null,
    },
    createdAt: '2026-04-03T07:50:00.000Z',
    updatedAt: '2026-04-03T07:50:00.000Z',
  },
  {
    id: 'reg-008',
    registrationNumber: 'PPDB-MISDS-2026-0008',
    wave: 'Gelombang 2',
    status: 'Cadangan',
    adminNotes: 'Usia per 1 Juli 2026 adalah 5 tahun 7 bulan; masuk daftar pertimbangan kuota Gelombang 2.',
    observationSchedule: 'Sabtu, 6 Juni 2026 · Pukul 09.30 WIB (Ruang Utsman bin Affan)',
    registrationChannel: 'Online',
    studentData: {
      fullName: 'Maryam Yasmin Kamilah',
      nickName: 'Yasmin',
      nik: '3201017011200006',
      kkNumber: '3201012807160017',
      nisn: '',
      birthPlace: 'Bogor',
      birthDate: '2020-11-30',
      gender: 'Perempuan',
      childOrder: '2',
      totalSiblings: '2',
      familyStatus: 'Anak Kandung',
      addressStreet: 'Perum Bumi Cibinong Endah Blok F12',
      addressRtRw: '002/008',
      addressVillage: 'Sukahati',
      addressDistrict: 'Cibinong',
      addressCity: 'Kabupaten Bogor',
      distanceToSchool: '3 - 5 km',
      originType: 'PAUD',
      originSchoolName: 'PAUD Pelangi Muslim',
    },
    parentsData: {
      father: {
        fullName: 'Haryanto Kusuma',
        nik: '3201011703890005',
        birthYear: '1989',
        education: 'S1',
        occupation: 'Akuntan',
        monthlyIncome: 'Rp 5.000.000 - Rp 8.000.000',
      },
      mother: {
        fullName: 'Nurul Hidayati',
        nik: '3201015206910006',
        birthYear: '1991',
        education: 'S1',
        occupation: 'Pegawai Swasta',
        monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
      },
      whatsapp: '081766554433',
      email: 'haryanto.k@example.com',
      guardian: { enabled: false, fullName: '', relationship: '', occupation: '', phone: '' },
    },
    documents: {
      birthCertificate: buildSeedDoc(
        'doc-008-akta',
        'Akta Kelahiran',
        'akta_yasmin.svg',
        makeDocumentSvgDataUrl('KUTIPAN AKTA KELAHIRAN', 'Kabupaten Bogor', '#047857', [
          'Nama Anak: MARYAM YASMIN KAMILAH',
          'NIK: 3201017011200006',
          'Lahir: Bogor, 30 November 2020',
        ])
      ),
      familyCard: buildSeedDoc(
        'doc-008-kk',
        'Kartu Keluarga',
        'kk_yasmin.svg',
        makeDocumentSvgDataUrl('KARTU KELUARGA (KK)', 'No. KK: 3201012807160017', '#0f172a', [
          'Kepala Keluarga: HARYANTO KUSUMA',
          'Alamat: Perum Bumi Cibinong Endah Blok F12',
        ])
      ),
      parentIdCard: buildSeedDoc(
        'doc-008-ktp',
        'KTP Orang Tua',
        'ktp_haryanto.svg',
        makeDocumentSvgDataUrl('KARTU TANDA PENDUDUK (KTP)', 'Kabupaten Bogor', '#0369a1', [
          'NIK: 3201011703890005',
          'Nama: HARYANTO KUSUMA',
        ])
      ),
      studentPhoto: buildSeedDoc(
        'doc-008-foto',
        'Pas Foto 3x4',
        'foto_yasmin.svg',
        makeStudentPhotoSvgDataUrl('MY', '#1d4ed8')
      ),
      tkCertificate: null,
    },
    createdAt: '2026-04-10T15:05:00.000Z',
    updatedAt: '2026-04-12T10:15:00.000Z',
  },
];

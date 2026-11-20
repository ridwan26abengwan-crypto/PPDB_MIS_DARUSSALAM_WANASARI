export type RegistrationStatus =
  | 'Menunggu Verifikasi'
  | 'Berkas Perlu Perbaikan'
  | 'Berkas Terverifikasi'
  | 'Diterima'
  | 'Cadangan'
  | 'Tidak Diterima';

export type WaveType = 'Gelombang 1' | 'Gelombang 2';

export type GenderType = 'Laki-laki' | 'Perempuan';

export type SchoolOriginType = 'TK' | 'RA' | 'PAUD' | 'Belum Sekolah';

export interface StudentData {
  fullName: string;
  nickName: string;
  nik: string; // 16 digits
  kkNumber: string; // 16 digits
  nisn: string; // optional
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  gender: GenderType;
  childOrder: string; // Anak ke-
  totalSiblings: string; // Dari berapa bersaudara
  familyStatus: 'Anak Kandung' | 'Anak Tiri' | 'Anak Angkat';
  addressStreet: string;
  addressRtRw: string;
  addressVillage: string;
  addressDistrict: string;
  addressCity: string;
  distanceToSchool: string; // e.g., "< 1 km", "1 - 3 km", "3 - 5 km", "> 5 km"
  originType: SchoolOriginType;
  originSchoolName: string;
}

export interface ParentInfo {
  fullName: string;
  nik: string; // 16 digits
  birthYear: string;
  education: string;
  occupation: string;
  monthlyIncome: string;
}

export interface GuardianInfo {
  enabled: boolean;
  fullName: string;
  relationship: string;
  occupation: string;
  phone: string;
}

export interface ParentsData {
  father: ParentInfo;
  mother: ParentInfo;
  whatsapp: string;
  email: string;
  guardian: GuardianInfo;
}

export interface UploadedDocument {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string; // Base64 Data URL for preview & storage
  uploadedAt: string;
}

export interface DocumentsData {
  birthCertificate: UploadedDocument | null; // Akta Kelahiran (Wajib)
  familyCard: UploadedDocument | null; // Kartu Keluarga (Wajib)
  parentIdCard: UploadedDocument | null; // KTP Orang Tua (Wajib)
  studentPhoto: UploadedDocument | null; // Pas Foto 3x4 (Wajib)
  tkCertificate: UploadedDocument | null; // Ijazah/SKL TK/RA (Opsional)
}

export interface RegistrationRecord {
  id: string;
  registrationNumber: string; // PPDB-MISDS-2026-0001
  wave: WaveType;
  status: RegistrationStatus;
  adminNotes: string;
  observationSchedule: string;
  registrationChannel: 'Online' | 'Offline';
  studentData: StudentData;
  parentsData: ParentsData;
  documents: DocumentsData;
  createdAt: string;
  updatedAt: string;
}

export interface WaveSchedule {
  label: string;
  registrationDates: string;
  observationDate: string;
  announcementDate: string;
  reRegistrationDates: string;
  benefitNote: string;
}

export interface KopSuratConfig {
  topLabel: string;
  foundationName: string;
  madrasahName: string;
  accreditation: string;
  decreeNumber: string;
  addressLine: string;
  leftLogoDataUrl: string | null;
  rightLogoDataUrl: string | null;
}

export interface PpdbSettings {
  id: number;
  academicYear: string;
  isOpen: boolean;
  quota: number;
  wave1Dates: WaveSchedule;
  wave2Dates: WaveSchedule;
  contactWa: string;
  schoolAddress: string;
  secretariatHours: string;
  reRegistrationFee: string;
  registrationFee: string;
  kopSurat?: KopSuratConfig;
  updatedAt: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface AdminUser {
  username: string;
  name: string;
  role: string;
}

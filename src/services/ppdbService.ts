import { DEFAULT_PPDB_SETTINGS, SEED_REGISTRATIONS } from '../data/seedRegistrations';
import type {
  AdminUser,
  DocumentsData,
  PpdbSettings,
  RegistrationRecord,
  RegistrationStatus,
  WaveType,
} from '../types/ppdb';
import { generateRegistrationNumber } from '../utils/ppdbRules';

const STORAGE_KEYS = {
  REGISTRATIONS: 'mis_darussalam_registrations_v1',
  SETTINGS: 'mis_darussalam_settings_v1',
  ADMIN_TOKEN: 'mis_darussalam_admin_token_v1',
  ADMIN_USER: 'mis_darussalam_admin_user_v1',
  FORM_DRAFT: 'mis_darussalam_ppdb_draft_v1',
};

/**
 * Layer abstraksi data PPDB MIS Darussalam (Client-Side Persistent Store).
 * Berjalan 100% mandiri di Vercel/static hosting menggunakan localStorage
 * dengan data awal dari SEED_REGISTRATIONS.
 */
class PpdbService {
  private getLocalRegistrations(): RegistrationRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      if (!raw) {
        localStorage.setItem(
          STORAGE_KEYS.REGISTRATIONS,
          JSON.stringify(SEED_REGISTRATIONS)
        );
        return [...SEED_REGISTRATIONS];
      }
      const parsed = JSON.parse(raw) as RegistrationRecord[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(
          STORAGE_KEYS.REGISTRATIONS,
          JSON.stringify(SEED_REGISTRATIONS)
        );
        return [...SEED_REGISTRATIONS];
      }
      return parsed;
    } catch {
      return [...SEED_REGISTRATIONS];
    }
  }

  private setLocalRegistrations(records: RegistrationRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(records));
    } catch {
      // Abaikan jika melebihi kuota localStorage akibat lampiran gambar besar
    }
  }

  private getLocalSettings(): PpdbSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) {
        localStorage.setItem(
          STORAGE_KEYS.SETTINGS,
          JSON.stringify(DEFAULT_PPDB_SETTINGS)
        );
        return { ...DEFAULT_PPDB_SETTINGS };
      }
      return JSON.parse(raw) as PpdbSettings;
    } catch {
      return { ...DEFAULT_PPDB_SETTINGS };
    }
  }

  private setLocalSettings(settings: PpdbSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Abaikan error storage
    }
  }

  getAdminSession(): { token: string; user: AdminUser } | null {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      const userRaw = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      if (!token || !userRaw) return null;
      return { token, user: JSON.parse(userRaw) as AdminUser };
    } catch {
      return null;
    }
  }

  clearAdminSession(): void {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
  }

  async loginAdmin(
    username: string,
    password: string
  ): Promise<{ token: string; user: AdminUser }> {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      throw new Error('Username/Email dan password wajib diisi.');
    }

    // Validasi akun panitia (menerima kredensial demo maupun akun standar panitia)
    const isValidDemo =
      (cleanUser === 'admin' ||
        cleanUser === 'admin@misdarussalam.sch.id' ||
        cleanUser === 'panitia@misdarussalam.sch.id') &&
      (cleanPass === 'admin123' ||
        cleanPass === 'darussalam2026' ||
        cleanPass === 'ppdb2026');

    if (!isValidDemo) {
      throw new Error(
        'Username atau password salah. Gunakan tombol "Isi Akun Demo Admin" untuk masuk.'
      );
    }

    const user: AdminUser = {
      id: 'admin-1',
      username: cleanUser,
      name: 'Panitia PPDB MIS Darussalam',
      role: 'admin',
    };
    const token = `local-token-${Date.now()}`;

    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));

    return { token, user };
  }

  async getPublicSummary(): Promise<{ totalApplicants: number; acceptedCount: number }> {
    const local = this.getLocalRegistrations();
    return {
      totalApplicants: local.length,
      acceptedCount: local.filter((r) => r.status === 'Diterima').length,
    };
  }

  async getSettings(): Promise<PpdbSettings> {
    return this.getLocalSettings();
  }

  async updateSettings(patch: Partial<PpdbSettings>): Promise<PpdbSettings> {
    const current = this.getLocalSettings();
    const updated: PpdbSettings = {
      ...current,
      ...patch,
    };
    this.setLocalSettings(updated);
    return updated;
  }

  async getAllRegistrations(): Promise<RegistrationRecord[]> {
    return this.getLocalRegistrations();
  }

  async checkStatus(query: string, birthDate: string): Promise<RegistrationRecord> {
    const cleanQuery = query.trim().toLowerCase();
    const cleanBirth = birthDate.trim();

    if (!cleanQuery) {
      throw new Error('Masukkan Nomor Pendaftaran atau NIK calon siswa.');
    }

    const records = this.getLocalRegistrations();
    const found = records.find((r) => {
      const matchReg = r.registrationNumber.toLowerCase() === cleanQuery;
      const matchNik = r.studentData.nik.trim() === cleanQuery;
      const matchBirth = !cleanBirth || r.studentData.birthDate === cleanBirth;
      return (matchReg || matchNik) && matchBirth;
    });

    if (!found) {
      throw new Error(
        'Data pendaftaran tidak ditemukan. Periksa kembali Nomor Pendaftaran/NIK dan Tanggal Lahir.'
      );
    }

    return found;
  }

  async submitRegistration(input: {
    wave: WaveType;
    registrationChannel?: 'Online' | 'Offline';
    status?: RegistrationStatus;
    studentData: RegistrationRecord['studentData'];
    parentsData: RegistrationRecord['parentsData'];
    documents: DocumentsData;
  }): Promise<RegistrationRecord> {
    const existing = this.getLocalRegistrations();
    const duplicate = existing.find((r) => r.studentData.nik === input.studentData.nik);

    if (duplicate) {
      throw new Error(
        `NIK ${input.studentData.nik} sudah terdaftar dengan nomor ${duplicate.registrationNumber}.`
      );
    }

    const now = new Date().toISOString();
    const regNo = generateRegistrationNumber(
      existing.map((r) => r.registrationNumber),
      2026
    );

    const created: RegistrationRecord = {
      id: `reg-${Date.now()}`,
      registrationNumber: regNo,
      wave: input.wave,
      status: input.status || 'Menunggu Verifikasi',
      adminNotes: '',
      observationSchedule: '',
      registrationChannel: input.registrationChannel || 'Online',
      studentData: input.studentData,
      parentsData: input.parentsData,
      documents: input.documents,
      createdAt: now,
      updatedAt: now,
    };

    this.setLocalRegistrations([created, ...existing]);
    return created;
  }

  async reuploadDocuments(
    id: string,
    birthDate: string,
    documents: Partial<DocumentsData>
  ): Promise<RegistrationRecord> {
    const existing = this.getLocalRegistrations();
    const target = existing.find((r) => r.id === id);

    if (!target) {
      throw new Error('Data pendaftaran tidak ditemukan.');
    }

    if (birthDate && target.studentData.birthDate !== birthDate.trim()) {
      throw new Error('Tanggal lahir tidak sesuai dengan data pendaftaran.');
    }

    const updated: RegistrationRecord = {
      ...target,
      documents: {
        ...target.documents,
        ...documents,
      },
      status: 'Menunggu Verifikasi',
      updatedAt: new Date().toISOString(),
    };

    this.setLocalRegistrations(existing.map((r) => (r.id === id ? updated : r)));
    return updated;
  }

  async updateRegistration(
    id: string,
    patch: Partial<RegistrationRecord>
  ): Promise<RegistrationRecord> {
    const existing = this.getLocalRegistrations();
    const target = existing.find((r) => r.id === id);

    if (!target) {
      throw new Error('Data pendaftar tidak ditemukan.');
    }

    const updated: RegistrationRecord = {
      ...target,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.setLocalRegistrations(existing.map((r) => (r.id === id ? updated : r)));
    return updated;
  }

  async deleteRegistration(id: string): Promise<void> {
    const existing = this.getLocalRegistrations();
    this.setLocalRegistrations(existing.filter((r) => r.id !== id));
  }

  saveDraft(draft: unknown): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FORM_DRAFT, JSON.stringify(draft));
    } catch {
      // Abaikan error kuota draft untuk preview base64 besar
    }
  }

  loadDraft<T>(): T | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FORM_DRAFT);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  clearDraft(): void {
    localStorage.removeItem(STORAGE_KEYS.FORM_DRAFT);
  }
}

export const ppdbService = new PpdbService();

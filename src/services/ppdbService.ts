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
 * Layer abstraksi data PPDB MIS Darussalam.
 * - Menggunakan REST API Express (/api/*) + sinkronisasi localStorage yang sudah
 *   terisi 8 data dummy realistis.
 * - Arsitektur siap disambungkan langsung ke Supabase / PostgreSQL (lihat schema.sql).
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
      // Ignore quota exceeded if user uploads very large files; primary persistence is server store
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
      // Ignore storage error
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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal masuk ke dashboard panitia.');
    }
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(data.user));
    return data as { token: string; user: AdminUser };
  }

  async getPublicSummary(): Promise<{ totalApplicants: number; acceptedCount: number }> {
    try {
      const res = await fetch('/api/summary');
      if (res.ok) {
        return (await res.json()) as { totalApplicants: number; acceptedCount: number };
      }
    } catch {
      // Fallback to localStorage cache
    }
    const local = this.getLocalRegistrations();
    return {
      totalApplicants: local.length,
      acceptedCount: local.filter((r) => r.status === 'Diterima').length,
    };
  }

  async getSettings(): Promise<PpdbSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = (await res.json()) as PpdbSettings;
        this.setLocalSettings(data);
        return data;
      }
    } catch {
      // Fallback to localStorage cache
    }
    return this.getLocalSettings();
  }

  async updateSettings(patch: Partial<PpdbSettings>): Promise<PpdbSettings> {
    const session = this.getAdminSession();
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyimpan pengaturan PPDB.');
    }
    this.setLocalSettings(data as PpdbSettings);
    return data as PpdbSettings;
  }

  async getAllRegistrations(): Promise<RegistrationRecord[]> {
    const session = this.getAdminSession();
    try {
      const res = await fetch('/api/registrations', {
        headers: session ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (res.ok) {
        const data = (await res.json()) as RegistrationRecord[];
        this.setLocalRegistrations(data);
        return data;
      }
    } catch {
      // Fallback to localStorage cache
    }
    return this.getLocalRegistrations();
  }

  async checkStatus(query: string, birthDate: string): Promise<RegistrationRecord> {
    const params = new URLSearchParams({
      query: query.trim(),
      birthDate: birthDate.trim(),
    });
    const res = await fetch(`/api/registrations/check?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Data pendaftaran tidak ditemukan.');
    }
    return data as RegistrationRecord;
  }

  async submitRegistration(input: {
    wave: WaveType;
    registrationChannel?: 'Online' | 'Offline';
    status?: RegistrationStatus;
    studentData: RegistrationRecord['studentData'];
    parentsData: RegistrationRecord['parentsData'];
    documents: DocumentsData;
  }): Promise<RegistrationRecord> {
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim formulir pendaftaran.');
      }
      const created = data as RegistrationRecord;
      const existing = this.getLocalRegistrations();
      this.setLocalRegistrations([created, ...existing.filter((r) => r.id !== created.id)]);
      return created;
    } catch (err) {
      if (err instanceof Error && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      // Offline / localStorage fallback
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
  }

  async reuploadDocuments(
    id: string,
    birthDate: string,
    documents: Partial<DocumentsData>
  ): Promise<RegistrationRecord> {
    const res = await fetch(`/api/registrations/${encodeURIComponent(id)}/documents`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate, documents }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal mengunggah ulang berkas.');
    }
    const updated = data as RegistrationRecord;
    const existing = this.getLocalRegistrations();
    this.setLocalRegistrations(existing.map((r) => (r.id === updated.id ? updated : r)));
    return updated;
  }

  async updateRegistration(
    id: string,
    patch: Partial<RegistrationRecord>
  ): Promise<RegistrationRecord> {
    const session = this.getAdminSession();
    const res = await fetch(`/api/registrations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal memperbarui data pendaftar.');
    }
    const updated = data as RegistrationRecord;
    const existing = this.getLocalRegistrations();
    this.setLocalRegistrations(existing.map((r) => (r.id === updated.id ? updated : r)));
    return updated;
  }

  async deleteRegistration(id: string): Promise<void> {
    const session = this.getAdminSession();
    const res = await fetch(`/api/registrations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: session ? { Authorization: `Bearer ${session.token}` } : {},
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Gagal menghapus data pendaftar.');
    }
    const existing = this.getLocalRegistrations();
    this.setLocalRegistrations(existing.filter((r) => r.id !== id));
  }

  saveDraft(draft: unknown): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FORM_DRAFT, JSON.stringify(draft));
    } catch {
      // Ignore draft quota error for large base64 previews
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

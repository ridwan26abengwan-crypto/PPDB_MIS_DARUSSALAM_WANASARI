import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_PPDB_SETTINGS, SEED_REGISTRATIONS } from './src/data/seedRegistrations';
import type { PpdbSettings, RegistrationRecord } from './src/types/ppdb';
import {
  DEFAULT_KOP_SURAT_CONFIG,
  generateRegistrationNumber,
  validateAdminStudentEdit,
} from './src/utils/ppdbRules';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'ppdb-store.json');

const ADMIN_USERNAME = process.env.PPDB_ADMIN_USERNAME || 'MIS DARUSSALAM';
const ADMIN_PASSWORD = process.env.PPDB_ADMIN_PASSWORD || 'Misdarussalam@26';
const SESSION_SECRET = process.env.PPDB_SESSION_SECRET || 'mis-darussalam-ppdb-2026-secret';

interface StoreShape {
  registrations: RegistrationRecord[];
  settings: PpdbSettings;
}

function ensureStore(): StoreShape {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const initial: StoreShape = {
      registrations: SEED_REGISTRATIONS,
      settings: DEFAULT_PPDB_SETTINGS,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as StoreShape;
    if (!Array.isArray(parsed.registrations) || !parsed.settings) {
      throw new Error('Invalid store structure');
    }
    return parsed;
  } catch {
    const fallback: StoreShape = {
      registrations: SEED_REGISTRATIONS,
      settings: DEFAULT_PPDB_SETTINGS,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function writeStore(store: StoreShape): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function signToken(username: string): string {
  const payload = Buffer.from(JSON.stringify({ username, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string | undefined): { username: string } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      username: string;
    };
    return parsed;
  } catch {
    return null;
  }
}

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const verified = verifyToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Sesi panitia tidak valid atau telah berakhir.' });
    return;
  }
  next();
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'ppdb-mis-darussalam' });
  });

  app.get('/api/summary', (_req, res) => {
    const store = ensureStore();
    const totalApplicants = store.registrations.length;
    const acceptedCount = store.registrations.filter((r) => r.status === 'Diterima').length;
    res.json({ totalApplicants, acceptedCount });
  });

  app.get('/api/settings', (_req, res) => {
    const store = ensureStore();
    res.json({
      ...DEFAULT_PPDB_SETTINGS,
      ...store.settings,
      kopSurat: {
        ...DEFAULT_KOP_SURAT_CONFIG,
        ...(store.settings.kopSurat || {}),
      },
    });
  });

  app.put('/api/settings', requireAdmin, (req, res) => {
    const store = ensureStore();
    const body = req.body as Partial<PpdbSettings>;
    const mergedKop = {
      ...DEFAULT_KOP_SURAT_CONFIG,
      ...(store.settings.kopSurat || {}),
      ...(body.kopSurat || {}),
    };
    const updated: PpdbSettings = {
      ...DEFAULT_PPDB_SETTINGS,
      ...store.settings,
      ...body,
      kopSurat: mergedKop,
      id: 1,
      updatedAt: new Date().toISOString(),
    };
    store.settings = updated;
    writeStore(store);
    res.json(updated);
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };
    const submittedUser = String(username ?? email ?? '').trim().toUpperCase();
    if (
      submittedUser === ADMIN_USERNAME.trim().toUpperCase() &&
      String(password ?? '') === ADMIN_PASSWORD
    ) {
      const token = signToken(ADMIN_USERNAME);
      res.json({
        token,
        user: {
          username: ADMIN_USERNAME,
          name: 'Panitia PPDB MIS Darussalam',
          role: 'Ketua Panitia',
        },
      });
      return;
    }
    res.status(401).json({ error: 'Username atau kata sandi panitia tidak sesuai.' });
  });

  app.get('/api/registrations', requireAdmin, (_req, res) => {
    const store = ensureStore();
    const sorted = [...store.registrations].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    res.json(sorted);
  });

  app.get('/api/registrations/check', (req, res) => {
    const query = String(req.query.query ?? '').trim().toUpperCase();
    const birthDate = String(req.query.birthDate ?? '').trim();

    if (!query || !birthDate) {
      res.status(400).json({
        error: 'Nomor Pendaftaran / NIK dan Tanggal Lahir wajib diisi.',
      });
      return;
    }

    const store = ensureStore();
    const found = store.registrations.find(
      (r) =>
        (r.registrationNumber.toUpperCase() === query || r.studentData.nik === query) &&
        r.studentData.birthDate === birthDate
    );

    if (!found) {
      res.status(404).json({
        error:
          'Data pendaftaran tidak ditemukan. Pastikan Nomor Pendaftaran/NIK dan Tanggal Lahir sudah benar.',
      });
      return;
    }

    res.json(found);
  });

  app.post('/api/registrations', (req, res) => {
    const store = ensureStore();
    const payload = req.body as Partial<RegistrationRecord>;

    if (!payload.studentData?.fullName || !payload.studentData?.nik || !payload.parentsData?.whatsapp) {
      res.status(400).json({ error: 'Data wajib calon peserta didik belum lengkap.' });
      return;
    }

    const existingDuplicate = store.registrations.find(
      (r) => r.studentData.nik === payload.studentData?.nik
    );
    if (existingDuplicate) {
      res.status(409).json({
        error: `NIK ${payload.studentData.nik} sudah terdaftar dengan nomor ${existingDuplicate.registrationNumber}.`,
      });
      return;
    }

    const regNumber = generateRegistrationNumber(
      store.registrations.map((r) => r.registrationNumber),
      2026
    );
    const now = new Date().toISOString();
    const newRecord: RegistrationRecord = {
      id: `reg-${crypto.randomUUID().slice(0, 8)}`,
      registrationNumber: regNumber,
      wave: payload.wave || 'Gelombang 1',
      status: payload.status || 'Menunggu Verifikasi',
      adminNotes: payload.adminNotes || '',
      observationSchedule: payload.observationSchedule || '',
      registrationChannel: payload.registrationChannel || 'Online',
      studentData: payload.studentData,
      parentsData: payload.parentsData,
      documents: payload.documents || {
        birthCertificate: null,
        familyCard: null,
        parentIdCard: null,
        studentPhoto: null,
        tkCertificate: null,
      },
      createdAt: now,
      updatedAt: now,
    };

    store.registrations.unshift(newRecord);
    writeStore(store);
    res.status(201).json(newRecord);
  });

  app.patch('/api/registrations/:id/documents', (req, res) => {
    const { id } = req.params;
    const { birthDate, documents } = req.body as {
      birthDate?: string;
      documents?: Partial<RegistrationRecord['documents']>;
    };
    const store = ensureStore();
    const index = store.registrations.findIndex((r) => r.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Pendaftar tidak ditemukan.' });
      return;
    }

    const current = store.registrations[index];
    if (current.studentData.birthDate !== birthDate) {
      res.status(403).json({ error: 'Verifikasi tanggal lahir tidak cocok.' });
      return;
    }

    const updated: RegistrationRecord = {
      ...current,
      status: 'Menunggu Verifikasi',
      adminNotes: `Perbaikan berkas telah dikirim ulang oleh orang tua pada ${new Date().toLocaleDateString('id-ID')}. Menunggu verifikasi ulang panitia.`,
      documents: {
        ...current.documents,
        ...documents,
      },
      updatedAt: new Date().toISOString(),
    };

    store.registrations[index] = updated;
    writeStore(store);
    res.json(updated);
  });

  app.patch('/api/registrations/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const store = ensureStore();
    const index = store.registrations.findIndex((r) => r.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Pendaftar tidak ditemukan.' });
      return;
    }

    const current = store.registrations[index];
    const body = req.body as Partial<RegistrationRecord>;
    const updated: RegistrationRecord = {
      ...current,
      ...body,
      id: current.id,
      registrationNumber: current.registrationNumber,
      studentData: body.studentData ? { ...current.studentData, ...body.studentData } : current.studentData,
      parentsData: body.parentsData ? { ...current.parentsData, ...body.parentsData } : current.parentsData,
      documents: body.documents ? { ...current.documents, ...body.documents } : current.documents,
      updatedAt: new Date().toISOString(),
    };

    const validation = validateAdminStudentEdit({
      studentData: updated.studentData,
      parentsData: updated.parentsData,
    });
    if (!validation.isValid) {
      res.status(400).json({
        error: Object.values(validation.errors)[0] || 'Data pendaftaran tidak valid.',
        fieldErrors: validation.errors,
      });
      return;
    }

    const duplicateNik = store.registrations.find(
      (r) => r.id !== current.id && r.studentData.nik === updated.studentData.nik
    );
    if (duplicateNik) {
      res.status(409).json({
        error: `NIK ${updated.studentData.nik} sudah digunakan oleh pendaftar ${duplicateNik.registrationNumber}.`,
      });
      return;
    }

    store.registrations[index] = updated;
    writeStore(store);
    res.json(updated);
  });

  app.delete('/api/registrations/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const store = ensureStore();
    const next = store.registrations.filter((r) => r.id !== id);
    if (next.length === store.registrations.length) {
      res.status(404).json({ error: 'Pendaftar tidak ditemukan.' });
      return;
    }
    store.registrations = next;
    writeStore(store);
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server PPDB MIS Darussalam berjalan di http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});

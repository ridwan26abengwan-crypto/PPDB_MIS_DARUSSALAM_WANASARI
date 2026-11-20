-- =============================================================================
-- Skema Database Sistem PPDB MIS Darussalam (PostgreSQL / Supabase Ready)
-- =============================================================================
-- Jalankan skema ini pada Supabase SQL Editor atau PostgreSQL 15+ untuk
-- mengaktifkan persistensi cloud penuh.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum status pendaftaran
DO $$ BEGIN
  CREATE TYPE ppdb_registration_status AS ENUM (
    'Menunggu Verifikasi',
    'Berkas Perlu Perbaikan',
    'Berkas Terverifikasi',
    'Diterima',
    'Cadangan',
    'Tidak Diterima'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabel utama pendaftar PPDB
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(32) NOT NULL UNIQUE,
  wave VARCHAR(32) NOT NULL DEFAULT 'Gelombang 1',
  status ppdb_registration_status NOT NULL DEFAULT 'Menunggu Verifikasi',
  admin_notes TEXT DEFAULT '',
  observation_schedule VARCHAR(160) DEFAULT '',
  registration_channel VARCHAR(24) NOT NULL DEFAULT 'Online', -- 'Online' | 'Offline'
  student_data JSONB NOT NULL,
  parents_data JSONB NOT NULL,
  documents JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks untuk pencarian cepat pada Cek Status & Dashboard Panitia
CREATE INDEX IF NOT EXISTS idx_registrations_number ON registrations (registration_number);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_student_nik ON registrations ((student_data->>'nik'));
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at DESC);

-- Tabel pengaturan PPDB & CMS Konten
CREATE TABLE IF NOT EXISTS ppdb_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  academic_year VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  quota INTEGER NOT NULL DEFAULT 60,
  wave_1_dates JSONB NOT NULL,
  wave_2_dates JSONB NOT NULL,
  contact_wa VARCHAR(32) NOT NULL DEFAULT '081234567890',
  school_address TEXT NOT NULL,
  secretariat_hours VARCHAR(120) NOT NULL DEFAULT 'Senin - Sabtu, 07.30 - 14.00 WIB',
  re_registration_fee VARCHAR(120) NOT NULL DEFAULT 'Rp 1.450.000 (Seragam, Buku Paket & Kegiatan 1 Tahun)',
  registration_fee VARCHAR(80) NOT NULL DEFAULT 'Gratis (Bebas Biaya Formulir)',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger pembaruan otomatis kolom updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registrations_updated_at ON registrations;
CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ppdb_settings_updated_at ON ppdb_settings;
CREATE TRIGGER trg_ppdb_settings_updated_at
  BEFORE UPDATE ON ppdb_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

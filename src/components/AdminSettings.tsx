import React, { useState } from 'react';
import { ImagePlus, Loader2, RotateCcw, Save } from 'lucide-react';
import { ppdbService } from '../services/ppdbService';
import type { KopSuratConfig, PpdbSettings } from '../types/ppdb';
import {
  DEFAULT_KOP_SURAT_CONFIG,
  resolveKopSuratConfig,
  validateKopSuratLogoFile,
} from '../utils/ppdbRules';
import { OfficialKopSurat, YayasanDaaruttaqwaEmblem } from './OfficialKopSurat';

interface AdminSettingsProps {
  settings: PpdbSettings;
  onSaved: (updated: PpdbSettings) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onSaved,
  onToast,
}) => {
  const [form, setForm] = useState<PpdbSettings>(settings);
  const [kopForm, setKopForm] = useState<KopSuratConfig>(() =>
    resolveKopSuratConfig(settings.kopSurat)
  );
  const [isSaving, setIsSaving] = useState(false);

  const persistSettings = async (nextSettings: PpdbSettings, successTitle: string) => {
    setIsSaving(true);
    try {
      const updated = await ppdbService.updateSettings(nextSettings);
      setForm(updated);
      setKopForm(resolveKopSuratConfig(updated.kopSurat));
      onSaved(updated);
      onToast(
        'success',
        successTitle,
        'Perubahan langsung diterapkan pada dokumen cetak & halaman publik.'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.';
      onToast('error', 'Gagal Menyimpan', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistSettings({ ...form, kopSurat: kopForm }, 'Pengaturan PPDB Disimpan');
  };

  const handleSaveKopOnly = async () => {
    await persistSettings({ ...form, kopSurat: kopForm }, 'Kop Surat & Logo Disimpan');
  };

  const handleLogoUpload = (
    side: 'left' | 'right',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validationError = validateKopSuratLogoFile({ type: file.type, size: file.size });
    if (validationError) {
      onToast('error', 'File Logo Tidak Valid', validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) {
        onToast('error', 'Gagal Membaca Gambar', 'Silakan pilih file logo lainnya.');
        return;
      }
      setKopForm((prev) => ({
        ...prev,
        ...(side === 'left' ? { leftLogoDataUrl: result } : { rightLogoDataUrl: result }),
      }));
      onToast(
        'info',
        side === 'left' ? 'Logo Kiri Dimuat' : 'Logo Kanan Dimuat',
        'Klik "Simpan Kop Surat" untuk menyimpan perubahan ke server.'
      );
    };
    reader.onerror = () => {
      onToast('error', 'Gagal Membaca Gambar', 'Terjadi kesalahan saat membaca file logo.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetKopDefault = () => {
    setKopForm({ ...DEFAULT_KOP_SURAT_CONFIG });
    onToast(
      'info',
      'Kop Surat Direset ke Default',
      'Klik "Simpan Kop Surat" jika ingin menyimpan pengaturan default ini.'
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kop Surat Resmi & Upload Logo */}
      <section
        id="kop-surat-editor"
        className="rounded-xl border border-emerald-200 bg-white p-6 shadow-xs"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Dokumen Resmi Madrasah
            </p>
            <h2 className="mt-0.5 font-display text-base font-bold text-slate-900">
              Edit Teks &amp; Upload Logo Kop Surat
            </h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Kop surat ini digunakan otomatis pada cetak <strong>Surat Pernyataan Diterima</strong> dan{' '}
              <strong>Laporan Rekapitulasi Pendaftar</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetKopDefault}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Default</span>
            </button>
            <button
              type="button"
              onClick={handleSaveKopOnly}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 disabled:bg-slate-400"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Simpan Kop Surat</span>
            </button>
          </div>
        </div>

        {/* Pratinjau Langsung Kop Surat */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pratinjau Langsung Kop Surat Resmi
          </p>
          <div className="rounded-lg border border-slate-300 bg-white p-4 sm:p-6">
            <OfficialKopSurat config={kopForm} testId="kop-surat-preview" />
          </div>
        </div>

        {/* Upload Logo Kiri & Logo Kanan */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-white p-1">
                <img
                  src={kopForm.leftLogoDataUrl || '/assets/aistudio/images_f21cb217.png'}
                  alt="Preview Logo Kiri Kop"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Logo Kiri Kop Surat</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {kopForm.leftLogoDataUrl ? 'Menggunakan logo kustom' : 'Default: Logo Kemenag'}
                </p>
                <p className="text-[10px] text-slate-400">PNG / JPG / SVG · Maks 2 MB</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <label
                htmlFor="kop-logo-left"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-700 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                <span>Upload Logo Kiri</span>
                <input
                  id="kop-logo-left"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleLogoUpload('left', e)}
                  className="sr-only"
                />
              </label>
              {kopForm.leftLogoDataUrl && (
                <button
                  type="button"
                  onClick={() => setKopForm((prev) => ({ ...prev, leftLogoDataUrl: null }))}
                  className="text-[11px] font-semibold text-red-700 hover:underline"
                >
                  Pakai Default
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-white p-1">
                {kopForm.rightLogoDataUrl ? (
                  <img
                    src={kopForm.rightLogoDataUrl}
                    alt="Preview Logo Kanan Kop"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <YayasanDaaruttaqwaEmblem className="h-14 w-14" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Logo Kanan Kop Surat</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {kopForm.rightLogoDataUrl
                    ? 'Menggunakan logo kustom'
                    : 'Default: Yayasan Daaruttaqwa'}
                </p>
                <p className="text-[10px] text-slate-400">PNG / JPG / SVG · Maks 2 MB</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <label
                htmlFor="kop-logo-right"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-700 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                <span>Upload Logo Kanan</span>
                <input
                  id="kop-logo-right"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleLogoUpload('right', e)}
                  className="sr-only"
                />
              </label>
              {kopForm.rightLogoDataUrl && (
                <button
                  type="button"
                  onClick={() => setKopForm((prev) => ({ ...prev, rightLogoDataUrl: null }))}
                  className="text-[11px] font-semibold text-red-700 hover:underline"
                >
                  Pakai Default
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Edit Teks Kop Surat */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="kop-top-label" className="block text-xs font-semibold text-slate-700">
              Judul / Label Atas Kop
            </label>
            <input
              id="kop-top-label"
              type="text"
              value={kopForm.topLabel}
              onChange={(e) => setKopForm({ ...kopForm, topLabel: e.target.value })}
              placeholder="Contoh: LEMBAR PENETAPAN"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="kop-foundation" className="block text-xs font-semibold text-slate-700">
              Nama Yayasan / Naungan
            </label>
            <input
              id="kop-foundation"
              type="text"
              value={kopForm.foundationName}
              onChange={(e) => setKopForm({ ...kopForm, foundationName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="kop-madrasah" className="block text-xs font-semibold text-slate-700">
              Nama Madrasah / Lembaga
            </label>
            <input
              id="kop-madrasah"
              type="text"
              value={kopForm.madrasahName}
              onChange={(e) => setKopForm({ ...kopForm, madrasahName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
            />
          </div>

          <div>
            <label htmlFor="kop-accreditation" className="block text-xs font-semibold text-slate-700">
              Status Akreditasi
            </label>
            <input
              id="kop-accreditation"
              type="text"
              value={kopForm.accreditation}
              onChange={(e) => setKopForm({ ...kopForm, accreditation: e.target.value })}
              placeholder="Contoh: TERAKREDITASI : B"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="kop-decree" className="block text-xs font-semibold text-slate-700">
              Nomor SK Akreditasi / Pendirian
            </label>
            <input
              id="kop-decree"
              type="text"
              value={kopForm.decreeNumber}
              onChange={(e) => setKopForm({ ...kopForm, decreeNumber: e.target.value })}
              placeholder="Contoh: Nomor : 031/BAN-PDM/SK/2026"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="kop-address" className="block text-xs font-semibold text-slate-700">
              Alamat &amp; Telepon Baris Kop Surat
            </label>
            <input
              id="kop-address"
              type="text"
              value={kopForm.addressLine}
              onChange={(e) => setKopForm({ ...kopForm, addressLine: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Status & Kuota */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-bold text-slate-900">
          Status Pendaftaran &amp; Kuota Siswa
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-1">
            <div>
              <p className="text-sm font-semibold text-slate-900">Status Portal PPDB</p>
              <p className="text-xs text-slate-500">
                {form.isOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isOpen}
              aria-label="Toggle buka atau tutup pendaftaran"
              onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                form.isOpen ? 'bg-emerald-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  form.isOpen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label htmlFor="set-year" className="block text-xs font-semibold text-slate-700">
              Tahun Ajaran
            </label>
            <input
              id="set-year"
              type="text"
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-quota" className="block text-xs font-semibold text-slate-700">
              Target Kuota Penerimaan (Kursi)
            </label>
            <input
              id="set-quota"
              type="number"
              min={1}
              max={500}
              value={form.quota}
              onChange={(e) =>
                setForm({ ...form, quota: Math.max(1, Number(e.target.value) || 60) })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Jadwal Gelombang 1 & 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <h3 className="font-display text-sm font-bold text-emerald-900">
            Jadwal Gelombang 1 (Early Bird)
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Tanggal Pendaftaran</label>
            <input
              type="text"
              value={form.wave1Dates.registrationDates}
              onChange={(e) =>
                setForm({
                  ...form,
                  wave1Dates: { ...form.wave1Dates, registrationDates: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Jadwal Observasi</label>
            <input
              type="text"
              value={form.wave1Dates.observationDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  wave1Dates: { ...form.wave1Dates, observationDate: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Tanggal Pengumuman</label>
            <input
              type="text"
              value={form.wave1Dates.announcementDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  wave1Dates: { ...form.wave1Dates, announcementDate: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Jadwal Daftar Ulang</label>
            <input
              type="text"
              value={form.wave1Dates.reRegistrationDates}
              onChange={(e) =>
                setForm({
                  ...form,
                  wave1Dates: { ...form.wave1Dates, reRegistrationDates: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <h3 className="font-display text-sm font-bold text-slate-900">
            Jadwal Gelombang 2 (Reguler)
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Tanggal Pendaftaran</label>
            <input
              type="text"
              value={form.wave2Dates.registrationDates}
              onChange={(e) =>
                setForm({
                  ...form,
                  wave2Dates: { ...form.wave2Dates, registrationDates: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Jadwal Observasi</label>
            <input
              type="text"
              value={form.wave2Dates.observationDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  wave2Dates: { ...form.wave2Dates, observationDate: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Tanggal Pengumuman</label>
            <input
              type="text"
              value={form.wave2Dates.announcementDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  wave2Dates: { ...form.wave2Dates, announcementDate: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Jadwal Daftar Ulang</label>
            <input
              type="text"
              value={form.wave2Dates.reRegistrationDates}
              onChange={(e) =>
                setForm({
                  ...form,
                  wave2Dates: { ...form.wave2Dates, reRegistrationDates: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Kontak & Biaya */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-bold text-slate-900">
          Kontak Panitia, Alamat &amp; Informasi Biaya
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="set-wa" className="block text-xs font-semibold text-slate-700">
              Nomor WhatsApp Panitia PPDB
            </label>
            <input
              id="set-wa"
              type="text"
              value={form.contactWa}
              onChange={(e) => setForm({ ...form, contactWa: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>
          <div>
            <label htmlFor="set-hours" className="block text-xs font-semibold text-slate-700">
              Jam Layanan Sekretariat
            </label>
            <input
              id="set-hours"
              type="text"
              value={form.secretariatHours}
              onChange={(e) => setForm({ ...form, secretariatHours: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="set-addr" className="block text-xs font-semibold text-slate-700">
              Alamat Lengkap Madrasah
            </label>
            <input
              id="set-addr"
              type="text"
              value={form.schoolAddress}
              onChange={(e) => setForm({ ...form, schoolAddress: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="set-reg-fee" className="block text-xs font-semibold text-slate-700">
              Keterangan Biaya Formulir
            </label>
            <input
              id="set-reg-fee"
              type="text"
              value={form.registrationFee}
              onChange={(e) => setForm({ ...form, registrationFee: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="set-rereg-fee" className="block text-xs font-semibold text-slate-700">
              Keterangan Biaya Daftar Ulang
            </label>
            <input
              id="set-rereg-fee"
              type="text"
              value={form.reRegistrationFee}
              onChange={(e) => setForm({ ...form, reRegistrationFee: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:bg-slate-400"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Simpan Pengaturan PPDB</span>
          </button>
        </div>
      </div>
    </form>
  );
};

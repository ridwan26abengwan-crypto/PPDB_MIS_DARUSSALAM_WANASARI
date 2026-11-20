import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  FileText,
  Loader2,
  MessageCircle,
  Printer,
  RotateCw,
  Save,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ppdbService } from '../services/ppdbService';
import type {
  GenderType,
  ParentsData,
  PpdbSettings,
  RegistrationRecord,
  RegistrationStatus,
  SchoolOriginType,
  StudentData,
  UploadedDocument,
  WaveType,
} from '../types/ppdb';
import {
  type AdminEditValidationErrors,
  buildWhatsAppStatusMessage,
  normalizeWhatsappForLink,
  STATUS_META,
  validateAdminStudentEdit,
} from '../utils/ppdbRules';

interface AdminVerificationModalProps {
  record: RegistrationRecord;
  settings: PpdbSettings;
  initialEditMode?: boolean;
  onClose: () => void;
  onUpdated: (updated: RegistrationRecord) => void;
  onDeleted?: (id: string) => void;
  onPrintAcceptanceLetter?: (record: RegistrationRecord) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

const ALL_STATUSES: RegistrationStatus[] = [
  'Menunggu Verifikasi',
  'Berkas Perlu Perbaikan',
  'Berkas Terverifikasi',
  'Diterima',
  'Cadangan',
  'Tidak Diterima',
];

export const AdminVerificationModal: React.FC<AdminVerificationModalProps> = ({
  record,
  settings,
  initialEditMode = false,
  onClose,
  onUpdated,
  onDeleted,
  onPrintAcceptanceLetter,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'biodata' | 'documents'>('biodata');
  const [status, setStatus] = useState<RegistrationStatus>(record.status);
  const [adminNotes, setAdminNotes] = useState(record.adminNotes || '');
  const [observationSchedule, setObservationSchedule] = useState(
    record.observationSchedule || ''
  );

  // Full biodata edit state
  const [isEditingBiodata, setIsEditingBiodata] = useState(initialEditMode);
  const [editWave, setEditWave] = useState<WaveType>(record.wave);
  const [editStudent, setEditStudent] = useState<StudentData>({ ...record.studentData });
  const [editParents, setEditParents] = useState<ParentsData>({
    ...record.parentsData,
    father: { ...record.parentsData.father },
    mother: { ...record.parentsData.mother },
    guardian: { ...record.parentsData.guardian },
  });

  // Document viewer zoom & rotation state
  const docList: Array<{ key: string; label: string; doc: UploadedDocument | null }> = [
    { key: 'birthCertificate', label: 'Akta Kelahiran', doc: record.documents.birthCertificate },
    { key: 'familyCard', label: 'Kartu Keluarga', doc: record.documents.familyCard },
    { key: 'parentIdCard', label: 'KTP Orang Tua', doc: record.documents.parentIdCard },
    { key: 'studentPhoto', label: 'Pas Foto 3x4', doc: record.documents.studentPhoto },
    { key: 'tkCertificate', label: 'Ijazah / SKL TK', doc: record.documents.tkCertificate },
  ];
  const [selectedDocKey, setSelectedDocKey] = useState<string>('birthCertificate');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AdminEditValidationErrors>({});

  const selectedDocEntry = docList.find((d) => d.key === selectedDocKey) || docList[0];

  const handleSaveVerification = async () => {
    const validation = validateAdminStudentEdit({
      studentData: editStudent,
      parentsData: editParents,
    });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setActiveTab('biodata');
      setIsEditingBiodata(true);
      onToast(
        'error',
        'Validasi Data Gagal',
        Object.values(validation.errors)[0] ||
          'Pastikan NIK terdiri dari 16 digit dan format nomor telepon benar.'
      );
      return;
    }
    setFieldErrors({});
    setIsSaving(true);
    try {
      const updated = await ppdbService.updateRegistration(record.id, {
        wave: editWave,
        status,
        adminNotes,
        observationSchedule,
        studentData: {
          ...editStudent,
          fullName: editStudent.fullName.trim(),
          nickName: editStudent.nickName.trim(),
          nik: editStudent.nik.trim(),
          kkNumber: editStudent.kkNumber.trim(),
          addressStreet: editStudent.addressStreet.trim(),
        },
        parentsData: {
          ...editParents,
          whatsapp: editParents.whatsapp.trim(),
        },
      });
      onToast(
        'success',
        'Perubahan Disimpan',
        `Data & status ${updated.studentData.fullName} berhasil diperbarui.`
      );
      onUpdated(updated);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan.';
      onToast('error', 'Gagal Menyimpan', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await ppdbService.deleteRegistration(record.id);
      onToast(
        'success',
        'Data Pendaftar Dihapus',
        `${record.studentData.fullName} (${record.registrationNumber}) telah dihapus.`
      );
      onDeleted?.(record.id);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus data.';
      onToast('error', 'Gagal Menghapus', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const previewRecordForWa: RegistrationRecord = {
    ...record,
    wave: editWave,
    status,
    adminNotes,
    observationSchedule,
    studentData: editStudent,
    parentsData: editParents,
  };
  const waHref = `https://wa.me/${normalizeWhatsappForLink(editParents.whatsapp)}?text=${encodeURIComponent(
    buildWhatsAppStatusMessage(previewRecordForWa, settings)
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-verif-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <p className="font-mono text-xs font-semibold text-emerald-700">
              {record.registrationNumber} · {record.wave} ({record.registrationChannel})
            </p>
            <h2 id="modal-verif-title" className="font-display text-lg font-bold text-slate-900">
              Detail &amp; Verifikasi: {record.studentData.fullName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela verifikasi"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('biodata')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'biodata'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            Tab 1: Biodata Lengkap
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'documents'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            Tab 2: Pemeriksaan Berkas
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'biodata' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Identitas Calon Siswa &amp; Orang Tua
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingBiodata((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isEditingBiodata
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{isEditingBiodata ? 'Mode Pratinjau' : 'Edit Biodata Lengkap'}</span>
                </button>
              </div>

              {isEditingBiodata ? (
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label htmlFor="edit-fullname" className="block text-xs font-semibold text-slate-700">
                      Nama Lengkap Siswa
                    </label>
                    <input
                      id="edit-fullname"
                      type="text"
                      value={editStudent.fullName}
                      onChange={(e) => {
                        setEditStudent({ ...editStudent, fullName: e.target.value });
                        if (fieldErrors.fullName) {
                          setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.fullName)}
                      className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
                        fieldErrors.fullName ? 'border-red-500 focus:border-red-600 focus:outline-none' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="edit-nickname" className="block text-xs font-semibold text-slate-700">
                      Nama Panggilan
                    </label>
                    <input
                      id="edit-nickname"
                      type="text"
                      value={editStudent.nickName}
                      onChange={(e) => setEditStudent({ ...editStudent, nickName: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-wave" className="block text-xs font-semibold text-slate-700">
                      Gelombang
                    </label>
                    <select
                      id="edit-wave"
                      value={editWave}
                      onChange={(e) => setEditWave(e.target.value as WaveType)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="Gelombang 1">Gelombang 1</option>
                      <option value="Gelombang 2">Gelombang 2</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="edit-nik" className="block text-xs font-semibold text-slate-700">
                        NIK Siswa (16 Digit)
                      </label>
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          editStudent.nik.length === 16 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {editStudent.nik.length}/16
                      </span>
                    </div>
                    <input
                      id="edit-nik"
                      type="text"
                      inputMode="numeric"
                      maxLength={16}
                      value={editStudent.nik}
                      onChange={(e) => {
                        setEditStudent({ ...editStudent, nik: e.target.value.replace(/\D/g, '') });
                        if (fieldErrors.nik) {
                          setFieldErrors((prev) => ({ ...prev, nik: undefined }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.nik)}
                      className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm ${
                        fieldErrors.nik ? 'border-red-500 focus:border-red-600 focus:outline-none' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.nik && (
                      <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                        {fieldErrors.nik}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="edit-kk" className="block text-xs font-semibold text-slate-700">
                        Nomor KK (16 Digit)
                      </label>
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          editStudent.kkNumber.length === 16 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {editStudent.kkNumber.length}/16
                      </span>
                    </div>
                    <input
                      id="edit-kk"
                      type="text"
                      inputMode="numeric"
                      maxLength={16}
                      value={editStudent.kkNumber}
                      onChange={(e) => {
                        setEditStudent({
                          ...editStudent,
                          kkNumber: e.target.value.replace(/\D/g, ''),
                        });
                        if (fieldErrors.kkNumber) {
                          setFieldErrors((prev) => ({ ...prev, kkNumber: undefined }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.kkNumber)}
                      className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm ${
                        fieldErrors.kkNumber ? 'border-red-500 focus:border-red-600 focus:outline-none' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.kkNumber && (
                      <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                        {fieldErrors.kkNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="edit-gender" className="block text-xs font-semibold text-slate-700">
                      Jenis Kelamin
                    </label>
                    <select
                      id="edit-gender"
                      value={editStudent.gender}
                      onChange={(e) =>
                        setEditStudent({ ...editStudent, gender: e.target.value as GenderType })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-birthplace" className="block text-xs font-semibold text-slate-700">
                      Tempat Lahir
                    </label>
                    <input
                      id="edit-birthplace"
                      type="text"
                      value={editStudent.birthPlace}
                      onChange={(e) => setEditStudent({ ...editStudent, birthPlace: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-birthdate" className="block text-xs font-semibold text-slate-700">
                      Tanggal Lahir
                    </label>
                    <input
                      id="edit-birthdate"
                      type="date"
                      value={editStudent.birthDate}
                      onChange={(e) => setEditStudent({ ...editStudent, birthDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-origin-type" className="block text-xs font-semibold text-slate-700">
                      Asal Sekolah
                    </label>
                    <select
                      id="edit-origin-type"
                      value={editStudent.originType}
                      onChange={(e) =>
                        setEditStudent({
                          ...editStudent,
                          originType: e.target.value as SchoolOriginType,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="TK">TK</option>
                      <option value="RA">RA</option>
                      <option value="PAUD">PAUD</option>
                      <option value="Belum Sekolah">Belum Sekolah</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="edit-origin-name" className="block text-xs font-semibold text-slate-700">
                      Nama TK / RA / PAUD Asal
                    </label>
                    <input
                      id="edit-origin-name"
                      type="text"
                      value={editStudent.originSchoolName}
                      onChange={(e) =>
                        setEditStudent({ ...editStudent, originSchoolName: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-wa" className="block text-xs font-semibold text-slate-700">
                      No. WhatsApp Orang Tua
                    </label>
                    <input
                      id="edit-wa"
                      type="tel"
                      placeholder="081234567890"
                      value={editParents.whatsapp}
                      onChange={(e) => {
                        setEditParents({ ...editParents, whatsapp: e.target.value });
                        if (fieldErrors.whatsapp) {
                          setFieldErrors((prev) => ({ ...prev, whatsapp: undefined }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.whatsapp)}
                      className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm ${
                        fieldErrors.whatsapp ? 'border-red-500 focus:border-red-600 focus:outline-none' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.whatsapp ? (
                      <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                        {fieldErrors.whatsapp}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-500">Format: 08... atau 628...</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="edit-addr" className="block text-xs font-semibold text-slate-700">
                      Alamat Jalan / Kampung
                    </label>
                    <input
                      id="edit-addr"
                      type="text"
                      value={editStudent.addressStreet}
                      onChange={(e) =>
                        setEditStudent({ ...editStudent, addressStreet: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-district" className="block text-xs font-semibold text-slate-700">
                      Kecamatan
                    </label>
                    <input
                      id="edit-district"
                      type="text"
                      value={editStudent.addressDistrict}
                      onChange={(e) =>
                        setEditStudent({ ...editStudent, addressDistrict: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-father" className="block text-xs font-semibold text-slate-700">
                      Nama Ayah
                    </label>
                    <input
                      id="edit-father"
                      type="text"
                      value={editParents.father.fullName}
                      onChange={(e) =>
                        setEditParents({
                          ...editParents,
                          father: { ...editParents.father, fullName: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-mother" className="block text-xs font-semibold text-slate-700">
                      Nama Ibu
                    </label>
                    <input
                      id="edit-mother"
                      type="text"
                      value={editParents.mother.fullName}
                      onChange={(e) =>
                        setEditParents({
                          ...editParents,
                          mother: { ...editParents.mother, fullName: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="block text-xs font-semibold text-slate-700">
                      Email Orang Tua
                    </label>
                    <input
                      id="edit-email"
                      type="email"
                      value={editParents.email}
                      onChange={(e) => setEditParents({ ...editParents, email: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  {editParents.guardian.enabled && (
                    <div>
                      <label htmlFor="edit-guardian-phone" className="block text-xs font-semibold text-slate-700">
                        No. HP Wali
                      </label>
                      <input
                        id="edit-guardian-phone"
                        type="tel"
                        placeholder="081234567890"
                        value={editParents.guardian.phone}
                        onChange={(e) => {
                          setEditParents({
                            ...editParents,
                            guardian: { ...editParents.guardian, phone: e.target.value },
                          });
                          if (fieldErrors.guardianPhone) {
                            setFieldErrors((prev) => ({ ...prev, guardianPhone: undefined }));
                          }
                        }}
                        aria-invalid={Boolean(fieldErrors.guardianPhone)}
                        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm ${
                          fieldErrors.guardianPhone
                            ? 'border-red-500 focus:border-red-600 focus:outline-none'
                            : 'border-slate-300'
                        }`}
                      />
                      {fieldErrors.guardianPhone && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                          {fieldErrors.guardianPhone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                    <p className="font-bold text-emerald-900">Data Calon Siswa</p>
                    <p>
                      <span className="text-slate-500">Nama Lengkap:</span>{' '}
                      <strong className="text-slate-900">{editStudent.fullName}</strong> ({editStudent.nickName})
                    </p>
                    <p>
                      <span className="text-slate-500">NIK / No. KK:</span>{' '}
                      <span className="font-mono">{editStudent.nik} / {editStudent.kkNumber}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">TTL:</span> {editStudent.birthPlace},{' '}
                      {editStudent.birthDate}
                    </p>
                    <p>
                      <span className="text-slate-500">Jenis Kelamin:</span>{' '}
                      {editStudent.gender} · Anak ke-{editStudent.childOrder} dari{' '}
                      {editStudent.totalSiblings}
                    </p>
                    <p>
                      <span className="text-slate-500">Asal Sekolah:</span>{' '}
                      {editStudent.originType}{' '}
                      {editStudent.originSchoolName ? `(${editStudent.originSchoolName})` : ''}
                    </p>
                    <p>
                      <span className="text-slate-500">Alamat:</span> {editStudent.addressStreet}, RT/RW{' '}
                      {editStudent.addressRtRw}, {editStudent.addressVillage}, Kec.{' '}
                      {editStudent.addressDistrict}, {editStudent.addressCity} (Jarak:{' '}
                      {editStudent.distanceToSchool})
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                    <p className="font-bold text-emerald-900">Data Orang Tua / Wali</p>
                    <p>
                      <span className="text-slate-500">Ayah:</span>{' '}
                      <strong>{editParents.father.fullName}</strong> (
                      {editParents.father.education}, {editParents.father.occupation})
                    </p>
                    <p>
                      <span className="text-slate-500">Penghasilan Ayah:</span>{' '}
                      {editParents.father.monthlyIncome}
                    </p>
                    <p>
                      <span className="text-slate-500">Ibu:</span>{' '}
                      <strong>{editParents.mother.fullName}</strong> (
                      {editParents.mother.education}, {editParents.mother.occupation})
                    </p>
                    <p>
                      <span className="text-slate-500">Penghasilan Ibu:</span>{' '}
                      {editParents.mother.monthlyIncome}
                    </p>
                    <p>
                      <span className="text-slate-500">WhatsApp Aktif:</span>{' '}
                      <span className="font-mono font-bold text-emerald-800">{editParents.whatsapp}</span>
                    </p>
                    {editParents.guardian.enabled && (
                      <p>
                        <span className="text-slate-500">Wali:</span>{' '}
                        {editParents.guardian.fullName} (
                        {editParents.guardian.relationship}) ·{' '}
                        {editParents.guardian.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Document Selector List */}
              <div className="space-y-2 lg:col-span-4">
                {docList.map((item) => {
                  const isActive = item.key === selectedDocKey;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setSelectedDocKey(item.key);
                        setZoom(1);
                        setRotation(0);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors ${
                        isActive
                          ? 'border-emerald-700 bg-emerald-50 font-semibold text-emerald-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`font-medium ${
                          item.doc ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {item.doc ? 'Ada' : 'Kosong'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Document Zoom & Rotate Viewer */}
              <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 lg:col-span-8">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {selectedDocEntry.label}
                    {selectedDocEntry.doc ? ` — ${selectedDocEntry.doc.fileName}` : ''}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                      aria-label="Perkecil dokumen"
                      className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-50"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-mono text-xs font-semibold text-slate-700">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
                      aria-label="Perbesar dokumen"
                      className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-50"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      aria-label="Putar dokumen 90 derajat"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>Putar</span>
                    </button>
                  </div>
                </div>

                <div className="flex h-72 items-center justify-center overflow-auto rounded-lg border border-slate-200 bg-white p-3">
                  {!selectedDocEntry.doc ? (
                    <div className="text-center text-xs text-slate-400">
                      <FileText className="mx-auto h-8 w-8 mb-2" />
                      <p>Berkas belum diunggah oleh pendaftar.</p>
                    </div>
                  ) : selectedDocEntry.doc.mimeType === 'application/pdf' ? (
                    <iframe
                      title={selectedDocEntry.label}
                      src={selectedDocEntry.doc.dataUrl}
                      className="h-full w-full rounded"
                    />
                  ) : (
                    <img
                      src={selectedDocEntry.doc.dataUrl}
                      alt={selectedDocEntry.label}
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                      }}
                      className="max-h-64 w-auto transition-transform duration-150"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Panel Aksi Panitia */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Panel Keputusan Verifikator
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="verif-status" className="block text-xs font-semibold text-slate-700">
                  Ubah Status Pendaftaran
                </label>
                <select
                  id="verif-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RegistrationStatus)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Status saat ini:{' '}
                  <span className={`font-semibold ${STATUS_META[status].textClass}`}>{status}</span>
                </p>
              </div>

              <div>
                <label htmlFor="verif-schedule" className="block text-xs font-semibold text-slate-700">
                  Jadwal Observasi / Pemetaan (Jika Terverifikasi)
                </label>
                <input
                  id="verif-schedule"
                  type="text"
                  value={observationSchedule}
                  onChange={(e) => setObservationSchedule(e.target.value)}
                  placeholder="Contoh: Sabtu, 7 Maret 2026 · Pukul 09.00 WIB"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="verif-notes" className="block text-xs font-semibold text-slate-700">
                  Catatan Verifikator (Ditampilkan ke Orang Tua saat Cek Status)
                </label>
                <textarea
                  id="verif-notes"
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Contoh: Foto KK buram, mohon unggah ulang yang lebih jelas."
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {onPrintAcceptanceLetter && status === 'Diterima' && (
              <button
                type="button"
                onClick={() => onPrintAcceptanceLetter(previewRecordForWa)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-700 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Surat Pernyataan</span>
              </button>
            )}

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Kirim Notifikasi via WhatsApp</span>
            </a>

            {onDeleted && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Pendaftar</span>
              </button>
            )}

            {onDeleted && confirmDelete && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5">
                <span className="text-xs font-semibold text-red-800">Hapus permanen?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveVerification}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-900 disabled:bg-slate-400"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditingBiodata ? (
                <Save className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>{isEditingBiodata ? 'Simpan Perubahan' : 'Simpan Verifikasi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

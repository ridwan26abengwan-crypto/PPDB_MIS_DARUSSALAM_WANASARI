import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Edit3,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { ppdbService } from '../services/ppdbService';
import type {
  DocumentsData,
  ParentsData,
  PpdbSettings,
  RegistrationRecord,
  StudentData,
  WaveType,
} from '../types/ppdb';
import { calculateAgeAsOf, validateNik, validateWhatsapp } from '../utils/ppdbRules';
import { DocumentDropzone } from './DocumentDropzone';

interface RegistrationFormProps {
  settings: PpdbSettings;
  onSuccess: (record: RegistrationRecord) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  onCancel: () => void;
}

interface DraftState {
  step: number;
  wave: WaveType;
  studentData: StudentData;
  parentsData: ParentsData;
  documents: DocumentsData;
}

const INITIAL_STUDENT: StudentData = {
  fullName: '',
  nickName: '',
  nik: '',
  kkNumber: '',
  nisn: '',
  birthPlace: '',
  birthDate: '',
  gender: 'Laki-laki',
  childOrder: '1',
  totalSiblings: '1',
  familyStatus: 'Anak Kandung',
  addressStreet: '',
  addressRtRw: '',
  addressVillage: '',
  addressDistrict: '',
  addressCity: '',
  distanceToSchool: '< 1 km',
  originType: 'TK',
  originSchoolName: '',
};

const INITIAL_PARENTS: ParentsData = {
  father: {
    fullName: '',
    nik: '',
    birthYear: '',
    education: 'S1',
    occupation: '',
    monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
  },
  mother: {
    fullName: '',
    nik: '',
    birthYear: '',
    education: 'S1',
    occupation: '',
    monthlyIncome: 'Rp 1.500.000 - Rp 3.000.000',
  },
  whatsapp: '',
  email: '',
  guardian: {
    enabled: false,
    fullName: '',
    relationship: '',
    occupation: '',
    phone: '',
  },
};

const INITIAL_DOCS: DocumentsData = {
  birthCertificate: null,
  familyCard: null,
  parentIdCard: null,
  studentPhoto: null,
  tkCertificate: null,
};

const EDUCATION_OPTIONS = [
  'SD/Sederajat',
  'SMP/Sederajat',
  'SMA/SMK',
  'D1/D2/D3',
  'S1',
  'S2',
  'S3',
];

const INCOME_OPTIONS = [
  '< Rp 1.500.000',
  'Rp 1.500.000 - Rp 3.000.000',
  'Rp 3.000.000 - Rp 5.000.000',
  'Rp 5.000.000 - Rp 8.000.000',
  '> Rp 8.000.000',
];

const STEP_LABELS = [
  'Data Calon Siswa',
  'Data Orang Tua / Wali',
  'Unggah Berkas',
  'Review & Kirim',
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  settings,
  onSuccess,
  onToast,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [wave, setWave] = useState<WaveType>('Gelombang 1');
  const [studentData, setStudentData] = useState<StudentData>(INITIAL_STUDENT);
  const [parentsData, setParentsData] = useState<ParentsData>(INITIAL_PARENTS);
  const [documents, setDocuments] = useState<DocumentsData>(INITIAL_DOCS);
  const [agreedStatement, setAgreedStatement] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Restore saved draft from localStorage on mount
  useEffect(() => {
    const saved = ppdbService.loadDraft<DraftState>();
    if (saved && (saved.studentData?.fullName || saved.parentsData?.father?.fullName)) {
      setStep(Math.min(4, Math.max(1, saved.step || 1)));
      setWave(saved.wave || 'Gelombang 1');
      setStudentData({ ...INITIAL_STUDENT, ...saved.studentData });
      setParentsData({
        ...INITIAL_PARENTS,
        ...saved.parentsData,
        father: { ...INITIAL_PARENTS.father, ...saved.parentsData?.father },
        mother: { ...INITIAL_PARENTS.mother, ...saved.parentsData?.mother },
        guardian: { ...INITIAL_PARENTS.guardian, ...saved.parentsData?.guardian },
      });
      setDocuments({ ...INITIAL_DOCS, ...saved.documents });
      setDraftRestored(true);
    }
  }, []);

  // Auto-save draft whenever form data changes
  useEffect(() => {
    const draft: DraftState = { step, wave, studentData, parentsData, documents };
    ppdbService.saveDraft(draft);
  }, [step, wave, studentData, parentsData, documents]);

  const ageCalc = useMemo(
    () => calculateAgeAsOf(studentData.birthDate, '2026-07-01'),
    [studentData.birthDate]
  );

  const handleResetDraft = () => {
    ppdbService.clearDraft();
    setStep(1);
    setWave('Gelombang 1');
    setStudentData(INITIAL_STUDENT);
    setParentsData(INITIAL_PARENTS);
    setDocuments(INITIAL_DOCS);
    setAgreedStatement(false);
    setErrors({});
    setDraftRestored(false);
    onToast('info', 'Draf formulir dibersihkan', 'Silakan mulai pengisian formulir baru.');
  };

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!studentData.fullName.trim()) e.fullName = 'Nama lengkap wajib diisi.';
    if (!studentData.nickName.trim()) e.nickName = 'Nama panggilan wajib diisi.';
    if (!validateNik(studentData.nik)) e.nik = 'NIK harus tepat 16 digit angka.';
    if (!validateNik(studentData.kkNumber)) e.kkNumber = 'Nomor KK harus tepat 16 digit angka.';
    if (!studentData.birthPlace.trim()) e.birthPlace = 'Tempat lahir wajib diisi.';
    if (!studentData.birthDate) {
      e.birthDate = 'Tanggal lahir wajib diisi.';
    } else if (ageCalc && !ageCalc.isEligible) {
      e.birthDate = ageCalc.eligibilityLabel;
    }
    if (!studentData.addressStreet.trim()) e.addressStreet = 'Alamat jalan/kampung wajib diisi.';
    if (!studentData.addressRtRw.trim()) e.addressRtRw = 'RT/RW wajib diisi.';
    if (!studentData.addressVillage.trim()) e.addressVillage = 'Desa/Kelurahan wajib diisi.';
    if (!studentData.addressDistrict.trim()) e.addressDistrict = 'Kecamatan wajib diisi.';
    if (!studentData.addressCity.trim()) e.addressCity = 'Kabupaten/Kota wajib diisi.';
    if (
      studentData.originType !== 'Belum Sekolah' &&
      !studentData.originSchoolName.trim()
    ) {
      e.originSchoolName = 'Nama TK/RA/PAUD asal wajib diisi.';
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      onToast('error', 'Periksa Data Calon Siswa', 'Masih terdapat kolom wajib yang belum valid.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (!parentsData.father.fullName.trim()) e.fatherName = 'Nama ayah wajib diisi.';
    if (!validateNik(parentsData.father.nik)) e.fatherNik = 'NIK ayah harus 16 digit angka.';
    if (!/^\d{4}$/.test(parentsData.father.birthYear)) {
      e.fatherBirthYear = 'Tahun lahir ayah harus 4 digit (mis. 1986).';
    }
    if (!parentsData.father.occupation.trim()) e.fatherOccupation = 'Pekerjaan ayah wajib diisi.';

    if (!parentsData.mother.fullName.trim()) e.motherName = 'Nama ibu wajib diisi.';
    if (!validateNik(parentsData.mother.nik)) e.motherNik = 'NIK ibu harus 16 digit angka.';
    if (!/^\d{4}$/.test(parentsData.mother.birthYear)) {
      e.motherBirthYear = 'Tahun lahir ibu harus 4 digit (mis. 1989).';
    }
    if (!parentsData.mother.occupation.trim()) e.motherOccupation = 'Pekerjaan ibu wajib diisi.';

    if (!validateWhatsapp(parentsData.whatsapp)) {
      e.whatsapp = 'Format WhatsApp tidak valid. Awali dengan 08... atau 628...';
    }

    if (parentsData.guardian.enabled) {
      if (!parentsData.guardian.fullName.trim()) e.guardianName = 'Nama wali wajib diisi.';
      if (!parentsData.guardian.relationship.trim()) e.guardianRel = 'Hubungan wali wajib diisi.';
      if (!validateWhatsapp(parentsData.guardian.phone)) {
        e.guardianPhone = 'Nomor HP wali harus format 08... atau 628...';
      }
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      onToast('error', 'Periksa Data Orang Tua / Wali', 'Lengkapi data yang ditandai merah.');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    const e: Record<string, string> = {};
    if (!documents.birthCertificate) e.birthCertificate = 'Akta Kelahiran wajib diunggah.';
    if (!documents.familyCard) e.familyCard = 'Kartu Keluarga wajib diunggah.';
    if (!documents.parentIdCard) e.parentIdCard = 'KTP Orang Tua wajib diunggah.';
    if (!documents.studentPhoto) e.studentPhoto = 'Pas Foto 3x4 wajib diunggah.';

    setErrors(e);
    if (Object.keys(e).length > 0) {
      onToast('error', 'Berkas Wajib Belum Lengkap', 'Unggah 4 dokumen wajib terlebih dahulu.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 3 && validateStep3()) {
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!agreedStatement) {
      onToast(
        'error',
        'Konfirmasi Pernyataan',
        'Silakan centang pernyataan kebenaran data sebelum mengirim.'
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await ppdbService.submitRegistration({
        wave,
        registrationChannel: 'Online',
        studentData,
        parentsData,
        documents,
      });
      ppdbService.clearDraft();
      onToast(
        'success',
        'Pendaftaran Berhasil Dikirim!',
        `Nomor Pendaftaran Anda: ${created.registrationNumber}`
      );
      onSuccess(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pendaftaran.';
      onToast('error', 'Gagal Mengirim Pendaftaran', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (fieldError?: string) =>
    `mt-1 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
      fieldError
        ? 'border-red-400 bg-red-50/40 focus:border-red-600 focus:ring-red-200'
        : 'border-slate-300 bg-white focus:border-emerald-700 focus:ring-emerald-100'
    }`;

  if (!settings.isOpen) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />
          <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
            Pendaftaran Online Sedang Ditutup
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Saat ini portal PPDB MIS Darussalam TA {settings.academicYear} sedang ditutup oleh panitia. Anda tetap dapat memeriksa status pendaftaran yang sudah masuk.
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="mt-6 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Header & Draft Notice */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Formulir PPDB Online · TA {settings.academicYear}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Pendaftaran Peserta Didik Baru
          </h1>
        </div>
        <button
          type="button"
          onClick={handleResetDraft}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Draf</span>
        </button>
      </div>

      {draftRestored && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
          <span>
            Progres formulir sebelumnya berhasil dipulihkan otomatis dari penyimpanan browser Anda.
          </span>
          <button
            type="button"
            onClick={() => setDraftRestored(false)}
            className="font-semibold underline shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <nav aria-label="Tahapan Pendaftaran" className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isCurrent = step === stepNum;
            const isDone = step > stepNum;
            return (
              <li key={label} className="flex items-center gap-2.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                    isDone
                      ? 'bg-emerald-700 text-white'
                      : isCurrent
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : stepNum}
                </span>
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isCurrent ? 'text-slate-900' : isDone ? 'text-emerald-800' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main Step Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        {/* STEP 1: DATA CALON SISWA */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Langkah 1: Data Calon Peserta Didik
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Isikan identitas anak sesuai Akta Kelahiran dan Kartu Keluarga resmi.
              </p>
            </div>

            {/* Pilihan Gelombang */}
            <div>
              <label htmlFor="wave-select" className="block text-sm font-semibold text-slate-800">
                Gelombang Pendaftaran
              </label>
              <select
                id="wave-select"
                value={wave}
                onChange={(e) => setWave(e.target.value as WaveType)}
                className={inputClass()}
              >
                <option value="Gelombang 1">Gelombang 1 (Early Bird)</option>
                <option value="Gelombang 2">Gelombang 2 (Reguler)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="student-fullname" className="block text-sm font-semibold text-slate-800">
                  Nama Lengkap (sesuai Akta Kelahiran) <span className="text-red-600">*</span>
                </label>
                <input
                  id="student-fullname"
                  type="text"
                  value={studentData.fullName}
                  onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
                  placeholder="Contoh: Muhammad Al-Fatih Pratama"
                  className={inputClass(errors.fullName)}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="student-nickname" className="block text-sm font-semibold text-slate-800">
                  Nama Panggilan <span className="text-red-600">*</span>
                </label>
                <input
                  id="student-nickname"
                  type="text"
                  value={studentData.nickName}
                  onChange={(e) => setStudentData({ ...studentData, nickName: e.target.value })}
                  placeholder="Contoh: Fatih"
                  className={inputClass(errors.nickName)}
                />
                {errors.nickName && <p className="mt-1 text-xs text-red-600">{errors.nickName}</p>}
              </div>

              <div>
                <label htmlFor="student-gender" className="block text-sm font-semibold text-slate-800">
                  Jenis Kelamin <span className="text-red-600">*</span>
                </label>
                <select
                  id="student-gender"
                  value={studentData.gender}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      gender: e.target.value as StudentData['gender'],
                    })
                  }
                  className={inputClass()}
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label htmlFor="student-nik" className="block text-sm font-semibold text-slate-800">
                  NIK Calon Siswa (16 Digit) <span className="text-red-600">*</span>
                </label>
                <input
                  id="student-nik"
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={studentData.nik}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      nik: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="3201011404200001"
                  className={`${inputClass(errors.nik)} font-mono tabular-nums`}
                />
                {errors.nik && <p className="mt-1 text-xs text-red-600">{errors.nik}</p>}
              </div>

              <div>
                <label htmlFor="student-kk" className="block text-sm font-semibold text-slate-800">
                  Nomor Kartu Keluarga (16 Digit) <span className="text-red-600">*</span>
                </label>
                <input
                  id="student-kk"
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={studentData.kkNumber}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      kkNumber: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="3201010203150011"
                  className={`${inputClass(errors.kkNumber)} font-mono tabular-nums`}
                />
                {errors.kkNumber && <p className="mt-1 text-xs text-red-600">{errors.kkNumber}</p>}
              </div>

              <div>
                <label htmlFor="student-nisn" className="block text-sm font-semibold text-slate-800">
                  NISN <span className="text-xs font-normal text-slate-500">(Opsional jika ada)</span>
                </label>
                <input
                  id="student-nisn"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={studentData.nisn}
                  onChange={(e) =>
                    setStudentData({ ...studentData, nisn: e.target.value.replace(/\D/g, '') })
                  }
                  placeholder="10 digit NISN TK/RA"
                  className={`${inputClass()} font-mono tabular-nums`}
                />
              </div>

              <div>
                <label htmlFor="student-birthplace" className="block text-sm font-semibold text-slate-800">
                  Tempat Lahir <span className="text-red-600">*</span>
                </label>
                <input
                  id="student-birthplace"
                  type="text"
                  value={studentData.birthPlace}
                  onChange={(e) => setStudentData({ ...studentData, birthPlace: e.target.value })}
                  placeholder="Contoh: Bogor"
                  className={inputClass(errors.birthPlace)}
                />
                {errors.birthPlace && (
                  <p className="mt-1 text-xs text-red-600">{errors.birthPlace}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="student-birthdate" className="block text-sm font-semibold text-slate-800">
                  Tanggal Lahir <span className="text-red-600">*</span>
                </label>
                <input
                  id="student-birthdate"
                  type="date"
                  value={studentData.birthDate}
                  onChange={(e) => setStudentData({ ...studentData, birthDate: e.target.value })}
                  className={inputClass(errors.birthDate)}
                />
                {ageCalc && (
                  <div
                    className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                      ageCalc.isEligible
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    {ageCalc.isEligible ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    )}
                    <span>
                      Usia per 1 Juli 2026: <strong>{ageCalc.years} Tahun {ageCalc.months} Bulan</strong> · {ageCalc.eligibilityLabel}
                    </span>
                  </div>
                )}
                {errors.birthDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.birthDate}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="child-order" className="block text-sm font-semibold text-slate-800">
                    Anak ke-
                  </label>
                  <input
                    id="child-order"
                    type="number"
                    min={1}
                    max={15}
                    value={studentData.childOrder}
                    onChange={(e) => setStudentData({ ...studentData, childOrder: e.target.value })}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label htmlFor="total-siblings" className="block text-sm font-semibold text-slate-800">
                    Dari Bersaudara
                  </label>
                  <input
                    id="total-siblings"
                    type="number"
                    min={1}
                    max={15}
                    value={studentData.totalSiblings}
                    onChange={(e) =>
                      setStudentData({ ...studentData, totalSiblings: e.target.value })
                    }
                    className={inputClass()}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="family-status" className="block text-sm font-semibold text-slate-800">
                  Status dalam Keluarga
                </label>
                <select
                  id="family-status"
                  value={studentData.familyStatus}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      familyStatus: e.target.value as StudentData['familyStatus'],
                    })
                  }
                  className={inputClass()}
                >
                  <option value="Anak Kandung">Anak Kandung</option>
                  <option value="Anak Tiri">Anak Tiri</option>
                  <option value="Anak Angkat">Anak Angkat</option>
                </select>
              </div>
            </div>

            {/* Alamat */}
            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-display text-base font-bold text-slate-900">
                Alamat Tempat Tinggal &amp; Sekolah Asal
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="addr-street" className="block text-sm font-semibold text-slate-800">
                    Alamat Jalan / Kampung / Perumahan <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="addr-street"
                    type="text"
                    value={studentData.addressStreet}
                    onChange={(e) =>
                      setStudentData({ ...studentData, addressStreet: e.target.value })
                    }
                    placeholder="Contoh: Jl. Melati Indah Blok B No. 14"
                    className={inputClass(errors.addressStreet)}
                  />
                  {errors.addressStreet && (
                    <p className="mt-1 text-xs text-red-600">{errors.addressStreet}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="addr-rtrw" className="block text-sm font-semibold text-slate-800">
                    RT / RW <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="addr-rtrw"
                    type="text"
                    value={studentData.addressRtRw}
                    onChange={(e) => setStudentData({ ...studentData, addressRtRw: e.target.value })}
                    placeholder="003/007"
                    className={inputClass(errors.addressRtRw)}
                  />
                  {errors.addressRtRw && (
                    <p className="mt-1 text-xs text-red-600">{errors.addressRtRw}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="addr-village" className="block text-sm font-semibold text-slate-800">
                    Desa / Kelurahan <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="addr-village"
                    type="text"
                    value={studentData.addressVillage}
                    onChange={(e) =>
                      setStudentData({ ...studentData, addressVillage: e.target.value })
                    }
                    placeholder="Sukamaju"
                    className={inputClass(errors.addressVillage)}
                  />
                  {errors.addressVillage && (
                    <p className="mt-1 text-xs text-red-600">{errors.addressVillage}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="addr-district" className="block text-sm font-semibold text-slate-800">
                    Kecamatan <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="addr-district"
                    type="text"
                    value={studentData.addressDistrict}
                    onChange={(e) =>
                      setStudentData({ ...studentData, addressDistrict: e.target.value })
                    }
                    placeholder="Cibinong"
                    className={inputClass(errors.addressDistrict)}
                  />
                  {errors.addressDistrict && (
                    <p className="mt-1 text-xs text-red-600">{errors.addressDistrict}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="addr-city" className="block text-sm font-semibold text-slate-800">
                    Kabupaten / Kota <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    value={studentData.addressCity}
                    onChange={(e) =>
                      setStudentData({ ...studentData, addressCity: e.target.value })
                    }
                    placeholder="Kabupaten Bogor"
                    className={inputClass(errors.addressCity)}
                  />
                  {errors.addressCity && (
                    <p className="mt-1 text-xs text-red-600">{errors.addressCity}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="distance-school" className="block text-sm font-semibold text-slate-800">
                    Jarak Rumah ke Madrasah
                  </label>
                  <select
                    id="distance-school"
                    value={studentData.distanceToSchool}
                    onChange={(e) =>
                      setStudentData({ ...studentData, distanceToSchool: e.target.value })
                    }
                    className={inputClass()}
                  >
                    <option value="< 1 km">&lt; 1 km</option>
                    <option value="1 - 3 km">1 – 3 km</option>
                    <option value="3 - 5 km">3 – 5 km</option>
                    <option value="> 5 km">&gt; 5 km</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="origin-type" className="block text-sm font-semibold text-slate-800">
                    Asal Sekolah
                  </label>
                  <select
                    id="origin-type"
                    value={studentData.originType}
                    onChange={(e) =>
                      setStudentData({
                        ...studentData,
                        originType: e.target.value as StudentData['originType'],
                      })
                    }
                    className={inputClass()}
                  >
                    <option value="TK">TK</option>
                    <option value="RA">RA (Raudhatul Athfal)</option>
                    <option value="PAUD">PAUD / KB</option>
                    <option value="Belum Sekolah">Belum Pernah Sekolah</option>
                  </select>
                </div>

                {studentData.originType !== 'Belum Sekolah' && (
                  <div className="sm:col-span-2">
                    <label htmlFor="origin-name" className="block text-sm font-semibold text-slate-800">
                      Nama TK / RA / PAUD Asal <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="origin-name"
                      type="text"
                      value={studentData.originSchoolName}
                      onChange={(e) =>
                        setStudentData({ ...studentData, originSchoolName: e.target.value })
                      }
                      placeholder="Contoh: RA Darul Hikmah"
                      className={inputClass(errors.originSchoolName)}
                    />
                    {errors.originSchoolName && (
                      <p className="mt-1 text-xs text-red-600">{errors.originSchoolName}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DATA ORANG TUA / WALI */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Langkah 2: Data Orang Tua / Wali
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Data ini digunakan untuk pendataan EMIS Kemenag dan komunikasi resmi panitia via WhatsApp.
              </p>
            </div>

            {/* Data Ayah */}
            <div>
              <h3 className="font-display text-base font-bold text-emerald-900">Data Ayah Kandung</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="father-name" className="block text-sm font-semibold text-slate-800">
                    Nama Lengkap Ayah <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="father-name"
                    type="text"
                    value={parentsData.father.fullName}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        father: { ...parentsData.father, fullName: e.target.value },
                      })
                    }
                    className={inputClass(errors.fatherName)}
                  />
                  {errors.fatherName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fatherName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="father-nik" className="block text-sm font-semibold text-slate-800">
                    NIK Ayah (16 Digit) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="father-nik"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    value={parentsData.father.nik}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        father: {
                          ...parentsData.father,
                          nik: e.target.value.replace(/\D/g, ''),
                        },
                      })
                    }
                    className={`${inputClass(errors.fatherNik)} font-mono tabular-nums`}
                  />
                  {errors.fatherNik && (
                    <p className="mt-1 text-xs text-red-600">{errors.fatherNik}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="father-birthyear" className="block text-sm font-semibold text-slate-800">
                    Tahun Lahir Ayah <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="father-birthyear"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="1987"
                    value={parentsData.father.birthYear}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        father: {
                          ...parentsData.father,
                          birthYear: e.target.value.replace(/\D/g, ''),
                        },
                      })
                    }
                    className={`${inputClass(errors.fatherBirthYear)} font-mono tabular-nums`}
                  />
                  {errors.fatherBirthYear && (
                    <p className="mt-1 text-xs text-red-600">{errors.fatherBirthYear}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="father-edu" className="block text-sm font-semibold text-slate-800">
                    Pendidikan Terakhir
                  </label>
                  <select
                    id="father-edu"
                    value={parentsData.father.education}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        father: { ...parentsData.father, education: e.target.value },
                      })
                    }
                    className={inputClass()}
                  >
                    {EDUCATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="father-job" className="block text-sm font-semibold text-slate-800">
                    Pekerjaan Ayah <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="father-job"
                    type="text"
                    value={parentsData.father.occupation}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        father: { ...parentsData.father, occupation: e.target.value },
                      })
                    }
                    placeholder="Contoh: Karyawan Swasta"
                    className={inputClass(errors.fatherOccupation)}
                  />
                  {errors.fatherOccupation && (
                    <p className="mt-1 text-xs text-red-600">{errors.fatherOccupation}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="father-income" className="block text-sm font-semibold text-slate-800">
                    Penghasilan Bulanan
                  </label>
                  <select
                    id="father-income"
                    value={parentsData.father.monthlyIncome}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        father: { ...parentsData.father, monthlyIncome: e.target.value },
                      })
                    }
                    className={inputClass()}
                  >
                    {INCOME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Data Ibu */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-display text-base font-bold text-emerald-900">Data Ibu Kandung</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="mother-name" className="block text-sm font-semibold text-slate-800">
                    Nama Lengkap Ibu <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="mother-name"
                    type="text"
                    value={parentsData.mother.fullName}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        mother: { ...parentsData.mother, fullName: e.target.value },
                      })
                    }
                    className={inputClass(errors.motherName)}
                  />
                  {errors.motherName && (
                    <p className="mt-1 text-xs text-red-600">{errors.motherName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mother-nik" className="block text-sm font-semibold text-slate-800">
                    NIK Ibu (16 Digit) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="mother-nik"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    value={parentsData.mother.nik}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        mother: {
                          ...parentsData.mother,
                          nik: e.target.value.replace(/\D/g, ''),
                        },
                      })
                    }
                    className={`${inputClass(errors.motherNik)} font-mono tabular-nums`}
                  />
                  {errors.motherNik && (
                    <p className="mt-1 text-xs text-red-600">{errors.motherNik}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mother-birthyear" className="block text-sm font-semibold text-slate-800">
                    Tahun Lahir Ibu <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="mother-birthyear"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="1990"
                    value={parentsData.mother.birthYear}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        mother: {
                          ...parentsData.mother,
                          birthYear: e.target.value.replace(/\D/g, ''),
                        },
                      })
                    }
                    className={`${inputClass(errors.motherBirthYear)} font-mono tabular-nums`}
                  />
                  {errors.motherBirthYear && (
                    <p className="mt-1 text-xs text-red-600">{errors.motherBirthYear}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mother-edu" className="block text-sm font-semibold text-slate-800">
                    Pendidikan Terakhir
                  </label>
                  <select
                    id="mother-edu"
                    value={parentsData.mother.education}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        mother: { ...parentsData.mother, education: e.target.value },
                      })
                    }
                    className={inputClass()}
                  >
                    {EDUCATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="mother-job" className="block text-sm font-semibold text-slate-800">
                    Pekerjaan Ibu <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="mother-job"
                    type="text"
                    value={parentsData.mother.occupation}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        mother: { ...parentsData.mother, occupation: e.target.value },
                      })
                    }
                    placeholder="Contoh: Ibu Rumah Tangga / Guru"
                    className={inputClass(errors.motherOccupation)}
                  />
                  {errors.motherOccupation && (
                    <p className="mt-1 text-xs text-red-600">{errors.motherOccupation}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mother-income" className="block text-sm font-semibold text-slate-800">
                    Penghasilan Bulanan
                  </label>
                  <select
                    id="mother-income"
                    value={parentsData.mother.monthlyIncome}
                    onChange={(e) =>
                      setParentsData({
                        ...parentsData,
                        mother: { ...parentsData.mother, monthlyIncome: e.target.value },
                      })
                    }
                    className={inputClass()}
                  >
                    {INCOME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Kontak Utama & Wali */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-display text-base font-bold text-emerald-900">Kontak Utama</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="parent-wa" className="block text-sm font-semibold text-slate-800">
                    Nomor WhatsApp Aktif <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="parent-wa"
                    type="tel"
                    value={parentsData.whatsapp}
                    onChange={(e) => setParentsData({ ...parentsData, whatsapp: e.target.value })}
                    placeholder="081234567890"
                    className={`${inputClass(errors.whatsapp)} font-mono tabular-nums`}
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="parent-email" className="block text-sm font-semibold text-slate-800">
                    Alamat Email <span className="text-xs font-normal text-slate-500">(Opsional)</span>
                  </label>
                  <input
                    id="parent-email"
                    type="email"
                    value={parentsData.email}
                    onChange={(e) => setParentsData({ ...parentsData, email: e.target.value })}
                    placeholder="orangtua@example.com"
                    className={inputClass()}
                  />
                </div>
              </div>

              {/* Toggle Data Wali */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Calon siswa tinggal bersama Wali?
                    </p>
                    <p className="text-xs text-slate-500">
                      Aktifkan jika anak tinggal dan diasuh oleh selain orang tua kandung.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={parentsData.guardian.enabled}
                    aria-label="Aktifkan isian data wali"
                    onClick={() =>
                      setParentsData({
                        ...parentsData,
                        guardian: {
                          ...parentsData.guardian,
                          enabled: !parentsData.guardian.enabled,
                        },
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      parentsData.guardian.enabled ? 'bg-emerald-700' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        parentsData.guardian.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {parentsData.guardian.enabled && (
                  <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="guardian-name" className="block text-sm font-semibold text-slate-800">
                        Nama Wali <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="guardian-name"
                        type="text"
                        value={parentsData.guardian.fullName}
                        onChange={(e) =>
                          setParentsData({
                            ...parentsData,
                            guardian: { ...parentsData.guardian, fullName: e.target.value },
                          })
                        }
                        className={inputClass(errors.guardianName)}
                      />
                      {errors.guardianName && (
                        <p className="mt-1 text-xs text-red-600">{errors.guardianName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="guardian-rel" className="block text-sm font-semibold text-slate-800">
                        Hubungan dengan Siswa <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="guardian-rel"
                        type="text"
                        placeholder="Contoh: Kakek / Paman"
                        value={parentsData.guardian.relationship}
                        onChange={(e) =>
                          setParentsData({
                            ...parentsData,
                            guardian: { ...parentsData.guardian, relationship: e.target.value },
                          })
                        }
                        className={inputClass(errors.guardianRel)}
                      />
                      {errors.guardianRel && (
                        <p className="mt-1 text-xs text-red-600">{errors.guardianRel}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="guardian-job" className="block text-sm font-semibold text-slate-800">
                        Pekerjaan Wali
                      </label>
                      <input
                        id="guardian-job"
                        type="text"
                        value={parentsData.guardian.occupation}
                        onChange={(e) =>
                          setParentsData({
                            ...parentsData,
                            guardian: { ...parentsData.guardian, occupation: e.target.value },
                          })
                        }
                        className={inputClass()}
                      />
                    </div>
                    <div>
                      <label htmlFor="guardian-phone" className="block text-sm font-semibold text-slate-800">
                        No. HP / WA Wali <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="guardian-phone"
                        type="tel"
                        value={parentsData.guardian.phone}
                        onChange={(e) =>
                          setParentsData({
                            ...parentsData,
                            guardian: { ...parentsData.guardian, phone: e.target.value },
                          })
                        }
                        placeholder="0812..."
                        className={`${inputClass(errors.guardianPhone)} font-mono tabular-nums`}
                      />
                      {errors.guardianPhone && (
                        <p className="mt-1 text-xs text-red-600">{errors.guardianPhone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: UNGGAH BERKAS */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Langkah 3: Unggah Berkas Persyaratan
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Pastikan dokumen terlihat utuh, tidak terpotong, dan tulisan terbaca jelas sebelum melanjutkan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <DocumentDropzone
                docKey="birthCertificate"
                label="1. Akta Kelahiran Calon Siswa"
                description="Foto/scan Akta Kelahiran asli (JPG/PNG/PDF, maks 2MB)."
                required
                value={documents.birthCertificate}
                onChange={(doc) => setDocuments({ ...documents, birthCertificate: doc })}
                onError={(msg) => onToast('error', 'Unggah Berkas Gagal', msg)}
              />
              {errors.birthCertificate && (
                <p className="-mt-2 text-xs text-red-600">{errors.birthCertificate}</p>
              )}

              <DocumentDropzone
                docKey="familyCard"
                label="2. Kartu Keluarga (KK)"
                description="Foto/scan Kartu Keluarga terbaru (JPG/PNG/PDF, maks 2MB)."
                required
                value={documents.familyCard}
                onChange={(doc) => setDocuments({ ...documents, familyCard: doc })}
                onError={(msg) => onToast('error', 'Unggah Berkas Gagal', msg)}
              />
              {errors.familyCard && (
                <p className="-mt-2 text-xs text-red-600">{errors.familyCard}</p>
              )}

              <DocumentDropzone
                docKey="parentIdCard"
                label="3. KTP Orang Tua / Wali"
                description="Foto/scan KTP Ayah atau Ibu yang masih berlaku (JPG/PNG/PDF, maks 2MB)."
                required
                value={documents.parentIdCard}
                onChange={(doc) => setDocuments({ ...documents, parentIdCard: doc })}
                onError={(msg) => onToast('error', 'Unggah Berkas Gagal', msg)}
              />
              {errors.parentIdCard && (
                <p className="-mt-2 text-xs text-red-600">{errors.parentIdCard}</p>
              )}

              <DocumentDropzone
                docKey="studentPhoto"
                label="4. Pas Foto Resmi 3x4"
                description="Latar belakang merah atau biru dengan pakaian rapi/seragam (JPG/PNG, maks 2MB)."
                required
                value={documents.studentPhoto}
                onChange={(doc) => setDocuments({ ...documents, studentPhoto: doc })}
                onError={(msg) => onToast('error', 'Unggah Berkas Gagal', msg)}
              />
              {errors.studentPhoto && (
                <p className="-mt-2 text-xs text-red-600">{errors.studentPhoto}</p>
              )}

              <DocumentDropzone
                docKey="tkCertificate"
                label="5. Ijazah / Surat Keterangan Lulus TK/RA"
                description="Opsional — dapat menyusul saat daftar ulang apabila belum diterbitkan TK/RA."
                value={documents.tkCertificate}
                onChange={(doc) => setDocuments({ ...documents, tkCertificate: doc })}
                onError={(msg) => onToast('error', 'Unggah Berkas Gagal', msg)}
              />
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & KONFIRMASI */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Langkah 4: Review Data &amp; Konfirmasi
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Periksa kembali seluruh data sebelum mengirim pendaftaran resmi ke panitia PPDB.
              </p>
            </div>

            {/* Section 1 Review */}
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-sm font-bold text-emerald-900">
                  Data Calon Peserta Didik ({wave})
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Nama Lengkap</dt>
                  <dd className="font-semibold text-slate-900">{studentData.fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">NIK / No. KK</dt>
                  <dd className="font-mono text-xs font-medium text-slate-800">
                    {studentData.nik} / {studentData.kkNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Tempat, Tanggal Lahir</dt>
                  <dd className="text-slate-800">
                    {studentData.birthPlace}, {studentData.birthDate}
                    {ageCalc ? ` (${ageCalc.years} thn ${ageCalc.months} bln)` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Jenis Kelamin &amp; Asal Sekolah</dt>
                  <dd className="text-slate-800">
                    {studentData.gender} · {studentData.originType}{' '}
                    {studentData.originSchoolName ? `(${studentData.originSchoolName})` : ''}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Alamat</dt>
                  <dd className="text-slate-800">
                    {studentData.addressStreet}, RT/RW {studentData.addressRtRw},{' '}
                    {studentData.addressVillage}, Kec. {studentData.addressDistrict},{' '}
                    {studentData.addressCity}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Section 2 Review */}
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-sm font-bold text-emerald-900">
                  Data Orang Tua / Wali
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Nama Ayah</dt>
                  <dd className="font-semibold text-slate-900">
                    {parentsData.father.fullName} ({parentsData.father.occupation})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Nama Ibu</dt>
                  <dd className="font-semibold text-slate-900">
                    {parentsData.mother.fullName} ({parentsData.mother.occupation})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">WhatsApp Utama</dt>
                  <dd className="font-mono font-semibold text-emerald-800">
                    {parentsData.whatsapp}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Email</dt>
                  <dd className="text-slate-800">{parentsData.email || '-'}</dd>
                </div>
              </dl>
            </div>

            {/* Section 3 Review */}
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-sm font-bold text-emerald-900">
                  Kelengkapan Berkas
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                {[
                  { label: 'Akta Kelahiran', doc: documents.birthCertificate },
                  { label: 'Kartu Keluarga', doc: documents.familyCard },
                  { label: 'KTP Orang Tua', doc: documents.parentIdCard },
                  { label: 'Pas Foto 3x4', doc: documents.studentPhoto },
                  { label: 'Ijazah / SKL TK/RA', doc: documents.tkCertificate },
                ].map((d) => (
                  <li key={d.label} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        d.doc ? 'text-emerald-700' : 'text-slate-300'
                      }`}
                    />
                    <span>
                      {d.label}: <strong>{d.doc ? d.doc.fileName : 'Belum diunggah'}</strong>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Declaration Checkbox */}
            <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedStatement}
                onChange={(e) => setAgreedStatement(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
              />
              <span className="text-sm font-medium text-slate-800">
                Saya menyatakan bahwa data yang diisikan adalah benar dan dapat dipertanggungjawabkan sesuai dokumen resmi kependudukan.
              </span>
            </label>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => {
              if (step === 1) onCancel();
              else setStep((prev) => prev - 1);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{step === 1 ? 'Kembali ke Beranda' : 'Sebelumnya'}</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:bg-slate-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim Pendaftaran...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Kirim Pendaftaran</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

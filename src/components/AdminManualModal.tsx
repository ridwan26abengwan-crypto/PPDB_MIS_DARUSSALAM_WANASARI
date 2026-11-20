import React, { useState } from 'react';
import { Loader2, UserPlus, X } from 'lucide-react';
import { ppdbService } from '../services/ppdbService';
import type {
  GenderType,
  RegistrationRecord,
  SchoolOriginType,
  WaveType,
} from '../types/ppdb';
import { validateNik, validateWhatsapp } from '../utils/ppdbRules';

interface AdminManualModalProps {
  onClose: () => void;
  onCreated: (record: RegistrationRecord) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const AdminManualModal: React.FC<AdminManualModalProps> = ({
  onClose,
  onCreated,
  onToast,
}) => {
  const [fullName, setFullName] = useState('');
  const [nickName, setNickName] = useState('');
  const [nik, setNik] = useState('');
  const [kkNumber, setKkNumber] = useState('');
  const [birthPlace, setBirthPlace] = useState('Bogor');
  const [birthDate, setBirthDate] = useState('2020-05-10');
  const [gender, setGender] = useState<GenderType>('Laki-laki');
  const [wave, setWave] = useState<WaveType>('Gelombang 1');
  const [originType, setOriginType] = useState<SchoolOriginType>('TK');
  const [originSchoolName, setOriginSchoolName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !validateNik(nik) || !validateWhatsapp(whatsapp)) {
      onToast(
        'error',
        'Data Tidak Valid',
        'Pastikan Nama Lengkap, NIK (16 digit), dan Nomor WhatsApp (08...) terisi benar.'
      );
      return;
    }

    setIsSaving(true);
    try {
      const created = await ppdbService.submitRegistration({
        wave,
        registrationChannel: 'Offline',
        status: 'Berkas Terverifikasi',
        studentData: {
          fullName: fullName.trim(),
          nickName: nickName.trim() || fullName.trim().split(' ')[0],
          nik: nik.trim(),
          kkNumber: validateNik(kkNumber) ? kkNumber.trim() : nik.trim(),
          nisn: '',
          birthPlace: birthPlace.trim() || 'Bogor',
          birthDate,
          gender,
          childOrder: '1',
          totalSiblings: '1',
          familyStatus: 'Anak Kandung',
          addressStreet: addressStreet.trim() || 'Pendaftaran Sekretariat Madrasah',
          addressRtRw: '001/001',
          addressVillage: 'Sukamaju',
          addressDistrict: 'Cibinong',
          addressCity: 'Kabupaten Bogor',
          distanceToSchool: '< 1 km',
          originType,
          originSchoolName: originSchoolName.trim(),
        },
        parentsData: {
          father: {
            fullName: fatherName.trim() || 'Orang Tua Siswa',
            nik: '3201010101850001',
            birthYear: '1985',
            education: 'SMA/SMK',
            occupation: 'Wiraswasta',
            monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
          },
          mother: {
            fullName: motherName.trim() || 'Ibu Kandung',
            nik: '3201014101880002',
            birthYear: '1988',
            education: 'SMA/SMK',
            occupation: 'Ibu Rumah Tangga',
            monthlyIncome: '< Rp 1.500.000',
          },
          whatsapp: whatsapp.trim(),
          email: '',
          guardian: { enabled: false, fullName: '', relationship: '', occupation: '', phone: '' },
        },
        documents: {
          birthCertificate: null,
          familyCard: null,
          parentIdCard: null,
          studentPhoto: null,
          tkCertificate: null,
        },
      });
      onToast(
        'success',
        'Pendaftar Offline Ditambahkan',
        `Nomor Pendaftaran: ${created.registrationNumber}`
      );
      onCreated(created);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menambah pendaftar offline.';
      onToast('error', 'Gagal Menambah Data', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-manual-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <UserPlus className="h-5 w-5 text-emerald-700" />
            <h2 id="modal-manual-title" className="font-display text-lg font-bold text-slate-900">
              Tambah Pendaftar Manual (Jalur Offline Sekretariat)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form tambah manual"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="man-fullname" className="block text-xs font-semibold text-slate-700">
              Nama Lengkap Calon Siswa *
            </label>
            <input
              id="man-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="man-nickname" className="block text-xs font-semibold text-slate-700">
              Nama Panggilan
            </label>
            <input
              id="man-nickname"
              type="text"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="man-gender" className="block text-xs font-semibold text-slate-700">
              Jenis Kelamin
            </label>
            <select
              id="man-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as GenderType)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label htmlFor="man-nik" className="block text-xs font-semibold text-slate-700">
              NIK Siswa (16 Digit) *
            </label>
            <input
              id="man-nik"
              type="text"
              required
              maxLength={16}
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
              placeholder="320101..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor="man-kk" className="block text-xs font-semibold text-slate-700">
              No. KK (16 Digit)
            </label>
            <input
              id="man-kk"
              type="text"
              maxLength={16}
              value={kkNumber}
              onChange={(e) => setKkNumber(e.target.value.replace(/\D/g, ''))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor="man-birthplace" className="block text-xs font-semibold text-slate-700">
              Tempat Lahir
            </label>
            <input
              id="man-birthplace"
              type="text"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="man-birthdate" className="block text-xs font-semibold text-slate-700">
              Tanggal Lahir *
            </label>
            <input
              id="man-birthdate"
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="man-wave" className="block text-xs font-semibold text-slate-700">
              Gelombang
            </label>
            <select
              id="man-wave"
              value={wave}
              onChange={(e) => setWave(e.target.value as WaveType)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="Gelombang 1">Gelombang 1</option>
              <option value="Gelombang 2">Gelombang 2</option>
            </select>
          </div>

          <div>
            <label htmlFor="man-origin" className="block text-xs font-semibold text-slate-700">
              Asal TK/RA/PAUD
            </label>
            <select
              id="man-origin"
              value={originType}
              onChange={(e) => setOriginType(e.target.value as SchoolOriginType)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="TK">TK</option>
              <option value="RA">RA</option>
              <option value="PAUD">PAUD</option>
              <option value="Belum Sekolah">Belum Sekolah</option>
            </select>
          </div>

          <div>
            <label htmlFor="man-origin-name" className="block text-xs font-semibold text-slate-700">
              Nama Sekolah Asal
            </label>
            <input
              id="man-origin-name"
              type="text"
              value={originSchoolName}
              onChange={(e) => setOriginSchoolName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="man-wa" className="block text-xs font-semibold text-slate-700">
              No. WhatsApp Orang Tua *
            </label>
            <input
              id="man-wa"
              type="tel"
              required
              placeholder="0812..."
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor="man-father" className="block text-xs font-semibold text-slate-700">
              Nama Ayah
            </label>
            <input
              id="man-father"
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="man-mother" className="block text-xs font-semibold text-slate-700">
              Nama Ibu
            </label>
            <input
              id="man-mother"
              type="text"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="man-addr" className="block text-xs font-semibold text-slate-700">
              Alamat Lengkap
            </label>
            <input
              id="man-addr"
              type="text"
              value={addressStreet}
              onChange={(e) => setAddressStreet(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2.5 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-900 disabled:bg-slate-400"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Simpan Pendaftar Offline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

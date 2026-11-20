import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileCheck2,
  Globe,
  HeartHandshake,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import type { PpdbSettings } from '../types/ppdb';
import { normalizeWhatsappForLink } from '../utils/ppdbRules';
import { MadrasahEmblem } from './MadrasahEmblem';
import type { AppView } from './Navbar';

interface LandingPageProps {
  settings: PpdbSettings;
  acceptedCount: number;
  totalApplicants: number;
  onNavigate: (view: AppView) => void;
}

const FAQ_ITEMS = [
  {
    q: 'Berapa batas usia minimal untuk mendaftar kelas 1 di MIS Darussalam?',
    a: 'Sesuai regulasi Kementerian Agama dan Kemendikbud, calon peserta didik baru diprioritaskan berusia minimal 6 tahun pada tanggal 1 Juli 2026. Calon siswa berusia 5 tahun 6 bulan hingga 5 tahun 11 bulan dapat dipertimbangkan berdasarkan hasil observasi kesiapan belajar oleh tim pendidik madrasah.',
  },
  {
    q: 'Berapa biaya pendaftaran dan apakah ada biaya formulir?',
    a: 'Pendaftaran online maupun offline di MIS Darussalam tidak dipungut biaya formulir (Rp 0 / Gratis). Rincian infaq pengembangan pendidikan dan perlengkapan hanya dibayarkan saat tahap Daftar Ulang bagi peserta didik yang dinyatakan Diterima.',
  },
  {
    q: 'Apakah PPDB MIS Darussalam menggunakan sistem zonasi?',
    a: 'MIS Darussalam merupakan Madrasah Ibtidaiyah Swasta sehingga tidak menerapkan pembatasan zonasi wilayah. Orang tua dari berbagai kecamatan maupun kabupaten sekitar dapat mendaftar selama berkomitmen mendampingi proses pendidikan anak.',
  },
  {
    q: 'Apa saja seragam yang digunakan peserta didik MIS Darussalam?',
    a: 'Peserta didik menggunakan seragam merah-putih khas madrasah, seragam batik identitas MIS Darussalam, seragam muslim/koko & gamis hari Jumat, serta seragam olahraga dan Pramuka. Seluruh paket seragam disiapkan pada tahap daftar ulang.',
  },
  {
    q: 'Bagaimana jam belajar efektif di MIS Darussalam?',
    a: 'Kegiatan belajar mengajar berlangsung hari Senin s.d. Jumat pukul 07.15 – 13.30 WIB (diawali pembiasaan Sholat Dhuha, murajaah Tahfidz, dan ditutup Sholat Dzuhur berjamaah). Khusus hari Jumat pulang pukul 11.15 WIB dan kegiatan Pramuka/Ekstrakurikuler dilaksanakan di hari Sabtu pagi.',
  },
  {
    q: 'Bagaimana jika berkas yang diunggah kurang jelas atau perlu perbaikan?',
    a: 'Panitia akan memberikan catatan perbaikan spesifik pada sistem. Orang tua dapat membuka menu "Cek Status", memasukkan Nomor Pendaftaran/NIK dan Tanggal Lahir anak, lalu langsung mengunggah ulang berkas yang diminta tanpa perlu mengisi ulang formulir dari awal.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  acceptedCount,
  totalApplicants,
  onNavigate,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [tahfidzImgFailed, setTahfidzImgFailed] = useState(false);
  const [libraryImgFailed, setLibraryImgFailed] = useState(false);

  const remainingQuota = Math.max(0, settings.quota - acceptedCount);
  const waLink = `https://wa.me/${normalizeWhatsappForLink(settings.contactWa)}`;

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white bg-islamic-pattern">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Copy */}
            <div className="flex flex-col justify-center lg:col-span-7">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>
                  {settings.isOpen
                    ? `Pendaftaran Tahun Ajaran ${settings.academicYear} Dibuka!`
                    : `Pendaftaran Tahun Ajaran ${settings.academicYear} Ditutup Sementara`}
                </span>
              </div>

              <h1
                className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
                style={{ textWrap: 'balance', lineHeight: 1.15 }}
              >
                Membentuk Generasi Qur&apos;ani, Cerdas, dan Berakhlak Karimah bersama MIS Darussalam
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Memadukan Kurikulum Nasional &amp; Kementerian Agama dengan program unggulan Tahfidz Al-Qur&apos;an, pembiasaan adab Islami harian, dan pembelajaran bilingual dasar yang ramah anak.
              </p>

              {/* CTA Pair */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  disabled={!settings.isOpen}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <span>Daftar Online Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('status')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:border-emerald-700 hover:bg-emerald-50/40 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  <Search className="h-4 w-4 text-emerald-700" />
                  <span>Cek Status &amp; Cetak Kartu</span>
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Pendaftaran tanpa biaya formulir · Terintegrasi sistem verifikasi berkas daring · Dukungan layanan panitia aktif
              </p>
            </div>

            {/* Right Visual Frame */}
            <div className="lg:col-span-5">
              <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-200 bg-emerald-950 lg:h-full lg:min-h-[380px]">
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/hero_madrasah_campus_1795188079686.jpg"
                    alt="Lingkungan gedung madrasah MIS Darussalam yang asri dan modern"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-8 text-center text-white">
                    <MadrasahEmblem className="h-16 w-16 mb-3" onDark />
                    <p className="font-display text-lg font-bold">Kampus MIS Darussalam</p>
                    <p className="mt-1 text-xs text-emerald-200">Lingkungan Belajar Islami, Nyaman &amp; Asri</p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-5 text-white">
                  <p className="text-xs font-medium text-amber-300">
                    Madrasah Ibtidaiyah Swasta Darussalam
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    Lingkungan Belajar Nyaman, Aman, dan Berkarakter Islami
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Quick Institutional Stats Strip */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-slate-200 pt-8 lg:grid-cols-4 lg:gap-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <p className="text-xs font-medium text-slate-500">Akreditasi Madrasah</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums text-emerald-800">
                A (Unggul)
              </p>
              <p className="mt-1 text-xs text-slate-600">Terakreditasi BAN-S/M</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <p className="text-xs font-medium text-slate-500">Pilihan Ekstrakurikuler</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums text-emerald-800">
                8 Bidang
              </p>
              <p className="mt-1 text-xs text-slate-600">Panahan, Hadroh, Pramuka &amp; Sains</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <p className="text-xs font-medium text-slate-500">Target Program Tahfidz</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums text-emerald-800">
                Juz 30 &amp; 29
              </p>
              <p className="mt-1 text-xs text-slate-600">Bimbingan talaqqi bersanad</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
              <p className="text-xs font-medium text-amber-800">Kuota Tersedia TA {settings.academicYear}</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums text-amber-700">
                {remainingQuota} / {settings.quota} Kursi
              </p>
              <p className="mt-1 text-xs text-amber-800/80">
                {totalApplicants} berkas pendaftar tercatat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ALUR PENDAFTARAN (4 LANGKAH VISUAL) */}
      <section id="alur-syarat" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider uppercase text-emerald-700">
            Alur Penerimaan Siswa Baru
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            4 Langkah Mudah Mendaftar di MIS Darussalam
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Seluruh tahapan dirancang ringkas agar orang tua dapat menyelesaikan pendaftaran dari rumah dengan nyaman.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              num: '01',
              title: 'Isi Formulir Online',
              desc: 'Lengkapi biodata calon peserta didik dan data orang tua/wali. Progres tersimpan otomatis.',
            },
            {
              num: '02',
              title: 'Unggah Berkas Persyaratan',
              desc: 'Siapkan foto/scan Akta Kelahiran, Kartu Keluarga, KTP Orang Tua, dan Pas Foto 3x4.',
            },
            {
              num: '03',
              title: 'Verifikasi Data Panitia',
              desc: 'Tim panitia memeriksa kelengkapan dokumen dan menjadwalkan observasi kesiapan belajar.',
            },
            {
              num: '04',
              title: 'Pengumuman & Daftar Ulang',
              desc: 'Pantau hasil kelulusan melalui menu Cek Status dan selesaikan daftar ulang sesuai jadwal.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div>
                <span className="font-mono text-sm font-bold text-amber-600">
                  {step.num}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-3 text-xs font-medium text-emerald-800">
                Tahap {step.num} dari 04
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROGRAM UNGGULAN & FASILITAS */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-700">
                Kurikulum &amp; Lingkungan Belajar
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Program Unggulan &amp; Fasilitas Madrasah
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              Pendampingan akademik dan karakter Islami yang seimbang untuk masa emas usia sekolah dasar.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 with Generated Image */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 md:col-span-2 lg:col-span-1 flex flex-col">
              <div className="h-48 w-full overflow-hidden bg-emerald-900">
                {!tahfidzImgFailed ? (
                  <img
                    src="/src/assets/images/program_tahfidz_quran_1795188080771.jpg"
                    alt="Suasana pembelajaran Tahfidz Al-Qur'an di kelas MIS Darussalam"
                    referrerPolicy="no-referrer"
                    onError={() => setTahfidzImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-emerald-100">
                    <BookOpen className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 text-emerald-800">
                  <BookOpen className="h-5 w-5 shrink-0" />
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Tahfidz Al-Qur&apos;an (Juz 30 &amp; 29)
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Pembinaan tahsin dan hafalan Al-Qur&apos;an terstruktur setiap pagi dengan metode talaqqi kelompok kecil sesuai kemampuan anak.
                </p>
              </div>
            </div>

            {/* Card 2 with Generated Image */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col">
              <div className="h-48 w-full overflow-hidden bg-emerald-900">
                {!libraryImgFailed ? (
                  <img
                    src="/src/assets/images/program_madrasah_library_1795188079520.jpg"
                    alt="Perpustakaan modern dan ruang literasi MIS Darussalam"
                    referrerPolicy="no-referrer"
                    onError={() => setLibraryImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-emerald-100">
                    <Building2 className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Building2 className="h-5 w-5 shrink-0" />
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Perpustakaan &amp; Literasi Anak
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Koleksi buku bacaan Islami, ensiklopedia sains anak, dan pojok literasi yang nyaman untuk menumbuhkan minat baca sejak kelas 1.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                  Pembiasaan Ibadah Harian
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Sholat Dhuha, dzikir pagi, praktik wudhu yang benar, dan Sholat Dzuhur berjamaah dipandu langsung oleh wali kelas dan guru agama.
                </p>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-500">
                Pembinaan adab &amp; akhlak terintegrasi
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                  Bilingual Dasar (Arab &amp; Inggris)
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Pengenalan kosakata harian Bahasa Arab dan Bahasa Inggris secara komunikatif melalui lagu, percakapan ringan, dan papan kelas bilingual.
                </p>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-500">
                Kurikulum Merdeka &amp; Kemenag RI
              </p>
            </div>

            {/* Card 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                  Ruang Kelas Nyaman &amp; Kondusif
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Rasio maksimal 24–28 siswa per rombel dilengkapi pendingin ruangan, proyektor pembelajaran interaktif, dan loker pribadi siswa.
                </p>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-500">
                Pendampingan guru kelas &amp; guru pendamping
              </p>
            </div>

            {/* Card 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                  Ekstrakurikuler Beragam
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Mengembangkan bakat dan ketangkasan melalui Pramuka, Hadroh, Panahan Sunnah, Drumband, Pencak Silat, Kaligrafi, dan Klub Olimpiade Sains.
                </p>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-500">
                8 ekstrakurikuler aktif setiap pekan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. JADWAL & GELOMBANG PENDAFTARAN */}
      <section id="jadwal" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider uppercase text-emerald-700">
            Linimasa Seleksi &amp; Daftar Ulang
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Jadwal &amp; Gelombang Pendaftaran TA {settings.academicYear}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Gelombang 1 */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-emerald-900">
                  {settings.wave1Dates.label}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {settings.wave1Dates.benefitNote}
                </p>
              </div>
              <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                Prioritas Kuota
              </span>
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-100 pb-3">
                <dt className="text-slate-500 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Tanggal Pendaftaran</span>
                </dt>
                <dd className="font-semibold text-slate-900 tabular-nums">
                  {settings.wave1Dates.registrationDates}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-100 pb-3">
                <dt className="text-slate-500 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Observasi Kesiapan Belajar</span>
                </dt>
                <dd className="font-semibold text-slate-900">
                  {settings.wave1Dates.observationDate}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-100 pb-3">
                <dt className="text-slate-500 flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Pengumuman Hasil</span>
                </dt>
                <dd className="font-semibold text-slate-900">
                  {settings.wave1Dates.announcementDate}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <dt className="text-slate-500 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Jadwal Daftar Ulang</span>
                </dt>
                <dd className="font-semibold text-emerald-800">
                  {settings.wave1Dates.reRegistrationDates}
                </dd>
              </div>
            </dl>
          </div>

          {/* Gelombang 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {settings.wave2Dates.label}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {settings.wave2Dates.benefitNote}
                </p>
              </div>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Gelombang Reguler
              </span>
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-100 pb-3">
                <dt className="text-slate-500 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-600 shrink-0" />
                  <span>Tanggal Pendaftaran</span>
                </dt>
                <dd className="font-semibold text-slate-900 tabular-nums">
                  {settings.wave2Dates.registrationDates}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-100 pb-3">
                <dt className="text-slate-500 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600 shrink-0" />
                  <span>Observasi Kesiapan Belajar</span>
                </dt>
                <dd className="font-semibold text-slate-900">
                  {settings.wave2Dates.observationDate}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-100 pb-3">
                <dt className="text-slate-500 flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-600 shrink-0" />
                  <span>Pengumuman Hasil</span>
                </dt>
                <dd className="font-semibold text-slate-900">
                  {settings.wave2Dates.announcementDate}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <dt className="text-slate-500 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-slate-600 shrink-0" />
                  <span>Jadwal Daftar Ulang</span>
                </dt>
                <dd className="font-semibold text-slate-900">
                  {settings.wave2Dates.reRegistrationDates}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* 5. SYARAT PENDAFTARAN & DOKUMEN */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-700">
                Persyaratan Administrasi
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Syarat Usia &amp; Dokumen Digital
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Pastikan seluruh dokumen difoto atau dipindai dengan pencahayaan terang dan teks terbaca jelas sebelum diunggah dalam format JPG, PNG, atau PDF (maksimal 2 MB per berkas).
              </p>

              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
                <p className="text-sm font-bold text-emerald-950">Ketentuan Biaya Pendaftaran</p>
                <p className="mt-1 text-sm text-emerald-800">{settings.registrationFee}</p>
                <p className="mt-3 text-xs font-semibold text-emerald-950">Estimasi Daftar Ulang (Jika Diterima):</p>
                <p className="mt-0.5 text-xs leading-relaxed text-emerald-800">
                  {settings.reRegistrationFee}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Usia Minimal 6 Tahun per 1 Juli 2026',
                  desc: 'Prioritas usia ≥ 6 tahun. Usia 5 tahun 6 bulan – 5 tahun 11 bulan dipertimbangkan melalui observasi.',
                  required: 'Syarat Utama',
                },
                {
                  title: 'Akta Kelahiran Calon Siswa',
                  desc: 'Scan atau foto Akta Kelahiran asli yang dikeluarkan Dinas Dukcapil.',
                  required: 'Dokumen Wajib',
                },
                {
                  title: 'Kartu Keluarga (KK)',
                  desc: 'Scan atau foto KK terbaru yang mencantumkan NIK calon peserta didik.',
                  required: 'Dokumen Wajib',
                },
                {
                  title: 'KTP Orang Tua / Wali',
                  desc: 'Scan atau foto KTP Ayah atau Ibu (atau Wali jika tinggal bersama wali).',
                  required: 'Dokumen Wajib',
                },
                {
                  title: 'Pas Foto Resmi 3x4',
                  desc: 'Foto terbaru berlatar belakang merah atau biru dengan pakaian rapi.',
                  required: 'Dokumen Wajib',
                },
                {
                  title: 'Ijazah / Surat Keterangan TK/RA',
                  desc: 'Surat keterangan aktif atau SKL dari TK/RA asal (dapat menyusul saat daftar ulang).',
                  required: 'Opsional / Menyusul',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-xs font-medium text-amber-700">{item.required}</p>
                    <h3 className="mt-0.5 text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-wider uppercase text-emerald-700">
            Tanya Jawab Seputar PPDB
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pertanyaan yang Sering Diajukan Orang Tua
          </h2>
        </div>

        <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700"
                >
                  <span className="text-sm font-semibold text-slate-900 sm:text-base">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-emerald-200 bg-emerald-900 p-8 text-white sm:flex-row">
          <div>
            <h3 className="font-display text-xl font-bold">
              Siap mendaftarkan ananda di MIS Darussalam?
            </h3>
            <p className="mt-1 text-sm text-emerald-100">
              Formulir online hanya membutuhkan waktu sekitar 5–10 menit dan dapat dilanjutkan kapan saja.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            disabled={!settings.isOpen}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:bg-slate-400"
          >
            <span>Mulai Pendaftaran</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="relative border-t border-emerald-900 bg-emerald-950 text-emerald-100 bg-islamic-pattern-light">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Profil Madrasah */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <MadrasahEmblem className="h-10 w-10 shrink-0" onDark />
                <div>
                  <p className="font-display text-lg font-bold text-white">MIS Darussalam</p>
                  <p className="text-xs text-emerald-300">Madrasah Ibtidaiyah Swasta</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-emerald-100/85">
                Lembaga pendidikan dasar Islam berakreditasi A yang berkomitmen melahirkan generasi pecinta Al-Qur&apos;an, unggul dalam literasi &amp; numerasi, serta santun dalam perilaku.
              </p>
            </div>

            {/* Alamat & Jam Layanan */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-amber-300">
                Sekretariat PPDB
              </h4>
              <div className="flex items-start gap-3 text-sm text-emerald-100/90">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>{settings.schoolAddress}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-emerald-100/90">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>{settings.secretariatHours}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-emerald-100/90">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-white underline-offset-4 hover:underline"
                >
                  WhatsApp Panitia: {settings.contactWa}
                </a>
              </div>
            </div>

            {/* Peta Lokasi Embed Placeholder */}
            <div className="lg:col-span-4">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-amber-300">
                Peta Lokasi Madrasah
              </h4>
              <div className="mt-3 overflow-hidden rounded-xl border border-emerald-800 bg-emerald-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Kampus MIS Darussalam</p>
                    <p className="mt-0.5 text-xs text-emerald-200/80">
                      Cibinong, Kabupaten Bogor · Akses mudah jalur utama
                    </p>
                  </div>
                  <MapPin className="h-6 w-6 shrink-0 text-amber-400" />
                </div>
                <div className="mt-3 h-24 rounded-lg border border-emerald-800/80 bg-emerald-950/60 flex items-center justify-center text-xs text-emerald-200/90">
                  <span>Koordinat Kampus: -6.4852° LS, 106.8427° BT</span>
                </div>
                <a
                  href="https://maps.google.com/?q=Cibinong+Bogor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200"
                >
                  <span>Buka di Google Maps</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-emerald-800/80 pt-6 text-xs text-emerald-200/75 sm:flex-row">
            <p>
              © {new Date().getFullYear()} MIS Darussalam. Hak Cipta Dilindungi Undang-Undang.
            </p>
            <p>Portal Resmi PPDB Tahun Ajaran {settings.academicYear}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

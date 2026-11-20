import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, Eye, Users } from 'lucide-react';
import type { PpdbSettings, RegistrationRecord } from '../types/ppdb';
import { computeAdminAnalytics, STATUS_META } from '../utils/ppdbRules';

interface AdminOverviewProps {
  records: RegistrationRecord[];
  settings: PpdbSettings;
  onInspectRecord: (record: RegistrationRecord) => void;
  onGoToTable: () => void;
}

const GENDER_COLORS = ['#047857', '#D97706'];
const ORIGIN_COLORS = ['#047857', '#065F46', '#D97706', '#64748B'];

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  records,
  settings,
  onInspectRecord,
  onGoToTable,
}) => {
  const analytics = useMemo(
    () => computeAdminAnalytics(records, settings.quota),
    [records, settings.quota]
  );

  const latestFive = useMemo(
    () =>
      [...records]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [records]
  );

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pendaftar</span>
            <Users className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-slate-900">
            {analytics.total} Siswa
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Terverifikasi siap observasi: {analytics.verified}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Menunggu Verifikasi</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-amber-700">
            {analytics.pending} Berkas
          </p>
          <p className="mt-1 text-xs text-slate-500">Perlu diperiksa oleh panitia</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Perlu Revisi Berkas</span>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-red-700">
            {analytics.needsRevision} Berkas
          </p>
          <p className="mt-1 text-xs text-slate-500">Menunggu unggah ulang orang tua</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">Diterima (Lulus)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-emerald-900">
            {analytics.accepted} / {settings.quota}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-emerald-200">
              <div
                className="h-full bg-emerald-700"
                style={{ width: `${analytics.quotaPercentage}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-900">
              {analytics.quotaPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Bar Chart: Tren Pendaftar */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Tren Pendaftar Masuk
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Distribusi jumlah pendaftar berdasarkan tanggal pendaftaran terbaru
          </p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dailyTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip
                  formatter={(value) => [`${Number(value ?? 0)} Pendaftar`, 'Jumlah']}
                  contentStyle={{ borderRadius: '8px', borderColor: '#cbd5e1', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#047857" radius={[6, 6, 0, 0]} maxBarSize={42} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts: Gender & Asal TK/RA */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-base font-bold text-slate-900">
              Sebaran Jenis Kelamin
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Proporsi putra &amp; putri</p>
            <div className="mt-3 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.byGender}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {analytics.byGender.map((entry, idx) => (
                      <Cell key={entry.name} fill={GENDER_COLORS[idx % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${Number(value ?? 0)} Siswa`, 'Jumlah']}
                    contentStyle={{ borderRadius: '8px', borderColor: '#cbd5e1', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-center gap-4 text-xs">
              {analytics.byGender.map((g, idx) => (
                <div key={g.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: GENDER_COLORS[idx % GENDER_COLORS.length] }}
                  />
                  <span className="text-slate-700 font-medium">
                    {g.name}: <strong className="tabular-nums">{g.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-base font-bold text-slate-900">
              Asal TK / RA / PAUD
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Latar belakang pendidikan awal</p>
            <div className="mt-3 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.byOrigin.filter((d) => d.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {analytics.byOrigin
                      .filter((d) => d.value > 0)
                      .map((entry, idx) => (
                        <Cell key={entry.name} fill={ORIGIN_COLORS[idx % ORIGIN_COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${Number(value ?? 0)} Siswa`, 'Jumlah']}
                    contentStyle={{ borderRadius: '8px', borderColor: '#cbd5e1', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
              {analytics.byOrigin.map((o, idx) => (
                <div key={o.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: ORIGIN_COLORS[idx % ORIGIN_COLORS.length] }}
                  />
                  <span className="text-slate-700">
                    {o.name}: <strong className="tabular-nums">{o.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Pendaftar Terbaru */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              5 Pendaftar Terbaru Masuk
            </h2>
            <p className="text-xs text-slate-500">Klik Periksa untuk memverifikasi berkas</p>
          </div>
          <button
            type="button"
            onClick={onGoToTable}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Lihat Semua Pendaftar →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">No. Pendaftaran</th>
                <th className="px-5 py-3">Nama Calon Siswa</th>
                <th className="px-5 py-3">Gelombang</th>
                <th className="px-5 py-3">Asal Sekolah</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latestFive.map((item) => {
                const meta = STATUS_META[item.status];
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {item.registrationNumber}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {item.studentData.fullName}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {item.wave}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      {item.studentData.originType}
                      {item.studentData.originSchoolName
                        ? ` · ${item.studentData.originSchoolName}`
                        : ''}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
                      >
                        {meta.shortLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onInspectRecord(item)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-emerald-700 hover:text-emerald-800"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Periksa</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

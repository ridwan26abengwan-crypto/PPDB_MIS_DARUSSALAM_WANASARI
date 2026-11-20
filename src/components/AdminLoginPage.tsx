import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { ppdbService } from '../services/ppdbService';
import type { AdminUser } from '../types/ppdb';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBack: () => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBack,
  onToast,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFillDemo = () => {
    setUsername('MIS DARUSSALAM');
    setPassword('Misdarussalam@26');
    setErrorMsg('');
    onToast('info', 'Akun Admin Terisi', 'Username: MIS DARUSSALAM siap digunakan.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan kata sandi wajib diisi.');
      return;
    }
    setIsLoading(true);
    try {
      const { user } = await ppdbService.loginAdmin(username, password);
      onToast('success', 'Berhasil Masuk', `Selamat datang, ${user.name}`);
      onLoginSuccess(user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal masuk.';
      setErrorMsg(msg);
      onToast('error', 'Login Panitia Gagal', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/70 p-1">
            <img
              src="/assets/aistudio/images_f21cb217.png"
              alt="Logo MIS Darussalam"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Area Terproteksi
            </p>
            <h1 className="font-display text-xl font-bold text-slate-900">
              Login Panitia PPDB
            </h1>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          Masuk menggunakan username resmi panitia untuk mengelola verifikasi berkas, edit data, hapus data, dan jadwal PPDB MIS Darussalam.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-username" className="block text-sm font-semibold text-slate-800">
              Username Admin
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="MIS DARUSSALAM"
              autoComplete="username"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-800">
              Kata Sandi
            </label>
            <div className="relative mt-1">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:bg-slate-400"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Masuk Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Isi Akun Demo Admin</span>
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Halaman Publik</span>
          </button>
        </div>
      </div>
    </div>
  );
};

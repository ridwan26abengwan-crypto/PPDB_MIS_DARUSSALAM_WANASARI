import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastItem } from '../types/ppdb';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="no-print fixed bottom-4 left-4 z-50 flex w-full max-w-sm flex-col gap-2.5 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const styles =
          toast.type === 'success'
            ? 'border-emerald-200 bg-white text-slate-900'
            : toast.type === 'error'
              ? 'border-red-200 bg-white text-slate-900'
              : 'border-amber-200 bg-white text-slate-900';

        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
              ? AlertCircle
              : Info;

        const iconColor =
          toast.type === 'success'
            ? 'text-emerald-700'
            : toast.type === 'error'
              ? 'text-red-600'
              : 'text-amber-600';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg transition-all ${styles}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

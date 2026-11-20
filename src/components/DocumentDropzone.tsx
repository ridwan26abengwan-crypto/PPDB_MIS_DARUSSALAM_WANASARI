import React, { useRef, useState } from 'react';
import { FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import type { UploadedDocument } from '../types/ppdb';

interface DocumentDropzoneProps {
  docKey: string;
  label: string;
  description: string;
  required?: boolean;
  value: UploadedDocument | null;
  onChange: (doc: UploadedDocument | null) => void;
  onError: (msg: string) => void;
}

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  docKey,
  label,
  description,
  required = false,
  value,
  onChange,
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const processFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      onError(`Format file "${file.name}" tidak didukung. Gunakan JPG, PNG, atau PDF.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      onError(`Ukuran file "${file.name}" melebihi batas maksimal 2 MB.`);
      return;
    }

    setIsReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      onChange({
        id: `${docKey}-${Date.now()}`,
        label,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        dataUrl: result,
        uploadedAt: new Date().toISOString(),
      });
      setIsReading(false);
    };
    reader.onerror = () => {
      setIsReading(false);
      onError(`Gagal membaca file "${file.name}". Silakan coba lagi.`);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const isPdf = value?.mimeType === 'application/pdf';
  const sizeKb = value ? Math.max(1, Math.round(value.sizeBytes / 1024)) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {label}{' '}
            {required ? (
              <span className="text-red-600">*</span>
            ) : (
              <span className="text-xs font-normal text-slate-500">(Opsional)</span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Hapus berkas ${label}`}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        id={`upload-${docKey}`}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        onChange={handleFileChange}
        className="sr-only"
      />

      {isReading ? (
        <div className="mt-3 flex h-32 items-center justify-center rounded-lg border border-dashed border-emerald-300 bg-emerald-50/40 text-sm text-emerald-800">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Memproses berkas...</span>
        </div>
      ) : value ? (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center rounded-lg border border-emerald-200 bg-emerald-50/30 p-3">
          {isPdf ? (
            <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-md border border-slate-200 bg-white text-red-600">
              <FileText className="h-8 w-8" />
              <span className="mt-1 text-[10px] font-bold uppercase">PDF</span>
            </div>
          ) : (
            <img
              src={value.dataUrl}
              alt={`Pratinjau ${label}`}
              className="h-24 w-32 shrink-0 rounded-md border border-slate-200 bg-white object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{value.fileName}</p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">
              {sizeKb} KB · Siap diunggah
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ganti File
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-3 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
            isDragging
              ? 'border-emerald-600 bg-emerald-50'
              : 'border-slate-300 bg-slate-50/60 hover:border-emerald-500'
          }`}
        >
          <UploadCloud className="h-7 w-7 text-emerald-700" />
          <p className="mt-2 text-xs text-slate-600">
            Seret &amp; lepas file ke sini, atau{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
            >
              pilih file dari perangkat
            </button>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Format JPG, PNG, atau PDF · Maksimal 2 MB
          </p>
        </div>
      )}
    </div>
  );
};

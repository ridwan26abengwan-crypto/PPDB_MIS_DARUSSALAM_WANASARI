import React from 'react';

import type { KopSuratConfig } from '../types/ppdb';
import { resolveKopSuratConfig } from '../utils/ppdbRules';

/**
 * Logo resmi Yayasan Daaruttaqwa Wanasari (tiga lengkung kuning, biru, hijau + wordmark).
 */
export const YayasanDaaruttaqwaEmblem: React.FC<{ className?: string }> = ({
  className = 'h-24 w-24',
}) => (
  <svg
    viewBox="0 0 130 142"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Logo Yayasan Daaruttaqwa Wanasari"
  >
    <path
      d="M65 8C42 26 24 53 27 84C28 94 31 102 35 107C34 98 35 84 42 70C49 55 59 44 65 39C71 44 81 55 88 70C95 84 96 98 95 107C99 102 102 94 103 84C106 53 88 26 65 8Z"
      fill="#D7DF23"
    />
    <path
      d="M65 26C47 41 34 64 36 89C37 97 39 104 42 108C43 99 46 86 52 75C57 65 62 59 65 56C68 59 73 65 78 75C84 86 87 99 88 108C91 104 93 97 94 89C96 64 83 41 65 26Z"
      fill="#27AAE1"
    />
    <path
      d="M65 44C51 56 42 74 44 95C45 101 47 106 49 109C53 102 58 97 65 94C72 97 77 102 81 109C83 106 85 101 86 95C88 74 79 56 65 44Z"
      fill="#00A651"
    />
    <path
      d="M65 88C59 91 54 97 50 106C55 103 60 101 65 101C70 101 75 103 80 106C76 97 71 91 65 88Z"
      fill="#FFFFFF"
      fillOpacity="0.92"
    />
    <text
      x="65"
      y="119"
      textAnchor="middle"
      fill="#0F172A"
      fontFamily="Plus Jakarta Sans, Arial, sans-serif"
      fontSize="9.5"
      fontWeight="600"
      letterSpacing="0.8"
    >
      YAYASAN
    </text>
    <text
      x="65"
      y="130"
      textAnchor="middle"
      fill="#0F172A"
      fontFamily="Plus Jakarta Sans, Arial, sans-serif"
      fontSize="11.5"
      fontWeight="800"
      letterSpacing="0.3"
    >
      DAARUTTAQWA
    </text>
    <text
      x="65"
      y="140.5"
      textAnchor="middle"
      fill="#0F172A"
      fontFamily="Plus Jakarta Sans, Arial, sans-serif"
      fontSize="11"
      fontWeight="800"
      letterSpacing="0.5"
    >
      WANASARI
    </text>
  </svg>
);

interface OfficialKopSuratProps {
  config?: Partial<KopSuratConfig> | null;
  topLabel?: string;
  compact?: boolean;
  testId?: string;
}

export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({
  config,
  topLabel,
  compact = false,
  testId = 'kop-surat-resmi',
}) => {
  const resolved = resolveKopSuratConfig(config);
  const effectiveTopLabel = topLabel !== undefined ? topLabel : resolved.topLabel;

  return (
    <header data-testid={testId}>
      <div
        className={`grid items-center gap-1.5 pb-2 sm:gap-4 ${
          compact
            ? 'grid-cols-[52px_1fr_56px] sm:grid-cols-[84px_1fr_92px]'
            : 'grid-cols-[52px_1fr_56px] sm:grid-cols-[96px_1fr_104px]'
        }`}
      >
        {/* Logo Kiri: Default Kemenag atau Logo Kustom Admin */}
        <div className="flex items-center justify-center">
          <img
            src={resolved.leftLogoDataUrl || '/assets/aistudio/images_f21cb217.png'}
            alt="Logo Kiri Kop Surat"
            className={`object-contain ${
              compact ? 'h-12 w-12 sm:h-20 sm:w-20' : 'h-12 w-12 sm:h-24 sm:w-24'
            }`}
          />
        </div>

        {/* Teks Tengah Kop Surat */}
        <div className="text-center text-black">
          {effectiveTopLabel.trim() && (
            <p
              className={`font-display font-extrabold uppercase tracking-wide leading-tight ${
                compact ? 'text-xs sm:text-lg' : 'text-xs sm:text-xl'
              }`}
            >
              {effectiveTopLabel}
            </p>
          )}
          <p
            className={`mt-0.5 font-bold uppercase tracking-tight leading-snug ${
              compact ? 'text-[9.5px] sm:text-[14px]' : 'text-[9.5px] sm:text-[15.5px]'
            }`}
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {resolved.foundationName}
          </p>
          <h1
            className={`mt-0.5 font-black uppercase tracking-wide leading-tight ${
              compact ? 'text-[11px] sm:text-[18px]' : 'text-[11px] sm:text-[20px]'
            }`}
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {resolved.madrasahName}
          </h1>
          {resolved.accreditation.trim() && (
            <p
              className={`mt-0.5 font-bold uppercase leading-snug ${
                compact ? 'text-[10px] sm:text-[13.5px]' : 'text-[10px] sm:text-[15px]'
              }`}
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {resolved.accreditation}
            </p>
          )}
          {resolved.decreeNumber.trim() && (
            <p
              className={`font-semibold leading-snug ${
                compact ? 'text-[9.5px] sm:text-[13px]' : 'text-[9.5px] sm:text-[14px]'
              }`}
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {resolved.decreeNumber}
            </p>
          )}
        </div>

        {/* Logo Kanan: Default Yayasan Daaruttaqwa atau Logo Kustom Admin */}
        <div className="flex items-center justify-center">
          {resolved.rightLogoDataUrl ? (
            <img
              src={resolved.rightLogoDataUrl}
              alt="Logo Kanan Kop Surat"
              className={`object-contain ${
                compact ? 'h-12 w-12 sm:h-20 sm:w-20' : 'h-12 w-12 sm:h-24 sm:w-24'
              }`}
            />
          ) : (
            <YayasanDaaruttaqwaEmblem
              className={
                compact
                  ? 'h-[58px] w-[54px] sm:h-[86px] sm:w-[80px]'
                  : 'h-[58px] w-[54px] sm:h-[98px] sm:w-[92px]'
              }
            />
          )}
        </div>
      </div>

      {/* Bilah Alamat Bergaris Hitam Tebal Atas & Bawah */}
      <div className="mt-1 border-t-[2.5px] border-b-[2.5px] border-black py-1 text-center sm:border-t-[3px] sm:border-b-[3px]">
        <p
          className="text-[9.5px] font-bold tracking-tight text-black sm:text-[13px]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {resolved.addressLine}
        </p>
      </div>
    </header>
  );
};

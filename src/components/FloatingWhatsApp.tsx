import React from 'react';
import { MessageCircle } from 'lucide-react';
import { normalizeWhatsappForLink } from '../utils/ppdbRules';

interface FloatingWhatsAppProps {
  contactWa: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ contactWa }) => {
  const waDigits = normalizeWhatsappForLink(contactWa || '081234567890');
  const message = encodeURIComponent(
    "Assalamu'alaikum Panitia PPDB MIS Darussalam, saya ingin bertanya mengenai pendaftaran peserta didik baru TA 2026/2027."
  );

  return (
    <a
      href={`https://wa.me/${waDigits}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Bantuan Cepat WhatsApp Panitia PPDB"
      className="no-print fixed right-4 bottom-4 z-30 inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-5 w-5 shrink-0" />
      <span className="hidden sm:inline whitespace-nowrap">Bantuan Panitia</span>
    </a>
  );
};

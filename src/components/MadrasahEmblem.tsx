import React from 'react';

interface MadrasahEmblemProps {
  className?: string;
  onDark?: boolean;
}

export const MadrasahEmblem: React.FC<MadrasahEmblemProps> = ({
  className = 'h-9 w-9',
  onDark = false,
}) => {
  if (onDark) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-white/95 p-0.5 shadow-sm ${className}`}
      >
        <img
          src="/assets/aistudio/images_f21cb217.png"
          alt="Logo MIS Darussalam"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <img
      src="/assets/aistudio/images_f21cb217.png"
      alt="Logo MIS Darussalam"
      className={`object-contain ${className}`}
    />
  );
};

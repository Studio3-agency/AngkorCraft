import React from 'react';

interface Props {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

/** Round avatar: shows the photo when available, else initials on a tinted disc. */
export const Avatar: React.FC<Props> = ({ name, src, size = 40, className = '' }) => {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.4) };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        referrerPolicy="no-referrer"
        style={{ width: size, height: size }}
        className={`rounded-full object-cover bg-[#F2EDE4] shrink-0 ${className}`}
      />
    );
  }
  return (
    <span
      style={style}
      className={`rounded-full bg-[#FF914D]/15 text-[#134E4A] font-bold flex items-center justify-center shrink-0 ${className}`}
    >
      {initials}
    </span>
  );
};

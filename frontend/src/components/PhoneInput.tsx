import React, { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';

// Cambodia first, then common visitor origins. dial = country calling code.
const COUNTRIES: { flag: string; name: string; dial: string }[] = [
  { flag: '🇰🇭', name: 'Cambodia', dial: '+855' },
  { flag: '🇺🇸', name: 'USA / Canada', dial: '+1' },
  { flag: '🇬🇧', name: 'United Kingdom', dial: '+44' },
  { flag: '🇫🇷', name: 'France', dial: '+33' },
  { flag: '🇩🇪', name: 'Germany', dial: '+49' },
  { flag: '🇨🇳', name: 'China', dial: '+86' },
  { flag: '🇰🇷', name: 'South Korea', dial: '+82' },
  { flag: '🇯🇵', name: 'Japan', dial: '+81' },
  { flag: '🇹🇭', name: 'Thailand', dial: '+66' },
  { flag: '🇻🇳', name: 'Vietnam', dial: '+84' },
  { flag: '🇱🇦', name: 'Laos', dial: '+856' },
  { flag: '🇸🇬', name: 'Singapore', dial: '+65' },
  { flag: '🇲🇾', name: 'Malaysia', dial: '+60' },
  { flag: '🇦🇺', name: 'Australia', dial: '+61' },
  { flag: '🇮🇳', name: 'India', dial: '+91' },
  { flag: '🇮🇩', name: 'Indonesia', dial: '+62' },
  { flag: '🇵🇭', name: 'Philippines', dial: '+63' },
  { flag: '🇳🇱', name: 'Netherlands', dial: '+31' },
  { flag: '🇮🇹', name: 'Italy', dial: '+39' },
  { flag: '🇪🇸', name: 'Spain', dial: '+34' },
  { flag: '🇨🇭', name: 'Switzerland', dial: '+41' },
  { flag: '🇸🇪', name: 'Sweden', dial: '+46' },
  { flag: '🇦🇪', name: 'UAE', dial: '+971' },
  { flag: '🇭🇰', name: 'Hong Kong', dial: '+852' },
  { flag: '🇹🇼', name: 'Taiwan', dial: '+886' },
  { flag: '🇳🇿', name: 'New Zealand', dial: '+64' },
  { flag: '🇧🇷', name: 'Brazil', dial: '+55' },
  { flag: '🇷🇺', name: 'Russia', dial: '+7' },
];

interface PhoneInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

/** Country-code dropdown + local number. Emits the full "+855 12345678" string. */
export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, placeholder }) => {
  // Parse an existing value into dial + rest, else default to Cambodia.
  const parse = (v: string): { dial: string; num: string } => {
    const match = COUNTRIES.map((c) => c.dial)
      .sort((a, b) => b.length - a.length)
      .find((d) => v.startsWith(d));
    if (match) return { dial: match, num: v.slice(match.length).trim() };
    return { dial: '+855', num: v };
  };

  const [dial, setDial] = useState(() => parse(value).dial);
  const [num, setNum] = useState(() => parse(value).num);

  useEffect(() => {
    onChange(num.trim() ? `${dial} ${num.trim()}` : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dial, num]);

  return (
    <div className="flex gap-2">
      <select
        value={dial}
        onChange={(e) => setDial(e.target.value)}
        className="bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF5A36] w-28 shrink-0"
      >
        {COUNTRIES.map((c) => (
          <option key={c.name} value={c.dial}>
            {c.flag} {c.dial}
          </option>
        ))}
      </select>
      <div className="relative flex-1">
        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BF5A36]" />
        <input
          type="tel"
          inputMode="tel"
          autoComplete="off"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF5A36]"
        />
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete = 'off',
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF914D]" />
      <input
        type={show ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF914D]"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A70] hover:text-[#FF914D] cursor-pointer p-1"
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

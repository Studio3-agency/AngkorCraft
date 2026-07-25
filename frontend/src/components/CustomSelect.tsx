import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (val: string) => void;
  className?: string;
  icon?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, options, onChange, className = '', icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full bg-[#F2EDE4] border border-[#134E4A]/10 rounded-full px-4 py-2 flex items-center justify-between text-xs text-[#2D2926] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FF914D] cursor-pointer"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#8C7A70] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-[#E8DEC8] rounded-xl shadow-lg overflow-y-auto max-h-60 py-1 w-full">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors ${
                opt.value === value
                  ? 'bg-[#134E4A] text-white'
                  : 'text-[#2D2926] hover:bg-[#F2EDE4]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

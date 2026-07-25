import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/** Compact EN / ខ្មែរ switch, reusable on auth screens and inside modals. */
export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 bg-[#F2EDE4] hover:bg-[#E8DEC8] border border-[#134E4A]/15 px-3 py-1.5 rounded-full text-xs font-bold text-[#134E4A] transition-all cursor-pointer whitespace-nowrap ${className}`}
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 text-[#FF914D] shrink-0" />
      <span className={language === 'en' ? 'text-[#FF914D]' : 'text-[#8C7A70]'}>EN</span>
      <span className="text-[#8C7A70]/40">/</span>
      <span className={language === 'kh' ? 'text-[#FF914D] font-sans' : 'text-[#8C7A70]'}>ខ្មែរ</span>
    </button>
  );
};

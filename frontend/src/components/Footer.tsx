import React from 'react';
import { Link } from 'react-router-dom';
import { PageType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { ShieldCheck, Heart, Banknote, Store, ChevronRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageType) => void;
  onOpenCurrencyConverter: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenCurrencyConverter }) => {
  const { t } = useLanguage();
  const { rate } = useCurrency();

  const exploreLinks: { page: PageType; label: string }[] = [
    { page: 'products', label: t('navProducts') },
    { page: 'locations', label: t('navShops') },
    { page: 'guide', label: t('navGuide') },
    { page: 'saved', label: t('navWishlist') },
  ];

  return (
    <footer className="bg-[#134E4A] text-[#F2EDE4] pt-12 pb-8 border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full shadow-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="AngkorCraft" className="w-full h-full object-contain" />
              </div>
              <div className="font-heading font-extrabold text-2xl text-white tracking-tight !font-['Poppins',sans-serif]">
                ANGKOR<span className="text-[#D4AF37]">CRAFT</span>
              </div>
            </div>
            <p className="text-sm text-[#F2EDE4]/80 leading-relaxed max-w-xs">{t('footerTagline')}</p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-4">{t('footerExplore')}</h3>
            <ul className="space-y-2.5 text-sm text-[#F2EDE4]/80">
              {exploreLinks.map((l) => (
                <li key={l.page}>
                  <button
                    onClick={() => onNavigate(l.page)}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For sellers + tools */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-1">{t('footerForSellers')}</h3>
            <Link
              to="/signup"
              className="w-full flex items-center justify-between bg-[#BF5A36] hover:bg-[#a34b2c] text-white p-3.5 rounded-2xl transition-colors cursor-pointer shadow-md"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <Store className="w-4 h-4 shrink-0" />
                {t('sellCta')}
              </span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
            <button
              onClick={onOpenCurrencyConverter}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 text-left p-3.5 rounded-2xl border border-white/10 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-[#F2EDE4]">
                <Banknote className="w-4 h-4 text-[#D4AF37] shrink-0" />
                {t('converterTitle')}
              </span>
              <span className="text-[11px] text-[#D4AF37] font-mono">${1}=៛{rate.toLocaleString()}</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#F2EDE4]/60">
          <div>© {new Date().getFullYear()} AngkorCraft. {t('allRightsReserved')}</div>
          <div className="flex items-center gap-1.5 text-[#D4AF37]">
            <span className="font-semibold">{t('footerMadeFor')}</span>
            <Heart className="w-3.5 h-3.5 fill-[#BF5A36] text-[#BF5A36]" />
          </div>
        </div>
      </div>
    </footer>
  );
};

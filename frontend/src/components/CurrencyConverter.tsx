import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { X, TrendingUp, RefreshCw } from 'lucide-react';

interface CurrencyConverterProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Live USD -> KHR rate for tourists to KNOW the real market rate. This is not an
 * exchange service — it's an informational reference with a small calculator.
 */
export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { rate, loading, updatedAt } = useCurrency();
  const [usd, setUsd] = useState<string>('10');

  if (!isOpen) return null;

  const usdValue = parseFloat(usd) || 0;
  const khrValue = Math.round(usdValue * rate);
  const presets = [1, 5, 10, 20, 50, 100];

  const cheatSheet = [
    { item: language === 'kh' ? 'ដូងស្រស់' : 'Fresh coconut', usd: 1 },
    { item: language === 'kh' ? 'ជិះរ៉ឺម៉ក (ចម្ងាយជិត)' : 'Tuk-tuk (short ride)', usd: 2 },
    { item: language === 'kh' ? 'ក្រមាតម្បាញដៃ' : 'Handwoven krama', usd: 6 },
    { item: language === 'kh' ? 'ម្រេចកំពត (១០០ក្រាម)' : 'Kampot pepper (100g)', usd: 8 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FDF8F3] rounded-3xl border border-[#E8DEC8] shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#134E4A] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#134E4A] flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-lg leading-tight">{t('liveRateTitle')}</h2>
              <p className="text-xs text-[#F2EDE4]/80">{t('liveRateSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Big live rate */}
          <div className="bg-white rounded-2xl border border-[#E8DEC8] p-5 text-center shadow-xs">
            <div className="text-xs font-semibold text-[#8C7A70] uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
              {loading ? (
                <RefreshCw className="w-3 h-3 animate-spin text-[#6B5E57]" />
              ) : updatedAt ? (
                <span className="text-[#6B5E57]">{t('exchangeRateBasis')} {updatedAt}</span>
              ) : null}
            </div>
            <div className="font-sans font-bold text-2xl sm:text-3xl text-[#134E4A]">
              $1 = <span className="text-[#BF5A36]">{Math.round(rate).toLocaleString()}</span> ៛
            </div>
          </div>

          {/* Reference calculator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end bg-white p-4 rounded-2xl border border-[#E8DEC8]">
            <div>
              <label className="block text-[10px] font-bold text-[#BF5A36] uppercase tracking-wider mb-1">{t('amountInUsd')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans font-bold text-[#BF5A36] text-lg">$</span>
                <input
                  type="number"
                  min="0"
                  value={usd}
                  onChange={(e) => setUsd(e.target.value)}
                  className="w-full bg-[#FDF8F3] border border-[#E8DEC8] rounded-xl pl-8 pr-3 py-2.5 font-mono font-bold text-lg text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#BF5A36]"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#134E4A] uppercase tracking-wider mb-1">{t('youGetKhr')}</label>
              <div className="bg-[#134E4A] text-white rounded-xl px-4 py-2.5 font-mono font-bold text-lg flex items-center justify-between">
                <span>{khrValue.toLocaleString()} ៛</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {presets.map((val) => (
              <button
                key={val}
                onClick={() => setUsd(val.toString())}
                className={`py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                  parseFloat(usd) === val ? 'bg-[#BF5A36] text-white' : 'bg-[#F2EDE4] text-[#2D2926] hover:bg-[#E8DEC8]'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          {/* Cheat sheet (approx, from live rate) */}
          <div>
            <div className="text-[10px] font-bold text-[#134E4A] uppercase tracking-wider mb-2">{t('marketCheatSheet')}</div>
            <div className="bg-white rounded-2xl border border-[#E8DEC8] divide-y divide-[#F2EDE4] overflow-hidden text-xs">
              {cheatSheet.map((ref, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between">
                  <span className="font-medium text-[#2D2926]">{ref.item}</span>
                  <div className="text-right">
                    <span className="font-bold font-mono text-[#BF5A36] block">${ref.usd.toFixed(2)}</span>
                    <span className="text-[10px] font-mono text-[#8C7A70]">≈ {Math.round(ref.usd * rate).toLocaleString()} ៛</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#134E4A] hover:bg-[#0f3d3a] text-white font-bold text-sm py-3 rounded-full transition-all cursor-pointer"
          >
            {t('gotItBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

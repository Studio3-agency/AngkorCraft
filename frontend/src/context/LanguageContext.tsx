import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ProductCategory, Region } from '../types';
import { en } from '../i18n/en';
import { km } from '../i18n/km';

export type Language = 'en' | 'kh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  /** Set a default language only if the user hasn't explicitly chosen one yet. */
  defaultTo: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translateCategory: (category: ProductCategory) => string;
  translateRegion: (region: Region) => string;
  translateShopType: (type: string) => string;
}

const translations: Record<Language, Record<string, string>> = { en, kh: km };

const STORAGE_KEY = 'angkorcraft_lang';

const categoryTranslations: Record<ProductCategory, { en: string; kh: string }> = {
  'All': { en: 'All Categories', kh: 'គ្រប់ប្រភេទ' },
  'Textiles & Silk': { en: 'Textiles & Silk', kh: 'សូត្រ និងក្រណាត់' },
  'Spices & Gourmet': { en: 'Spices & Gourmet', kh: 'គ្រឿងទេស និងម្ហូប' },
  'Silverware & Jewelry': { en: 'Silverware & Jewelry', kh: 'គ្រឿងប្រាក់ និងអលង្ការ' },
  'Woodwork & Carving': { en: 'Woodwork & Carving', kh: 'ចម្លាក់ឈើ' },
  'Ceramics & Pottery': { en: 'Ceramics & Pottery', kh: 'កុលាលភាជន៍' },
  'Natural Skincare & Wellness': { en: 'Natural Skincare & Wellness', kh: 'ថែស្បែក និងសុខភាព' },
};

const regionTranslations: Record<Region, { en: string; kh: string }> = {
  'All Regions': { en: 'All Regions', kh: 'គ្រប់តំបន់' },
  'Siem Reap': { en: 'Siem Reap', kh: 'សៀមរាប' },
  'Kampot': { en: 'Kampot', kh: 'កំពត' },
  'Phnom Penh': { en: 'Phnom Penh', kh: 'ភ្នំពេញ' },
  'Battambang': { en: 'Battambang', kh: 'បាត់ដំបង' },
  'Mondulkiri': { en: 'Mondulkiri', kh: 'មណ្ឌលគីរី' },
  'Kampong Chhnang': { en: 'Kampong Chhnang', kh: 'កំពង់ឆ្នាំង' },
  'Takeo': { en: 'Takeo', kh: 'តាកែវ' },
};

const shopTypeTranslations: Record<string, { en: string; kh: string }> = {
  'Night Market': { en: 'Night Market', kh: 'ផ្សាររាត្រី' },
  'Artisan Workshop': { en: 'Artisan Workshop', kh: 'រោងជាងសិប្បករ' },
  'Social Enterprise': { en: 'Social Enterprise', kh: 'សហគ្រាសសង្គម' },
  'Organic Farm': { en: 'Organic Farm', kh: 'ចម្ការសរីរាង្គ' },
  'Craft Co-op': { en: 'Craft Co-op', kh: 'សហករណ៍សិប្បកម្ម' },
  'Traditional Market': { en: 'Traditional Market', kh: 'ផ្សារបុរាណ' },
  'All': { en: 'All Shop Types', kh: 'គ្រប់ប្រភេទហាង' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'kh' || saved === 'en' ? saved : 'en';
  });

  // Drive the CSS (Khmer font + heavier/larger sizing) and a11y lang attribute.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-lang', language);
    root.setAttribute('lang', language === 'kh' ? 'km' : 'en');
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'kh' : 'en');
  }, [language, setLanguage]);

  const defaultTo = useCallback((lang: Language) => {
    // Only applies when the user has never picked a language themselves.
    if (!localStorage.getItem(STORAGE_KEY)) setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = translations[language]?.[key] ?? translations.en[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([pKey, pVal]) => {
          text = text.replace(`{${pKey}}`, String(pVal));
        });
      }
      return text;
    },
    [language],
  );

  const translateCategory = useCallback(
    (category: ProductCategory): string => categoryTranslations[category]?.[language] || category,
    [language],
  );
  const translateRegion = useCallback(
    (region: Region): string => regionTranslations[region]?.[language] || region,
    [language],
  );
  const translateShopType = useCallback(
    (type: string): string => shopTypeTranslations[type]?.[language] || type,
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        defaultTo,
        t,
        translateCategory,
        translateRegion,
        translateShopType,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

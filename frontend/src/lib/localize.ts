import type { Language } from '../context/LanguageContext';

/**
 * Pick the value for the current language, falling back to the other language
 * if the preferred one is empty. Used for bilingual content fields (name,
 * description, story) where a merchant may have authored only one language.
 */
export function localized(
  enValue: string | null | undefined,
  khValue: string | null | undefined,
  language: Language,
): string {
  const en = (enValue ?? '').trim();
  const kh = (khValue ?? '').trim();
  if (language === 'kh') return kh || en;
  return en || kh;
}

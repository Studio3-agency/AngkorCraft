import { Router } from 'express';
import { authenticate, requireRole, type AuthedRequest } from '../auth.js';

export const translateRouter = Router();

const GOOGLE_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

/**
 * Translate text between English and Khmer.
 * Provider is pluggable:
 *   - Google Cloud Translation if GOOGLE_TRANSLATE_API_KEY is set (best Khmer).
 *   - Otherwise MyMemory (free, no key) as a fallback.
 * Returns { translated } (falls back to the original text on any failure so a
 * save never breaks because translation was unavailable).
 */
async function googleTranslate(text: string, from: string, to: string): Promise<string> {
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
  });
  if (!res.ok) throw new Error(`Google translate ${res.status}`);
  const data = (await res.json()) as any;
  return data?.data?.translations?.[0]?.translatedText ?? text;
}

async function myMemoryTranslate(text: string, from: string, to: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory ${res.status}`);
  const data = (await res.json()) as any;
  return data?.responseData?.translatedText ?? text;
}

translateRouter.post('/', authenticate, requireRole('merchant', 'admin'), async (req: AuthedRequest, res) => {
  const { text, from, to } = req.body ?? {};
  if (!text || typeof text !== 'string' || !from || !to) {
    res.status(400).json({ error: 'text, from, and to are required.' });
    return;
  }
  if (text.length > 5000) {
    res.status(400).json({ error: 'text too long (max 5000 chars).' });
    return;
  }

  try {
    const translated = GOOGLE_KEY
      ? await googleTranslate(text, from, to)
      : await myMemoryTranslate(text, from, to);
    res.json({ translated, provider: GOOGLE_KEY ? 'google' : 'mymemory' });
  } catch (err) {
    console.warn('[AngkorCraft API] translate failed:', err);
    // Non-fatal: return the original so the caller can still save.
    res.json({ translated: text, provider: 'none', pending: true });
  }
});

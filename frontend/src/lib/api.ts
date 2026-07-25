import { supabase } from './supabase';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;

export interface UploadResult {
  url: string;
  publicId: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path: string, init?: RequestInit) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
    ...(init?.headers ?? {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || body.message || message;
    } catch {
      /* ignore non-JSON bodies */
    }
    throw new Error(message);
  }
  return res.json();
}

/**
 * Upload an image to Cloudinary using a backend-generated signature.
 * The file goes directly from the browser to Cloudinary; the backend only
 * signs the request so the API secret is never exposed.
 */
export async function uploadImage(file: File, folder = 'angkorcraft'): Promise<UploadResult> {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary is not configured (VITE_CLOUDINARY_CLOUD_NAME missing).');
  }

  // 1) Ask the backend to sign the upload params.
  const { signature, timestamp, apiKey, moderation } = await apiFetch('/api/cloudinary/sign', {
    method: 'POST',
    body: JSON.stringify({ folder }),
  });

  // 2) Upload directly to Cloudinary.
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  // Must match exactly what the backend signed (if moderation is enabled).
  if (moderation) form.append('moderation', moderation);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    // Surface Cloudinary's real reason (e.g. invalid signature, moderation not
    // enabled) instead of a generic message, so failures are actionable.
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error?.message || '';
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail ? `Cloudinary: ${detail}` : `Cloudinary upload failed (HTTP ${res.status}).`);
  }
  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}

/**
 * Delete a shop (admin only). The backend removes the DB row AND destroys the
 * associated Cloudinary asset(s) — the "cascade" delete.
 */
export async function deleteShopCascade(shopId: string): Promise<void> {
  await apiFetch(`/api/admin/shops/${encodeURIComponent(shopId)}`, { method: 'DELETE' });
}

/**
 * Delete a product. The backend removes the DB row AND destroys its Cloudinary
 * asset. Allowed for the product owner (merchant) or an admin.
 */
export async function deleteProductCascade(productId: string): Promise<void> {
  await apiFetch(`/api/products/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}

/** Delete a single Cloudinary asset by public id (used when replacing an image). */
export async function deleteMedia(publicId: string): Promise<void> {
  await apiFetch('/api/cloudinary/delete', {
    method: 'POST',
    body: JSON.stringify({ publicId }),
  });
}

/**
 * Translate text between English ('en') and Khmer ('km') via the backend.
 * Returns the original text on any failure so callers can always save.
 */
export async function translateText(text: string, from: 'en' | 'km', to: 'en' | 'km'): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';
  try {
    const { translated } = await apiFetch('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: trimmed, from, to }),
    });
    return translated || trimmed;
  } catch {
    return trimmed;
  }
}

export const apiBaseUrl = API_BASE;

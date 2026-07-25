import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'angkor_craft_saved';
const DEFAULT_SAVED = ['kampot-black-pepper', 'golden-silk-krama'];

function readLocal(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : DEFAULT_SAVED;
  } catch {
    return DEFAULT_SAVED;
  }
}

function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Wishlist of product ids.
 * - Anonymous visitors: persisted to localStorage.
 * - Logged-in customers: persisted to the Supabase `wishlists` table, with the
 *   local list merged in once on first login so nothing is lost.
 */
export function useWishlist() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const [savedProductIds, setSavedProductIds] = useState<string[]>(() => readLocal());
  const mergedForUser = useRef<string | null>(null);

  // Keep localStorage in sync for anonymous users.
  useEffect(() => {
    if (!userId) writeLocal(savedProductIds);
  }, [savedProductIds, userId]);

  // On login: merge local list into the account, then load the account list.
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;
    if (mergedForUser.current === userId) return;
    mergedForUser.current = userId;

    (async () => {
      const local = readLocal();
      if (local.length > 0) {
        await supabase
          .from('wishlists')
          .upsert(
            local.map((productId) => ({ user_id: userId, product_id: productId })),
            { onConflict: 'user_id,product_id', ignoreDuplicates: true },
          );
      }
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', userId)
        .not('product_id', 'is', null);
      if (!error && data) {
        setSavedProductIds(data.map((r) => r.product_id as string));
      }
    })();
  }, [userId]);

  const toggleSave = useCallback(
    (productId: string) => {
      setSavedProductIds((prev) => {
        const has = prev.includes(productId);
        const next = has ? prev.filter((id) => id !== productId) : [...prev, productId];

        if (userId && isSupabaseConfigured) {
          if (has) {
            supabase.from('wishlists').delete().match({ user_id: userId, product_id: productId });
          } else {
            supabase.from('wishlists').insert({ user_id: userId, product_id: productId });
          }
        }
        return next;
      });
    },
    [userId],
  );

  const clearSaved = useCallback(() => {
    setSavedProductIds([]);
    if (userId && isSupabaseConfigured) {
      supabase.from('wishlists').delete().eq('user_id', userId).not('product_id', 'is', null);
    }
  }, [userId]);

  return { savedProductIds, toggleSave, clearSaved };
}

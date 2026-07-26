import { useCallback, useEffect, useState } from 'react';
import { Product, Shop } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapProduct, mapShop, ProductRow, ShopRow } from '../lib/db';
import { MOCK_PRODUCTS, MOCK_SHOPS } from '../data/mockData';
import { isShopLive } from '../lib/shops';

/**
 * Keep only shops that are LIVE (approved AND subscription active) plus the
 * products that belong to at least one live shop. Approval alone isn't enough —
 * a store stays hidden from the public until its subscription is active.
 */
function keepLive(shops: Shop[], products: Product[]): { shops: Shop[]; products: Product[] } {
  const liveShops = shops.filter(isShopLive);
  const liveIds = new Set(liveShops.map((s) => s.id));
  const liveProducts = products.filter(
    (p) =>
      (p.ownerShopId && liveIds.has(p.ownerShopId)) ||
      (p.storeIds ?? []).some((id) => liveIds.has(id)),
  );
  return { shops: liveShops, products: liveProducts };
}

interface CatalogState {
  products: Product[];
  shops: Shop[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Public catalog: approved shops and their products.
 *
 * When Supabase is configured it reads live data (RLS restricts anonymous
 * visitors to approved shops / public products). When it is not configured yet
 * it falls back to the bundled mock data so the site still renders during setup.
 */
export function useCatalog(): CatalogState {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const live = keepLive(MOCK_SHOPS, MOCK_PRODUCTS);
      setProducts(live.products);
      setShops(live.shops);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [shopsRes, productsRes] = await Promise.all([
        supabase.from('shops').select('*').eq('status', 'approved'),
        supabase.from('products').select('*'),
      ]);

      if (shopsRes.error) throw shopsRes.error;
      if (productsRes.error) throw productsRes.error;

      const live = keepLive(
        (shopsRes.data as ShopRow[]).map(mapShop),
        (productsRes.data as ProductRow[]).map(mapProduct),
      );
      setShops(live.shops);
      setProducts(live.products);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load catalog.';
      setError(message);
      // Graceful fallback so a misconfigured demo still shows content.
      const live = keepLive(MOCK_SHOPS, MOCK_PRODUCTS);
      setProducts(live.products);
      setShops(live.shops);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { products, shops, loading, error, refetch: fetchData };
}

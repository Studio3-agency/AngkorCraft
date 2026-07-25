import { useCallback, useEffect, useState } from 'react';
import { Product, Shop } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapProduct, mapShop, ProductRow, ShopRow } from '../lib/db';
import { MOCK_PRODUCTS, MOCK_SHOPS } from '../data/mockData';

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
      setProducts(MOCK_PRODUCTS);
      setShops(MOCK_SHOPS);
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

      setShops((shopsRes.data as ShopRow[]).map(mapShop));
      setProducts((productsRes.data as ProductRow[]).map(mapProduct));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load catalog.';
      setError(message);
      // Graceful fallback so a misconfigured demo still shows content.
      setProducts(MOCK_PRODUCTS);
      setShops(MOCK_SHOPS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { products, shops, loading, error, refetch: fetchData };
}

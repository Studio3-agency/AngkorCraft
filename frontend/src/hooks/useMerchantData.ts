import { useCallback, useEffect, useRef, useState } from 'react';
import { Shop, Product, Transaction, StoreView } from '../types';
import {
  fetchMyShops,
  fetchProductsForShop,
  fetchTransactions,
  fetchStoreViews,
} from '../lib/store';

export interface MerchantData {
  /** All stores this merchant owns (a merchant may run several branches). */
  shops: Shop[];
  /** The currently-selected store. */
  shop: Shop | null;
  selectShop: (id: string) => void;
  products: Product[];
  transactions: Transaction[];
  /** Recorded page views for the selected store (drives the analytics tab). */
  storeViews: StoreView[];
  /** True while the selected store's views are loading for the first time. */
  viewsLoading: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /** Silent background reload of just the view data (for auto-refresh polling). */
  refetchViews: () => Promise<void>;
}

/** Loads the signed-in merchant's stores and the data for the selected one. */
export function useMerchantData(ownerId: string | undefined): MerchantData {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [storeViews, setStoreViews] = useState<StoreView[]>([]);
  const [viewsLoading, setViewsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Load the merchant's list of stores. Keeps the current selection if it's
  // still valid, otherwise falls back to the first store.
  useEffect(() => {
    if (!ownerId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const list = await fetchMyShops(ownerId);
        if (cancelled) return;
        setShops(list);
        setSelectedId((prev) => (prev && list.some((s) => s.id === prev) ? prev : list[0]?.id ?? null));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load your stores.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ownerId, reloadKey]);

  // Load the selected store's products / transactions / views.
  useEffect(() => {
    if (!selectedId) {
      setProducts([]);
      setTransactions([]);
      setStoreViews([]);
      setViewsLoading(false);
      return;
    }
    let cancelled = false;
    setViewsLoading(true);
    (async () => {
      try {
        const [p, t, v] = await Promise.all([
          fetchProductsForShop(selectedId),
          fetchTransactions(selectedId),
          fetchStoreViews(selectedId),
        ]);
        if (cancelled) return;
        setProducts(p);
        setTransactions(t);
        setStoreViews(v);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load store data.');
      } finally {
        if (!cancelled) setViewsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId, reloadKey]);

  const refetch = useCallback(async () => {
    setReloadKey((k) => k + 1);
  }, []);

  // Keep the latest selection in a ref so refetchViews stays referentially
  // stable — an interval can call it without resubscribing every render.
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selectedId;
  const refetchViews = useCallback(async () => {
    const id = selectedRef.current;
    if (!id) return;
    try {
      const v = await fetchStoreViews(id);
      setStoreViews(v);
    } catch {
      /* silent — polling should never surface a transient error */
    }
  }, []);

  const shop = shops.find((s) => s.id === selectedId) ?? null;

  return {
    shops,
    shop,
    selectShop: setSelectedId,
    products,
    transactions,
    storeViews,
    viewsLoading,
    loading,
    error,
    refetch,
    refetchViews,
  };
}

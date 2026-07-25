import { useCallback, useEffect, useState } from 'react';
import { Shop, Product, Transaction, PosSale } from '../types';
import {
  fetchMyShops,
  fetchProductsForShop,
  fetchTransactions,
  fetchPosSales,
} from '../lib/store';

export interface MerchantData {
  /** All stores this merchant owns (a merchant may run several branches). */
  shops: Shop[];
  /** The currently-selected store. */
  shop: Shop | null;
  selectShop: (id: string) => void;
  products: Product[];
  transactions: Transaction[];
  posSales: PosSale[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** Loads the signed-in merchant's stores and the data for the selected one. */
export function useMerchantData(ownerId: string | undefined): MerchantData {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [posSales, setPosSales] = useState<PosSale[]>([]);
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

  // Load the selected store's products / transactions / POS sales.
  useEffect(() => {
    if (!selectedId) {
      setProducts([]);
      setTransactions([]);
      setPosSales([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [p, t, s] = await Promise.all([
          fetchProductsForShop(selectedId),
          fetchTransactions(selectedId),
          fetchPosSales(selectedId),
        ]);
        if (cancelled) return;
        setProducts(p);
        setTransactions(t);
        setPosSales(s);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load store data.');
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId, reloadKey]);

  const refetch = useCallback(async () => {
    setReloadKey((k) => k + 1);
  }, []);

  const shop = shops.find((s) => s.id === selectedId) ?? null;

  return { shops, shop, selectShop: setSelectedId, products, transactions, posSales, loading, error, refetch };
}

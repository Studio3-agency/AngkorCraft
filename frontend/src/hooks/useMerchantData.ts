import { useCallback, useEffect, useState } from 'react';
import { Shop, Product, Transaction, PosSale } from '../types';
import {
  fetchMyShops,
  fetchProductsForShop,
  fetchTransactions,
  fetchPosSales,
} from '../lib/store';

export interface MerchantData {
  shop: Shop | null;
  products: Product[];
  transactions: Transaction[];
  posSales: PosSale[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** Loads the signed-in merchant's (single) store and everything attached to it. */
export function useMerchantData(ownerId: string | undefined): MerchantData {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [posSales, setPosSales] = useState<PosSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    setError(null);
    try {
      const shops = await fetchMyShops(ownerId);
      const myShop = shops[0] ?? null;
      setShop(myShop);
      if (myShop) {
        const [p, t, s] = await Promise.all([
          fetchProductsForShop(myShop.id),
          fetchTransactions(myShop.id),
          fetchPosSales(myShop.id),
        ]);
        setProducts(p);
        setTransactions(t);
        setPosSales(s);
      } else {
        setProducts([]);
        setTransactions([]);
        setPosSales([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load your store.');
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { shop, products, transactions, posSales, loading, error, refetch };
}

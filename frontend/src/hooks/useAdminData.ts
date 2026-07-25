import { useCallback, useEffect, useState } from 'react';
import { Shop, Product, Transaction } from '../types';
import { fetchAllShops, fetchAllProducts, fetchAllTransactions } from '../lib/store';

export interface AdminData {
  shops: Shop[];
  products: Product[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminData(): AdminData {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p, t] = await Promise.all([fetchAllShops(), fetchAllProducts(), fetchAllTransactions()]);
      setShops(s);
      setProducts(p);
      setTransactions(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { shops, products, transactions, loading, error, refetch };
}

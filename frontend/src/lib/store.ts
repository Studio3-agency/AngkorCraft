import { supabase } from './supabase';
import {
  mapShop,
  mapProduct,
  mapTransaction,
  mapPosSale,
  shopToRow,
  productToRow,
  ShopRow,
  ProductRow,
} from './db';
import { Shop, Product, Transaction, PosSale, TransactionType } from '../types';

// ---------- Reads ----------

export async function fetchAllShops(): Promise<Shop[]> {
  const { data, error } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ShopRow[]).map(mapShop);
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
}

export async function fetchMyShops(ownerId: string): Promise<Shop[]> {
  const { data, error } = await supabase.from('shops').select('*').eq('owner_id', ownerId);
  if (error) throw error;
  return (data as ShopRow[]).map(mapShop);
}

export async function fetchProductsForShop(shopId: string): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('owner_shop_id', shopId);
  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
}

// ---------- Writes (RLS enforces who may do what) ----------

export async function saveShop(shop: Partial<Shop>): Promise<Shop> {
  const row = shopToRow(shop);
  const { data, error } = await supabase.from('shops').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return mapShop(data as ShopRow);
}

export async function updateShopFields(id: string, fields: Partial<Shop>): Promise<Shop> {
  const { data, error } = await supabase
    .from('shops')
    .update(shopToRow(fields))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapShop(data as ShopRow);
}

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const row = productToRow(product);
  const { data, error } = await supabase.from('products').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return mapProduct(data as ProductRow);
}

// ---------- Simulated commerce ----------

export async function logTransaction(
  shopId: string,
  type: TransactionType,
  amountUsd: number,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ shop_id: shopId, type, amount_usd: amountUsd, status: 'paid' })
    .select('*')
    .single();
  if (error) throw error;
  return mapTransaction(data);
}

export async function fetchTransactions(shopId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTransaction);
}

export async function fetchAllTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase.from('transactions').select('*');
  if (error) throw error;
  return (data ?? []).map(mapTransaction);
}

export async function addPosSale(
  shopId: string,
  items: PosSale['items'],
  totalUsd: number,
  paymentMethod: string,
): Promise<PosSale> {
  const { data, error } = await supabase
    .from('pos_sales')
    .insert({ shop_id: shopId, items, total_usd: totalUsd, payment_method: paymentMethod })
    .select('*')
    .single();
  if (error) throw error;
  return mapPosSale(data);
}

export async function fetchPosSales(shopId: string): Promise<PosSale[]> {
  const { data, error } = await supabase
    .from('pos_sales')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPosSale);
}

import React, { useMemo, useState } from 'react';
import { Plus, Minus, Trash2, Receipt, Loader2, DollarSign, ShoppingCart } from 'lucide-react';
import { MerchantData } from '../../hooks/useMerchantData';
import { PosSale } from '../../types';
import { addPosSale } from '../../lib/store';
import { useLanguage } from '../../context/LanguageContext';
import { formatUsd, formatDate } from '../../lib/util';

type CartItem = { name: string; qty: number; priceUsd: number };

const PAYMENT_METHODS = ['Cash (USD/KHR)', 'ABA Pay', 'Bakong QR', 'Credit Card'];

export const MerchantPos: React.FC<{ data: MerchantData }> = ({ data }) => {
  const { shop, products, posSales, refetch } = data;
  const { t } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [saving, setSaving] = useState(false);

  const total = useMemo(() => cart.reduce((s, i) => s + i.priceUsd * i.qty, 0), [cart]);

  const todayTotal = useMemo(() => {
    const today = new Date().toDateString();
    return posSales
      .filter((s) => new Date(s.createdAt).toDateString() === today)
      .reduce((sum, s) => sum + Number(s.totalUsd || 0), 0);
  }, [posSales]);

  if (!shop) return null;

  const addItem = (name: string, priceUsd: number) => {
    setCart((c) => {
      const found = c.find((i) => i.name === name);
      if (found) return c.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { name, qty: 1, priceUsd }];
    });
  };

  const changeQty = (name: string, delta: number) =>
    setCart((c) =>
      c
        .map((i) => (i.name === name ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );

  const recordSale = async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      await addPosSale(shop.id, cart, total, method);
      setCart([]);
      await refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : t('actionFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8DEC8] p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-1">{t('posToday')}</div>
          <div className="text-2xl font-bold text-[#134E4A]">{formatUsd(todayTotal)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8DEC8] p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-1">{t('posTotalSales')}</div>
          <div className="text-2xl font-bold text-[#134E4A]">{posSales.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8DEC8] p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-1">{t('posAllTime')}</div>
          <div className="text-2xl font-bold text-[#134E4A]">
            {formatUsd(posSales.reduce((s, x) => s + Number(x.totalUsd || 0), 0))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product picker */}
        <div className="lg:col-span-2">
          <h3 className="font-sans text-lg font-bold text-[#134E4A] mb-3">{t('posTapToAdd')}</h3>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8DEC8] px-4 py-10 text-center text-[#8C7A70] text-sm">
              {t('posAddProductsFirst')}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addItem(p.title, p.priceUsd)}
                  className="bg-white rounded-xl border border-[#E8DEC8] hover:border-[#BF5A36] p-3 text-left cursor-pointer transition-colors"
                >
                  <div className="h-20 bg-[#FAF7F2] rounded-lg overflow-hidden mb-2">
                    {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="text-xs font-semibold text-[#134E4A] line-clamp-1">{p.title}</div>
                  <div className="text-xs text-[#BF5A36] font-bold">{formatUsd(p.priceUsd)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="bg-white rounded-2xl border border-[#E8DEC8] p-5 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 text-[#BF5A36]" />
            <h3 className="font-semibold text-[#134E4A]">{t('posCurrentSale')}</h3>
          </div>

          {cart.length === 0 ? (
            <p className="text-sm text-[#8C7A70] py-6 text-center">{t('posCartEmpty')}</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {cart.map((item) => (
                <li key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#134E4A] truncate">{item.name}</div>
                    <div className="text-xs text-[#8C7A70]">{formatUsd(item.priceUsd)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => changeQty(item.name, -1)} className="p-1 rounded bg-[#F2EDE4] cursor-pointer">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.qty}</span>
                    <button onClick={() => changeQty(item.name, 1)} className="p-1 rounded bg-[#F2EDE4] cursor-pointer">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-[#F2EDE4] pt-3 mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#8C7A70]">{t('posTotal')}</span>
            <span className="text-xl font-bold text-[#134E4A]">{formatUsd(total)}</span>
          </div>

          <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('posPaymentMethod')}</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#BF5A36]"
          >
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <button
            onClick={recordSale}
            disabled={cart.length === 0 || saving}
            className="w-full flex items-center justify-center gap-2 bg-[#BF5A36] hover:bg-[#a94d2d] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
            {t('posRecordSale')}
          </button>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="w-full mt-2 flex items-center justify-center gap-1 text-xs text-[#8C7A70] cursor-pointer hover:text-[#BF5A36]">
              <Trash2 className="w-3 h-3" /> {t('posClear')}
            </button>
          )}
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F2EDE4] flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[#BF5A36]" />
          <h3 className="font-sans text-lg font-bold text-[#134E4A]">{t('posRecentSales')}</h3>
        </div>
        {posSales.length === 0 ? (
          <div className="px-6 py-8 text-center text-[#8C7A70] text-sm">{t('posNoSales')}</div>
        ) : (
          <ul className="divide-y divide-[#F2EDE4]">
            {posSales.slice(0, 10).map((sale: PosSale) => (
              <li key={sale.id} className="px-6 py-3 flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <div className="font-medium text-[#134E4A] truncate">
                    {sale.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                  </div>
                  <div className="text-xs text-[#8C7A70]">{formatDate(sale.createdAt)} · {sale.paymentMethod}</div>
                </div>
                <span className="font-bold text-[#134E4A] shrink-0 ml-3">{formatUsd(sale.totalUsd)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

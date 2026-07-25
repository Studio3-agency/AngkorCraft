import React, { useState } from 'react';
import { Plus, Star, ShieldCheck, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { AdminData } from '../../hooks/useAdminData';
import { Shop } from '../../types';
import { updateShopFields } from '../../lib/store';
import { deleteShopCascade } from '../../lib/api';
import { ShopFormModal } from './ShopFormModal';
import { useLanguage } from '../../context/LanguageContext';

const statusStyles: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-600',
};

export const AdminShops: React.FC<{ data: AdminData }> = ({ data }) => {
  const { shops, refetch } = data;
  const { t } = useLanguage();
  const [editing, setEditing] = useState<Shop | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const act = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await fn();
      await refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : t('actionFailed'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (shop: Shop) => {
    if (!confirm(t('confirmDeleteShop', { name: shop.name }))) return;
    act(shop.id, () => deleteShopCascade(shop.id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-xl font-bold text-[#134E4A]">{t('shopsMerchants')} ({shops.length})</h2>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#FF914D] hover:bg-[#F07A33] text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t('addShop')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F2] text-left text-[11px] uppercase tracking-wider text-[#8C7A70]">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('shopColumn')}</th>
                <th className="px-4 py-3 font-semibold">{t('statusColumn')}</th>
                <th className="px-4 py-3 font-semibold">{t('flagsColumn')}</th>
                <th className="px-4 py-3 font-semibold text-right">{t('actionsColumn')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]">
              {shops.map((shop) => {
                const busy = busyId === shop.id;
                return (
                  <tr key={shop.id} className="hover:bg-[#FAF7F2]/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] overflow-hidden shrink-0">
                          {shop.image && <img src={shop.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#134E4A] truncate max-w-[220px]">{shop.name}</div>
                          <div className="text-xs text-[#8C7A70]">{shop.type} · {shop.city || shop.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusStyles[shop.status ?? 'pending']}`}>
                        {shop.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {shop.isFeatured && <span title="Featured" className="text-[#B8860B]"><Star className="w-4 h-4 fill-current" /></span>}
                        {shop.isVerified && <span title="Verified" className="text-[#134E4A]"><ShieldCheck className="w-4 h-4" /></span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {busy && <Loader2 className="w-4 h-4 animate-spin text-[#FF914D] mr-1" />}
                        {shop.status === 'pending' && (
                          <>
                            <button
                              onClick={() => act(shop.id, () => updateShopFields(shop.id, { status: 'approved', isVerified: true }))}
                              className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> {t('approve')}
                            </button>
                            <button
                              onClick={() => act(shop.id, () => updateShopFields(shop.id, { status: 'rejected' }))}
                              className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> {t('reject')}
                            </button>
                          </>
                        )}
                        <button
                          title={shop.isFeatured ? 'Un-feature' : 'Feature'}
                          onClick={() => act(shop.id, () => updateShopFields(shop.id, shop.isFeatured
                            ? { isFeatured: false, featuredUntil: null }
                            : { isFeatured: true, featuredUntil: new Date(Date.now() + 30 * 864e5).toISOString() }))}
                          className={`p-1.5 rounded-lg cursor-pointer ${shop.isFeatured ? 'text-[#B8860B] bg-[#FF914D]/15' : 'text-[#8C7A70] hover:bg-[#F2EDE4]'}`}
                        >
                          <Star className={`w-4 h-4 ${shop.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => setEditing(shop)}
                          className="p-1.5 rounded-lg text-[#134E4A] hover:bg-[#F2EDE4] cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(shop)}
                          className="p-1.5 rounded-lg text-[#FF914D] hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {shops.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-[#8C7A70]">{t('noShopsYet')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(editing || creating) && (
        <ShopFormModal
          shop={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={refetch}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Package } from 'lucide-react';
import { MerchantData } from '../../hooks/useMerchantData';
import { Product } from '../../types';
import { deleteProductCascade } from '../../lib/api';
import { ProductFormModal } from '../admin/ProductFormModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatUsd } from '../../lib/util';

export const MerchantProducts: React.FC<{ data: MerchantData }> = ({ data }) => {
  const { shop, products, refetch } = data;
  const { session } = useAuth();
  const { t } = useLanguage();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!shop) return null;

  const handleDelete = (product: Product) => {
    if (!confirm(t('confirmDeleteProduct', { name: product.title }))) return;
    setBusyId(product.id);
    deleteProductCascade(product.id)
      .then(refetch)
      .catch((e) => alert(e instanceof Error ? e.message : t('actionFailed')))
      .finally(() => setBusyId(null));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-xl font-bold text-[#134E4A]">{t('myProducts')} ({products.length})</h2>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#BF5A36] hover:bg-[#a94d2d] text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t('addProduct')}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8DEC8] px-4 py-12 text-center text-[#8C7A70]">
          <Package className="w-8 h-8 mx-auto mb-2 text-[#E8DEC8]" />
          <p className="text-sm">{t('noProductsYet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden flex flex-col">
              <div className="h-36 bg-[#FAF7F2]">
                {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[10px] font-bold text-[#BF5A36] uppercase tracking-wider">{p.category}</div>
                <div className="font-semibold text-[#134E4A] text-sm mt-1 line-clamp-2">{p.title}</div>
                <div className="text-xs text-[#8C7A70] mt-1">{formatUsd(p.priceUsd)}</div>
                <div className="mt-3 pt-3 border-t border-[#F2EDE4] flex items-center justify-end gap-1">
                  {busyId === p.id && <Loader2 className="w-4 h-4 animate-spin text-[#BF5A36] mr-1" />}
                  <button onClick={() => setEditing(p)} className="p-1.5 rounded-lg text-[#134E4A] hover:bg-[#F2EDE4] cursor-pointer" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-[#BF5A36] hover:bg-red-50 cursor-pointer" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <ProductFormModal
          product={editing}
          shops={[shop]}
          lockedShopId={shop.id}
          ownerId={session?.user?.id}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={refetch}
        />
      )}
    </div>
  );
};

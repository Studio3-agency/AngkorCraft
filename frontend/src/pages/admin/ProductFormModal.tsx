import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Product, ProductCategory, Region, Shop } from '../../types';
import { ImageUpload } from '../../components/ImageUpload';
import { LanguageToggle } from '../../components/LanguageToggle';
import { saveProduct } from '../../lib/store';
import { slugify } from '../../lib/util';
import { translateText } from '../../lib/api';
import { localized } from '../../lib/localize';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES: ProductCategory[] = [
  'Textiles & Silk',
  'Spices & Gourmet',
  'Silverware & Jewelry',
  'Woodwork & Carving',
  'Ceramics & Pottery',
  'Natural Skincare & Wellness',
];

const REGIONS: Region[] = ['Siem Reap', 'Phnom Penh', 'Kampot', 'Battambang', 'Mondulkiri', 'Kampong Chhnang', 'Takeo'];

interface Props {
  product: Product | null;
  shops: Shop[];
  /** Restrict store selection to a single merchant-owned shop. */
  lockedShopId?: string;
  ownerId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export const ProductFormModal: React.FC<Props> = ({ product, shops, lockedShopId, ownerId, onClose, onSaved }) => {
  const { t, language, translateCategory, translateRegion } = useLanguage();
  const isNew = !product;
  const [form, setForm] = useState<Partial<Product>>(
    product
      ? {
          ...product,
          description: localized(product.description, product.descriptionKh, language),
          culturalStory: localized(product.culturalStory, product.culturalStoryKh, language),
        }
      : {
      title: '',
      khmerTitle: '',
      category: '' as unknown as ProductCategory,
      region: '' as unknown as Region,
      priceUsd: undefined,
      priceRange: '',
      priceLevel: '' as unknown as Product['priceLevel'],
      description: '',
      culturalStory: '',
      material: '',
      artisanGroup: '',
      tags: [],
      authenticTips: [],
      storeIds: lockedShopId ? [lockedShopId] : [],
      ownerShopId: lockedShopId ?? null,
      image: '',
      imagePublicId: null,
      isGiCertified: false,
      isHandmade: false,
      isPopular: false,
      isFeatured: false,
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setForm((f) => ({ ...f, [key]: value }));

  const toggleStore = (shopId: string) => {
    const current = form.storeIds ?? [];
    const next = current.includes(shopId) ? current.filter((s) => s !== shopId) : [...current, shopId];
    setForm((f) => ({ ...f, storeIds: next, ownerShopId: f.ownerShopId ?? next[0] ?? null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: Partial<Product> = { ...form };
      if (isNew) {
        payload.id = slugify(form.title || 'product');
        payload.ownerId = ownerId ?? null;
      }
      if (!payload.ownerShopId) payload.ownerShopId = (form.storeIds ?? [])[0] ?? lockedShopId ?? null;

      // Bilingual bridge: store the typed text in the user's language and
      // auto-translate description + cultural story to the other language.
      const src: 'en' | 'km' = language === 'kh' ? 'km' : 'en';
      const dst: 'en' | 'km' = language === 'kh' ? 'en' : 'km';
      const assign = async (
        value: string | undefined,
        enKey: 'description' | 'culturalStory',
        khKey: 'descriptionKh' | 'culturalStoryKh',
      ) => {
        const v = (value ?? '').trim();
        if (!v) return;
        const other = await translateText(v, src, dst);
        if (language === 'kh') {
          payload[khKey] = v;
          payload[enKey] = other;
        } else {
          payload[enKey] = v;
          payload[khKey] = other;
        }
      };
      await assign(form.description, 'description', 'descriptionKh');
      await assign(form.culturalStory, 'culturalStory', 'culturalStoryKh');

      await saveProduct(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('actionFailed'));
      setSaving(false);
    }
  };

  const inputCls =
    'w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF5A36]';

  const selectableShops = lockedShopId ? shops.filter((s) => s.id === lockedShopId) : shops;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl my-6 shadow-2xl">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F2EDE4] sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="font-sans text-xl font-bold text-[#134E4A]">{isNew ? t('addProductTitle') : t('editProductTitle')}</h2>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button onClick={onClose} className="p-1.5 hover:bg-[#F2EDE4] rounded-lg cursor-pointer">
              <X className="w-5 h-5 text-[#8C7A70]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('productPhoto')}</label>
            <ImageUpload
              value={form.image ?? ''}
              publicId={form.imagePublicId}
              folder="angkorcraft/products"
              onChange={(url, publicId) => setForm((f) => ({ ...f, image: url, imagePublicId: publicId }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('titleRequired')}</label>
              <input required className={inputCls} value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('khmerTitle')}</label>
              <input className={inputCls} value={form.khmerTitle ?? ''} onChange={(e) => set('khmerTitle', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('category')}</label>
              <select required className={inputCls} value={(form.category as string) ?? ''} onChange={(e) => set('category', e.target.value as ProductCategory)}>
                <option value="" disabled>{t('chooseOption')}</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{translateCategory(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('regionLabel')}</label>
              <select required className={inputCls} value={(form.region as string) ?? ''} onChange={(e) => set('region', e.target.value as Region)}>
                <option value="" disabled>{t('chooseOption')}</option>
                {REGIONS.map((r) => <option key={r} value={r}>{translateRegion(r)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('priceUsd')}</label>
              <input type="number" step="any" min="0" className={inputCls} value={form.priceUsd ?? ''} onChange={(e) => set('priceUsd', e.target.value === '' ? undefined as unknown as number : parseFloat(e.target.value))} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('priceRange')}</label>
              <input className={inputCls} value={form.priceRange ?? ''} onChange={(e) => set('priceRange', e.target.value)} placeholder="$12 - $18" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('priceLevelLabel')}</label>
              <select className={inputCls} value={(form.priceLevel as string) ?? ''} onChange={(e) => set('priceLevel', e.target.value as Product['priceLevel'])}>
                <option value="" disabled>{t('chooseOption')}</option>
                <option value="$">$</option>
                <option value="$$">$$</option>
                <option value="$$$">$$$</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('material')}</label>
              <input className={inputCls} value={form.material ?? ''} onChange={(e) => set('material', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('artisanGroup')}</label>
              <input className={inputCls} value={form.artisanGroup ?? ''} onChange={(e) => set('artisanGroup', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('shortDescription')}</label>
            <textarea rows={2} className={inputCls} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('culturalStory')}</label>
            <textarea rows={3} className={inputCls} value={form.culturalStory ?? ''} onChange={(e) => set('culturalStory', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('tagsCommaLabel')}</label>
              <input
                className={inputCls}
                value={(form.tags ?? []).join(', ')}
                onChange={(e) => set('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('authenticityTipsLabel')}</label>
              <textarea
                rows={2}
                className={inputCls}
                value={(form.authenticTips ?? []).join('\n')}
                onChange={(e) => set('authenticTips', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('whereToBuyShops')}</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {selectableShops.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStore(s.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer ${
                    (form.storeIds ?? []).includes(s.id)
                      ? 'bg-[#134E4A] text-white border-[#134E4A]'
                      : 'border-[#E8DEC8] text-[#8C7A70]'
                  }`}
                >
                  {s.name}
                </button>
              ))}
              {selectableShops.length === 0 && <span className="text-xs text-[#8C7A70]">{t('noShopsAvailable')}</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {([
              ['isHandmade', 'handmade100'],
              ['isGiCertified', 'giCertified'],
              ['isPopular', 'topTravelerFavorites'],
              ['isFeatured', 'featuredBadge'],
            ] as const).map(([key, labelKey]) => (
              <label key={key} className="flex items-center gap-2 text-xs font-semibold text-[#134E4A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(e) => set(key, e.target.checked as Product[typeof key])}
                  className="accent-[#BF5A36]"
                />
                {t(labelKey)}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#8C7A70] cursor-pointer">{t('cancel')}</button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#BF5A36] hover:bg-[#a94d2d] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isNew ? t('createProduct') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

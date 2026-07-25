import React, { useState } from 'react';
import { X, Loader2, MapPin } from 'lucide-react';
import { Shop, Region } from '../../types';
import { ImageUpload } from '../../components/ImageUpload';
import { PhoneInput } from '../../components/PhoneInput';
import { LocationPicker } from '../../components/LocationPicker';
import { LanguageToggle } from '../../components/LanguageToggle';
import { saveShop } from '../../lib/store';
import { slugify } from '../../lib/util';
import { translateText } from '../../lib/api';
import { localized } from '../../lib/localize';
import { useLanguage } from '../../context/LanguageContext';

const SHOP_TYPES: Shop['type'][] = [
  'Artisan Workshop',
  'Social Enterprise',
  'Craft Co-op',
  'Organic Farm',
  'Night Market',
  'Traditional Market',
];

const REGIONS: Region[] = [
  'Siem Reap',
  'Phnom Penh',
  'Kampot',
  'Battambang',
  'Mondulkiri',
  'Kampong Chhnang',
  'Takeo',
];

const PAYMENTS: Shop['paymentMethods'] = ['ABA Pay', 'Cash (USD/KHR)', 'Credit Card', 'Bakong QR'];

// Social handles — platform names are universal, so no translation needed.
type SocialKey = 'telegram' | 'whatsapp' | 'messenger' | 'instagram' | 'facebook' | 'tiktok' | 'wechat';
const SOCIAL_FIELDS: { key: SocialKey; label: string }[] = [
  { key: 'telegram', label: 'Telegram' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'messenger', label: 'Messenger' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'wechat', label: 'WeChat' },
];

interface Props {
  shop: Shop | null;
  ownerId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const inputCls =
  'w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF914D]';
const labelCls = 'block text-xs font-semibold text-[#134E4A] mb-1.5';

export const ShopFormModal: React.FC<Props> = ({ shop, ownerId, onClose, onSaved }) => {
  const { t, language, translateShopType, translateRegion } = useLanguage();
  const isNew = !shop;
  const [form, setForm] = useState<Partial<Shop>>(
    shop
      ? { ...shop, description: localized(shop.description, shop.descriptionKh, language) }
      : {
          name: '',
          khmerName: '',
          type: '' as unknown as Shop['type'],
          region: '' as unknown as Region,
          city: '',
          address: '',
          openingHours: '',
          paymentMethods: [],
          phone: '',
          description: '',
          image: '',
          imagePublicId: null,
          isVerified: false,
        },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Shop>(key: K, value: Shop[K]) => setForm((f) => ({ ...f, [key]: value }));

  const togglePayment = (pm: Shop['paymentMethods'][number]) => {
    const current = form.paymentMethods ?? [];
    set('paymentMethods', current.includes(pm) ? current.filter((p) => p !== pm) : [...current, pm]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: Partial<Shop> = { ...form };
      if (isNew) {
        payload.id = slugify(form.name || 'shop');
        if (ownerId) {
          payload.ownerId = ownerId;
          payload.status = 'pending';
          payload.subscriptionStatus = 'inactive';
        } else {
          payload.status = 'approved';
          payload.subscriptionStatus = 'active';
        }
      }
      const desc = (form.description ?? '').trim();
      if (desc) {
        if (language === 'kh') {
          payload.descriptionKh = desc;
          payload.description = await translateText(desc, 'km', 'en');
        } else {
          payload.description = desc;
          payload.descriptionKh = await translateText(desc, 'en', 'km');
        }
      }
      await saveShop(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('actionFailed'));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl my-6 shadow-2xl">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F2EDE4] sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="font-sans text-xl font-bold text-[#134E4A]">{isNew ? t('addShopTitle') : t('editShopTitle')}</h2>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button onClick={onClose} className="p-1.5 hover:bg-[#F2EDE4] rounded-lg cursor-pointer">
              <X className="w-5 h-5 text-[#8C7A70]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-6">
          <div>
            <label className={labelCls}>{t('shopPhoto')}</label>
            <ImageUpload
              value={form.image ?? ''}
              publicId={form.imagePublicId}
              folder="angkorcraft/shops"
              onChange={(url, publicId) => setForm((f) => ({ ...f, image: url, imagePublicId: publicId }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>{t('nameRequired')}</label>
              <input required autoComplete="off" className={inputCls} value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder={t('shopNamePlaceholder')} />
            </div>
            <div>
              <label className={labelCls}>{t('khmerName')}</label>
              <input autoComplete="off" className={inputCls} value={form.khmerName ?? ''} onChange={(e) => set('khmerName', e.target.value)} placeholder="ស្ទូឌីយោសូត្រ…" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>{t('typeLabel')}</label>
              <select required className={inputCls} value={(form.type as string) ?? ''} onChange={(e) => set('type', e.target.value as Shop['type'])}>
                <option value="" disabled>{t('chooseOption')}</option>
                {SHOP_TYPES.map((ty) => <option key={ty} value={ty}>{translateShopType(ty)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('provinceLabel')}</label>
              <select required className={inputCls} value={(form.region as string) ?? ''} onChange={(e) => set('region', e.target.value as Region)}>
                <option value="" disabled>{t('chooseOption')}</option>
                {REGIONS.map((rg) => <option key={rg} value={rg}>{translateRegion(rg)}</option>)}
              </select>
            </div>
          </div>

          {/* Location — map pin, no coordinates shown */}
          <div className="bg-[#FAF7F2] border border-[#E8DEC8] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF914D]" />
              <h3 className="text-sm font-bold text-[#134E4A]">{t('locationSection')}</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t('cityTownLabel')}</label>
                <input autoComplete="off" className={inputCls} value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} placeholder={t('cityTownLabel')} />
              </div>
              <div>
                <label className={labelCls}>{t('openingHours')} <span className="text-[#8C7A70] font-normal">({t('optionalHint')})</span></label>
                <input autoComplete="off" className={inputCls} value={form.openingHours ?? ''} onChange={(e) => set('openingHours', e.target.value)} placeholder={t('hoursPlaceholder')} />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t('directionsLabel')}</label>
              <input autoComplete="off" className={inputCls} value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} placeholder={t('directionsPlaceholder')} />
            </div>
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
            />
          </div>

          <div>
            <label className={labelCls}>{t('phoneLabel')} <span className="text-[#8C7A70] font-normal">({t('optionalHint')})</span></label>
            <PhoneInput value={form.phone ?? ''} onChange={(v) => set('phone', v)} placeholder="12 345 678" />
          </div>

          {/* Contact & social channels */}
          <div className="bg-[#FAF7F2] border border-[#E8DEC8] rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#134E4A]">{t('contactSection')}</h3>
              <p className="text-xs text-[#8C7A70] mt-0.5">{t('contactSectionHint')}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {SOCIAL_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input
                    autoComplete="off"
                    className={inputCls}
                    value={(form[key] as string) ?? ''}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={t('handlePlaceholder')}
                  />
                </div>
              ))}
              <div>
                <label className={labelCls}>{t('websiteLabel')}</label>
                <input autoComplete="off" className={inputCls} value={form.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="https://…" />
              </div>
              <div>
                <label className={labelCls}>{t('emailLabel')}</label>
                <input autoComplete="off" type="email" className={inputCls} value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="shop@example.com" />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t('contactNoteLabel')} <span className="text-[#8C7A70] font-normal">({t('optionalHint')})</span></label>
              <input autoComplete="off" className={inputCls} value={form.contactNote ?? ''} onChange={(e) => set('contactNote', e.target.value)} placeholder={t('contactNotePlaceholder')} />
            </div>
          </div>

          <div>
            <label className={labelCls}>{t('paymentMethodsLabel')}</label>
            <div className="flex flex-wrap gap-2">
              {PAYMENTS.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => togglePayment(pm)}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-full border cursor-pointer transition-colors ${
                    (form.paymentMethods ?? []).includes(pm)
                      ? 'bg-[#134E4A] text-white border-[#134E4A]'
                      : 'border-[#E8DEC8] text-[#8C7A70] hover:border-[#FF914D]/40'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>{t('descriptionLabel')}</label>
            <textarea rows={3} className={inputCls} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="…" />
          </div>

          {/* Error shown right next to the actions — no need to scroll up. */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">{error}</div>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-[#8C7A70] hover:bg-[#F2EDE4] rounded-xl cursor-pointer">
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isNew ? t('createShop') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

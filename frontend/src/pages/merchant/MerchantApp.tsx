import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart3, Store, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMerchantData } from '../../hooks/useMerchantData';
import { MAX_STORES_PER_MERCHANT } from '../../lib/limits';
import { PortalShell, PortalNavItem } from '../../components/PortalShell';
import { ShopFormModal } from '../admin/ShopFormModal';
import { MerchantOverview } from './MerchantOverview';
import { MerchantProducts } from './MerchantProducts';
import { MerchantAnalytics } from './MerchantAnalytics';

export const MerchantApp: React.FC = () => {
  const { profile, session } = useAuth();
  const { t, defaultTo } = useLanguage();
  const ownerId = session?.user?.id;
  const data = useMerchantData(ownerId);
  const [creating, setCreating] = useState(false);

  // Local artisan sellers work in Khmer by default (only if they never chose).
  useEffect(() => {
    defaultTo('kh');
  }, [defaultTo]);

  const atStoreLimit = data.shops.length >= MAX_STORES_PER_MERCHANT;

  // Onboarding: merchant has no store yet.
  if (!data.loading && data.shops.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 text-[#2C221E]">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-[#E8DEC8] p-6 sm:p-8 shadow-lg">
          <div className="w-14 h-14 bg-[#FF914D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7 text-[#FF914D]" />
          </div>
          <h1 className="font-sans text-2xl font-bold text-[#134E4A] mb-2">{t('welcomeToAngkorcraft')}</h1>
          <p className="text-sm text-[#8C7A70] mb-6">{t('listYourStoreDesc')}</p>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 bg-[#FF914D] hover:bg-[#F07A33] text-white font-semibold px-5 py-3 rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t('createMyStore')}
          </button>
          <div className="mt-4">
            <Link to="/" className="text-xs text-[#8C7A70] hover:underline">{t('backToSite')}</Link>
          </div>
        </div>
        {creating && (
          <ShopFormModal shop={null} ownerId={ownerId} onClose={() => setCreating(false)} onSaved={data.refetch} />
        )}
      </div>
    );
  }

  const navItems: PortalNavItem[] = [
    { to: '/merchant', label: t('dashboard'), icon: LayoutDashboard, end: true },
    { to: '/merchant/products', label: t('myProducts'), icon: Package },
    { to: '/merchant/analytics', label: t('analyticsNav'), icon: BarChart3 },
  ];

  // Store switcher + "add branch" — only shown once the merchant has a store.
  const storeSwitcher = (
    <div className="flex items-center gap-2">
      {data.shops.length > 1 && (
        <div className="relative">
          <Store className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#FF914D] pointer-events-none" />
          <select
            value={data.shop?.id ?? ''}
            onChange={(e) => data.selectShop(e.target.value)}
            aria-label={t('switchStore')}
            className="appearance-none bg-[#F2EDE4] border border-[#E8DEC8] rounded-full pl-8 pr-8 py-1.5 text-xs font-bold text-[#134E4A] focus:outline-none focus:ring-2 focus:ring-[#FF914D] cursor-pointer max-w-[200px] truncate"
          >
            {data.shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.status !== 'approved' ? ` (${s.status})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A70] pointer-events-none" />
        </div>
      )}
      <button
        onClick={() => !atStoreLimit && setCreating(true)}
        disabled={atStoreLimit}
        title={atStoreLimit ? t('storeLimitReached', { max: MAX_STORES_PER_MERCHANT }) : t('addStore')}
        className="flex items-center gap-1 bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{data.shops.length > 1 ? t('addStore') : t('addBranch')}</span>
      </button>
    </div>
  );

  return (
    <PortalShell
      kicker={t('merchantPortal')}
      headerTitle={data.shop?.name || t('myStore')}
      headerSubtitle={t('signedInAs', { name: profile?.fullName || '' })}
      navItems={navItems}
      loading={data.loading}
      headerControl={storeSwitcher}
    >
      <Routes>
        <Route index element={<MerchantOverview data={data} />} />
        <Route path="products" element={<MerchantProducts data={data} />} />
        <Route path="analytics" element={<MerchantAnalytics data={data} />} />
        {/* Legacy POS path → analytics (old links/bookmarks still land somewhere) */}
        <Route path="pos" element={<MerchantAnalytics data={data} />} />
      </Routes>
      {creating && (
        <ShopFormModal shop={null} ownerId={ownerId} onClose={() => setCreating(false)} onSaved={data.refetch} />
      )}
    </PortalShell>
  );
};

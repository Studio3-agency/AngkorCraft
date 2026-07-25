import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, Store, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMerchantData } from '../../hooks/useMerchantData';
import { PortalShell, PortalNavItem } from '../../components/PortalShell';
import { ShopFormModal } from '../admin/ShopFormModal';
import { MerchantOverview } from './MerchantOverview';
import { MerchantProducts } from './MerchantProducts';
import { MerchantPos } from './MerchantPos';

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

  // Onboarding: merchant has no store yet.
  if (!data.loading && !data.shop) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 text-[#2C221E]">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-[#E8DEC8] p-6 sm:p-8 shadow-lg">
          <div className="w-14 h-14 bg-[#BF5A36]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7 text-[#BF5A36]" />
          </div>
          <h1 className="font-sans text-2xl font-bold text-[#134E4A] mb-2">{t('welcomeToAngkorcraft')}</h1>
          <p className="text-sm text-[#8C7A70] mb-6">{t('listYourStoreDesc')}</p>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 bg-[#BF5A36] hover:bg-[#a94d2d] text-white font-semibold px-5 py-3 rounded-lg cursor-pointer"
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
    { to: '/merchant/pos', label: t('posSales'), icon: Receipt },
  ];

  return (
    <PortalShell
      kicker={t('merchantPortal')}
      headerTitle={data.shop?.name || t('myStore')}
      headerSubtitle={t('signedInAs', { name: profile?.fullName || '' })}
      navItems={navItems}
      loading={data.loading}
    >
      <Routes>
        <Route index element={<MerchantOverview data={data} />} />
        <Route path="products" element={<MerchantProducts data={data} />} />
        <Route path="pos" element={<MerchantPos data={data} />} />
      </Routes>
    </PortalShell>
  );
};

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard, Store, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAdminData } from '../../hooks/useAdminData';
import { PortalShell, PortalNavItem } from '../../components/PortalShell';
import { AdminOverview } from './AdminOverview';
import { AdminShops } from './AdminShops';
import { AdminProducts } from './AdminProducts';

export const AdminApp: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const data = useAdminData();

  const navItems: PortalNavItem[] = [
    { to: '/admin', label: t('overview'), icon: LayoutDashboard, end: true },
    { to: '/admin/shops', label: t('shopsMerchants'), icon: Store },
    { to: '/admin/products', label: t('productsLabel'), icon: Package },
  ];

  return (
    <PortalShell
      kicker={t('adminConsole')}
      headerTitle={t('controlCenter')}
      headerSubtitle={t('signedInAs', { name: profile?.fullName || 'Admin' })}
      navItems={navItems}
      loading={data.loading}
    >
      {data.error && (
        <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{data.error}</span>
        </div>
      )}
      <Routes>
        <Route index element={<AdminOverview data={data} />} />
        <Route path="shops" element={<AdminShops data={data} />} />
        <Route path="products" element={<AdminProducts data={data} />} />
      </Routes>
    </PortalShell>
  );
};

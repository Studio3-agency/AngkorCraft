import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Package, Star, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { AdminData } from '../../hooks/useAdminData';
import { formatUsd } from '../../lib/util';
import { useLanguage } from '../../context/LanguageContext';

const Tile: React.FC<{ label: string; value: string | number; Icon: React.ElementType; accent: string }> = ({
  label,
  value,
  Icon,
  accent,
}) => (
  <div className="bg-white rounded-2xl border border-[#E8DEC8] p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70]">{label}</span>
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <div className="text-2xl font-bold text-[#134E4A]">{value}</div>
  </div>
);

export const AdminOverview: React.FC<{ data: AdminData }> = ({ data }) => {
  const { t } = useLanguage();
  const { shops, products, transactions } = data;
  const pending = shops.filter((s) => s.status === 'pending');
  const featured = shops.filter((s) => s.isFeatured);
  const revenue = transactions.reduce((sum, t) => sum + Number(t.amountUsd || 0), 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label={t('totalShops')} value={shops.length} Icon={Store} accent="bg-[#134E4A]/10 text-[#134E4A]" />
        <Tile label={t('productsLabel')} value={products.length} Icon={Package} accent="bg-[#BF5A36]/10 text-[#BF5A36]" />
        <Tile label={t('featuredLabel')} value={featured.length} Icon={Star} accent="bg-[#D4AF37]/20 text-[#B8860B]" />
        <Tile label={t('simRevenue')} value={formatUsd(revenue)} Icon={DollarSign} accent="bg-emerald-100 text-emerald-700" />
      </div>

      {/* Pending approvals */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F2EDE4] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#BF5A36]" />
          <h2 className="font-sans text-lg font-bold text-[#134E4A]">{t('pendingApprovals')}</h2>
          {pending.length > 0 && (
            <span className="ml-auto bg-[#BF5A36] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="px-6 py-10 text-center text-[#8C7A70]">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm">{t('allCaughtUp')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F2EDE4]">
            {pending.map((shop) => (
              <li key={shop.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#FAF7F2] overflow-hidden shrink-0">
                  {shop.image && <img src={shop.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#134E4A] truncate">{shop.name}</div>
                  <div className="text-xs text-[#8C7A70]">{shop.type} · {shop.city || shop.region}</div>
                </div>
                <Link
                  to="/admin/shops"
                  className="text-xs font-bold text-[#BF5A36] hover:underline shrink-0"
                >
                  {t('reviewArrow')}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

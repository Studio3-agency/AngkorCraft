import React, { useState } from 'react';
import { Star, ShieldCheck, Clock, Zap, RefreshCw, Pencil, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MerchantData } from '../../hooks/useMerchantData';
import { updateShopFields, logTransaction } from '../../lib/store';
import { formatUsd, formatDate } from '../../lib/util';
import { ShopFormModal } from '../admin/ShopFormModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const SUBSCRIPTION_PRICE = 29;
const BOOST_PRICE = 15;

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const MerchantOverview: React.FC<{ data: MerchantData }> = ({ data }) => {
  const { shop, transactions, refetch } = data;
  const { session } = useAuth();
  const { t } = useLanguage();
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  if (!shop) return null;

  const isActive = shop.subscriptionStatus === 'active';
  const isApproved = shop.status === 'approved';
  const isFeatured = shop.isFeatured;

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try {
      await fn();
      await refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : t('actionFailed'));
    } finally {
      setBusy(null);
    }
  };

  const activateSubscription = () =>
    run('sub', async () => {
      await logTransaction(shop.id, 'subscription', SUBSCRIPTION_PRICE);
      await updateShopFields(shop.id, {
        subscriptionStatus: 'active',
        subscriptionExpiresAt: addDays(30),
      });
    });

  const boost = () =>
    run('boost', async () => {
      await logTransaction(shop.id, 'boost', BOOST_PRICE);
      await updateShopFields(shop.id, { isFeatured: true, featuredUntil: addDays(7) });
    });

  return (
    <div className="space-y-6">
      {/* Approval banner */}
      {!isApproved && (
        <div className={`flex items-start gap-3 rounded-xl p-4 text-sm ${
          shop.status === 'rejected'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}>
          {shop.status === 'rejected' ? <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" /> : <Clock className="w-5 h-5 mt-0.5 shrink-0" />}
          <div>
            <p className="font-semibold">
              {shop.status === 'rejected' ? t('storeNotApproved') : t('awaitingApproval')}
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              {shop.status === 'rejected' ? t('storeNotApprovedDesc') : t('awaitingApprovalDesc')}
            </p>
          </div>
        </div>
      )}

      {/* Store card */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden">
        <div className="h-32 bg-[#FAF7F2] relative">
          {shop.image && <img src={shop.image} alt="" className="w-full h-full object-cover" />}
          <div className="absolute top-3 right-3 flex gap-2">
            {isFeatured && (
              <span className="bg-[#D4AF37] text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            )}
            {shop.isVerified && (
              <span className="bg-[#134E4A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        </div>
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-bold text-[#134E4A]">{shop.name}</h2>
            <p className="text-sm text-[#8C7A70]">{shop.type} · {shop.city || shop.region}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#134E4A] border border-[#E8DEC8] hover:border-[#BF5A36] px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" /> {t('editStore')}
          </button>
        </div>
      </div>

      {/* Subscription + Boost */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-[#E8DEC8] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#134E4A]">{t('subscription')}</h3>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
            }`}>
              {isActive ? t('active') : t('inactive')}
            </span>
          </div>
          <p className="text-xs text-[#8C7A70] mb-4">
            {isActive
              ? t('subscriptionActiveDesc', { date: formatDate(shop.subscriptionExpiresAt) })
              : t('subscriptionInactiveDesc')}
          </p>
          <button
            onClick={activateSubscription}
            disabled={busy === 'sub'}
            className="w-full flex items-center justify-center gap-2 bg-[#134E4A] hover:bg-[#0f3d3a] disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg cursor-pointer"
          >
            {busy === 'sub' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isActive ? t('renew') : t('activate')} — {formatUsd(SUBSCRIPTION_PRICE)}{t('perMonthShort')}
          </button>
          <p className="text-[10px] text-[#8C7A70] text-center mt-2">{t('simulatedPayment')}</p>
        </div>

        {/* Boost */}
        <div className="bg-white rounded-2xl border border-[#E8DEC8] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#134E4A]">{t('boostToFeatured')}</h3>
            {isFeatured && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#B8860B]">
                {t('featuredBadge')}
              </span>
            )}
          </div>
          <p className="text-xs text-[#8C7A70] mb-4">
            {isFeatured
              ? t('boostActiveDesc', { date: formatDate(shop.featuredUntil) })
              : t('boostInactiveDesc')}
          </p>
          <button
            onClick={boost}
            disabled={busy === 'boost' || !isActive}
            className="w-full flex items-center justify-center gap-2 bg-[#BF5A36] hover:bg-[#a94d2d] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg cursor-pointer"
          >
            {busy === 'boost' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {t('boost7Days')} — {formatUsd(BOOST_PRICE)}
          </button>
          <p className="text-[10px] text-[#8C7A70] text-center mt-2">
            {isActive ? t('simulatedPayment') : t('requiresActiveSubscription')}
          </p>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F2EDE4]">
          <h3 className="font-sans text-lg font-bold text-[#134E4A]">{t('billingHistory')}</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-[#8C7A70] text-sm">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-[#E8DEC8]" />
            {t('noChargesYet')}
          </div>
        ) : (
          <ul className="divide-y divide-[#F2EDE4]">
            {transactions.map((tx) => (
              <li key={tx.id} className="px-6 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    tx.type === 'boost' ? 'bg-[#BF5A36]/10 text-[#BF5A36]' : 'bg-[#134E4A]/10 text-[#134E4A]'
                  }`}>
                    {tx.type === 'boost' ? <Zap className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  </span>
                  <div>
                    <div className="font-semibold text-[#134E4A]">{tx.type === 'boost' ? t('boostToFeatured') : t('subscription')}</div>
                    <div className="text-xs text-[#8C7A70]">{formatDate(tx.createdAt)}</div>
                  </div>
                </div>
                <span className="font-bold text-[#134E4A]">{formatUsd(tx.amountUsd)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <ShopFormModal shop={shop} ownerId={session?.user?.id} onClose={() => setEditing(false)} onSaved={refetch} />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Star, ShieldCheck, Clock, Zap, RefreshCw, Pencil, Loader2, CheckCircle2, AlertTriangle, Eye, Store, Plus, GitBranch, Check, ArrowRight } from 'lucide-react';
import { MerchantData } from '../../hooks/useMerchantData';
import { updateShopFields, logTransaction } from '../../lib/store';
import { formatUsd, formatDate, formatViews } from '../../lib/util';
import { isShopLive } from '../../lib/shops';
import { MAX_STORES_PER_MERCHANT } from '../../lib/limits';
import { Shop } from '../../types';
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

interface OverviewProps {
  data: MerchantData;
  onAddStore?: () => void;
  onAddBranch?: (parent: Shop) => void;
}

export const MerchantOverview: React.FC<OverviewProps> = ({ data, onAddStore, onAddBranch }) => {
  const { shop, shops, selectShop, transactions, refetch } = data;
  const { session } = useAuth();
  const { t, language } = useLanguage();
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  if (!shop) return null;

  const isActive = shop.subscriptionStatus === 'active';
  const isApproved = shop.status === 'approved';
  const isRejected = shop.status === 'rejected';
  const isFeatured = shop.isFeatured;
  const live = isShopLive(shop);
  const atStoreLimit = shops.length >= MAX_STORES_PER_MERCHANT;
  const shopName = (s: Shop) => (language === 'kh' ? s.khmerName || s.name : s.name);
  const parentName = (s: Shop) => shops.find((x) => x.id === s.parentShopId)?.name;

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
      {/* ---- Visibility status: the clear "how do I go live?" path ---- */}
      <VisibilityStatus
        live={live}
        isApproved={isApproved}
        isRejected={isRejected}
        isActive={isActive}
        onActivate={activateSubscription}
        activating={busy === 'sub'}
        t={t}
      />

      {/* ---- Your stores: prominent switcher + branch vs new store ---- */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-sans text-lg font-bold text-[#134E4A] flex items-center gap-2">
              <Store className="w-5 h-5 text-[#FF914D]" /> {t('yourStores')}
              <span className="text-sm font-normal text-[#8C7A70]">({shops.length}/{MAX_STORES_PER_MERCHANT})</span>
            </h3>
            <p className="text-xs text-[#8C7A70] mt-0.5">{t('yourStoresDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddBranch?.(shop)}
              disabled={atStoreLimit}
              title={atStoreLimit ? t('storeLimitReached', { max: MAX_STORES_PER_MERCHANT }) : t('addBranchOf', { name: shopName(shop) })}
              className="inline-flex items-center gap-1.5 border border-[#134E4A]/20 text-[#134E4A] hover:border-[#FF914D] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#FF914D]" /> {t('addBranch')}
            </button>
            <button
              onClick={() => onAddStore?.()}
              disabled={atStoreLimit}
              title={atStoreLimit ? t('storeLimitReached', { max: MAX_STORES_PER_MERCHANT }) : t('addNewStore')}
              className="inline-flex items-center gap-1.5 bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> {t('addNewStore')}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shops.map((s) => {
            const selected = s.id === shop.id;
            const isBranch = !!s.parentShopId;
            return (
              <button
                key={s.id}
                onClick={() => selectShop(s.id)}
                className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${
                  selected ? 'border-[#FF914D] ring-2 ring-[#FF914D]/30 bg-[#FFF6EF]' : 'border-[#E8DEC8] hover:border-[#FF914D]/50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    isBranch ? 'bg-[#134E4A]/10 text-[#134E4A]' : 'bg-[#FF914D]/15 text-[#B8621F]'
                  }`}>
                    {isBranch ? <GitBranch className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                    {isBranch ? t('branchLabel') : t('mainStore')}
                  </span>
                  {isShopLive(s)
                    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t('liveBadge')}</span>
                    : <span className="text-[10px] font-bold text-[#8C7A70]">{t('hiddenBadge')}</span>}
                </div>
                <div className="font-bold text-sm text-[#134E4A] truncate">{shopName(s)}</div>
                <div className="text-xs text-[#8C7A70] truncate">
                  {isBranch && parentName(s) ? t('branchOf', { name: parentName(s) as string }) : (s.city || s.region || '—')}
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#134E4A]">
                  <Eye className="w-3 h-3 text-[#FF914D]" /> {formatViews(s.viewCount)} {t('viewsWord')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Store card */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden">
        <div className="h-32 bg-[#FAF7F2] relative">
          {shop.image && <img src={shop.image} alt="" className="w-full h-full object-cover" />}
          <div className="absolute top-3 right-3 flex gap-2">
            {isFeatured && (
              <span className="bg-[#FF914D] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            )}
            {shop.isVerified && (
              <span className="bg-[#134E4A] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#F5C542]" /> Verified
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
            className="flex items-center gap-1.5 text-xs font-semibold text-[#134E4A] border border-[#E8DEC8] hover:border-[#FF914D] px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
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
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
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
          <p className="text-xs text-[#8C7A70] text-center mt-2">{t('simulatedPayment')}</p>
        </div>

        {/* Boost */}
        <div className="bg-white rounded-2xl border border-[#E8DEC8] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#134E4A]">{t('boostToFeatured')}</h3>
            {isFeatured && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FF914D]/20 text-[#B8860B]">
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
            className="w-full flex items-center justify-center gap-2 bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg cursor-pointer"
          >
            {busy === 'boost' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {t('boost7Days')} — {formatUsd(BOOST_PRICE)}
          </button>
          <p className="text-xs text-[#8C7A70] text-center mt-2">
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
                    tx.type === 'boost' ? 'bg-[#FF914D]/10 text-[#FF914D]' : 'bg-[#134E4A]/10 text-[#134E4A]'
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

// ---- Visibility status: makes the 2-step path to going live obvious ----

interface VisProps {
  live: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isActive: boolean;
  onActivate: () => void;
  activating: boolean;
  t: (k: string, p?: Record<string, string | number>) => string;
}

const VisibilityStatus: React.FC<VisProps> = ({ live, isApproved, isRejected, isActive, onActivate, activating, t }) => {
  // Pick the single clearest message for the merchant's current state.
  let tone: 'green' | 'orange' | 'amber' | 'red' = 'amber';
  let Icon = Clock;
  let title = t('awaitingApproval');
  let desc = t('awaitingApprovalDesc');
  let showActivate = false;

  if (isRejected) {
    tone = 'red'; Icon = AlertTriangle; title = t('storeNotApproved'); desc = t('storeNotApprovedDesc');
  } else if (live) {
    tone = 'green'; Icon = CheckCircle2; title = t('visLiveTitle'); desc = t('visLiveDesc');
  } else if (isApproved && !isActive) {
    tone = 'orange'; Icon = Eye; title = t('visNeedSubTitle'); desc = t('visNeedSubDesc'); showActivate = true;
  }

  const toneCls = {
    green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    orange: 'bg-[#FFF3E9] border-[#FF914D]/40 text-[#8a4b1e]',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-700',
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${toneCls}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-6 h-6 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm sm:text-base">{title}</p>
          <p className="text-xs sm:text-sm opacity-90 mt-0.5">{desc}</p>

          {/* 2-step path: Approved → Subscription → Live */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <StepPill done={isApproved && !isRejected} label={t('stepApproved')} />
            <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            <StepPill done={isActive} label={t('stepSubscription')} />
            <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            <StepPill done={live} label={t('stepLive')} highlight={live} />
          </div>

          {showActivate && (
            <button
              onClick={onActivate}
              disabled={activating}
              className="mt-3 inline-flex items-center gap-2 bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
            >
              {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              {t('visActivateNow')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StepPill: React.FC<{ done: boolean; label: string; highlight?: boolean }> = ({ done, label, highlight }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
    done
      ? highlight ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/70 border-current'
      : 'bg-white/40 border-current opacity-60'
  }`}>
    {done ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border-2 border-current inline-block" />}
    {label}
  </span>
);

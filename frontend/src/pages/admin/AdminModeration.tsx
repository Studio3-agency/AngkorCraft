import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, Flag, Loader2, EyeOff, Trash2, RotateCcw, X, ExternalLink } from 'lucide-react';
import { AdminData } from '../../hooks/useAdminData';
import { ContentReport, ModerationStatus, Product, Shop } from '../../types';
import { fetchReports, resolveReport, setProductModeration, setShopModeration } from '../../lib/store';
import { useLanguage } from '../../context/LanguageContext';

const REASON_TK: Record<string, string> = {
  inappropriate: 'reportReasonInappropriate',
  counterfeit: 'reportReasonCounterfeit',
  scam: 'reportReasonScam',
  offensive: 'reportReasonOffensive',
  spam: 'reportReasonSpam',
  other: 'reportReasonOther',
};

const STATUS_STYLE: Record<ModerationStatus, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  flagged: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  removed: 'bg-red-50 text-red-700 border-red-200',
};
const STATUS_TK: Record<ModerationStatus, string> = {
  approved: 'modStatusApproved',
  flagged: 'modStatusFlagged',
  pending: 'modStatusPending',
  removed: 'modStatusRemoved',
};

export const AdminModeration: React.FC<{ data: AdminData }> = ({ data }) => {
  const { t } = useLanguage();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setReports(await fetchReports());
    } catch {
      /* RLS will block non-admins; ignore */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadReports(); }, []);

  const shopById = useMemo(() => new Map(data.shops.map((s) => [s.id, s])), [data.shops]);
  const productById = useMemo(() => new Map(data.products.map((p) => [p.id, p])), [data.products]);

  const openReports = reports.filter((r) => r.status === 'open');

  const flaggedContent = useMemo(() => {
    const shops = data.shops.filter((s) => s.moderationStatus && s.moderationStatus !== 'approved');
    const products = data.products.filter((p) => p.moderationStatus && p.moderationStatus !== 'approved');
    return { shops, products };
  }, [data.shops, data.products]);

  const targetName = (r: ContentReport): string => {
    if (r.targetType === 'product') return productById.get(r.targetId)?.title ?? r.targetId;
    return shopById.get(r.targetId)?.name ?? r.targetId;
  };
  const targetLink = (type: 'product' | 'shop', id: string): string | null => {
    if (type === 'shop') return shopById.get(id)?.slug ? `/shop/${shopById.get(id)!.slug}` : null;
    return null;
  };

  const moderate = async (type: 'product' | 'shop', id: string, status: ModerationStatus, reportId?: string) => {
    setBusy(reportId ?? id);
    try {
      if (type === 'product') await setProductModeration(id, status);
      else await setShopModeration(id, status);
      if (reportId) await resolveReport(reportId, 'reviewed');
      await Promise.all([data.refetch(), loadReports()]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const dismiss = async (reportId: string) => {
    setBusy(reportId);
    try {
      await resolveReport(reportId, 'dismissed');
      await loadReports();
    } finally {
      setBusy(null);
    }
  };

  const countReports = (type: 'product' | 'shop', id: string) =>
    openReports.filter((r) => r.targetType === type && r.targetId === id).length;

  if (loading || data.loading) {
    return <div className="flex items-center justify-center py-20 text-[#8C7A70]"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-bold text-[#134E4A] flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#FF914D]" /> {t('moderationLabel')}
        </h1>
        <p className="text-sm text-[#8C7A70] mt-1">{t('moderationDesc')}</p>
      </div>

      {/* Open reports */}
      <section>
        <h2 className="text-sm font-bold text-[#134E4A] uppercase tracking-wide mb-3 flex items-center gap-2">
          <Flag className="w-4 h-4 text-[#FF914D]" /> {t('openReports')} ({openReports.length})
        </h2>
        {openReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DEC8] p-8 text-center text-sm text-[#8C7A70]">{t('noOpenReports')}</div>
        ) : (
          <div className="space-y-3">
            {openReports.map((r) => {
              const link = targetLink(r.targetType, r.targetId);
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-[#E8DEC8] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#8C7A70] bg-[#F2EDE4] px-2 py-0.5 rounded-full">{r.targetType}</span>
                        <span className="font-bold text-[#134E4A]">{targetName(r)}</span>
                        {link && (
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-[#FF914D] hover:underline inline-flex items-center gap-0.5 text-xs">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-[#5C4D44] mt-1">
                        <span className="text-[#8C7A70]">{t('reportedFor')}:</span> {t(REASON_TK[r.reason] ?? 'reportReasonOther')}
                      </p>
                      {r.note && <p className="text-sm text-[#5C4D44] mt-0.5 italic">“{r.note}”</p>}
                      <p className="text-[11px] text-[#8C7A70] mt-1">
                        {new Date(r.createdAt).toLocaleDateString()} {r.reporterEmail ? `· ${r.reporterEmail}` : ''}
                        {countReports(r.targetType, r.targetId) > 1 ? ` · ${t('reportsCount').replace('{n}', String(countReports(r.targetType, r.targetId)))}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button disabled={busy === r.id} onClick={() => moderate(r.targetType, r.targetId, 'flagged', r.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50">
                        <EyeOff className="w-3.5 h-3.5" /> {t('actionHide')}
                      </button>
                      <button disabled={busy === r.id} onClick={() => moderate(r.targetType, r.targetId, 'removed', r.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50">
                        <Trash2 className="w-3.5 h-3.5" /> {t('actionRemove')}
                      </button>
                      <button disabled={busy === r.id} onClick={() => dismiss(r.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C7A70] hover:bg-[#F2EDE4] border border-[#E8DEC8] px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50">
                        <X className="w-3.5 h-3.5" /> {t('actionDismiss')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Content under review (flagged/removed) */}
      <section>
        <h2 className="text-sm font-bold text-[#134E4A] uppercase tracking-wide mb-3 flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-[#FF914D]" /> {t('flaggedContent')}
        </h2>
        {flaggedContent.shops.length === 0 && flaggedContent.products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DEC8] p-8 text-center text-sm text-[#8C7A70]">{t('noFlaggedContent')}</div>
        ) : (
          <div className="space-y-2">
            {[
              ...flaggedContent.products.map((p) => ({ type: 'product' as const, id: p.id, name: (p as Product).title, status: p.moderationStatus! })),
              ...flaggedContent.shops.map((s) => ({ type: 'shop' as const, id: s.id, name: (s as Shop).name, status: s.moderationStatus! })),
            ].map((item) => (
              <div key={`${item.type}-${item.id}`} className="bg-white rounded-xl border border-[#E8DEC8] p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#8C7A70] bg-[#F2EDE4] px-2 py-0.5 rounded-full">{item.type}</span>
                  <span className="font-semibold text-[#134E4A] truncate">{item.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[item.status]}`}>{t(STATUS_TK[item.status])}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button disabled={busy === item.id} onClick={() => moderate(item.type, item.id, 'approved')} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50">
                    <RotateCcw className="w-3.5 h-3.5" /> {t('actionRestore')}
                  </button>
                  {item.status !== 'removed' && (
                    <button disabled={busy === item.id} onClick={() => moderate(item.type, item.id, 'removed')} className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" /> {t('actionRemove')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

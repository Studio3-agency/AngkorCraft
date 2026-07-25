import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  MapPin,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Store,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Info,
} from 'lucide-react';
import { MerchantData } from '../../hooks/useMerchantData';
import { useLanguage } from '../../context/LanguageContext';
import { StoreViewSource } from '../../types';
import { CustomSelect } from '../../components/CustomSelect';
import { Skeleton } from '../../components/Skeleton';
import {
  Granularity,
  buildSeries,
  computeKpis,
  countBySource,
  SOURCE_ORDER,
  WindowStat,
  ViewBucket,
} from '../../lib/analytics';

type SortKey = 'period' | 'views';
type SortDir = 'asc' | 'desc';

const SOURCE_ICON: Record<StoreViewSource, React.ElementType> = {
  store_page: Eye,
  directions: MapPin,
  contact: MessageCircle,
};

export const MerchantAnalytics: React.FC<{ data: MerchantData }> = ({ data }) => {
  const { shop, storeViews, viewsLoading, refetchViews } = data;
  const { t, language } = useLanguage();

  const [granularity, setGranularity] = useState<Granularity>('day');
  const [sourceFilter, setSourceFilter] = useState<'all' | StoreViewSource>('all');
  const [sortKey, setSortKey] = useState<SortKey>('period');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [hovered, setHovered] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const sourceLabel = (s: StoreViewSource): string =>
    s === 'store_page' ? t('analyticsSrcStorePage')
      : s === 'directions' ? t('analyticsSrcDirections')
        : t('analyticsSrcContact');

  // Auto-refresh: silently poll while the tab is visible, and immediately on
  // focus / tab-return, so the merchant sees new visits without reloading.
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') refetchViews(); };
    const id = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refetchViews, shop?.id]);

  // Stamp "updated Xs ago" whenever fresh view data lands.
  useEffect(() => { setLastUpdated(Date.now()); }, [storeViews]);

  const filtered = useMemo(
    () => (sourceFilter === 'all' ? storeViews : storeViews.filter((v) => v.source === sourceFilter)),
    [storeViews, sourceFilter],
  );

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const series = useMemo(() => buildSeries(filtered, granularity), [filtered, granularity]);
  const bySource = useMemo(() => countBySource(storeViews), [storeViews]);

  const seriesTotal = series.reduce((s, b) => s + b.count, 0);
  const peak = series.reduce((m, b) => Math.max(m, b.count), 0);

  const sortedRows = useMemo(() => {
    const rows = [...series];
    rows.sort((a, b) => {
      const cmp = sortKey === 'period' ? a.start - b.start : a.count - b.count || a.start - b.start;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [series, sortKey, sortDir]);

  if (!shop) return null;

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'period' ? 'desc' : 'desc'); }
  };

  const manualRefresh = async () => {
    setRefreshing(true);
    await refetchViews();
    setRefreshing(false);
  };

  const initialLoading = viewsLoading && storeViews.length === 0;
  const isEmpty = !viewsLoading && storeViews.length === 0;

  const granOptions: { key: Granularity; label: string }[] = [
    { key: 'day', label: t('analyticsDaily') },
    { key: 'week', label: t('analyticsWeekly') },
    { key: 'month', label: t('analyticsMonthly') },
  ];

  const sourceOptions = [
    { value: 'all', label: t('analyticsAllSources') },
    ...SOURCE_ORDER.map((s) => ({ value: s, label: sourceLabel(s) })),
  ];

  const spanLabel =
    granularity === 'day' ? t('analyticsLast30Days')
      : granularity === 'week' ? t('analyticsLast12Weeks')
        : t('analyticsLast12Months');

  const updatedAgo = () => {
    const secs = Math.max(0, Math.round((Date.now() - lastUpdated) / 1000));
    if (secs < 5) return t('analyticsJustNow');
    if (secs < 60) return t('analyticsSecondsAgo', { n: secs });
    return new Date(lastUpdated).toLocaleTimeString(language === 'kh' ? 'en-GB' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Title + live status + controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-sans text-xl font-bold text-[#134E4A] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF914D]" /> {t('analyticsTitle')}
          </h2>
          <p className="text-xs text-[#8C7A70] mt-0.5">{t('analyticsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#134E4A] bg-[#134E4A]/8 px-2.5 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {t('analyticsLive')}
          </span>
          <span className="text-xs text-[#8C7A70] hidden sm:inline">{t('analyticsUpdated', { time: updatedAgo() })}</span>
          <button
            onClick={manualRefresh}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#134E4A] border border-[#E8DEC8] hover:border-[#FF914D] px-3 py-1.5 rounded-full cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> {t('analyticsRefresh')}
          </button>
        </div>
      </div>

      {/* Not-yet-approved hint */}
      {shop.status !== 'approved' && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{t('analyticsNotLiveYet')}</span>
        </div>
      )}

      {/* KPI tiles */}
      {initialLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8DEC8] p-4 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile label={t('analyticsToday')} stat={kpis.today} caption={t('analyticsVsYesterday')} t={t} />
          <KpiTile label={t('analyticsThisWeek')} stat={kpis.week} caption={t('analyticsVsPrev7')} t={t} />
          <KpiTile label={t('analyticsThisMonth')} stat={kpis.month} caption={t('analyticsVsPrev30')} t={t} />
          <div className="bg-[#134E4A] rounded-2xl p-4 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#F5C542] mb-1 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> {t('analyticsAllTime')}
            </div>
            <div className="text-3xl font-bold leading-none">{kpis.allTime.toLocaleString()}</div>
            <div className="text-xs text-white/70 mt-2">{t('analyticsTotalViews')}</div>
          </div>
        </div>
      )}

      {isEmpty ? (
        <EmptyState shopLive={shop.status === 'approved'} t={t} />
      ) : (
        <>
          {/* Trend chart */}
          <div className="bg-white rounded-2xl border border-[#E8DEC8] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-[#134E4A]">{t('analyticsTrend')}</h3>
                <p className="text-xs text-[#8C7A70]">
                  {spanLabel} · {t('analyticsTotalN', { n: seriesTotal.toLocaleString() })}
                  {peak > 0 && ` · ${t('analyticsPeakN', { n: peak.toLocaleString() })}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Granularity segmented control */}
                <div className="inline-flex bg-[#F2EDE4] rounded-full p-0.5">
                  {granOptions.map((g) => (
                    <button
                      key={g.key}
                      onClick={() => setGranularity(g.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        granularity === g.key ? 'bg-[#FF914D] text-white' : 'text-[#134E4A]/70 hover:text-[#134E4A]'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                {/* Source filter */}
                <CustomSelect
                  value={sourceFilter}
                  options={sourceOptions}
                  onChange={(v) => setSourceFilter(v as 'all' | StoreViewSource)}
                  className="w-40"
                />
              </div>
            </div>

            {initialLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <TrendChart series={series} peak={peak} hovered={hovered} setHovered={setHovered} />
            )}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Source breakdown */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DEC8] p-5">
              <h3 className="font-semibold text-[#134E4A] mb-1">{t('analyticsBySource')}</h3>
              <p className="text-xs text-[#8C7A70] mb-4">{t('analyticsBySourceDesc')}</p>
              <div className="space-y-3">
                {SOURCE_ORDER.map((s) => {
                  const count = bySource[s];
                  const totalAll = storeViews.length || 1;
                  const pct = Math.round((count / totalAll) * 100);
                  const Icon = SOURCE_ICON[s];
                  const active = sourceFilter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setSourceFilter(active ? 'all' : s)}
                      className={`w-full text-left group cursor-pointer ${active ? '' : 'opacity-90 hover:opacity-100'}`}
                    >
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#134E4A]">
                          <Icon className={`w-4 h-4 ${active ? 'text-[#FF914D]' : 'text-[#8C7A70]'}`} /> {sourceLabel(s)}
                        </span>
                        <span className="font-bold text-[#134E4A]">{count.toLocaleString()} <span className="text-[#8C7A70] font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F2EDE4] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${active ? 'bg-[#FF914D]' : 'bg-[#FF914D]/60 group-hover:bg-[#FF914D]'}`}
                          style={{ width: `${Math.max(count > 0 ? 4 : 0, pct)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
              {sourceFilter !== 'all' && (
                <button
                  onClick={() => setSourceFilter('all')}
                  className="mt-4 text-xs font-semibold text-[#FF914D] hover:underline cursor-pointer"
                >
                  {t('analyticsClearFilter')}
                </button>
              )}
            </div>

            {/* Sortable / filterable breakdown table */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F2EDE4] flex items-center justify-between">
                <h3 className="font-semibold text-[#134E4A]">{t('analyticsBreakdown')}</h3>
                <span className="text-xs text-[#8C7A70]">
                  {sourceFilter === 'all' ? t('analyticsAllSources') : sourceLabel(sourceFilter as StoreViewSource)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#8C7A70] border-b border-[#F2EDE4]">
                      <SortableTh label={t('analyticsPeriod')} active={sortKey === 'period'} dir={sortDir} onClick={() => toggleSort('period')} />
                      <SortableTh label={t('analyticsViews')} active={sortKey === 'views'} dir={sortDir} onClick={() => toggleSort('views')} align="right" />
                      <th className="px-5 py-2.5 text-right font-semibold text-xs uppercase tracking-wider">{t('analyticsShare')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row) => {
                      const pct = seriesTotal > 0 ? Math.round((row.count / seriesTotal) * 100) : 0;
                      return (
                        <tr key={row.key} className="border-b border-[#F5F1E8] last:border-0 hover:bg-[#FAF7F2]">
                          <td className="px-5 py-2.5 text-[#134E4A]">{row.fullLabel}</td>
                          <td className="px-5 py-2.5 text-right font-bold text-[#134E4A]">{row.count.toLocaleString()}</td>
                          <td className="px-5 py-2.5 text-right text-[#8C7A70]">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---- sub-components ----

const KpiTile: React.FC<{ label: string; stat: WindowStat; caption: string; t: (k: string, p?: Record<string, string | number>) => string }> = ({ label, stat, caption, t }) => (
  <div className="bg-white rounded-2xl border border-[#E8DEC8] p-4">
    <div className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-1">{label}</div>
    <div className="text-3xl font-bold leading-none text-[#134E4A]">{stat.current.toLocaleString()}</div>
    <div className="mt-2 flex items-center gap-1.5 text-xs">
      <DeltaBadge stat={stat} t={t} />
      <span className="text-[#8C7A70]">{caption}</span>
    </div>
  </div>
);

const DeltaBadge: React.FC<{ stat: WindowStat; t: (k: string, p?: Record<string, string | number>) => string }> = ({ stat, t }) => {
  if (stat.deltaPct === null) {
    return <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600">{t('analyticsNew')}</span>;
  }
  if (stat.deltaPct === 0) {
    return <span className="font-bold text-[#8C7A70]">0%</span>;
  }
  const up = stat.deltaPct > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {up ? '+' : ''}{stat.deltaPct}%
    </span>
  );
};

const SortableTh: React.FC<{ label: string; active: boolean; dir: SortDir; onClick: () => void; align?: 'left' | 'right' }> = ({ label, active, dir, onClick, align = 'left' }) => (
  <th className={`px-5 py-2.5 font-semibold text-xs uppercase tracking-wider ${align === 'right' ? 'text-right' : 'text-left'}`}>
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 cursor-pointer hover:text-[#134E4A] ${active ? 'text-[#FF914D]' : ''} ${align === 'right' ? 'flex-row-reverse' : ''}`}
    >
      {label}
      {active && (dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
    </button>
  </th>
);

const TrendChart: React.FC<{ series: ViewBucket[]; peak: number; hovered: number | null; setHovered: (i: number | null) => void }> = ({ series, peak, hovered, setHovered }) => {
  const labelStep = Math.max(1, Math.ceil(series.length / 8));
  return (
    <div className="relative">
      <div className="flex items-end gap-1 h-48">
        {series.map((b, i) => {
          const h = peak > 0 ? (b.count / peak) * 100 : 0;
          const isHovered = hovered === i;
          return (
            <div
              key={b.key}
              className="flex-1 h-full flex items-end relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={`w-full rounded-t-md transition-colors ${isHovered ? 'bg-[#F07A33]' : b.count > 0 ? 'bg-[#FF914D]' : 'bg-[#F2EDE4]'}`}
                style={{ height: `${b.count > 0 ? Math.max(3, h) : 6}%`, minHeight: b.count > 0 ? 4 : 2 }}
                title={`${b.fullLabel}: ${b.count}`}
              />
              {isHovered && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full z-10 whitespace-nowrap bg-[#134E4A] text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg pointer-events-none">
                  <div className="font-bold">{b.count.toLocaleString()} {b.count === 1 ? 'view' : 'views'}</div>
                  <div className="text-white/70 text-[10px]">{b.fullLabel}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Sparse axis labels */}
      <div className="flex gap-1 mt-2">
        {series.map((b, i) => (
          <div key={b.key} className="flex-1 text-center text-[10px] text-[#8C7A70] truncate">
            {i % labelStep === 0 || i === series.length - 1 ? b.label : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ shopLive: boolean; t: (k: string, p?: Record<string, string | number>) => string }> = ({ shopLive, t }) => (
  <div className="bg-white rounded-2xl border border-dashed border-[#E8DEC8] p-10 text-center">
    <div className="w-14 h-14 bg-[#FF914D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Sparkles className="w-7 h-7 text-[#FF914D]" />
    </div>
    <h3 className="font-sans text-lg font-bold text-[#134E4A] mb-1">{t('analyticsEmptyTitle')}</h3>
    <p className="text-sm text-[#8C7A70] max-w-md mx-auto">
      {shopLive ? t('analyticsEmptyDesc') : t('analyticsEmptyPending')}
    </p>
    <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#134E4A] bg-[#FAF7F2] border border-[#E8DEC8] rounded-full px-4 py-2">
      <Store className="w-4 h-4 text-[#FF914D]" /> {t('analyticsEmptyHint')}
    </div>
  </div>
);

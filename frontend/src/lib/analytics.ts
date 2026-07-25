import { StoreView, StoreViewSource } from '../types';

/** Time grain for the trend chart + table. */
export type Granularity = 'day' | 'week' | 'month';

/** One column of the trend: a time bucket with its view count. */
export interface ViewBucket {
  key: string; // stable identity for React keys
  label: string; // short axis label (e.g. "Jul 26")
  fullLabel: string; // longer label for tooltips / table rows
  start: number; // bucket start, ms (inclusive)
  count: number;
}

/** How many buckets each grain shows by default (looks good on the chart). */
export const GRANULARITY_SPAN: Record<Granularity, number> = {
  day: 30, // last 30 days
  week: 12, // last 12 weeks
  month: 12, // last 12 months
};

const DAY_MS = 24 * 60 * 60 * 1000;

// ---- local-time boundary helpers ----

function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Monday-based start of week. */
function startOfWeek(t: number): number {
  const d = new Date(startOfDay(t));
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

function startOfMonth(t: number): number {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function bucketStart(t: number, g: Granularity): number {
  if (g === 'day') return startOfDay(t);
  if (g === 'week') return startOfWeek(t);
  return startOfMonth(t);
}

/** Start of the bucket `n` steps before the one containing `t`. */
function stepBack(t: number, g: Granularity, n: number): number {
  const d = new Date(bucketStart(t, g));
  if (g === 'day') d.setDate(d.getDate() - n);
  else if (g === 'week') d.setDate(d.getDate() - n * 7);
  else d.setMonth(d.getMonth() - n);
  return d.getTime();
}

function fmt(t: number, opts: Intl.DateTimeFormatOptions): string {
  return new Date(t).toLocaleDateString('en-US', opts);
}

function labelFor(start: number, g: Granularity): { label: string; fullLabel: string } {
  if (g === 'day') {
    return {
      label: fmt(start, { month: 'short', day: 'numeric' }),
      fullLabel: fmt(start, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }
  if (g === 'week') {
    const end = start + 6 * DAY_MS;
    return {
      label: fmt(start, { month: 'short', day: 'numeric' }),
      fullLabel: `${fmt(start, { month: 'short', day: 'numeric' })} – ${fmt(end, { month: 'short', day: 'numeric', year: 'numeric' })}`,
    };
  }
  return {
    label: fmt(start, { month: 'short' }),
    fullLabel: fmt(start, { month: 'long', year: 'numeric' }),
  };
}

/**
 * Build a continuous, zero-filled trend of the last `GRANULARITY_SPAN[g]`
 * buckets ending at now — oldest first, so the chart reads left→right.
 */
export function buildSeries(views: StoreView[], g: Granularity, now = Date.now()): ViewBucket[] {
  const span = GRANULARITY_SPAN[g];
  const buckets: ViewBucket[] = [];
  const indexByStart = new Map<number, number>();

  for (let i = span - 1; i >= 0; i--) {
    const start = stepBack(now, g, i);
    const { label, fullLabel } = labelFor(start, g);
    indexByStart.set(start, buckets.length);
    buckets.push({ key: String(start), label, fullLabel, start, count: 0 });
  }

  for (const v of views) {
    const t = Date.parse(v.createdAt);
    if (Number.isNaN(t)) continue;
    const idx = indexByStart.get(bucketStart(t, g));
    if (idx !== undefined) buckets[idx].count += 1;
  }
  return buckets;
}

// ---- KPI windows ----

export interface WindowStat {
  current: number;
  previous: number;
  /** Percentage change vs the previous equal window; null when incomputable. */
  deltaPct: number | null;
}

function countBetween(views: StoreView[], fromMs: number, toMs: number): number {
  let n = 0;
  for (const v of views) {
    const t = Date.parse(v.createdAt);
    if (t >= fromMs && t < toMs) n += 1;
  }
  return n;
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Rolling window of `days` compared to the immediately preceding equal window. */
function rollingStat(views: StoreView[], days: number, now: number): WindowStat {
  const span = days * DAY_MS;
  const current = countBetween(views, now - span, now);
  const previous = countBetween(views, now - 2 * span, now - span);
  return { current, previous, deltaPct: deltaPct(current, previous) };
}

export interface KpiSet {
  today: WindowStat; // calendar day vs yesterday
  week: WindowStat; // last 7 days vs prior 7
  month: WindowStat; // last 30 days vs prior 30
  allTime: number;
}

export function computeKpis(views: StoreView[], now = Date.now()): KpiSet {
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - DAY_MS;
  const todayCount = countBetween(views, todayStart, now + 1);
  const yesterdayCount = countBetween(views, yesterdayStart, todayStart);
  return {
    today: {
      current: todayCount,
      previous: yesterdayCount,
      deltaPct: deltaPct(todayCount, yesterdayCount),
    },
    week: rollingStat(views, 7, now),
    month: rollingStat(views, 30, now),
    allTime: views.length,
  };
}

// ---- source breakdown ----

export const SOURCE_ORDER: StoreViewSource[] = ['store_page', 'directions', 'contact'];

export function countBySource(views: StoreView[]): Record<StoreViewSource, number> {
  const out: Record<StoreViewSource, number> = { store_page: 0, directions: 0, contact: 0 };
  for (const v of views) {
    if (v.source in out) out[v.source] += 1;
  }
  return out;
}

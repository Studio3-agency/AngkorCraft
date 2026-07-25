-- =====================================================================
--  AngkorCraft — store view analytics
--  Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
--  Records a row every time a tourist opens a store page (or taps its
--  Directions / Contact actions). The merchant portal reads these back and
--  aggregates them into daily / weekly / monthly view analytics.
--
--  Model: since AngkorCraft is about DISCOVERY (the deal happens in person),
--  "views" are the real success metric — not sales. This replaces the old
--  simulated POS as the merchant's dashboard signal.
-- =====================================================================

create table if not exists public.store_views (
  id          uuid primary key default gen_random_uuid(),
  shop_id     text not null references public.shops(id) on delete cascade,
  -- What the visitor did: opened the page, tapped directions, tapped a contact.
  source      text not null default 'store_page'
                check (source in ('store_page','directions','contact')),
  created_at  timestamptz not null default now()
);

-- Aggregations are always "for this shop, over a time window", so index both.
create index if not exists store_views_shop_idx         on public.store_views(shop_id);
create index if not exists store_views_shop_created_idx on public.store_views(shop_id, created_at desc);

-- Anon tourists must be able to log a view; the shop owner must be able to read
-- their own. service_role (backend) keeps full access.
grant insert on public.store_views to anon, authenticated;
grant select on public.store_views to anon, authenticated;
grant all    on public.store_views to service_role;

alter table public.store_views enable row level security;

-- Anyone (including anonymous, not-logged-in visitors) may record a view.
drop policy if exists store_views_insert on public.store_views;
create policy store_views_insert on public.store_views
  for insert with check (true);

-- Only the shop's owner (or an admin) may read its view analytics — a merchant
-- can never see another merchant's traffic.
drop policy if exists store_views_select on public.store_views;
create policy store_views_select on public.store_views
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.shops s
      where s.id = store_views.shop_id and s.owner_id = auth.uid()
    )
  );

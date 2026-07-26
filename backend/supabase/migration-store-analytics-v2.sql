-- =====================================================================
--  AngkorCraft — store analytics v2  (run once, safe to re-run)
--  Builds on migration-store-views.sql. Adds:
--    1. shops.view_count — a public, denormalized total so cards across the
--       marketplace can show "N views" without exposing the raw view log
--       (which stays owner/admin-only). Kept in sync by a trigger.
--    2. shops.parent_shop_id — lets a store be a BRANCH of another store the
--       same merchant owns (shared brand info, separate location).
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. Public view counter
-- ---------------------------------------------------------------------
alter table public.shops add column if not exists view_count integer not null default 0;

-- Bump the shop's counter every time a view is recorded. SECURITY DEFINER so it
-- can update shops regardless of the (anonymous) visitor's RLS permissions; it
-- only touches view_count, so the moderation/approval guards are unaffected.
create or replace function public.bump_shop_view_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.shops set view_count = coalesce(view_count, 0) + 1
    where id = new.shop_id;
  return new;
end; $$;
drop trigger if exists bump_shop_view_count on public.store_views;
create trigger bump_shop_view_count after insert on public.store_views
  for each row execute function public.bump_shop_view_count();

-- One-time backfill so the counter matches any views already logged.
update public.shops s
set view_count = coalesce((
  select count(*) from public.store_views v where v.shop_id = s.id
), 0);

-- ---------------------------------------------------------------------
--  2. Branch relationship
-- ---------------------------------------------------------------------
-- A branch points at its "main" store. NULL = a standalone / main store.
alter table public.shops add column if not exists parent_shop_id text
  references public.shops(id) on delete set null;
create index if not exists shops_parent_idx on public.shops(parent_shop_id);

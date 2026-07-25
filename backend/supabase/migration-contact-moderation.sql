-- =====================================================================
--  AngkorCraft — contact info, store slugs & content moderation
--  Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--  Adds:
--    1. Merchant contact / social fields on shops
--    2. Shareable store slugs (unique) + backfill for existing shops
--    3. Content-moderation columns, a reports table, auto-escalation, and
--       admin-only guards — the industry-standard "reactive moderation"
--       stack for a small review team.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. CONTACT / SOCIAL FIELDS  (task: merchant contact info)
-- ---------------------------------------------------------------------
alter table public.shops add column if not exists instagram    text default '';
alter table public.shops add column if not exists telegram     text default '';
alter table public.shops add column if not exists wechat       text default '';
alter table public.shops add column if not exists messenger    text default '';
alter table public.shops add column if not exists facebook     text default '';
alter table public.shops add column if not exists tiktok       text default '';
alter table public.shops add column if not exists whatsapp     text default '';
alter table public.shops add column if not exists website      text default '';
alter table public.shops add column if not exists email        text default '';
alter table public.shops add column if not exists contact_note text default '';

-- ---------------------------------------------------------------------
--  2. SHAREABLE STORE SLUGS  (task: individual store page URL)
-- ---------------------------------------------------------------------
alter table public.shops add column if not exists slug text;

-- Backfill: turn the shop name into a URL slug; disambiguate duplicates by
-- appending a counter so the unique index below never fails.
with ranked as (
  select id,
         coalesce(base, 'shop') as base,
         row_number() over (partition by coalesce(base, 'shop') order by created_at, id) as rn
  from (
    select id, created_at,
           nullif(trim(both '-' from regexp_replace(lower(coalesce(nullif(name, ''), 'shop')),
                                                     '[^a-z0-9]+', '-', 'g')), '') as base
    from public.shops
  ) t
)
update public.shops s
set slug = case when r.rn = 1 then r.base else r.base || '-' || r.rn end
from ranked r
where s.id = r.id and (s.slug is null or s.slug = '');

create unique index if not exists shops_slug_key on public.shops(slug);

-- ---------------------------------------------------------------------
--  3. CONTENT MODERATION  (task: verification / safeguards)
-- ---------------------------------------------------------------------

-- Moderation state on the content itself. 'approved' = publicly visible.
-- 'pending' = awaiting review (e.g. auto-moderation held it). 'flagged' =
-- hidden from the public while an admin reviews reports. 'removed' = taken down.
alter table public.products add column if not exists moderation_status text not null default 'approved';
alter table public.shops    add column if not exists moderation_status text not null default 'approved';

-- (re)apply check constraints defensively
do $$ begin
  alter table public.products drop constraint if exists products_moderation_status_check;
  alter table public.products add constraint products_moderation_status_check
    check (moderation_status in ('approved','pending','flagged','removed'));
  alter table public.shops drop constraint if exists shops_moderation_status_check;
  alter table public.shops add constraint shops_moderation_status_check
    check (moderation_status in ('approved','pending','flagged','removed'));
end $$;

-- Reports filed by shoppers (incl. anonymous tourists) against a product/shop.
create table if not exists public.content_reports (
  id text primary key,
  target_type    text not null check (target_type in ('product','shop')),
  target_id      text not null,
  reason         text not null,
  note           text default '',
  reporter_id    uuid references public.profiles(id) on delete set null,
  reporter_email text default '',
  status         text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at     timestamptz not null default now()
);
create index if not exists content_reports_status_idx on public.content_reports(status);
create index if not exists content_reports_target_idx on public.content_reports(target_type, target_id);

grant select, insert on public.content_reports to anon, authenticated;
grant all on public.content_reports to service_role;

alter table public.content_reports enable row level security;

-- Anyone may file a report (that's the point — tourists aren't logged in).
drop policy if exists content_reports_insert on public.content_reports;
create policy content_reports_insert on public.content_reports
  for insert with check (true);
-- Only admins may read / triage / delete them.
drop policy if exists content_reports_select on public.content_reports;
create policy content_reports_select on public.content_reports
  for select using (public.is_admin());
drop policy if exists content_reports_update on public.content_reports;
create policy content_reports_update on public.content_reports
  for update using (public.is_admin());
drop policy if exists content_reports_delete on public.content_reports;
create policy content_reports_delete on public.content_reports
  for delete using (public.is_admin());

-- --- Admin-only guard for moderation_status --------------------------
-- Merchants can edit their own content but must not clear a moderation flag.
-- Only an admin JWT (or the auto-escalation trigger, via a transaction-local
-- bypass flag) may change moderation_status.
create or replace function public.moderation_guard_allowed()
returns boolean
language sql
stable
as $$
  select public.is_admin()
      or coalesce(current_setting('app.moderation_bypass', true), '') = 'on';
$$;

create or replace function public.protect_product_moderation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.moderation_status is distinct from old.moderation_status
     and not public.moderation_guard_allowed() then
    new.moderation_status := old.moderation_status;
  end if;
  return new;
end; $$;
drop trigger if exists protect_product_moderation on public.products;
create trigger protect_product_moderation before update on public.products
  for each row execute function public.protect_product_moderation();

-- Extend the existing shop guard to also protect moderation_status.
create or replace function public.protect_shop_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.status := old.status;
    new.is_verified := old.is_verified;
  end if;
  if new.moderation_status is distinct from old.moderation_status
     and not public.moderation_guard_allowed() then
    new.moderation_status := old.moderation_status;
  end if;
  return new;
end; $$;
drop trigger if exists protect_shop_columns on public.shops;
create trigger protect_shop_columns before update on public.shops
  for each row execute function public.protect_shop_columns();

-- --- Automated escalation --------------------------------------------
-- With a small team we can't read every listing. Once a piece of content
-- collects 3+ open reports, auto-hide it (flag) pending admin review. Uses a
-- transaction-local bypass so the moderation guard permits this system change.
create or replace function public.escalate_reported_content()
returns trigger language plpgsql security definer set search_path = public as $$
declare open_count int;
begin
  select count(*) into open_count
  from public.content_reports
  where target_type = new.target_type and target_id = new.target_id and status = 'open';

  if open_count >= 3 then
    perform set_config('app.moderation_bypass', 'on', true);
    if new.target_type = 'product' then
      update public.products set moderation_status = 'flagged'
        where id = new.target_id and moderation_status = 'approved';
    else
      update public.shops set moderation_status = 'flagged'
        where id = new.target_id and moderation_status = 'approved';
    end if;
    perform set_config('app.moderation_bypass', 'off', true);
  end if;
  return new;
end; $$;
drop trigger if exists escalate_reported_content on public.content_reports;
create trigger escalate_reported_content after insert on public.content_reports
  for each row execute function public.escalate_reported_content();

-- --- Public visibility: hide non-approved content --------------------
-- Owners and admins still see their own flagged content (with a badge in the
-- portal); the public catalog only sees 'approved'.
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (
    owner_id is null
    or owner_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.shops s
      where s.id = products.owner_shop_id and s.status = 'approved'
    ) and products.moderation_status = 'approved'
  );

drop policy if exists shops_select on public.shops;
create policy shops_select on public.shops
  for select using (
    (status = 'approved' and moderation_status <> 'removed')
    or owner_id = auth.uid()
    or public.is_admin()
  );

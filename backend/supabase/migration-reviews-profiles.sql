-- =====================================================================
--  AngkorCraft — user profiles + store reviews
--  Run once in the Supabase SQL Editor. Safe to re-run.
--  Adds a public-safe profile view (name/avatar/bio only), a profile bio
--  column, and a store_reviews table so shoppers can rate + comment on shops.
-- =====================================================================

-- 1. Profile bio (avatar_url + full_name already exist on profiles).
alter table public.profiles add column if not exists bio text default '';

-- 2. Public-safe view of profiles. A view runs with its owner's rights, so it
--    bypasses the profiles RLS and exposes ONLY name/avatar/bio (never phone).
--    This lets the public see who runs a store and who wrote a review.
create or replace view public.public_profiles as
  select id, full_name, avatar_url, bio from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- 3. Store reviews. Author name/avatar are denormalized at write time so the
--    public can render them without reading the profiles table.
create table if not exists public.store_reviews (
  id           text primary key,
  shop_id      text not null references public.shops(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  author_name  text default '',
  author_avatar text default '',
  rating       int not null check (rating between 1 and 5),
  comment      text default '',
  created_at   timestamptz not null default now(),
  unique (shop_id, user_id) -- one review per shopper per store
);
create index if not exists store_reviews_shop_idx on public.store_reviews(shop_id);

grant select on public.store_reviews to anon, authenticated;
grant insert, update, delete on public.store_reviews to authenticated;

alter table public.store_reviews enable row level security;

-- Anyone may read reviews.
drop policy if exists store_reviews_select on public.store_reviews;
create policy store_reviews_select on public.store_reviews for select using (true);
-- A logged-in user may write / edit / delete only their own review.
drop policy if exists store_reviews_insert on public.store_reviews;
create policy store_reviews_insert on public.store_reviews
  for insert with check (user_id = auth.uid());
drop policy if exists store_reviews_update on public.store_reviews;
create policy store_reviews_update on public.store_reviews
  for update using (user_id = auth.uid());
drop policy if exists store_reviews_delete on public.store_reviews;
create policy store_reviews_delete on public.store_reviews
  for delete using (user_id = auth.uid() or public.is_admin());

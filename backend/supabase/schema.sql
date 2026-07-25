-- =====================================================================
--  AngkorCraft — Supabase schema, triggers, and Row-Level Security
--  Run this in the Supabase SQL Editor (Dashboard -> SQL -> New query).
--  Safe to re-run: it uses IF NOT EXISTS / DROP ... IF EXISTS throughout.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
--  TABLES
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','merchant','admin')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.shops (
  id text primary key,
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  khmer_name text default '',
  type text not null default 'Artisan Workshop',
  region text not null default 'Phnom Penh',
  city text default '',
  address text default '',
  lat double precision default 0,
  lng double precision default 0,
  opening_hours text default '',
  payment_methods text[] default '{}',
  phone text default '',
  google_maps_url text default '',
  rating numeric default 0,
  review_count integer default 0,
  image_url text default '',
  image_public_id text,
  description text default '',
  is_verified boolean default false,
  featured_product_ids text[] default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_featured boolean default false,
  featured_until timestamptz,
  subscription_status text not null default 'inactive' check (subscription_status in ('trial','active','inactive')),
  subscription_expires_at timestamptz,
  vertical text not null default 'artisan',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  owner_id uuid references public.profiles(id) on delete set null,
  owner_shop_id text references public.shops(id) on delete set null,
  title text not null,
  khmer_title text default '',
  category text not null default 'All',
  region text not null default 'Phnom Penh',
  price_usd numeric default 0,
  price_range text default '',
  price_level text default '$',
  rating numeric default 0,
  review_count integer default 0,
  image_url text default '',
  image_public_id text,
  description text default '',
  cultural_story text default '',
  store_ids text[] default '{}',
  authentic_tips text[] default '{}',
  tags text[] default '{}',
  is_gi_certified boolean default false,
  is_handmade boolean default false,
  artisan_group text default '',
  material text default '',
  is_popular boolean default false,
  is_featured boolean default false,
  vertical text not null default 'artisan',
  created_at timestamptz not null default now()
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text references public.products(id) on delete cascade,
  shop_id text references public.shops(id) on delete cascade,
  created_at timestamptz not null default now()
);
-- Full (non-partial) unique index so supabase-js upsert onConflict works.
create unique index if not exists wishlists_user_product_uniq
  on public.wishlists(user_id, product_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  shop_id text not null references public.shops(id) on delete cascade,
  type text not null check (type in ('subscription','boost')),
  amount_usd numeric not null default 0,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

create table if not exists public.pos_sales (
  id uuid primary key default gen_random_uuid(),
  shop_id text not null references public.shops(id) on delete cascade,
  items jsonb not null default '[]',
  total_usd numeric not null default 0,
  payment_method text not null default 'Cash (USD/KHR)',
  created_at timestamptz not null default now()
);

create index if not exists shops_owner_idx on public.shops(owner_id);
create index if not exists shops_status_idx on public.shops(status);
create index if not exists products_owner_idx on public.products(owner_id);
create index if not exists products_owner_shop_idx on public.products(owner_shop_id);
create index if not exists wishlists_user_idx on public.wishlists(user_id);

-- ---------------------------------------------------------------------
--  HELPER FUNCTIONS
-- ---------------------------------------------------------------------

-- Is the current user an admin? SECURITY DEFINER so it can read profiles
-- without tripping profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Create a profile row automatically whenever an auth user signs up.
-- Role comes from signup metadata but is clamped to customer/merchant so a
-- client can never self-assign admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    case
      when new.raw_user_meta_data->>'role' in ('customer','merchant')
      then new.raw_user_meta_data->>'role'
      else 'customer'
    end,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent non-admins from escalating their own role via a profiles update.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Merchants may edit their shop, but only an admin may change the approval
-- gate columns (status, is_verified). Keeps the platform's integrity control.
create or replace function public.protect_shop_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.status := old.status;
    new.is_verified := old.is_verified;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_shop_columns on public.shops;
create trigger protect_shop_columns
  before update on public.shops
  for each row execute function public.protect_shop_columns();

-- ---------------------------------------------------------------------
--  ROW-LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.shops        enable row level security;
alter table public.products     enable row level security;
alter table public.wishlists    enable row level security;
alter table public.transactions enable row level security;
alter table public.pos_sales    enable row level security;

-- profiles ------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (id = auth.uid() or public.is_admin());

-- shops ---------------------------------------------------------------
drop policy if exists shops_select on public.shops;
create policy shops_select on public.shops
  for select using (
    status = 'approved' or owner_id = auth.uid() or public.is_admin()
  );

drop policy if exists shops_insert on public.shops;
create policy shops_insert on public.shops
  for insert with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists shops_update on public.shops;
create policy shops_update on public.shops
  for update using (owner_id = auth.uid() or public.is_admin());

drop policy if exists shops_delete on public.shops;
create policy shops_delete on public.shops
  for delete using (public.is_admin());

-- products ------------------------------------------------------------
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (
    owner_id is null
    or owner_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.shops s
      where s.id = products.owner_shop_id and s.status = 'approved'
    )
  );

drop policy if exists products_insert on public.products;
create policy products_insert on public.products
  for insert with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists products_update on public.products;
create policy products_update on public.products
  for update using (owner_id = auth.uid() or public.is_admin());

drop policy if exists products_delete on public.products;
create policy products_delete on public.products
  for delete using (owner_id = auth.uid() or public.is_admin());

-- wishlists -----------------------------------------------------------
drop policy if exists wishlists_all on public.wishlists;
create policy wishlists_all on public.wishlists
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- transactions --------------------------------------------------------
drop policy if exists transactions_select on public.transactions;
create policy transactions_select on public.transactions
  for select using (
    public.is_admin()
    or exists (select 1 from public.shops s where s.id = transactions.shop_id and s.owner_id = auth.uid())
  );

drop policy if exists transactions_insert on public.transactions;
create policy transactions_insert on public.transactions
  for insert with check (
    public.is_admin()
    or exists (select 1 from public.shops s where s.id = transactions.shop_id and s.owner_id = auth.uid())
  );

-- pos_sales -----------------------------------------------------------
drop policy if exists pos_sales_select on public.pos_sales;
create policy pos_sales_select on public.pos_sales
  for select using (
    public.is_admin()
    or exists (select 1 from public.shops s where s.id = pos_sales.shop_id and s.owner_id = auth.uid())
  );

drop policy if exists pos_sales_insert on public.pos_sales;
create policy pos_sales_insert on public.pos_sales
  for insert with check (
    public.is_admin()
    or exists (select 1 from public.shops s where s.id = pos_sales.shop_id and s.owner_id = auth.uid())
  );

-- =====================================================================
--  DONE. Next:
--   1. Run backend/scripts/seed.ts to load the sample artisan catalog.
--   2. Promote yourself to admin (see backend/supabase/make-admin.sql).
-- =====================================================================

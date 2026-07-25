-- =====================================================================
--  AngkorCraft — per-merchant quotas (scale safety)
--  Enforces the same caps as the app, at the database level, so a client
--  can't bypass them and flood the free-tier database. Run once in the
--  Supabase SQL Editor. Safe to re-run. Bump the numbers when the plan grows.
-- =====================================================================

-- Max 5 stores per merchant (owner_id null = admin-created, unlimited).
create or replace function public.enforce_shop_quota()
returns trigger language plpgsql security definer set search_path = public as $$
declare cnt int;
begin
  if new.owner_id is not null then
    select count(*) into cnt from public.shops where owner_id = new.owner_id;
    if cnt >= 5 then
      raise exception 'Store limit reached (max 5 per merchant).' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists enforce_shop_quota on public.shops;
create trigger enforce_shop_quota before insert on public.shops
  for each row execute function public.enforce_shop_quota();

-- Max 60 products per store.
create or replace function public.enforce_product_quota()
returns trigger language plpgsql security definer set search_path = public as $$
declare cnt int;
begin
  if new.owner_shop_id is not null then
    select count(*) into cnt from public.products where owner_shop_id = new.owner_shop_id;
    if cnt >= 60 then
      raise exception 'Product limit reached (max 60 per store).' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists enforce_product_quota on public.products;
create trigger enforce_product_quota before insert on public.products
  for each row execute function public.enforce_product_quota();

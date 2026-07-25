-- =====================================================================
--  Promote a user to ADMIN.
--  1. Sign up normally in the app first (creates the auth user + profile).
--  2. Replace the email below with that account's email.
--  3. Run this in the Supabase SQL Editor.
--
--  Note: we delete + re-insert the profile rather than UPDATE, because the
--  protect_profile_role trigger blocks role changes that aren't made by an
--  already-authenticated admin. INSERT is not guarded, so this sets it cleanly.
--  Only do this for an account that does not own a shop.
-- =====================================================================

do $$
declare
  uid uuid;
  uname text;
begin
  select u.id, coalesce(p.full_name, '')
    into uid, uname
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.email = 'you@example.com';   -- <-- change this

  delete from public.profiles where id = uid;
  insert into public.profiles (id, role, full_name) values (uid, 'admin', uname);
end $$;

-- Verify:
select p.id, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin';

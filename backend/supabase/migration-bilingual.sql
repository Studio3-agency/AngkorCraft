-- =====================================================================
--  AngkorCraft — bilingual content migration
--  Adds Khmer columns for content that merchants author. Run once in the
--  Supabase SQL Editor. Safe to re-run (IF NOT EXISTS).
-- =====================================================================

alter table public.shops    add column if not exists description_kh text;
alter table public.products add column if not exists description_kh text;
alter table public.products add column if not exists cultural_story_kh text;

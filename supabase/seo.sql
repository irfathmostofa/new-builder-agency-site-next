-- SEO tables for admin-managed sitemap, robots.txt, meta tags, and Search Console.
-- Run this in the Supabase SQL editor if the SEO admin page reports missing tables.

create table if not exists public.seo_settings (
  id integer primary key default 1,
  site_url text default '',
  default_title text default 'Meridian Builders',
  title_template text default '%s | Meridian Builders',
  default_description text default 'Structures designed with intent, built to last, documented from blueprint to handover.',
  default_og_image text default '',
  twitter_handle text default '',
  gsc_verification text default '',
  bing_verification text default '',
  organization_name text default 'Meridian Builders',
  organization_logo text default '',
  index_site boolean default true,
  sitemap_enabled boolean default true,
  robots_txt text default '',
  updated_at timestamptz default now()
);

insert into public.seo_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.seo_pages (
  path text primary key,
  meta_title text default '',
  meta_description text default '',
  og_image text default '',
  canonical text default '',
  noindex boolean default false,
  updated_at timestamptz default now()
);

alter table public.seo_settings enable row level security;
alter table public.seo_pages enable row level security;

drop policy if exists "seo_settings_public_read" on public.seo_settings;
create policy "seo_settings_public_read"
  on public.seo_settings for select
  using (true);

drop policy if exists "seo_settings_auth_write" on public.seo_settings;
create policy "seo_settings_auth_write"
  on public.seo_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "seo_pages_public_read" on public.seo_pages;
create policy "seo_pages_public_read"
  on public.seo_pages for select
  using (true);

drop policy if exists "seo_pages_auth_write" on public.seo_pages;
create policy "seo_pages_auth_write"
  on public.seo_pages for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

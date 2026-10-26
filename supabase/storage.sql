insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif']
)
on conflict (id) do update set public = true;

drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
on storage.objects for select
using (bucket_id = 'media');

drop policy if exists "Authenticated upload media" on storage.objects;
create policy "Authenticated upload media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media');

drop policy if exists "Authenticated update media" on storage.objects;
create policy "Authenticated update media"
on storage.objects for update
to authenticated
using (bucket_id = 'media')
with check (bucket_id = 'media');

drop policy if exists "Authenticated delete media" on storage.objects;
create policy "Authenticated delete media"
on storage.objects for delete
to authenticated
using (bucket_id = 'media');

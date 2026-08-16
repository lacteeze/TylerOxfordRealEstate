create table if not exists public.landing_photos (
  slot text primary key,
  url text not null,
  updated_at timestamptz not null default now()
);

comment on table public.landing_photos is 'Home page section photo overrides. Public read so the landing page can render them; authenticated write from /admin.';
comment on column public.landing_photos.slot is 'Stable section key: hero, agent, selling, studio, about, faq, cta';
comment on column public.landing_photos.url is 'Public image URL — either a bundled /photos/ path or a listing-photos storage URL';

alter table public.landing_photos enable row level security;

grant select on table public.landing_photos to anon, authenticated;
grant insert, update, delete on table public.landing_photos to authenticated;

drop policy if exists public_select_landing_photos on public.landing_photos;
create policy public_select_landing_photos
  on public.landing_photos for select
  to anon, authenticated
  using (true);

drop policy if exists authenticated_insert_landing_photos on public.landing_photos;
create policy authenticated_insert_landing_photos
  on public.landing_photos for insert
  to authenticated
  with check (true);

drop policy if exists authenticated_update_landing_photos on public.landing_photos;
create policy authenticated_update_landing_photos
  on public.landing_photos for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists authenticated_delete_landing_photos on public.landing_photos;
create policy authenticated_delete_landing_photos
  on public.landing_photos for delete
  to authenticated
  using (true);

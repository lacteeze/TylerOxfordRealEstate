alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings
  add constraint listings_status_check
  check (status = any (array['sale'::text, 'lease'::text, 'sold'::text, 'showcase'::text]));

-- Existing rows become public so live listings stay visible; new inserts default private.
alter table public.listings
  add column if not exists published boolean not null default true;

alter table public.listings alter column published set default false;

comment on column public.listings.published is
  'When false, listing is hidden from the public site. Independent of status, featured, and archived.';

create index if not exists listings_published_idx on public.listings (published)
  where archived = false;

drop policy if exists "Public read listings" on public.listings;

create policy "Public read published listings"
  on public.listings for select
  to anon
  using (archived = false and published = true);

create policy "Auth read listings"
  on public.listings for select
  to authenticated
  using (true);

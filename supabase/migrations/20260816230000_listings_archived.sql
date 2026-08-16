alter table public.listings
  add column if not exists archived boolean not null default false;

comment on column public.listings.archived is 'When true, listing is hidden from the public site and shown in the admin Archived list.';

create index if not exists listings_archived_idx on public.listings (archived);

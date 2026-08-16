alter table public.listings
  add column if not exists drive_folder_id text not null default '',
  add column if not exists drive_folder_url text not null default '';

comment on column public.listings.drive_folder_id is 'Google Drive folder ID for bulk photo import';
comment on column public.listings.drive_folder_url is 'Original Google Drive folder URL pasted in admin';

create table if not exists public.admin_settings (
  id text primary key default 'default',
  google_refresh_token text,
  google_email text,
  google_connected_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.admin_settings is 'Single-row admin config. google_refresh_token is encrypted at rest by the app; never send it to the browser.';
comment on column public.admin_settings.google_refresh_token is 'AES-GCM encrypted Google OAuth refresh token. Server-only.';

alter table public.admin_settings enable row level security;

revoke all on table public.admin_settings from anon;
revoke all on table public.admin_settings from public;

grant select, insert, update, delete on table public.admin_settings to authenticated;

drop policy if exists authenticated_select_admin_settings on public.admin_settings;
create policy authenticated_select_admin_settings
  on public.admin_settings for select
  to authenticated
  using (true);

drop policy if exists authenticated_insert_admin_settings on public.admin_settings;
create policy authenticated_insert_admin_settings
  on public.admin_settings for insert
  to authenticated
  with check (true);

drop policy if exists authenticated_update_admin_settings on public.admin_settings;
create policy authenticated_update_admin_settings
  on public.admin_settings for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists authenticated_delete_admin_settings on public.admin_settings;
create policy authenticated_delete_admin_settings
  on public.admin_settings for delete
  to authenticated
  using (true);

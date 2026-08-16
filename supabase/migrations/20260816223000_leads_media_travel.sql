alter table public.leads
  add column if not exists service_address text,
  add column if not exists travel_km numeric,
  add column if not exists travel_cents integer;

comment on column public.leads.service_address is 'Property/service address for media bookings';
comment on column public.leads.travel_km is 'Rounded-up one-way distance in km from St. Johns origin';
comment on column public.leads.travel_cents is 'Travel fee in CAD cents; 0 if within the free radius';

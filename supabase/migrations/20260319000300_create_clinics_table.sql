create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  cep text,
  street text,
  number text,
  neighborhood text,
  complement text,
  city text not null,
  state text not null,
  zip_code text,
  price numeric(10,2) not null check (price >= 0),
  specialty text,
  specialties text[] not null default '{}'::text[],
  images text[] not null default '{}'::text[],
  features text[] not null default '{}'::text[],
  google_maps_url text,
  availability jsonb not null default '[]'::jsonb,
  hasappointment boolean not null default true,
  status text not null default 'pending' check (status in ('pending','active','inactive')),
  views integer not null default 0,
  bookings integer not null default 0,
  rating numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_public_clinics_updated_at on public.clinics;

create trigger set_public_clinics_updated_at
before update on public.clinics
for each row
execute procedure public.set_updated_at();

alter table public.clinics enable row level security;

create policy "clinics_select_public" on public.clinics
for select
using (true);

create policy "clinics_insert_own" on public.clinics
for insert
with check (auth.uid() = user_id);

create policy "clinics_update_own" on public.clinics
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "clinics_delete_own" on public.clinics
for delete
using (auth.uid() = user_id);

create index if not exists idx_clinics_user_id on public.clinics(user_id);
create index if not exists idx_clinics_status on public.clinics(status);


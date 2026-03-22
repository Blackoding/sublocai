alter table public.clinics
add column if not exists included_equipment text[] not null default '{}'::text[];

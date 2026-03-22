alter table public.clinics
add column if not exists accessibility_features text[] not null default '{}'::text[];

alter table public.clinics add column if not exists price_per_shift numeric(10,2);

alter table public.clinics add column if not exists price_per_day numeric(10,2);

alter table public.clinics add column if not exists price_per_month numeric(10,2);

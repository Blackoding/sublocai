create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  value numeric(10,2) not null default 0 check (value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_public_appointments_updated_at on public.appointments;
create trigger set_public_appointments_updated_at
before update on public.appointments
for each row
execute procedure public.set_updated_at();

alter table public.appointments enable row level security;

create policy "appointments_select_own_or_owner" on public.appointments
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.clinics c
    where c.id = clinic_id and c.user_id = auth.uid()
  )
);

create policy "appointments_insert_own" on public.appointments
for insert
with check (auth.uid() = user_id);

create policy "appointments_update_owner_or_user" on public.appointments
for update
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.clinics c
    where c.id = clinic_id and c.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1 from public.clinics c
    where c.id = clinic_id and c.user_id = auth.uid()
  )
);

create policy "appointments_delete_owner_or_user" on public.appointments
for delete
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.clinics c
    where c.id = clinic_id and c.user_id = auth.uid()
  )
);

create unique index if not exists idx_appointments_unique_slot_active
on public.appointments(clinic_id, date, time)
where status in ('pending', 'confirmed', 'completed');

create index if not exists idx_appointments_clinic_id on public.appointments(clinic_id);
create index if not exists idx_appointments_user_id on public.appointments(user_id);
create index if not exists idx_appointments_date on public.appointments(date);
create index if not exists idx_appointments_status on public.appointments(status);

create or replace function public.increment_clinic_bookings(
  clinic_id_input uuid,
  increment_by integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.clinics
  set bookings = greatest(0, coalesce(bookings, 0) + coalesce(increment_by, 0))
  where id = clinic_id_input;
end;
$$;

grant execute on function public.increment_clinic_bookings(uuid, integer) to authenticated;
grant execute on function public.increment_clinic_bookings(uuid, integer) to service_role;

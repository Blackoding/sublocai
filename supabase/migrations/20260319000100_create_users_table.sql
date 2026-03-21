create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  user_type text not null check (user_type in ('professional','company')),
  phone text not null,
  avatar text,
  full_name text,
  cpf text,
  birth_date date,
  specialty text,
  registration_code text,
  company_name text,
  trade_name text,
  cnpj text,
  responsible_name text,
  responsible_cpf text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_public_users_updated_at on public.users;

create trigger set_public_users_updated_at
before update on public.users
for each row
execute procedure public.set_updated_at();

alter table public.users enable row level security;

create policy "users_select_own" on public.users
for select
using (id = auth.uid());

create policy "users_update_own" on public.users
for update
using (id = auth.uid())
with check (id = auth.uid());


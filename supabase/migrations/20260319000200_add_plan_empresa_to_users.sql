alter table public.users
add column if not exists plan_empresa text check (plan_empresa in ('free','basic','pro'));


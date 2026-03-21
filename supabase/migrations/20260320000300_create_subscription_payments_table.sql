create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_empresa text not null check (plan_empresa in ('basic', 'pro')),
  payment_method text not null check (payment_method in ('pix', 'card')),
  provider text not null default 'abacatepay',
  provider_payment_id text,
  provider_external_id text,
  amount_cents integer not null check (amount_cents > 0),
  status text not null check (status in ('pending_payment', 'active', 'inactive', 'failed')) default 'pending_payment',
  due_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscription_payments_user_id
  on public.subscription_payments(user_id);

create index if not exists idx_subscription_payments_provider_payment_id
  on public.subscription_payments(provider_payment_id);

create index if not exists idx_subscription_payments_provider_external_id
  on public.subscription_payments(provider_external_id);

drop trigger if exists set_subscription_payments_updated_at on public.subscription_payments;

create trigger set_subscription_payments_updated_at
before update on public.subscription_payments
for each row
execute procedure public.set_updated_at();

alter table public.subscription_payments enable row level security;

create policy "subscription_payments_select_own" on public.subscription_payments
for select
using (user_id = auth.uid());


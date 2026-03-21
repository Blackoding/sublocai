alter table public.users
add column if not exists subscription_paid_until timestamptz;

alter table public.users
add column if not exists abacate_last_billing_id text;

alter table public.users
add column if not exists abacate_last_pix_qr_id text;

alter table public.users
add column if not exists abacate_last_plan_empresa text;


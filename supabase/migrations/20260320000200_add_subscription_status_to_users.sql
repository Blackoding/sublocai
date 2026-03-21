alter table public.users
add column if not exists subscription_status text
check (subscription_status in ('active', 'inactive', 'pending_payment'))
default 'inactive';


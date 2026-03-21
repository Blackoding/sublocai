create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  user_name text not null,
  user_avatar text,
  content text not null check (char_length(content) >= 10),
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_public_comments_updated_at on public.comments;

create trigger set_public_comments_updated_at
before update on public.comments
for each row
execute procedure public.set_updated_at();

alter table public.comments enable row level security;

create policy "comments_select_public"
on public.comments
for select
using (true);

create policy "comments_insert_own"
on public.comments
for insert
with check (auth.uid() = user_id);

create policy "comments_delete_own"
on public.comments
for delete
using (auth.uid() = user_id);

create index if not exists idx_comments_clinic_id on public.comments(clinic_id);
create index if not exists idx_comments_user_id on public.comments(user_id);


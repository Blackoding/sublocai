create table if not exists public.appointment_messages (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 2000),
  created_at timestamptz not null default now()
);

alter table public.appointment_messages enable row level security;

create policy "appointment_messages_select_participants" on public.appointment_messages
for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "appointment_messages_insert_sender" on public.appointment_messages
for insert
with check (auth.uid() = sender_id and auth.uid() <> receiver_id);

create policy "appointment_messages_delete_sender" on public.appointment_messages
for delete
using (auth.uid() = sender_id);

create index if not exists idx_appointment_messages_appointment_id_created_at
on public.appointment_messages(appointment_id, created_at);

create index if not exists idx_appointment_messages_sender_id_created_at
on public.appointment_messages(sender_id, created_at);

create index if not exists idx_appointment_messages_receiver_id_created_at
on public.appointment_messages(receiver_id, created_at);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'appointment_messages'
  ) then
    alter publication supabase_realtime add table public.appointment_messages;
  end if;
end
$$;

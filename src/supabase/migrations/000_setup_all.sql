-- =============== БАЗОВАЯ СХЕМА + ДОБАВЛЕНИЕ НЕДОСТАЮЩЕГО ===============
create extension if not exists pgcrypto;

-- polls / poll_options / contacts (S-02A)
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at   timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  text text not null,
  votes integer not null default 0
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

-- houses / profiles / voters / votes / audit_logs (S-02B)
-- houses: если таблица уже была, добавим недостающие колонки
create table if not exists public.houses (
  id uuid primary key default gen_random_uuid()
);
alter table public.houses add column if not exists name    text;
alter table public.houses add column if not exists address text;

-- profiles: привязка пользователя (auth.users) к дому и роли
create table if not exists public.profiles (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  house_id uuid references public.houses(id),
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now()
);

-- какие дома голосуют по опросу
create table if not exists public.voters (
  poll_id  uuid not null references public.polls(id) on delete cascade,
  house_id uuid not null references public.houses(id) on delete cascade,
  primary key (poll_id, house_id)
);

-- голоса: 1 дом = 1 голос
create table if not exists public.votes (
  poll_id  uuid not null references public.polls(id) on delete cascade,
  house_id uuid not null references public.houses(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, house_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- =============== ВКЛЮЧАЕМ RLS ===============
alter table public.houses       enable row level security;
alter table public.profiles     enable row level security;
alter table public.polls        enable row level security;
alter table public.poll_options enable row level security;
alter table public.voters       enable row level security;
alter table public.votes        enable row level security;
alter table public.contacts     enable row level security;
alter table public.audit_logs   enable row level security;

-- Уберём широкие анонимные политики (могли быть из раннего шага)
drop policy if exists anon_read_polls        on public.polls;
drop policy if exists anon_read_poll_options on public.poll_options;
drop policy if exists anon_read_contacts     on public.contacts;

-- =============== ПОЛИТИКИ RLS (без IF NOT EXISTS) ===============

-- PROFILES
drop policy if exists profiles_self on public.profiles;
create policy profiles_self
on public.profiles for select
to authenticated
using (user_id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all
on public.profiles for all
to authenticated
using (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'))
with check (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'));

-- HOUSES
drop policy if exists houses_admin_select on public.houses;
create policy houses_admin_select
on public.houses for select
to authenticated
using (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'));

-- POLLS
drop policy if exists polls_visible on public.polls;
create policy polls_visible
on public.polls for select
to authenticated
using (
  exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin')
  or exists (
    select 1 from public.voters v
    join public.profiles p on p.house_id = v.house_id and p.user_id = auth.uid()
    where v.poll_id = polls.id
  )
);

drop policy if exists polls_admin_write on public.polls;
create policy polls_admin_write
on public.polls for all
to authenticated
using (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'))
with check (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'));

-- POLL OPTIONS
drop policy if exists poll_options_visible on public.poll_options;
create policy poll_options_visible
on public.poll_options for select
to authenticated
using (
  exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin')
  or exists (
    select 1
    from public.voters v
    join public.polls pl on pl.id = poll_options.poll_id and pl.id = v.poll_id
    join public.profiles p on p.house_id = v.house_id and p.user_id = auth.uid()
    where pl.id = poll_options.poll_id
  )
);

drop policy if exists poll_options_admin_write on public.poll_options;
create policy poll_options_admin_write
on public.poll_options for all
to authenticated
using (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'))
with check (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'));

-- VOTERS
drop policy if exists voters_select on public.voters;
create policy voters_select
on public.voters for select
to authenticated
using (
  exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.house_id = voters.house_id
  )
);

drop policy if exists voters_admin_write on public.voters;
create policy voters_admin_write
on public.voters for all
to authenticated
using (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'))
with check (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'));

-- VOTES
drop policy if exists votes_select_self_or_admin on public.votes;
create policy votes_select_self_or_admin
on public.votes for select
to authenticated
using (
  exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.house_id = votes.house_id
  )
);

drop policy if exists votes_insert_if_allowed on public.votes;
create policy votes_insert_if_allowed
on public.votes for insert
to authenticated
with check (
  exists (
    select 1 from public.voters v
    join public.profiles p on p.house_id = v.house_id and p.user_id = auth.uid()
    where v.poll_id = votes.poll_id
  )
  and not exists (
    select 1 from public.votes vv
    where vv.poll_id = votes.poll_id and vv.house_id = votes.house_id
  )
);

drop policy if exists votes_admin_write on public.votes;
create policy votes_admin_write
on public.votes for all
to authenticated
using (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'))
with check (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'));

-- CONTACTS
drop policy if exists contacts_read_all on public.contacts;
create policy contacts_read_all
on public.contacts for select
to authenticated
using (true);

drop policy if exists contacts_admin_write on public.contacts;
create policy contacts_admin_write
on public.contacts for all
to authenticated
using (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'))
with check (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'));

-- AUDIT
drop policy if exists audit_insert_all on public.audit_logs;
create policy audit_insert_all
on public.audit_logs for insert
to authenticated
with check (true);

drop policy if exists audit_admin_select on public.audit_logs;
create policy audit_admin_select
on public.audit_logs for select
to authenticated
using (exists (select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.role = 'admin'));

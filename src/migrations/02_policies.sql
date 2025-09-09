-- Включаем RLS для всех таблиц
alter table public.houses enable row level security;
alter table public.profiles enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.voters enable row level security;
alter table public.votes enable row level security;
alter table public.contacts enable row level security;
alter table public.audit_logs enable row level security;

-- Профили
create policy "profiles_self"
on public.profiles for select
to authenticated
using (user_id = auth.uid());

create policy "profiles_admin_all"
on public.profiles for all
to authenticated
using ((select role from public.profiles where user_id = auth.uid()) = 'admin')
with check ((select role from public.profiles where user_id = auth.uid()) = 'admin');

-- Дома: свой дом видит только админ (для R0 прячем список домов для обычных)
create policy "houses_admin_select"
on public.houses for select
to authenticated
using ((select role from public.profiles where user_id = auth.uid()) = 'admin');

-- Опросы: видны, если ты админ ИЛИ твой дом в списке voters
create policy "polls_visible"
on public.polls for select
to authenticated
using (
  (select role from public.profiles where user_id = auth.uid()) = 'admin'
  or exists (
    select 1 from public.voters v
    join public.profiles p on p.house_id = v.house_id and p.user_id = auth.uid()
    where v.poll_id = polls.id
  )
);

-- Создание/правка опросов — только админ
create policy "polls_admin_write"
on public.polls for all
to authenticated
using ((select role from public.profiles where user_id = auth.uid()) = 'admin')
with check ((select role from public.profiles where user_id = auth.uid()) = 'admin');

-- Опции: видны, если виден опрос; писать может только админ
create policy "poll_options_visible"
on public.poll_options for select
to authenticated
using (
  (select role from public.profiles where user_id = auth.uid()) = 'admin'
  or exists (
    select 1 from public.voters v
    join public.polls pl on pl.id = poll_options.poll_id and pl.id = v.poll_id
    join public.profiles p on p.house_id = v.house_id and p.user_id = auth.uid()
    where pl.id = poll_options.poll_id
  )
);

create policy "poll_options_admin_write"
on public.poll_options for all
to authenticated
using ((select role from public.profiles where user_id = auth.uid()) = 'admin')
with check ((select role from public.profiles where user_id = auth.uid()) = 'admin');

-- Voters: читать может админ и сам дом; писать — только админ
create policy "voters_select"
on public.voters for select
to authenticated
using (
  (select role from public.profiles where user_id = auth.uid()) = 'admin'
  or exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.house_id = voters.house_id
  )
);

create policy "voters_admin_write"
on public.voters for all
to authenticated
using ((select role from public.profiles where user_id = auth.uid()) = 'admin')
with check ((select role from public.profiles where user_id = auth.uid()) = 'admin');

-- Votes: свой голос виден; вставка — если дом допущен и ещё не голосовал; удалять/обновлять — админ
create policy "votes_select_self_or_admin"
on public.votes for select
to authenticated
using (
  (select role from public.profiles where user_id = auth.uid()) = 'admin'
  or exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.house_id = votes.house_id
  )
);

create policy "votes_insert_if_allowed"
on public.votes for insert
to authenticated
with check (
  exists (
    select 1 from public.voters v
    join public.profiles p on p.house_id = v.house_id and p.user_id = auth.uid()
    where v.poll_id = votes.poll_id
  )
);

create policy "votes_admin_write"
on public.votes for all
to authenticated
using ((select role from public.profiles where user_id = auth.uid()) = 'admin')
with check ((select role from public.profiles where user_id = auth.uid()) = 'admin');

-- Контакты: читать всем аутентифицированным; писать — админ
create policy "contacts_read_all"
on public.contacts for select
to authenticated
using (true);

create policy "contacts_admin_write"
on public.contacts for all
to authenticated
using ((select role from public.profiles where user_id = auth.uid()) = 'admin')
with check ((select role from public.profiles where user_id = auth.uid()) = 'admin');

-- Аудит: вставлять всем аутентифицированным (лог своих действий); читать — админ
create policy "audit_insert_all"
on public.audit_logs for insert
to authenticated
with check (true);

create policy "audit_admin_select"
on public.audit_logs for select
to authenticated
using ((select role from public.profiles where user_id = auth.uid()) = 'admin');
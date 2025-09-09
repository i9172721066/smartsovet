-- Роли
create type role as enum ('admin','house');

-- Дома
create table public.houses (
  id serial primary key,
  street text not null,
  number text not null,
  login text unique not null,        -- логин дома
  password_hash text not null,       -- для простоты: можно хранить в auth, но R0 ок
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Профили (связка с auth.users)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  house_id int references public.houses(id),
  role role not null default 'house',
  created_at timestamptz default now()
);

-- Опросы (рекомендательные)
create table public.polls (
  id serial primary key,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'scheduled', -- scheduled|active|finished
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table public.poll_options (
  id serial primary key,
  poll_id int references public.polls(id) on delete cascade,
  text text not null
);

-- Допущенные дома на опрос
create table public.voters (
  id serial primary key,
  poll_id int references public.polls(id) on delete cascade,
  house_id int references public.houses(id) on delete cascade,
  unique (poll_id, house_id)
);

-- Голоса (1 дом = 1 голос)
create table public.votes (
  id serial primary key,
  poll_id int references public.polls(id) on delete cascade,
  house_id int references public.houses(id) on delete cascade,
  option_id int references public.poll_options(id) on delete cascade,
  created_at timestamptz default now(),
  unique (poll_id, house_id)
);

-- Полезные контакты
create table public.contacts (
  id serial primary key,
  name text not null,
  role text not null,
  phone text not null,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Аудит
create table public.audit_logs (
  id bigserial primary key,
  actor uuid references auth.users(id) on delete set null,
  action text not null,
  object_type text not null,
  object_id text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- Триггер: автопрофиль
create or replace function public.handle_new_user()
returns trigger language plpgsql as $$
begin
  insert into public.profiles(user_id, role)
    values (new.id, 'house')
    on conflict (user_id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
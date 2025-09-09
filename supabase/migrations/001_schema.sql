create extension if not exists pgcrypto;

create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  text text not null,
  votes integer not null default 0
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

-- RLS — в MVP все могут читать, писать никто (до S-02B)
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table contacts enable row level security;

create policy anon_read_polls        on polls         for select using (true);
create policy anon_read_poll_options on poll_options  for select using (true);
create policy anon_read_contacts     on contacts      for select using (true);

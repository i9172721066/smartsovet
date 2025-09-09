-- 1) создаём дом (если ещё нет)
insert into public.houses (name, address)
values ('Корабельная_1', 'Корабельная, 1')
on conflict do nothing
returning id;

-- возьмём id созданного/существующего дома
with h as (
  select id from public.houses
  where name = 'Корабельная_1'
  limit 1
)
-- 2) делаем тебя админом и привязываем к дому
insert into public.profiles (user_id, house_id, role)
select '<YOUR_USER_ID>', h.id, 'admin' from h
on conflict (user_id) do update
  set house_id = excluded.house_id,
      role = 'admin';

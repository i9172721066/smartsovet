with p as (
  insert into polls (title, description, start_at, end_at)
  values ('Срочно нужен трактор для снега', 'Голосуем за найм трактора утром', now() - interval '1 hour', now() + interval '1 day')
  returning id
)
insert into poll_options (poll_id, text, votes)
select id, x.txt, x.v from p, (values ('Да',3),('Нет',1),('Воздержался',0)) as x(txt,v);

insert into contacts (name, role, phone, notes)
values ('Охрана КПП','Охрана','+7 (901) 111-11-11','24/7');

-- Вставляем тестовые дома
insert into public.houses (street, number, login, password_hash) values
('Корабельная','56','al56','$2b$10$placeholderhash'),
('Корабельная','54','al54','$2b$10$placeholderhash'), 
('Корабельная','52','al52','$2b$10$placeholderhash'),
('Садовая','10','garden10','$2b$10$placeholderhash'),
('Садовая','12','garden12','$2b$10$placeholderhash');

-- Полезные контакты
insert into public.contacts (name, role, phone, notes) values
('Охрана КПП','security','+7 900 000-00-00','Круглосуточно'),
('Аварийная служба','emergency','+7 900 000-00-01','Вода/электрика/отопление'),
('Мастер на час','handyman','+7 900 000-00-02','По договоренности'),
('Управляющая компания','management','+7 900 000-00-03','Рабочие дни 9:00-18:00'),
('Клининговая служба','cleaning','+7 900 000-00-04','Уборка подъездов'),
('Интернет провайдер','internet','+7 900 000-00-05','Техподдержка 24/7');

-- Создаем тестового админа в auth.users (выполняется через Supabase Auth UI)
-- После создания админа через интерфейс нужно выполнить:
-- UPDATE public.profiles SET role = 'admin' WHERE user_id = 'uuid_админа';

-- Пример тестового опроса
insert into public.polls (title, description, start_at, end_at, status, created_by) values
('Установка детской площадки', 
 'Предлагается установить детскую площадку во дворе дома. Стоимость около 150,000 рублей.',
 now() - interval '1 day',
 now() + interval '7 days', 
 'active',
 null -- будет заполнено после создания админа
);

-- Варианты ответов для опроса
insert into public.poll_options (poll_id, text) values
(1, 'За установку детской площадки'),
(1, 'Против установки'),
(1, 'Воздержусь');

-- Допускаем дома к голосованию
insert into public.voters (poll_id, house_id) values
(1, 1), -- Корабельная 56
(1, 2), -- Корабельная 54 
(1, 3), -- Корабельная 52
(1, 4), -- Садовая 10
(1, 5); -- Садовая 12

-- Примеры голосов (будут добавляться через приложение)
-- insert into public.votes (poll_id, house_id, option_id) values
-- (1, 1, 1), -- Корабельная 56 голосует ЗА
-- (1, 2, 1), -- Корабельная 54 голосует ЗА
-- (1, 3, 3); -- Корабельная 52 воздерживается
# СмартСовет — состояние проекта

## Стек
React + Vite, React Router, TailwindCSS, локальный lib/store (LocalStorage).
Supabase-клиент есть (`src/supabase/supabaseClient.js`), в прод-ход пока не включён.

## Архитектура
- Layout: `src/layouts/RootLayout.jsx`
- Основные страницы:
  - `/vote`, `/vote/:ballotId` → TenderView
  - `/results`, `/results/:ballotId` → VoteResults
  - `/create` → CreateVoting
  - `/contacts` → Contacts

## Компоненты
- `components/`
  - `TenderView.jsx` — тендерные предложения + голосование (через `lib/store`)
  - `VoteResults.jsx` — результаты
  - `CreateVoting.jsx`, `Contacts.jsx`, `NavBar.jsx`, `BallotStageIndicator.jsx` — вспомогательные
- UI (Tailwind): `components/ui/{Button, Input, Card}.jsx`

## Контракты lib/store
- `getTenderProposals(ballotId)`
- `createTenderProposal(ballotId, payload)`
- `voteTenderProposal(ballotId, proposalId, userId)`
- `hasUserVotedTender(ballotId, userId)`
- `getWinningProposal(ballotId)`

## Статус Tailwind
Подключён, используется как основной CSS-движок.

## Следующие шаги
- [ ] Полировка UI TenderView (валидация, empty/skeleton, без изменения бизнес-логики)
- [ ] Единый дизайн-кит (Button/Input/Card) — используется в новых экранах
- [ ] Адаптер Supabase внутри `lib/store` (флагом `VITE_BACKEND=supabase|local`)
- [ ] Упрощённый логин (фиктивный userId → нормальный userId)


от 12.09.25
### .env.example:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND=local
VITE_FEATURE_TENDER=on
VITE_FEATURE_FINANCE=off

## Анализ текущей тендерной системы

Сравниваю текущую реализацию с требованиями ТЗ:

### Что есть сейчас:
- Отображение тестовых тендеров
- Форма подачи предложений
- Сохранение в localStorage
- Просмотр поданных предложений

### Что отсутствует согласно ТЗ:
1. **Автоматическое определение победителя** после окончания времени
2. **Переход к статусу "Расчет финансирования"**
3. **Связь с основным жизненным циклом голосования**
4. **Голосование за предложения** (сейчас показывается только список)

### План доработки тендеров:

**Шаг 1:** Добавить голосование за предложения тендера
**Шаг 2:** Автоматическое определение победителя
**Шаг 3:** Интеграция с жизненным циклом проекта
**Шаг 4:** Переход к финансированию

Начнем с **Шага 1** - добавим возможность голосовать за предложения в тендере.

### Какую задачу решаем первой?
1. Настроить GitHub репозиторий (загрузить код, создать файлы)
2. Доработать голосование в тендерах
3. Интегрировать тендеры с основным жизненным циклом

**Рекомендую сначала настроить GitHub** - это поможет сохранить весь прогресс и не потерять код при переключении сессий.

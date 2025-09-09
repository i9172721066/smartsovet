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

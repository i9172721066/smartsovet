// Тестовые данные для разработки
export const MOCK_VOTINGS = [
  {
    id: "vote_001",
    title: "Срочно нужен трактор для расчистки снега",
    text: "Срочно нужен трактор для расчистки снега на улице Корабельная",
    status: "voting", // draft, voting, tender, financing, execution, completed
    participants: ["Корабельная_1", "Корабельная_3", "Корабельная_5"],
    votingStart: "2024-01-15T17:00:00",
    votingEnd: "2024-01-15T21:00:00",
    requiresFinancing: true,
    requiresInitiator: true,
    createdBy: "admin",
    votes: {
      yes: 34,
      no: 10,
      abstain: 3,
      total: 47,
    },
    initiatorVotes: {
      yes: 3,
      no: 32,
    },
    tenderProposals: [],
    financing: null,
  },
  {
    id: "vote_002",
    title: "Ремонт детской площадки",
    text: "Необходимо отремонтировать детскую площадку во дворе дома 15",
    status: "draft",
    participants: ["Садовая_10", "Садовая_12", "Садовая_14"],
    requiresFinancing: true,
    requiresInitiator: true,
    createdBy: "admin",
    votes: { yes: 0, no: 0, abstain: 0, total: 0 },
    initiatorVotes: { yes: 0, no: 0 },
  },
];

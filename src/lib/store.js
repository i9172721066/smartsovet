// src/lib/store.js
// Хранилище голосований на localStorage
// Единая точка правды для чтения/записи

const STORAGE_KEY = "vg_votings";
const SEEDED_FLAG = "vg_seeded_v1"; // чтобы не дублировать сиды
const VOTES_MAP_KEY = "vg_votes";    // { [ballotId]: { [userId]: {vote, initiator, at} } }

// ---------------- helpers ----------------
function readVotings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeVotings(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr || []));
}

// Универсальная сортировка по времени создания (новые сверху)
function sortByCreatedAtDesc(arr) {
  return [...arr].sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );
}

// ---------------- seeding ----------------
export function seedIfEmpty() {
  if (localStorage.getItem(SEEDED_FLAG) === "1") return;
  const arr = readVotings();
  if (arr.length > 0) return;

  const now = new Date().toISOString();

  const d1 = {
    id: "default_001",
    title: "Срочно нужен трактор для расчистки снега",
    text: "Срочно нужен трактор для расчистки снега на улице Корабельная",
    status: "voting",
    participants: ["Корабельная_1", "Корабельная_3", "Корабельная_5"],
    votingEnd: "2099-01-20T21:00:00", // оставим активным, чтобы видеть на /vote
    requiresFinancing: true,
    requiresInitiator: true,
    createdBy: "system",
    createdAt: now,
    votes: { yes: 34, no: 10, abstain: 3, total: 47 },
    initiatorVotes: { yes: 3, no: 32 },
  };

  const d2 = {
    id: "default_002",
    title: "Ремонт детской площадки",
    text: "Необходимо отремонтировать детскую площадку",
    status: "closed",
    participants: ["Корабельная_1", "Корабельная_3", "Корабельная_5"],
    votingEnd: "2024-01-15T18:00:00",
    requiresFinancing: true,
    requiresInitiator: false,
    createdBy: "system",
    createdAt: now,
    votes: { yes: 25, no: 5, abstain: 2, total: 32 },
    initiatorVotes: { yes: 0, no: 0 },
  };

  writeVotings([d1, d2]);
  localStorage.setItem(SEEDED_FLAG, "1");
}

// ---------------- basic CRUD ----------------
export function listBallots() {
  return sortByCreatedAtDesc(readVotings());
}

export function getBallotById(id) {
  return readVotings().find((b) => b.id === id) || null;
}

// алиас на старое имя
export function getBallot(id) {
  return getBallotById(id);
}

export function createBallot(data) {
  const user = JSON.parse(localStorage.getItem("vg_user") || "null");
  const now = new Date().toISOString();
  const ballot = {
    id: "b_" + Date.now(),
    title: "",
    text: "",
    status: "draft",
    participants: [],
    votingEnd: "",
    requiresFinancing: false,
    requiresInitiator: false,
    createdBy: user?.login || "admin",
    createdAt: now,
    votes: { yes: 0, no: 0, abstain: 0, total: 0 },
    initiatorVotes: { yes: 0, no: 0 },
    ...data,
  };

  const arr = readVotings();
  arr.push(ballot);
  writeVotings(arr);
  return ballot;
}

export function updateBallot(id, patch) {
  const arr = readVotings();
  const i = arr.findIndex((b) => b.id === id);
  if (i === -1) return null;
  arr[i] = { ...arr[i], ...patch };
  writeVotings(arr);
  return arr[i];
}

export function saveBallot(ballot) {
  if (!ballot?.id) return;
  const arr = readVotings();
  const i = arr.findIndex((b) => b.id === ballot.id);
  if (i === -1) arr.push(ballot);
  else arr[i] = ballot;
  writeVotings(arr);
}

export function removeBallot(id) {
  writeVotings(readVotings().filter((b) => b.id !== id));
}

// ---------------- votes ----------------
export function applyVote(ballotId, { vote, initiator }, user) {
  const b = getBallotById(ballotId);
  if (!b) return { ok: false, reason: "not_found" };

  const uid = user?.id || "anon";
  const map = JSON.parse(localStorage.getItem(VOTES_MAP_KEY) || "{}");
  if (!map[ballotId]) map[ballotId] = {};
  if (map[ballotId][uid]) {
    // уже голосовал
    return { ok: true, already: true, ballot: b };
  }
  map[ballotId][uid] = {
    vote,
    initiator,
    at: new Date().toISOString(),
  };
  localStorage.setItem(VOTES_MAP_KEY, JSON.stringify(map));

  const votes = { ...(b.votes || { yes: 0, no: 0, abstain: 0, total: 0 }) };
  votes[vote] = (votes[vote] || 0) + 1;
  votes.total = (votes.total || 0) + 1;

  const iv = { ...(b.initiatorVotes || { yes: 0, no: 0 }) };
  if (initiator === "yes") iv.yes = (iv.yes || 0) + 1;
  if (initiator === "no") iv.no = (iv.no || 0) + 1;

  updateBallot(ballotId, { votes, initiatorVotes: iv });

  return { ok: true, ballot: getBallotById(ballotId) };
}

export function listVotes(ballotId) {
  const b = getBallotById(ballotId);
  return b?.votes || { yes: 0, no: 0, abstain: 0, total: 0 };
}

export function countVotesPerInit(ballotId) {
  const b = getBallotById(ballotId);
  const iv = b?.initiatorVotes || { yes: 0, no: 0 };
  return {
    yes: iv.yes || 0,
    no: iv.no || 0,
    total: (iv.yes || 0) + (iv.no || 0),
  };
}

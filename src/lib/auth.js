// Единый список опций (чтобы Vote и Results не дублировали)
export const OPTIONS = [
  { id: "opt1", title: "Проект А" },
  { id: "opt2", title: "Проект Б" },
  { id: "opt3", title: "Проект В" },
];

/* ===== Хранилище localStorage =====
   vg_user        : { username, role }
   vg_votes       : { [optionId]: number }
   vg_userVotes   : { [username]: optionId }
*/

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ===== Аутентификация ===== */
export function getCurrentUser() {
  return readJSON("vg_user", null);
}

export function loginDemo(username, password) {
  if (!username || !password) {
    return { ok: false, error: "Введите логин и пароль" };
  }
  
  // Гибкая проверка для админа - принимаем разные пароли
  if (username === "admin" && (password === "1234" || password === "123")) {
    const user = { 
      username, 
      role: "admin",
      login: "admin",
      fullName: "Администратор"
    };
    writeJSON("vg_user", user);
    return { ok: true, user };
  }
  
  // любой другой логин/пароль считаем обычным пользователем
  const user = { 
    username, 
    role: "user",
    login: username,
    fullName: `Пользователь ${username}`
  };
  writeJSON("vg_user", user);
  return { ok: true, user };
}

export function logout() {
  localStorage.removeItem("vg_user");
}

/* ===== Голосование ===== */
function getVotesMap() {
  // гарантируем что есть ключи для всех опций
  const map = readJSON("vg_votes", {});
  for (const o of OPTIONS) {
    if (typeof map[o.id] !== "number") map[o.id] = 0;
  }
  return map;
}
function saveVotesMap(map) {
  writeJSON("vg_votes", map);
}

function getUserVotesMap() {
  return readJSON("vg_userVotes", {});
}
function saveUserVotesMap(map) {
  writeJSON("vg_userVotes", map);
}

// Проверка: голосовал ли уже пользователь
export function hasUserVoted(username) {
  const uvm = getUserVotesMap();
  return Boolean(uvm[username]);
}

// Отдать голос за optionId (только если ещё не голосовал)
export function castVote(username, optionId) {
  if (!OPTIONS.find((o) => o.id === optionId)) {
    return { ok: false, error: "Неизвестная опция" };
  }
  const uvm = getUserVotesMap();
  if (uvm[username]) {
    return { ok: false, error: "Вы уже голосовали" };
  }
  const vm = getVotesMap();
  vm[optionId] = (vm[optionId] || 0) + 1;
  uvm[username] = optionId;
  saveVotesMap(vm);
  saveUserVotesMap(uvm);
  return { ok: true };
}

// Снять голос текущего пользователя (для переголосования)
export function clearMyVote(username) {
  const uvm = getUserVotesMap();
  const prev = uvm[username];
  if (!prev) return { ok: false, error: "У вас нет сохранённого голоса" };

  const vm = getVotesMap();
  vm[prev] = Math.max(0, (vm[prev] || 0) - 1);
  delete uvm[username];
  saveVotesMap(vm);
  saveUserVotesMap(uvm);
  return { ok: true };
}

// Разрешить переголосовать (админ-функция для любого userName)
export function adminAllowRevote(userName) {
  const uvm = getUserVotesMap();
  const prev = uvm[userName];
  if (!prev) return { ok: false, error: "У пользователя нет голоса" };

  const vm = getVotesMap();
  vm[prev] = Math.max(0, (vm[prev] || 0) - 1);
  delete uvm[userName];
  saveVotesMap(vm);
  saveUserVotesMap(uvm);
  return { ok: true };
}

// Полный сброс (только админ)
export function resetAll() {
  // обнуляем все опции и чистим карту пользователей
  const empty = {};
  for (const o of OPTIONS) empty[o.id] = 0;
  writeJSON("vg_votes", empty);
  writeJSON("vg_userVotes", {});
}

// Результаты в удобном виде [{id,title,count}]
export function getResults() {
  const vm = getVotesMap();
  return OPTIONS.map((o) => ({ ...o, count: vm[o.id] || 0 }));
}

// Общее число голосов
export function getTotalVotes() {
  const vm = getVotesMap();
  return Object.values(vm).reduce((s, n) => s + (n || 0), 0);
}
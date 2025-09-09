// src/lib/workflow.js
// Логика автоматического обновления статусов и выборки «публичных» бюллетеней

import { listBallots, updateBallot } from "./store";

// авто-обновление статусов по дедлайну
export function autoUpdateStatus() {
  const now = Date.now();
  listBallots().forEach((b) => {
    if (b.status === "voting" && b.votingEnd) {
      const end = new Date(b.votingEnd).getTime();
      if (!Number.isNaN(end) && end < now) {
        updateBallot(b.id, { status: "closed" });
      }
    }
  });
}

// алиас на случай старого импорта (встречался в коде)
export const autoupdateStatus = autoUpdateStatus;

// какие бюллетени показывать пользователю на странице «Голосование»
export function publicBallotsFor(user) {
  const house = user?.house || user?.houseName || null;
  return listBallots().filter((b) => {
    if (b.status !== "voting") return false;
    if (!Array.isArray(b.participants) || b.participants.length === 0) {
      return true;
    }
    if (!house) return true; // гость — показываем всё «в голосовании»
    return b.participants.includes(house);
  });
}

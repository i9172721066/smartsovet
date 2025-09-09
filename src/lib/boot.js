// src/lib/boot.js
import { autoUpdateStatus } from "./workflow.js";

let timer = null;

export function startAppTimers() {
  try { autoUpdateStatus(); } catch {}
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    try { autoUpdateStatus(); } catch {}
  }, 60_000); // раз в минуту
}

export function stopAppTimers() {
  if (timer) clearInterval(timer);
  timer = null;
}

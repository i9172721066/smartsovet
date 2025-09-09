// src/pages/AdminBallots.jsx
import { seedIfEmpty, listBallots } from "../lib/store";

export default function AdminBallots() {
  const user = JSON.parse(localStorage.getItem("vg_user") || "null");

  const isAdmin =
    user && (user.role === "admin" || user.role === "responsible");

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
        Доступ только для администратора.
      </div>
    );
  }

  seedIfEmpty();
  const items = listBallots();

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 16 }}>Управление голосованиями</h1>
      <div style={{ color: "#6b7280", marginBottom: 16 }}>
        Всего записей: {items.length}
      </div>
      {/* Здесь можно продолжить вашу админ-логику/таблицы */}
    </div>
  );
}

// src/pages/AdminBallotEdit.jsx
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { getBallotById, updateBallot } from "../lib/store";
import { useState } from "react";

function toLocalInput(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminBallotEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  const b = getBallotById(id);
  if (!b) return <Navigate to="/vote" replace />;

  const [form, setForm] = useState({
    title: b.title ?? "",
    description: b.description ?? "",
    votersNote: b.votersNote ?? "",
    requiresFunding: Boolean(b.requiresFunding),
    requiresInitiator: Boolean(b.requiresInitiator),
    startsAt: toLocalInput(b.startsAt),
    endsAt: toLocalInput(b.endsAt),
    status: b.status ?? "voting",
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const save = (e) => {
    e.preventDefault();
    const patch = {
      ...form,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };
    updateBallot(b.id, patch);
    navigate(`/vote/${b.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Редактирование вопроса</h1>
        <Link
          to={`/vote/${b.id}`}
          className="rounded-lg border px-4 py-2 text-indigo-600 hover:bg-indigo-50"
        >
          ← к карточке
        </Link>
      </div>

      <form
        onSubmit={save}
        className="rounded-xl border bg-white p-5 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium">Заголовок</label>
          <input
            name="title"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.title}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Описание</label>
          <textarea
            name="description"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            rows={3}
            value={form.description}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Кто голосует</label>
          <input
            name="votersNote"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.votersNote}
            onChange={onChange}
            placeholder="например: дома по ул. Корабельная"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Начало</label>
            <input
              type="datetime-local"
              name="startsAt"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.startsAt}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Окончание</label>
            <input
              type="datetime-local"
              name="endsAt"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.endsAt}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="requiresFunding"
              checked={form.requiresFunding}
              onChange={onChange}
            />
            <span>Требуется финансирование</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="requiresInitiator"
              checked={form.requiresInitiator}
              onChange={onChange}
            />
            <span>Требуется инициатор</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">Статус</label>
          <select
            name="status"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.status}
            onChange={onChange}
          >
            <option value="draft">черновик</option>
            <option value="voting">идёт голосование</option>
            <option value="no_quorum">нет кворума</option>
            <option value="closed">закрыт</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 text-white px-5 py-2"
          >
            Сохранить
          </button>
          <Link to={`/vote/${b.id}`} className="rounded-lg border px-5 py-2">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}

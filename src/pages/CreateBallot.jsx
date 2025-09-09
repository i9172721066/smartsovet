// src/pages/CreateBallot.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getState,
  getCurrentUser,
  getBallots,
  createBallot,
  updateBallot,
  publishBallot,
} from "../lib/store";

function toLocalInputValue(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function fromLocalInputValue(str) {
  if (!str) return null;
  const t = new Date(str).getTime();
  return Number.isFinite(t) ? t : null;
}

export default function CreateBallot({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const editing = mode === "edit" && id;
  const existing = useMemo(() => {
    if (!editing) return null;
    return getBallots().find((b) => b.id === id) || null;
  }, [editing, id]);

  // защита
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/ballots", { replace: true });
    }
  }, [user, navigate]);

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [street, setStreet] = useState(
    existing?.votersFilter?.street || "Корабельная",
  );
  const [requiresFunding, setRequiresFunding] = useState(
    !!existing?.requiresFunding,
  );
  const [requiresInitiator, setRequiresInitiator] = useState(
    !!existing?.requiresInitiator,
  );
  const [opensAt, setOpensAt] = useState(
    toLocalInputValue(existing?.opensAt) || "",
  );
  const [closesAt, setClosesAt] = useState(
    toLocalInputValue(existing?.closesAt) || "",
  );
  const [msg, setMsg] = useState("");

  const onSaveDraft = () => {
    if (!title.trim()) return setMsg("Введите заголовок");
    const data = {
      title: title.trim(),
      description: description.trim(),
      votersFilter: { street: street.trim() },
      requiresFunding,
      requiresInitiator,
      status: "draft",
    };
    if (editing) {
      updateBallot(existing.id, data);
      setMsg("Черновик сохранён");
    } else {
      const b = createBallot(data);
      navigate(`/compose/${b.id}`, { replace: true });
    }
  };

  const onPublish = () => {
    if (!title.trim()) return setMsg("Введите заголовок");
    const oTs = fromLocalInputValue(opensAt) || Date.now();
    const cTs = fromLocalInputValue(closesAt) || oTs + 2 * 60 * 60 * 1000;
    // сначала обновим поля
    if (editing) {
      updateBallot(existing.id, {
        title: title.trim(),
        description: description.trim(),
        votersFilter: { street: street.trim() },
        requiresFunding,
        requiresInitiator,
      });
      const res = publishBallot(existing.id, oTs, cTs);
      if (!res.ok) return setMsg(res.error);
      navigate("/ballots", { replace: true });
    } else {
      const b = createBallot({
        title: title.trim(),
        description: description.trim(),
        votersFilter: { street: street.trim() },
        requiresFunding,
        requiresInitiator,
        status: "draft",
      });
      const res = publishBallot(b.id, oTs, cTs);
      if (!res.ok) return setMsg(res.error);
      navigate("/ballots", { replace: true });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {editing ? "Редактирование голосования" : "Новое голосование"}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Заголовок</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Срочно нужен трактор..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Описание</label>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткие детали"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">
              Улица (фильтр голосующих)
            </label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="reqF"
              type="checkbox"
              checked={requiresFunding}
              onChange={(e) => setRequiresFunding(e.target.checked)}
            />
            <label htmlFor="reqF">Требуется финансирование</label>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="reqI"
              type="checkbox"
              checked={requiresInitiator}
              onChange={(e) => setRequiresInitiator(e.target.checked)}
            />
            <label htmlFor="reqI">Требуется инициатор</label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Начало голосования</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Окончание голосования</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
            />
          </div>
        </div>

        {msg && <p className="text-sm text-red-600">{msg}</p>}

        <div className="flex gap-2">
          <button
            onClick={onSaveDraft}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Сохранить черновик
          </button>
          <button
            onClick={onPublish}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Опубликовать
          </button>
          <button
            onClick={() => navigate("/ballots")}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

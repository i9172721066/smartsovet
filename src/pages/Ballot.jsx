// src/pages/Ballot.jsx
import { Link, useParams, Navigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { getBallotById, setVote, getUserVote, clearVote } from "../lib/store";
import { useMemo, useState } from "react";

function fmt(dt) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dt));
  } catch {
    return String(dt ?? "");
  }
}

export default function Ballot() {
  const { id } = useParams();
  const user = getCurrentUser();
  const ballot = getBallotById(id);

  if (!ballot) return <Navigate to="/vote" replace />;

  const myVoteInitial = useMemo(
    () => getUserVote(ballot.id, user?.username),
    [ballot.id, user?.username],
  );
  const [opt, setOpt] = useState(myVoteInitial ?? "");

  const submit = (e) => {
    e.preventDefault();
    if (!user) return;
    if (!opt) return;
    setVote(ballot.id, user.username, opt);
    alert("Спасибо! Ваш голос учтён.");
  };

  const revokeMine = () => {
    if (!user) return;
    clearVote(ballot.id, user.username);
    setOpt("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{ballot.title}</h1>
        <div className="flex items-center gap-3">
          {user?.role === "admin" && (
            <Link
              to={`/admin/ballots/${ballot.id}/edit`}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
            >
              Редактировать
            </Link>
          )}
          <Link
            to="/vote"
            className="rounded-lg border px-4 py-2 text-indigo-600 hover:bg-indigo-50"
          >
            ← ко всем вопросам
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        {ballot.description && (
          <p className="mb-3 text-gray-700">{ballot.description}</p>
        )}
        <div className="text-sm text-gray-500 space-y-1">
          {ballot.votersNote && <div>Кто голосует: {ballot.votersNote}</div>}
          <div>
            Период: {fmt(ballot.startsAt)} — {fmt(ballot.endsAt)}
          </div>
          <div>
            Статус: <b>{ballot.status ?? "черновик"}</b>
          </div>
        </div>
      </div>

      {/* Простейший UI голосования (радиокнопки) */}
      <form
        onSubmit={submit}
        className="rounded-xl border bg-white p-5 space-y-4"
      >
        <p className="text-gray-500 text-sm">
          Голосовать можно один раз. Вы можете «снять свой голос» и
          проголосовать снова.
        </p>

        <div className="space-y-2">
          {ballot.options.map((o) => (
            <label
              key={o.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
                opt === o.id ? "border-indigo-500 ring-1 ring-indigo-300" : ""
              }`}
            >
              <input
                type="radio"
                name="opt"
                className="accent-indigo-600"
                checked={opt === o.id}
                onChange={() => setOpt(o.id)}
              />
              <span>{o.title}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 text-white px-5 py-2"
          >
            Голосовать
          </button>

          <button
            type="button"
            onClick={revokeMine}
            className="rounded-lg bg-yellow-100 text-yellow-800 px-5 py-2"
          >
            Снять мой голос (переголосовать)
          </button>
        </div>
      </form>
    </div>
  );
}

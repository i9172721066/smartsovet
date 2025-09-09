// src/pages/VoteDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getBallot,
  getTally,
  recordVote,
  removeUserVote,
  setActiveBallotId,
} from "../lib/store";
import { getCurrentUser } from "../lib/auth";

export default function VoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const ballot = useMemo(() => (id ? getBallot(id) : null), [id]);
  const [choice, setChoice] = useState("");
  const [tally, setTally] = useState({ totals: {}, total: 0 });
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (id) setActiveBallotId(id);
  }, [id]);

  useEffect(() => {
    if (ballot) setTally(getTally(ballot.id));
  }, [ballot]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p>
          Сессия не найдена. Перейдите на{" "}
          <Link className="text-indigo-600" to="/">
            главную
          </Link>
          .
        </p>
      </div>
    );
  }

  if (!ballot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p>Карточка не найдена.</p>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 rounded bg-gray-100"
        >
          Назад
        </Link>
      </div>
    );
  }

  const submit = () => {
    if (!choice) return setInfo("Выберите вариант.");
    recordVote(ballot.id, user.username, choice);
    setTally(getTally(ballot.id));
    setInfo("Спасибо! Ваш голос учтён.");
    alert("Спасибо! Ваш голос учтён.");
  };

  const revoke = () => {
    removeUserVote(ballot.id, user.username);
    setTally(getTally(ballot.id));
    setChoice("");
    setInfo("Ваш голос снят. Можно проголосовать снова.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{ballot.title}</h1>
        <div className="space-x-2">
          <Link
            to={`/results/${ballot.id}`}
            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Результаты
          </Link>
          <Link
            to="/"
            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            ← ко всем вопросам
          </Link>
        </div>
      </div>

      {ballot.description && (
        <div className="text-sm text-gray-600 mb-4">{ballot.description}</div>
      )}

      <div className="space-y-3">
        {ballot.options.map((o) => (
          <label
            key={o.key}
            className="block rounded-xl border bg-white px-4 py-3 cursor-pointer"
          >
            <input
              type="radio"
              className="mr-3"
              name="vote"
              value={o.key}
              checked={choice === o.key}
              onChange={() => setChoice(o.key)}
            />
            {o.label}
          </label>
        ))}
      </div>

      {info && <p className="text-sm text-emerald-600 mt-4">{info}</p>}

      <div className="flex items-center gap-3 mt-4">
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={submit}
        >
          Голосовать
        </button>
        <button
          className="px-4 py-2 rounded bg-amber-500 text-white hover:bg-amber-600"
          onClick={revoke}
        >
          Снять мой голос (переголосовать)
        </button>
      </div>

      <div className="mt-8">
        <div className="text-sm text-gray-500 mb-2">
          Текущие результаты (быстрая сводка)
        </div>
        <div className="space-y-2">
          {ballot.options.map((o) => {
            const count = tally.totals[o.key] || 0;
            const perc = tally.total
              ? Math.round((count / tally.total) * 100)
              : 0;
            return (
              <div key={o.key} className="bg-white rounded border p-3">
                <div className="flex items-center justify-between pb-1">
                  <div>{o.label}</div>
                  <div className="text-xs text-gray-500">
                    {count} / {tally.total}
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-2 bg-indigo-500"
                    style={{ width: `${perc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// src/pages/BallotsPage.jsx
import { Link, useNavigate } from "react-router-dom";
import {
  getState,
  getBallots,
  setActiveBallotId,
  closeBallot,
} from "../lib/store";
import { getCurrentUser } from "../lib/store";

export default function BallotsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const ballots = getBallots();

  const onOpenDetails = (id) => {
    setActiveBallotId(id);
    navigate(`/results/${id}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Голосования</h1>
        {user?.role === "admin" && (
          <div className="flex gap-2">
            <Link
              to="/compose"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              + Новое голосование
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {ballots.map((b) => (
          <div key={b.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{b.title}</h2>
                <p className="text-gray-600 mt-1">{b.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Статус: <b>{b.status}</b>{" "}
                  {b.opensAt && `• c ${new Date(b.opensAt).toLocaleString()}`}{" "}
                  {b.closesAt && `по ${new Date(b.closesAt).toLocaleString()}`}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => onOpenDetails(b.id)}
                className="px-3 py-2 rounded-lg border hover:bg-gray-50"
              >
                Перейти к результатам
              </button>

              {b.status === "draft" && user?.role === "admin" && (
                <Link
                  to={`/compose/${b.id}`}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                >
                  Редактировать
                </Link>
              )}

              {b.status === "voting" && user?.role === "admin" && (
                <button
                  onClick={() => {
                    const r = closeBallot(b.id);
                    if (!r.ok) alert(r.error);
                    else window.location.reload();
                  }}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                >
                  Завершить голосование
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

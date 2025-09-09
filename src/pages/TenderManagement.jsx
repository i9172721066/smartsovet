// src/pages/TenderManagement.jsx
import { Link, useParams } from "react-router-dom";

export default function TenderManagement() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Этап тендера</h1>
      <p className="text-gray-600">
        Страница для управления тендером по голосованию <b>{id}</b>.
      </p>

      <div className="rounded-xl border bg-white p-5">
        <p>
          Заглушка: логика тендера будет добавлена на следующем шаге (добавление
          предложений, голосование за инициативы, подсчёт и переход к
          финансированию).
        </p>
      </div>

      <Link
        to="/ballots"
        className="px-3 py-2 rounded-lg border hover:bg-gray-50"
      >
        ← К списку голосований
      </Link>
    </div>
  );
}

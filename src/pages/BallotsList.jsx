import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listBallots, getTally } from "../lib/store";

// Объект для отображения статусов на русском
const STATUS_LABELS = {
  draft: "Черновик",
  voting: "Идёт голосование",
  tender: "Идёт тендер",
  financing_calc: "Расчет финансирования",
  financing: "Финансирование",
  additional_funding: "Досбор средств",
  in_progress: "На исполнении",
  completed: "Выполнено",
  rejected: "Отклонен",
  no_quorum: "Нет кворума",
};

// Функция форматирования даты
const formatDate = (date) => {
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function BallotsList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(listBallots());
  }, []);

  // Получаем цвет фона для статуса
  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100",
      voting: "bg-green-100",
      tender: "bg-blue-100",
      financing_calc: "bg-yellow-100",
      financing: "bg-orange-100",
      additional_funding: "bg-red-100",
      in_progress: "bg-purple-100",
      completed: "bg-teal-100",
      rejected: "bg-red-100",
      no_quorum: "bg-gray-100",
    };
    return colors[status] || "bg-gray-100";
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Вопросы для голосования</h1>
        <p className="text-gray-500">Пока нет активных карточек.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Вопросы для голосования</h1>

      <div className="space-y-4">
        {items.map((b) => {
          const { total } = getTally(b.id);
          return (
            <Link
              key={b.id}
              to={`/vote/${b.id}`}
              className="block rounded-xl border p-4 hover:border-indigo-400 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{b.title}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded ${getStatusColor(b.status)}`}
                >
                  {STATUS_LABELS[b.status] || b.status}
                </span>
              </div>

              <p className="text-sm text-gray-600">{b.description}</p>

              <div className="mt-3 text-sm">
                {b.startDate && b.endDate && (
                  <div className="text-gray-500">
                    Срок: {formatDate(b.startDate)} - {formatDate(b.endDate)}
                  </div>
                )}

                <div className="flex gap-4 mt-2">
                  {b.requiresFinancing && (
                    <div className="text-orange-600 text-xs">
                      Требуется финансирование
                    </div>
                  )}
                  {b.requiresInitiator && (
                    <div className="text-blue-600 text-xs">
                      Требуется инициатор
                    </div>
                  )}
                </div>

                {b.participants && (
                  <div className="text-gray-500 text-xs mt-2">
                    Участники: {b.participants}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-gray-400">
                  Всего голосов: {total}
                </div>
                {b.status === "completed" && b.rating && (
                  <div className="text-xs text-green-600">
                    Рейтинг: {b.rating}/10
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

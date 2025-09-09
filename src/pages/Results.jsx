import { useState, useEffect } from "react";

export default function Results() {
  const [allVotings, setAllVotings] = useState([]);

  useEffect(() => {
    loadAllVotings();
  }, []);

  const loadAllVotings = () => {
    // Загружаем созданные пользователями голосования
    const savedVotings = JSON.parse(localStorage.getItem("vg_votings") || "[]");

    // Тестовые голосования
    const defaultVotings = [
      {
        id: "default_001",
        title: "Срочно нужен трактор для расчистки снега",
        text: "Срочно нужен трактор для расчистки снега на улице Корабельная",
        status: "voting",
        participants: ["Корабельная_1", "Корабельная_3", "Корабельная_5"],
        votingEnd: "2024-01-20T21:00:00",
        votes: { yes: 34, no: 10, abstain: 3, total: 47 },
      },
      {
        id: "default_002",
        title: "Ремонт детской площадки",
        text: "Необходимо отремонтировать детскую площадку",
        status: "completed",
        participants: ["Садовая_10", "Садовая_12"],
        votes: { yes: 25, no: 5, abstain: 2, total: 32 },
      },
    ];

    // Объединяем все голосования
    setAllVotings([...savedVotings, ...defaultVotings]);
  };

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 8px 0" }}>Результаты голосований</h1>
          <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
            Просмотр результатов всех голосований
          </p>
        </div>

        <button
          onClick={loadAllVotings}
          style={{
            padding: "8px 16px",
            border: "1px solid #ddd",
            borderRadius: 6,
            backgroundColor: "white",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Обновить
        </button>
      </div>

      {allVotings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            border: "2px dashed #ddd",
            borderRadius: 12,
            color: "#666",
          }}
        >
          Нет голосований для отображения
        </div>
      ) : (
        allVotings.map((voting) => (
          <VotingResult key={voting.id} voting={voting} />
        ))
      )}
    </div>
  );
}

function VotingResult({ voting }) {
  const getStatusInfo = (status) => {
    const statusMap = {
      draft: { text: "Черновик", color: "#9ca3af" },
      voting: { text: "Голосование", color: "#3b82f6" },
      tender: { text: "Тендер", color: "#f59e0b" },
      financing: { text: "Финансирование", color: "#10b981" },
      execution: { text: "Исполнение", color: "#8b5cf6" },
      completed: { text: "Завершено", color: "#059669" },
    };
    return statusMap[status] || { text: status, color: "#6b7280" };
  };

  const statusInfo = getStatusInfo(voting.status);
  const total = voting.votes?.total || 0;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, color: "#1f2937" }}>{voting.title}</h3>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: "white",
            backgroundColor: statusInfo.color,
          }}
        >
          {statusInfo.text}
        </span>
      </div>

      <p style={{ color: "#6b7280", margin: "0 0 16px 0", fontSize: 14 }}>
        {voting.text}
      </p>

      {total > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Результаты:</h4>

          <VoteBar
            label="ДА"
            count={voting.votes.yes}
            total={total}
            color="#10b981"
          />
          <VoteBar
            label="НЕТ"
            count={voting.votes.no}
            total={total}
            color="#ef4444"
          />
          <VoteBar
            label="ВОЗДЕРЖАЛИСЬ"
            count={voting.votes.abstain}
            total={total}
            color="#6b7280"
          />

          <div
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginTop: 8,
              textAlign: "right",
            }}
          >
            Всего: {total} голосов
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, color: "#6b7280" }}>
        <div>Участники: {voting.participants?.join(", ")}</div>
        {voting.votingEnd && (
          <div>
            Окончание: {new Date(voting.votingEnd).toLocaleString("ru-RU")}
          </div>
        )}
        {voting.createdBy && <div>Создано: {voting.createdBy}</div>}
      </div>
    </div>
  );
}

function VoteBar({ label, count, total, color }) {
  const percentage = total ? Math.round((count * 100) / total) : 0;

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
          fontSize: 14,
        }}
      >
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span>
          {count} ({percentage}%)
        </span>
      </div>
      <div
        style={{
          height: 6,
          backgroundColor: "#f1f5f9",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

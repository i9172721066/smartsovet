import { useState, useEffect } from "react";

export default function ManageVotings() {
  const [votings, setVotings] = useState([]);
  const user = JSON.parse(localStorage.getItem("vg_user") || "null");

  // Проверяем права доступа
  if (!user || user.role !== "responsible") {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "50px auto",
          padding: 20,
          textAlign: "center",
        }}
      >
        <h2>Доступ запрещен</h2>
        <p>Только ответственные могут управлять голосованиями</p>
      </div>
    );
  }

  useEffect(() => {
    loadVotings();
  }, []);

  const loadVotings = () => {
    const savedVotings = JSON.parse(localStorage.getItem("vg_votings") || "[]");
    setVotings(savedVotings);
  };

  const updateVotingStatus = (votingId, newStatus) => {
    const updatedVotings = votings.map((voting) => {
      if (voting.id === votingId) {
        return { ...voting, status: newStatus };
      }
      return voting;
    });

    setVotings(updatedVotings);
    localStorage.setItem("vg_votings", JSON.stringify(updatedVotings));
  };

  const deleteVoting = (votingId) => {
    if (window.confirm("Удалить голосование?")) {
      const updatedVotings = votings.filter((v) => v.id !== votingId);
      setVotings(updatedVotings);
      localStorage.setItem("vg_votings", JSON.stringify(updatedVotings));
    }
  };

  const getStatusActions = (voting) => {
    const actions = [];

    if (voting.status === "draft") {
      actions.push(
        <button
          key="activate"
          onClick={() => updateVotingStatus(voting.id, "voting")}
          style={{
            padding: "6px 12px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 12,
            marginRight: 8,
          }}
        >
          Активировать
        </button>,
      );
    }

    if (voting.status === "voting") {
      actions.push(
        <button
          key="pause"
          onClick={() => updateVotingStatus(voting.id, "draft")}
          style={{
            padding: "6px 12px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 12,
            marginRight: 8,
          }}
        >
          Приостановить
        </button>,
      );

      actions.push(
        <button
          key="tender"
          onClick={() => updateVotingStatus(voting.id, "tender")}
          style={{
            padding: "6px 12px",
            backgroundColor: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 12,
            marginRight: 8,
          }}
        >
          Запустить тендер
        </button>,
      );
    }

    if (voting.status === "tender") {
      actions.push(
        <a
          key="view-tender"
          href={`/tender/${voting.id}`}
          style={{
            padding: "6px 12px",
            backgroundColor: "#8b5cf6",
            color: "white",
            textDecoration: "none",
            borderRadius: 4,
            fontSize: 12,
            display: "inline-block",
            marginRight: 8,
          }}
        >
          Открыть тендер
        </a>,
      );

      actions.push(
        <button
          key="finish-tender"
          onClick={() => updateVotingStatus(voting.id, "financing")}
          style={{
            padding: "6px 12px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 12,
            marginRight: 8,
          }}
        >
          Завершить тендер
        </button>,
      );
    }

    if (voting.status === "financing") {
      actions.push(
        <a
          key="view-financing"
          href={`/financing/${voting.id}`}
          style={{
            padding: "6px 12px",
            backgroundColor: "#10b981",
            color: "white",
            textDecoration: "none",
            borderRadius: 4,
            fontSize: 12,
            display: "inline-block",
            marginRight: 8,
          }}
        >
          Открыть финансирование
        </a>,
      );

      actions.push(
        <button
          key="start-execution"
          onClick={() => updateVotingStatus(voting.id, "execution")}
          style={{
            padding: "6px 12px",
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 12,
            marginRight: 8,
          }}
        >
          Начать исполнение
        </button>,
      );
    }

    if (voting.status === "execution") {
      actions.push(
        <a
          key="view-execution"
          href={`/execution/${voting.id}`}
          style={{
            padding: "6px 12px",
            backgroundColor: "#8b5cf6",
            color: "white",
            textDecoration: "none",
            borderRadius: 4,
            fontSize: 12,
            display: "inline-block",
            marginRight: 8,
          }}
        >
          Открыть исполнение
        </a>,
      );

      actions.push(
        <button
          key="complete"
          onClick={() => updateVotingStatus(voting.id, "completed")}
          style={{
            padding: "6px 12px",
            backgroundColor: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 12,
            marginRight: 8,
          }}
        >
          Завершить проект
        </button>,
      );
    }

    if (voting.status === "completed") {
      actions.push(
        <a
          key="view-completed"
          href={`/execution/${voting.id}`}
          style={{
            padding: "6px 12px",
            backgroundColor: "#059669",
            color: "white",
            textDecoration: "none",
            borderRadius: 4,
            fontSize: 12,
            display: "inline-block",
            marginRight: 8,
          }}
        >
          Посмотреть результат
        </a>,
      );
    }

    // Кнопка удаления доступна всегда
    actions.push(
      <button
        key="delete"
        onClick={() => deleteVoting(voting.id)}
        style={{
          padding: "6px 12px",
          backgroundColor: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        Удалить
      </button>,
    );

    return actions;
  };

  const getAdditionalInfo = (voting) => {
    const info = [];

    if (voting.votes && voting.votes.total > 0) {
      info.push(`Проголосовало: ${voting.votes.total} человек`);
    }

    if (voting.tenderProposals && voting.tenderProposals.length > 0) {
      info.push(`Предложений в тендере: ${voting.tenderProposals.length}`);
    }

    // Информация о финансировании
    const financingData = JSON.parse(
      localStorage.getItem("vg_financing") || "{}",
    );
    const votingFinancing = financingData[voting.id];
    if (votingFinancing && votingFinancing.paidParticipants) {
      info.push(
        `Оплатили: ${votingFinancing.paidParticipants.length} участников`,
      );
    }

    // Информация об исполнении
    const executionData = JSON.parse(
      localStorage.getItem("vg_execution") || "{}",
    );
    const votingExecution = executionData[voting.id];
    if (votingExecution) {
      if (votingExecution.updates && votingExecution.updates.length > 0) {
        info.push(`Обновлений: ${votingExecution.updates.length}`);
      }
      if (votingExecution.ratings && votingExecution.ratings.length > 0) {
        const avgRating = (
          votingExecution.ratings.reduce((sum, r) => sum + r.rating, 0) /
          votingExecution.ratings.length
        ).toFixed(1);
        info.push(
          `Рейтинг: ${avgRating}/5 (${votingExecution.ratings.length} оценок)`,
        );
      }
    }

    return info;
  };

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1>Управление голосованиями</h1>
        <p style={{ color: "#666", fontSize: 14 }}>
          Управляйте жизненным циклом голосований от создания до завершения
        </p>
      </div>

      {votings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            border: "2px dashed #ddd",
            borderRadius: 12,
            color: "#666",
          }}
        >
          <h3 style={{ margin: "0 0 8px 0" }}>Нет голосований</h3>
          <p style={{ margin: 0, fontSize: 14 }}>
            Создайте новое голосование для начала работы
          </p>
        </div>
      ) : (
        votings.map((voting) => {
          const additionalInfo = getAdditionalInfo(voting);

          return (
            <div
              key={voting.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 20,
                marginBottom: 16,
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
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>
                    {voting.title}
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      margin: 0,
                      fontSize: 14,
                      lineHeight: 1.4,
                    }}
                  >
                    {voting.text}
                  </p>
                </div>

                <StatusBadge status={voting.status} />
              </div>

              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
                <div style={{ marginBottom: 4 }}>
                  <strong>Участники:</strong> {voting.participants.join(", ")}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Создано:</strong>{" "}
                  {new Date(voting.createdAt || Date.now()).toLocaleString(
                    "ru-RU",
                  )}
                </div>
                {additionalInfo.map((info, index) => (
                  <div key={index} style={{ marginBottom: 4 }}>
                    {info}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {getStatusActions(voting)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    draft: { text: "Черновик", color: "#9ca3af" },
    voting: { text: "Голосование", color: "#3b82f6" },
    tender: { text: "Тендер", color: "#f59e0b" },
    financing: { text: "Финансирование", color: "#10b981" },
    execution: { text: "Исполнение", color: "#8b5cf6" },
    completed: { text: "Завершено", color: "#059669" },
  };

  const config = statusConfig[status] || { text: status, color: "#6b7280" };

  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        color: "white",
        backgroundColor: config.color,
        whiteSpace: "nowrap",
      }}
    >
      {config.text}
    </span>
  );
}

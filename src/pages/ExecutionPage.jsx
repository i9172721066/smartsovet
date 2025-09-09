import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ExecutionPage() {
  const { votingId } = useParams();
  const navigate = useNavigate();
  const [voting, setVoting] = useState(null);
  const [winnerProposal, setWinnerProposal] = useState(null);
  const [execution, setExecution] = useState({
    startDate: null,
    updates: [],
    photos: [],
    expenses: [],
    rating: null,
    feedback: "",
  });
  const [newUpdate, setNewUpdate] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [userFeedback, setUserFeedback] = useState("");

  const user = JSON.parse(localStorage.getItem("vg_user") || "null");
  const isInitiator = winnerProposal?.authorId === user?.id;

  useEffect(() => {
    loadExecutionData();
  }, [votingId]);

  const loadExecutionData = () => {
    const savedVotings = JSON.parse(localStorage.getItem("vg_votings") || "[]");
    const foundVoting = savedVotings.find((v) => v.id === votingId);

    if (!foundVoting) {
      navigate("/vote");
      return;
    }

    setVoting(foundVoting);

    if (foundVoting.tenderProposals && foundVoting.tenderProposals.length > 0) {
      const winner = foundVoting.tenderProposals.reduce((prev, current) =>
        (current.votes || 0) > (prev.votes || 0) ? current : prev,
      );
      setWinnerProposal(winner);
    }

    const executionData = JSON.parse(
      localStorage.getItem("vg_execution") || "{}",
    );
    const votingExecution = executionData[votingId] || {
      startDate: null,
      updates: [],
      photos: [],
      expenses: [],
      ratings: [],
      feedback: [],
    };

    setExecution(votingExecution);

    const userRatingData = votingExecution.ratings?.find(
      (r) => r.userId === user.id,
    );
    if (userRatingData) {
      setUserRating(userRatingData.rating);
      setUserFeedback(userRatingData.feedback);
    }
  };

  const addUpdate = () => {
    if (!newUpdate.trim() || !isInitiator) return;

    const update = {
      id: Date.now(),
      text: newUpdate,
      author: user.fullName || user.login,
      timestamp: new Date().toISOString(),
    };

    const updatedExecution = {
      ...execution,
      updates: [...(execution.updates || []), update],
      startDate: execution.startDate || new Date().toISOString(),
    };

    setExecution(updatedExecution);
    setNewUpdate("");

    const executionData = JSON.parse(
      localStorage.getItem("vg_execution") || "{}",
    );
    executionData[votingId] = updatedExecution;
    localStorage.setItem("vg_execution", JSON.stringify(executionData));
  };

  const submitRating = () => {
    if (userRating === 0) return;

    const ratingData = {
      userId: user.id,
      userName: user.fullName || user.login,
      rating: userRating,
      feedback: userFeedback,
      timestamp: new Date().toISOString(),
    };

    const existingRatings = execution.ratings || [];
    const updatedRatings = existingRatings.filter((r) => r.userId !== user.id);
    updatedRatings.push(ratingData);

    const updatedExecution = {
      ...execution,
      ratings: updatedRatings,
    };

    setExecution(updatedExecution);

    const executionData = JSON.parse(
      localStorage.getItem("vg_execution") || "{}",
    );
    executionData[votingId] = updatedExecution;
    localStorage.setItem("vg_execution", JSON.stringify(executionData));
  };

  if (!voting) {
    return <div style={{ padding: 20 }}>Загрузка...</div>;
  }

  if (voting.status !== "execution" && voting.status !== "completed") {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "50px auto",
          padding: 20,
          textAlign: "center",
        }}
      >
        <h2>Исполнение недоступно</h2>
        <p>Голосование должно быть в статусе "Исполнение" или "Завершено"</p>
        <button
          onClick={() => navigate("/vote")}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Вернуться к голосованиям
        </button>
      </div>
    );
  }

  const avgRating =
    execution.ratings?.length > 0
      ? (
          execution.ratings.reduce((sum, r) => sum + r.rating, 0) /
          execution.ratings.length
        ).toFixed(1)
      : 0;

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1>Исполнение проекта</h1>
        <div
          style={{
            padding: 16,
            backgroundColor: "#f3f4f6",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: "0 0 8px 0" }}>{voting.title}</h3>
          <p style={{ margin: 0, color: "#6b7280" }}>{voting.text}</p>
        </div>
      </div>

      {winnerProposal && (
        <div
          style={{
            border: "1px solid #3b82f6",
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            backgroundColor: "#eff6ff",
          }}
        >
          <h2 style={{ margin: "0 0 12px 0", color: "#1d4ed8" }}>
            Исполняемый проект
          </h2>
          <h3 style={{ margin: "0 0 8px 0" }}>{winnerProposal.title}</h3>
          <p style={{ margin: "0 0 12px 0", color: "#6b7280" }}>
            {winnerProposal.description}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              fontSize: 14,
            }}
          >
            <div>
              <strong>Исполнитель:</strong> {winnerProposal.executor}
            </div>
            <div>
              <strong>Сроки:</strong> {winnerProposal.timeline}
            </div>
            <div>
              <strong>Бюджет:</strong> {winnerProposal.cost} ₽
            </div>
            <div>
              <strong>Ответственный:</strong> {winnerProposal.authorName}
            </div>
          </div>
          {execution.startDate && (
            <div style={{ marginTop: 12, fontSize: 14 }}>
              <strong>Начато:</strong>{" "}
              {new Date(execution.startDate).toLocaleString("ru-RU")}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
          backgroundColor: "white",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0" }}>Исполнение проекта</h3>
        <p>Страница исполнения проекта готова к работе</p>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";

export default function Vote() {
  const [votings, setVotings] = useState([]);
  const [userVotes, setUserVotes] = useState({}); // { [votingId]: {vote, initiator} }
  const [msg, setMsg] = useState("");

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("vg_user") || "null"); }
    catch { return null; }
  }, []);

  useEffect(() => {
    seedDefaultsIfNeeded();
    loadVotings();
    loadUserVotes();
  }, []);

  /** добавляем дефолтный опрос в localStorage, если его там ещё нет */
  const seedDefaultsIfNeeded = () => {
    const saved = JSON.parse(localStorage.getItem("vg_votings") || "[]");

    const defaultVotings = [
      {
        id: "default_001",
        title: "Срочно нужен трактор для расчистки снега",
        text: "Срочно нужен трактор для расчистки снега на улице Корабельная",
        status: "voting",
        participants: ["Корабельная_1", "Корабельная_3", "Корабельная_5"],
        votingEnd: "2024-01-20T21:00:00",
        requiresFinancing: true,
        requiresInitiator: true,
        createdBy: "system",
        votes: { yes: 34, no: 10, abstain: 3, total: 47 },
        initiatorVotes: { yes: 3, no: 32 },
      },
    ];

    // если дефолтного нет — добавим и сохраним
    const exists = saved.some((v) => v.id === "default_001");
    if (!exists) {
      const updated = [...saved, ...defaultVotings];
      localStorage.setItem("vg_votings", JSON.stringify(updated));
    }
  };

  /** грузим список голосований, показываем только активные/черновики */
  const loadVotings = () => {
    const saved = JSON.parse(localStorage.getItem("vg_votings") || "[]");
    const active = saved.filter((v) => v.status === "voting" || v.status === "draft");
    setVotings(active);
  };

  /** грузим сохранённые голоса конкретного пользователя (чтобы после F5 не голосовал заново) */
  const loadUserVotes = () => {
    try {
      const map = JSON.parse(localStorage.getItem("vg_votes") || "{}"); // { [votingId]: { [userId]: {vote, initiator} } }
      if (!user) return;
      const mine = {};
      Object.keys(map).forEach((vId) => {
        if (map[vId] && map[vId][user.id]) {
          mine[vId] = map[vId][user.id];
        }
      });
      setUserVotes(mine);
    } catch {
      /* ignore */
    }
  };

  const handleVote = (votingId, voteType, initiatorChoice) => {
    // 1) отметим локально
    setUserVotes((prev) => ({
      ...prev,
      [votingId]: { vote: voteType, initiator: initiatorChoice },
    }));

    // 2) достанем все опросы из localStorage
    const all = JSON.parse(localStorage.getItem("vg_votings") || "[]");
    // найдём конкретный
    let idx = all.findIndex((v) => v.id === votingId);

    // если по какой-то причине этого голосования нет в LS — возьмём из state и добавим
    if (idx === -1) {
      const fallback = votings.find((v) => v.id === votingId);
      if (fallback) {
        all.push({ ...fallback });
        idx = all.length - 1;
      }
    }

    if (idx !== -1) {
      const voting = { ...all[idx] };

      // гарантируем наличие структур
      voting.votes = voting.votes || { yes: 0, no: 0, abstain: 0, total: 0 };
      voting.initiatorVotes = voting.initiatorVotes || { yes: 0, no: 0 };

      // считаем голос
      if (voteType === "yes" || voteType === "no" || voteType === "abstain") {
        voting.votes[voteType] = (voting.votes[voteType] || 0) + 1;
        voting.votes.total = (voting.votes.total || 0) + 1;
      }
      // считаем инициатора
      if (voting.requiresInitiator && (initiatorChoice === "yes" || initiatorChoice === "no")) {
        voting.initiatorVotes[initiatorChoice] =
          (voting.initiatorVotes[initiatorChoice] || 0) + 1;
      }

      // сохраним назад
      all[idx] = voting;
      localStorage.setItem("vg_votings", JSON.stringify(all));
      // освежим список на экране
      setVotings((prev) => prev.map((v) => (v.id === votingId ? voting : v)));
    }

    // 3) зафиксируем «кто проголосовал» (по пользователю)
    try {
      const votesMap = JSON.parse(localStorage.getItem("vg_votes") || "{}");
      const uid = user?.id || "guest"; // при желании можно заставить логиниться
      votesMap[votingId] = votesMap[votingId] || {};
      votesMap[votingId][uid] = { vote: voteType, initiator: initiatorChoice };
      localStorage.setItem("vg_votes", JSON.stringify(votesMap));
    } catch {
      /* ignore */
    }

    const voting = votings.find((v) => v.id === votingId);
    setMsg(`Спасибо! Ваш голос по "${voting?.title}" учтён.`);
    setTimeout(() => setMsg(""), 3000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { text: "Черновик", color: "#9ca3af" },
      voting: { text: "Голосование", color: "#3b82f6" },
      tender: { text: "Тендер", color: "#f59e0b" },
    };
    const config = statusConfig[status] || { text: status, color: "#6b7280" };
    return (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          color: "white",
          backgroundColor: config.color,
        }}
      >
        {config.text}
      </span>
    );
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
          <h1 style={{ margin: "0 0 8px 0" }}>Активные голосования</h1>
          <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
            Участвуйте в голосованиях по вопросам вашего района
          </p>
        </div>

        <button
          onClick={() => { loadVotings(); loadUserVotes(); }}
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
          <h3 style={{ margin: "0 0 8px 0" }}>Нет активных голосований</h3>
          <p style={{ margin: 0, fontSize: 14 }}>
            Ответственные могут создать новое голосование
          </p>
        </div>
      ) : (
        votings.map((voting) => (
          <VotingCard
            key={voting.id}
            voting={voting}
            userVote={userVotes[voting.id]}
            onVote={handleVote}
            getStatusBadge={getStatusBadge}
          />
        ))
      )}

      {msg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: "#10b981",
            color: "white",
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}

function VotingCard({ voting, userVote, onVote, getStatusBadge }) {
  const [vote, setVote] = useState(userVote?.vote || "");
  const [initiator, setInitiator] = useState(userVote?.initiator || "no");

  useEffect(() => {
    // если из localStorage подтянули уже проголосованное — подставим в форму
    setVote(userVote?.vote || "");
    setInitiator(userVote?.initiator || "no");
  }, [userVote]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vote) return;
    onVote(voting.id, vote, initiator);
  };

  const isVoted = !!userVote;
  const isActive = voting.status === "voting";

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        backgroundColor: isVoted ? "#f0fdf4" : "white",
        opacity: isActive ? 1 : 0.7,
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
        <h3 style={{ margin: "0", color: "#1f2937", flex: 1 }}>{voting.title}</h3>
        {getStatusBadge(voting.status)}
      </div>

      <p style={{ color: "#6b7280", margin: "0 0 16px 0", lineHeight: 1.5 }}>
        {voting.text}
      </p>

      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 16,
          display: "grid",
          gap: 4,
        }}
      >
        <div>
          <strong>Участники:</strong>{" "}
          {Array.isArray(voting.participants) ? voting.participants.join(", ") : "—"}
        </div>
        {voting.votingEnd && (
          <div>
            <strong>Окончание:</strong>{" "}
            {new Date(voting.votingEnd).toLocaleString("ru-RU")}
          </div>
        )}
        {voting.requiresFinancing && (
          <div style={{ color: "#f59e0b" }}>💰 Требуется финансирование</div>
        )}
        {voting.requiresInitiator && (
          <div style={{ color: "#8b5cf6" }}>👤 Требуется инициатор</div>
        )}
      </div>

      {!isVoted && isActive ? (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: 8,
                fontSize: 15,
              }}
            >
              Ваш голос:
            </label>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { value: "yes", label: "✅ ДА", color: "#10b981" },
                { value: "no", label: "❌ НЕТ", color: "#ef4444" },
                { value: "abstain", label: "⚪ ВОЗДЕРЖАЛСЯ", color: "#6b7280" },
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: 12,
                    border: "2px solid",
                    borderColor: vote === option.value ? option.color : "#e5e7eb",
                    borderRadius: 8,
                    cursor: "pointer",
                    backgroundColor:
                      vote === option.value ? `${option.color}10` : "white",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="radio"
                    name={`vote_${voting.id}`}
                    value={option.value}
                    checked={vote === option.value}
                    onChange={(e) => setVote(e.target.value)}
                    style={{ marginRight: 12 }}
                  />
                  <span style={{ fontWeight: vote === option.value ? 600 : 400 }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {voting.requiresInitiator && (
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: 8,
                  fontSize: 15,
                }}
              >
                Готовы быть инициатором?
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { value: "yes", label: "👍 ДА", color: "#10b981" },
                  { value: "no", label: "👎 НЕТ", color: "#6b7280" },
                ].map((option) => (
                  <label
                    key={option.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 16px",
                      border: "2px solid",
                      borderColor:
                        initiator === option.value ? option.color : "#e5e7eb",
                      borderRadius: 8,
                      cursor: "pointer",
                      backgroundColor:
                        initiator === option.value ? `${option.color}10` : "white",
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <input
                      type="radio"
                      name={`initiator_${voting.id}`}
                      value={option.value}
                      checked={initiator === option.value}
                      onChange={(e) => setInitiator(e.target.value)}
                      style={{ marginRight: 8 }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!vote}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              color: "white",
              background: vote ? "#3b82f6" : "#9ca3af",
              fontWeight: 600,
              cursor: vote ? "pointer" : "not-allowed",
              fontSize: 15,
            }}
          >
            Проголосовать
          </button>
        </form>
      ) : isVoted ? (
        <div
          style={{
            padding: 16,
            background: "#dcfce7",
            borderRadius: 8,
            border: "1px solid #16a34a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 20, marginRight: 8 }}>✅</span>
            <strong>Вы проголосовали</strong>
          </div>
          <div style={{ fontSize: 14 }}>
            <div>
              Ваш голос:{" "}
              <strong>
                {userVote.vote === "yes"
                  ? "ДА"
                  : userVote.vote === "no"
                  ? "НЕТ"
                  : "ВОЗДЕРЖАЛСЯ"}
              </strong>
            </div>
            {voting.requiresInitiator && (
              <div>
                Инициатор:{" "}
                <strong>{userVote.initiator === "yes" ? "ДА" : "НЕТ"}</strong>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: 16,
            background: "#f3f4f6",
            borderRadius: 8,
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Голосование временно приостановлено
        </div>
      )}
    </div>
  );
}

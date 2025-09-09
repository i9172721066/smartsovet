import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TenderPage() {
  const { votingId } = useParams();
  const navigate = useNavigate();
  const [voting, setVoting] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userVote, setUserVote] = useState(null);

  const user = JSON.parse(localStorage.getItem("vg_user") || "null");

  useEffect(() => {
    loadVotingAndProposals();
  }, [votingId]);

  const loadVotingAndProposals = () => {
    const savedVotings = JSON.parse(localStorage.getItem("vg_votings") || "[]");
    const foundVoting = savedVotings.find((v) => v.id === votingId);

    if (!foundVoting) {
      navigate("/vote");
      return;
    }

    setVoting(foundVoting);
    setProposals(foundVoting.tenderProposals || []);

    // Загружаем голос пользователя по тендеру
    const tenderVotes = JSON.parse(
      localStorage.getItem("vg_tender_votes") || "{}",
    );
    setUserVote(tenderVotes[votingId]);
  };

  const addProposal = (proposalData) => {
    const newProposal = {
      id: `proposal_${Date.now()}`,
      votingId: votingId,
      authorId: user.id,
      authorName: user.fullName || user.login,
      ...proposalData,
      createdAt: new Date().toISOString(),
      votes: 0,
    };

    const updatedProposals = [...proposals, newProposal];
    setProposals(updatedProposals);

    // Обновляем в localStorage
    const savedVotings = JSON.parse(localStorage.getItem("vg_votings") || "[]");
    const updatedVotings = savedVotings.map((v) => {
      if (v.id === votingId) {
        return { ...v, tenderProposals: updatedProposals };
      }
      return v;
    });

    localStorage.setItem("vg_votings", JSON.stringify(updatedVotings));
    setShowAddForm(false);
  };

  const voteForProposal = (proposalId) => {
    // Сохраняем голос пользователя
    const tenderVotes = JSON.parse(
      localStorage.getItem("vg_tender_votes") || "{}",
    );
    tenderVotes[votingId] = proposalId;
    localStorage.setItem("vg_tender_votes", JSON.stringify(tenderVotes));
    setUserVote(proposalId);

    // Обновляем счетчик голосов
    const updatedProposals = proposals.map((p) => {
      if (p.id === proposalId) {
        return { ...p, votes: (p.votes || 0) + 1 };
      }
      return p;
    });

    setProposals(updatedProposals);

    // Сохраняем в localStorage
    const savedVotings = JSON.parse(localStorage.getItem("vg_votings") || "[]");
    const updatedVotings = savedVotings.map((v) => {
      if (v.id === votingId) {
        return { ...v, tenderProposals: updatedProposals };
      }
      return v;
    });

    localStorage.setItem("vg_votings", JSON.stringify(updatedVotings));
  };

  if (!voting) {
    return <div style={{ padding: 20 }}>Загрузка...</div>;
  }

  if (voting.status !== "tender") {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "50px auto",
          padding: 20,
          textAlign: "center",
        }}
      >
        <h2>Тендер недоступен</h2>
        <p>Голосование должно быть в статусе "Тендер"</p>
        <button
          onClick={() => navigate("/vote")}
          style={{ padding: "10px 20px" }}
        >
          Вернуться к голосованиям
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
      {/* Заголовок */}
      <div style={{ marginBottom: 24 }}>
        <h1>Тендер предложений</h1>
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

      {/* Кнопка добавления предложения */}
      {!showAddForm && (
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Добавить предложение
          </button>
        </div>
      )}

      {/* Форма добавления предложения */}
      {showAddForm && (
        <ProposalForm
          onSubmit={addProposal}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Список предложений */}
      <div>
        <h2 style={{ marginBottom: 16 }}>Предложения ({proposals.length})</h2>

        {proposals.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              border: "2px dashed #ddd",
              borderRadius: 12,
              color: "#666",
            }}
          >
            Пока нет предложений. Станьте первым!
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                userVote={userVote}
                onVote={() => voteForProposal(proposal.id)}
                isVoted={userVote === proposal.id}
                canVote={!userVote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Форма добавления предложения
function ProposalForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cost: "",
    paymentType: "prepaid", // prepaid, postpaid, partial
    executor: "",
    timeline: "",
    contactInfo: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Заполните название и описание");
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 24,
        backgroundColor: "#f9fafb",
        marginBottom: 24,
      }}
    >
      <h3 style={{ margin: "0 0 16px 0" }}>Новое предложение</h3>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Название предложения *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Краткое название вашего предложения"
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Описание *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Детальное описание как вы решите проблему"
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 8 }}
            >
              Стоимость (руб.)
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => handleChange("cost", e.target.value)}
              placeholder="0"
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 8 }}
            >
              Условия оплаты
            </label>
            <select
              value={formData.paymentType}
              onChange={(e) => handleChange("paymentType", e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
                boxSizing: "border-box",
              }}
            >
              <option value="prepaid">Предоплата</option>
              <option value="postpaid">Постоплата</option>
              <option value="partial">Частичная предоплата</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Исполнитель
          </label>
          <input
            type="text"
            value={formData.executor}
            onChange={(e) => handleChange("executor", e.target.value)}
            placeholder="Кто будет выполнять работу"
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Сроки выполнения
          </label>
          <input
            type="text"
            value={formData.timeline}
            onChange={(e) => handleChange("timeline", e.target.value)}
            placeholder="Например: завтра утром, 2-3 часа"
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "12px 24px",
              border: "1px solid #ddd",
              borderRadius: 8,
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            Отмена
          </button>
          <button
            type="submit"
            style={{
              padding: "12px 24px",
              border: "none",
              borderRadius: 8,
              backgroundColor: "#3b82f6",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Добавить предложение
          </button>
        </div>
      </form>
    </div>
  );
}

// Карточка предложения
function ProposalCard({ proposal, onVote, isVoted, canVote }) {
  const getPaymentTypeText = (type) => {
    const types = {
      prepaid: "Предоплата",
      postpaid: "Постоплата",
      partial: "Частичная предоплата",
    };
    return types[type] || type;
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 20,
        backgroundColor: isVoted ? "#ecfdf5" : "white",
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
        <h3 style={{ margin: 0, color: "#1f2937" }}>{proposal.title}</h3>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#059669" }}>
            {proposal.cost ? `${proposal.cost} ₽` : "Бесплатно"}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {getPaymentTypeText(proposal.paymentType)}
          </div>
        </div>
      </div>

      <p style={{ color: "#6b7280", margin: "0 0 16px 0", lineHeight: 1.5 }}>
        {proposal.description}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 16,
          fontSize: 14,
          color: "#6b7280",
        }}
      >
        {proposal.executor && (
          <div>
            <strong>Исполнитель:</strong> {proposal.executor}
          </div>
        )}
        {proposal.timeline && (
          <div>
            <strong>Сроки:</strong> {proposal.timeline}
          </div>
        )}
        <div>
          <strong>Автор:</strong> {proposal.authorName}
        </div>
        <div>
          <strong>Голосов:</strong> {proposal.votes || 0}
        </div>
      </div>

      {canVote ? (
        <button
          onClick={onVote}
          style={{
            padding: "10px 20px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Голосовать за это предложение
        </button>
      ) : isVoted ? (
        <div
          style={{
            padding: 10,
            backgroundColor: "#d1fae5",
            color: "#065f46",
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          ✓ Вы проголосовали за это предложение
        </div>
      ) : (
        <div style={{ color: "#6b7280", fontSize: 14 }}>
          Вы уже проголосовали в этом тендере
        </div>
      )}
    </div>
  );
}

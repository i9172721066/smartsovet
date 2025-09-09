import { useState, useEffect } from "react";
import Card from "./ui/Card.jsx";
import Button from "./ui/Button.jsx";
import Input from "./ui/Input.jsx";

import {
  getTenderProposals,
  createTenderProposal,
  voteTenderProposal,
  hasUserVotedTender,
  getWinningProposal,
} from "../lib/store";

export default function TenderView({ ballotId }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProposal, setNewProposal] = useState({
    companyName: "",
    description: "",
    price: "",
    contactPhone: "",
    executionDays: "",
  });
  const [errors, setErrors] = useState({});
  const [userVote, setUserVote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: заменить, когда подключим auth
  const userId = "testUser";

  useEffect(() => {
    let canceled = false;
    (async () => {
      setLoading(true);
      try {
        const list = getTenderProposals(ballotId);
        if (!canceled) setProposals(list);
        // если уже голосовал, подсветим
        const voted = hasUserVotedTender(ballotId, userId);
        if (voted) {
          const win = getWinningProposal(ballotId);
          if (win && !canceled) setUserVote(win.id);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => (canceled = true);
  }, [ballotId]);

  const loadProposals = async () => {
    const list = getTenderProposals(ballotId);
    setProposals(list);
  };

  const validate = () => {
    const e = {};
    if (!newProposal.companyName.trim()) e.companyName = "Укажите компанию";
    if (!newProposal.description.trim()) e.description = "Опишите работы";
    if (!newProposal.price) e.price = "Укажите стоимость";
    if (!newProposal.executionDays) e.executionDays = "Укажите срок (в днях)";
    if (!newProposal.contactPhone.trim()) e.contactPhone = "Укажите телефон";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmitProposal = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await createTenderProposal(ballotId, {
        ...newProposal,
        price: parseFloat(newProposal.price),
        executionDays: parseInt(newProposal.executionDays),
      });

      setNewProposal({
        companyName: "",
        description: "",
        price: "",
        contactPhone: "",
        executionDays: "",
      });

      await loadProposals();
      setErrors({});
    } catch (error) {
      alert("Ошибка при создании предложения");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (proposalId) => {
    try {
      await voteTenderProposal(ballotId, proposalId, userId);
      setUserVote(proposalId);
      await loadProposals();
    } catch {
      alert("Ошибка при голосовании");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Тендерные предложения
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Добавьте своё предложение или проголосуйте за наиболее подходящее.
        </p>
      </div>

      {/* Форма добавления предложения */}
      <Card className="p-5">
        <h3 className="text-lg font-medium mb-4">Добавить предложение</h3>
        <form onSubmit={handleSubmitProposal} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Название компании
            </label>
            <Input
              type="text"
              value={newProposal.companyName}
              onChange={(e) =>
                setNewProposal({ ...newProposal, companyName: e.target.value })
              }
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-rose-600">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Контактный телефон
            </label>
            <Input
              type="tel"
              value={newProposal.contactPhone}
              onChange={(e) =>
                setNewProposal({ ...newProposal, contactPhone: e.target.value })
              }
            />
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-rose-600">{errors.contactPhone}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Описание работ
            </label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={newProposal.description}
              onChange={(e) =>
                setNewProposal({ ...newProposal, description: e.target.value })
              }
            />
            {errors.description && (
              <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Стоимость (₽)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newProposal.price}
              onChange={(e) =>
                setNewProposal({ ...newProposal, price: e.target.value })
              }
            />
            {errors.price && (
              <p className="mt-1 text-sm text-rose-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Срок выполнения (дней)
            </label>
            <Input
              type="number"
              min="1"
              step="1"
              value={newProposal.executionDays}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  executionDays: e.target.value,
                })
              }
            />
            {errors.executionDays && (
              <p className="mt-1 text-sm text-rose-600">
                {errors.executionDays}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Отправка..." : "Добавить предложение"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Список предложений */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
                <div className="mt-3 h-3 w-2/3 bg-gray-200 rounded" />
                <div className="mt-4 h-8 w-24 bg-gray-200 rounded" />
              </Card>
            ))}
          </>
        ) : proposals.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">
              Пока нет предложений. Будьте первым — добавьте своё!
            </p>
          </Card>
        ) : (
          proposals.map((p) => (
            <Card
              key={p.id}
              className={`p-4 ${
                p.id === userVote ? "border-indigo-500 bg-indigo-50" : ""
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{p.companyName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold">
                    {Number(p.price).toLocaleString()} ₽
                  </div>
                  <div className="text-sm text-gray-500">
                    {p.executionDays} дней
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">Голосов: {p.votes}</div>

                <Button
                  onClick={() => handleVote(p.id)}
                  disabled={userVote !== null && userVote !== p.id}
                  variant={
                    userVote === p.id
                      ? "secondary"
                      : userVote !== null
                      ? "secondary"
                      : "primary"
                  }
                >
                  {userVote === p.id
                    ? "Выбрано"
                    : userVote !== null
                    ? "Недоступно"
                    : "Выбрать"}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

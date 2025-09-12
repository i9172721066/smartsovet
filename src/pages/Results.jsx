import { useState, useEffect } from "react";
import { useAuth, useRepository } from "../lib/repo/context.jsx";

export default function Results() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { repository, backend } = useRepository();

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      if (backend === 'local') {
        // Получаем те же опросы что и в Vote.jsx
        const testPolls = [
          {
            id: 1,
            title: "Срочно нужен трактор для расчистки снега",
            description: "Срочно нужен трактор для расчистки снега на улице Корабельная",
            status: "voting",
            startAt: new Date(Date.now() - 86400000).toISOString(),
            endAt: new Date(Date.now() + 86400000 * 7).toISOString(),
            options: [
              { id: 1, text: "ДА" },
              { id: 2, text: "НЕТ" },
              { id: 3, text: "ВОЗДЕРЖАЛСЯ" }
            ],
            requiresFinancing: true,
            requiresInitiator: true,
            participants: ["Корабельная_1", "Корабельная_3", "Корабельная_5"],
            createdAt: "2024-01-20T10:00:00",
            createdBy: "system"
          }
        ];

        // Загружаем реальные результаты голосования из localStorage
        const pollsWithResults = testPolls.map(poll => {
          const votesKey = `poll_${poll.id}_votes`;
          const userVotesKey = `poll_${poll.id}_user_votes`;
          
          const votes = JSON.parse(localStorage.getItem(votesKey) || '{}');
          const userVotes = JSON.parse(localStorage.getItem(userVotesKey) || '{}');
          
          // Подсчитываем голоса по опциям
          const results = poll.options.map(option => ({
            ...option,
            votes: votes[option.id] || 0
          }));
          
          const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
          
          // Список проголосовавших пользователей
          const votersList = Object.keys(userVotes).map(username => ({
            username,
            optionId: userVotes[username],
            optionText: poll.options.find(opt => opt.id == userVotes[username])?.text || 'Неизвестно'
          }));

          return {
            ...poll,
            options: results,
            totalVotes,
            votersList
          };
        });

        setPolls(pollsWithResults);
      } else {
        // Для Supabase - загружаем все опросы включая завершенные
        const data = await repository.listPolls('all');
        const pollsWithResults = await Promise.all(
          data.map(async (poll) => {
            const detailedPoll = await repository.getPoll(poll.id);
            return detailedPoll;
          })
        );
        setPolls(pollsWithResults);
      }
    } catch (error) {
      console.error('Ошибка загрузки результатов:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Результаты голосований</h1>
          <p className="text-gray-600">Просмотр результатов всех голосований</p>
        </div>
        <button
          onClick={loadResults}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Обновить
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет голосований</h3>
          <p className="text-gray-500">Голосования еще не проводились</p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => (
            <ResultCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({ poll }) {
  const getStatusBadge = () => {
    const statusColors = {
      'voting': 'bg-blue-100 text-blue-800',
      'active': 'bg-blue-100 text-blue-800',
      'finished': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'scheduled': 'bg-gray-100 text-gray-800',
      'draft': 'bg-gray-100 text-gray-800'
    };

    const statusTexts = {
      'voting': 'Голосование',
      'active': 'Голосование',
      'finished': 'Завершено',
      'completed': 'Завершено',
      'scheduled': 'Запланировано',
      'draft': 'Черновик'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[poll.status] || 'bg-gray-100 text-gray-800'}`}>
        {statusTexts[poll.status] || poll.status}
      </span>
    );
  };

  const getOptionColor = (optionText) => {
    if (optionText === 'ДА') return 'bg-green-500';
    if (optionText === 'НЕТ') return 'bg-red-500';
    if (optionText === 'ВОЗДЕРЖАЛСЯ') return 'bg-gray-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
      {/* Заголовок и статус */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
        {getStatusBadge()}
      </div>

      {/* Описание */}
      <p className="text-gray-600 mb-4">{poll.description}</p>

      {/* Результаты голосования */}
      {poll.totalVotes > 0 ? (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Результаты:</h4>
          
          <div className="space-y-3">
            {poll.options.map((option) => {
              const percentage = poll.totalVotes > 0 ? Math.round((option.votes * 100) / poll.totalVotes) : 0;
              
              return (
                <div key={option.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      {option.text === 'ДА' && '✅'} 
                      {option.text === 'НЕТ' && '❌'} 
                      {option.text === 'ВОЗДЕРЖАЛСЯ' && '⚪'} 
                      <span className="ml-1">{option.text}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      {option.votes} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getOptionColor(option.text)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-right text-sm text-gray-500 mt-2">
            Всего: {poll.totalVotes} голосов
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600 text-sm">Голосов пока нет</p>
        </div>
      )}

      {/* Список проголосовавших (если есть) */}
      {poll.votersList && poll.votersList.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Проголосовавшие:</h5>
          <div className="flex flex-wrap gap-2">
            {poll.votersList.map((voter, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {voter.username}: {voter.optionText}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Метаданные */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>
          <span className="font-medium">Участники:</span> {poll.participants?.join(", ") || "—"}
        </div>
        {poll.endAt && (
          <div>
            <span className="font-medium">Окончание:</span> {new Date(poll.endAt).toLocaleString("ru-RU")}
          </div>
        )}
        {poll.createdAt && (
          <div>
            <span className="font-medium">Создано:</span> {new Date(poll.createdAt).toLocaleString("ru-RU")}
          </div>
        )}
        {poll.createdBy && (
          <div>
            <span className="font-medium">Создано:</span> {poll.createdBy}
          </div>
        )}
        {poll.requiresFinancing && (
          <div className="text-amber-600">
            💰 Требуется финансирование
          </div>
        )}
        {poll.requiresInitiator && (
          <div className="text-purple-600">
            👤 Требуется инициатор
          </div>
        )}
      </div>
    </div>
  );
}
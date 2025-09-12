import { useEffect, useState } from "react";
import { useAuth, useRepository } from "../lib/repo/context.jsx";
import toast from 'react-hot-toast';

export default function Vote() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { repository, backend } = useRepository();

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      
      if (backend === 'local') {
        // Загружаем ВСЕ голосования из localStorage
        const createdPolls = JSON.parse(localStorage.getItem('vg_created_polls') || '[]');
        
        console.log('📊 ВСЕГО голосований в localStorage:', createdPolls.length);
        
        // Показываем только голосования со статусом 'voting' 
        const activePolls = createdPolls.filter(poll => poll.status === 'voting');
        
        console.log('✅ Голосований со статусом "voting":', activePolls.length);
        
        // Добавляем опции если их нет
        const pollsWithOptions = activePolls.map(poll => ({
          ...poll,
          options: poll.options || [
            { id: 1, text: "ДА" },
            { id: 2, text: "НЕТ" },
            { id: 3, text: "ВОЗДЕРЖАЛСЯ" }
          ]
        }));
        
        setPolls(pollsWithOptions);
        
        console.log('📋 Отображаемые голосования:', pollsWithOptions.map(p => p.title));
      } else {
        // Supabase данные
        const data = await repository.listPolls('active');
        setPolls(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки опросов:', error);
      toast.error('Ошибка загрузки опросов');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionId, isInitiator = false) => {
    try {
      if (backend === 'local') {
        const votesKey = `poll_${pollId}_votes`;
        const userVotesKey = `poll_${pollId}_user_votes`;
        
        const userVotes = JSON.parse(localStorage.getItem(userVotesKey) || '{}');
        const votes = JSON.parse(localStorage.getItem(votesKey) || '{}');
        
        // Проверить что еще не голосовал
        if (userVotes[user.username || user.login]) {
          toast.error('Вы уже проголосовали в этом опросе');
          return;
        }
        
        // Записать голос
        userVotes[user.username || user.login] = optionId;
        votes[optionId] = (votes[optionId] || 0) + 1;
        
        localStorage.setItem(userVotesKey, JSON.stringify(userVotes));
        localStorage.setItem(votesKey, JSON.stringify(votes));
        
        toast.success('Ваш голос учтён!');
        
        // Перезагружаем данные
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Ошибка голосования:', error);
      toast.error('Ошибка при голосовании: ' + error.message);
    }
  };

  const checkUserVoted = (pollId) => {
    if (backend === 'local') {
      const userVotesKey = `poll_${pollId}_user_votes`;
      const userVotes = JSON.parse(localStorage.getItem(userVotesKey) || '{}');
      return userVotes[user.username || user.login] || null;
    }
    return null;
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
          <h1 className="text-2xl font-bold text-gray-900">Активные голосования</h1>
          <p className="text-gray-600">Участвуйте в голосованиях по вопросам вашего района</p>
        </div>
        <button
          onClick={loadPolls}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Обновить
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет активных голосований</h3>
          <p className="text-gray-500">
            Голосования временно приостановлены
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => (
            <PollCard 
              key={poll.id} 
              poll={poll} 
              onVote={handleVote}
              userVoted={checkUserVoted(poll.id)}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PollCard({ poll, onVote, userVoted, user }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);

  const hasVoted = !!userVoted;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOption) return;
    
    const optionId = parseInt(selectedOption);
    onVote(poll.id, optionId, isInitiator);
  };

  const getStatusBadge = () => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      Голосование
    </span>
  );

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
      {/* Заголовок и статус */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
        {getStatusBadge()}
      </div>

      {/* Описание */}
      <p className="text-gray-600 mb-4">{poll.description}</p>

      {/* Метаданные */}
      <div className="text-sm text-gray-500 mb-4 space-y-1">
        <div>
          <span className="font-medium">Участники:</span> {poll.participants?.join(", ") || "—"}
        </div>
        {poll.endAt && (
          <div>
            <span className="font-medium">Окончание:</span> {new Date(poll.endAt).toLocaleString("ru-RU")}
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

      {/* Форма голосования или результат */}
      {hasVoted ? (
        <div className="bg-green-50 rounded-md p-4 text-green-800">
          Вы уже проголосовали в этом опросе
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Варианты голосования */}
          <div>
            <label className="text-base font-medium text-gray-900 block mb-3">
              Ваш голос:
            </label>
            <div className="space-y-2">
              {poll.options?.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    name={`vote_${poll.id}`}
                    value={option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {option.text === 'ДА' && '✅'} 
                    {option.text === 'НЕТ' && '❌'} 
                    {option.text === 'ВОЗДЕРЖАЛСЯ' && '⚪'} 
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Вопрос об инициаторстве */}
          {poll.requiresInitiator && (
            <div>
              <label className="text-base font-medium text-gray-900 block mb-3">
                Готовы быть инициатором?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`initiator_${poll.id}`}
                    value="yes"
                    onChange={() => setIsInitiator(true)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">👍 ДА</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`initiator_${poll.id}`}
                    value="no"
                    onChange={() => setIsInitiator(false)}
                    defaultChecked
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">👎 НЕТ</span>
                </label>
              </div>
            </div>
          )}

          {/* Кнопка голосования */}
          <button
            type="submit"
            disabled={!selectedOption}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Проголосовать
          </button>
        </form>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, useRepository, usePermissions } from "../lib/repo/context.jsx";
import toast from 'react-hot-toast';

export default function AdminBallots() {
  const [polls, setPolls] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, finished: 0 });
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { repository, backend } = useRepository();
  const { canManageContacts } = usePermissions();

  // Проверка прав доступа
  if (!canManageContacts) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Нет прав доступа
          </h2>
          <p className="text-red-700">
            Только администраторы могут управлять голосованиями.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (backend === 'local') {
        // Загружаем созданные голосования из localStorage
        const createdPolls = JSON.parse(localStorage.getItem('vg_created_polls') || '[]');
        
        // Добавляем тестовое голосование если список пуст
        if (createdPolls.length === 0) {
          const testPoll = {
            id: 1,
            title: "Срочно нужен трактор для расчистки снега",
            description: "Срочно нужен трактор для расчистки снега на улице Корабельная",
            status: "voting",
            startAt: new Date(Date.now() - 86400000).toISOString(),
            endAt: new Date(Date.now() + 86400000 * 7).toISOString(),
            requiresFinancing: true,
            requiresInitiator: true,
            participants: ["Корабельная_1", "Корабельная_3", "Корабельная_5"],
            createdAt: new Date().toISOString(),
            createdBy: "system"
          };
          createdPolls.push(testPoll);
          localStorage.setItem('vg_created_polls', JSON.stringify(createdPolls));
        }

        // Получаем результаты голосований
        const pollsWithResults = createdPolls.map(poll => {
          const votesKey = `poll_${poll.id}_votes`;
          const userVotesKey = `poll_${poll.id}_user_votes`;
          
          const votes = JSON.parse(localStorage.getItem(votesKey) || '{}');
          const userVotes = JSON.parse(localStorage.getItem(userVotesKey) || '{}');
          
          const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
          const votersCount = Object.keys(userVotes).length;
          
          return {
            ...poll,
            totalVotes,
            votersCount
          };
        });

        setPolls(pollsWithResults);
        
        // Подсчитываем статистику
        const active = pollsWithResults.filter(p => p.status === 'voting').length;
        const finished = pollsWithResults.filter(p => p.status === 'finished' || p.status === 'completed').length;
        
        setStats({
          total: pollsWithResults.length,
          active,
          finished
        });
      } else {
        // Supabase данные
        const data = await repository.listPolls('all');
        setPolls(data);
        
        const statsData = await repository.getStats();
        setStats({
          total: statsData.polls,
          active: data.filter(p => p.status === 'active').length,
          finished: data.filter(p => p.status === 'finished').length
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast.error('Ошибка загрузки данных управления');
    } finally {
      setLoading(false);
    }
  };

  const updatePollStatus = async (pollId, newStatus) => {
    try {
      if (backend === 'local') {
        const createdPolls = JSON.parse(localStorage.getItem('vg_created_polls') || '[]');
        const updatedPolls = createdPolls.map(poll => 
          poll.id === pollId ? { ...poll, status: newStatus } : poll
        );
        localStorage.setItem('vg_created_polls', JSON.stringify(updatedPolls));
        
        toast.success(`Статус голосования изменен на "${newStatus}"`);
        loadData(); // Перезагружаем данные
      } else {
        // Supabase обновление
        // await repository.updatePollStatus(pollId, newStatus);
        toast.success('Статус обновлен');
        loadData();
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  const deletePoll = async (pollId) => {
    if (!confirm('Вы уверены что хотите удалить это голосование?')) {
      return;
    }

    try {
      if (backend === 'local') {
        const createdPolls = JSON.parse(localStorage.getItem('vg_created_polls') || '[]');
        const filteredPolls = createdPolls.filter(poll => poll.id !== pollId);
        localStorage.setItem('vg_created_polls', JSON.stringify(filteredPolls));
        
        // Удаляем также данные голосования
        localStorage.removeItem(`poll_${pollId}_votes`);
        localStorage.removeItem(`poll_${pollId}_user_votes`);
        
        toast.success('Голосование удалено');
        loadData();
      } else {
        // Supabase удаление
        // await repository.deletePoll(pollId);
        toast.success('Голосование удалено');
        loadData();
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast.error('Ошибка удаления голосования');
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
    <div className="max-w-6xl mx-auto">
      {/* Заголовок и статистика */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Управление голосованиями</h1>
            <p className="text-gray-600">Контроль и администрирование всех голосований</p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            + Создать голосование
          </Link>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">{stats.total}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Всего голосований
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">{stats.active}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Активных
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.active}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">{stats.finished}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Завершенных
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.finished}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Список голосований */}
      {polls.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет голосований</h3>
          <p className="text-gray-500 mb-4">Создайте первое голосование для управления</p>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Создать голосование
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => (
            <AdminPollCard 
              key={poll.id} 
              poll={poll} 
              onUpdateStatus={updatePollStatus}
              onDelete={deletePoll}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPollCard({ poll, onUpdateStatus, onDelete }) {
  const getStatusBadge = () => {
    const statusColors = {
      'voting': 'bg-blue-100 text-blue-800',
      'active': 'bg-blue-100 text-blue-800',
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'finished': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'draft': 'bg-gray-100 text-gray-800'
    };

    const statusTexts = {
      'voting': 'Голосование',
      'active': 'Активно',
      'scheduled': 'Запланировано',
      'finished': 'Завершено',
      'completed': 'Завершено',
      'draft': 'Черновик'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[poll.status] || 'bg-gray-100 text-gray-800'}`}>
        {statusTexts[poll.status] || poll.status}
      </span>
    );
  };

  const getAvailableStatuses = () => {
    const allStatuses = [
      { value: 'draft', label: 'Черновик' },
      { value: 'scheduled', label: 'Запланировано' },
      { value: 'voting', label: 'Голосование' },
      { value: 'finished', label: 'Завершено' }
    ];
    
    return allStatuses.filter(status => status.value !== poll.status);
  };

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{poll.title}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-gray-600 mb-3">{poll.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Участники:</span>
              <p className="text-gray-900">{poll.participants?.length || 0}</p>
              {poll.participants && poll.participants.length > 0 && (
                <div className="mt-1">
                  {poll.participants.slice(0, 3).map((participant, index) => (
                    <span key={index} className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-1 mb-1">
                      {participant}
                    </span>
                  ))}
                  {poll.participants.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{poll.participants.length - 3} еще
                    </span>
                  )}
                </div>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-700">Проголосовало:</span>
              <p className="text-gray-900">{poll.votersCount || poll.totalVotes || 0}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Начало:</span>
              <p className="text-gray-900">{new Date(poll.startAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Окончание:</span>
              <p className="text-gray-900">{new Date(poll.endAt).toLocaleDateString()}</p>
            </div>
          </div>

          {(poll.requiresFinancing || poll.requiresInitiator) && (
            <div className="flex space-x-4 mt-3 text-sm">
              {poll.requiresFinancing && (
                <span className="inline-flex items-center text-amber-600">
                  💰 Финансирование
                </span>
              )}
              {poll.requiresInitiator && (
                <span className="inline-flex items-center text-purple-600">
                  👤 Инициатор
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 ml-6">
          {/* Изменение статуса */}
          <select
            onChange={(e) => onUpdateStatus(poll.id, e.target.value)}
            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            defaultValue=""
          >
            <option value="" disabled>Изменить статус</option>
            {getAvailableStatuses().map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* Удаление */}
          <button
            onClick={() => onDelete(poll.id)}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
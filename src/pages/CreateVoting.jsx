import { useState } from "react";
import { useAuth, useRepository, usePermissions } from "../lib/repo/context.jsx";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

export default function CreateVoting() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    requiresFinancing: false,
    requiresInitiator: false,
    participants: ['Корабельная_1', 'Корабельная_3', 'Корабельная_5'] // по умолчанию
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { repository, backend } = useRepository();
  const { canCreatePolls } = usePermissions();
  const navigate = useNavigate();

  // Проверка прав доступа
  if (!canCreatePolls) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Нет прав доступа
          </h2>
          <p className="text-red-700">
            Только администраторы могут создавать голосования.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParticipantsChange = (e) => {
    const participants = e.target.value
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    setFormData(prev => ({
      ...prev,
      participants
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.title.trim()) {
      toast.error('Введите название голосования');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Введите описание голосования');
      return;
    }

    if (!formData.startDate || !formData.startTime) {
      toast.error('Укажите дату и время начала');
      return;
    }

    if (!formData.endDate || !formData.endTime) {
      toast.error('Укажите дату и время окончания');
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error('Время окончания должно быть позже времени начала');
      return;
    }

    if (formData.participants.length === 0) {
      toast.error('Добавьте хотя бы одного участника');
      return;
    }

    setIsSubmitting(true);

    try {
      if (backend === 'local') {
        // Простое сохранение в localStorage для демонстрации
        const newPoll = {
          id: Date.now(),
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: 'scheduled',
          startAt: startDateTime.toISOString(),
          endAt: endDateTime.toISOString(),
          requiresFinancing: formData.requiresFinancing,
          requiresInitiator: formData.requiresInitiator,
          participants: formData.participants,
          options: [
            { id: 1, text: "ДА" },
            { id: 2, text: "НЕТ" },
            { id: 3, text: "ВОЗДЕРЖАЛСЯ" }
          ],
          createdAt: new Date().toISOString(),
          createdBy: user.username || user.login || 'admin'
        };

        // Сохраняем в localStorage
        const existingPolls = JSON.parse(localStorage.getItem('vg_created_polls') || '[]');
        existingPolls.push(newPoll);
        localStorage.setItem('vg_created_polls', JSON.stringify(existingPolls));

        toast.success('Голосование создано успешно!');
        navigate('/admin'); // Перенаправляем в управление
      } else {
        // Supabase создание
        const pollData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          startAt: startDateTime.toISOString(),
          endAt: endDateTime.toISOString(),
          options: ["ДА", "НЕТ", "ВОЗДЕРЖАЛСЯ"],
          allowedHouses: [], // Нужно будет мапить участников к ID домов
          createdBy: user.id
        };

        await repository.createPoll(pollData);
        toast.success('Голосование создано успешно!');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Ошибка создания голосования:', error);
      toast.error('Ошибка при создании голосования: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Создать новое голосование</h1>
        <p className="text-gray-600">Настройте параметры голосования для жителей</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        {/* Название */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название голосования *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={handleChange('title')}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Например: Установка детской площадки"
            required
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание *
          </label>
          <textarea
            value={formData.description}
            onChange={handleChange('description')}
            rows={3}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Подробное описание вопроса для голосования"
            required
          />
        </div>

        {/* Время начала */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата начала *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={handleChange('startDate')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Время начала *
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={handleChange('startTime')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Время окончания */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата окончания *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={handleChange('endDate')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Время окончания *
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={handleChange('endTime')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Участники */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Участники голосования *
          </label>
          <textarea
            value={formData.participants.join('\n')}
            onChange={handleParticipantsChange}
            rows={4}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Корабельная_1&#10;Корабельная_3&#10;Корабельная_5"
          />
          <p className="text-sm text-gray-500 mt-1">
            Каждый участник с новой строки
          </p>
        </div>

        {/* Дополнительные параметры */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresFinancing"
              checked={formData.requiresFinancing}
              onChange={handleChange('requiresFinancing')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="requiresFinancing" className="ml-2 text-sm text-gray-700">
              💰 Требуется финансирование (будет задан вопрос о финансировании)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresInitiator"
              checked={formData.requiresInitiator}
              onChange={handleChange('requiresInitiator')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="requiresInitiator" className="ml-2 text-sm text-gray-700">
              👤 Требуется инициатор (будет задан вопрос о готовности быть инициатором)
            </label>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Создание...' : 'Создать голосование'}
          </button>
        </div>
      </form>
    </div>
  );
}
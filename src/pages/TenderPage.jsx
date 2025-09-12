import { useState, useEffect } from "react";
import { useAuth, useRepository, useFeatures } from "../lib/repo/context.jsx";

export default function TenderPage() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { repository, backend } = useRepository();
  const features = useFeatures();

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      setLoading(true);
      
      if (backend === 'local') {
        // Тестовые тендеры для localStorage
        const testTenders = [
          {
            id: 1,
            title: "Поставка детской площадки",
            description: "Требуется поставка и установка детской площадки для двора",
            status: "open",
            deadline: new Date(Date.now() + 86400000 * 14).toISOString(), // через 2 недели
            budget: 150000,
            proposals: [
              {
                id: 1,
                contractor: "ООО Детские площадки",
                price: 145000,
                description: "Современная площадка с гарантией 5 лет",
                rating: 4.8
              },
              {
                id: 2,
                contractor: "Игровые комплексы СПб",
                price: 160000,
                description: "Экологически чистые материалы",
                rating: 4.6
              }
            ],
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          },
          {
            id: 2,
            title: "Уборка придомовой территории",
            description: "Еженедельная уборка и вывоз мусора",
            status: "closed",
            deadline: new Date(Date.now() - 86400000).toISOString(), // вчера
            budget: 25000,
            proposals: [],
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
          }
        ];
        setTenders(testTenders);
      } else {
        // Supabase тендеры
        const data = await repository.getTenders();
        setTenders(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки тендеров:', error);
    } finally {
      setLoading(false);
    }
  };

  // Проверка что функция тендеров включена
  if (!features.tender) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Функция тендеров отключена
          </h2>
          <p className="text-yellow-700">
            Эта функция временно недоступна. Обратитесь к администратору.
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Тендеры</h1>
          <p className="text-gray-600">Конкурсы на выполнение работ и услуг</p>
        </div>
        <button
          onClick={loadTenders}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Обновить
        </button>
      </div>

      {tenders.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет активных тендеров</h3>
          <p className="text-gray-500">Тендеры появятся здесь когда будут объявлены</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tenders.map((tender) => (
            <TenderCard key={tender.id} tender={tender} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

function TenderCard({ tender, user }) {
  const [showProposals, setShowProposals] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    contractor: '',
    price: '',
    description: '',
    phone: ''
  });

  const getStatusBadge = () => {
    const statusColors = {
      'open': 'bg-green-100 text-green-800',
      'closed': 'bg-red-100 text-red-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-gray-100 text-gray-800'
    };

    const statusTexts = {
      'open': 'Открыт',
      'closed': 'Закрыт',
      'in_progress': 'В работе',
      'completed': 'Завершен'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[tender.status] || 'bg-gray-100 text-gray-800'}`}>
        {statusTexts[tender.status] || tender.status}
      </span>
    );
  };

  const isExpired = new Date(tender.deadline) < new Date();
  const daysLeft = Math.ceil((new Date(tender.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  const handleProposalSubmit = (e) => {
    e.preventDefault();
    
    if (!proposalForm.contractor.trim()) {
      alert('Введите название организации');
      return;
    }
    
    if (!proposalForm.price || proposalForm.price <= 0) {
      alert('Введите корректную цену');
      return;
    }
    
    if (!proposalForm.description.trim()) {
      alert('Введите описание предложения');
      return;
    }

    // Простая демонстрация - добавляем предложение в localStorage
    const newProposal = {
      id: Date.now(),
      contractor: proposalForm.contractor.trim(),
      price: parseInt(proposalForm.price),
      description: proposalForm.description.trim(),
      phone: proposalForm.phone.trim(),
      submittedAt: new Date().toISOString(),
      submittedBy: user?.username || user?.login || 'anonymous'
    };

    // Сохраняем предложение
    const proposalsKey = `tender_${tender.id}_proposals`;
    const existingProposals = JSON.parse(localStorage.getItem(proposalsKey) || '[]');
    existingProposals.push(newProposal);
    localStorage.setItem(proposalsKey, JSON.stringify(existingProposals));

    alert('Предложение подано успешно!');
    setShowProposalForm(false);
    setProposalForm({ contractor: '', price: '', description: '', phone: '' });
    
    // Перезагружаем страницу чтобы показать новое предложение
    window.location.reload();
  };

  const handleInputChange = (field) => (e) => {
    setProposalForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Загружаем предложения из localStorage
  const proposalsKey = `tender_${tender.id}_proposals`;
  const savedProposals = JSON.parse(localStorage.getItem(proposalsKey) || '[]');
  const allProposals = [...(tender.proposals || []), ...savedProposals];

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
      {/* Заголовок и статус */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{tender.title}</h3>
        {getStatusBadge()}
      </div>

      {/* Описание */}
      <p className="text-gray-600 mb-4">{tender.description}</p>

      {/* Информация о тендере */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Бюджет:</span>
          <p className="text-gray-900">{tender.budget?.toLocaleString()} ₽</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Срок подачи:</span>
          <p className={`${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
            {new Date(tender.deadline).toLocaleDateString()}
            {!isExpired && daysLeft > 0 && (
              <span className="text-gray-500 ml-1">({daysLeft} дн.)</span>
            )}
            {isExpired && <span className="text-red-600 ml-1">(просрочен)</span>}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Предложений:</span>
          <p className="text-gray-900">{allProposals.length}</p>
        </div>
      </div>

      {/* Предложения */}
      {allProposals.length > 0 && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowProposals(!showProposals)}
            className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-3"
          >
            {showProposals ? 'Скрыть' : 'Показать'} предложения ({allProposals.length})
            <svg 
              className={`ml-1 h-4 w-4 transform transition-transform ${showProposals ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProposals && (
            <div className="space-y-3">
              {allProposals.map((proposal) => (
                <div key={proposal.id} className="bg-gray-50 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{proposal.contractor}</h4>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{proposal.price?.toLocaleString()} ₽</div>
                      {proposal.rating && (
                        <div className="text-sm text-yellow-600">
                          ★ {proposal.rating}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{proposal.description}</p>
                  {proposal.phone && (
                    <p className="text-gray-500 text-xs">Телефон: {proposal.phone}</p>
                  )}
                  {proposal.submittedAt && (
                    <p className="text-gray-400 text-xs">
                      Подано: {new Date(proposal.submittedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Действия */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500">
          Создан: {new Date(tender.createdAt).toLocaleDateString()}
        </div>
        
        {tender.status === 'open' && !isExpired && (
          <button 
            onClick={() => setShowProposalForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Подать предложение
          </button>
        )}
      </div>

      {/* Модальное окно формы предложения */}
      {showProposalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Подать предложение
              </h3>
              <button
                onClick={() => setShowProposalForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название организации *
                </label>
                <input
                  type="text"
                  value={proposalForm.contractor}
                  onChange={handleInputChange('contractor')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="ООО Ваша компания"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  value={proposalForm.price}
                  onChange={handleInputChange('price')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="150000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={proposalForm.phone}
                  onChange={handleInputChange('phone')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+7 900 000-00-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание предложения *
                </label>
                <textarea
                  value={proposalForm.description}
                  onChange={handleInputChange('description')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Подробное описание вашего предложения..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProposalForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                >
                  Подать предложение
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
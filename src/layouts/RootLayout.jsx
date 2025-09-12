import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth, usePermissions, useFeatures } from "../lib/repo/context.jsx";
import { useEffect } from "react";

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const { isAdmin, isAuthenticated } = usePermissions();
  const features = useFeatures();

  // Перенаправление неавторизованных пользователей на страницу входа
  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [loading, isAuthenticated, location.pathname, navigate]);

  // Показать загрузку пока проверяется авторизация
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Не показывать лейаут для неавторизованных пользователей
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const tabClass = ({ isActive }) =>
    "px-3 py-2 rounded-lg text-sm font-medium transition-colors " + 
    (isActive 
      ? "bg-indigo-600 text-white shadow-sm" 
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Логотип и название */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/vote" 
                className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                СмартСовет
              </Link>
              
              {/* Индикатор бэкенда (только в dev режиме) */}
              {import.meta.env.DEV && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {import.meta.env.VITE_BACKEND || 'local'}
                </span>
              )}
            </div>

            {/* Навигация */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink className={tabClass} to="/vote">
                Голосование
              </NavLink>
              
              <NavLink className={tabClass} to="/results">
                Результаты
              </NavLink>

              {/* Тендеры - только если включены в feature flags */}
              {features.tender && (
                <NavLink className={tabClass} to="/tender">
                  Тендеры
                </NavLink>
              )}

              {/* Админские функции */}
              {isAdmin && (
                <>
                  <NavLink className={tabClass} to="/create">
                    Создать опрос
                  </NavLink>
                  
                  <NavLink className={tabClass} to="/admin">
                    Управление
                  </NavLink>
                </>
              )}
            </nav>

            {/* Профиль пользователя */}
            <div className="flex items-center space-x-3">
              {/* Информация о пользователе */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Администратор' : user.house?.address || 'Пользователь'}
                </p>
              </div>

              {/* Кнопка выхода */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>

          {/* Мобильная навигация */}
          <nav className="md:hidden mt-4 flex flex-wrap gap-2">
            <NavLink className={tabClass} to="/vote">
              Голосование
            </NavLink>
            
            <NavLink className={tabClass} to="/results">
              Результаты
            </NavLink>

            {features.tender && (
              <NavLink className={tabClass} to="/tender">
                Тендеры
              </NavLink>
            )}

            {(isAdmin || user?.role === 'admin') && (
              <>
                <NavLink className={tabClass} to="/create">
                  Создать
                </NavLink>
                
                <NavLink className={tabClass} to="/admin">
                  Управление
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Футер */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div>
              © 2025 СмартСовет - Система управления жилым комплексом
            </div>
            
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              {/* Статус функций */}
              <div className="flex items-center space-x-2">
                {features.tender && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Тендеры
                  </span>
                )}
                
                {features.finance && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Финансы
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
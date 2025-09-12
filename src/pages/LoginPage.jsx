import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/repo/context.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Перенаправить авторизованного пользователя
  useEffect(() => {
    if (user && !loading) {
      const redirectTo = location.state?.from?.pathname || '/vote';
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.login.trim() || !credentials.password.trim()) {
      toast.error('Введите логин и пароль');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(credentials.login.trim(), credentials.password);
      
      if (result.success) {
        toast.success('Вход выполнен успешно');
        const redirectTo = location.state?.from?.pathname || '/vote';
        navigate(redirectTo, { replace: true });
      } else {
        toast.error(result.error || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      toast.error('Произошла ошибка при входе');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Тестовые аккаунты для удобства разработки
  const testAccounts = [
    { login: 'admin', password: '123', desc: 'Администратор' },
    { login: 'al56', password: '123', desc: 'Корабельная 56' },
    { login: 'al54', password: '123', desc: 'Корабельная 54' },
    { login: 'garden10', password: '123', desc: 'Садовая 10' }
  ];

  const quickLogin = (login, password) => {
    setCredentials({ login, password });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Логотип */}
        <div className="mx-auto h-16 w-16 flex items-center justify-center bg-indigo-600 rounded-xl shadow-lg">
          <span className="text-2xl font-bold text-white">СС</span>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          СмартСовет
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Система управления жилым комплексом
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 backdrop-blur-sm border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Поле логина */}
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                Логин дома или email админа
              </label>
              <div className="mt-1">
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  value={credentials.login}
                  onChange={handleChange('login')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="al56, admin@example.com"
                />
              </div>
            </div>

            {/* Поле пароля */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange('password')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="text-sm text-gray-500">
                    {showPassword ? 'Скрыть' : 'Показать'}
                  </span>
                </button>
              </div>
            </div>

            {/* Кнопка входа */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Вход...' : 'Войти'}
              </button>
            </div>
          </form>

          {/* Тестовые аккаунты (только в dev режиме) */}
          {import.meta.env.DEV && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Тестовые аккаунты</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                {testAccounts.map((account) => (
                  <button
                    key={account.login}
                    type="button"
                    onClick={() => quickLogin(account.login, account.password)}
                    className="text-left px-3 py-2 text-xs border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <div className="font-medium">{account.desc}</div>
                    <div className="text-gray-500">{account.login}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Информация о системе */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Используется: {import.meta.env.VITE_BACKEND || 'localStorage'}
            </p>
            {import.meta.env.DEV && (
              <p className="text-xs text-gray-400 mt-1">
                Режим разработки
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
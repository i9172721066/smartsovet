import { createContext, useContext, useState, useEffect } from 'react';
import { LocalRepository } from './localRepo.js';
import { SupabaseRepository } from './supabaseRepo.js';
import { authService } from './auth.js';

// Создание контекстов
const RepositoryContext = createContext();
const AuthContext = createContext();

// Определение текущего бэкенда из переменных окружения
const BACKEND = import.meta.env.VITE_BACKEND || 'local';
const FEATURE_TENDER = import.meta.env.VITE_FEATURE_TENDER === 'on';
const FEATURE_FINANCE = import.meta.env.VITE_FEATURE_FINANCE === 'on';

/**
 * Провайдер репозитория - управляет выбором между localStorage и Supabase
 */
export function RepositoryProvider({ children }) {
  const [repository, setRepository] = useState(null);

  useEffect(() => {
    // Выбор репозитория на основе переменной окружения
    const repo = BACKEND === 'supabase' 
      ? new SupabaseRepository() 
      : new LocalRepository();
      
    console.log(`[Repository] Используется: ${BACKEND}`);
    setRepository(repo);
  }, []);

  if (!repository) {
    return <div>Загрузка...</div>;
  }

  return (
    <RepositoryContext.Provider value={{ repository, backend: BACKEND }}>
      {children}
    </RepositoryContext.Provider>
  );
}

/**
 * Провайдер авторизации - управляет состоянием пользователя
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (BACKEND === 'supabase') {
      // Supabase авторизация
      initSupabaseAuth();
    } else {
      // localStorage авторизация (старая система)
      initLocalAuth();
    }
  }, []);

  const initSupabaseAuth = async () => {
    try {
      // Проверить текущего пользователя
      const result = await authService.getCurrentUser();
      if (result.success) {
        setUser(result.user);
      }

      // Подписаться на изменения авторизации
      const unsubscribe = authService.onAuthStateChange((user) => {
        setUser(user);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Ошибка инициализации Supabase Auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const initLocalAuth = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("vg_user") || "null");
      setUser(userData);

      // Подписка на изменения localStorage
      const handleStorage = (e) => {
        if (e.key === "vg_user") {
          const newUser = JSON.parse(e.newValue || "null");
          setUser(newUser);
        }
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    } catch (error) {
      console.error('Ошибка инициализации Local Auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginOrEmail, password) => {
    if (BACKEND === 'supabase') {
      const result = await authService.login(loginOrEmail, password);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } else {
      // Старая localStorage система
      const { loginDemo } = await import('../auth.js');
      const result = loginDemo(loginOrEmail, password);
      if (result.ok) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    }
  };

  const logout = async () => {
    if (BACKEND === 'supabase') {
      const result = await authService.logout();
      if (result.success) {
        setUser(null);
      }
      return result;
    } else {
      // Старая localStorage система
      localStorage.removeItem("vg_user");
      setUser(null);
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      backend: BACKEND,
      features: {
        tender: FEATURE_TENDER,
        finance: FEATURE_FINANCE
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Комбинированный провайдер
 */
export function AppProvider({ children }) {
  return (
    <RepositoryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </RepositoryProvider>
  );
}

/**
 * Хуки для использования контекстов
 */
export function useRepository() {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepository должен использоваться внутри RepositoryProvider');
  }
  return context;
}

// Алиас для совместимости со старыми страницами
export function useRepo() {
  return useRepository();
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}

/**
 * Хук для проверки ролей пользователя
 */
export function usePermissions() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin' || user?.username === 'admin';
  
  return {
    isAuthenticated: !!user,
    isAdmin,
    isHouse: user?.role === 'house' || user?.role === 'user' || (user && user?.role !== 'admin'),
    canCreatePolls: isAdmin,
    canVote: user?.role === 'house' || user?.role === 'user' || (user && user?.role !== 'admin'),
    canManageContacts: isAdmin,
    user
  };
}

/**
 * Хук для работы с feature flags
 */
export function useFeatures() {
  const { features } = useAuth();
  return features;
}
import { supabase } from '../../supabase/supabaseClient.js';

/**
 * Новая система авторизации через Supabase
 * Использует таблицу houses для домов и auth.users + profiles для пользователей
 */

export class AuthService {
  
  /**
   * Авторизация дома по логину/паролю
   * @param {string} login - логин дома (например: al56, garden10)
   * @param {string} password - пароль 
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async loginHouse(login, password) {
    try {
      // 1. Найти дом в таблице houses
      const { data: house, error: houseError } = await supabase
        .from('houses')
        .select('id, street, number, login, is_active')
        .eq('login', login)
        .eq('is_active', true)
        .single();

      if (houseError || !house) {
        return { success: false, error: 'Дом не найден или неактивен' };
      }

      // 2. Проверить пароль (пока простая проверка, в prod нужно bcrypt)
      // TODO: Заменить на реальную проверку хеша пароля
      if (password !== 'placeholderhash' && password !== '123') {
        return { success: false, error: 'Неверный пароль' };
      }

      // 3. Создать пользователя в auth.users если не существует
      const email = `${login}@smartsovet.local`;
      let authUser = null;

      // Попробовать войти существующим пользователем
      const { data: existingAuth, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (signInError) {
        // Пользователь не существует, создаем
        const { data: newAuth, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password
        });

        if (signUpError) {
          return { success: false, error: `Ошибка создания пользователя: ${signUpError.message}` };
        }
        authUser = newAuth.user;
      } else {
        authUser = existingAuth.user;
      }

      if (!authUser) {
        return { success: false, error: 'Не удалось создать/найти пользователя' };
      }

      // 4. Обновить профиль пользователя
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: authUser.id,
          house_id: house.id,
          role: 'house'
        });

      if (profileError) {
        console.warn('Ошибка обновления профиля:', profileError);
      }

      // 5. Вернуть данные пользователя
      const userData = {
        id: authUser.id,
        login: house.login,
        role: 'house',
        house: {
          id: house.id,
          street: house.street,
          number: house.number,
          address: `${house.street} ${house.number}`
        },
        fullName: `${house.street} ${house.number}`,
        email: authUser.email
      };

      return { success: true, user: userData };

    } catch (error) {
      console.error('Ошибка авторизации:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  /**
   * Авторизация администратора
   * @param {string} email - email админа
   * @param {string} password - пароль админа
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async loginAdmin(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        return { success: false, error: 'Неверный email или пароль администратора' };
      }

      // Проверить что у пользователя роль admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, house_id')
        .eq('user_id', data.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        return { success: false, error: 'У вас нет прав администратора' };
      }

      const userData = {
        id: data.user.id,
        login: 'admin',
        role: 'admin',
        fullName: 'Администратор',
        email: data.user.email
      };

      return { success: true, user: userData };

    } catch (error) {
      console.error('Ошибка авторизации админа:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  /**
   * Универсальный метод входа - определяет тип пользователя автоматически
   * @param {string} loginOrEmail - логин дома или email админа
   * @param {string} password - пароль
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async login(loginOrEmail, password) {
    // Если содержит @, то это админ
    if (loginOrEmail.includes('@')) {
      return this.loginAdmin(loginOrEmail, password);
    }
    
    // Специальный случай для админа
    if (loginOrEmail === 'admin') {
      return this.loginAdmin('admin@smartsovet.local', password);
    }
    
    // Иначе это дом
    return this.loginHouse(loginOrEmail, password);
  }

  /**
   * Выход из системы
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Ошибка выхода:', error);
      return { success: false, error: 'Ошибка выхода из системы' };
    }
  }

  /**
   * Получить текущего пользователя
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { success: false, error: 'Пользователь не авторизован' };
      }

      // Получить профиль пользователя
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role,
          house_id,
          houses (
            id,
            street,
            number,
            login
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.warn('Ошибка получения профиля:', profileError);
        return { success: false, error: 'Ошибка получения профиля пользователя' };
      }

      let userData;
      
      if (profile.role === 'admin') {
        userData = {
          id: user.id,
          login: 'admin',
          role: 'admin',
          fullName: 'Администратор',
          email: user.email
        };
      } else {
        const house = profile.houses;
        userData = {
          id: user.id,
          login: house?.login,
          role: 'house',
          house: house ? {
            id: house.id,
            street: house.street,
            number: house.number,
            address: `${house.street} ${house.number}`
          } : null,
          fullName: house ? `${house.street} ${house.number}` : 'Пользователь',
          email: user.email
        };
      }

      return { success: true, user: userData };

    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  /**
   * Подписка на изменения авторизации
   * @param {Function} callback - функция обратного вызова
   * @returns {Function} функция отписки
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const result = await this.getCurrentUser();
          callback(result.user || null);
        } else {
          callback(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }
}

// Экспорт единственного экземпляра
export const authService = new AuthService();

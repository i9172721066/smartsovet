import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Хелпер для получения текущего пользователя
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Хелпер для получения профиля пользователя
export const getUserProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      houses (
        id,
        street,
        number,
        login
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }

  return data;
};

// Аудит-лог функция
export const logAuditEvent = async (action, objectType, objectId, meta = {}) => {
  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabase
    .from('audit_logs')
    .insert({
      actor: user.id,
      action,
      object_type: objectType,
      object_id: objectId,
      meta
    });

  if (error) {
    console.error('Error logging audit event:', error);
  }
};

import { supabase } from '../../supabase/supabaseClient.js';

export class SupabaseRepository {
  
  // ======= ОПРОСЫ (POLLS) =======
  
  /**
   * Получить список опросов с фильтрацией по статусу
   */
  async listPolls(status = 'active') {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        start_at,
        end_at,
        status,
        created_at,
        poll_options (
          id,
          text
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;

    const now = new Date();
    return (data || [])
      .filter(p => {
        if (status === 'all') return true;
        
        const startAt = new Date(p.start_at);
        const endAt = new Date(p.end_at);
        
        switch (status) {
          case 'scheduled': return startAt > now;
          case 'active': return startAt <= now && now < endAt;
          case 'finished': return endAt <= now;
          default: return startAt <= now && now < endAt;
        }
      })
      .map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        startAt: p.start_at,
        endAt: p.end_at,
        status: p.status,
        createdAt: p.created_at,
        options: (p.poll_options || []).map(o => ({ 
          id: o.id, 
          text: o.text 
        })),
      }));
  }

  /**
   * Получить конкретный опрос с результатами голосования
   */
  async getPoll(id) {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        start_at,
        end_at,
        status,
        created_at,
        poll_options (
          id,
          text
        ),
        votes (
          id,
          option_id,
          house_id,
          houses (
            street,
            number
          )
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;

    // Подсчитать голоса по опциям
    const voteCounts = {};
    const votersInfo = [];
    
    (data.votes || []).forEach(vote => {
      voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
      votersInfo.push({
        houseId: vote.house_id,
        optionId: vote.option_id,
        address: `${vote.houses.street} ${vote.houses.number}`
      });
    });

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      startAt: data.start_at,
      endAt: data.end_at,
      status: data.status,
      createdAt: data.created_at,
      options: (data.poll_options || []).map(o => ({ 
        id: o.id, 
        text: o.text,
        votes: voteCounts[o.id] || 0
      })),
      totalVotes: Object.values(voteCounts).reduce((sum, count) => sum + count, 0),
      votersInfo
    };
  }

  /**
   * Создать новый опрос
   */
  async createPoll({ title, description, startAt, endAt, options, allowedHouses, createdBy }) {
    try {
      // 1. Создать опрос
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          title,
          description,
          start_at: startAt,
          end_at: endAt,
          status: 'scheduled',
          created_by: createdBy
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // 2. Добавить варианты ответов
      if (options && options.length > 0) {
        const pollOptions = options.map(text => ({
          poll_id: poll.id,
          text
        }));

        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(pollOptions);

        if (optionsError) throw optionsError;
      }

      // 3. Добавить разрешенные дома для голосования
      if (allowedHouses && allowedHouses.length > 0) {
        const voters = allowedHouses.map(houseId => ({
          poll_id: poll.id,
          house_id: houseId
        }));

        const { error: votersError } = await supabase
          .from('voters')
          .insert(voters);

        if (votersError) throw votersError;
      }

      return { success: true, poll };
    } catch (error) {
      console.error('Ошибка создания опроса:', error);
      throw error;
    }
  }

  /**
   * Проголосовать в опросе
   */
  async vote(pollId, houseId, optionId) {
    try {
      // 1. Проверить что дом допущен к голосованию
      const { data: voter, error: voterError } = await supabase
        .from('voters')
        .select('id')
        .eq('poll_id', pollId)
        .eq('house_id', houseId)
        .single();

      if (voterError || !voter) {
        throw new Error('Ваш дом не допущен к участию в этом опросе');
      }

      // 2. Проверить что еще не голосовал
      const { data: existingVote, error: existingError } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('house_id', houseId)
        .single();

      if (existingVote) {
        throw new Error('Вы уже проголосовали в этом опросе');
      }

      // 3. Записать голос
      const { data: vote, error: voteError } = await supabase
        .from('votes')
        .insert({
          poll_id: pollId,
          house_id: houseId,
          option_id: optionId
        })
        .select()
        .single();

      if (voteError) throw voteError;

      return { success: true, vote };
    } catch (error) {
      console.error('Ошибка голосования:', error);
      throw error;
    }
  }

  /**
   * Проверить проголосовал ли дом в опросе
   */
  async hasVoted(pollId, houseId) {
    const { data, error } = await supabase
      .from('votes')
      .select('id, option_id')
      .eq('poll_id', pollId)
      .eq('house_id', houseId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return {
      hasVoted: !!data,
      votedOptionId: data?.option_id || null
    };
  }

  // ======= КОНТАКТЫ =======

  async listContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('id,name,role,phone,notes,is_active,created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }

  async createContact({ name, role, phone, notes }) {
    const { data, error } = await supabase
      .from('contacts')
      .insert({ name, role, phone, notes })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateContact(id, { name, role, phone, notes, isActive }) {
    const { data, error } = await supabase
      .from('contacts')
      .update({ 
        name, 
        role, 
        phone, 
        notes,
        is_active: isActive
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteContact(id) {
    const { error } = await supabase
      .from('contacts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // ======= ДОМА =======

  /**
   * Получить список всех домов
   */
  async listHouses() {
    const { data, error } = await supabase
      .from('houses')
      .select('id,street,number,login,is_active,created_at')
      .eq('is_active', true)
      .order('street', { ascending: true })
      .order('number', { ascending: true });

    if (error) throw error;
    return (data || []).map(h => ({
      id: h.id,
      street: h.street,
      number: h.number,
      login: h.login,
      address: `${h.street} ${h.number}`,
      isActive: h.is_active,
      createdAt: h.created_at
    }));
  }

  /**
   * Создать новый дом
   */
  async createHouse({ street, number, login, passwordHash }) {
    const { data, error } = await supabase
      .from('houses')
      .insert({
        street,
        number,
        login,
        password_hash: passwordHash
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      street: data.street,
      number: data.number,
      login: data.login,
      address: `${data.street} ${data.number}`
    };
  }

  // ======= СТАТИСТИКА =======

  /**
   * Получить общую статистику
   */
  async getStats() {
    try {
      const [pollsCount, housesCount, contactsCount] = await Promise.all([
        supabase.from('polls').select('id', { count: 'exact', head: true }),
        supabase.from('houses').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      return {
        polls: pollsCount.count || 0,
        houses: housesCount.count || 0,
        contacts: contactsCount.count || 0
      };
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return { polls: 0, houses: 0, contacts: 0 };
    }
  }

  // ======= ЗАГЛУШКИ ДЛЯ БУДУЩИХ ФУНКЦИЙ =======

  // Тендеры (пока заглушка)
  async getTenders() {
    return [];
  }

  async createTender(tenderData) {
    return { id: '1', ...tenderData };
  }

  // Финансы (пока заглушка - отключено в feature flags)
  async getFinanceRecords() {
    return [];
  }

  async createFinanceRecord(recordData) {
    return { id: '1', ...recordData };
  }

  // Посты (если планируется новостная лента)
  async getPosts() {
    return [];
  }

  async createPost(postData) {
    return { id: '1', ...postData };
  }

  // ======= АУДИТ =======

  /**
   * Добавить запись в аудит лог
   */
  async addAuditLog(actor, action, objectType, objectId, meta = {}) {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          actor,
          action,
          object_type: objectType,
          object_id: String(objectId),
          meta
        });

      if (error) {
        console.warn('Ошибка записи в аудит лог:', error);
      }
    } catch (error) {
      console.warn('Ошибка аудита:', error);
    }
  }
}

// Экспорт единственного экземпляра
export const supabaseRepo = new SupabaseRepository();
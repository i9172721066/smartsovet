import { supabase } from '../supabaseClient';

export class SupabaseRepository {
  async listPolls(status = 'active') {
    const { data, error } = await supabase
      .from('polls')
      .select('id,title,description,start_at,end_at,poll_options(id,text,votes)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const now = Date.now();
    return (data || [])
      .filter(p => {
        const s = new Date(p.start_at).getTime();
        const e = new Date(p.end_at).getTime();
        return status === 'active' ? (s <= now && now < e) : (e <= now);
      })
      .map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        startAt: p.start_at,
        endAt: p.end_at,
        options: (p.poll_options || []).map(o => ({ id: o.id, text: o.text, votes: o.votes })),
      }));
  }

  async getPoll(id) {
    const { data, error } = await supabase
      .from('polls')
      .select('id,title,description,start_at,end_at,poll_options(id,text,votes)')
      .eq('id', id)
      .single();
    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      startAt: data.start_at,
      endAt: data.end_at,
      options: (data.poll_options || []).map(o => ({ id: o.id, text: o.text, votes: o.votes })),
    };
  }

  async listContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('id,name,role,phone,notes,created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // Методы записи пока не используем
}

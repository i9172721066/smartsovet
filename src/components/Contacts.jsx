import React, { useEffect, useState } from 'react';
import { useRepo } from '../lib/repo/context';

export default function Contacts() {
  const repo = useRepo();
  const isSupabase = import.meta.env.VITE_BACKEND === 'supabase';
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name:'', role:'', phone:'', notes:'' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const items = await repo.listContacts();
    setList(items);
  };

  useEffect(()=>{ load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      await repo.createContact(form);
      setForm({ name:'', role:'', phone:'', notes:'' });
      await load();
    } catch (e2) {
      // в режиме supabase на S-02A запись не реализована
    } finally { setBusy(false); }
  };

  return (
    <div>
      <h2>Полезные контакты</h2>
      <ul>
        {list.map(c => (
          <li key={c.id}><b>{c.name}</b> — {c.role} — {c.phone}{c.notes?` — ${c.notes}`:''}</li>
        ))}
      </ul>

      <h3>Добавить контакт</h3>
      {isSupabase && <div style={{color:'#b26b00'}}>Режим Supabase: добавление контактов пока отключено (S-02A).</div>}
      <form onSubmit={onSubmit}>
        <div><input placeholder="Имя" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required disabled={isSupabase}/></div>
        <div><input placeholder="Роль/должность" value={form.role} onChange={e=>setForm({...form, role:e.target.value})} disabled={isSupabase}/></div>
        <div><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} disabled={isSupabase}/></div>
        <div><input placeholder="Заметки" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} disabled={isSupabase}/></div>
        <button disabled={busy || isSupabase} type="submit">Сохранить</button>
      </form>
    </div>
  );
}

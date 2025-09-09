import React, { useState } from 'react';
import { useRepo } from '../lib/repo/context';

export default function CreateVoting() {
  const repo = useRepo();
  const isSupabase = import.meta.env.VITE_BACKEND === 'supabase';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['Да','Нет','Воздержался']);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const onAddOption = () => setOptions([...options, '']);
  const onChangeOption = (i, v) => {
    const copy = options.slice(); copy[i] = v; setOptions(copy);
  };

  const onSubmit = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      const now = Date.now();
      const newPoll = {
        title, description,
        startAt: new Date(now).toISOString(),
        endAt: new Date(now + 7*24*60*60*1000).toISOString(),
        options: options.filter(Boolean)
      };
      await repo.createPoll(newPoll, ['house-1','house-2']);
      setTitle(''); setDescription(''); setOptions(['Да','Нет','Воздержался']);
      setMsg('Опрос создан');
    } catch (e2) {
      setMsg(e2?.message || 'Недоступно в режиме Supabase (пока только чтение)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Создать опрос</h2>
      {isSupabase && <div style={{color:'#b26b00'}}>Режим Supabase: создание опросов пока отключено (S-02A).</div>}
      <div>
        <label>Заголовок<br/>
          <input value={title} onChange={e=>setTitle(e.target.value)} required disabled={isSupabase}/>
        </label>
      </div>
      <div>
        <label>Описание<br/>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} disabled={isSupabase} />
        </label>
      </div>
      <div>
        <div>Варианты</div>
        {options.map((opt,i)=>(
          <div key={i}>
            <input value={opt} onChange={e=>onChangeOption(i, e.target.value)} disabled={isSupabase}/>
          </div>
        ))}
        <button type="button" onClick={onAddOption} disabled={isSupabase}>Добавить вариант</button>
      </div>
      <button disabled={busy || isSupabase} type="submit">Создать</button>
      {msg && <div style={{marginTop:8}}>{msg}</div>}
    </form>
  );
}

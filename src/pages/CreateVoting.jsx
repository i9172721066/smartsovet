import React, { useState } from 'react'
import { useRepo } from '../lib/repo/context'

export default function CreateVoting() {
  const repo = useRepo()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState([''])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await repo.createPoll(
        {
          title,
          description,
          options: options.filter(Boolean),
        },
        [] // voterHouseIds, если нужно
      )
      alert('Опрос создан в Supabase')
      setTitle('')
      setDescription('')
      setOptions([''])
    } catch (err) {
      console.error(err)
      alert('Ошибка создания опроса: ' + err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ваши поля */}
      {/* ... */}
      <button type="submit">Создать</button>
    </form>
  )
}

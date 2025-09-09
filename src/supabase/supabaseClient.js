// src/supabase/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)

// чтобы видеть его в DevTools:
window.supabase = supabase
console.log('[supabase] ready:', { url })

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types' // Importa los tipos

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verifica que las variables de entorno existen
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan las variables de entorno de Supabase')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌')
}

// Crea el cliente con tipado
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
)
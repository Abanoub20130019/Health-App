import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'vitality-app'
    }
  }
})

// Test connection
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('users').select('id').limit(1).maybeSingle()
    if (error) {
      console.error('❌ Supabase connection failed:', error.message, error.details)
      return false
    }
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}

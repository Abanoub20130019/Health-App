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
  },
  db: {
    schema: 'public'
  }
})

// Test connection - simplified to avoid recursion
let connectionTested = false
let connectionPromise: Promise<boolean> | null = null

export async function testSupabaseConnection(): Promise<boolean> {
  if (connectionTested && connectionPromise !== null) {
    return connectionPromise
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials missing, running in offline mode')
    connectionTested = true
    connectionPromise = Promise.resolve(false)
    return false
  }
  
  connectionPromise = (async () => {
    try {
      // Simple health check without querying tables
      const { error } = await supabase.auth.getSession()
      if (error && error.message.includes('network')) {
        console.warn('⚠️ Network error connecting to Supabase')
        return false
      }
      console.log('✅ Supabase connection successful')
      return true
    } catch (error) {
      console.warn('⚠️ Supabase connection failed:', error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  })()
  
  connectionTested = true
  return connectionPromise
}

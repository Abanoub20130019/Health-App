import { useEffect, useState, useCallback, useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase, testSupabaseConnection } from './lib/supabase'
import { userAPI } from './lib/api'
import { storage } from './utils/storage'
import type { User } from './types'

// Pages
import Dashboard from './pages/Dashboard'
import Fasting from './pages/Fasting'
import Avoidances from './pages/Avoidances'
import Walking from './pages/Walking'
import Exercise from './pages/Exercise'
import Hydration from './pages/Hydration'
import Sleep from './pages/Sleep'
import MindfulEating from './pages/MindfulEating'
import Progress from './pages/Progress'
import CheckIn from './pages/CheckIn'
import Profile from './pages/Profile'

// Components
import BottomNav from './components/BottomNav'
import Header from './components/Header'
import Onboarding from './components/Onboarding'
import PWAInstallPrompt from './components/PWAInstallPrompt'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [supabaseReady, setSupabaseReady] = useState(false)

  // Memoized auth state change handler to prevent recreating on every render
  const handleAuthStateChange = useCallback(async (event: string, session: { user?: { id: string; email?: string; user_metadata?: { name?: string } } } | null) => {
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        const userData = await userAPI.getOrCreate(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
        )
        setUser(userData)
        storage.setUser(userData)
        setShowOnboarding(false)
      } catch (error) {
        console.error('Failed to get user on auth change:', error)
      }
    } else if (event === 'SIGNED_OUT') {
      setUser(null)
      storage.clearUser()
      setShowOnboarding(true)
    }
  }, [])

  useEffect(() => {
    // Test Supabase connection
    const initSupabase = async () => {
      const isConnected = await testSupabaseConnection()
      setSupabaseReady(isConnected)
      
      if (!isConnected) {
        console.warn('Supabase not connected. Running in offline mode.')
      }
    }

    initSupabase()

    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        try {
          const userData = await userAPI.getOrCreate(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
          )
          setUser(userData)
        } catch (error) {
          console.error('Failed to get user:', error)
          // Use offline user
          const storedUser = storage.getUser()
          if (storedUser) {
            setUser(storedUser)
          } else {
            setShowOnboarding(true)
          }
        }
      } else {
        // Check for stored user (offline mode)
        const storedUser = storage.getUser()
        if (storedUser) {
          setUser(storedUser)
        } else {
          setShowOnboarding(true)
        }
      }
      
      setLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => subscription.unsubscribe()
  }, [handleAuthStateChange])

  // Memoized onboarding completion handler
  const handleOnboardingComplete = useCallback(async (name: string, email: string) => {
    try {
      // Try to create user in Supabase (with generated ID for offline mode)
      const tempId = 'offline-' + Date.now()
      const newUser = await userAPI.getOrCreate(tempId, email, name)
      setUser(newUser)
      storage.setUser(newUser)
      setShowOnboarding(false)
    } catch (error) {
      console.error('Failed to create user:', error)
      // Create local user for offline mode
      const localUser: User = {
        id: 'local-' + Date.now(),
        email,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setUser(localUser)
      storage.setUser(localUser)
      setShowOnboarding(false)
    }
  }, [])

  // Memoized routes to prevent recreation on every render
  const routes = useMemo(() => (
    <Routes>
      <Route path="/" element={<Dashboard userId={user?.id || ''} />} />
      <Route path="/fasting" element={<Fasting userId={user?.id || ''} />} />
      <Route path="/avoidances" element={<Avoidances userId={user?.id || ''} />} />
      <Route path="/walking" element={<Walking userId={user?.id || ''} />} />
      <Route path="/exercise" element={<Exercise userId={user?.id || ''} />} />
      <Route path="/hydration" element={<Hydration userId={user?.id || ''} />} />
      <Route path="/sleep" element={<Sleep userId={user?.id || ''} />} />
      <Route path="/mindful-eating" element={<MindfulEating userId={user?.id || ''} />} />
      <Route path="/progress" element={<Progress userId={user?.id || ''} />} />
      <Route path="/check-in" element={<CheckIn userId={user?.id || ''} />} />
      <Route path="/profile" element={<Profile user={user!} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  ), [user?.id])

  // Memoized loading screen
  const loadingScreen = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full mb-4 mx-auto animate-pulse-soft" 
             style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)' }} />
        <h1 className="text-display-sm font-display" style={{ color: 'var(--primary)' }}>Vitality</h1>
        <p className="mt-2 text-body-md" style={{ color: 'var(--on-surface-variant)' }}>Loading your wellness journey...</p>
        {!supabaseReady && (
          <p className="mt-2 text-label-sm" style={{ color: 'var(--outline)' }}>
            (Offline mode - Supabase not connected)
          </p>
        )}
      </div>
    </div>
  ), [supabaseReady])

  if (loading) {
    return loadingScreen
  }

  if (showOnboarding || !user) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--surface)' }}>
      <Header user={user} />
      
      <main className="px-4 pt-20 w-full">
        <div className="w-full max-w-md mx-auto">
          {routes}
        </div>
      </main>
      
      <BottomNav />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}

export default App

import { supabase } from './supabase'
import type { 
  FastingSession, 
  FastingStats,
  AvoidanceEntry,
  AvoidanceStats,
  WalkingEntry,
  WalkingStats,
  ExerciseSession,
  ExerciseStats,
  HydrationEntry,
  SleepEntry,
  SleepStats,
  MindfulEatingEntry,
  ProgressEntry,
  DailyCheckIn,
  User
} from '../types'

// ==================== AUTH ====================
export const authAPI = {
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    if (error) throw error
    return data
  },
  
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// ==================== USER ====================
export const userAPI = {
  getOrCreate: async (email: string, name: string): Promise<User> => {
    // Check if user exists
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
    
    if (existing) return existing as User
    
    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({ email, name })
      .select()
      .single()
    
    if (error) throw error
    return data as User
  },
  
  get: async (userId: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data as User
  },
  
  update: async (userId: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data as User
  }
}

// ==================== FASTING ====================
export const fastingAPI = {
  getActive: async (userId: string): Promise<FastingSession | null> => {
    const { data, error } = await supabase
      .from('fasting_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as FastingSession | null
  },
  
  getHistory: async (userId: string, limit = 30): Promise<FastingSession[]> => {
    const { data, error } = await supabase
      .from('fasting_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as FastingSession[]
  },
  
  start: async (data: { userId: string; windowType: string; targetHours: number }): Promise<FastingSession> => {
    const { data: result, error } = await supabase
      .from('fasting_sessions')
      .insert({
        user_id: data.userId,
        window_type: data.windowType,
        target_duration_hours: data.targetHours,
        start_time: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return result as FastingSession
  },
  
  end: async (fastingId: string, data: { hungerLevel?: number; energyLevel?: number; notes?: string }) => {
    // Get the session first
    const { data: session, error: fetchError } = await supabase
      .from('fasting_sessions')
      .select('*')
      .eq('id', fastingId)
      .single()
    
    if (fetchError) throw fetchError
    
    const startTime = new Date(session.start_time)
    const endTime = new Date()
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    const brokenEarly = durationHours < session.target_duration_hours
    
    const { data: result, error } = await supabase
      .from('fasting_sessions')
      .update({
        end_time: endTime.toISOString(),
        actual_duration_hours: parseFloat(durationHours.toFixed(2)),
        hunger_level: data.hungerLevel || null,
        energy_level: data.energyLevel || null,
        broken_early: brokenEarly,
        notes: data.notes || null,
      })
      .eq('id', fastingId)
      .select()
      .single()
    
    if (error) throw error
    return result
  },
  
  getStats: async (userId: string): Promise<FastingStats> => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { data, error } = await supabase
      .from('fasting_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', oneWeekAgo.toISOString())
      .not('end_time', 'is', null)
    
    if (error) throw error
    
    const sessions = data as FastingSession[]
    const completedFasts = sessions.filter(f => !f.broken_early)
    const consistency = sessions.length > 0 
      ? Math.round((completedFasts.length / sessions.length) * 100) 
      : 0
    
    return {
      weeklyConsistency: consistency,
      currentStreak: completedFasts.length,
      longestStreak: completedFasts.length,
      totalFastsCompleted: sessions.length,
      averageDuration: sessions.length > 0
        ? sessions.reduce((sum, f) => sum + (f.actual_duration_hours || 0), 0) / sessions.length
        : 0,
    }
  }
}

// ==================== AVOIDANCES ====================
export const avoidanceAPI = {
  getByDate: async (userId: string, date: string): Promise<AvoidanceEntry[]> => {
    const { data, error } = await supabase
      .from('avoidance_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
    
    if (error) throw error
    return data as AvoidanceEntry[]
  },
  
  toggle: async (data: { userId: string; date: string; type: string; avoided: boolean; customName?: string }) => {
    // Check if entry exists
    const { data: existing, error: fetchError } = await supabase
      .from('avoidance_entries')
      .select('*')
      .eq('user_id', data.userId)
      .eq('date', data.date)
      .eq('avoidance_type', data.type)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
    
    if (existing) {
      const { data: result, error } = await supabase
        .from('avoidance_entries')
        .update({ avoided: data.avoided })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return result
    } else {
      const { data: result, error } = await supabase
        .from('avoidance_entries')
        .insert({
          user_id: data.userId,
          date: data.date,
          avoidance_type: data.type,
          custom_name: data.customName || null,
          avoided: data.avoided,
        })
        .select()
        .single()
      
      if (error) throw error
      return result
    }
  },
  
  getStats: async (userId: string): Promise<AvoidanceStats[]> => {
    const types = ['processed_sugars', 'refined_carbs', 'ultra_processed_foods', 'seed_oils', 'alcohol', 'late_night_eating']
    const stats: AvoidanceStats[] = []
    
    for (const type of types) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: weekData, error: weekError } = await supabase
        .from('avoidance_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('avoidance_type', type)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      
      if (weekError) throw weekError
      
      const { data: monthData, error: monthError } = await supabase
        .from('avoidance_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('avoidance_type', type)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      
      if (monthError) throw monthError
      
      const weekSuccess = (weekData as AvoidanceEntry[]).filter(e => e.avoided).length
      const monthSuccess = (monthData as AvoidanceEntry[]).filter(e => e.avoided).length
      
      stats.push({
        type: type as any,
        customName: null,
        currentStreak: weekSuccess,
        longestStreak: weekSuccess,
        successRate7Days: weekData.length > 0 ? Math.round((weekSuccess / weekData.length) * 100) : 0,
        successRate30Days: monthData.length > 0 ? Math.round((monthSuccess / monthData.length) * 100) : 0,
      })
    }
    
    return stats
  }
}

// ==================== WALKING ====================
export const walkingAPI = {
  getByDate: async (userId: string, date: string): Promise<WalkingEntry | null> => {
    const { data, error } = await supabase
      .from('walking_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as WalkingEntry | null
  },
  
  update: async (data: { userId: string; date: string; [key: string]: unknown }): Promise<WalkingEntry> => {
    const { userId, date, ...updates } = data
    
    // Check if entry exists
    const { data: existing, error: fetchError } = await supabase
      .from('walking_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
    
    if (existing) {
      const { data: result, error } = await supabase
        .from('walking_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return result as WalkingEntry
    } else {
      const { data: result, error } = await supabase
        .from('walking_entries')
        .insert({
          user_id: userId,
          date: date,
          ...updates,
        })
        .select()
        .single()
      
      if (error) throw error
      return result as WalkingEntry
    }
  },
  
  getStats: async (userId: string): Promise<WalkingStats> => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data, error } = await supabase
      .from('walking_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    
    if (error) throw error
    
    const entries = data as WalkingEntry[]
    const totalSteps = entries.reduce((sum, d) => sum + (d.step_count || 0), 0)
    const avgSteps = entries.length > 0 ? Math.round(totalSteps / entries.length) : 0
    const totalDistance = entries.reduce((sum, d) => sum + (d.total_distance_km || 0), 0)
    
    const bestDay = entries.length > 0
      ? entries.reduce((max, d) => (d.step_count > max.step_count ? d : max), entries[0])
      : { date: new Date().toISOString().split('T')[0], step_count: 0 }
    
    return {
      dailyAverage: avgSteps,
      weeklyTotal: totalSteps,
      currentStreak: entries.filter(d => d.step_count >= 10000).length,
      bestDay: { date: bestDay.date, steps: bestDay.step_count || 0 },
      weeklyMileage: totalDistance,
    }
  }
}

// ==================== EXERCISE ====================
export const exerciseAPI = {
  getByDate: async (userId: string, date: string): Promise<ExerciseSession[]> => {
    const { data, error } = await supabase
      .from('exercise_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as ExerciseSession[]
  },
  
  add: async (data: { userId: string; [key: string]: unknown }): Promise<ExerciseSession> => {
    const { userId, ...sessionData } = data
    
    const { data: result, error } = await supabase
      .from('exercise_sessions')
      .insert({
        user_id: userId,
        ...sessionData,
      })
      .select()
      .single()
    
    if (error) throw error
    return result as ExerciseSession
  },
  
  delete: async (sessionId: string) => {
    const { error } = await supabase
      .from('exercise_sessions')
      .delete()
      .eq('id', sessionId)
    
    if (error) throw error
  },
  
  getStats: async (userId: string): Promise<ExerciseStats> => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data, error } = await supabase
      .from('exercise_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    
    if (error) throw error
    
    const sessions = data as ExerciseSession[]
    
    const byType = {
      resistance_training: { count: 0, minutes: 0 },
      cardio: { count: 0, minutes: 0 },
      flexibility_mobility: { count: 0, minutes: 0 },
      active_recovery: { count: 0, minutes: 0 },
    }
    
    sessions.forEach(session => {
      if (byType[session.exercise_type]) {
        byType[session.exercise_type].count++
        byType[session.exercise_type].minutes += session.duration_minutes
      }
    })
    
    return {
      weeklySessions: sessions.length,
      totalMinutesWeek: sessions.reduce((sum, s) => sum + s.duration_minutes, 0),
      byType,
      currentStreak: sessions.length,
    }
  }
}

// ==================== HYDRATION ====================
export const hydrationAPI = {
  getByDate: async (userId: string, date: string): Promise<HydrationEntry | null> => {
    const { data, error } = await supabase
      .from('hydration_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as HydrationEntry | null
  },
  
  addEntry: async (data: { userId: string; date: string; amount: number; type: string; time: string }) => {
    // Get or create entry
    const { data: existing, error: fetchError } = await supabase
      .from('hydration_entries')
      .select('*')
      .eq('user_id', data.userId)
      .eq('date', data.date)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
    
    const entry = { time: data.time, amount_ml: data.amount, type: data.type }
    
    if (existing) {
      const currentEntries = existing.entries || []
      const newEntries = [...currentEntries, entry]
      const newTotal = newEntries.reduce((sum: number, e: any) => sum + e.amount_ml, 0)
      
      const { data: result, error } = await supabase
        .from('hydration_entries')
        .update({
          total_ml: newTotal,
          entries: newEntries,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return result
    } else {
      const { data: result, error } = await supabase
        .from('hydration_entries')
        .insert({
          user_id: data.userId,
          date: data.date,
          total_ml: data.amount,
          entries: [entry],
        })
        .select()
        .single()
      
      if (error) throw error
      return result
    }
  },
  
  update: async (data: { userId: string; date: string; [key: string]: unknown }) => {
    const { userId, date, ...updates } = data
    
    const { data: existing, error: fetchError } = await supabase
      .from('hydration_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
    
    if (existing) {
      const { data: result, error } = await supabase
        .from('hydration_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return result
    } else {
      const { data: result, error } = await supabase
        .from('hydration_entries')
        .insert({ user_id: userId, date: date, ...updates })
        .select()
        .single()
      
      if (error) throw error
      return result
    }
  }
}

// ==================== SLEEP ====================
export const sleepAPI = {
  getByDate: async (userId: string, date: string): Promise<SleepEntry | null> => {
    const { data, error } = await supabase
      .from('sleep_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as SleepEntry | null
  },
  
  add: async (data: { userId: string; [key: string]: unknown }): Promise<SleepEntry> => {
    const { userId, ...sleepData } = data
    
    // Check if entry exists for this date
    const { data: existing, error: fetchError } = await supabase
      .from('sleep_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', sleepData.date)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
    
    if (existing) {
      const { data: result, error } = await supabase
        .from('sleep_entries')
        .update({ ...sleepData, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return result as SleepEntry
    } else {
      const { data: result, error } = await supabase
        .from('sleep_entries')
        .insert({ user_id: userId, ...sleepData })
        .select()
        .single()
      
      if (error) throw error
      return result as SleepEntry
    }
  },
  
  getStats: async (userId: string): Promise<SleepStats> => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data, error } = await supabase
      .from('sleep_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    
    if (error) throw error
    
    const entries = data as SleepEntry[]
    const avgDuration = entries.length > 0
      ? entries.reduce((sum, d) => sum + (d.duration_hours || 0), 0) / entries.length
      : 0
    
    const avgQuality = entries.length > 0
      ? entries.reduce((sum, d) => sum + (d.sleep_quality || 0), 0) / entries.length
      : 0
    
    return {
      averageDuration: avgDuration,
      averageQuality: avgQuality,
      consistencyScore: entries.length > 0 ? Math.min((entries.length / 7) * 100, 100) : 0,
      currentStreak: entries.length,
    }
  }
}

// ==================== MINDFUL EATING ====================
export const mindfulEatingAPI = {
  getByDate: async (userId: string, date: string): Promise<MindfulEatingEntry | null> => {
    const { data, error } = await supabase
      .from('mindful_eating_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as MindfulEatingEntry | null
  },
  
  update: async (data: { userId: string; date: string; [key: string]: unknown }) => {
    const { userId, date, ...updates } = data
    
    const { data: existing, error: fetchError } = await supabase
      .from('mindful_eating_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
    
    if (existing) {
      const { data: result, error } = await supabase
        .from('mindful_eating_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return result
    } else {
      const { data: result, error } = await supabase
        .from('mindful_eating_entries')
        .insert({ user_id: userId, date: date, ...updates })
        .select()
        .single()
      
      if (error) throw error
      return result
    }
  }
}

// ==================== PROGRESS ====================
export const progressAPI = {
  getByDate: async (userId: string, date: string): Promise<ProgressEntry | null> => {
    const { data, error } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as ProgressEntry | null
  },
  
  update: async (data: { userId: string; date: string; [key: string]: unknown }) => {
    const { userId, date, ...updates } = data
    
    const { data: existing, error: fetchError } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
    
    if (existing) {
      const { data: result, error } = await supabase
        .from('progress_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return result
    } else {
      const { data: result, error } = await supabase
        .from('progress_entries')
        .insert({ user_id: userId, date: date, ...updates })
        .select()
        .single()
      
      if (error) throw error
      return result
    }
  },
  
  getHistory: async (userId: string, limit = 90): Promise<ProgressEntry[]> => {
    const { data, error } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as ProgressEntry[]
  }
}

// ==================== CHECK-IN ====================
export const checkInAPI = {
  getByDate: async (userId: string, date: string): Promise<DailyCheckIn | null> => {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as DailyCheckIn | null
  },
  
  save: async (data: { userId: string; date: string; [key: string]: unknown }) => {
    const { userId, date, ...checkInData } = data
    
    const { data: existing, error: fetchError } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
    
    if (existing) {
      const { data: result, error } = await supabase
        .from('daily_checkins')
        .update({ ...checkInData, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return result
    } else {
      const { data: result, error } = await supabase
        .from('daily_checkins')
        .insert({ user_id: userId, date: date, ...checkInData })
        .select()
        .single()
      
      if (error) throw error
      return result
    }
  }
}

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  getDailySummary: async (userId: string, date: string) => {
    // Fetch all daily data
    const [fasting, avoidances, walking, exercise, hydration, sleep, mindful, progress] = await Promise.all([
      supabase.from('fasting_sessions').select('*').eq('user_id', userId).eq('start_time::date', date).limit(1).single().catch(() => ({ data: null })),
      supabase.from('avoidance_entries').select('*').eq('user_id', userId).eq('date', date),
      supabase.from('walking_entries').select('*').eq('user_id', userId).eq('date', date).single().catch(() => ({ data: null })),
      supabase.from('exercise_sessions').select('*').eq('user_id', userId).eq('date', date),
      supabase.from('hydration_entries').select('*').eq('user_id', userId).eq('date', date).single().catch(() => ({ data: null })),
      supabase.from('sleep_entries').select('*').eq('user_id', userId).eq('date', date).single().catch(() => ({ data: null })),
      supabase.from('mindful_eating_entries').select('*').eq('user_id', userId).eq('date', date).single().catch(() => ({ data: null })),
      supabase.from('progress_entries').select('*').eq('user_id', userId).eq('date', date).single().catch(() => ({ data: null })),
    ])
    
    // Calculate score
    let score = 0
    
    // Fasting (15%)
    const fastingActive = fasting.data && !fasting.data.end_time
    if (fastingActive || (fasting.data && !fasting.data.broken_early)) score += 15
    
    // Avoidances (15%)
    const avoidancesCompleted = (avoidances.data || []).filter((a: AvoidanceEntry) => a.avoided).length
    const avoidancesScore = avoidances.data?.length > 0 ? (avoidancesCompleted / avoidances.data.length) * 15 : 0
    score += avoidancesScore
    
    // Steps (15%)
    const steps = walking.data?.step_count || 0
    const stepsScore = Math.min((steps / 10000) * 15, 15)
    score += stepsScore
    
    // Exercise (10%)
    if (exercise.data?.length > 0) score += 10
    
    // Hydration (15%)
    const hydrationAmount = hydration.data?.total_ml || 0
    const hydrationScore = Math.min((hydrationAmount / 2500) * 15, 15)
    score += hydrationScore
    
    // Sleep (15%)
    const sleepHours = sleep.data?.duration_hours || 0
    const sleepScore = sleepHours >= 7 ? 15 : Math.min((sleepHours / 7) * 15, 15)
    score += sleepScore
    
    // Mindful Eating (15%)
    const mindfulScore = mindful.data ? Math.min(
      ((mindful.data.protein_prioritized_meals || 0) / (mindful.data.meals_count || 1)) * 5 +
      Math.min((mindful.data.vegetable_servings || 0) / 5, 1) * 5 +
      ((mindful.data.distraction_free_meals || 0) / (mindful.data.meals_count || 1)) * 5,
      15
    ) : 0
    score += mindfulScore
    
    return {
      date,
      fastingActive: fastingActive || false,
      fastingProgress: fasting.data ? (fasting.data.actual_duration_hours || 0) / fasting.data.target_duration_hours * 100 : null,
      avoidancesCompleted,
      avoidancesTotal: avoidances.data?.length || 7,
      steps,
      exerciseMinutes: exercise.data?.reduce((sum: number, e: ExerciseSession) => sum + e.duration_minutes, 0) || 0,
      hydrationPercent: Math.round((hydrationAmount / 2500) * 100),
      sleepHours,
      mindfulEatingScore: Math.round(mindfulScore),
      energyLevel: progress.data?.energy_level || null,
      overallScore: Math.round(score),
    }
  }
}

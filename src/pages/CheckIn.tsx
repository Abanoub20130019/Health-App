import { useEffect, useState, useCallback } from 'react'
import { 
  CheckCircle2, 
  Calendar, 
  Target,
  Sparkles,
  ChevronRight,
  Trophy,
  TrendingUp
} from 'lucide-react'
import { checkInAPI, dashboardAPI } from '../lib/api'
import { getToday, formatDisplayDate, getCurrentMonth } from '../utils/date'
import type { DailyCheckIn, WeeklyReflection, MonthlyGoal } from '../types'

interface CheckInProps {
  userId: string
}

export default function CheckIn({ userId }: CheckInProps) {
  const [checkIn, setCheckIn] = useState<DailyCheckIn | null>(null)
  const [weeklyReflection, setWeeklyReflection] = useState<WeeklyReflection | null>(null)
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal | null>(null)
  const [dailySummary, setDailySummary] = useState<{ overallScore: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // Form states
  const [completedHabits, setCompletedHabits] = useState<string[]>([])
  const [missedHabits, setMissedHabits] = useState<string[]>([])
  const [reflectionNotes, setReflectionNotes] = useState('')
  const [tomorrowIntentions, setTomorrowIntentions] = useState('')
  const [whatWorked, setWhatWorked] = useState('')
  const [whatDidnt, setWhatDidnt] = useState('')
  const [adjustments, setAdjustments] = useState('')
  const [wins, setWins] = useState<string[]>([])

  const habitOptions = [
    'Intermittent Fasting',
    'Avoided Processed Sugars',
    'Avoided Refined Carbs',
    'Walked 10,000+ Steps',
    'Morning Exercise',
    'Hydration Goal',
    'Quality Sleep',
    'Mindful Eating',
    'Protein Priority',
    'Vegetable Servings',
  ]

  const loadData = useCallback(async () => {
    try {
      const [checkInData, weeklyData, goalsData, summaryData] = await Promise.all([
        checkInAPI.getByDate(userId, getToday()),
        checkInAPI.getWeekly(userId, getToday()),
        checkInAPI.getMonthlyGoals(userId, getCurrentMonth()),
        dashboardAPI.getDailySummary(userId, getToday()),
      ])
      
      setCheckIn(checkInData)
      setWeeklyReflection(weeklyData)
      setMonthlyGoals(goalsData)
      setDailySummary(summaryData)
      
      // Initialize form states
      if (checkInData) {
        setCompletedHabits(checkInData.completed_habits || [])
        setMissedHabits(checkInData.missed_habits || [])
        setReflectionNotes(checkInData.reflection_notes || '')
        setTomorrowIntentions(checkInData.tomorrow_intentions || '')
      }
      
      if (weeklyData) {
        setWhatWorked(weeklyData.what_worked || '')
        setWhatDidnt(weeklyData.what_didnt || '')
        setAdjustments(weeklyData.adjustments_for_next || '')
        setWins(weeklyData.wins || [])
      }
    } catch (error) {
      console.error('Failed to load check-in data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveDailyCheckIn = async () => {
    try {
      await checkInAPI.save({
        userId,
        date: getToday(),
        completedHabits,
        missedHabits,
        reflectionNotes,
        tomorrowIntentions,
      })
      loadData()
    } catch (error) {
      console.error('Failed to save check-in:', error)
    }
  }

  const toggleHabit = (habit: string, completed: boolean) => {
    if (completed) {
      setCompletedHabits(prev => [...prev.filter(h => h !== habit), habit])
      setMissedHabits(prev => prev.filter(h => h !== habit))
    } else {
      setMissedHabits(prev => [...prev.filter(h => h !== habit), habit])
      setCompletedHabits(prev => prev.filter(h => h !== habit))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full animate-pulse" 
             style={{ backgroundColor: 'var(--primary-container)' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 
          className="font-display font-bold text-display-sm"
          style={{ color: 'var(--on-surface)' }}
        >
          Accountability & Reflection
        </h1>
        <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
          Track your journey and celebrate wins
        </p>
      </div>

      {/* Daily Score Card */}
      <div 
        className="card-elevated"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-lg mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Today&apos;s Vitality Score
            </p>
            <p 
              className="font-display font-bold text-display-sm"
              style={{ color: 'white' }}
            >
              {dailySummary?.overallScore || 0}%
            </p>
            <p className="text-body-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {formatDisplayDate(getToday())}
            </p>
          </div>
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Trophy size={40} color="white" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div 
        className="flex p-1 rounded-xl"
        style={{ backgroundColor: 'var(--surface-container-low)' }}
      >
        {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-label-sm font-medium capitalize transition-all"
            style={{
              backgroundColor: activeTab === tab ? 'var(--surface-container-lowest)' : 'transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--on-surface-variant)',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Daily Check-In */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Habits Checklist */}
          <div>
            <h2 
              className="font-display font-semibold text-title-lg mb-4"
              style={{ color: 'var(--on-surface)' }}
            >
              Today&apos;s Habits
            </h2>
            <div className="space-y-2">
              {habitOptions.map((habit) => {
                const isCompleted = completedHabits.includes(habit)
                const isMissed = missedHabits.includes(habit)
                
                return (
                  <button
                    key={habit}
                    onClick={() => toggleHabit(habit, !isCompleted)}
                    className="card w-full flex items-center gap-4 transition-all"
                    style={{
                      backgroundColor: isCompleted 
                        ? 'var(--primary-fixed)' 
                        : isMissed 
                          ? 'var(--error-container)'
                          : 'var(--surface-container-lowest)',
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: isCompleted 
                          ? 'var(--primary)' 
                          : isMissed 
                            ? 'var(--error)'
                            : 'var(--surface-container-high)',
                      }}
                    >
                      <CheckCircle2 
                        size={20} 
                        color={isCompleted || isMissed ? 'white' : 'var(--outline)'} 
                      />
                    </div>
                    <span 
                      className="flex-1 text-left font-medium"
                      style={{ 
                        color: isCompleted 
                          ? 'var(--on-primary-container)' 
                          : isMissed 
                            ? 'var(--on-error-container)'
                            : 'var(--on-surface)',
                      }}
                    >
                      {habit}
                    </span>
                    {isCompleted && <span className="text-label-sm" style={{ color: 'var(--primary)' }}>Done</span>}
                    {isMissed && <span className="text-label-sm" style={{ color: 'var(--error)' }}>Missed</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reflection */}
          <div>
            <h2 
              className="font-display font-semibold text-title-lg mb-4"
              style={{ color: 'var(--on-surface)' }}
            >
              Daily Reflection
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-label-md mb-2" style={{ color: 'var(--on-surface-variant)' }}>
                  What went well today?
                </label>
                <textarea
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="Reflect on your day..."
                  className="input-field w-full h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-label-md mb-2" style={{ color: 'var(--on-surface-variant)' }}>
                  Intentions for tomorrow
                </label>
                <textarea
                  value={tomorrowIntentions}
                  onChange={(e) => setTomorrowIntentions(e.target.value)}
                  placeholder="What will you focus on tomorrow?"
                  className="input-field w-full h-24 resize-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveDailyCheckIn}
            className="btn-primary w-full"
          >
            Save Daily Check-In
          </button>
        </div>
      )}

      {/* Weekly Reflection */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <h2 
              className="font-display font-semibold text-title-lg mb-4"
              style={{ color: 'var(--on-surface)' }}
            >
              Weekly Review
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-label-md mb-2" style={{ color: 'var(--on-surface-variant)' }}>
                  What worked this week?
                </label>
                <textarea
                  value={whatWorked}
                  onChange={(e) => setWhatWorked(e.target.value)}
                  placeholder="Celebrate your wins..."
                  className="input-field w-full h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-label-md mb-2" style={{ color: 'var(--on-surface-variant)' }}>
                  What didn&apos;t work?
                </label>
                <textarea
                  value={whatDidnt}
                  onChange={(e) => setWhatDidnt(e.target.value)}
                  placeholder="Identify challenges..."
                  className="input-field w-full h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-label-md mb-2" style={{ color: 'var(--on-surface-variant)' }}>
                  Adjustments for next week
                </label>
                <textarea
                  value={adjustments}
                  onChange={(e) => setAdjustments(e.target.value)}
                  placeholder="How will you improve?"
                  className="input-field w-full h-24 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Weekly Wins */}
          <div>
            <h3 
              className="font-semibold text-title-md mb-3"
              style={{ color: 'var(--on-surface)' }}
            >
              🏆 Weekly Wins
            </h3>
            <div className="space-y-2">
              {wins.length === 0 ? (
                <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                  No wins recorded yet this week
                </p>
              ) : (
                wins.map((win, idx) => (
                  <div
                    key={idx}
                    className="card flex items-center gap-3"
                    style={{ backgroundColor: 'var(--primary-fixed)' }}
                  >
                    <Trophy size={20} style={{ color: 'var(--primary)' }} />
                    <span style={{ color: 'var(--on-primary-container)' }}>{win}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Goals */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--tertiary-fixed)' }}
              >
                <Target size={24} style={{ color: 'var(--tertiary)' }} />
              </div>
              <div>
                <h2 
                  className="font-display font-semibold text-title-lg"
                  style={{ color: 'var(--on-surface)' }}
                >
                  {getCurrentMonth()} Goals
                </h2>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Set and track monthly targets
                </p>
              </div>
            </div>

            {monthlyGoals?.goals && monthlyGoals.goals.length > 0 ? (
              <div className="space-y-3">
                {monthlyGoals.goals.map((goal: { id: string; category: string; description: string; target: number; current: number; unit: string; completed: boolean }) => (
                  <div
                    key={goal.id}
                    className="card"
                    style={{ backgroundColor: 'var(--surface-container-lowest)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-label-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>
                        {goal.category}
                      </span>
                      <span 
                        className="text-label-sm font-semibold"
                        style={{ color: goal.completed ? 'var(--success)' : 'var(--primary)' }}
                      >
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                    </div>
                    <p className="text-body-md mb-3" style={{ color: 'var(--on-surface)' }}>
                      {goal.description}
                    </p>
                    <div 
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--surface-container-high)' }}
                    >
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                          backgroundColor: goal.completed ? 'var(--success)' : 'var(--primary)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles size={48} className="mx-auto mb-4" style={{ color: 'var(--outline)' }} />
                <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                  No goals set for this month yet
                </p>
                <button className="btn-primary mt-4">
                  Add Monthly Goals
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { 
  CheckCircle2, 
  Target,
  Sparkles,
  Trophy
} from 'lucide-react'
import { checkInAPI, dashboardAPI } from '../lib/api'
import { getToday, formatDisplayDate, getCurrentMonth } from '../utils/date'
import type { DailyCheckIn, WeeklyReflection, MonthlyGoal } from '../types'

interface CheckInProps {
  userId: string
}

const HABIT_OPTIONS = [
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
] as const

const TABS = ['daily', 'weekly', 'monthly'] as const

// Memoized habit row component
const HabitRow = memo(({
  habit,
  isCompleted,
  isMissed,
  onToggle,
}: {
  habit: string
  isCompleted: boolean
  isMissed: boolean
  onToggle: (habit: string, completed: boolean) => void
}) => {
  const handleClick = useCallback(() => {
    onToggle(habit, !isCompleted)
  }, [onToggle, habit, isCompleted])

  return (
    <button
      onClick={handleClick}
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
})

HabitRow.displayName = 'HabitRow'

// Memoized tab button
const TabButton = memo(({
  tab,
  isActive,
  onClick,
}: {
  tab: typeof TABS[number]
  isActive: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className="flex-1 py-2 rounded-lg text-label-sm font-medium capitalize transition-all"
    style={{
      backgroundColor: isActive ? 'var(--surface-container-lowest)' : 'transparent',
      color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
    }}
  >
    {tab}
  </button>
))

TabButton.displayName = 'TabButton'

export default function CheckIn({ userId }: CheckInProps) {
  const [, setCheckIn] = useState<DailyCheckIn | null>(null)
  const [, setWeeklyReflection] = useState<WeeklyReflection | null>(null)
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal | null>(null)
  const [dailySummary, setDailySummary] = useState<{ overallScore: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('daily')

  // Form states
  const [completedHabits, setCompletedHabits] = useState<string[]>([])
  const [missedHabits, setMissedHabits] = useState<string[]>([])
  const [reflectionNotes, setReflectionNotes] = useState('')
  const [tomorrowIntentions, setTomorrowIntentions] = useState('')
  const [whatWorked, setWhatWorked] = useState('')
  const [whatDidnt, setWhatDidnt] = useState('')
  const [adjustments, setAdjustments] = useState('')
  const [wins, setWins] = useState<string[]>([])

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

  const saveDailyCheckIn = useCallback(async () => {
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
  }, [userId, completedHabits, missedHabits, reflectionNotes, tomorrowIntentions, loadData])

  const toggleHabit = useCallback((habit: string, completed: boolean) => {
    if (completed) {
      setCompletedHabits(prev => [...prev.filter(h => h !== habit), habit])
      setMissedHabits(prev => prev.filter(h => h !== habit))
    } else {
      setMissedHabits(prev => [...prev.filter(h => h !== habit), habit])
      setCompletedHabits(prev => prev.filter(h => h !== habit))
    }
  }, [])

  // Memoized computed values
  const overallScore = useMemo(() => dailySummary?.overallScore || 0, [dailySummary])
  const displayDate = useMemo(() => formatDisplayDate(getToday()), [])
  const currentMonth = useMemo(() => getCurrentMonth(), [])

  // Memoized habit rows data
  const habitRowsData = useMemo(() => {
    return HABIT_OPTIONS.map(habit => ({
      habit,
      isCompleted: completedHabits.includes(habit),
      isMissed: missedHabits.includes(habit),
    }))
  }, [completedHabits, missedHabits])

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
              {overallScore}%
            </p>
            <p className="text-body-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {displayDate}
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
        {TABS.map((tab) => (
          <TabButton
            key={tab}
            tab={tab}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
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
              {habitRowsData.map(({ habit, isCompleted, isMissed }) => (
                <HabitRow
                  key={habit}
                  habit={habit}
                  isCompleted={isCompleted}
                  isMissed={isMissed}
                  onToggle={toggleHabit}
                />
              ))}
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
        <WeeklyReflectionTab
          whatWorked={whatWorked}
          setWhatWorked={setWhatWorked}
          whatDidnt={whatDidnt}
          setWhatDidnt={setWhatDidnt}
          adjustments={adjustments}
          setAdjustments={setAdjustments}
          wins={wins}
        />
      )}

      {/* Monthly Goals */}
      {activeTab === 'monthly' && (
        <MonthlyGoalsTab
          currentMonth={currentMonth}
          monthlyGoals={monthlyGoals}
        />
      )}
    </div>
  )
}

// Extracted weekly reflection tab component
interface WeeklyReflectionTabProps {
  whatWorked: string
  setWhatWorked: (value: string) => void
  whatDidnt: string
  setWhatDidnt: (value: string) => void
  adjustments: string
  setAdjustments: (value: string) => void
  wins: string[]
}

const WeeklyReflectionTab = memo(({
  whatWorked,
  setWhatWorked,
  whatDidnt,
  setWhatDidnt,
  adjustments,
  setAdjustments,
  wins,
}: WeeklyReflectionTabProps) => (
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
))

WeeklyReflectionTab.displayName = 'WeeklyReflectionTab'

// Extracted monthly goals tab component
interface MonthlyGoalsTabProps {
  currentMonth: string
  monthlyGoals: MonthlyGoal | null
}

const MonthlyGoalsTab = memo(({
  currentMonth,
  monthlyGoals,
}: MonthlyGoalsTabProps) => (
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
            {currentMonth} Goals
          </h2>
          <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Set and track monthly targets
          </p>
        </div>
      </div>

      {monthlyGoals?.goals && monthlyGoals.goals.length > 0 ? (
        <div className="space-y-3">
          {monthlyGoals.goals.map((goal: { id: string; category: string; description: string; target: number; current: number; unit: string; completed: boolean }) => (
            <GoalCard key={goal.id} goal={goal} />
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
))

MonthlyGoalsTab.displayName = 'MonthlyGoalsTab'

// Memoized goal card component
interface Goal {
  id: string
  category: string
  description: string
  target: number
  current: number
  unit: string
  completed: boolean
}

const GoalCard = memo(({ goal }: { goal: Goal }) => {
  const progress = Math.min((goal.current / goal.target) * 100, 100)
  
  return (
    <div
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
            width: `${progress}%`,
            backgroundColor: goal.completed ? 'var(--success)' : 'var(--primary)'
          }}
        />
      </div>
    </div>
  )
})

GoalCard.displayName = 'GoalCard'

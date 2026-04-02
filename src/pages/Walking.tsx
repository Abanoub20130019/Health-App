import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { 
  Footprints, 
  Plus, 
  Minus, 
  Sunrise, 
  Sunset, 
  Briefcase, 
  Coffee,
  Trophy,
  TrendingUp,
  MapPin
} from 'lucide-react'
import { walkingAPI } from '../lib/api'
import { getToday, formatDisplayDate } from '../utils/date'
import CircularProgress from '../components/CircularProgress'
import type { WalkingEntry, WalkingStats } from '../types'

interface WalkingProps {
  userId: string
}

const STEP_GOAL = 10000

// Memoized stat card component
const StatCard = memo(({
  icon: Icon,
  iconColor,
  label,
  value,
  subLabel,
}: {
  icon: typeof Trophy
  iconColor: string
  label: string
  value: string
  subLabel: string
}) => (
  <div 
    className="card"
    style={{ backgroundColor: 'var(--surface-container-low)' }}
  >
    <div className="flex items-center gap-2 mb-2">
      <Icon size={18} style={{ color: iconColor }} />
      <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
        {label}
      </span>
    </div>
    <p 
      className="font-display font-bold text-headline-sm"
      style={{ color: 'var(--on-surface)' }}
    >
      {value}
    </p>
    <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
      {subLabel}
    </p>
  </div>
))

StatCard.displayName = 'StatCard'

// Memoized walk input card
const WalkInputCard = memo(({
  icon: Icon,
  iconColor,
  bgColor,
  title,
  minutesValue,
  distanceValue,
  onMinutesChange,
  onDistanceChange,
}: {
  icon: typeof Sunrise
  iconColor: string
  bgColor: string
  title: string
  minutesValue: number | null | undefined
  distanceValue: number | null | undefined
  onMinutesChange: (value: number) => void
  onDistanceChange: (value: number) => void
}) => (
  <div 
    className="card"
    style={{ backgroundColor: 'var(--surface-container-lowest)' }}
  >
    <div className="flex items-center gap-4">
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Icon size={28} style={{ color: iconColor }} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
          {title}
        </p>
        <div className="flex gap-4 mt-2">
          <input
            type="number"
            placeholder="Minutes"
            value={minutesValue || ''}
            onChange={(e) => onMinutesChange(parseInt(e.target.value) || 0)}
            className="input-field w-24 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="km"
            step="0.1"
            value={distanceValue || ''}
            onChange={(e) => onDistanceChange(parseFloat(e.target.value) || 0)}
            className="input-field w-20 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  </div>
))

WalkInputCard.displayName = 'WalkInputCard'

export default function Walking({ userId }: WalkingProps) {
  const [entry, setEntry] = useState<WalkingEntry | null>(null)
  const [stats, setStats] = useState<WalkingStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [entryData, statsData] = await Promise.all([
        walkingAPI.getByDate(userId, getToday()),
        walkingAPI.getStats(userId),
      ])
      setEntry(entryData || {
        id: '',
        user_id: userId,
        date: getToday(),
        step_count: 0,
        morning_walk_minutes: null,
        morning_walk_distance_km: null,
        evening_walk_minutes: null,
        evening_walk_distance_km: null,
        walking_meeting: false,
        active_commute_minutes: null,
        post_meal_walks: 0,
        total_distance_km: 0,
        created_at: '',
        updated_at: '',
      })
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load walking data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateEntry = useCallback(async (updates: Partial<WalkingEntry>) => {
    try {
      await walkingAPI.update({
        userId,
        date: getToday(),
        ...updates,
      })
      loadData()
    } catch (error) {
      console.error('Failed to update walking entry:', error)
    }
  }, [userId, loadData])

  const adjustSteps = useCallback((delta: number) => {
    const newSteps = Math.max(0, (entry?.step_count || 0) + delta)
    updateEntry({ step_count: newSteps })
  }, [entry?.step_count, updateEntry])

  const toggleWalkingMeeting = useCallback(() => {
    updateEntry({ walking_meeting: !entry?.walking_meeting })
  }, [entry?.walking_meeting, updateEntry])

  const adjustPostMealWalks = useCallback((delta: number) => {
    const newCount = Math.max(0, (entry?.post_meal_walks || 0) + delta)
    updateEntry({ post_meal_walks: newCount })
  }, [entry?.post_meal_walks, updateEntry])

  // Memoized progress calculation
  const progress = useMemo(() => 
    Math.min(((entry?.step_count || 0) / STEP_GOAL) * 100, 100),
    [entry?.step_count]
  )

  // Memoized display values
  const displayDate = useMemo(() => formatDisplayDate(getToday()), [])
  const stepCount = entry?.step_count || 0
  const formattedStepCount = useMemo(() => 
    stepCount.toLocaleString(),
    [stepCount]
  )

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
          Movement & Walking
        </h1>
        <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
          {displayDate}
        </p>
      </div>

      {/* Step Counter Card */}
      <div 
        className="card-elevated text-center py-8"
        style={{ backgroundColor: 'var(--surface-container-low)' }}
      >
        <div className="flex justify-center mb-6">
          <CircularProgress 
            progress={progress} 
            size={180} 
            strokeWidth={14}
            showPercentage={false}
          />
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={() => adjustSteps(-500)}
            className="w-14 h-14 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{ backgroundColor: 'var(--surface-container-high)' }}
          >
            <Minus size={24} style={{ color: 'var(--on-surface)' }} />
          </button>
          
          <div className="text-center">
            <p 
              className="font-display font-bold text-display-md"
              style={{ color: 'var(--on-surface)' }}
            >
              {formattedStepCount}
            </p>
            <p className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>
              of {STEP_GOAL.toLocaleString()} steps
            </p>
          </div>
          
          <button
            onClick={() => adjustSteps(500)}
            className="w-14 h-14 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{ backgroundColor: 'var(--primary-fixed)' }}
          >
            <Plus size={24} style={{ color: 'var(--primary)' }} />
          </button>
        </div>

        {/* Quick add buttons */}
        <div className="flex justify-center gap-2">
          {[500, 1000, 2000].map((amount) => (
            <button
              key={amount}
              onClick={() => adjustSteps(amount)}
              className="px-4 py-2 rounded-lg text-label-sm font-medium transition-all"
              style={{ backgroundColor: 'var(--surface-container-high)' }}
            >
              +{amount}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon={Trophy}
            iconColor="var(--tertiary)"
            label="Best Day"
            value={stats.bestDay.steps.toLocaleString()}
            subLabel={formatDisplayDate(stats.bestDay.date)}
          />
          <StatCard 
            icon={TrendingUp}
            iconColor="var(--primary)"
            label="Weekly Miles"
            value={`${stats.weeklyMileage.toFixed(1)} mi`}
            subLabel="Keep moving!"
          />
        </div>
      )}

      {/* Walk Types */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Walk Details
        </h2>
        
        <div className="space-y-3">
          <WalkInputCard
            icon={Sunrise}
            iconColor="#e65100"
            bgColor="#fff3e0"
            title="Morning Walk"
            minutesValue={entry?.morning_walk_minutes}
            distanceValue={entry?.morning_walk_distance_km}
            onMinutesChange={(v) => updateEntry({ morning_walk_minutes: v })}
            onDistanceChange={(v) => updateEntry({ morning_walk_distance_km: v })}
          />

          <WalkInputCard
            icon={Sunset}
            iconColor="#1565c0"
            bgColor="#e3f2fd"
            title="Evening Walk"
            minutesValue={entry?.evening_walk_minutes}
            distanceValue={entry?.evening_walk_distance_km}
            onMinutesChange={(v) => updateEntry({ evening_walk_minutes: v })}
            onDistanceChange={(v) => updateEntry({ evening_walk_distance_km: v })}
          />

          {/* Walking Meeting */}
          <WalkingMeetingCard
            isCompleted={entry?.walking_meeting}
            onToggle={toggleWalkingMeeting}
          />

          {/* Post-Meal Walks */}
          <PostMealWalksCard
            count={entry?.post_meal_walks || 0}
            onDecrement={() => adjustPostMealWalks(-1)}
            onIncrement={() => adjustPostMealWalks(1)}
          />

          {/* Active Commute */}
          <ActiveCommuteCard
            value={entry?.active_commute_minutes}
            onChange={(v) => updateEntry({ active_commute_minutes: v })}
          />
        </div>
      </div>
    </div>
  )
}

// Extracted walking meeting card component
interface WalkingMeetingCardProps {
  isCompleted: boolean | undefined
  onToggle: () => void
}

const WalkingMeetingCard = memo(({
  isCompleted,
  onToggle,
}: WalkingMeetingCardProps) => (
  <button
    onClick={onToggle}
    className="card w-full text-left transition-all"
    style={{ 
      backgroundColor: isCompleted 
        ? 'var(--primary-fixed)' 
        : 'var(--surface-container-lowest)'
    }}
  >
    <div className="flex items-center gap-4">
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ 
          backgroundColor: isCompleted ? 'var(--primary)' : '#f3e5f5'
        }}
      >
        <Briefcase 
          size={28} 
          color={isCompleted ? 'white' : '#7b1fa2'} 
        />
      </div>
      <div className="flex-1">
        <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
          Walking Meeting
        </p>
        <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
          {isCompleted ? 'Completed today!' : 'Tap to mark complete'}
        </p>
      </div>
      {isCompleted && (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Footprints size={16} color="white" />
        </div>
      )}
    </div>
  </button>
))

WalkingMeetingCard.displayName = 'WalkingMeetingCard'

// Extracted post-meal walks card component
interface PostMealWalksCardProps {
  count: number
  onDecrement: () => void
  onIncrement: () => void
}

const PostMealWalksCard = memo(({
  count,
  onDecrement,
  onIncrement,
}: PostMealWalksCardProps) => (
  <div 
    className="card"
    style={{ backgroundColor: 'var(--surface-container-lowest)' }}
  >
    <div className="flex items-center gap-4">
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: '#e8f5e9' }}
      >
        <Coffee size={28} style={{ color: '#2e7d32' }} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
          Post-Meal Walks
        </p>
        <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
          10-15 min walks after eating
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          disabled={count <= 0}
          className="w-10 h-10 rounded-lg flex items-center justify-center disabled:opacity-50"
          style={{ backgroundColor: 'var(--surface-container-high)' }}
        >
          <Minus size={18} />
        </button>
        <span 
          className="w-8 text-center font-semibold"
          style={{ color: 'var(--on-surface)' }}
        >
          {count}
        </span>
        <button
          onClick={onIncrement}
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary-fixed)' }}
        >
          <Plus size={18} style={{ color: 'var(--primary)' }} />
        </button>
      </div>
    </div>
  </div>
))

PostMealWalksCard.displayName = 'PostMealWalksCard'

// Extracted active commute card component
interface ActiveCommuteCardProps {
  value: number | null | undefined
  onChange: (value: number) => void
}

const ActiveCommuteCard = memo(({
  value,
  onChange,
}: ActiveCommuteCardProps) => (
  <div 
    className="card"
    style={{ backgroundColor: 'var(--surface-container-lowest)' }}
  >
    <div className="flex items-center gap-4">
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: '#e0f2f1' }}
      >
        <MapPin size={28} style={{ color: '#00695c' }} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
          Active Commute
        </p>
      </div>
      <input
        type="number"
        placeholder="Minutes"
        value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="input-field w-24 px-3 py-2 text-sm"
      />
    </div>
  </div>
))

ActiveCommuteCard.displayName = 'ActiveCommuteCard'

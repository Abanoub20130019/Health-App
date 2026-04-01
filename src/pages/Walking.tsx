import { useEffect, useState, useCallback } from 'react'
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

  const updateEntry = async (updates: Partial<WalkingEntry>) => {
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
  }

  const adjustSteps = (delta: number) => {
    const newSteps = Math.max(0, (entry?.step_count || 0) + delta)
    updateEntry({ step_count: newSteps })
  }

  const toggleWalkingMeeting = () => {
    updateEntry({ walking_meeting: !entry?.walking_meeting })
  }

  const adjustPostMealWalks = (delta: number) => {
    const newCount = Math.max(0, (entry?.post_meal_walks || 0) + delta)
    updateEntry({ post_meal_walks: newCount })
  }

  const progress = Math.min(((entry?.step_count || 0) / STEP_GOAL) * 100, 100)

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
          {formatDisplayDate(getToday())}
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
              {(entry?.step_count || 0).toLocaleString()}
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
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} style={{ color: 'var(--tertiary)' }} />
              <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Best Day
              </span>
            </div>
            <p 
              className="font-display font-bold text-headline-sm"
              style={{ color: 'var(--on-surface)' }}
            >
              {stats.bestDay.steps.toLocaleString()}
            </p>
            <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              {formatDisplayDate(stats.bestDay.date)}
            </p>
          </div>

          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
              <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Weekly Miles
              </span>
            </div>
            <p 
              className="font-display font-bold text-headline-sm"
              style={{ color: 'var(--on-surface)' }}
            >
              {stats.weeklyMileage.toFixed(1)} mi
            </p>
            <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Keep moving!
            </p>
          </div>
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
          {/* Morning Walk */}
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#fff3e0' }}
              >
                <Sunrise size={28} style={{ color: '#e65100' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Morning Walk
                </p>
                <div className="flex gap-4 mt-2">
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={entry?.morning_walk_minutes || ''}
                    onChange={(e) => updateEntry({ morning_walk_minutes: parseInt(e.target.value) || 0 })}
                    className="input-field w-24 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="km"
                    step="0.1"
                    value={entry?.morning_walk_distance_km || ''}
                    onChange={(e) => updateEntry({ morning_walk_distance_km: parseFloat(e.target.value) || 0 })}
                    className="input-field w-20 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Evening Walk */}
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#e3f2fd' }}
              >
                <Sunset size={28} style={{ color: '#1565c0' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Evening Walk
                </p>
                <div className="flex gap-4 mt-2">
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={entry?.evening_walk_minutes || ''}
                    onChange={(e) => updateEntry({ evening_walk_minutes: parseInt(e.target.value) || 0 })}
                    className="input-field w-24 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="km"
                    step="0.1"
                    value={entry?.evening_walk_distance_km || ''}
                    onChange={(e) => updateEntry({ evening_walk_distance_km: parseFloat(e.target.value) || 0 })}
                    className="input-field w-20 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Walking Meeting */}
          <button
            onClick={toggleWalkingMeeting}
            className="card w-full text-left transition-all"
            style={{ 
              backgroundColor: entry?.walking_meeting 
                ? 'var(--primary-fixed)' 
                : 'var(--surface-container-lowest)'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: entry?.walking_meeting ? 'var(--primary)' : '#f3e5f5'
                }}
              >
                <Briefcase 
                  size={28} 
                  color={entry?.walking_meeting ? 'white' : '#7b1fa2'} 
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Walking Meeting
                </p>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  {entry?.walking_meeting ? 'Completed today!' : 'Tap to mark complete'}
                </p>
              </div>
              {entry?.walking_meeting && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Footprints size={16} color="white" />
                </div>
              )}
            </div>
          </button>

          {/* Post-Meal Walks */}
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
                  onClick={() => adjustPostMealWalks(-1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-container-high)' }}
                >
                  <Minus size={18} />
                </button>
                <span 
                  className="w-8 text-center font-semibold"
                  style={{ color: 'var(--on-surface)' }}
                >
                  {entry?.post_meal_walks || 0}
                </span>
                <button
                  onClick={() => adjustPostMealWalks(1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary-fixed)' }}
                >
                  <Plus size={18} style={{ color: 'var(--primary)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Commute */}
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
                value={entry?.active_commute_minutes || ''}
                onChange={(e) => updateEntry({ active_commute_minutes: parseInt(e.target.value) || 0 })}
                className="input-field w-24 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

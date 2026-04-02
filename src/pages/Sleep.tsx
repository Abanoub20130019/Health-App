import { useEffect, useState, useCallback } from 'react'
import { 
  Moon, 
  Sun, 
  Smartphone,
  Clock,
  Heart
} from 'lucide-react'
import { sleepAPI } from '../lib/api'
import { getToday, formatTime } from '../utils/date'
import CircularProgress from '../components/CircularProgress'
import type { SleepEntry, SleepStats } from '../types'

interface SleepProps {
  userId: string
}

const SLEEP_GOAL_HOURS = 8

export default function Sleep({ userId }: SleepProps) {
  const [entry, setEntry] = useState<SleepEntry | null>(null)
  const [stats, setStats] = useState<SleepStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form state
  const [bedtime, setBedtime] = useState('22:00')
  const [wakeTime, setWakeTime] = useState('06:00')
  const [screenCurfew, setScreenCurfew] = useState(false)
  const [sunlightMinutes, setSunlightMinutes] = useState(15)
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(3)

  const loadData = useCallback(async () => {
    try {
      const [entryData, statsData] = await Promise.all([
        sleepAPI.getByDate(userId, getToday()),
        sleepAPI.getStats(userId),
      ])
      setEntry(entryData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load sleep data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const calculateDuration = (bed: string, wake: string): number => {
    const [bedHours, bedMins] = bed.split(':').map(Number)
    const [wakeHours, wakeMins] = wake.split(':').map(Number)
    
    let duration = (wakeHours + (wakeHours < bedHours ? 24 : 0)) - bedHours
    duration += (wakeMins - bedMins) / 60
    
    return Math.max(0, duration)
  }

  const handleSave = async () => {
    const duration = calculateDuration(bedtime, wakeTime)
    
    try {
      await sleepAPI.add({
        userId,
        date: getToday(),
        bedtime: `${getToday()}T${bedtime}:00`,
        wakeTime: `${getToday()}T${wakeTime}:00`,
        durationHours: duration,
        screenCurfewComplied: screenCurfew,
        morningSunlightMinutes: sunlightMinutes,
        sleepQuality,
      })
      
      setShowAddModal(false)
      loadData()
    } catch (error) {
      console.error('Failed to save sleep:', error)
    }
  }

  const sleepProgress = entry 
    ? Math.min((entry.duration_hours / SLEEP_GOAL_HOURS) * 100, 100)
    : 0

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
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="font-display font-bold text-display-sm"
            style={{ color: 'var(--on-surface)' }}
          >
            Sleep & Recovery
          </h1>
          <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            Track your rest and recovery
          </p>
        </div>
      </div>

      {/* Sleep Summary Card */}
      {entry ? (
        <div 
          className="card-elevated"
          style={{ 
            background: 'linear-gradient(135deg, #5e35b1 0%, #7e57c2 100%)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-label-lg mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Last Night
              </p>
              <p 
                className="font-display font-bold text-display-sm"
                style={{ color: 'white' }}
              >
                {entry.duration_hours.toFixed(1)} hours
              </p>
            </div>
            <CircularProgress 
              progress={sleepProgress} 
              size={100} 
              strokeWidth={8}
              color="white"
              bgColor="rgba(255,255,255,0.2)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div 
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Moon size={16} color="white" />
                <span className="text-label-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Bedtime
                </span>
              </div>
              <p className="font-semibold text-body-lg" style={{ color: 'white' }}>
                {formatTime(entry.bedtime)}
              </p>
            </div>
            <div 
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sun size={16} color="white" />
                <span className="text-label-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Wake Time
                </span>
              </div>
              <p className="font-semibold text-body-lg" style={{ color: 'white' }}>
                {formatTime(entry.wake_time)}
              </p>
            </div>
          </div>

          {/* Quality Rating */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-2xl">
                {star <= (entry.sleep_quality || 0) ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddModal(true)}
          className="card-elevated w-full text-center py-12 transition-all active:scale-95"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
        >
          <div 
            className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: '#ede7f6' }}
          >
            <Moon size={40} style={{ color: '#5e35b1' }} />
          </div>
          <p 
            className="font-display font-bold text-headline-md mb-2"
            style={{ color: 'var(--on-surface)' }}
          >
            Log Sleep
          </p>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            Tap to record last night&apos;s sleep
          </p>
        </button>
      )}

      {/* Sleep Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Avg Duration
              </span>
            </div>
            <p 
              className="font-display font-bold text-headline-md"
              style={{ color: 'var(--on-surface)' }}
            >
              {stats.averageDuration.toFixed(1)}h
            </p>
          </div>

          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart size={18} style={{ color: 'var(--tertiary)' }} />
              <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Avg Quality
              </span>
            </div>
            <p 
              className="font-display font-bold text-headline-md"
              style={{ color: 'var(--on-surface)' }}
            >
              {stats.averageQuality.toFixed(1)}/5
            </p>
          </div>
        </div>
      )}

      {/* Recovery Habits */}
      {entry && (
        <div>
          <h2 
            className="font-display font-semibold text-title-lg mb-4"
            style={{ color: 'var(--on-surface)' }}
          >
            Recovery Habits
          </h2>

          <div className="space-y-3">
            {/* Screen Curfew */}
            <div 
              className="card flex items-center gap-4"
              style={{ 
                backgroundColor: entry.screen_curfew_complied 
                  ? '#e8f5e9' 
                  : 'var(--surface-container-lowest)'
              }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: entry.screen_curfew_complied ? '#2e7d32' : '#e8f5e9'
                }}
              >
                <Smartphone 
                  size={28} 
                  color={entry.screen_curfew_complied ? 'white' : '#2e7d32'} 
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Screen Curfew
                </p>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  No screens 1 hour before bed
                </p>
              </div>
              {entry.screen_curfew_complied && (
                <span 
                  className="px-3 py-1 rounded-full text-label-sm font-medium"
                  style={{ backgroundColor: '#2e7d32', color: 'white' }}
                >
                  Done
                </span>
              )}
            </div>

            {/* Morning Sunlight */}
            <div 
              className="card flex items-center gap-4"
              style={{ backgroundColor: 'var(--surface-container-lowest)' }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#fff3e0' }}
              >
                <Sun size={28} style={{ color: '#e65100' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Morning Sunlight
                </p>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  {entry.morning_sunlight_minutes || 0} minutes within 1 hour of waking
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Sleep Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl p-6 animate-scale-in"
            style={{ backgroundColor: 'var(--surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 
              className="font-display font-bold text-headline-md mb-6"
              style={{ color: 'var(--on-surface)' }}
            >
              Log Sleep
            </h2>

            {/* Bedtime */}
            <div className="mb-6">
              <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Bedtime
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="input-field w-full text-center text-display-sm font-display"
              />
            </div>

            {/* Wake Time */}
            <div className="mb-6">
              <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Wake Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="input-field w-full text-center text-display-sm font-display"
              />
            </div>

            {/* Calculated Duration */}
            <div 
              className="p-4 rounded-xl mb-6 text-center"
              style={{ backgroundColor: 'var(--surface-container-low)' }}
            >
              <p className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>
                Total Sleep
              </p>
              <p 
                className="font-display font-bold text-headline-lg"
                style={{ color: 'var(--primary)' }}
              >
                {calculateDuration(bedtime, wakeTime).toFixed(1)} hours
              </p>
            </div>

            {/* Screen Curfew */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={screenCurfew}
                  onChange={(e) => setScreenCurfew(e.target.checked)}
                  className="w-6 h-6 rounded-lg"
                />
                <span className="text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  No screens 1 hour before bed
                </span>
              </label>
            </div>

            {/* Morning Sunlight */}
            <div className="mb-6">
              <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Morning Sunlight (minutes)
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={sunlightMinutes}
                onChange={(e) => setSunlightMinutes(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center mt-2">
                <span 
                  className="font-display font-bold text-headline-sm"
                  style={{ color: 'var(--primary)' }}
                >
                  {sunlightMinutes} min
                </span>
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="mb-6">
              <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Sleep Quality
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => setSleepQuality(score as 1 | 2 | 3 | 4 | 5)}
                    className="flex-1 py-3 rounded-xl text-2xl transition-all"
                    style={{
                      backgroundColor: sleepQuality === score 
                        ? '#ede7f6' 
                        : 'var(--surface-container-low)',
                    }}
                  >
                    {score <= sleepQuality ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSave}
              className="btn-primary w-full"
            >
              Save Sleep Log
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

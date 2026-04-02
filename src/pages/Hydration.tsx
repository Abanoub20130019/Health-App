import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { 
  Droplets, 
  Plus, 
  Sun,
  Minus,
  GlassWater,
  Leaf,
  Zap,
  Coffee
} from 'lucide-react'
import { hydrationAPI } from '../lib/api'
import { getToday, formatDisplayDate, formatTime } from '../utils/date'
import CircularProgress from '../components/CircularProgress'
import type { HydrationEntry } from '../types'

interface HydrationProps {
  userId: string
}

const WATER_GOAL_ML = 2500

const QUICK_ADD_AMOUNTS = [
  { amount: 250, label: 'Glass', icon: GlassWater },
  { amount: 500, label: 'Bottle', icon: Droplets },
  { amount: 750, label: 'Large', icon: Droplets },
] as const

// Memoized quick add button
const QuickAddButton = memo(({
  amount,
  icon: Icon,
  onClick,
}: {
  amount: number
  icon: typeof GlassWater
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all active:scale-95"
    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
  >
    <Icon size={24} color="white" />
    <span className="text-label-sm font-medium" style={{ color: 'white' }}>
      +{amount}ml
    </span>
  </button>
))

QuickAddButton.displayName = 'QuickAddButton'

// Memoized log entry item
const LogEntry = memo(({
  log,
}: {
  log: { time: string; amount_ml: number; type: string }
}) => (
  <div
    className="card flex items-center justify-between"
    style={{ backgroundColor: 'var(--surface-container-lowest)' }}
  >
    <div className="flex items-center gap-3">
      <Droplets size={20} style={{ color: 'var(--primary)' }} />
      <span className="text-body-md" style={{ color: 'var(--on-surface)' }}>
        {log.amount_ml}ml
      </span>
      <span 
        className="text-label-sm px-2 py-1 rounded-full capitalize"
        style={{ backgroundColor: 'var(--surface-container-high)' }}
      >
        {log.type}
      </span>
    </div>
    <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
      {formatTime(log.time)}
    </span>
  </div>
))

LogEntry.displayName = 'LogEntry'

export default function Hydration({ userId }: HydrationProps) {
  const [entry, setEntry] = useState<HydrationEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [customAmount, setCustomAmount] = useState('')

  const loadData = useCallback(async () => {
    try {
      const data = await hydrationAPI.getByDate(userId, getToday())
      setEntry(data || {
        id: '',
        user_id: userId,
        date: getToday(),
        total_ml: 0,
        morning_water: false,
        caffeine_after_2pm: false,
        herbal_teas: 0,
        electrolytes: 0,
        entries: [],
        created_at: '',
        updated_at: '',
      })
    } catch (error) {
      console.error('Failed to load hydration data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const addWater = useCallback(async (amount: number, type: 'water' | 'tea' | 'coffee' | 'electrolyte' = 'water') => {
    try {
      await hydrationAPI.addEntry({
        userId,
        date: getToday(),
        amount,
        type,
        time: new Date().toISOString(),
      })
      loadData()
    } catch (error) {
      console.error('Failed to add water:', error)
    }
  }, [userId, loadData])

  const toggleMorningWater = useCallback(async () => {
    try {
      await hydrationAPI.update({
        userId,
        date: getToday(),
        morning_water: !entry?.morning_water,
      })
      loadData()
    } catch (error) {
      console.error('Failed to update morning water:', error)
    }
  }, [userId, entry?.morning_water, loadData])

  const toggleCaffeine = useCallback(async () => {
    try {
      await hydrationAPI.update({
        userId,
        date: getToday(),
        caffeine_after_2pm: !entry?.caffeine_after_2pm,
      })
      loadData()
    } catch (error) {
      console.error('Failed to update caffeine:', error)
    }
  }, [userId, entry?.caffeine_after_2pm, loadData])

  const adjustHerbalTeas = useCallback(async (delta: number) => {
    const newCount = Math.max(0, (entry?.herbal_teas || 0) + delta)
    try {
      await hydrationAPI.update({
        userId,
        date: getToday(),
        herbal_teas: newCount,
      })
      loadData()
    } catch (error) {
      console.error('Failed to update herbal teas:', error)
    }
  }, [userId, entry?.herbal_teas, loadData])

  const adjustElectrolytes = useCallback(async (delta: number) => {
    const newCount = Math.max(0, (entry?.electrolytes || 0) + delta)
    try {
      await hydrationAPI.update({
        userId,
        date: getToday(),
        electrolytes: newCount,
      })
      loadData()
    } catch (error) {
      console.error('Failed to update electrolytes:', error)
    }
  }, [userId, entry?.electrolytes, loadData])

  const handleCustomAdd = useCallback(() => {
    if (customAmount) {
      addWater(parseInt(customAmount))
      setCustomAmount('')
    }
  }, [customAmount, addWater])

  // Memoized progress calculation
  const progress = useMemo(() => 
    Math.min(((entry?.total_ml || 0) / WATER_GOAL_ML) * 100, 100),
    [entry?.total_ml]
  )

  // Memoized display values
  const displayDate = useMemo(() => formatDisplayDate(getToday()), [])
  const totalMl = entry?.total_ml || 0
  const progressPercent = Math.round(progress)

  // Memoized reversed entries with stable keys
  const reversedEntries = useMemo(() => {
    if (!entry?.entries) return []
    return [...entry.entries].reverse()
  }, [entry?.entries])

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
          Hydration
        </h1>
        <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
          {displayDate}
        </p>
      </div>

      {/* Main Progress Card */}
      <div 
        className="card-elevated text-center py-8"
        style={{ 
          background: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)'
        }}
      >
        <div className="flex justify-center mb-6">
          <CircularProgress 
            progress={progress} 
            size={160} 
            strokeWidth={12}
            color="white"
            bgColor="rgba(255,255,255,0.2)"
          />
        </div>
        
        <p 
          className="font-display font-bold text-display-md mb-2"
          style={{ color: 'white' }}
        >
          {totalMl} ml
        </p>
        <p className="text-body-md mb-6" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Goal: {WATER_GOAL_ML} ml ({progressPercent}%)
        </p>

        {/* Quick Add Buttons */}
        <div className="flex justify-center gap-3 px-4">
          {QUICK_ADD_AMOUNTS.map(({ amount, icon }) => (
            <QuickAddButton
              key={amount}
              amount={amount}
              icon={icon}
              onClick={() => addWater(amount)}
            />
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <div 
        className="card flex items-center gap-3"
        style={{ backgroundColor: 'var(--surface-container-low)' }}
      >
        <input
          type="number"
          placeholder="Custom amount (ml)"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="input-field flex-1"
        />
        <button
          onClick={handleCustomAdd}
          className="px-4 py-3 rounded-xl font-medium"
          style={{ backgroundColor: 'var(--primary)', color: 'white' }}
        >
          Add
        </button>
      </div>

      {/* Hydration Habits */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Hydration Habits
        </h2>

        <div className="space-y-3">
          {/* Morning Water */}
          <button
            onClick={toggleMorningWater}
            className="card w-full text-left transition-all"
            style={{ 
              backgroundColor: entry?.morning_water 
                ? '#fff3e0' 
                : 'var(--surface-container-lowest)'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: entry?.morning_water ? '#e65100' : '#fff3e0'
                }}
              >
                <Sun size={28} color={entry?.morning_water ? 'white' : '#e65100'} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Morning Water
                </p>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Glass of water upon waking
                </p>
              </div>
              {entry?.morning_water && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#e65100' }}
                >
                  <Droplets size={16} color="white" />
                </div>
              )}
            </div>
          </button>

          {/* No Caffeine After 2PM */}
          <button
            onClick={toggleCaffeine}
            className="card w-full text-left transition-all"
            style={{ 
              backgroundColor: entry?.caffeine_after_2pm 
                ? '#ffebee' 
                : 'var(--surface-container-lowest)'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: entry?.caffeine_after_2pm ? '#c62828' : '#ffebee'
                }}
              >
                <Coffee size={28} color={entry?.caffeine_after_2pm ? 'white' : '#c62828'} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Limited Caffeine
                </p>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  No caffeine after 2 PM
                </p>
              </div>
              {entry?.caffeine_after_2pm && (
                <div 
                  className="px-3 py-1 rounded-full text-label-sm font-medium"
                  style={{ backgroundColor: '#c62828', color: 'white' }}
                >
                  Limiting
                </div>
              )}
            </div>
          </button>

          {/* Herbal Teas */}
          <CounterCard
            icon={Leaf}
            iconColor="#2e7d32"
            bgColor="#e8f5e9"
            title="Herbal Teas"
            subtitle="Cups today"
            value={entry?.herbal_teas || 0}
            onDecrement={() => adjustHerbalTeas(-1)}
            onIncrement={() => adjustHerbalTeas(1)}
          />

          {/* Electrolytes */}
          <CounterCard
            icon={Zap}
            iconColor="#f9a825"
            bgColor="#fff8e1"
            title="Electrolytes"
            subtitle="Servings today"
            value={entry?.electrolytes || 0}
            onDecrement={() => adjustElectrolytes(-1)}
            onIncrement={() => adjustElectrolytes(1)}
          />
        </div>
      </div>

      {/* Today's Log */}
      {reversedEntries.length > 0 && (
        <div>
          <h2 
            className="font-display font-semibold text-title-lg mb-4"
            style={{ color: 'var(--on-surface)' }}
          >
            Today&apos;s Log
          </h2>
          <div className="space-y-2">
            {reversedEntries.map((log, idx) => (
              <LogEntry 
                key={`${log.time}-${idx}`} 
                log={log} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Extracted counter card component
interface CounterCardProps {
  icon: typeof Leaf
  iconColor: string
  bgColor: string
  title: string
  subtitle: string
  value: number
  onDecrement: () => void
  onIncrement: () => void
}

const CounterCard = memo(({
  icon: Icon,
  iconColor,
  bgColor,
  title,
  subtitle,
  value,
  onDecrement,
  onIncrement,
}: CounterCardProps) => (
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
        <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-container-high)' }}
        >
          <Minus size={18} />
        </button>
        <span 
          className="w-8 text-center font-semibold"
          style={{ color: 'var(--on-surface)' }}
        >
          {value}
        </span>
        <button
          onClick={onIncrement}
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Plus size={18} style={{ color: iconColor }} />
        </button>
      </div>
    </div>
  </div>
))

CounterCard.displayName = 'CounterCard'

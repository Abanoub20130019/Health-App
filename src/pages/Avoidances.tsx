import { useEffect, useState, useCallback, useMemo } from 'react'
import { Ban, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { avoidanceAPI } from '../lib/api'
import { getToday, formatDisplayDate } from '../utils/date'
import type { AvoidanceEntry, AvoidanceType, AvoidanceStats } from '../types'

interface AvoidancesProps {
  userId: string
}

const AVOIDANCE_TYPES: { type: AvoidanceType; label: string; emoji: string; description: string }[] = [
  { 
    type: 'processed_sugars', 
    label: 'Processed Sugars', 
    emoji: '🍭',
    description: 'Candy, soda, pastries'
  },
  { 
    type: 'refined_carbs', 
    label: 'Refined Carbs', 
    emoji: '🍞',
    description: 'White bread, pasta, pastries'
  },
  { 
    type: 'ultra_processed_foods', 
    label: 'Ultra-Processed Foods', 
    emoji: '🍟',
    description: 'Fast food, packaged snacks'
  },
  { 
    type: 'seed_oils', 
    label: 'Seed Oils', 
    emoji: '🛢️',
    description: 'Vegetable, canola, soybean oil'
  },
  { 
    type: 'alcohol', 
    label: 'Alcohol', 
    emoji: '🍷',
    description: 'All alcoholic beverages'
  },
  { 
    type: 'late_night_eating', 
    label: 'Late-Night Eating', 
    emoji: '🌙',
    description: 'No food after 8 PM'
  },
]

// Generate date buttons config - stable reference
const DATE_OFFSETS = [-3, -2, -1, 0, 1, 2, 3] as const

// Utility functions outside component
const formatDateLabel = (offset: number, date: Date): string => {
  if (offset === 0) return 'Today'
  if (offset === -1) return 'Yest'
  if (offset === 1) return 'Tmrw'
  return date.toLocaleDateString('en', { weekday: 'short' })
}

export default function Avoidances({ userId }: AvoidancesProps) {
  const [entries, setEntries] = useState<AvoidanceEntry[]>([])
  const [stats, setStats] = useState<AvoidanceStats[]>([])
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [entriesData, statsData] = await Promise.all([
        avoidanceAPI.getByDate(userId, selectedDate),
        avoidanceAPI.getStats(userId),
      ])
      setEntries(entriesData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load avoidance data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Memoized handlers to prevent unnecessary re-renders
  const handleToggle = useCallback(async (type: AvoidanceType, avoided: boolean) => {
    try {
      await avoidanceAPI.toggle({
        userId,
        date: selectedDate,
        type,
        avoided,
      })
      loadData()
    } catch (error) {
      console.error('Failed to toggle avoidance:', error)
    }
  }, [userId, selectedDate, loadData])

  // Memoized lookup maps for O(1) access instead of O(n) find
  const entriesMap = useMemo(() => {
    const map = new Map<AvoidanceType, AvoidanceEntry>()
    entries.forEach(e => map.set(e.avoidance_type, e))
    return map
  }, [entries])

  const statsMap = useMemo(() => {
    const map = new Map<AvoidanceType, AvoidanceStats>()
    stats.forEach(s => map.set(s.type, s))
    return map
  }, [stats])

  // Memoized getters
  const isAvoided = useCallback((type: AvoidanceType) => {
    return entriesMap.get(type)?.avoided ?? null
  }, [entriesMap])

  const getSuccessRate = useCallback((type: AvoidanceType) => {
    return statsMap.get(type)?.successRate7Days ?? 0
  }, [statsMap])

  // Memoized computed values
  const completedCount = useMemo(() => 
    entries.filter(e => e.avoided).length,
    [entries]
  )
  
  const totalCount = AVOIDANCE_TYPES.length

  // Memoized date buttons to prevent recreation on every render
  const dateButtons = useMemo(() => {
    const today = new Date()
    return DATE_OFFSETS.map((offset) => {
      const date = new Date(today)
      date.setDate(today.getDate() + offset)
      const dateStr = date.toISOString().split('T')[0]
      return {
        offset,
        dateStr,
        label: formatDateLabel(offset, date),
        isSelected: dateStr === selectedDate,
      }
    })
  }, [selectedDate])

  // Memoized progress data to prevent recalculation
  const avoidanceListData = useMemo(() => {
    return AVOIDANCE_TYPES.map(({ type, label, emoji, description }) => ({
      type,
      label,
      emoji,
      description,
      status: isAvoided(type),
      successRate: getSuccessRate(type),
    }))
  }, [isAvoided, getSuccessRate])

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
          Dietary Avoidances
        </h1>
        <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
          Track days free from trigger foods
        </p>
      </div>

      {/* Progress Card */}
      <div 
        className="card-elevated"
        style={{ 
          background: 'linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-lg mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {formatDisplayDate(selectedDate)}
            </p>
            <p 
              className="font-display font-bold text-display-sm"
              style={{ color: 'white' }}
            >
              {completedCount} of {totalCount} Avoided
            </p>
            <p className="text-body-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {completedCount === totalCount ? '🎉 Perfect day!' : 'Keep building those healthy habits'}
            </p>
          </div>
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Ban size={36} color="white" />
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dateButtons.map(({ offset, dateStr, label, isSelected }) => (
          <button
            key={offset}
            onClick={() => setSelectedDate(dateStr)}
            className="flex-shrink-0 px-4 py-2 rounded-xl transition-all"
            style={{
              backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-container-low)',
              color: isSelected ? 'white' : 'var(--on-surface)',
            }}
          >
            <p className="text-label-sm">{label}</p>
          </button>
        ))}
      </div>

      {/* Avoidance Checklist */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Today&apos;s Avoidances
        </h2>
        <div className="space-y-3">
          {avoidanceListData.map(({ type, label, emoji, description, status, successRate }) => (
            <AvoidanceCard
              key={type}
              type={type}
              label={label}
              emoji={emoji}
              description={description}
              status={status}
              successRate={successRate}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Extracted component to prevent unnecessary re-renders of the entire list
interface AvoidanceCardProps {
  type: AvoidanceType
  label: string
  emoji: string
  description: string
  status: boolean | null
  successRate: number
  onToggle: (type: AvoidanceType, avoided: boolean) => void
}

const AvoidanceCard = ({
  type,
  label,
  emoji,
  description,
  status,
  successRate,
  onToggle,
}: AvoidanceCardProps) => {
  // Memoized handlers for this card
  const handleYes = useCallback(() => onToggle(type, true), [onToggle, type])
  const handleNo = useCallback(() => onToggle(type, false), [onToggle, type])

  return (
    <div
      className="card"
      style={{ 
        backgroundColor: status === true 
          ? 'var(--primary-fixed)' 
          : status === false 
            ? 'var(--error-container)'
            : 'var(--surface-container-lowest)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{emoji}</span>
          <div>
            <p 
              className="font-medium text-body-lg"
              style={{ color: 'var(--on-surface)' }}
            >
              {label}
            </p>
            <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleYes}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
            style={{
              backgroundColor: status === true 
                ? 'var(--primary)' 
                : 'var(--surface-container-high)',
            }}
          >
            <CheckCircle2 
              size={24} 
              color={status === true ? 'white' : 'var(--outline)'} 
            />
          </button>
          <button
            onClick={handleNo}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
            style={{
              backgroundColor: status === false 
                ? 'var(--error)' 
                : 'var(--surface-container-high)',
            }}
          >
            <XCircle 
              size={24} 
              color={status === false ? 'white' : 'var(--outline)'} 
            />
          </button>
        </div>
      </div>
      
      {/* Weekly progress */}
      <div className="mt-3 flex items-center gap-3">
        <TrendingUp size={16} style={{ color: 'var(--on-surface-variant)' }} />
        <div className="flex-1">
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--surface-container-high)' }}
          >
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${successRate}%`,
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-container) 100%)'
              }}
            />
          </div>
        </div>
        <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
          {successRate.toFixed(0)}% 7d
        </span>
      </div>
    </div>
  )
}

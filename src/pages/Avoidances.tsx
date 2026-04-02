import { useEffect, useState, useCallback } from 'react'
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

export default function Avoidances({ userId }: AvoidancesProps) {
  const [entries, setEntries] = useState<AvoidanceEntry[]>([])
  const [stats, setStats] = useState<AvoidanceStats[]>([])
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [loading, setLoading] = useState(true)
  const [customAvoidances] = useState<string[]>([])

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

  const handleToggle = async (type: AvoidanceType, avoided: boolean) => {
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
  }

  const isAvoided = (type: AvoidanceType) => {
    const entry = entries.find(e => e.avoidance_type === type)
    return entry?.avoided ?? null
  }

  const getSuccessRate = (type: AvoidanceType) => {
    const stat = stats.find(s => s.type === type)
    return stat?.successRate7Days ?? 0
  }

  const completedCount = entries.filter(e => e.avoided).length
  const totalCount = AVOIDANCE_TYPES.length + customAvoidances.length // eslint-disable-line @typescript-eslint/no-unused-vars

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
        {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
          const date = new Date()
          date.setDate(date.getDate() + offset)
          const dateStr = date.toISOString().split('T')[0]
          const isSelected = dateStr === selectedDate
          
          return (
            <button
              key={offset}
              onClick={() => setSelectedDate(dateStr)}
              className="flex-shrink-0 px-4 py-2 rounded-xl transition-all"
              style={{
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-container-low)',
                color: isSelected ? 'white' : 'var(--on-surface)',
              }}
            >
              <p className="text-label-sm">
                {offset === 0 ? 'Today' : offset === -1 ? 'Yest' : offset === 1 ? 'Tmrw' : date.toLocaleDateString('en', { weekday: 'short' })}
              </p>
            </button>
          )
        })}
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
          {AVOIDANCE_TYPES.map(({ type, label, emoji, description }) => {
            const status = isAvoided(type)
            const successRate = getSuccessRate(type)
            
            return (
              <div
                key={type}
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
                      onClick={() => handleToggle(type, true)}
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
                      onClick={() => handleToggle(type, false)}
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
          })}
        </div>
      </div>

      {/* Custom Avoidances - Reserved for future use */}
      {customAvoidances.length > 0 && (
        <div>
          <h2 
            className="font-display font-semibold text-title-lg mb-4"
            style={{ color: 'var(--on-surface)' }}
          >
            Custom Avoidances
          </h2>
          <div className="space-y-2">
            {customAvoidances.map((custom: string, idx: number) => (
              <div
                key={idx}
                className="card flex items-center justify-between"
                style={{ backgroundColor: 'var(--surface-container-lowest)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <span className="font-medium" style={{ color: 'var(--on-surface)' }}>
                    {custom}
                  </span>
                </div>
                <CheckCircle2 size={24} style={{ color: 'var(--primary)' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

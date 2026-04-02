import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { 
  Salad, 
  Plus, 
  Minus, 
  ChefHat, 
  Smartphone,
  Percent,
  Carrot,
  Utensils
} from 'lucide-react'
import { mindfulEatingAPI } from '../lib/api'
import { getToday, formatDisplayDate } from '../utils/date'
import type { MindfulEatingEntry } from '../types'

interface MindfulEatingProps {
  userId: string
}

// Memoized counter button component
const CounterButton = memo(({
  onClick,
  icon: Icon,
  color,
  disabled = false,
}: {
  onClick: () => void
  icon: typeof Plus
  color?: string
  disabled?: boolean
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-10 h-10 rounded-lg flex items-center justify-center disabled:opacity-50"
    style={{ backgroundColor: color || 'var(--surface-container-high)' }}
  >
    <Icon size={16} style={color ? { color } : undefined} />
  </button>
))

CounterButton.displayName = 'CounterButton'

// Memoized meal habit card
const MealHabitCard = memo(({
  icon: Icon,
  iconColor,
  bgColor,
  title,
  subtitle,
  value,
  onDecrement,
  onIncrement,
}: {
  icon: typeof ChefHat
  iconColor: string
  bgColor: string
  title: string
  subtitle: string
  value: number
  onDecrement: () => void
  onIncrement: () => void
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
        <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <CounterButton
          onClick={onDecrement}
          icon={Minus}
          disabled={value <= 0}
        />
        <span 
          className="w-8 text-center font-semibold"
          style={{ color: 'var(--on-surface)' }}
        >
          {value}
        </span>
        <CounterButton
          onClick={onIncrement}
          icon={Plus}
          color={bgColor}
        />
      </div>
    </div>
  </div>
))

MealHabitCard.displayName = 'MealHabitCard'

export default function MindfulEating({ userId }: MindfulEatingProps) {
  const [entry, setEntry] = useState<MindfulEatingEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await mindfulEatingAPI.getByDate(userId, getToday())
      setEntry(data || {
        id: '',
        user_id: userId,
        date: getToday(),
        meals_count: 0,
        protein_prioritized_meals: 0,
        vegetable_servings: 0,
        distraction_free_meals: 0,
        eighty_percent_full_meals: 0,
        meal_prep_completed: false,
        notes: null,
        created_at: '',
        updated_at: '',
      })
    } catch (error) {
      console.error('Failed to load mindful eating data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateField = useCallback(async (field: keyof MindfulEatingEntry, value: unknown) => {
    try {
      await mindfulEatingAPI.update({
        userId,
        date: getToday(),
        [field]: value,
      })
      loadData()
    } catch (error) {
      console.error('Failed to update mindful eating:', error)
    }
  }, [userId, loadData])

  const adjustValue = useCallback((field: keyof MindfulEatingEntry, delta: number, min = 0) => {
    const current = (entry?.[field] as number) || 0
    const newValue = Math.max(min, current + delta)
    updateField(field, newValue)
  }, [entry, updateField])

  const toggleMealPrep = useCallback(() => {
    updateField('meal_prep_completed', !entry?.meal_prep_completed)
  }, [entry?.meal_prep_completed, updateField])

  // Memoized score calculation
  const score = useMemo(() => {
    if (!entry) return 0
    let score = 0
    if (entry.protein_prioritized_meals >= entry.meals_count && entry.meals_count > 0) score += 25
    if (entry.vegetable_servings >= 5) score += 25
    if (entry.distraction_free_meals >= entry.meals_count && entry.meals_count > 0) score += 25
    if (entry.eighty_percent_full_meals >= entry.meals_count && entry.meals_count > 0) score += 25
    return score
  }, [entry])

  // Memoized display values
  const displayDate = useMemo(() => formatDisplayDate(getToday()), [])
  const scoreFeedback = useMemo(() => {
    if (score >= 75) return '🌟 Excellent!'
    if (score >= 50) return '👍 Good progress'
    return 'Keep building habits'
  }, [score])

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
          Mindful Eating
        </h1>
        <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
          {displayDate}
        </p>
      </div>

      {/* Score Card */}
      <div 
        className="card-elevated"
        style={{ 
          background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-lg mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Mindful Eating Score
            </p>
            <p 
              className="font-display font-bold text-display-sm"
              style={{ color: 'white' }}
            >
              {score}/100
            </p>
            <p className="text-body-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {scoreFeedback}
            </p>
          </div>
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Salad size={40} color="white" />
          </div>
        </div>
      </div>

      {/* Meals Count */}
      <MealsCounterCard
        count={entry?.meals_count || 0}
        onDecrement={() => adjustValue('meals_count', -1)}
        onIncrement={() => adjustValue('meals_count', 1)}
      />

      {/* Eating Habits */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Meal Quality
        </h2>

        <div className="space-y-3">
          <MealHabitCard
            icon={ChefHat}
            iconColor="#e65100"
            bgColor="#fff3e0"
            title="Protein Prioritized"
            subtitle="Meals with protein first"
            value={entry?.protein_prioritized_meals || 0}
            onDecrement={() => adjustValue('protein_prioritized_meals', -1)}
            onIncrement={() => adjustValue('protein_prioritized_meals', 1)}
          />

          <MealHabitCard
            icon={Carrot}
            iconColor="#2e7d32"
            bgColor="#e8f5e9"
            title="Vegetable Servings"
            subtitle="Goal: 5+ servings daily"
            value={entry?.vegetable_servings || 0}
            onDecrement={() => adjustValue('vegetable_servings', -1)}
            onIncrement={() => adjustValue('vegetable_servings', 1)}
          />

          <MealHabitCard
            icon={Smartphone}
            iconColor="#1565c0"
            bgColor="#e3f2fd"
            title="Distraction-Free"
            subtitle="No screens while eating"
            value={entry?.distraction_free_meals || 0}
            onDecrement={() => adjustValue('distraction_free_meals', -1)}
            onIncrement={() => adjustValue('distraction_free_meals', 1)}
          />

          <MealHabitCard
            icon={Percent}
            iconColor="#c62828"
            bgColor="#fce4ec"
            title="80% Full Rule"
            subtitle="Stopped before stuffed"
            value={entry?.eighty_percent_full_meals || 0}
            onDecrement={() => adjustValue('eighty_percent_full_meals', -1)}
            onIncrement={() => adjustValue('eighty_percent_full_meals', 1)}
          />
        </div>
      </div>

      {/* Meal Prep */}
      <button
        onClick={toggleMealPrep}
        className="card w-full text-left transition-all"
        style={{ 
          backgroundColor: entry?.meal_prep_completed 
            ? 'var(--primary-fixed)' 
            : 'var(--surface-container-lowest)'
        }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ 
              backgroundColor: entry?.meal_prep_completed ? 'var(--primary)' : 'var(--surface-container-high)'
            }}
          >
            <ChefHat 
              size={28} 
              color={entry?.meal_prep_completed ? 'white' : 'var(--on-surface)'} 
            />
          </div>
          <div className="flex-1">
            <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
              Weekly Meal Prep
            </p>
            <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Batch cooking completed this week
            </p>
          </div>
          {entry?.meal_prep_completed && (
            <span 
              className="px-3 py-1 rounded-full text-label-sm font-medium"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              Done
            </span>
          )}
        </div>
      </button>
    </div>
  )
}

// Extracted meals counter card component
interface MealsCounterCardProps {
  count: number
  onDecrement: () => void
  onIncrement: () => void
}

const MealsCounterCard = memo(({
  count,
  onDecrement,
  onIncrement,
}: MealsCounterCardProps) => (
  <div 
    className="card"
    style={{ backgroundColor: 'var(--surface-container-low)' }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary-fixed)' }}
        >
          <Utensils size={28} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
            Meals Today
          </p>
          <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Total meals eaten
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrement}
          disabled={count <= 0}
          className="w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50"
          style={{ backgroundColor: 'var(--surface-container-high)' }}
        >
          <Minus size={20} />
        </button>
        <span 
          className="w-10 text-center font-display font-bold text-headline-sm"
          style={{ color: 'var(--on-surface)' }}
        >
          {count}
        </span>
        <button
          onClick={onIncrement}
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary-fixed)' }}
        >
          <Plus size={20} style={{ color: 'var(--primary)' }} />
        </button>
      </div>
    </div>
  </div>
))

MealsCounterCard.displayName = 'MealsCounterCard'

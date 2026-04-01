import { useEffect, useState, useCallback } from 'react'
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

  const updateField = async (field: keyof MindfulEatingEntry, value: unknown) => {
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
  }

  const adjustValue = (field: keyof MindfulEatingEntry, delta: number, min = 0) => {
    const current = (entry?.[field] as number) || 0
    const newValue = Math.max(min, current + delta)
    updateField(field, newValue)
  }

  const toggleMealPrep = () => {
    updateField('meal_prep_completed', !entry?.meal_prep_completed)
  }

  const getScore = () => {
    if (!entry) return 0
    let score = 0
    if (entry.protein_prioritized_meals >= entry.meals_count && entry.meals_count > 0) score += 25
    if (entry.vegetable_servings >= 5) score += 25
    if (entry.distraction_free_meals >= entry.meals_count && entry.meals_count > 0) score += 25
    if (entry.eighty_percent_full_meals >= entry.meals_count && entry.meals_count > 0) score += 25
    return score
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
          Mindful Eating
        </h1>
        <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
          {formatDisplayDate(getToday())}
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
              {getScore()}/100
            </p>
            <p className="text-body-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {getScore() >= 75 ? '🌟 Excellent!' : getScore() >= 50 ? '👍 Good progress' : 'Keep building habits'}
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
              onClick={() => adjustValue('meals_count', -1)}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface-container-high)' }}
            >
              <Minus size={20} />
            </button>
            <span 
              className="w-10 text-center font-display font-bold text-headline-sm"
              style={{ color: 'var(--on-surface)' }}
            >
              {entry?.meals_count || 0}
            </span>
            <button
              onClick={() => adjustValue('meals_count', 1)}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-fixed)' }}
            >
              <Plus size={20} style={{ color: 'var(--primary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Eating Habits */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Meal Quality
        </h2>

        <div className="space-y-3">
          {/* Protein Prioritized */}
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#fff3e0' }}
              >
                <ChefHat size={28} style={{ color: '#e65100' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Protein Prioritized
                </p>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Meals with protein first
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustValue('protein_prioritized_meals', -1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-container-high)' }}
                >
                  <Minus size={16} />
                </button>
                <span 
                  className="w-8 text-center font-semibold"
                  style={{ color: 'var(--on-surface)' }}
                >
                  {entry?.protein_prioritized_meals || 0}
                </span>
                <button
                  onClick={() => adjustValue('protein_prioritized_meals', 1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#fff3e0' }}
                >
                  <Plus size={16} style={{ color: '#e65100' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Vegetable Servings */}
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#e8f5e9' }}
              >
                <Carrot size={28} style={{ color: '#2e7d32' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Vegetable Servings
                </p>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Goal: 5+ servings daily
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustValue('vegetable_servings', -1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-container-high)' }}
                >
                  <Minus size={16} />
                </button>
                <span 
                  className="w-8 text-center font-semibold"
                  style={{ color: 'var(--on-surface)' }}
                >
                  {entry?.vegetable_servings || 0}
                </span>
                <button
                  onClick={() => adjustValue('vegetable_servings', 1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#e8f5e9' }}
                >
                  <Plus size={16} style={{ color: '#2e7d32' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Distraction-Free Meals */}
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#e3f2fd' }}
              >
                <Smartphone size={28} style={{ color: '#1565c0' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  Distraction-Free
                </p>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  No screens while eating
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustValue('distraction_free_meals', -1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-container-high)' }}
                >
                  <Minus size={16} />
                </button>
                <span 
                  className="w-8 text-center font-semibold"
                  style={{ color: 'var(--on-surface)' }}
                >
                  {entry?.distraction_free_meals || 0}
                </span>
                <button
                  onClick={() => adjustValue('distraction_free_meals', 1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#e3f2fd' }}
                >
                  <Plus size={16} style={{ color: '#1565c0' }} />
                </button>
              </div>
            </div>
          </div>

          {/* 80% Full */}
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#fce4ec' }}
              >
                <Percent size={28} style={{ color: '#c62828' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-body-lg" style={{ color: 'var(--on-surface)' }}>
                  80% Full Rule
                </p>
                <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  Stopped before stuffed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustValue('eighty_percent_full_meals', -1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-container-high)' }}
                >
                  <Minus size={16} />
                </button>
                <span 
                  className="w-8 text-center font-semibold"
                  style={{ color: 'var(--on-surface)' }}
                >
                  {entry?.eighty_percent_full_meals || 0}
                </span>
                <button
                  onClick={() => adjustValue('eighty_percent_full_meals', 1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#fce4ec' }}
                >
                  <Plus size={16} style={{ color: '#c62828' }} />
                </button>
              </div>
            </div>
          </div>
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

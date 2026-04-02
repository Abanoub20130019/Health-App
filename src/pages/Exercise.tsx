import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { 
  Dumbbell, 
  Plus, 
  Flame, 
  Clock,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react'
import { exerciseAPI } from '../lib/api'
import { getToday, formatDisplayDate } from '../utils/date'
import type { ExerciseSession, ExerciseStats, ExerciseType, CardioType, IntensityLevel } from '../types'

interface ExerciseProps {
  userId: string
}

// Static data outside component
const EXERCISE_TYPES: { type: ExerciseType; label: string; icon: string; color: string; bgColor: string }[] = [
  { 
    type: 'resistance_training', 
    label: 'Resistance Training', 
    icon: '💪',
    color: '#6a1b9a',
    bgColor: '#f3e5f5'
  },
  { 
    type: 'cardio', 
    label: 'Cardio', 
    icon: '🏃',
    color: '#1565c0',
    bgColor: '#e3f2fd'
  },
  { 
    type: 'flexibility_mobility', 
    label: 'Flexibility & Mobility', 
    icon: '🧘',
    color: '#2e7d32',
    bgColor: '#e8f5e9'
  },
  { 
    type: 'active_recovery', 
    label: 'Active Recovery', 
    icon: '🌿',
    color: '#00695c',
    bgColor: '#e0f2f1'
  },
]

const CARDIO_TYPES: { type: CardioType; label: string }[] = [
  { type: 'running', label: 'Running' },
  { type: 'cycling', label: 'Cycling' },
  { type: 'swimming', label: 'Swimming' },
  { type: 'hiit', label: 'HIIT' },
  { type: 'other', label: 'Other' },
]

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
  'Legs', 'Glutes', 'Core', 'Calves', 'Full Body'
]

const INTENSITY_LEVELS: { level: IntensityLevel; label: string; color: string }[] = [
  { level: 'low', label: 'Low', color: '#2e7d32' },
  { level: 'moderate', label: 'Moderate', color: '#f9a825' },
  { level: 'high', label: 'High', color: '#ef6c00' },
  { level: 'very_high', label: 'Very High', color: '#c62828' },
]

// Create lookup maps for O(1) access
const exerciseTypeMap = new Map(EXERCISE_TYPES.map(t => [t.type, t]))
const intensityLevelMap = new Map(INTENSITY_LEVELS.map(l => [l.level, l]))

// Memoized session card component
const SessionCard = memo(({ 
  session, 
  onDelete 
}: { 
  session: ExerciseSession
  onDelete: (id: string) => void 
}) => {
  const typeInfo = exerciseTypeMap.get(session.exercise_type)
  const intensityInfo = intensityLevelMap.get(session.intensity)

  const handleDelete = useCallback(() => {
    onDelete(session.id)
  }, [onDelete, session.id])

  return (
    <div
      className="card"
      style={{ backgroundColor: 'var(--surface-container-lowest)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: typeInfo?.bgColor }}
          >
            {typeInfo?.icon}
          </div>
          <div>
            <p 
              className="font-medium text-body-lg"
              style={{ color: 'var(--on-surface)' }}
            >
              {typeInfo?.label}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span 
                className="flex items-center gap-1 text-label-sm"
                style={{ color: 'var(--on-surface-variant)' }}
              >
                <Clock size={14} />
                {session.duration_minutes} min
              </span>
              <span 
                className="text-label-sm px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: intensityInfo?.color + '20',
                  color: intensityInfo?.color
                }}
              >
                {session.intensity.replace('_', ' ')}
              </span>
            </div>
            {session.muscle_groups && session.muscle_groups.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {session.muscle_groups.map(muscle => (
                  <span 
                    key={muscle}
                    className="text-label-sm px-2 py-1 rounded-lg"
                    style={{ backgroundColor: 'var(--surface-container-high)' }}
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--surface-container-high)' }}
        >
          <X size={18} style={{ color: 'var(--error)' }} />
        </button>
      </div>
    </div>
  )
})

SessionCard.displayName = 'SessionCard'

export default function Exercise({ userId }: ExerciseProps) {
  const [sessions, setSessions] = useState<ExerciseSession[]>([])
  const [stats, setStats] = useState<ExerciseStats | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [selectedType, setSelectedType] = useState<ExerciseType>('resistance_training')
  const [cardioType, setCardioType] = useState<CardioType>('running')
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [duration, setDuration] = useState(30)
  const [intensity, setIntensity] = useState<IntensityLevel>('moderate')
  const [calories, setCalories] = useState('')
  const [feeling, setFeeling] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [notes, setNotes] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [sessionsData, statsData] = await Promise.all([
        exerciseAPI.getByDate(userId, getToday()),
        exerciseAPI.getStats(userId),
      ])
      setSessions(sessionsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load exercise data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddSession = useCallback(async () => {
    try {
      await exerciseAPI.add({
        userId,
        date: getToday(),
        exerciseType: selectedType,
        cardioType: selectedType === 'cardio' ? cardioType : null,
        muscleGroups: selectedType === 'resistance_training' ? selectedMuscles : null,
        durationMinutes: duration,
        intensity,
        caloriesBurned: calories ? parseInt(calories) : null,
        feelingScore: feeling,
        notes: notes || null,
      })
      
      // Reset form
      setSelectedType('resistance_training')
      setCardioType('running')
      setSelectedMuscles([])
      setDuration(30)
      setIntensity('moderate')
      setCalories('')
      setFeeling(3)
      setNotes('')
      setShowAddModal(false)
      
      loadData()
    } catch (error) {
      console.error('Failed to add exercise:', error)
    }
  }, [userId, selectedType, cardioType, selectedMuscles, duration, intensity, calories, feeling, notes, loadData])

  const handleDelete = useCallback(async (sessionId: string) => {
    try {
      await exerciseAPI.delete(sessionId)
      loadData()
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }, [loadData])

  const toggleMuscleGroup = useCallback((muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    )
  }, [])

  // Memoized total minutes calculation
  const totalMinutes = useMemo(() => 
    sessions.reduce((sum, s) => sum + s.duration_minutes, 0),
    [sessions]
  )

  // Memoized display values
  const displayDate = useMemo(() => formatDisplayDate(getToday()), [])
  const sessionCount = sessions.length

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
            Structured Exercise
          </h1>
          <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            {displayDate}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={24} color="white" />
        </button>
      </div>

      {/* Today's Summary */}
      <div 
        className="card-elevated"
        style={{ 
          background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-lg mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Today&apos;s Activity
            </p>
            <p 
              className="font-display font-bold text-display-sm"
              style={{ color: 'white' }}
            >
              {totalMinutes} Minutes
            </p>
            <p className="text-body-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {sessionCount} session{sessionCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Dumbbell size={40} color="white" />
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Weekly Sessions
              </span>
            </div>
            <p 
              className="font-display font-bold text-headline-md"
              style={{ color: 'var(--on-surface)' }}
            >
              {stats.weeklySessions}
            </p>
          </div>

          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} style={{ color: 'var(--tertiary)' }} />
              <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Weekly Minutes
              </span>
            </div>
            <p 
              className="font-display font-bold text-headline-md"
              style={{ color: 'var(--on-surface)' }}
            >
              {stats.totalMinutesWeek}
            </p>
          </div>
        </div>
      )}

      {/* Today's Sessions */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Today&apos;s Sessions
        </h2>
        
        {sessions.length === 0 ? (
          <div 
            className="card text-center py-12"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <Dumbbell size={48} className="mx-auto mb-4" style={{ color: 'var(--outline)' }} />
            <p style={{ color: 'var(--on-surface-variant)' }}>
              No workouts yet today
            </p>
            <p className="text-label-sm mt-1" style={{ color: 'var(--outline)' }}>
              Tap + to add your first session
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <AddSessionModal
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          cardioType={cardioType}
          setCardioType={setCardioType}
          selectedMuscles={selectedMuscles}
          toggleMuscleGroup={toggleMuscleGroup}
          duration={duration}
          setDuration={setDuration}
          intensity={intensity}
          setIntensity={setIntensity}
          calories={calories}
          setCalories={setCalories}
          feeling={feeling}
          setFeeling={setFeeling}
          notes={notes}
          setNotes={setNotes}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSession}
        />
      )}
    </div>
  )
}

// Extracted modal component to reduce main component complexity
interface AddSessionModalProps {
  selectedType: ExerciseType
  setSelectedType: (type: ExerciseType) => void
  cardioType: CardioType
  setCardioType: (type: CardioType) => void
  selectedMuscles: string[]
  toggleMuscleGroup: (muscle: string) => void
  duration: number
  setDuration: (duration: number) => void
  intensity: IntensityLevel
  setIntensity: (intensity: IntensityLevel) => void
  calories: string
  setCalories: (calories: string) => void
  feeling: 1 | 2 | 3 | 4 | 5
  setFeeling: (feeling: 1 | 2 | 3 | 4 | 5) => void
  notes: string
  setNotes: (notes: string) => void
  onClose: () => void
  onSave: () => void
}

const AddSessionModal = memo(({
  selectedType,
  setSelectedType,
  cardioType,
  setCardioType,
  selectedMuscles,
  toggleMuscleGroup,
  duration,
  setDuration,
  intensity,
  setIntensity,
  calories,
  setCalories,
  feeling,
  setFeeling,
  notes,
  setNotes,
  onClose,
  onSave,
}: AddSessionModalProps) => (
  <div 
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    onClick={onClose}
  >
    <div 
      className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 animate-slide-up"
      style={{ backgroundColor: 'var(--surface)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 
          className="font-display font-bold text-headline-md"
          style={{ color: 'var(--on-surface)' }}
        >
          Add Workout
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl"
          style={{ backgroundColor: 'var(--surface-container-high)' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Exercise Type */}
      <div className="mb-6">
        <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
          Exercise Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {EXERCISE_TYPES.map((type) => (
            <button
              key={type.type}
              onClick={() => setSelectedType(type.type)}
              className="p-3 rounded-xl text-left transition-all"
              style={{
                backgroundColor: selectedType === type.type ? type.bgColor : 'var(--surface-container-low)',
                border: selectedType === type.type ? `2px solid ${type.color}` : '2px solid transparent',
              }}
            >
              <span className="text-2xl mr-2">{type.icon}</span>
              <span 
                className="text-body-sm font-medium"
                style={{ color: selectedType === type.type ? type.color : 'var(--on-surface)' }}
              >
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cardio Type (if cardio selected) */}
      {selectedType === 'cardio' && (
        <div className="mb-6">
          <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
            Cardio Type
          </label>
          <div className="flex flex-wrap gap-2">
            {CARDIO_TYPES.map((type) => (
              <button
                key={type.type}
                onClick={() => setCardioType(type.type)}
                className="px-4 py-2 rounded-full text-label-sm font-medium transition-all"
                style={{
                  backgroundColor: cardioType === type.type ? '#1565c0' : 'var(--surface-container-low)',
                  color: cardioType === type.type ? 'white' : 'var(--on-surface)',
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Muscle Groups (if resistance selected) */}
      {selectedType === 'resistance_training' && (
        <div className="mb-6">
          <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
            Muscle Groups
          </label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((muscle) => (
              <button
                key={muscle}
                onClick={() => toggleMuscleGroup(muscle)}
                className="px-3 py-2 rounded-lg text-label-sm transition-all"
                style={{
                  backgroundColor: selectedMuscles.includes(muscle) 
                    ? 'var(--primary-fixed)' 
                    : 'var(--surface-container-low)',
                  color: selectedMuscles.includes(muscle) 
                    ? 'var(--primary)' 
                    : 'var(--on-surface)',
                }}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
          Duration: {duration} minutes
        </label>
        <input
          type="range"
          min="5"
          max="180"
          step="5"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-label-sm mt-1" style={{ color: 'var(--outline)' }}>
          <span>5 min</span>
          <span>180 min</span>
        </div>
      </div>

      {/* Intensity */}
      <div className="mb-6">
        <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
          Intensity
        </label>
        <div className="flex gap-2">
          {INTENSITY_LEVELS.map((level) => (
            <button
              key={level.level}
              onClick={() => setIntensity(level.level)}
              className="flex-1 py-3 rounded-xl text-label-sm font-medium transition-all"
              style={{
                backgroundColor: intensity === level.level ? level.color : 'var(--surface-container-low)',
                color: intensity === level.level ? 'white' : 'var(--on-surface)',
              }}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calories */}
      <div className="mb-6">
        <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
          Calories Burned (optional)
        </label>
        <div className="flex items-center gap-3">
          <Flame size={20} style={{ color: 'var(--tertiary)' }} />
          <input
            type="number"
            placeholder="e.g., 300"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="input-field flex-1"
          />
        </div>
      </div>

      {/* How did you feel? */}
      <div className="mb-6">
        <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
          How did you feel?
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => setFeeling(score as 1 | 2 | 3 | 4 | 5)}
              className="flex-1 py-3 rounded-xl text-2xl transition-all"
              style={{
                backgroundColor: feeling === score ? 'var(--primary-fixed)' : 'var(--surface-container-low)',
              }}
            >
              {score === 1 ? '😫' : score === 2 ? '😕' : score === 3 ? '😐' : score === 4 ? '🙂' : '🤩'}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
          Notes (optional)
        </label>
        <textarea
          placeholder="How was your workout?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field w-full h-24 resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={onSave}
        className="btn-primary w-full"
      >
        Add Session
      </button>
    </div>
  </div>
))

AddSessionModal.displayName = 'AddSessionModal'

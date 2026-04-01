import { useEffect, useState, useCallback } from 'react'
import { 
  TrendingUp, 
  Camera, 
  Ruler, 
  Zap,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  ChevronRight,
  Plus
} from 'lucide-react'
import { progressAPI } from '../lib/api'
import { getToday, formatDisplayDate } from '../utils/date'
import CircularProgress from '../components/CircularProgress'
import type { ProgressEntry } from '../types'

interface ProgressProps {
  userId: string
}

export default function Progress({ userId }: ProgressProps) {
  const [entry, setEntry] = useState<ProgressEntry | null>(null)
  const [history, setHistory] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form state
  const [weightKg, setWeightKg] = useState('')
  const [energyLevel, setEnergyLevel] = useState<number>(5)
  const [mood, setMood] = useState<'terrible' | 'bad' | 'neutral' | 'good' | 'excellent'>('good')
  const [stressLevel, setStressLevel] = useState<number>(5)
  const [nonScaleVictories, setNonScaleVictories] = useState<string[]>([])
  const [newVictory, setNewVictory] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [entryData, historyData] = await Promise.all([
        progressAPI.getByDate(userId, getToday()),
        progressAPI.getHistory(userId, 30),
      ])
      setEntry(entryData)
      setHistory(historyData)
    } catch (error) {
      console.error('Failed to load progress data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    try {
      await progressAPI.update({
        userId,
        date: getToday(),
        weightKg: weightKg ? parseFloat(weightKg) : null,
        energyLevel,
        mood,
        stressLevel,
        nonScaleVictories,
      })
      
      setShowAddModal(false)
      loadData()
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const addVictory = () => {
    if (newVictory.trim()) {
      setNonScaleVictories([...nonScaleVictories, newVictory.trim()])
      setNewVictory('')
    }
  }

  const removeVictory = (index: number) => {
    setNonScaleVictories(nonScaleVictories.filter((_, i) => i !== index))
  }

  const getMoodIcon = (m: string) => {
    switch (m) {
      case 'excellent': return <span className="text-2xl">🤩</span>
      case 'good': return <span className="text-2xl">🙂</span>
      case 'neutral': return <span className="text-2xl">😐</span>
      case 'bad': return <span className="text-2xl">😕</span>
      case 'terrible': return <span className="text-2xl">😫</span>
      default: return <span className="text-2xl">😐</span>
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="font-display font-bold text-display-sm"
            style={{ color: 'var(--on-surface)' }}
          >
            Progress Metrics
          </h1>
          <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            Track your transformation
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
      {entry ? (
        <div 
          className="card-elevated"
          style={{ 
            background: 'linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-label-lg mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Today&apos;s Check-In
              </p>
              <p 
                className="font-display font-bold text-display-sm"
                style={{ color: 'white' }}
              >
                {formatDisplayDate(getToday())}
              </p>
            </div>
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <TrendingUp size={32} color="white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {entry.weight_kg && (
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <p className="text-label-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Weight
                </p>
                <p className="font-semibold text-body-lg" style={{ color: 'white' }}>
                  {entry.weight_kg.toFixed(1)} kg
                </p>
              </div>
            )}
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-label-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Energy
              </p>
              <p className="font-semibold text-body-lg" style={{ color: 'white' }}>
                {entry.energy_level}/10
              </p>
            </div>
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-label-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Mood
              </p>
              <div className="flex items-center gap-2">
                {getMoodIcon(entry.mood)}
                <span className="font-semibold capitalize" style={{ color: 'white' }}>
                  {entry.mood}
                </span>
              </div>
            </div>
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-label-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Stress
              </p>
              <p className="font-semibold text-body-lg" style={{ color: 'white' }}>
                {entry.stress_level}/10
              </p>
            </div>
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
            style={{ backgroundColor: 'var(--tertiary-fixed)' }}
          >
            <TrendingUp size={40} style={{ color: 'var(--tertiary)' }} />
          </div>
          <p 
            className="font-display font-bold text-headline-md mb-2"
            style={{ color: 'var(--on-surface)' }}
          >
            Log Today&apos;s Progress
          </p>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            Weight, energy, mood & more
          </p>
        </button>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          className="card p-4 text-left transition-all active:scale-95"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: '#e3f2fd' }}
          >
            <Camera size={24} style={{ color: '#1565c0' }} />
          </div>
          <p className="font-medium text-body-md" style={{ color: 'var(--on-surface)' }}>
            Progress Photo
          </p>
          <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Monthly comparison
          </p>
        </button>

        <button 
          className="card p-4 text-left transition-all active:scale-95"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: '#f3e5f5' }}
          >
            <Ruler size={24} style={{ color: '#7b1fa2' }} />
          </div>
          <p className="font-medium text-body-md" style={{ color: 'var(--on-surface)' }}>
            Measurements
          </p>
          <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Monthly tracking
          </p>
        </button>
      </div>

      {/* Non-Scale Victories */}
      {entry?.non_scale_victories && entry.non_scale_victories.length > 0 && (
        <div>
          <h2 
            className="font-display font-semibold text-title-lg mb-4"
            style={{ color: 'var(--on-surface)' }}
          >
            🎉 Non-Scale Victories
          </h2>
          <div className="space-y-2">
            {entry.non_scale_victories.map((victory, idx) => (
              <div
                key={idx}
                className="card flex items-center gap-3"
                style={{ backgroundColor: 'var(--primary-fixed)' }}
              >
                <Zap size={20} style={{ color: 'var(--primary)' }} />
                <span className="text-body-md" style={{ color: 'var(--on-primary-container)' }}>
                  {victory}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Progress Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 animate-scale-in"
            style={{ backgroundColor: 'var(--surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 
              className="font-display font-bold text-headline-md mb-6"
              style={{ color: 'var(--on-surface)' }}
            >
              Daily Progress Check-In
            </h2>

            {/* Weight */}
            <div className="mb-6">
              <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Weight (kg) - Optional
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 70.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="input-field w-full"
              />
            </div>

            {/* Energy Level */}
            <div className="mb-6">
              <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Energy Level: {energyLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-label-sm mt-1" style={{ color: 'var(--outline)' }}>
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Mood */}
            <div className="mb-6">
              <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Mood Today
              </label>
              <div className="flex gap-2">
                {(['terrible', 'bad', 'neutral', 'good', 'excellent'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className="flex-1 py-3 rounded-xl text-2xl transition-all"
                    style={{
                      backgroundColor: mood === m ? 'var(--primary-fixed)' : 'var(--surface-container-low)',
                    }}
                  >
                    {m === 'terrible' ? '😫' : m === 'bad' ? '😕' : m === 'neutral' ? '😐' : m === 'good' ? '🙂' : '🤩'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stress Level */}
            <div className="mb-6">
              <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Stress Level: {stressLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-label-sm mt-1" style={{ color: 'var(--outline)' }}>
                <span>Calm</span>
                <span>Stressed</span>
              </div>
            </div>

            {/* Non-Scale Victories */}
            <div className="mb-6">
              <label className="block text-label-md mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Non-Scale Victories
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g., Better sleep, more energy..."
                  value={newVictory}
                  onChange={(e) => setNewVictory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addVictory()}
                  className="input-field flex-1"
                />
                <button
                  onClick={addVictory}
                  className="px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {nonScaleVictories.map((victory, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-2 rounded-full text-label-sm flex items-center gap-2"
                    style={{ backgroundColor: 'var(--primary-fixed)' }}
                  >
                    {victory}
                    <button
                      onClick={() => removeVictory(idx)}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--surface-container-high)' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSave}
              className="btn-primary w-full"
            >
              Save Progress
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

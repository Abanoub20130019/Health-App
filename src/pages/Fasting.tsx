import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { Play, Clock, Flame, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { fastingAPI } from '../lib/api'
import { formatTime } from '../utils/date'
import CircularProgress from '../components/CircularProgress'
import type { FastingSession, FastingStats } from '../types'

interface FastingProps {
  userId: string
}

const FASTING_WINDOWS = [
  { type: '16:8', label: '16:8 Classic', hours: 16, description: '16 hours fasting, 8 hours eating' },
  { type: '18:6', label: '18:6 Advanced', hours: 18, description: '18 hours fasting, 6 hours eating' },
  { type: '20:4', label: '20:4 Warrior', hours: 20, description: '20 hours fasting, 4 hours eating' },
  { type: 'OMAD', label: 'OMAD', hours: 23, description: 'One meal a day' },
] as const

// Memoized window selection button
const WindowButton = memo(({
  window,
  isSelected,
  onClick,
  disabled,
}: {
  window: typeof FASTING_WINDOWS[number]
  isSelected: boolean
  onClick: () => void
  disabled: boolean
}) => (
  <button
    key={window.type}
    onClick={onClick}
    disabled={disabled}
    className="w-full p-4 rounded-xl text-left transition-all disabled:opacity-50"
    style={{
      backgroundColor: isSelected 
        ? 'var(--primary-fixed)' 
        : 'var(--surface-container-lowest)',
      border: isSelected 
        ? '2px solid var(--primary)' 
        : '2px solid transparent',
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p 
          className="font-semibold text-body-lg"
          style={{ color: 'var(--on-surface)' }}
        >
          {window.label}
        </p>
        <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
          {window.description}
        </p>
      </div>
      {isSelected && (
        <CheckCircle2 size={24} style={{ color: 'var(--primary)' }} />
      )}
    </div>
  </button>
))

WindowButton.displayName = 'WindowButton'

// Memoized history item
const HistoryItem = memo(({
  session,
}: {
  session: FastingSession
}) => (
  <div
    className="card flex items-center justify-between"
    style={{ backgroundColor: 'var(--surface-container-lowest)' }}
  >
    <div className="flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ 
          backgroundColor: session.broken_early 
            ? 'var(--error-container)' 
            : 'var(--primary-fixed)'
        }}
      >
        <Clock 
          size={20} 
          style={{ 
            color: session.broken_early ? 'var(--error)' : 'var(--primary)' 
          }} 
        />
      </div>
      <div>
        <p 
          className="font-medium text-body-lg"
          style={{ color: 'var(--on-surface)' }}
        >
          {session.window_type}
        </p>
        <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
          {formatTime(session.start_time)}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p 
        className="font-display font-semibold"
        style={{ color: 'var(--on-surface)' }}
      >
        {session.actual_duration_hours?.toFixed(1)}h
      </p>
      <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
        / {session.target_duration_hours}h
      </p>
    </div>
  </div>
))

HistoryItem.displayName = 'HistoryItem'

export default function Fasting({ userId }: FastingProps) {
  const [activeSession, setActiveSession] = useState<FastingSession | null>(null)
  const [stats, setStats] = useState<FastingStats | null>(null)
  const [history, setHistory] = useState<FastingSession[]>([])
  const [selectedWindow, setSelectedWindow] = useState('16:8')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const [active, statsData, historyData] = await Promise.all([
        fastingAPI.getActive(userId),
        fastingAPI.getStats(userId),
        fastingAPI.getHistory(userId, 7),
      ])
      setActiveSession(active)
      setStats(statsData)
      setHistory(historyData || [])
    } catch (err) {
      console.error('Failed to load fasting data:', err)
      setError('Failed to load fasting data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Update elapsed time timer - optimized with useCallback
  useEffect(() => {
    if (!activeSession || activeSession.end_time) return

    const interval = setInterval(() => {
      const elapsed = (new Date().getTime() - new Date(activeSession.start_time).getTime()) / 1000 / 60 / 60
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [activeSession])

  const handleStart = useCallback(async () => {
    const window = FASTING_WINDOWS.find(w => w.type === selectedWindow)
    if (!window) return

    setStarting(true)
    setError(null)
    
    try {
      const session = await fastingAPI.start({
        userId,
        windowType: window.type,
        targetHours: window.hours,
      })
      setActiveSession(session)
      setElapsedTime(0)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start fast'
      setError(errorMessage)
    } finally {
      setStarting(false)
    }
  }, [userId, selectedWindow])

  const handleEnd = useCallback(async () => {
    if (!activeSession) return

    try {
      setError(null)
      await fastingAPI.end(activeSession.id, {})
      loadData()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end fast'
      setError(errorMessage)
    }
  }, [activeSession, loadData])

  // Memoized progress calculation
  const progress = useMemo(() => {
    if (!activeSession) return 0
    const target = activeSession.target_duration_hours
    const current = activeSession.end_time 
      ? (activeSession.actual_duration_hours || 0)
      : elapsedTime
    return Math.min((current / target) * 100, 100)
  }, [activeSession, elapsedTime])

  // Memoized elapsed display
  const elapsedDisplay = useMemo(() => {
    const hours = Math.floor(elapsedTime)
    const minutes = Math.floor((elapsedTime - hours) * 60)
    return `${hours}h ${minutes}m`
  }, [elapsedTime])

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
          Intermittent Fasting
        </h1>
        <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
          Track your fasting windows and build consistency
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'var(--error-container)' }}
        >
          <p style={{ color: 'var(--error)' }}>⚠️ {error}</p>
        </div>
      )}

      {/* Active Fast Timer */}
      <div 
        className="card-elevated relative overflow-hidden"
        style={{ 
          background: activeSession && !activeSession.end_time
            ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)'
            : 'var(--surface-container-low)'
        }}
      >
        <div className="relative z-10 text-center py-8">
          {activeSession && !activeSession.end_time ? (
            <ActiveFastView
              activeSession={activeSession}
              progress={progress}
              elapsedDisplay={elapsedDisplay}
              onEnd={handleEnd}
            />
          ) : (
            <StartFastView
              selectedWindow={selectedWindow}
              setSelectedWindow={setSelectedWindow}
              onStart={handleStart}
              starting={starting}
            />
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
              <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Weekly Consistency
              </span>
            </div>
            <p 
              className="font-display font-bold text-headline-md"
              style={{ color: 'var(--on-surface)' }}
            >
              {stats.weeklyConsistency}%
            </p>
          </div>

          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-low)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame size={18} style={{ color: 'var(--tertiary)' }} />
              <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Current Streak
              </span>
            </div>
            <p 
              className="font-display font-bold text-headline-md"
              style={{ color: 'var(--on-surface)' }}
            >
              {stats.currentStreak} days
            </p>
          </div>
        </div>
      )}

      {/* Recent History */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Recent Fasts
        </h2>
        <div className="space-y-2">
          {history.length === 0 ? (
            <div 
              className="card text-center py-8"
              style={{ backgroundColor: 'var(--surface-container-low)' }}
            >
              <AlertCircle size={32} className="mx-auto mb-2" style={{ color: 'var(--outline)' }} />
              <p style={{ color: 'var(--on-surface-variant)' }}>No fasting history yet</p>
            </div>
          ) : (
            history.map((session) => (
              <HistoryItem key={session.id} session={session} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Extracted active fast view component
interface ActiveFastViewProps {
  activeSession: FastingSession
  progress: number
  elapsedDisplay: string
  onEnd: () => void
}

const ActiveFastView = memo(({
  activeSession,
  progress,
  elapsedDisplay,
  onEnd,
}: ActiveFastViewProps) => (
  <>
    <p className="text-label-lg mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
      Fasting in Progress • {activeSession.window_type}
    </p>
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
      {elapsedDisplay}
    </p>
    <p className="text-body-md mb-6" style={{ color: 'rgba(255,255,255,0.8)' }}>
      Target: {activeSession.target_duration_hours} hours
    </p>
    <button
      onClick={onEnd}
      className="px-8 py-3 rounded-xl font-medium transition-all"
      style={{ 
        backgroundColor: 'white',
        color: 'var(--primary)'
      }}
    >
      End Fast
    </button>
  </>
))

ActiveFastView.displayName = 'ActiveFastView'

// Extracted start fast view component
interface StartFastViewProps {
  selectedWindow: string
  setSelectedWindow: (window: string) => void
  onStart: () => void
  starting: boolean
}

const StartFastView = memo(({
  selectedWindow,
  setSelectedWindow,
  onStart,
  starting,
}: StartFastViewProps) => (
  <>
    <div 
      className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
      style={{ backgroundColor: 'var(--primary-fixed)' }}
    >
      <Clock size={40} style={{ color: 'var(--primary)' }} />
    </div>
    <p 
      className="font-display font-bold text-headline-md mb-2"
      style={{ color: 'var(--on-surface)' }}
    >
      Ready to Fast?
    </p>
    <p className="text-body-md mb-6" style={{ color: 'var(--on-surface-variant)' }}>
      Choose your fasting window
    </p>

    {/* Window Selection */}
    <div className="space-y-2 mb-6">
      {FASTING_WINDOWS.map((window) => (
        <WindowButton
          key={window.type}
          window={window}
          isSelected={selectedWindow === window.type}
          onClick={() => setSelectedWindow(window.type)}
          disabled={starting}
        />
      ))}
    </div>

    <button
      onClick={onStart}
      disabled={starting}
      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {starting ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <Play size={20} />
          Start Fasting
        </>
      )}
    </button>
  </>
))

StartFastView.displayName = 'StartFastView'

import { useEffect, useState } from 'react'
import { 
  Timer, 
  Ban, 
  Footprints, 
  Dumbbell, 
  Droplets, 
  Moon, 
  Salad,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Flame
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../lib/api'
import { getToday, formatDisplayDate } from '../utils/date'
import CircularProgress from '../components/CircularProgress'
import type { DailySummary } from '../types'

interface DashboardProps {
  userId: string
}

const habitCards = [
  { 
    id: 'fasting', 
    label: 'Fasting', 
    icon: Timer, 
    color: 'var(--primary)',
    bgColor: 'var(--primary-fixed)',
    path: '/fasting'
  },
  { 
    id: 'avoidances', 
    label: 'Avoidances', 
    icon: Ban, 
    color: 'var(--tertiary)',
    bgColor: 'var(--tertiary-fixed)',
    path: '/avoidances'
  },
  { 
    id: 'walking', 
    label: 'Walking', 
    icon: Footprints, 
    color: 'var(--secondary)',
    bgColor: 'var(--secondary-container)',
    path: '/walking'
  },
  { 
    id: 'exercise', 
    label: 'Exercise', 
    icon: Dumbbell, 
    color: '#e65100',
    bgColor: '#ffe0b2',
    path: '/exercise'
  },
  { 
    id: 'hydration', 
    label: 'Hydration', 
    icon: Droplets, 
    color: '#0277bd',
    bgColor: '#b3e5fc',
    path: '/hydration'
  },
  { 
    id: 'sleep', 
    label: 'Sleep', 
    icon: Moon, 
    color: '#5e35b1',
    bgColor: '#d1c4e9',
    path: '/sleep'
  },
  { 
    id: 'mindful', 
    label: 'Mindful Eating', 
    icon: Salad, 
    color: '#2e7d32',
    bgColor: '#c8e6c9',
    path: '/mindful-eating'
  },
  { 
    id: 'progress', 
    label: 'Progress', 
    icon: TrendingUp, 
    color: '#c62828',
    bgColor: '#ffcdd2',
    path: '/progress'
  },
]

export default function Dashboard({ userId }: DashboardProps) {
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const today = getToday()

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await dashboardAPI.getDailySummary(userId, today)
        setSummary(data)
      } catch (error) {
        console.error('Failed to load summary:', error)
        // Use default empty summary
        setSummary({
          date: today,
          fastingActive: false,
          fastingProgress: null,
          avoidancesCompleted: 0,
          avoidancesTotal: 7,
          steps: 0,
          exerciseMinutes: 0,
          hydrationPercent: 0,
          sleepHours: null,
          mindfulEatingScore: 0,
          energyLevel: null,
          overallScore: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    loadSummary()
  }, [userId, today])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div 
          className="w-12 h-12 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--primary-container)' }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Daily Greeting */}
      <div>
        <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
          {formatDisplayDate(today)}
        </p>
        <h1 
          className="font-display font-bold text-display-sm mt-1"
          style={{ color: 'var(--on-surface)' }}
        >
          Your Daily Vitality
        </h1>
      </div>

      {/* Overall Score Card */}
      <div 
        className="card-elevated relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)'
        }}
      >
        <div className="relative z-10 flex items-center gap-6">
          <CircularProgress 
            progress={summary?.overallScore || 0} 
            size={100} 
            strokeWidth={8}
            color="white"
            bgColor="rgba(255,255,255,0.2)"
          />
          <div className="flex-1">
            <p className="text-label-md mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Daily Vitality Score
            </p>
            <p 
              className="font-display font-bold text-display-sm"
              style={{ color: 'white' }}
            >
              {summary?.overallScore || 0}%
            </p>
            <p className="text-body-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Keep up the great work!
            </p>
          </div>
        </div>
        <Flame 
          className="absolute right-4 bottom-4 opacity-10" 
          size={120} 
          color="white"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          className="card"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-fixed)' }}
            >
              <Footprints size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Steps
            </span>
          </div>
          <p 
            className="font-display font-bold text-headline-md"
            style={{ color: 'var(--on-surface)' }}
          >
            {(summary?.steps || 0).toLocaleString()}
          </p>
          <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Goal: 10,000
          </p>
        </div>

        <div 
          className="card"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--tertiary-fixed)' }}
            >
              <Droplets size={20} style={{ color: 'var(--tertiary)' }} />
            </div>
            <span className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Hydration
            </span>
          </div>
          <p 
            className="font-display font-bold text-headline-md"
            style={{ color: 'var(--on-surface)' }}
          >
            {summary?.hydrationPercent || 0}%
          </p>
          <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Goal: 2.5L
          </p>
        </div>
      </div>

      {/* Habit Grid */}
      <div>
        <h2 
          className="font-display font-semibold text-headline-sm mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Track Your Habits
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {habitCards.map(({ id, label, icon: Icon, color, bgColor, path }) => (
            <Link
              key={id}
              to={path}
              className="card p-4 transition-transform active:scale-95"
              style={{ backgroundColor: 'var(--surface-container-lowest)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: bgColor }}
                >
                  <Icon size={24} style={{ color }} />
                </div>
                <ChevronRight size={16} style={{ color: 'var(--outline)' }} />
              </div>
              <p 
                className="font-medium text-body-md"
                style={{ color: 'var(--on-surface)' }}
              >
                {label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Daily Check-In CTA */}
      <Link
        to="/check-in"
        className="card flex items-center gap-4 transition-transform active:scale-95"
        style={{ 
          background: 'linear-gradient(135deg, var(--secondary-container) 0%, var(--primary-fixed) 100%)'
        }}
      >
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-container-lowest)' }}
        >
          <CheckCircle2 size={28} style={{ color: 'var(--primary)' }} />
        </div>
        <div className="flex-1">
          <p 
            className="font-display font-semibold text-title-lg"
            style={{ color: 'var(--on-surface)' }}
          >
            Daily Check-In
          </p>
          <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Reflect on your day & set intentions
          </p>
        </div>
        <ChevronRight size={24} style={{ color: 'var(--on-surface)' }} />
      </Link>
    </div>
  )
}

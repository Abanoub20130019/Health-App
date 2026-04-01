import { useState } from 'react'
import { 
  User, 
  Bell, 
  Moon, 
  LogOut,
  Trophy,
  Award,
  Target,
  Zap,
  Mail
} from 'lucide-react'
import { authAPI } from '../lib/api'
import { storage } from '../utils/storage'
import type { User as UserType } from '../types'

interface ProfileProps {
  user: UserType
}

export default function Profile({ user }: ProfileProps) {
  const [settings, setSettings] = useState(storage.getSettings())
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const updateSetting = (key: string, value: unknown) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    storage.setSettings(newSettings)
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await authAPI.signOut()
      storage.clearUser()
      window.location.reload()
    } catch (error) {
      console.error('Logout failed:', error)
      // Force logout anyway
      storage.clearUser()
      window.location.reload()
    }
  }

  const handleReset = () => {
    storage.clearUser()
    window.location.reload()
  }

  const achievements = [
    { icon: Trophy, label: '7-Day Streak', color: '#e65100', bgColor: '#fff3e0' },
    { icon: Award, label: 'Perfect Week', color: '#f9a825', bgColor: '#fff8e1' },
    { icon: Target, label: 'Goal Crusher', color: '#2e7d32', bgColor: '#e8f5e9' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 
          className="font-display font-bold text-display-sm"
          style={{ color: 'var(--on-surface)' }}
        >
          Profile
        </h1>
        <p className="text-body-md mt-1" style={{ color: 'var(--on-surface-variant)' }}>
          Manage your account and preferences
        </p>
      </div>

      {/* User Card */}
      <div 
        className="card-elevated"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)'
        }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <User size={36} color="white" />
          </div>
          <div className="flex-1">
            <p 
              className="font-display font-bold text-headline-md"
              style={{ color: 'white' }}
            >
              {user.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Mail size={14} color="rgba(255,255,255,0.7)" />
              <p className="text-body-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div 
          className="card text-center p-4"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
        >
          <p 
            className="font-display font-bold text-headline-lg"
            style={{ color: 'var(--primary)' }}
          >
            12
          </p>
          <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Day Streak
          </p>
        </div>
        <div 
          className="card text-center p-4"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
        >
          <p 
            className="font-display font-bold text-headline-lg"
            style={{ color: 'var(--tertiary)' }}
          >
            85%
          </p>
          <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Avg Score
          </p>
        </div>
        <div 
          className="card text-center p-4"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
        >
          <p 
            className="font-display font-bold text-headline-lg"
            style={{ color: 'var(--secondary)' }}
          >
            45
          </p>
          <p className="text-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Days Active
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Achievements
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {achievements.map(({ icon: Icon, label, color, bgColor }) => (
            <div
              key={label}
              className="flex-shrink-0 card text-center p-4 min-w-[100px]"
              style={{ backgroundColor: bgColor }}
            >
              <Icon size={32} style={{ color }} className="mx-auto mb-2" />
              <p className="text-label-sm font-medium" style={{ color }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Goals Settings */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Daily Goals
        </h2>
        <div className="space-y-3">
          {/* Step Goal */}
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-md" style={{ color: 'var(--on-surface)' }}>
                Daily Steps
              </span>
              <span 
                className="font-semibold text-body-lg"
                style={{ color: 'var(--primary)' }}
              >
                {settings.stepGoal.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="20000"
              step="500"
              value={settings.stepGoal}
              onChange={(e) => updateSetting('stepGoal', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Water Goal */}
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-md" style={{ color: 'var(--on-surface)' }}>
                Daily Water (ml)
              </span>
              <span 
                className="font-semibold text-body-lg"
                style={{ color: 'var(--primary)' }}
              >
                {settings.waterGoal}
              </span>
            </div>
            <input
              type="range"
              min="1500"
              max="4000"
              step="100"
              value={settings.waterGoal}
              onChange={(e) => updateSetting('waterGoal', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Sleep Goal */}
          <div 
            className="card"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-md" style={{ color: 'var(--on-surface)' }}>
                Sleep Goal (hours)
              </span>
              <span 
                className="font-semibold text-body-lg"
                style={{ color: 'var(--primary)' }}
              >
                {settings.sleepGoal}
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="10"
              step="0.5"
              value={settings.sleepGoal}
              onChange={(e) => updateSetting('sleepGoal', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h2 
          className="font-display font-semibold text-title-lg mb-4"
          style={{ color: 'var(--on-surface)' }}
        >
          Preferences
        </h2>
        <div className="space-y-2">
          {/* Notifications */}
          <div 
            className="card flex items-center justify-between"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#e3f2fd' }}
              >
                <Bell size={24} style={{ color: '#1565c0' }} />
              </div>
              <span className="text-body-lg" style={{ color: 'var(--on-surface)' }}>
                Notifications
              </span>
            </div>
            <button
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className="w-14 h-8 rounded-full relative transition-all"
              style={{ 
                backgroundColor: settings.notifications ? 'var(--primary)' : 'var(--surface-container-high)'
              }}
            >
              <div 
                className="absolute top-1 w-6 h-6 rounded-full bg-white transition-all"
                style={{ 
                  left: settings.notifications ? 'calc(100% - 28px)' : '4px'
                }}
              />
            </button>
          </div>

          {/* Dark Mode */}
          <div 
            className="card flex items-center justify-between"
            style={{ backgroundColor: 'var(--surface-container-lowest)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#212121' }}
              >
                <Moon size={24} color="white" />
              </div>
              <span className="text-body-lg" style={{ color: 'var(--on-surface)' }}>
                Dark Mode
              </span>
            </div>
            <button
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              className="w-14 h-8 rounded-full relative transition-all"
              style={{ 
                backgroundColor: settings.darkMode ? 'var(--primary)' : 'var(--surface-container-high)'
              }}
            >
              <div 
                className="absolute top-1 w-6 h-6 rounded-full bg-white transition-all"
                style={{ 
                  left: settings.darkMode ? 'calc(100% - 28px)' : '4px'
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="card w-full flex items-center gap-4 text-left transition-all active:scale-95"
        style={{ 
          backgroundColor: 'var(--primary-fixed)',
        }}
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <LogOut size={24} color="white" />
        </div>
        <span className="text-body-lg font-medium" style={{ color: 'var(--primary)' }}>
          {loggingOut ? 'Logging out...' : 'Log Out'}
        </span>
      </button>

      {/* Reset Data */}
      <button
        onClick={() => setShowResetConfirm(true)}
        className="card w-full flex items-center gap-4 text-left"
        style={{ backgroundColor: 'var(--error-container)' }}
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--error)' }}
        >
          <Zap size={24} color="white" />
        </div>
        <span className="text-body-lg" style={{ color: 'var(--error)' }}>
          Reset All Data
        </span>
      </button>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowResetConfirm(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl p-6 animate-scale-in"
            style={{ backgroundColor: 'var(--surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 
              className="font-display font-bold text-headline-md mb-4"
              style={{ color: 'var(--error)' }}
            >
              Reset All Data?
            </h2>
            <p className="text-body-md mb-6" style={{ color: 'var(--on-surface-variant)' }}>
              This will clear all your data and start fresh. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{ backgroundColor: 'var(--surface-container-high)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{ backgroundColor: 'var(--error)', color: 'white' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

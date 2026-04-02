import { useState, useCallback, memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Flame, Trophy, Target } from 'lucide-react'
import type { User } from '../types'

interface HeaderProps {
  user: User
}

// Static menu items - defined outside component for stable reference
const menuItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/fasting', label: 'Intermittent Fasting', icon: '⏰' },
  { path: '/avoidances', label: 'Dietary Avoidances', icon: '🚫' },
  { path: '/walking', label: 'Movement & Walking', icon: '🚶' },
  { path: '/exercise', label: 'Structured Exercise', icon: '💪' },
  { path: '/hydration', label: 'Hydration', icon: '💧' },
  { path: '/sleep', label: 'Sleep & Recovery', icon: '😴' },
  { path: '/mindful-eating', label: 'Mindful Eating', icon: '🥗' },
  { path: '/progress', label: 'Progress Metrics', icon: '📊' },
  { path: '/check-in', label: 'Daily Check-In', icon: '✅' },
  { path: '/profile', label: 'Profile', icon: '👤' },
] as const

// Memoized menu item component
const MenuItem = memo(({
  path,
  label,
  icon,
  onClick,
}: {
  path: string
  label: string
  icon: string
  onClick: () => void
}) => (
  <Link
    to={path}
    onClick={onClick}
    className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all hover:bg-[var(--surface-container-high)]"
    style={{ 
      backgroundColor: 'var(--surface-container-lowest)',
    }}
  >
    <span className="text-2xl">{icon}</span>
    <span 
      className="text-body-lg font-medium"
      style={{ color: 'var(--on-surface)' }}
    >
      {label}
    </span>
  </Link>
))

MenuItem.displayName = 'MenuItem'

// Memoized stat pill component
const StatPill = memo(({
  icon: Icon,
  value,
  bgColor,
}: {
  icon: typeof Trophy
  value: string | number
  bgColor: string
}) => (
  <div 
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
    style={{ 
      backgroundColor: bgColor,
      color: 'white',
    }}
  >
    <Icon size={14} color="white" />
    <span className="text-label-sm font-semibold">{value}</span>
  </div>
))

StatPill.displayName = 'StatPill'

export default function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Memoized handlers to prevent unnecessary re-renders
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Memoized logo component
  const Logo = useMemo(() => (
    <div className="flex items-center gap-2.5">
      <div 
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)'
        }}
      >
        <Flame size={20} color="white" />
      </div>
      <span 
        className="font-display font-bold text-headline-sm"
        style={{ color: 'var(--primary)' }}
      >
        Vitality
      </span>
    </div>
  ), [])

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{ 
          backgroundColor: 'rgba(249, 250, 242, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(193, 200, 194, 0.3)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-16 safe-top max-w-md mx-auto w-full">
          {/* Left: Menu Button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={openMenu}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--surface-container-high)]"
              style={{ backgroundColor: 'var(--surface-container)' }}
              aria-label="Open menu"
            >
              <Menu size={22} style={{ color: 'var(--on-surface)' }} />
            </button>
            
            <Link to="/" className="flex items-center gap-2.5">
              {Logo}
            </Link>
          </div>

          {/* Right: Stats Pills */}
          <div className="flex items-center gap-2">
            <StatPill 
              icon={Trophy} 
              value={12} 
              bgColor="var(--primary)" 
            />
            <StatPill 
              icon={Target} 
              value="85%" 
              bgColor="var(--tertiary)" 
            />
          </div>
        </div>
      </header>

      {/* Full Screen Menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-[60] animate-scale-in"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between px-4 h-16 safe-top max-w-md mx-auto w-full">
            {Logo}
            <button
              onClick={closeMenu}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--surface-container-high)' }}
              aria-label="Close menu"
            >
              <X size={22} style={{ color: 'var(--on-surface)' }} />
            </button>
          </div>

          {/* Menu Content */}
          <div className="px-4 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            {/* User Card */}
            <div 
              className="mb-6 p-4 rounded-2xl"
              style={{ backgroundColor: 'var(--surface-container-low)' }}
            >
              <p className="text-label-md mb-1" style={{ color: 'var(--on-surface-variant)' }}>
                Welcome back,
              </p>
              <h2 
                className="font-display font-bold text-headline-md"
                style={{ color: 'var(--on-surface)' }}
              >
                {user.name}
              </h2>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map(({ path, label, icon }) => (
                <MenuItem
                  key={path}
                  path={path}
                  label={label}
                  icon={icon}
                  onClick={closeMenu}
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

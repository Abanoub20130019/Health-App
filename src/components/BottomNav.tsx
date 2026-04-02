import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Droplets, 
  User 
} from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/fasting', icon: Utensils, label: 'Fasting' },
  { path: '/exercise', icon: Dumbbell, label: 'Move' },
  { path: '/hydration', icon: Droplets, label: 'Hydrate' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        backgroundColor: 'rgba(249, 250, 242, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex items-center justify-around py-2 max-w-md mx-auto w-full px-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200
              al-icon-wrapper
              ${isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'}
            `}
            style={({ isActive }) => ({
              color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
            })}
          >
            <Icon 
              size={24} 
              strokeWidth={2}
            />
            <span className="text-label-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

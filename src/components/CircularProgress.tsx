import { useMemo, memo } from 'react'

interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  showPercentage?: boolean
}

// Using memo to prevent unnecessary re-renders when props haven't changed
const CircularProgress = memo(function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 6,
  color = 'var(--primary)',
  bgColor = 'var(--surface-container-high)',
  showPercentage = false,
}: CircularProgressProps) {
  // Memoize calculations to prevent recalculation on every render
  const { radius, circumference, offset } = useMemo(() => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference
    return { radius, circumference, offset }
  }, [size, strokeWidth, progress])

  // Memoize styles to prevent object recreation
  const shadowStyle = useMemo(() => ({
    filter: `drop-shadow(0 2px 4px ${color}40)`,
  }), [color])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
          style={shadowStyle}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="font-display font-bold text-title-lg"
            style={{ color }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
})

export default CircularProgress

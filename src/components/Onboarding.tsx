import { useState } from 'react'
import { ArrowRight, Sparkles, Heart, Target, Zap } from 'lucide-react'

interface OnboardingProps {
  onComplete: (name: string, email: string) => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const steps = [
    {
      icon: Sparkles,
      title: 'Welcome to Vitality',
      description: 'Your holistic wellness companion. Track habits, build consistency, and transform your health journey.',
      color: 'var(--primary)',
    },
    {
      icon: Heart,
      title: 'Holistic Approach',
      description: 'From intermittent fasting to mindful movement, sleep quality to stress management—we cover every aspect of your wellbeing.',
      color: 'var(--tertiary)',
    },
    {
      icon: Target,
      title: 'Track & Improve',
      description: 'Set goals, monitor progress, and celebrate non-scale victories. Small steps lead to remarkable changes.',
      color: 'var(--secondary)',
    },
    {
      icon: Zap,
      title: 'Let\'s Get Started',
      description: 'Create your profile to begin your wellness journey.',
      color: 'var(--primary)',
    },
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      if (name.trim()) {
        onComplete(name.trim(), email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`)
      }
    }
  }

  const currentStep = steps[step]
  const Icon = currentStep.icon

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      {/* Progress indicator */}
      <div className="flex gap-2 p-6 pt-12">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= step ? 'var(--primary)' : 'var(--surface-container-high)',
              opacity: i <= step ? 1 : 0.5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div 
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 animate-scale-in"
          style={{ 
            background: `linear-gradient(135deg, ${currentStep.color} 0%, var(--primary-container) 100%)`,
          }}
        >
          <Icon size={40} color="white" />
        </div>

        <h1 
          className="font-display font-bold text-display-sm text-center mb-4 animate-slide-up"
          style={{ color: 'var(--on-surface)' }}
        >
          {currentStep.title}
        </h1>

        <p 
          className="text-body-lg text-center max-w-sm animate-slide-up"
          style={{ color: 'var(--on-surface-variant)', animationDelay: '0.1s' }}
        >
          {currentStep.description}
        </p>

        {/* Input fields on last step */}
        {step === steps.length - 1 && (
          <div className="w-full max-w-sm mt-8 space-y-4 animate-slide-up">
            <div>
              <label 
                className="block text-label-md mb-2"
                style={{ color: 'var(--on-surface-variant)' }}
              >
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input-field w-full"
                autoFocus
              />
            </div>
            <div>
              <label 
                className="block text-label-md mb-2"
                style={{ color: 'var(--on-surface-variant)' }}
              >
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Button */}
      <div className="p-6 pb-12">
        <button
          onClick={handleNext}
          disabled={step === steps.length - 1 && !name.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{step === steps.length - 1 ? 'Start My Journey' : 'Continue'}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}

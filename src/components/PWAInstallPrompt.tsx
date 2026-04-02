import { useEffect, useState, useCallback } from 'react'
import { Download, X, Share, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstalled(true)
      setShowPrompt(false)
      console.log('PWA was installed')
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // For iOS, show prompt after delay
    if (isIOSDevice) {
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true)
        }
      }, 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowPrompt(false)
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }, [])

  // Don't show if recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) { // Don't show for 7 days
        setShowPrompt(false)
      }
    }
  }, [])

  if (!showPrompt || isInstalled) return null

  return (
    <div 
      className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up"
      style={{ maxWidth: '400px', margin: '0 auto' }}
    >
      <div 
        className="card-elevated p-4"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
          color: 'white'
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {isIOS ? <Share size={24} color="white" /> : <Download size={24} color="white" />}
            </div>
            <div>
              <p className="font-display font-semibold text-body-lg">
                Install Vitality App
              </p>
              <p className="text-body-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {isIOS 
                  ? 'Tap Share → Add to Home Screen' 
                  : 'Add to your home screen for quick access'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1 rounded-lg transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            aria-label="Dismiss"
          >
            <X size={20} color="white" />
          </button>
        </div>

        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full mt-4 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ 
              backgroundColor: 'white',
              color: 'var(--primary)'
            }}
          >
            <Smartphone size={20} />
            Install App
          </button>
        )}

        {isIOS && (
          <div className="mt-4 p-3 rounded-xl text-body-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <p>1. Tap the <strong>Share</strong> button in Safari</p>
            <p>2. Scroll down and tap <strong>Add to Home Screen</strong></p>
          </div>
        )}
      </div>
    </div>
  )
}

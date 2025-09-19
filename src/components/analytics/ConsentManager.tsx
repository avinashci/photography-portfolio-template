'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Eye, Settings, Check } from 'lucide-react'
// Temporary placeholder components until shadcn/ui is set up
const Button = ({ children, onClick, variant = 'default', className = '', size = 'default', disabled = false, ...props }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2 ${
      variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' :
      variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' :
      'bg-primary text-primary-foreground hover:bg-primary/90'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
)

const Card = ({ children, className = '', ...props }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

const CardContent = ({ children, className = '', ...props }: any) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '', ...props }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '', ...props }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
)

const Switch = ({ checked, onCheckedChange, disabled = false, className = '', ...props }: any) => (
  <button
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onCheckedChange?.(!checked)}
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'bg-primary' : 'bg-input'
    } ${className}`}
    {...props}
  >
    <span
      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
)
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { SITE_CONFIG } from '@/config/site.config'

// 🎓 LEARNING: Privacy Consent UI States
type ConsentView = 'banner' | 'preferences' | 'hidden'

// 🎓 LEARNING: Granular Consent Types
interface ConsentPreferences {
  essential: boolean      // Always true (required for site function)
  analytics: boolean      // Google Analytics tracking
  performance: boolean    // Performance monitoring
  functionality: boolean  // Enhanced features
}

// 🎓 LEARNING: Privacy-First Component Architecture
export const ConsentManager: React.FC = () => {
  const { hasConsent, grantConsent, denyConsent } = useAnalytics()
  const [view, setView] = useState<ConsentView>('hidden')
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,      // Always required
    analytics: true,      // Default to true for better UX
    performance: true,    // Default to true for optimization
    functionality: true,  // Default to true for features
  })

  // 🎓 LEARNING: Consent State Management
  useEffect(() => {
    // Show banner if no consent decision has been made
    if (hasConsent === null && SITE_CONFIG.analytics.privacy.requireConsent) {
      setView('banner')
    } else {
      setView('hidden')
    }
  }, [hasConsent])

  // 🎓 LEARNING: Granular Consent Logic
  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      analytics: true,
      performance: true,
      functionality: true,
    })
    grantConsent()
    setView('hidden')
  }

  const handleRejectAll = () => {
    setPreferences({
      essential: true,     // Essential cookies cannot be rejected
      analytics: false,
      performance: false,
      functionality: false,
    })
    denyConsent()
    setView('hidden')
  }

  const handleSavePreferences = () => {
    // Grant consent if analytics is enabled
    if (preferences.analytics) {
      grantConsent()
    } else {
      denyConsent()
    }
    setView('hidden')
  }

  // 🎓 LEARNING: Conditional Rendering Pattern
  if (!SITE_CONFIG.analytics.privacy.requireConsent) {
    return null // No consent required
  }

  return (
    <AnimatePresence>
      {view !== 'hidden' && (
        <>
          {/* 🎓 LEARNING: Backdrop Pattern */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setView('hidden')}
          />

          {/* 🎓 LEARNING: Consent Banner */}
          {view === 'banner' && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 lg:max-w-2xl lg:left-auto lg:right-6 z-50"
            >
              <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg font-semibold">
                        Privacy & Cookies
                      </CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We use analytics to understand how you interact with our photography 
                        portfolio and improve your experience. Your privacy is important to us.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* 🎓 LEARNING: Quick Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleAcceptAll}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept All
                      </Button>
                      <Button
                        onClick={handleRejectAll}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        Reject All
                      </Button>
                      <Button
                        onClick={() => setView('preferences')}
                        variant="ghost"
                        className="flex-1"
                        size="sm"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    </div>

                    {/* 🎓 LEARNING: Legal Links */}
                    <div className="text-xs text-muted-foreground text-center">
                      By using our site, you agree to our{' '}
                      <Link href="/privacy" className="underline hover:text-foreground">
                        Privacy Policy
                      </Link>{' '}
                      and{' '}
                      <Link href="/terms" className="underline hover:text-foreground">
                        Terms of Service
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 🎓 LEARNING: Detailed Preferences Modal */}
          {view === 'preferences' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-8 lg:inset-16 xl:inset-24 z-50 overflow-y-auto"
            >
              <Card className="h-full shadow-2xl bg-background border-2 border-primary/20">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">Privacy Preferences</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setView('banner')}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-8">
                  {/* 🎓 LEARNING: Preference Categories */}
                  
                  {/* Essential Cookies */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">Essential Cookies</h3>
                        <p className="text-sm text-muted-foreground">
                          Required for the website to function properly. Cannot be disabled.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.essential}
                        disabled={true}
                        className="opacity-50"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground ml-4 space-y-1">
                      <div>• Session management and security</div>
                      <div>• Language preferences</div>
                      <div>• Theme settings</div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">Analytics Cookies</h3>
                        <p className="text-sm text-muted-foreground">
                          Help us understand how visitors interact with our photography portfolio.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(checked: boolean) =>
                          setPreferences(prev => ({ ...prev, analytics: checked }))
                        }
                      />
                    </div>
                    <div className="text-xs text-muted-foreground ml-4 space-y-1">
                      <div>• Page views and navigation patterns</div>
                      <div>• Image and gallery interactions</div>
                      <div>• Popular content identification</div>
                      <div>• Anonymous usage statistics</div>
                    </div>
                  </div>

                  {/* Performance Cookies */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">Performance Cookies</h3>
                        <p className="text-sm text-muted-foreground">
                          Monitor site performance and loading times for optimization.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.performance}
                        onCheckedChange={(checked: boolean) =>
                          setPreferences(prev => ({ ...prev, performance: checked }))
                        }
                      />
                    </div>
                    <div className="text-xs text-muted-foreground ml-4 space-y-1">
                      <div>• Page loading speed metrics</div>
                      <div>• Image optimization performance</div>
                      <div>• Core Web Vitals monitoring</div>
                    </div>
                  </div>

                  {/* Functionality Cookies */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">Functionality Cookies</h3>
                        <p className="text-sm text-muted-foreground">
                          Enable enhanced features and personalized experiences.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.functionality}
                        onCheckedChange={(checked: boolean) =>
                          setPreferences(prev => ({ ...prev, functionality: checked }))
                        }
                      />
                    </div>
                    <div className="text-xs text-muted-foreground ml-4 space-y-1">
                      <div>• Personalized content recommendations</div>
                      <div>• Social media integrations</div>
                      <div>• Enhanced gallery features</div>
                    </div>
                  </div>

                  {/* 🎓 LEARNING: Data Retention Information */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Data Retention</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Analytics data is retained for {SITE_CONFIG.analytics.privacy.cookieExpiryDays} days 
                            and is automatically anonymized.
                          </p>
                          <p>
                            You can change your preferences at any time or request data deletion.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button
                      onClick={handleSavePreferences}
                      className="flex-1"
                    >
                      Save Preferences
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      variant="outline"
                      className="flex-1"
                    >
                      Accept All
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      variant="ghost"
                      className="flex-1"
                    >
                      Reject All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

export default ConsentManager
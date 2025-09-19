'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supportsWebP } from '@/lib/utils/image-utils'

export default function BrowserCompatibilityWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const checkSupport = async () => {
      const webpSupported = await supportsWebP()
      
      if (!webpSupported) {
        // Check if user has already dismissed this warning
        const dismissed = localStorage.getItem('browser-warning-dismissed')
        if (!dismissed) {
          setShowWarning(true)
        }
      }
    }

    checkSupport()
  }, [])

  const dismissWarning = () => {
    setShowWarning(false)
    localStorage.setItem('browser-warning-dismissed', 'true')
  }

  // Don't render anything on server or if no warning needed
  if (!isClient || !showWarning) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">
              Your browser doesn't support modern image formats. 
              <span className="hidden sm:inline"> Some images may not display correctly. Please update your browser for the best experience.</span>
            </p>
          </div>
        </div>
        <button
          onClick={dismissWarning}
          className="flex-shrink-0 ml-4 p-1 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Dismiss warning"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
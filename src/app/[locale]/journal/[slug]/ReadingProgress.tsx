'use client'

import { useEffect, useState } from 'react'

interface ReadingProgressProps {
  readTime: string
}

export default function ReadingProgress({ readTime }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article')
      if (!article) return

      const articleTop = article.offsetTop
      const articleHeight = article.scrollHeight
      const windowHeight = window.innerHeight
      const scrollTop = window.scrollY

      // Show progress bar when user scrolls past the header
      setIsVisible(scrollTop > 200)

      // Calculate reading progress
      const articleBottom = articleTop + articleHeight - windowHeight
      const scrollProgress = Math.min(Math.max((scrollTop - articleTop) / (articleBottom - articleTop), 0), 1)
      
      setProgress(scrollProgress * 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Progress Bar */}
      <div className={`fixed top-0 left-0 z-50 w-full h-1 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Reading Progress */}
      <div className={`fixed bottom-8 right-8 z-40 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-card border border-border rounded-full p-4 shadow-lg backdrop-blur-sm">
          <div className="relative w-12 h-12">
            {/* Background circle */}
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground/20"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${progress} 100`}
                className="text-primary transition-all duration-150 ease-out"
              />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Reading time indicator */}
        <div className="mt-2 text-center">
          <span className="text-xs text-muted-foreground bg-card px-2 py-1 rounded border border-border">
            {readTime}
          </span>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 left-8 z-40 p-3 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          progress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      </button>
    </>
  )
}
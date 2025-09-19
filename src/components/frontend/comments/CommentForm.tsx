'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Label } from '@/components/ui/base/label'
import { Loader2, Send, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  imageId: string
  imageSlug: string
  imageTitle: string
  className?: string
}

interface CommentFormData {
  name: string
  content: string
  honeypot: string // Hidden field for bot detection
}

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'

export default function CommentForm({
  imageId,
  imageSlug,
  imageTitle,
  className,
}: CommentFormProps) {
  const t = useTranslations('comments')
  const [formData, setFormData] = useState<CommentFormData>({
    name: '',
    content: '',
    honeypot: '',
  })
  
  const [state, setState] = useState<SubmissionState>('idle')
  const [error, setError] = useState<string>('')
  const [characterCount, setCharacterCount] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [submissionStartTime, setSubmissionStartTime] = useState<number>(0)
  
  const formRef = useRef<HTMLFormElement>(null)
  const maxLength = 1000

  // Track when user starts filling the form (for anti-bot timing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubmissionStartTime(Date.now())
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Update character count when content changes
  useEffect(() => {
    setCharacterCount(formData.content.length)
  }, [formData.content])

  const handleInputChange = (field: keyof CommentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Name is required'
    }
    if (formData.name.length > 100) {
      return 'Name must be less than 100 characters'
    }
    if (!formData.content.trim()) {
      return 'Comment is required'
    }
    if (formData.content.length > maxLength) {
      return `Comment must be less than ${maxLength} characters`
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setState('submitting')
    setError('')

    try {
      const submissionTime = submissionStartTime > 0 ? Date.now() - submissionStartTime : 0
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          relatedTo: {
            type: 'image',
            itemId: imageId,
            itemSlug: imageSlug,
            itemTitle: imageTitle,
          },
          submissionTime,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit comment')
      }

      // Success - reset form and show success message
      setState('success')
      setFormData({
        name: '',
        content: '',
        honeypot: '',
      })
      setCharacterCount(0)
      setShowPreview(false)

      // Reset success state after a delay
      setTimeout(() => {
        setState('idle')
      }, 5000)

    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const isSubmitting = state === 'submitting'
  const isSuccess = state === 'success'

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{t('form.title')}</h3>
        </div>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="text-sm text-green-800 dark:text-green-200">
            <p className="font-medium">Comment submitted successfully!</p>
            <p className="mt-1">Thanks for your feedback. Your comment will be reviewed and published soon.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="text-sm text-red-800 dark:text-red-200">
            <p className="font-medium">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden honeypot field */}
        <input
          type="text"
          name="website_url"
          value={formData.honeypot}
          onChange={(e) => handleInputChange('honeypot', e.target.value)}
          style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="comment-name" className="text-sm font-medium">
            Name *
          </Label>
          <Input
            id="comment-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Your name"
            maxLength={100}
            required
            disabled={isSubmitting}
            className="w-full"
          />
        </div>

        {/* Comment Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="comment-content" className="text-sm font-medium">
              Comment *
            </Label>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className={cn(
                characterCount > maxLength * 0.8 && characterCount <= maxLength && 'text-orange-600',
                characterCount > maxLength && 'text-red-600'
              )}>
                {characterCount}/{maxLength}
              </span>
              {!showPreview && (
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="underline hover:no-underline"
                  disabled={isSubmitting}
                >
                  Preview
                </button>
              )}
            </div>
          </div>
          
          {showPreview ? (
            <div className="space-y-2">
              <div className="min-h-[120px] p-3 border rounded-lg bg-muted/50">
                <div className="text-sm whitespace-pre-wrap">
                  {formData.content || 'Your comment preview will appear here...'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-xs text-primary underline hover:no-underline"
                disabled={isSubmitting}
              >
                Edit comment
              </button>
            </div>
          ) : (
            <textarea
              id="comment-content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Share your thoughts about this image..."
              maxLength={maxLength}
              rows={5}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-input rounded-lg resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          )}
          
          {/* Moderation Notice */}
          <p className="text-xs text-muted-foreground mt-2">
            {t('moderationNotice')}
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Comment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { Search, X, Grid, Camera, BookOpen, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Badge } from '@/components/ui/base/badge'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: { en: string; ta: string }
  slug: string
  description?: { en: string; ta: string }
  excerpt?: { en: string; ta: string }
  type: 'gallery' | 'image' | 'blog'
  imageUrls?: {
    thumbnail?: string
    medium?: string
    full?: string
  }
  coverImage?: any
  featuredImage?: any
  gallery?: {
    title: { en: string; ta: string }
    slug: string
  }
}

interface SearchResults {
  galleries: SearchResult[]
  images: SearchResult[]
  blogPosts: SearchResult[]
  totalResults: number
}

// Helper function for getting localized values
function getLocalizedValue<T>(value: { en: T; ta: T } | T | undefined, locale: 'en'): T | '' {
  if (!value) return '' as T
  
  // If it's already a plain string/value, return it directly
  if (typeof value === 'string' || typeof value !== 'object') {
    return value as T
  }
  
  // If it's a localized object, handle accordingly
  if (typeof value === 'object' && 'en' in value && 'ta' in value) {
    const localized = value[locale]
    const fallback = value.en
    return localized || fallback || '' as T
  }
  
  return value as T || '' as T
}

interface HeaderSearchProps {
  className?: string
}

export default function HeaderSearch({ className }: HeaderSearchProps) {
  const t = useTranslations()
  const router = useRouter()
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResults>({
    galleries: [],
    images: [],
    blogPosts: [],
    totalResults: 0
  })
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search function
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setResults({
          galleries: [],
          images: [],
          blogPosts: [],
          totalResults: 0
        })
        return
      }

      setIsSearching(true)
      
      try {
        const searchParams = new URLSearchParams({
          q: query,
          locale,
          limit: '8' // Fewer results for header dropdown
        })

        const response = await fetch(`/api/search?${searchParams}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results)
        } else {
          setResults({
            galleries: [],
            images: [],
            blogPosts: [],
            totalResults: 0
          })
        }
      } catch (error) {
        console.error('Header search error:', error)
        setResults({
          galleries: [],
          images: [],
          blogPosts: [],
          totalResults: 0
        })
      } finally {
        setIsSearching(false)
      }
    },
    [locale]
  )

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, performSearch])

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // CMD/CTRL + K to open search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      
      // Escape to close
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const getResultUrl = (result: SearchResult) => {
    switch (result.type) {
      case 'gallery':
        return `/${locale}/galleries/${result.slug}`
      case 'image':
        return `/${locale}/galleries/${result.gallery?.slug || 'gallery'}/images/${result.slug}`
      case 'blog':
        return `/${locale}/journal/${result.slug}`
      default:
        return '#'
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'gallery':
        return <Grid className="w-3 h-3" />
      case 'image':
        return <Camera className="w-3 h-3" />
      case 'blog':
        return <BookOpen className="w-3 h-3" />
      default:
        return null
    }
  }

  const getResultImage = (result: SearchResult) => {
    if (result.imageUrls?.thumbnail) {
      return result.imageUrls.thumbnail
    }
    if (result.coverImage?.imageUrls?.thumbnail) {
      return result.coverImage.imageUrls.thumbnail
    }
    if (result.featuredImage?.imageUrls?.thumbnail) {
      return result.featuredImage.imageUrls.thumbnail
    }
    return null
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setSearchTerm('')
    router.push(getResultUrl(result))
  }

  const handleViewAllResults = () => {
    setIsOpen(false)
    router.push(`/${locale}/search?q=${encodeURIComponent(searchTerm)}`)
  }

  // Get top results for quick display (2 from each category)
  const topResults = [
    ...results.galleries.slice(0, 2),
    ...results.images.slice(0, 2),
    ...results.blogPosts.slice(0, 2)
  ].slice(0, 6)

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Search Button/Icon */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="text-white/80 hover:text-white hover:bg-white/10"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Search Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Search Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Search Input */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={t('search.shortPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 border-0 focus:ring-0 bg-secondary/50"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Quick tip */}
              <div className="mt-2 text-xs text-muted-foreground text-center">
                {locale === 'ta' ? 'Cmd+K செய்து திறக்கவும்' : 'Press Cmd+K to open'}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <span className="text-sm">{locale === 'ta' ? 'தேடப்படுகிறது...' : 'Searching...'}</span>
                </div>
              ) : topResults.length > 0 ? (
                <div className="py-2">
                  {topResults.map((result) => (
                    <button
                      key={result.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                      onClick={() => handleResultClick(result)}
                    >
                      {/* Result Image */}
                      <div className="w-10 h-10 bg-muted rounded flex-shrink-0 overflow-hidden">
                        {getResultImage(result) ? (
                          <img
                            src={getResultImage(result)!}
                            alt={getLocalizedValue(result.title, locale as 'en')}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            {getResultIcon(result.type)}
                          </div>
                        )}
                      </div>

                      {/* Result Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {getLocalizedValue(result.title, locale as 'en')}
                          </h4>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {getResultIcon(result.type)}
                            <span className="ml-1">
                              {result.type === 'gallery' ? (locale === 'ta' ? 'கேலரி' : 'Gallery') :
                               result.type === 'image' ? (locale === 'ta' ? 'படம்' : 'Image') :
                               (locale === 'ta' ? 'பதிவு' : 'Journal')}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {getLocalizedValue(result.excerpt || result.description, locale as 'en')}
                        </p>
                      </div>
                    </button>
                  ))}
                  
                  {/* View All Results */}
                  {results.totalResults > topResults.length && (
                    <div className="border-t border-border p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between"
                        onClick={handleViewAllResults}
                      >
                        <span>
                          {locale === 'ta' ? 
                            `மேலும் ${results.totalResults - topResults.length} முடிவுகளைக் காண்க` :
                            `View ${results.totalResults - topResults.length} more results`
                          }
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <span className="text-sm">
                    {locale === 'ta' ? 'முடிவுகள் இல்லை' : 'No results found'}
                  </span>
                </div>
              ) : searchTerm.length > 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <span className="text-sm">
                    {locale === 'ta' ? 'குறைந்தது 2 எழுத்துக்களை உள்ளிடவும்' : 'Type at least 2 characters'}
                  </span>
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm mb-2">
                    {locale === 'ta' ? 'கேலரிகள், படங்கள், பதிவுகளைத் தேடுங்கள்' : 'Search galleries, images, and journal entries'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={`/${locale}/search`}>
                      {locale === 'ta' ? 'மேம்பட்ட தேடல்' : 'Advanced Search'}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
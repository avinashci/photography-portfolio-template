'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Grid, List, Calendar, Camera, BookOpen, MapPin, Tag } from 'lucide-react'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Badge } from '@/components/ui/base/badge'
import { Card, CardContent } from '@/components/ui/layout/card'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: { en: string; ta: string }
  slug: string
  description?: { en: string; ta: string }
  excerpt?: { en: string; ta: string }
  subtitle?: { en: string; ta: string }
  tags?: { en: string[]; ta: string[] }
  type: 'gallery' | 'image' | 'blog'
  imageUrls?: {
    thumbnail?: string
    medium?: string
    full?: string
  }
  coverImage?: any
  featuredImage?: any
  imageCount?: number
  photographyStyle?: string
  publishedAt?: string
  captureDate?: string
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

interface SearchClientProps {
  locale: 'en'
  initialQuery?: string
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

export default function SearchClient({ locale, initialQuery = '' }: SearchClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults>({
    galleries: [],
    images: [],
    blogPosts: [],
    totalResults: 0
  })
  const [isSearching, setIsSearching] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [hasSearched, setHasSearched] = useState(!!initialQuery)

  // Debounced search function
  const performSearch = useCallback(
    async (query: string, type: string = 'all') => {
      if (!query.trim() || query.length < 2) {
        setResults({
          galleries: [],
          images: [],
          blogPosts: [],
          totalResults: 0
        })
        setHasSearched(false)
        return
      }

      setIsSearching(true)
      setHasSearched(true)
      
      try {
        const searchParams = new URLSearchParams({
          q: query,
          locale,
          type: type !== 'all' ? type : '',
          limit: '50'
        })

        const response = await fetch(`/api/search?${searchParams}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results)
        } else {
          console.error('Search failed:', response.statusText)
          setResults({
            galleries: [],
            images: [],
            blogPosts: [],
            totalResults: 0
          })
        }
      } catch (error) {
        console.error('Search error:', error)
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

  // Update URL when search changes
  const updateURL = useCallback((query: string) => {
    const params = new URLSearchParams()
    if (query) {
      params.set('q', query)
    }
    
    const newURL = `/search${params.toString() ? `?${params.toString()}` : ''}`
    router.replace(newURL, { scroll: false })
  }, [router])

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== initialQuery) {
        updateURL(searchTerm)
      }
      performSearch(searchTerm, selectedType)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedType, performSearch, updateURL, initialQuery])

  // Initial search if query provided
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, selectedType)
    }
  }, [initialQuery, selectedType, performSearch])

  const filteredResults = () => {
    switch (selectedType) {
      case 'galleries':
        return [...results.galleries]
      case 'images':
        return [...results.images]
      case 'blog':
        return [...results.blogPosts]
      default:
        return [...results.galleries, ...results.images, ...results.blogPosts]
    }
  }

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
        return <Grid className="w-4 h-4" />
      case 'image':
        return <Camera className="w-4 h-4" />
      case 'blog':
        return <BookOpen className="w-4 h-4" />
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

  const typeFilters = [
    { key: 'all', label: 'All' },
    { key: 'galleries', label: 'Galleries' },
    { key: 'images', label: 'Images' },
    { key: 'blog', label: 'Journal' }
  ]

  const displayResults = filteredResults()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Search Input */}
      <div className="space-y-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search galleries, images, journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-4 text-lg rounded-xl border-2 focus:border-primary"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          {typeFilters.map((filter) => (
            <Button
              key={filter.key}
              variant={filter.key === selectedType ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(filter.key)}
              className="rounded-full"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* View Mode Toggle */}
        {displayResults.length > 0 && (
          <div className="flex justify-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      {hasSearched && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isSearching ? (
'Searching...'
            ) : displayResults.length === 0 ? (
'No results found'
            ) : (
`Found ${displayResults.length} results${searchTerm ? ` for "${searchTerm}"` : ''}`
            )}
          </p>
        </div>
      )}

      {/* Results */}
      {displayResults.length > 0 && (
        <div className={cn(
          "gap-6",
          viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
        )}>
          {displayResults.map((result) => (
            <Link key={result.id} href={getResultUrl(result)} className="group">
              <Card className={cn(
                "overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]",
                viewMode === 'list' ? "flex" : ""
              )}>
                {/* Image */}
                <div className={cn(
                  "bg-muted relative overflow-hidden",
                  viewMode === 'grid' ? "aspect-[4/3]" : "w-40 h-28 flex-shrink-0",
                  viewMode === 'list' ? "md:w-48 md:h-32" : ""
                )}>
                  {getResultImage(result) ? (
                    <img
                      src={getResultImage(result)!}
                      alt={getLocalizedValue(result.title, locale)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      {getResultIcon(result.type)}
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      {getResultIcon(result.type)}
                      <span className="ml-1">
                        {result.type === 'gallery' ? 'Gallery' :
                         result.type === 'image' ? 'Image' :
                         'Journal'}
                      </span>
                    </Badge>
                  </div>

                  {/* Image count for galleries */}
                  {result.type === 'gallery' && result.imageCount && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {result.imageCount} images
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className={cn(
                  "p-4",
                  viewMode === 'list' ? "flex-1" : ""
                )}>
                  {/* Title */}
                  <h3 className={cn(
                    "font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2",
                    viewMode === 'grid' ? "text-lg" : "text-base"
                  )}>
                    {getLocalizedValue(result.title, locale)}
                  </h3>

                  {/* Subtitle for blog posts */}
                  {result.subtitle && (
                    <h4 className="text-sm text-muted-foreground font-medium mb-2 line-clamp-1">
                      {getLocalizedValue(result.subtitle, locale)}
                    </h4>
                  )}

                  {/* Description/Excerpt */}
                  <p className={cn(
                    "text-muted-foreground leading-relaxed mb-3",
                    viewMode === 'grid' ? "text-sm line-clamp-3" : "text-xs line-clamp-2"
                  )}>
                    {getLocalizedValue(result.excerpt || result.description, locale)}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {/* Gallery for images */}
                    {result.type === 'image' && result.gallery && (
                      <>
                        <MapPin className="w-3 h-3" />
                        <span>{getLocalizedValue(result.gallery.title, locale)}</span>
                        <span>•</span>
                      </>
                    )}

                    {/* Photography style */}
                    {result.photographyStyle && (
                      <>
                        <Camera className="w-3 h-3" />
                        <span className="capitalize">{result.photographyStyle}</span>
                        <span>•</span>
                      </>
                    )}

                    {/* Date */}
                    {(result.publishedAt || result.captureDate) && (
                      <>
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(result.publishedAt || result.captureDate!).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  {result.tags && Array.isArray(getLocalizedValue(result.tags, locale)) && (getLocalizedValue(result.tags, locale) as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {Array.isArray(getLocalizedValue(result.tags, locale)) && (getLocalizedValue(result.tags, locale) as string[]).slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {Array.isArray(getLocalizedValue(result.tags, locale)) && (getLocalizedValue(result.tags, locale) as string[]).length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(getLocalizedValue(result.tags, locale) as string[]).length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* No Results State */}
      {hasSearched && !isSearching && displayResults.length === 0 && searchTerm.length >= 2 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 opacity-20">
            <Search className="w-full h-full" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
No results found
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
`Couldn't find anything matching "${searchTerm}". Try different search terms or browse our content.`
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link href={`/${locale}/galleries`}>
Browse Galleries
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${locale}/journal`}>
Browse Journal
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Welcome State */}
      {!hasSearched && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 opacity-40">
            <Search className="w-full h-full" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
Search My Portfolio
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
'Find anything across galleries, images, and travel journal entries.'
          </p>
          <p className="text-sm text-muted-foreground">
'Start typing to search (minimum 2 characters)'
          </p>
        </div>
      )}
    </div>
  )
}
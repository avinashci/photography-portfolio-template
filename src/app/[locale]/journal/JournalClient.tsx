'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Badge } from '@/components/ui/base/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/layout/card'
import { cn } from '@/lib/utils'
import { getCardImageSrc } from '@/lib/utils/image-utils'
import type { PayloadImage } from '@/lib/api/api-client'

interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle?: string
  tripDates?: string
  excerpt: string
  coverImage: string | PayloadImage
  publishDate: string
  readTime: string
  category: string
  tags: string[]
  featured: boolean
}

interface JournalClientProps {
  blogPosts: BlogPost[]
  categories: string[]
}

export default function JournalClient({ blogPosts, categories }: JournalClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter posts based on selected category and search term
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const featuredPosts = filteredPosts.filter(post => post.featured)
  const recentPosts = filteredPosts.filter(post => !post.featured)

  return (
    <>
      {/* Search and Filter Section */}
      <section className="mb-12">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <label htmlFor="article-search" className="sr-only">
              Search articles
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="article-search"
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label="Search articles"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        {(searchTerm || selectedCategory !== 'All') && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              {filteredPosts.length === 0 
                ? 'No articles found' 
                : `Found ${filteredPosts.length} article${filteredPosts.length !== 1 ? 's' : ''}`
              }
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>
        )}
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-20">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-8">Featured Stories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Link key={post.id} href={`/journal/${post.slug}`} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                    {post.coverImage ? (
                      <>
                        <img
                          src={typeof post.coverImage === 'string'
                            ? post.coverImage
                            : getCardImageSrc(post.coverImage as PayloadImage)
                          }
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-3 opacity-40">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                            </svg>
                          </div>
                          <p className="text-sm">{post.title}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <span>•</span>
                      <span>{new Date(post.publishDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.subtitle && (
                      <h4 className="text-sm md:text-base text-muted-foreground font-medium mb-1">
                        {post.subtitle}
                      </h4>
                    )}
                    {post.tripDates && (
                      <p className="text-xs text-muted-foreground/80 mb-2 italic">
                        {post.tripDates}
                      </p>
                    )}
                    <p className="text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts Grid */}
      {recentPosts.length > 0 && (
        <section>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
            {featuredPosts.length > 0 ? 'Recent Articles' : 'All Articles'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/journal/${post.slug}`} className="group">
                <article className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                    {post.coverImage ? (
                      <>
                        <img
                          src={typeof post.coverImage === 'string'
                            ? post.coverImage
                            : getCardImageSrc(post.coverImage as PayloadImage)
                          }
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 opacity-40">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                            </svg>
                          </div>
                          <p className="text-xs">{post.title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                        {post.category}
                      </span>
                      <span>•</span>
                      <span>{new Date(post.publishDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.subtitle && (
                      <h4 className="text-xs text-muted-foreground font-medium mb-1 line-clamp-1">
                        {post.subtitle}
                      </h4>
                    )}
                    {post.tripDates && (
                      <p className="text-xs text-muted-foreground/80 mb-2 italic">
                        {post.tripDates}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <section className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 opacity-20">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h3 className="font-serif text-2xl font-bold text-foreground mb-4">No articles found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search terms or browse all categories.
          </p>
          <Button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('All')
            }}
          >
            Clear Filters
          </Button>
        </section>
      )}
    </>
  )
}
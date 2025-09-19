'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, User, Calendar, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/base/button'
import { cn } from '@/lib/utils'

export interface Comment {
  id: string
  author: {
    name: string
  }
  content: string
  createdAt: string
  status: 'approved'
}

interface CommentsListProps {
  imageId: string
  className?: string
  refreshTrigger?: number // For refreshing after new comments
}

const COMMENTS_PER_PAGE = 10

export default function CommentsList({ 
  imageId, 
  className,
  refreshTrigger = 0 
}: CommentsListProps) {
  const t = useTranslations('comments')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())

  // Fetch comments with useCallback to prevent infinite re-renders
  const fetchComments = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(
        `/api/comments?imageId=${encodeURIComponent(imageId)}&page=${pageNum}&limit=${COMMENTS_PER_PAGE}`
      )

      if (!response.ok) {
        throw new Error('Failed to load comments')
      }

      const data = await response.json()

      if (append) {
        setComments(prev => [...prev, ...data.comments])
      } else {
        setComments(data.comments)
      }

      setHasMore(data.hasMore)
      setPage(pageNum)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [imageId])

  // Initial load and refresh trigger
  useEffect(() => {
    fetchComments(1, false)
  }, [imageId, refreshTrigger]) // Removed fetchComments from dependency array

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchComments(page + 1, true)
    }
  }, [fetchComments, loadingMore, hasMore, page])

  const handleRefresh = useCallback(() => {
    fetchComments(1, false)
  }, [fetchComments])

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + '...'
  }

  if (loading && comments.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comments
          </h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-muted/50 rounded-lg animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comments
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </h3>
        {comments.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn(
              "w-4 h-4 mr-1",
              loading && "animate-spin"
            )} />
            Refresh
          </Button>
        )}
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No comments yet</p>
          <p className="text-xs mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isLongComment = comment.content.length > 200
            const isExpanded = expandedComments.has(comment.id)
            const displayContent = isLongComment && !isExpanded 
              ? truncateContent(comment.content)
              : comment.content

            return (
              <div
                key={comment.id}
                className="p-4 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{comment.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="pl-11">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {displayContent}
                  </div>

                  {/* Expand/Collapse Button */}
                  {isLongComment && (
                    <button
                      onClick={() => toggleCommentExpansion(comment.id)}
                      className="inline-flex items-center text-xs text-primary hover:underline mt-2"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Show more
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="min-w-[120px]"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Load More Comments
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pending Moderation Notice */}
      {comments.length > 0 && (
        <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
          Comments are moderated and may not appear immediately after submission.
        </div>
      )}
    </div>
  )
}
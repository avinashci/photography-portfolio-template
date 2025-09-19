'use client'

import React, { useState, useEffect } from 'react'
import type { Comment } from '@/config/payload-types'

interface CommentModerationPanelProps {
  className?: string
}

interface CommentWithActions extends Comment {
  actions?: {
    approve: () => Promise<void>
    reject: (reason: string) => Promise<void>
    markSpam: () => Promise<void>
  }
}

export default function CommentModerationPanel({ className }: CommentModerationPanelProps) {
  const [comments, setComments] = useState<CommentWithActions[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<'draft' | 'all'>('draft')

  // Fetch pending comments via API
  const fetchComments = async () => {
    try {
      setLoading(true)
      
      // Use REST API instead of direct Payload client
      const statusParam = selectedStatus === 'draft' ? '?status=draft' : ''
      const response = await fetch(`/api/admin/comments${statusParam}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }

      const result = await response.json()

      const commentsWithActions = result.docs.map((comment: Comment) => ({
        ...comment,
        actions: {
          approve: async () => {
            const updateResponse = await fetch('/api/admin/comments', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: comment.id,
                status: 'approved'
              })
            })
            if (updateResponse.ok) {
              fetchComments() // Refresh the list
            }
          },
          reject: async (reason: string) => {
            const updateResponse = await fetch('/api/admin/comments', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: comment.id,
                status: 'rejected',
                moderatorNotes: reason
              })
            })
            if (updateResponse.ok) {
              fetchComments() // Refresh the list
            }
          },
          markSpam: async () => {
            const updateResponse = await fetch('/api/admin/comments', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: comment.id,
                status: 'spam',
                moderatorNotes: 'Marked as spam during moderation'
              })
            })
            if (updateResponse.ok) {
              fetchComments() // Refresh the list
            }
          }
        }
      }))

      setComments(commentsWithActions)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [selectedStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      case 'spam': return 'text-red-800 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Comment Moderation</h2>
        
        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as 'draft' | 'all')}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="draft">Pending ({comments.length})</option>
          <option value="all">All Comments</option>
        </select>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No {selectedStatus === 'draft' ? 'pending' : ''} comments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4 bg-white shadow-sm">
              {/* Comment Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-gray-900">{comment.author.name}</div>
                </div>
                
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(comment.status)}`}>
                    {comment.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-2">
                  Comment on: <strong>{comment.relatedTo.itemTitle}</strong> ({comment.relatedTo.type})
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {comment.content}
                </div>
              </div>

              {/* Security Info */}
              <div className="text-xs text-gray-500 mb-3">
                <div>IP: {comment.security?.ipAddress || 'Unknown'}</div>
                {(comment.spamScore ?? 0) > 0 && (
                  <div className="text-orange-600">
                    Spam Score: {comment.spamScore}/100
                  </div>
                )}
              </div>

              {/* Moderation Actions */}
              {comment.status === 'draft' && comment.actions && (
                <div className="flex space-x-2 pt-3 border-t">
                  <button
                    onClick={comment.actions.approve}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection:')
                      if (reason) comment.actions?.reject(reason)
                    }}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={comment.actions.markSpam}
                    className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Mark as Spam
                  </button>
                </div>
              )}

              {/* Show moderator notes if rejected/spam */}
              {comment.moderatorNotes && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>Moderator Notes:</strong> {comment.moderatorNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchComments}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}
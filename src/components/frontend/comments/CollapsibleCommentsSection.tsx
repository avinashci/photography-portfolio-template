'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/base/button'
import CommentForm from './CommentForm'
import CommentsList from './CommentsList'
import { cn } from '@/lib/utils'

interface CollapsibleCommentsSectionProps {
  imageId: string
  imageSlug: string
  imageTitle: string
}

export default function CollapsibleCommentsSection({
  imageId,
  imageSlug,
  imageTitle,
}: CollapsibleCommentsSectionProps) {
  const t = useTranslations('comments')
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleComments = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Comments Toggle Button */}
      <section className="relative bg-background border-t border-border/10">
        <div className="px-6 lg:px-12 xl:px-16 max-w-[1800px] mx-auto py-8">
          <div className="flex justify-center">
            <Button
              onClick={toggleComments}
              variant="outline"
              size="lg"
              className={cn(
                "group transition-all duration-300 ease-in-out",
                "hover:bg-primary hover:text-primary-foreground",
                "border-2 hover:border-primary",
                "shadow-lg hover:shadow-xl",
                "min-w-[200px]",
                isExpanded && "bg-primary text-primary-foreground border-primary"
              )}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {isExpanded ? t('hideComments') : t('shareComments')}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 ml-2 transition-transform duration-300" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Collapsible Comments Section */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <section className="relative bg-muted/30 border-t border-border/10">
          <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto py-16">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                {t('title')}
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Share your thoughts about this image. Your comments help create a community 
                around visual storytelling and photography appreciation.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Comments Form */}
              <div className="space-y-6">
                <div className="bg-background border border-border/20 rounded-2xl p-6 shadow-sm">
                  <CommentForm
                    imageId={imageId}
                    imageSlug={imageSlug}
                    imageTitle={imageTitle}
                  />
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                <div className="bg-background border border-border/20 rounded-2xl p-6 shadow-sm">
                  <CommentsList
                    imageId={imageId}
                    className="h-fit max-h-[600px] overflow-auto"
                  />
                </div>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="mt-16 text-center">
              <div className="max-w-4xl mx-auto bg-background border border-border/20 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  💬 Community Guidelines
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <div className="text-base font-medium text-foreground">✨ Be Respectful</div>
                    <p>Share constructive feedback and appreciate different perspectives on art and photography.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-base font-medium text-foreground">🎨 Stay On Topic</div>
                    <p>Keep discussions focused on the image, photography techniques, or related artistic elements.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-base font-medium text-foreground">🔒 Privacy First</div>
                    <p>Your email is never published. All comments are moderated before appearing publicly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
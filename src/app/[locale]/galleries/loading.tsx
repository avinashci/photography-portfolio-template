import { GalleryPageSkeleton } from '@/components/ui/base/loading-ui'

export default function GalleriesLoading() {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <GalleryPageSkeleton />
    </main>
  )
}
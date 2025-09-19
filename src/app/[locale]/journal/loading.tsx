import { JournalPageSkeleton } from '@/components/ui/base/loading-ui'

export default function JournalLoading() {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <JournalPageSkeleton />
    </main>
  )
}
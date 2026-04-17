// src/app/browse/page.tsx
import { Suspense } from 'react'
import BrowseContent from '@/components/BrowseContent'
import PageLoader from '@/components/ui/PageLoader'

export default function BrowsePage() {
  return (
    <Suspense fallback={<PageLoader label="Loading developers..." minHeight="70vh" />}>
      <BrowseContent />
    </Suspense>
  )
}

// src/app/browse/page.tsx
import { Suspense } from 'react'
import BrowseContent from '@/components/BrowseContent'

export default function BrowsePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px 24px' }}>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  )
}
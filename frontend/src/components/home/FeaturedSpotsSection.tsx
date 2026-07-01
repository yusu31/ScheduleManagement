'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, MapPinned } from 'lucide-react'
import apiClient from '@/lib/axios'
import { Spot } from '@/types/spot'
import SpotCard from '@/components/spots/SpotCard'

export default function FeaturedSpotsSection() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/api/v1/spots')
      .then(res => setSpots(res.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (!isLoading && spots.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <MapPinned size={22} className="text-primary" />
          <h2 className="text-[24px] font-bold text-app-text theme-readable">注目スポット</h2>
        </div>
        <Link
          href="/spots"
          className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          もっと見る <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl bg-black/5 animate-pulse aspect-[4/5]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {spots.map(spot => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </section>
  )
}

'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import apiClient from '@/lib/axios'
import { Event } from '@/types/event'
import { Spot } from '@/types/spot'
import { Restaurant } from '@/types/restaurant'
import EventCard from '@/components/events/EventCard'
import SpotCard from '@/components/spots/SpotCard'
import RestaurantCard from '@/components/gourmet/RestaurantCard'
import AreaChipFilter from '@/components/search/AreaChipFilter'
import toast from 'react-hot-toast'

const RESULT_LIMIT = 5

function SearchInner() {
  const searchParams = useSearchParams()
  const [q] = useState(searchParams.get('q') ?? '')
  const [municipalities, setMunicipalities] = useState<string[]>(searchParams.getAll('municipalities[]'))
  const [events, setEvents] = useState<Event[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const toggleMunicipality = (m: string) => {
    setMunicipalities(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [ ...prev, m ]))
  }

  useEffect(() => {
    setIsLoading(true)

    const eventsParams = new URLSearchParams()
    if (q) eventsParams.set('q', q)
    municipalities.forEach(m => eventsParams.append('areas[]', m))
    eventsParams.set('per_page', String(RESULT_LIMIT))

    const spotsParams = new URLSearchParams()
    if (q) spotsParams.set('q', q)
    municipalities.forEach(m => spotsParams.append('municipalities[]', m))

    const restaurantsParams = new URLSearchParams()
    if (q) restaurantsParams.set('q', q)
    municipalities.forEach(m => restaurantsParams.append('municipalities[]', m))

    Promise.all([
      apiClient.get(`/api/v1/events?${eventsParams.toString()}`),
      apiClient.get(`/api/v1/spots?${spotsParams.toString()}`),
      apiClient.get(`/api/v1/restaurants?${restaurantsParams.toString()}`),
    ])
      .then(([ eventsRes, spotsRes, restaurantsRes ]) => {
        setEvents(eventsRes.data.events)
        setSpots(spotsRes.data.slice(0, RESULT_LIMIT))
        setRestaurants(restaurantsRes.data.slice(0, RESULT_LIMIT))
      })
      .catch(() => toast.error('検索結果の読み込みに失敗しました'))
      .finally(() => setIsLoading(false))
  }, [ q, municipalities ])

  const moreLinkQuery = (areaParamName: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    municipalities.forEach(m => params.append(`${areaParamName}[]`, m))
    return params.toString()
  }

  return (
    <div className="min-h-screen px-8 py-8 max-w-[1160px] mx-auto">
      <h1 className="text-[20px] font-bold text-app-text mb-1">「{q || '全件'}」の検索結果</h1>
      <p className="text-[13px] text-app-sub mb-5">イベント・スポット・グルメをまとめて検索します</p>

      <div className="mb-8 p-4 rounded-2xl bg-white/70 border border-app-border">
        <AreaChipFilter selected={municipalities} onToggle={toggleMunicipality} />
      </div>

      {isLoading ? (
        <p className="text-[13px] text-app-sub">読み込み中...</p>
      ) : (
        <>
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-app-text">イベント</h2>
              <Link href={`/events?${moreLinkQuery('areas')}`} className="text-[13px] text-primary font-semibold hover:underline">もっと見る →</Link>
            </div>
            {events.length === 0 ? (
              <p className="text-[13px] text-app-sub">該当するイベントはありませんでした</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-x-[24px] gap-y-[20px]">
                {events.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            )}
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-app-text">観光スポット</h2>
              <Link href={`/spots?${moreLinkQuery('municipalities')}`} className="text-[13px] text-primary font-semibold hover:underline">もっと見る →</Link>
            </div>
            {spots.length === 0 ? (
              <p className="text-[13px] text-app-sub">該当する観光スポットはありませんでした</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-x-[24px] gap-y-[20px]">
                {spots.map(s => <SpotCard key={s.id} spot={s} />)}
              </div>
            )}
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-app-text">グルメ</h2>
              <Link href={`/restaurants?${moreLinkQuery('municipalities')}`} className="text-[13px] text-primary font-semibold hover:underline">もっと見る →</Link>
            </div>
            {restaurants.length === 0 ? (
              <p className="text-[13px] text-app-sub">該当するグルメ情報はありませんでした</p>
            ) : (
              <div className="flex flex-col gap-3">
                {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  )
}

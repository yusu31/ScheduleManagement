'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react'
import apiClient from '@/lib/axios'
import { Event } from '@/types/event'

const CATEGORY_GRADIENTS: Record<string, string> = {
  'テクノロジー':    'from-sky-500 to-indigo-600',
  '音楽':           'from-amber-400 to-red-500',
  'スポーツ':       'from-emerald-400 to-sky-500',
  '自然・アウトドア': 'from-green-600 to-emerald-700',
  '食・グルメ':     'from-orange-400 to-red-500',
  '文化・伝統':     'from-violet-500 to-purple-700',
  'ファミリー':     'from-cyan-400 to-sky-500',
  '教育':           'from-blue-500 to-blue-700',
  '祭り・イベント': 'from-amber-400 to-orange-500',
  'アート':         'from-pink-400 to-purple-500',
  'その他':         'from-gray-400 to-gray-600',
}
const DEFAULT_GRADIENT = 'from-[#5f8b8b] to-[#3a6b6b]'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    month: 'long', day: 'numeric', weekday: 'short',
  })
}

function EventMiniCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-1"
    >
      {/* 画像エリア */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[event.category] ?? DEFAULT_GRADIENT} group-hover:scale-105 transition-transform duration-500`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute bottom-2.5 left-3 text-[10px] font-bold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {event.category}
        </span>
      </div>

      {/* テキストエリア */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-[14px] font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <div className="flex flex-col gap-1 mt-auto">
          <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <CalendarDays size={12} className="shrink-0 text-primary/70" />
            {formatDate(event.start_at)}
          </span>
          {event.area && (
            <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <MapPin size={12} className="shrink-0 text-primary/70" />
              {event.area}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] animate-pulse">
      <div className="aspect-[16/9] bg-gray-200" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-32 mt-1" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
    </div>
  )
}

export default function WeeklyEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const weekLater = new Date(today)
    weekLater.setDate(today.getDate() + 7)

    const fmt = (d: Date) => d.toISOString().split('T')[0]

    apiClient
      .get(`/api/v1/events?start_date=${fmt(today)}&end_date=${fmt(weekLater)}&sort=start_asc`)
      .then(res => {
        const data: Event[] = res.data
        // 今週が3件未満なら直近イベントで補完
        if (data.length >= 3) {
          setEvents(data.slice(0, 3))
        } else {
          return apiClient.get('/api/v1/events?sort=start_asc').then(r => {
            setEvents((r.data as Event[]).slice(0, 3))
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!loading && events.length === 0) return null

  return (
    <section className="bg-[#f7f9f8] px-6 py-16">
      <div className="max-w-5xl mx-auto">

        {/* セクションヘッダー */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-primary uppercase mb-1">
              Coming Soon
            </p>
            <h2 className="text-[26px] font-black text-gray-800">
              今週のおすすめ
            </h2>
          </div>
          <Link
            href="/events"
            className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary/70 transition-colors"
          >
            すべて見る <ArrowRight size={14} />
          </Link>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : events.map(ev => <EventMiniCard key={ev.id} event={ev} />)
          }
        </div>

      </div>
    </section>
  )
}

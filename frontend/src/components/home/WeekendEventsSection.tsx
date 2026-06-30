'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays } from 'lucide-react'
import apiClient from '@/lib/axios'
import { Event } from '@/types/event'
import EventCard from '@/components/events/EventCard'

function getWeekendRange() {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (day !== 6 && day !== 0) {
    start.setDate(start.getDate() + (6 - day))
  }

  const end = new Date(start)
  if (day !== 0) {
    end.setDate(start.getDate() + 1)
  }
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export default function WeekendEventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [isWeekendOnly, setIsWeekendOnly] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { start, end } = getWeekendRange()
    const params = new URLSearchParams({
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      per_page: '3',
    })

    apiClient.get(`/api/v1/events?${params.toString()}`)
      .then(res => {
        if (res.data.events.length > 0) {
          setEvents(res.data.events)
          setIsWeekendOnly(true)
        } else {
          return apiClient.get('/api/v1/events?per_page=3').then(fallback => {
            setEvents(fallback.data.events)
            setIsWeekendOnly(false)
          })
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (!isLoading && events.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <CalendarDays size={22} className="text-primary" />
          <h2 className="text-[24px] font-bold text-app-text">
            {isWeekendOnly ? '今週末のおすすめイベント' : '近日開催のイベント'}
          </h2>
        </div>
        <Link
          href="/events"
          className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          もっと見る <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-[20px] bg-black/5 animate-pulse aspect-[4/5]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  )
}

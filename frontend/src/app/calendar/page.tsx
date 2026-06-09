'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import jaLocale from '@fullcalendar/core/locales/ja'
import { EventClickArg } from '@fullcalendar/core'
import apiClient from '@/lib/axios'
import { Event } from '@/types/event'

const CATEGORY_COLORS: Record<string, string> = {
  'テクノロジー':    '#0ea5e9',
  '音楽':           '#f59e0b',
  'スポーツ':       '#22c55e',
  '自然・アウトドア': '#16a34a',
  '食・グルメ':     '#f97316',
  '文化・伝統':     '#8b5cf6',
  'ファミリー':     '#06b6d4',
  '教育':           '#3b82f6',
  '祭り・イベント': '#d97706',
  'アート':         '#ec4899',
  'その他':         '#6b7280',
}
const DEFAULT_COLOR = '#5f8b8b'

type CalendarEvent = {
  id: string
  title: string
  start: string
  end?: string
  backgroundColor: string
  borderColor: string
  textColor: string
}

export default function CalendarPage() {
  const router = useRouter()
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/api/v1/events')
      .then(res => {
        const events: CalendarEvent[] = res.data.map((ev: Event) => ({
          id: String(ev.id),
          title: ev.title,
          start: ev.start_at,
          end: ev.end_at ?? undefined,
          backgroundColor: CATEGORY_COLORS[ev.category] ?? DEFAULT_COLOR,
          borderColor: 'transparent',
          textColor: '#ffffff',
        }))
        setCalendarEvents(events)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleEventClick = (arg: EventClickArg) => {
    router.push(`/events/${arg.event.id}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-app-text">カレンダー</h1>
        <p className="text-[13px] text-app-sub mt-1">福島県内のイベントをカレンダーで確認できます</p>
      </div>

      <div className="
        bg-white/70 backdrop-blur-xl
        border border-white/60
        rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]
        p-5
        fc-custom
      ">
        {isLoading ? (
          <div className="h-[600px] flex items-center justify-center text-app-sub text-[14px]">
            読み込み中...
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            locale={jaLocale}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkText={(n) => `他 ${n} 件`}
          />
        )}
      </div>
    </div>
  )
}

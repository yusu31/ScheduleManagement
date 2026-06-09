'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import jaLocale from '@fullcalendar/core/locales/ja'
import { EventClickArg, EventHoveringArg, DatesSetArg } from '@fullcalendar/core'
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Clock, Users, ArrowRight, CalendarPlus, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import apiClient from '@/lib/axios'
import { useAuth } from '@/contexts/AuthContext'
import { Event } from '@/types/event'

// ─── カテゴリ設定（EventCard と統一） ────────────────────────────────
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

const ALL_CATEGORIES = ['すべて', ...Object.keys(CATEGORY_COLORS)]

// ─── ユーモアのひとこと ───────────────────────────────────────────────
const HUMOROUS_HINTS = [
  '行ってみたら意外と楽しいかも 🎉',
  '友達誘ってみては？ 👥',
  '福島の魅力、再発見するチャンス ✨',
  '空き時間にぴったりかも 😊',
  '行かないと後悔するやつかも 🤔',
  '今週末のネタになりそう 📸',
  '参加すると視野が広がるよね 🌱',
]

function randomHint() {
  return HUMOROUS_HINTS[Math.floor(Math.random() * HUMOROUS_HINTS.length)]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    month: 'short', day: 'numeric', weekday: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── 型定義 ───────────────────────────────────────────────────────────
type ViewKey = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'

const VIEW_OPTIONS: { key: ViewKey; label: string }[] = [
  { key: 'dayGridMonth', label: '月' },
  { key: 'timeGridWeek', label: '週' },
  { key: 'timeGridDay', label: '日' },
]

type PopupState = {
  id: string
  title: string
  category: string
  location?: string
  start_at: string
  end_at?: string
  capacity?: number
  hint: string
  x: number
  y: number
}

type CalendarEvent = {
  id: string
  title: string
  start: string
  end?: string
  backgroundColor: string
  borderColor: string
  textColor: string
  classNames?: string[]
  extendedProps: {
    category: string
    location?: string
    start_at: string
    end_at?: string
    capacity?: number
  }
}

const LOADING_MESSAGES = [
  'イベントを福島から召喚中... 🦅',
  '郡山・いわき・本宮を探索中... 🗺️',
  '今月の楽しい予定を集めています... 🌸',
]

// ─── メインコンポーネント ─────────────────────────────────────────────
export default function CalendarPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const calendarRef = useRef<FullCalendar>(null)
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [scheduledEventIds, setScheduledEventIds] = useState<Set<number>>(new Set())
  const [scheduleIdMap, setScheduleIdMap] = useState<Map<number, number>>(new Map())
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewKey>('dayGridMonth')
  const [currentTitle, setCurrentTitle] = useState('')
  const [popup, setPopup] = useState<PopupState | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [loadingMsg] = useState(() =>
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  )

  // ─── イベント・スケジュール取得 ──────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [evRes, schRes] = await Promise.allSettled([
          apiClient.get('/api/v1/events'),
          isLoggedIn ? apiClient.get('/api/v1/schedules') : Promise.resolve({ data: [] }),
        ])

        const events: Event[] = evRes.status === 'fulfilled' ? evRes.value.data : []
        setAllEvents(events)

        if (schRes.status === 'fulfilled') {
          const schedules = schRes.value.data as (Event & { schedule_id: number })[]
          const ids = new Set(schedules.map(s => s.id))
          const map = new Map(schedules.map(s => [s.id, s.schedule_id]))
          setScheduledEventIds(ids)
          setScheduleIdMap(map)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [isLoggedIn])

  // ─── カレンダーイベントをフィルタリングして変換 ──────────────────
  const buildCalendarEvents = useCallback((
    events: Event[],
    category: string,
    scheduledIds: Set<number>,
  ): CalendarEvent[] => {
    return events
      .filter(ev => category === 'すべて' || ev.category === category)
      .map(ev => {
        const isScheduled = scheduledIds.has(ev.id)
        return {
          id: String(ev.id),
          title: ev.title,
          start: ev.start_at,
          end: ev.end_at ?? undefined,
          backgroundColor: isScheduled ? DEFAULT_COLOR : (CATEGORY_COLORS[ev.category] ?? DEFAULT_COLOR),
          borderColor: isScheduled ? '#ffffff40' : 'transparent',
          textColor: '#ffffff',
          classNames: isScheduled ? ['fc-event-scheduled'] : [],
          extendedProps: {
            category: ev.category,
            location: ev.location ?? undefined,
            start_at: ev.start_at,
            end_at: ev.end_at ?? undefined,
            capacity: ev.capacity ?? undefined,
          },
        }
      })
  }, [])

  useEffect(() => {
    setCalendarEvents(buildCalendarEvents(allEvents, selectedCategory, scheduledEventIds))
  }, [allEvents, selectedCategory, scheduledEventIds, buildCalendarEvents])

  // ─── ナビゲーション ─────────────────────────────────────────────
  const goNext = () => calendarRef.current?.getApi().next()
  const goPrev = () => calendarRef.current?.getApi().prev()
  const goToday = () => calendarRef.current?.getApi().today()

  const changeView = (view: ViewKey) => {
    calendarRef.current?.getApi().changeView(view)
    setCurrentView(view)
  }

  // ─── イベントインタラクション ───────────────────────────────────
  const handleEventClick = (arg: EventClickArg) => {
    router.push(`/events/${arg.event.id}`)
  }

  const handleMouseEnter = (arg: EventHoveringArg) => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current)
    const rect = arg.el.getBoundingClientRect()
    const popupWidth = 268
    const x = rect.right + 8 + popupWidth > window.innerWidth
      ? rect.left - popupWidth - 8
      : rect.right + 8
    const y = Math.min(rect.top, window.innerHeight - 380)

    setPopup({
      id: arg.event.id,
      title: arg.event.title,
      category: arg.event.extendedProps.category,
      location: arg.event.extendedProps.location,
      start_at: arg.event.extendedProps.start_at,
      end_at: arg.event.extendedProps.end_at,
      capacity: arg.event.extendedProps.capacity,
      hint: randomHint(),
      x,
      y,
    })
  }

  const handleMouseLeave = () => {
    popupTimerRef.current = setTimeout(() => setPopup(null), 150)
  }

  // ─── 参加予定に追加 / 解除 ──────────────────────────────────────
  const handleAddToSchedule = async (eventId: string) => {
    if (!isLoggedIn) {
      toast('ログインするとカレンダーに追加できます 📅', {
        icon: '🔐',
        style: { fontSize: '13px' },
      })
      return
    }

    const id = Number(eventId)
    const isAdded = scheduledEventIds.has(id)
    setAddingId(eventId)

    try {
      if (isAdded) {
        const scheduleId = scheduleIdMap.get(id)
        if (scheduleId) {
          await apiClient.delete(`/api/v1/schedules/${scheduleId}`)
          setScheduledEventIds(prev => { const s = new Set(prev); s.delete(id); return s })
          setScheduleIdMap(prev => { const m = new Map(prev); m.delete(id); return m })
          toast('参加予定を解除しました', { icon: '📤', style: { fontSize: '13px' } })
        }
      } else {
        const res = await apiClient.post('/api/v1/schedules', { event_id: id })
        setScheduledEventIds(prev => new Set(prev).add(id))
        setScheduleIdMap(prev => new Map(prev).set(id, res.data.id))
        toast('カレンダーに追加しました 🎉', { style: { fontSize: '13px', fontWeight: '600' } })
      }
    } catch {
      toast.error('操作に失敗しました')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="p-6">
      {/* ─── ページヘッダー ──────────────────────────────────────── */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-app-text">カレンダー</h1>
          <p className="text-[13px] text-app-sub mt-0.5">
            イベントをカレンダーで確認・予定に追加できます
          </p>
        </div>

        {/* ビュー切替タブ */}
        <div className="flex items-center bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl p-1 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          {VIEW_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => changeView(key)}
              className={`
                px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150
                ${currentView === key
                  ? 'bg-primary text-white shadow-[0_2px_6px_rgba(95,139,139,0.35)]'
                  : 'text-app-sub hover:text-app-text'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── カテゴリフィルター ────────────────────────────────────── */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold
              border transition-all duration-150 whitespace-nowrap
              ${selectedCategory === cat
                ? 'bg-primary text-white border-primary shadow-[0_2px_6px_rgba(95,139,139,0.3)]'
                : 'bg-white/60 text-app-sub border-white/60 hover:text-app-text hover:bg-white/80'
              }
            `}
            style={
              selectedCategory === cat && cat !== 'すべて'
                ? { backgroundColor: CATEGORY_COLORS[cat] ?? DEFAULT_COLOR, borderColor: 'transparent' }
                : undefined
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── カレンダーカード ─────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* カスタムナビゲーションバー */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-app-border/40 bg-white/40">
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-app-sub hover:text-app-text hover:bg-white/70 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goNext}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-app-sub hover:text-app-text hover:bg-white/70 transition-all"
            >
              <ChevronRight size={16} />
            </button>
            <h2 className="text-[15px] font-bold text-app-text ml-2 min-w-[130px]">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* 凡例 */}
            {isLoggedIn && (
              <div className="flex items-center gap-1.5 text-[11px] text-app-sub">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: DEFAULT_COLOR }} />
                参加予定
              </div>
            )}
            <button
              onClick={goToday}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
            >
              今日
            </button>
          </div>
        </div>

        {/* FullCalendar 本体 */}
        <div className="p-4 fc-custom">
          {isLoading ? (
            <div className="h-[560px] flex flex-col items-center justify-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <CalendarDays size={36} className="text-primary/40" />
              </motion.div>
              <p className="text-[13px] text-app-sub">{loadingMsg}</p>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
              locale={jaLocale}
              events={calendarEvents}
              eventClick={handleEventClick}
              eventMouseEnter={handleMouseEnter}
              eventMouseLeave={handleMouseLeave}
              headerToolbar={false}
              datesSet={(arg: DatesSetArg) => {
                setCurrentTitle(arg.view.title)
                setCurrentView(arg.view.type as ViewKey)
              }}
              contentHeight={currentView === 'dayGridMonth' ? 'auto' : 600}
              dayMaxEvents={3}
              moreLinkText={(n) => `+${n}件`}
              nowIndicator={true}
              scrollTime="08:00:00"
              eventDisplay="block"
              slotMinTime="07:00:00"
              slotMaxTime="23:00:00"
            />
          )}
        </div>
      </div>

      {/* ─── ホバーポップアップ ───────────────────────────────────── */}
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'fixed', left: popup.x, top: popup.y, zIndex: 9999, width: 268 }}
            onMouseEnter={() => { if (popupTimerRef.current) clearTimeout(popupTimerRef.current) }}
            onMouseLeave={() => setPopup(null)}
            className="bg-white/96 backdrop-blur-xl border border-white/70 rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)]"
          >
            {/* カテゴリカラーバー */}
            <div className="h-[3px]" style={{ backgroundColor: CATEGORY_COLORS[popup.category] ?? DEFAULT_COLOR }} />

            <div className="px-4 py-3.5">
              {/* カテゴリバッジ */}
              <span
                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full text-white mb-2"
                style={{ backgroundColor: CATEGORY_COLORS[popup.category] ?? DEFAULT_COLOR }}
              >
                {popup.category}
              </span>

              {/* タイトル */}
              <h3 className="text-[13px] font-bold text-app-text leading-snug mb-3 line-clamp-2">
                {popup.title}
              </h3>

              {/* 詳細情報 */}
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-start gap-2 text-[11px] text-app-sub">
                  <Clock size={11} className="shrink-0 mt-0.5" />
                  <span>{formatDate(popup.start_at)}</span>
                </div>
                {popup.location && (
                  <div className="flex items-start gap-2 text-[11px] text-app-sub">
                    <MapPin size={11} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{popup.location}</span>
                  </div>
                )}
                {popup.capacity && (
                  <div className="flex items-center gap-2 text-[11px] text-app-sub">
                    <Users size={11} className="shrink-0" />
                    <span>定員 {popup.capacity}名</span>
                  </div>
                )}
              </div>

              {/* ユーモアヒント */}
              <p className="text-[10px] text-app-sub/60 italic leading-relaxed mb-3 border-t border-app-border/50 pt-2.5">
                {popup.hint}
              </p>

              {/* ボタン群 */}
              <div className="flex gap-2">
                {/* 参加予定に追加ボタン */}
                <button
                  onClick={() => handleAddToSchedule(popup.id)}
                  disabled={addingId === popup.id}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5
                    py-2 rounded-lg text-[11px] font-semibold transition-all
                    ${scheduledEventIds.has(Number(popup.id))
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }
                    disabled:opacity-60
                  `}
                >
                  {scheduledEventIds.has(Number(popup.id))
                    ? <><Check size={11} />予定済み</>
                    : <><CalendarPlus size={11} />予定に追加</>
                  }
                </button>

                {/* 詳細ボタン */}
                <button
                  onClick={() => router.push(`/events/${popup.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold bg-app-bg text-app-text hover:bg-app-border/50 transition-colors"
                >
                  詳細へ
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Clock, MapPin, CalendarDays, Ticket,
  ChevronRight, Check, CalendarPlus, Pencil, Sun, Moon,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import apiClient from '@/lib/axios'
import { PersonalEvent } from '@/types/personalEvent'
import { Event } from '@/types/event'
import PersonalEventModal from '@/components/calendar/PersonalEventModal'
import { useAuth } from '@/contexts/AuthContext'

// ─── ユーティリティ ────────────────────────────────────────────────────────
function getTodayStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function getGreeting(name?: string | null) {
  const h = new Date().getHours()
  const suffix = h < 12 ? 'おはようございます' : h < 18 ? 'こんにちは' : 'こんばんは'
  return name ? `${name}さん、${suffix}` : suffix
}

function utcToJstDateStr(utcStr: string) {
  const d = new Date(utcStr)
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().split('T')[0]
}

function utcToJstTimeStr(utcStr: string) {
  return new Date(utcStr).toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo',
  })
}

function formatLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ja-JP', {
    month: 'long', day: 'numeric', weekday: 'short',
  })
}

// ─── 型定義 ────────────────────────────────────────────────────────────────
type ScheduledEvent = Event & { schedule_id: number }

type TodayItem =
  | { type: 'personal'; id: string; sortKey: string; data: PersonalEvent }
  | { type: 'scheduled'; id: string; sortKey: string; data: ScheduledEvent }

// ─── サブコンポーネント ────────────────────────────────────────────────────
function PersonalItem({
  item, checked, onToggle, onClick, showCheck,
}: {
  item: PersonalEvent
  checked: boolean
  onToggle: () => void
  onClick: () => void
  showCheck: boolean
}) {
  const start = item.start_time ? item.start_time.slice(0, 5) : null
  const end = item.end_time ? item.end_time.slice(0, 5) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: checked ? 0.45 : 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-start gap-2 px-4 py-3 rounded-xl hover:bg-emerald-50/70 transition-colors group"
    >
      {showCheck && (
        <button
          onClick={onToggle}
          className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
            checked
              ? 'border-emerald-500 bg-emerald-500'
              : 'border-gray-300 hover:border-emerald-400'
          }`}
        >
          {checked && <Check size={10} className="text-white" strokeWidth={3} />}
        </button>
      )}
      <button
        onClick={onClick}
        className="flex-1 flex items-start gap-3 text-left min-w-0"
      >
        <div className="w-14 shrink-0 text-right pt-0.5">
          {start ? (
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-bold text-emerald-700">{start}</span>
              {end && <span className="text-[10px] text-gray-400">{end}</span>}
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 font-medium">終日</span>
          )}
        </div>
        <div className="w-[3px] rounded-full bg-emerald-400 self-stretch shrink-0 mt-1 min-h-[20px]" />
        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-semibold text-app-text leading-snug ${checked ? 'line-through' : ''}`}>
            {item.title}
          </p>
          {item.location && (
            <p className="flex items-center gap-1 text-[11px] text-app-sub mt-0.5">
              <MapPin size={10} className="text-emerald-500 shrink-0" />
              <span className="truncate">{item.location}</span>
            </p>
          )}
        </div>
        <Pencil size={13} className="text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0 mt-1" />
      </button>
    </motion.div>
  )
}

function ScheduledItem({
  item, checked, onToggle, onClick, showCheck,
}: {
  item: ScheduledEvent
  checked: boolean
  onToggle: () => void
  onClick: () => void
  showCheck: boolean
}) {
  const timeStr = utcToJstTimeStr(item.start_at)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: checked ? 0.45 : 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-start gap-2 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors group"
    >
      {showCheck && (
        <button
          onClick={onToggle}
          className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
            checked
              ? 'border-primary bg-primary'
              : 'border-gray-300 hover:border-primary/60'
          }`}
        >
          {checked && <Check size={10} className="text-white" strokeWidth={3} />}
        </button>
      )}
      <button
        onClick={onClick}
        className="flex-1 flex items-start gap-3 text-left min-w-0"
      >
        <div className="w-14 shrink-0 text-right pt-0.5">
          <span className="text-[12px] font-bold text-primary">{timeStr}</span>
        </div>
        <div className="w-[3px] rounded-full bg-primary self-stretch shrink-0 mt-1 min-h-[20px]" />
        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-semibold text-app-text leading-snug ${checked ? 'line-through' : ''}`}>
            {item.title}
          </p>
          {item.location && (
            <p className="flex items-center gap-1 text-[11px] text-app-sub mt-0.5">
              <MapPin size={10} className="text-primary/60 shrink-0" />
              <span className="truncate">{item.location}</span>
            </p>
          )}
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-full">
            <Ticket size={9} />イベント参加予定
          </span>
        </div>
        <ChevronRight size={13} className="text-gray-300 group-hover:text-primary transition-colors shrink-0 mt-1" />
      </button>
    </motion.div>
  )
}

// ─── メインコンポーネント ──────────────────────────────────────────────────
export default function TodayPage() {
  const { isLoggedIn, isLoading: authLoading, currentUser } = useAuth()

  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([])
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([])
  const [suggestEvents, setSuggestEvents] = useState<Event[]>([])
  const [scheduledEventIds, setScheduledEventIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null)
  const [modalDate, setModalDate] = useState<string | null>(null)

  const [selectedWeekDay, setSelectedWeekDay] = useState<string | null>(null)

  const today = getTodayStr()
  const isEvening = new Date().getHours() >= 18

  // ─── データ取得 ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) { setIsLoading(false); return }

    const fetchAll = async () => {
      const in2days = new Date()
      in2days.setDate(in2days.getDate() + 2)
      const in2daysStr = `${in2days.getFullYear()}-${String(in2days.getMonth() + 1).padStart(2, '0')}-${String(in2days.getDate()).padStart(2, '0')}`

      try {
        const [peRes, schRes, evRes] = await Promise.allSettled([
          apiClient.get('/api/v1/personal_events'),
          apiClient.get('/api/v1/schedules').catch(() => ({ data: [] })),
          apiClient.get(`/api/v1/events?start_date=${today}&end_date=${in2daysStr}&sort=start_asc`).catch(() => ({ data: [] })),
        ])

        let localScheduledIds = new Set<number>()

        if (peRes.status === 'fulfilled') {
          setPersonalEvents(peRes.value.data as PersonalEvent[])
        } else {
          toast.error('今日の予定の読み込みに失敗しました')
        }
        if (schRes.status === 'fulfilled') {
          const sch = schRes.value.data as ScheduledEvent[]
          setScheduledEvents(sch)
          localScheduledIds = new Set(sch.map(s => s.id))
          setScheduledEventIds(localScheduledIds)
        }
        if (evRes.status === 'fulfilled') {
          const all = evRes.value.data as Event[]
          setSuggestEvents(all.filter(ev => !localScheduledIds.has(ev.id)).slice(0, 2))
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [isLoggedIn, authLoading, today])

  // ─── アイテム構築ヘルパー ────────────────────────────────────────────────
  const buildItems = (dateStr: string): TodayItem[] => {
    const peItems: TodayItem[] = personalEvents
      .filter(pe => pe.event_date === dateStr)
      .map(pe => ({
        type: 'personal' as const,
        id: `p-${pe.id}`,
        sortKey: pe.start_time ? pe.start_time.slice(0, 5) : '99:99',
        data: pe,
      }))

    const schItems: TodayItem[] = scheduledEvents
      .filter(ev => utcToJstDateStr(ev.start_at) === dateStr)
      .map(ev => ({
        type: 'scheduled' as const,
        id: `s-${ev.id}`,
        sortKey: utcToJstTimeStr(ev.start_at),
        data: ev,
      }))

    return [...peItems, ...schItems].sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }

  const todayItems = buildItems(today)
  const selectedDayItems = selectedWeekDay && selectedWeekDay !== today
    ? buildItems(selectedWeekDay)
    : []

  const displayItems = selectedWeekDay && selectedWeekDay !== today ? selectedDayItems : todayItems
  const isViewingToday = !selectedWeekDay || selectedWeekDay === today

  // チェック済みを下部に移動（今日のみ）
  const sortedDisplayItems = isViewingToday
    ? [
        ...displayItems.filter(item => !checkedIds.has(item.id)),
        ...displayItems.filter(item => checkedIds.has(item.id)),
      ]
    : displayItems

  const allChecked = isViewingToday && displayItems.length > 0 && displayItems.every(item => checkedIds.has(item.id))

  const handleToggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ─── 今週のミニカレンダー ────────────────────────────────────────────────
  const weekDays = (() => {
    const [y, m, d] = today.split('-').map(Number)
    const now = new Date(y, m - 1, d)
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
    })
  })()

  const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

  const countByDay = (dateStr: string) => {
    const pe = personalEvents.filter(p => p.event_date === dateStr).length
    const sc = scheduledEvents.filter(ev => utcToJstDateStr(ev.start_at) === dateStr).length
    return pe + sc
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────
  const handleSave = async ({
    title, memo, date, startTime, endTime, location, url,
  }: {
    title: string; memo: string; date: string
    startTime: string; endTime: string; location: string; url: string
  }) => {
    const payload = {
      personal_event: {
        title, memo, event_date: date,
        start_time: startTime || null,
        end_time: endTime || null,
        location: location || null,
        url: url || null,
      },
    }
    try {
      if (editingEvent) {
        const res = await apiClient.put(`/api/v1/personal_events/${editingEvent.id}`, payload)
        setPersonalEvents(prev => prev.map(pe => pe.id === editingEvent.id ? res.data : pe))
        toast('予定を更新しました', { style: { fontSize: '13px' } })
      } else {
        const res = await apiClient.post('/api/v1/personal_events', payload)
        setPersonalEvents(prev => [...prev, res.data])
        toast('予定を追加しました', { style: { fontSize: '13px', fontWeight: '600' } })
      }
    } catch {
      toast.error('保存に失敗しました')
      throw new Error('save failed')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/v1/personal_events/${id}`)
      setPersonalEvents(prev => prev.filter(pe => pe.id !== id))
      toast('予定を削除しました', { style: { fontSize: '13px' } })
    } catch {
      toast.error('削除に失敗しました')
      throw new Error('delete failed')
    }
  }

  // ─── Connpassサジェストの参加予定追加 ───────────────────────────────────
  const handleAddToSchedule = async (eventId: number) => {
    setAddingId(String(eventId))
    try {
      await apiClient.post('/api/v1/schedules', { event_id: eventId })
      setScheduledEventIds(prev => new Set(prev).add(eventId))
      setSuggestEvents(prev => prev.filter(ev => ev.id !== eventId))
      toast('カレンダーに追加しました', { style: { fontSize: '13px', fontWeight: '600' } })
    } catch {
      toast.error('操作に失敗しました')
    } finally {
      setAddingId(null)
    }
  }

  // ─── 未ログイン ──────────────────────────────────────────────────────────
  if (!authLoading && !isLoggedIn) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-md theme-page-header">
          <span className="theme-badge inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Sun size={32} className="text-primary" />
          </span>
          <h1 className="text-[22px] font-black text-app-text mb-3 theme-readable">今日のダッシュボード</h1>
          <p className="text-[14px] text-app-sub leading-relaxed mb-6 theme-readable">
            ログインすると、今日の予定や<br />近日のConnpassイベントを確認できます。
          </p>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(95,139,139,0.35)]"
          >
            ログインする →
          </Link>
        </div>
      </main>
    )
  }

  // ─── ローディング ────────────────────────────────────────────────────────
  if (authLoading || isLoading) {
    return (
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="animate-pulse space-y-4 mt-2">
          <div className="h-[160px] bg-gray-200 rounded-3xl" />
          <div className="h-[120px] bg-gray-100 rounded-2xl mt-5" />
          <div className="h-[220px] bg-gray-100 rounded-2xl" />
          <div className="h-[100px] bg-gray-100 rounded-2xl" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 max-w-2xl mx-auto w-full pb-28">

      {/* ─── ヒーローカード ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className={`mb-6 rounded-3xl overflow-hidden p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${
          isEvening
            ? 'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600'
            : 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500'
        }`}
      >
        <div className="flex items-center gap-1.5 mb-3">
          {isEvening
            ? <Moon size={15} className="text-white/80" />
            : <Sun size={15} className="text-white/80" />
          }
          <p className="text-[13px] text-white/80 font-medium">{getGreeting(currentUser?.name)}</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] font-semibold text-white/70 mb-0.5">
              {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
            </p>
            <div className="flex items-end gap-1 leading-none">
              <span className="text-[80px] font-black text-white leading-none tracking-tight">
                {new Date().getDate()}
              </span>
              <span className="text-[28px] font-bold text-white/90 mb-3">
                {new Date().toLocaleDateString('ja-JP', { weekday: 'short' })}
              </span>
            </div>
          </div>
          <div className="text-right pb-2">
            <p className="text-[12px] text-white/70 mb-0.5">今日の予定</p>
            <div className="flex items-end justify-end gap-0.5">
              <span className="text-[44px] font-black text-white leading-none">
                {todayItems.length}
              </span>
              <span className="text-[18px] font-bold text-white/90 mb-1">件</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── 今週のミニカレンダー ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.06 }}
        className="mb-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl px-3 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] theme-card-bg"
      >
        <div className="grid grid-cols-7 gap-0.5">
          {weekDays.map((dateStr, i) => {
            const isToday = dateStr === today
            const isSelected = dateStr === selectedWeekDay
            const count = countByDay(dateStr)
            const [, , dd] = dateStr.split('-')
            const isSat = i === 5
            const isSun = i === 6

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedWeekDay(prev => prev === dateStr ? null : dateStr)}
                className="flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all"
              >
                <span className={`text-[10px] font-medium ${isSat ? 'text-blue-500' : isSun ? 'text-red-500' : 'text-app-sub'}`}>
                  {DAY_LABELS[i]}
                </span>
                <div className="relative">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all
                    ${isSelected
                      ? 'bg-primary text-white shadow-[0_2px_8px_rgba(95,139,139,0.4)]'
                      : isToday
                        ? 'bg-primary/15 text-primary'
                        : 'text-app-text hover:bg-gray-100'
                    }
                  `}>
                    <span className="text-[13px] font-bold">{Number(dd)}</span>
                  </div>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold min-h-[14px] ${count > 0 ? (isSelected ? 'text-primary' : 'text-app-sub') : 'text-transparent'}`}>
                  {count > 0 ? `${count}` : '0'}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ─── 予定カード ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.12 }}
        className="mb-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden theme-card-bg"
      >
        {/* カードヘッダー */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <p className="text-[11px] text-app-sub font-medium">
              {isViewingToday ? '今日の予定' : `${formatLocalDate(selectedWeekDay!)}の予定`}
            </p>
            <p className="text-[20px] font-black text-app-text mt-0.5">
              {displayItems.length > 0 ? `${displayItems.length}件` : 'なし'}
            </p>
          </div>
          {isViewingToday && (
            <button
              onClick={() => { setEditingEvent(null); setModalDate(today); setModalOpen(true) }}
              className="flex items-center gap-1.5 text-[12px] font-bold text-primary bg-primary/10 hover:bg-primary/20 active:scale-95 px-3.5 py-2 rounded-xl transition-all"
            >
              <Plus size={13} />追加
            </button>
          )}
        </div>

        <div className="mx-4 h-px bg-gray-100" />

        {/* 予定リスト */}
        <AnimatePresence mode="popLayout" initial={false}>
          {sortedDisplayItems.length > 0 ? (
            <div className="py-1.5">
              {sortedDisplayItems.map(item =>
                item.type === 'personal' ? (
                  <PersonalItem
                    key={item.id}
                    item={item.data}
                    checked={checkedIds.has(item.id)}
                    onToggle={() => handleToggleCheck(item.id)}
                    showCheck={isViewingToday}
                    onClick={() => {
                      setEditingEvent(item.data)
                      setModalDate(item.data.event_date)
                      setModalOpen(true)
                    }}
                  />
                ) : (
                  <ScheduledItem
                    key={item.id}
                    item={item.data}
                    checked={checkedIds.has(item.id)}
                    onToggle={() => handleToggleCheck(item.id)}
                    showCheck={isViewingToday}
                    onClick={() => window.open(`/events/${item.data.id}`, '_blank')}
                  />
                )
              )}
            </div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 flex flex-col items-center gap-2.5 text-center"
            >
              <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
                <CalendarDays size={20} className="text-gray-300" />
              </div>
              <p className="text-[13px] font-semibold text-app-sub">
                {isViewingToday ? '今日の予定はまだありません' : 'この日の予定はありません'}
              </p>
              {isViewingToday && (
                <p className="text-[11px] text-app-sub/60">
                  下の ＋ から予定を追加しましょう
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── 全チェック完了メッセージ ───────────────────────────────── */}
      <AnimatePresence>
        {allChecked && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="mb-4 flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100"
          >
            <span className="text-xl">✨</span>
            <p className="text-[14px] font-bold text-emerald-700">今日の予定すべて完了！</p>
            <span className="text-xl">✨</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 今日・明日のConnpassイベント推薦 ──────────────────────── */}
      <AnimatePresence>
        {suggestEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.18 }}
            className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden theme-card-bg"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div>
                <p className="text-[11px] text-app-sub font-medium">近日のConnpassイベント</p>
                <p className="text-[13px] font-bold text-app-text mt-0.5">今日・明日のおすすめ</p>
              </div>
              <Link
                href="/events"
                className="text-[11px] font-semibold text-primary flex items-center gap-0.5 hover:underline"
              >
                もっと見る <ChevronRight size={11} />
              </Link>
            </div>

            <div className="mx-4 h-px bg-gray-100" />

            <div className="p-3 flex flex-col gap-1">
              {suggestEvents.map(ev => (
                <div key={ev.id} className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50/80 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-app-text line-clamp-1 leading-snug">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-app-sub">
                        <Clock size={10} className="text-primary/50 shrink-0" />
                        {new Date(ev.start_at).toLocaleDateString('ja-JP', {
                          month: 'short', day: 'numeric', weekday: 'short',
                          hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo',
                        })}
                      </span>
                      {ev.area && (
                        <span className="flex items-center gap-1 text-[11px] text-app-sub">
                          <MapPin size={10} className="text-primary/50 shrink-0" />{ev.area}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToSchedule(ev.id)}
                    disabled={addingId === String(ev.id) || scheduledEventIds.has(ev.id)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {scheduledEventIds.has(ev.id)
                      ? <><Check size={11} />追加済み</>
                      : <><CalendarPlus size={11} />予定に追加</>
                    }
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FABボタン ────────────────────────────────────────────── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.25 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => { setEditingEvent(null); setModalDate(today); setModalOpen(true) }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-white shadow-[0_8px_28px_rgba(95,139,139,0.45)] flex items-center justify-center z-50"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* ─── PersonalEventModal ───────────────────────────────────── */}
      <PersonalEventModal
        isOpen={modalOpen}
        selectedDate={modalDate}
        existingEvent={editingEvent}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </main>
  )
}

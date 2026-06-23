'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CalendarDays, MapPin, ChevronDown, Clock, Pencil } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import apiClient from '@/lib/axios'
import { PersonalEvent } from '@/types/personalEvent'
import PersonalEventModal from '@/components/calendar/PersonalEventModal'
import { useAuth } from '@/contexts/AuthContext'

// ─── ユーティリティ ────────────────────────────────────────────────────────
function getTodayStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatLocalDate(dateStr: string, includeYear = false) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('ja-JP', {
    ...(includeYear ? { year: 'numeric' } : {}),
    month: 'long', day: 'numeric', weekday: 'short',
  })
}

function isThisYear(dateStr: string) {
  return dateStr.startsWith(String(new Date().getFullYear()))
}

// ─── 日付グループ構築 ──────────────────────────────────────────────────────
function groupByDate(events: PersonalEvent[], today: string) {
  const sorted = [...events].sort((a, b) => {
    const dateCmp = a.event_date.localeCompare(b.event_date)
    if (dateCmp !== 0) return dateCmp
    return (a.start_time ?? '99:99').localeCompare(b.start_time ?? '99:99')
  })

  const todayGroup = sorted.filter(e => e.event_date === today)
  const futureList = sorted.filter(e => e.event_date > today)
  const pastList = sorted.filter(e => e.event_date < today).reverse()

  const dateMap = new Map<string, PersonalEvent[]>()
  futureList.forEach(e => {
    const list = dateMap.get(e.event_date) ?? []
    list.push(e)
    dateMap.set(e.event_date, list)
  })
  const futureGroups = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, evs]) => ({ dateStr, events: evs }))

  return { todayGroup, futureGroups, pastList }
}

// ─── 予定行コンポーネント ──────────────────────────────────────────────────
function EventRow({
  event,
  onEdit,
  delay = 0,
}: {
  event: PersonalEvent
  onEdit: () => void
  delay?: number
}) {
  const start = event.start_time ? event.start_time.slice(0, 5) : null
  const end = event.end_time ? event.end_time.slice(0, 5) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32, delay }}
      className="flex items-start gap-3 px-5 py-3 hover:bg-white/60 active:bg-white/80 transition-colors group rounded-xl"
    >
      {/* 時間 */}
      <div className="w-12 shrink-0 pt-0.5 text-right">
        {start ? (
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-bold text-emerald-700">{start}</span>
            {end && <span className="text-[10px] text-gray-400">{end}</span>}
          </div>
        ) : (
          <span className="text-[10px] text-gray-400">終日</span>
        )}
      </div>

      {/* 左ボーダー */}
      <div className="w-[3px] rounded-full bg-emerald-400 self-stretch shrink-0 mt-1 min-h-[18px]" />

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-app-text leading-snug">{event.title}</p>
        {event.location && (
          <p className="flex items-center gap-1 text-[11px] text-app-sub mt-0.5">
            <MapPin size={10} className="text-emerald-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
        {event.memo && (
          <p className="text-[11px] text-app-sub/70 mt-0.5 line-clamp-1">{event.memo}</p>
        )}
      </div>

      {/* 編集ボタン */}
      <button
        onClick={onEdit}
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100 mt-0.5"
      >
        <Pencil size={13} />
      </button>
    </motion.div>
  )
}

// ─── 日付グループヘッダー ──────────────────────────────────────────────────
function DateGroupHeader({ dateStr, isToday }: { dateStr: string; isToday?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-5 pt-4 pb-1.5">
      <CalendarDays size={13} className={isToday ? 'text-primary' : 'text-app-sub/60'} />
      <p className={`text-[12px] font-bold ${isToday ? 'text-primary' : 'text-app-sub'}`}>
        {isToday ? `今日・${formatLocalDate(dateStr)}` : formatLocalDate(dateStr, !isThisYear(dateStr))}
      </p>
    </div>
  )
}

// ─── メインコンポーネント ──────────────────────────────────────────────────
export default function PersonalEventsPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth()

  const [events, setEvents] = useState<PersonalEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pastOpen, setPastOpen] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null)
  const [modalDate, setModalDate] = useState<string | null>(null)

  const today = getTodayStr()

  // ─── データ取得 ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) { setIsLoading(false); return }

    apiClient.get('/api/v1/personal_events')
      .then(res => setEvents(res.data as PersonalEvent[]))
      .catch(() => toast.error('予定の読み込みに失敗しました'))
      .finally(() => setIsLoading(false))
  }, [isLoggedIn, authLoading])

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
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? res.data : e))
        toast('予定を更新しました', { style: { fontSize: '13px' } })
      } else {
        const res = await apiClient.post('/api/v1/personal_events', payload)
        setEvents(prev => [...prev, res.data])
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
      setEvents(prev => prev.filter(e => e.id !== id))
      toast('予定を削除しました', { style: { fontSize: '13px' } })
    } catch {
      toast.error('削除に失敗しました')
      throw new Error('delete failed')
    }
  }

  const openAdd = (defaultDate?: string) => {
    setEditingEvent(null)
    setModalDate(defaultDate ?? today)
    setModalOpen(true)
  }

  const openEdit = (event: PersonalEvent) => {
    setEditingEvent(event)
    setModalDate(event.event_date)
    setModalOpen(true)
  }

  // ─── 未ログイン ──────────────────────────────────────────────────────────
  if (!authLoading && !isLoggedIn) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-md">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <CalendarDays size={32} className="text-primary" />
          </span>
          <h1 className="text-[22px] font-black text-app-text mb-3 theme-readable">マイ予定</h1>
          <p className="text-[14px] text-app-sub leading-relaxed mb-6 theme-readable">
            ログインすると、個人の予定を追加・管理できます。
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
          <div className="h-7 bg-gray-200 rounded-lg w-24" />
          <div className="h-[280px] bg-gray-100 rounded-2xl mt-4" />
          <div className="h-[180px] bg-gray-100 rounded-2xl" />
        </div>
      </main>
    )
  }

  const { todayGroup, futureGroups, pastList } = groupByDate(events, today)
  const hasFuture = todayGroup.length > 0 || futureGroups.length > 0

  return (
    <main className="flex-1 p-6 max-w-2xl mx-auto w-full pb-28">

      {/* ─── ページヘッダー ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="mb-6 theme-page-header"
      >
        <h1 className="text-[26px] font-black text-app-text theme-readable">マイ予定</h1>
        <p className="text-[13px] text-app-sub mt-1 theme-readable">
          {events.length > 0 ? `全${events.length}件` : '予定を追加して始めましょう'}
        </p>
      </motion.div>

      {/* ─── 予定一覧 ────────────────────────────────────────────── */}
      {hasFuture ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.06 }}
          className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden mb-4 theme-card-bg"
        >
          {/* 今日 */}
          {todayGroup.length > 0 && (
            <>
              <DateGroupHeader dateStr={today} isToday />
              <AnimatePresence mode="popLayout">
                {todayGroup.map((ev, i) => (
                  <EventRow key={ev.id} event={ev} onEdit={() => openEdit(ev)} delay={i * 0.04} />
                ))}
              </AnimatePresence>
            </>
          )}

          {/* 今後の各日付 */}
          {futureGroups.map(({ dateStr, events: dayEvents }) => (
            <div key={dateStr}>
              <div className="mx-5 h-px bg-gray-100 mt-2" />
              <DateGroupHeader dateStr={dateStr} />
              <AnimatePresence mode="popLayout">
                {dayEvents.map((ev, i) => (
                  <EventRow key={ev.id} event={ev} onEdit={() => openEdit(ev)} delay={i * 0.04} />
                ))}
              </AnimatePresence>
            </div>
          ))}

          <div className="pb-2" />
        </motion.div>
      ) : (
        /* 今後の予定がない場合 */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.06 }}
          className="flex flex-col items-center py-14 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-4"
        >
          <Image
            src="/images/undraw_time-management_4ss6.svg"
            alt="予定なし"
            width={160}
            height={120}
            className="mb-5 opacity-70"
          />
          <p className="text-[15px] font-bold text-app-sub mb-1">今後の予定はありません</p>
          <p className="text-[12px] text-app-sub/60 mb-5">
            ＋ボタンから予定を追加しましょう
          </p>
        </motion.div>
      )}

      {/* ─── 過去の予定（折り畳み） ──────────────────────────────── */}
      {pastList.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          <button
            onClick={() => setPastOpen(prev => !prev)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-app-sub/60" />
              <span className="text-[13px] font-semibold text-app-sub">
                過去の予定 {pastList.length}件
              </span>
            </div>
            <motion.div
              animate={{ rotate: pastOpen ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <ChevronDown size={16} className="text-app-sub/60" />
            </motion.div>
          </button>

          <AnimatePresence>
            {pastOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="mx-5 h-px bg-gray-100" />
                {pastList.map((ev, i) => (
                  <div key={ev.id}>
                    {(i === 0 || pastList[i - 1].event_date !== ev.event_date) && (
                      <DateGroupHeader dateStr={ev.event_date} />
                    )}
                    <EventRow event={ev} onEdit={() => openEdit(ev)} />
                  </div>
                ))}
                <div className="pb-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── FABボタン ────────────────────────────────────────────── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => openAdd()}
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

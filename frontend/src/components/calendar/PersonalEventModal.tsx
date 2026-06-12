'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Save, Pencil, Clock, MapPin, Link, ExternalLink, CalendarDays, Navigation } from 'lucide-react'
import { PersonalEvent } from '@/types/personalEvent'
import { FUKUSHIMA_MUNICIPALITIES } from '@/constants/municipalities'

type Props = {
  isOpen: boolean
  selectedDate: string | null
  existingEvent: PersonalEvent | null
  onClose: () => void
  onSave: (data: {
    title: string
    memo: string
    date: string
    startTime: string
    endTime: string
    location: string
    url: string
    municipality: string
  }) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export default function PersonalEventModal({
  isOpen,
  selectedDate,
  existingEvent,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [memo, setMemo] = useState('')
  const [startHour, setStartHour] = useState('')
  const [startMin, setStartMin] = useState('')
  const [endHour, setEndHour] = useState('')
  const [endMin, setEndMin] = useState('')
  const [location, setLocation] = useState('')
  const [url, setUrl] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle(existingEvent?.title ?? '')
      setDate(existingEvent?.event_date ?? selectedDate ?? '')
      setMemo(existingEvent?.memo ?? '')
      const parseTime = (t: string | null | undefined) => {
        if (!t) return { h: '', m: '' }
        const [h, m] = t.slice(0, 5).split(':')
        return { h: h ?? '', m: m ?? '' }
      }
      const st = parseTime(existingEvent?.start_time)
      const et = parseTime(existingEvent?.end_time)
      setStartHour(st.h)
      setStartMin(st.m)
      setEndHour(et.h)
      setEndMin(et.m)
      setLocation(existingEvent?.location ?? '')
      setUrl(existingEvent?.url ?? '')
      setMunicipality(existingEvent?.municipality ?? '')
    }
  }, [isOpen, existingEvent, selectedDate])

  const buildTime = (h: string, m: string) =>
    h && m ? `${h.padStart(2, '0')}:${m.padStart(2, '0')}` : ''

  const handleSave = async () => {
    if (!title.trim() || !date) return
    setIsSaving(true)
    try {
      await onSave({
        title: title.trim(),
        memo: memo.trim(),
        date,
        startTime: buildTime(startHour, startMin),
        endTime: buildTime(endHour, endMin),
        location: location.trim(),
        url: url.trim(),
        municipality,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!existingEvent) return
    setIsDeleting(true)
    try {
      await onDelete(existingEvent.id)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const openMap = () => {
    if (!location.trim()) return
    const dest = encodeURIComponent(location.trim())

    if (!navigator.geolocation) {
      window.open(`https://maps.google.com/?q=${dest}`, '_blank')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsGettingLocation(false)
        const origin = `${coords.latitude},${coords.longitude}`
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`,
          '_blank',
        )
      },
      () => {
        setIsGettingLocation(false)
        window.open(`https://maps.google.com/?q=${dest}`, '_blank')
      },
      { timeout: 8000 },
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* モーダル本体 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.22)] w-full max-w-sm pointer-events-auto max-h-[90vh] overflow-y-auto">

              {/* ヘッダー */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Pencil size={13} className="text-emerald-600" />
                  </div>
                  <p className="text-[14px] font-bold text-gray-800">
                    {existingEvent ? 'マイ予定を編集' : 'マイ予定を追加'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={13} className="text-gray-500" />
                </button>
              </div>

              {/* フォーム */}
              <div className="px-5 pt-4 pb-5 flex flex-col gap-3">

                {/* タイトル */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                    タイトル <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="例: 誕生日パーティー"
                    maxLength={100}
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all"
                  />
                </div>

                {/* 日付 */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                    <CalendarDays size={11} />日付 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all"
                  />
                </div>

                {/* 時間 */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                    <Clock size={11} />時間
                  </label>
                  <div className="flex items-center gap-2">
                    {/* 開始時間 */}
                    <div className="flex-1 flex gap-1">
                      <select
                        value={startHour}
                        onChange={e => setStartHour(e.target.value)}
                        className="flex-1 px-2 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all bg-white"
                      >
                        <option value="">--</option>
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-gray-400 self-center text-[12px]">:</span>
                      <select
                        value={startMin}
                        onChange={e => setStartMin(e.target.value)}
                        className="flex-1 px-2 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all bg-white"
                      >
                        <option value="">--</option>
                        {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <span className="text-[12px] text-gray-400 shrink-0">〜</span>
                    {/* 終了時間 */}
                    <div className="flex-1 flex gap-1">
                      <select
                        value={endHour}
                        onChange={e => setEndHour(e.target.value)}
                        className="flex-1 px-2 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all bg-white"
                      >
                        <option value="">--</option>
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-gray-400 self-center text-[12px]">:</span>
                      <select
                        value={endMin}
                        onChange={e => setEndMin(e.target.value)}
                        className="flex-1 px-2 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all bg-white"
                      >
                        <option value="">--</option>
                        {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 場所 */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                    <MapPin size={11} />場所
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="例: 郡山市民文化センター"
                      maxLength={200}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={openMap}
                      disabled={!location.trim() || isGettingLocation}
                      title="現在地からのルートをGoogleマップで開く"
                      className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isGettingLocation
                        ? <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin block" />
                        : <ExternalLink size={14} />
                      }
                    </button>
                  </div>
                  {location.trim() && (
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">
                      ボタンで現在地からのルートをGoogleマップで開きます
                    </p>
                  )}
                </div>

                {/* 市町村（マップ制覇連携） */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                    <Navigation size={11} />訪問予定の市町村
                    <span className="text-gray-300 font-normal ml-1">（マップ制覇に連携）</span>
                  </label>
                  <select
                    value={municipality}
                    onChange={e => setMunicipality(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all bg-white"
                  >
                    <option value="">未設定</option>
                    {FUKUSHIMA_MUNICIPALITIES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {municipality && (
                    <p className="text-[10px] text-emerald-600 mt-1 ml-1">
                      日付を過ぎると、マップ上に「確認待ちピン」が表示されます
                    </p>
                  )}
                </div>

                {/* URL */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                    <Link size={11} />URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://..."
                      maxLength={500}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all"
                    />
                    {url.trim() && (
                      <a
                        href={url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* メモ */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                    メモ
                  </label>
                  <textarea
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    placeholder="例: 〇〇さんへのプレゼントを忘れずに"
                    maxLength={500}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all resize-none"
                  />
                </div>

                {/* ボタン行 */}
                <div className="flex gap-2 pt-1">
                  {existingEvent && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      <Trash2 size={12} />削除
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!title.trim() || !date || isSaving}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <Save size={12} />
                    {isSaving ? '保存中...' : '保存する'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

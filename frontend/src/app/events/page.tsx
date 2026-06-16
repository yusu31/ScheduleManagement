'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import apiClient from '@/lib/axios'
import EventCard from '@/components/events/EventCard'
import RandomIllustration from '@/components/RandomIllustration'
import FilterDrawer from '@/components/events/FilterDrawer'
import { Event } from '@/types/event'
import { useFavorites } from '@/contexts/FavoritesContext'

const NO_RESULT_IMAGES = [
  '/images/undraw_not-found_6bgl.svg',
  '/images/undraw_searching_no1g.svg',
  '/images/undraw_searching-everywhere_tffi.svg',
  '/images/undraw_no-data_ig65.svg',
]

// ─── スケルトンカード（Spotify・Vercel 方式）─────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07),0_0_0_1px_rgba(0,0,0,0.05)] animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        <div className="h-[22px] w-24 rounded-full bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3.5 w-36 rounded bg-gray-200 mt-1" />
      </div>
    </div>
  )
}

// ─── スマートページネーション ──────────────────────────────────────
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }
  const btnBase = 'min-w-[36px] h-9 rounded-full text-[13px] font-semibold transition-all duration-150 flex items-center justify-center'
  return (
    <div className="flex items-center justify-center gap-1 mt-6 mb-10">
      <button
        onClick={() => { onChange(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        disabled={page === 1}
        className={`${btnBase} px-3 text-app-sub hover:bg-app-border disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="前のページ"
      >
        ←
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="min-w-[36px] h-9 flex items-center justify-center text-[13px] text-app-sub select-none">···</span>
        ) : (
          <button
            key={p}
            onClick={() => { onChange(p as number); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className={`${btnBase} px-2 ${p === page ? 'bg-primary text-white shadow-sm' : 'text-app-sub hover:bg-app-border'}`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => { onChange(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        disabled={page === totalPages}
        className={`${btnBase} px-3 text-app-sub hover:bg-app-border disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="次のページ"
      >
        →
      </button>
    </div>
  )
}

// ─── グリッドアニメーション設定 ────────────────────────────────────
// staggerChildren: 各カードを 0.05 秒ずつ時間差で出現させる
const gridVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
}

// ─── メインページ ─────────────────────────────────────────────────
const PER_PAGE = 12

export default function EventsPage() {
  const [events,    setEvents]    = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search,    setSearch]    = useState('')
  const [area,      setArea]      = useState('すべての地域')
  const [category,  setCategory]  = useState('すべて')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [page,      setPage]      = useState(1)
  const [showPast,  setShowPast]  = useState(false)
  const searchParams = useSearchParams()
  const [tab,         setTab]         = useState<'all' | 'favorites'>(
    searchParams.get('tab') === 'favorites' ? 'favorites' : 'all'
  )
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  const { isFavorited } = useFavorites()

  const activeFilterCount = [
    category !== 'すべて',
    area !== 'すべての地域',
    activeTag !== null,
    showPast,
  ].filter(Boolean).length

  const resetFilters = () => {
    setCategory('すべて')
    setArea('すべての地域')
    setActiveTag(null)
    setShowPast(false)
  }

  useEffect(() => {
    apiClient.get('/api/v1/events')
      .then(res => setEvents(res.data))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const now = new Date()
    let result = events
    if (tab === 'favorites')     result = result.filter(e => isFavorited(e.id))
    if (area !== 'すべての地域') result = result.filter(e => e.area === area)
    if (category !== 'すべて')   result = result.filter(e => e.category === category)
    if (activeTag)               result = result.filter(e => (e.tags ?? []).includes(activeTag))
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.area.toLowerCase().includes(q)
      )
    }
    const oneYearAgo = new Date(now)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const upcoming = result
      .filter(e => new Date(e.start_at) >= now)
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    if (!showPast) return upcoming
    const past = result
      .filter(e => { const d = new Date(e.start_at); return d < now && d >= oneYearAgo })
      .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
    return [...upcoming, ...past]
  }, [events, area, category, activeTag, search, showPast, tab, isFavorited])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filtered.slice(start, start + PER_PAGE)
  }, [filtered, page])

  useEffect(() => { setPage(1) }, [area, category, activeTag, search, showPast, tab])

  return (
    <div className="min-h-screen">

      {/* ─── フィルターバー（新デザイン） ─── */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-40 px-6 pt-3.5 pb-3">

        {/* 行1: 検索バー ＋ 絞り込みボタン */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="relative flex-1 max-w-[520px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-sub pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="イベント名・場所で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-app-bg border-[1.5px] border-app-border rounded-full text-[13px] text-app-text outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(95,139,139,0.12)] transition-all placeholder:text-app-sub"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-sub hover:text-app-text transition-colors text-[16px] leading-none">✕</button>
            )}
          </div>

          {/* 絞り込みボタン */}
          <motion.button
            onClick={() => setDrawerOpen(true)}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-colors border ${
              activeFilterCount > 0
                ? 'bg-primary text-white border-primary shadow-[0_2px_12px_rgba(95,139,139,0.35)]'
                : 'bg-white text-app-sub border-app-border hover:border-primary hover:text-primary'
            }`}
          >
            <SlidersHorizontal size={14} />
            絞り込み
            {activeFilterCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 text-white text-[10px] font-bold flex items-center justify-center"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* 行2: タブ ＋ アクティブフィルターチップ */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* タブ */}
          {(['all', 'favorites'] as const).map(t => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                tab === t ? 'bg-primary text-white shadow-sm' : 'text-app-sub hover:bg-app-border'
              }`}
            >
              {t === 'favorites' && <Heart size={11} className={tab === 'favorites' ? 'fill-white' : ''} />}
              {t === 'all' ? 'すべて' : 'お気に入り'}
            </motion.button>
          ))}

          {/* アクティブフィルターチップ（選択中のみ表示） */}
          <AnimatePresence>
            {category !== 'すべて' && (
              <motion.button key="cat" onClick={() => setCategory('すべて')}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 480, damping: 20 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors"
              >
                {category} <X size={11} />
              </motion.button>
            )}
            {area !== 'すべての地域' && (
              <motion.button key="area" onClick={() => setArea('すべての地域')}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 480, damping: 20 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors"
              >
                {area} <X size={11} />
              </motion.button>
            )}
            {activeTag && (
              <motion.button key="tag" onClick={() => setActiveTag(null)}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 480, damping: 20 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors"
              >
                {activeTag} <X size={11} />
              </motion.button>
            )}
            {showPast && (
              <motion.button key="past" onClick={() => setShowPast(false)}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 480, damping: 20 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors"
              >
                終了済み含む <X size={11} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── フィルタードロワー ─── */}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={category} setCategory={setCategory}
        area={area} setArea={setArea}
        activeTag={activeTag} setActiveTag={setActiveTag}
        showPast={showPast} setShowPast={setShowPast}
        onReset={resetFilters}
      />

      {/* ─── メインコンテンツ ─── */}
      <main className="max-w-[1160px] mx-auto px-8 py-8 pb-28">
        {isLoading ? (
          // スケルトンローディング（10枚のシルエット）
          <div className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-x-[28px] gap-y-[24px] py-6">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
              <p className="text-[13px] text-app-sub font-medium">
                {filtered.length}件のイベントが見つかりました
              </p>
              <div className="flex items-center gap-3">
                {/* 終了済みトグル */}
                <label className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setShowPast(v => !v)}>
                  <div className="relative w-9 h-5 flex-shrink-0">
                    <div className={`absolute inset-0 rounded-full transition-colors duration-200 ${showPast ? 'bg-primary' : 'bg-gray-200'}`} />
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${showPast ? 'translate-x-4' : ''}`} />
                  </div>
                  <span className="text-[12px] text-app-sub font-medium whitespace-nowrap">終了済みを表示</span>
                </label>
                {/* ページドロップダウン */}
                {totalPages > 1 && (
                  <div className="relative">
                    <select
                      value={page}
                      onChange={e => setPage(Number(e.target.value))}
                      className="appearance-none text-[12px] font-semibold text-app-text bg-white border border-app-border rounded-full pl-3 pr-7 py-1.5 outline-none cursor-pointer hover:bg-app-bg transition-colors"
                    >
                      {Array.from({ length: totalPages }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} / {totalPages} ページ</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-app-sub" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <motion.div
                className="flex flex-col items-center py-20 text-app-sub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <RandomIllustration
                  srcs={NO_RESULT_IMAGES}
                  alt="検索結果なし"
                  width={220}
                  height={180}
                  className="mb-5 opacity-80"
                />
                <p className="text-[15px] font-semibold text-app-text">条件に合うイベントが見つかりませんでした</p>
                <p className="text-[13px] mt-1">絞り込み条件を変えてみてください</p>
              </motion.div>
            ) : (
              <>
              <motion.div
                key={`${area}-${category}-${activeTag ?? ''}-${search}-${page}`}
                className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-x-[28px] gap-y-[24px] py-6"
                variants={gridVariants}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence mode="popLayout">
                  {paginated.map(event => (
                    <motion.div
                      key={event.id}
                      variants={cardVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                      className="h-full"
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

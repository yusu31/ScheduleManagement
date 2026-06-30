'use client'

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal, X, ChevronDown,
  UtensilsCrossed, Beef, Soup, Coffee, ChefHat, Tag, Wheat, Flame, Wine,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import apiClient from '@/lib/axios'
import { Restaurant } from '@/types/restaurant'
import RestaurantCard from '@/components/gourmet/RestaurantCard'
import RestaurantFilterDrawer from '@/components/gourmet/RestaurantFilterDrawer'
import toast from 'react-hot-toast'

// ---- ハーバーサイン距離計算 ----------------------------------------
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

function parseBudgetMin(budget: string | null): number {
  if (!budget) return 0
  const match = budget.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

// ---- カテゴリ定義 ---------------------------------------------------
const CATEGORY_DEFS: { label: string; shortLabel: string; Icon: LucideIcon; activeBg: string; inactiveBg: string; iconColor: string }[] = [
  { label: '和食',             shortLabel: '和食',       Icon: UtensilsCrossed, activeBg: 'bg-red-500',    inactiveBg: 'bg-red-50',    iconColor: 'text-red-500' },
  { label: 'ラーメン',         shortLabel: 'ラーメン',   Icon: Soup,            activeBg: 'bg-amber-500',  inactiveBg: 'bg-amber-50',  iconColor: 'text-amber-600' },
  { label: '寿司・海鮮',       shortLabel: '寿司',       Icon: UtensilsCrossed, activeBg: 'bg-cyan-500',   inactiveBg: 'bg-cyan-50',   iconColor: 'text-cyan-600' },
  { label: '焼肉',             shortLabel: '焼肉',       Icon: Beef,            activeBg: 'bg-orange-500', inactiveBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { label: 'カフェ・スイーツ', shortLabel: 'カフェ',     Icon: Coffee,          activeBg: 'bg-pink-500',   inactiveBg: 'bg-pink-50',   iconColor: 'text-pink-600' },
  { label: 'ベーカリー',       shortLabel: 'パン',       Icon: Wheat,           activeBg: 'bg-yellow-500', inactiveBg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
  { label: 'イタリアン',       shortLabel: 'イタリアン', Icon: ChefHat,         activeBg: 'bg-green-500',  inactiveBg: 'bg-green-50',  iconColor: 'text-green-600' },
  { label: '中華',             shortLabel: '中華',       Icon: UtensilsCrossed, activeBg: 'bg-yellow-500', inactiveBg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
  { label: '洋食',             shortLabel: '洋食',       Icon: ChefHat,         activeBg: 'bg-blue-500',   inactiveBg: 'bg-blue-50',   iconColor: 'text-blue-500' },
  { label: 'フレンチ',         shortLabel: 'フレンチ',   Icon: ChefHat,         activeBg: 'bg-purple-500', inactiveBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { label: 'カレー',           shortLabel: 'カレー',     Icon: Flame,           activeBg: 'bg-orange-600', inactiveBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { label: '居酒屋',           shortLabel: '居酒屋',     Icon: Wine,            activeBg: 'bg-violet-500', inactiveBg: 'bg-violet-50', iconColor: 'text-violet-600' },
  { label: 'その他',           shortLabel: 'その他',     Icon: Tag,             activeBg: 'bg-gray-500',   inactiveBg: 'bg-gray-100',  iconColor: 'text-gray-500' },
]

type SortKey = 'default' | 'distance' | 'budget_asc' | 'budget_desc'
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default',     label: 'おすすめ順' },
  { key: 'distance',    label: '近い順' },
  { key: 'budget_asc',  label: '予算：安い順' },
  { key: 'budget_desc', label: '予算：高い順' },
]

function SkeletonCard() {
  return (
    <div className="flex gap-0 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
      <div className="w-[120px] h-[120px] bg-gray-200 shrink-0" />
      <div className="flex-1 px-3.5 py-3 flex flex-col gap-2">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-3 w-28 rounded bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-200" />
      </div>
    </div>
  )
}

function RestaurantsInner() {
  const searchParams = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [municipalities, setMunicipalities] = useState<string[]>(searchParams.getAll('municipalities[]'))
  const [maxDistance, setMaxDistance] = useState<number | null>(null)
  const [situations, setSituations] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  useEffect(() => {
    if (categories.length > 0) setSelectedCategory(null)
  }, [categories])

  const activeFilterCount =
    categories.length + municipalities.length + situations.length +
    (selectedCategory ? 1 : 0) + (maxDistance !== null ? 1 : 0)

  useEffect(() => {
    apiClient.get('/api/v1/restaurants')
      .then(res => setRestaurants(res.data))
      .catch(() => toast.error('グルメ情報の読み込みに失敗しました'))
      .finally(() => setIsLoading(false))
  }, [])

  const requestGps = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('このブラウザは位置情報に対応していません')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setSortKey('distance')
        setGpsLoading(false)
        toast.success('現在地を取得しました')
      },
      () => {
        toast.error('位置情報の取得に失敗しました。ブラウザの設定をご確認ください')
        setGpsLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }, [])

  const handleSortSelect = (key: SortKey) => {
    if (key === 'distance') {
      if (userPos) { setSortKey('distance') } else { requestGps() }
    } else {
      setSortKey(key)
    }
    setSortMenuOpen(false)
  }

  const resetFilters = () => {
    setSelectedCategory(null)
    setCategories([])
    setMunicipalities([])
    setMaxDistance(null)
    setSituations([])
    setSearch('')
    setSortKey('default')
  }

  const distanceMap = useMemo(() => {
    if (!userPos) return new Map<number, number>()
    const map = new Map<number, number>()
    restaurants.forEach(r => {
      if (r.latitude && r.longitude)
        map.set(r.id, calcDistance(userPos.lat, userPos.lng, parseFloat(r.latitude), parseFloat(r.longitude)))
    })
    return map
  }, [userPos, restaurants])

  const filtered = useMemo(() => {
    let result = restaurants

    if (selectedCategory) {
      result = result.filter(r => r.category === selectedCategory)
    } else if (categories.length > 0) {
      result = result.filter(r => categories.includes(r.category))
    }

    if (municipalities.length > 0)
      result = result.filter(r => r.municipality && municipalities.includes(r.municipality))

    if (maxDistance !== null && userPos)
      result = result.filter(r => {
        const d = distanceMap.get(r.id)
        return d !== undefined && d <= maxDistance
      })

    // シーン・用途はOR条件（いずれか一つに該当すれば表示）
    if (situations.length > 0)
      result = result.filter(r => situations.some(s => (r.situation_tags ?? []).includes(s)))

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.municipality?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q)
      )
    }

    const sorted = [...result]
    if (sortKey === 'distance' && userPos) {
      sorted.sort((a, b) => (distanceMap.get(a.id) ?? Infinity) - (distanceMap.get(b.id) ?? Infinity))
    } else if (sortKey === 'budget_asc') {
      sorted.sort((a, b) => parseBudgetMin(a.budget) - parseBudgetMin(b.budget))
    } else if (sortKey === 'budget_desc') {
      sorted.sort((a, b) => parseBudgetMin(b.budget) - parseBudgetMin(a.budget))
    }
    return sorted
  }, [restaurants, selectedCategory, categories, municipalities, maxDistance, situations, search, sortKey, userPos, distanceMap])

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? 'おすすめ順'
  const hasActiveCondition = activeFilterCount > 0 || !!search

  return (
    <div className="min-h-screen" onClick={() => setSortMenuOpen(false)}>

      {/* ── スティッキーヘッダー ── */}
      <div className="theme-sticky-header border-b border-app-border sticky top-0 z-40 px-4 pt-3 pb-2">

        {/* 検索バー + 絞り込みボタン */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-sub pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="店名・市区町村・住所で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-app-bg border-[1.5px] border-app-border rounded-full text-[13px] text-app-text outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(95,139,139,0.12)] transition-all placeholder:text-app-sub"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-sub hover:text-app-text text-[15px] leading-none">
                ✕
              </button>
            )}
          </div>
          <motion.button
            onClick={() => setDrawerOpen(true)}
            whileTap={{ scale: 0.94 }}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-colors shrink-0 ${
              activeFilterCount > 0
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
            }`}
          >
            <SlidersHorizontal size={14} />
            絞り込み
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* カテゴリアイコン行 */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-hide -mx-1 px-1">
          <motion.button
            onClick={() => { setSelectedCategory(null); setCategories([]) }}
            whileTap={{ scale: 0.90 }}
            className="shrink-0 flex flex-col items-center gap-1"
          >
            <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all ${
              !selectedCategory && categories.length === 0
                ? 'bg-primary shadow-[0_4px_12px_rgba(95,139,139,0.40)]'
                : 'bg-white/60'
            }`}>
              <Tag size={15} className={!selectedCategory && categories.length === 0 ? 'text-white' : 'text-app-sub'} />
            </div>
            <span className={`text-[10px] font-bold ${!selectedCategory && categories.length === 0 ? 'text-primary' : 'text-app-sub'}`}>
              すべて
            </span>
          </motion.button>

          {CATEGORY_DEFS.map(cat => {
            const active = selectedCategory === cat.label
            return (
              <motion.button
                key={cat.label}
                onClick={() => {
                  setSelectedCategory(prev => prev === cat.label ? null : cat.label)
                  setCategories([])
                }}
                whileTap={{ scale: 0.90 }}
                className="shrink-0 flex flex-col items-center gap-1"
              >
                <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all ${
                  active
                    ? `${cat.activeBg} shadow-[0_4px_12px_rgba(0,0,0,0.20)]`
                    : `${cat.inactiveBg}`
                }`}>
                  <cat.Icon size={15} className={active ? 'text-white' : cat.iconColor} />
                </div>
                <span className={`text-[10px] font-bold whitespace-nowrap ${active ? 'text-primary' : 'text-app-sub'}`}>
                  {cat.shortLabel}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* 件数 + ソートボタン */}
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[12px] text-app-sub font-medium">
            {isLoading ? '読み込み中...' : `${filtered.length}件`}
            {sortKey === 'distance' && userPos && <span className="ml-1 text-primary font-semibold">（近い順）</span>}
          </p>
          <div className="flex items-center gap-2.5">
            {hasActiveCondition && (
              <button onClick={resetFilters} className="text-[11px] text-app-sub hover:text-primary transition-colors underline">
                リセット
              </button>
            )}
            <div className="relative">
              <motion.button
                onClick={e => { e.stopPropagation(); setSortMenuOpen(prev => !prev) }}
                whileTap={{ scale: 0.95 }}
                className="sort-dropdown-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-app-border text-[12px] font-semibold text-app-text hover:border-primary hover:text-primary transition-colors"
              >
                {currentSortLabel}
                <ChevronDown size={12} className={`transition-transform duration-200 ${sortMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              <AnimatePresence>
                {sortMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-gray-100 overflow-hidden z-50"
                    onClick={e => e.stopPropagation()}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => handleSortSelect(opt.key)}
                        className={`w-full text-left px-4 py-3 text-[13px] font-medium transition-colors border-b border-gray-100 last:border-0 ${
                          sortKey === opt.key
                            ? 'bg-teal-50 text-teal-700 font-semibold'
                            : 'text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* アクティブフィルターチップ（selectedCategory / municipality / drawer category） */}
        <AnimatePresence>
          {(selectedCategory || municipalities.length > 0 || categories.length > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 flex-wrap overflow-hidden pt-2"
            >
              {selectedCategory && (
                <motion.button
                  onClick={() => setSelectedCategory(null)}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-semibold"
                >
                  {selectedCategory} <X size={9} />
                </motion.button>
              )}
              {municipalities.map(m => (
                <motion.button key={m}
                  onClick={() => setMunicipalities(prev => prev.filter(x => x !== m))}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold"
                >
                  {m} <X size={9} />
                </motion.button>
              ))}
              {categories.map(cat => (
                <motion.button key={cat}
                  onClick={() => setCategories(prev => prev.filter(c => c !== cat))}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold"
                >
                  {cat} <X size={9} />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* フィルタードロワー */}
      <RestaurantFilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        setCategories={setCategories}
        municipalities={municipalities}
        setMunicipalities={setMunicipalities}
        maxDistance={maxDistance}
        setMaxDistance={setMaxDistance}
        situations={situations}
        setSituations={setSituations}
        onReset={resetFilters}
        userPos={userPos}
        onRequestGps={requestGps}
        gpsLoading={gpsLoading}
      />

      {/* カードリスト */}
      <main className="max-w-[800px] mx-auto px-4 py-4 pb-28">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <p className="text-[15px] font-semibold text-app-text">条件に合うお店が見つかりませんでした</p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-full bg-primary/10 text-primary text-[13px] font-semibold hover:bg-primary/20 transition-colors"
            >
              条件をリセット
            </button>
          </div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${categories.join(',')}-${municipalities.join(',')}-${situations.join(',')}-${search}-${sortKey}`}
            className="flex flex-col gap-3"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map(restaurant => (
                <motion.div
                  key={restaurant.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
                  }}
                  layout
                  exit={{ opacity: 0, y: -4 }}
                >
                  <RestaurantCard
                    restaurant={restaurant}
                    distance={distanceMap.get(restaurant.id) ?? null}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default function RestaurantsPage() {
  return (
    <Suspense>
      <RestaurantsInner />
    </Suspense>
  )
}

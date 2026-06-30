'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import apiClient from '@/lib/axios'
import { Spot } from '@/types/spot'
import SpotCard from '@/components/spots/SpotCard'
import AreaSelectMap from '@/components/ui/AreaSelectMap'
import SpotFilterDrawer from '@/components/spots/SpotFilterDrawer'
import toast from 'react-hot-toast'

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
      <div className="bg-gray-200" style={{ aspectRatio: '4/3' }} />
      <div className="px-3.5 pt-3 pb-3.5 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-28 rounded bg-gray-200 mt-1" />
      </div>
    </div>
  )
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
}

const SEASON_LABEL: Record<string, string> = {
  spring: '🌸 春', summer: '🌿 夏', autumn: '🍂 秋', winter: '❄️ 冬',
}

function SpotsInner() {
  const searchParams = useSearchParams()
  const [spots, setSpots] = useState<Spot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>(searchParams.getAll('municipalities[]'))
  const [categories, setCategories] = useState<string[]>([])
  const [season, setSeason] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeFilterCount = categories.length + (season ? 1 : 0)

  const toggleMunicipality = (muni: string) => {
    setSelectedMunicipalities(prev =>
      prev.includes(muni) ? prev.filter(m => m !== muni) : [...prev, muni]
    )
  }

  const resetFilters = () => {
    setCategories([])
    setSeason('')
    setSelectedRegion('')
    setSelectedMunicipalities([])
    setSearch('')
  }

  useEffect(() => {
    apiClient.get('/api/v1/spots')
      .then(res => setSpots(res.data))
      .catch(() => toast.error('スポットの読み込みに失敗しました'))
      .finally(() => setIsLoading(false))
  }, [])

  // 市区町村ごとのスポット件数（マップのバッジ用）
  const spotCountsByMuni = useMemo(() => {
    const counts: Record<string, number> = {}
    spots.forEach(s => {
      if (s.municipality) counts[s.municipality] = (counts[s.municipality] ?? 0) + 1
    })
    return counts
  }, [spots])

  const filtered = useMemo(() => {
    let result = spots
    // 市区町村が選択されていればそれで絞り込み（複数OR）
    if (selectedMunicipalities.length > 0) {
      result = result.filter(s => s.municipality && selectedMunicipalities.includes(s.municipality))
    }
    if (categories.length) result = result.filter(s => categories.includes(s.category))
    if (season)            result = result.filter(s => s.season === season || s.season === 'all')
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.municipality?.toLowerCase().includes(q)
      )
    }
    return result
  }, [spots, selectedMunicipalities, categories, season, search])

  return (
    <div className="min-h-screen">

      {/* スティッキーヘッダー */}
      <div className="theme-sticky-header border-b border-app-border sticky top-0 z-40 px-6 pt-3.5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1 max-w-[480px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-sub pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="スポット名・市区町村で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-app-bg border-[1.5px] border-app-border rounded-full text-[13px] text-app-text outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(95,139,139,0.12)] transition-all placeholder:text-app-sub"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-sub hover:text-app-text text-[15px] leading-none">✕</button>
            )}
          </div>

          <motion.button
            onClick={() => setDrawerOpen(true)}
            whileTap={{ scale: 0.94 }}
            className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-[13px] font-semibold border transition-colors ${
              activeFilterCount > 0
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-app-sub border-app-border hover:border-primary hover:text-primary'
            }`}
          >
            <SlidersHorizontal size={14} />
            絞り込み
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 w-5 h-5 rounded-full bg-red-400 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* アクティブフィルターチップ */}
        <AnimatePresence>
          {(selectedMunicipalities.length > 0 || categories.length > 0 || season) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 flex-wrap overflow-hidden pb-1"
            >
              {selectedMunicipalities.map(muni => (
                <motion.button key={muni}
                  onClick={() => toggleMunicipality(muni)}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-semibold"
                >
                  📍 {muni} <X size={10} />
                </motion.button>
              ))}
              {categories.map(cat => (
                <motion.button key={cat}
                  onClick={() => setCategories(prev => prev.filter(c => c !== cat))}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-semibold"
                >
                  {cat} <X size={10} />
                </motion.button>
              ))}
              {season && (
                <motion.button
                  onClick={() => setSeason('')}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-semibold"
                >
                  {SEASON_LABEL[season]} <X size={10} />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* フィルタードロワー */}
      <SpotFilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        setCategories={setCategories}
        season={season}
        setSeason={setSeason}
        onReset={resetFilters}
      />

      {/* メインコンテンツ */}
      <main className="max-w-[1200px] mx-auto px-6 py-6 pb-28">

        {/* エリアマップ */}
        {!isLoading && (
          <div className="mb-8 p-5 rounded-2xl theme-card-bg border border-app-border shadow-sm">
            <p className="text-[13px] font-bold text-app-text mb-3">エリアから探す</p>
            <AreaSelectMap
              selectedRegion={selectedRegion}
              selectedMunicipalities={selectedMunicipalities}
              onRegionSelect={setSelectedRegion}
              onMunicipalityToggle={toggleMunicipality}
              spotCounts={spotCountsByMuni}
            />
          </div>
        )}

        {/* スポット一覧 */}
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <p className="text-[13px] text-app-sub font-medium mb-4">
              {filtered.length}件のスポット
              {selectedMunicipalities.length > 0 && ` ／ ${selectedMunicipalities.join('・')}`}
            </p>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <p className="text-[15px] font-semibold text-app-text">条件に合うスポットが見つかりませんでした</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-[13px] font-semibold hover:bg-primary/20 transition-colors"
                >
                  条件をリセット
                </button>
              </div>
            ) : (
              <motion.div
                key={`${selectedMunicipalities.join(',')}-${categories.join(',')}-${season}-${search}`}
                className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5"
                variants={gridVariants}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map(spot => (
                    <motion.div
                      key={spot.id}
                      variants={cardVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="h-full"
                    >
                      <SpotCard spot={spot} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function SpotsPage() {
  return (
    <Suspense>
      <SpotsInner />
    </Suspense>
  )
}

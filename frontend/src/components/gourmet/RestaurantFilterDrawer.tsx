'use client'

import { type Dispatch, type SetStateAction, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw, Navigation, Loader2 } from 'lucide-react'

const CATEGORIES = [
  '和食', 'ラーメン', '寿司・海鮮', '焼肉', 'カフェ・スイーツ',
  'ベーカリー', 'イタリアン', '中華', '洋食', 'フレンチ',
  'カレー', '居酒屋', 'その他',
]

const SITUATIONS = ['子連れOK', 'ランチ向け', 'デートに', 'ひとり飯OK', '個室あり']

const DISTANCE_PRESETS = [3, 5, 10, 20]

const REGIONS = ['県北', '県中', '県南', '会津', '相双', 'いわき'] as const
type Region = typeof REGIONS[number]

const REGION_MUNICIPALITIES: Record<Region, string[]> = {
  '県北':  ['福島市', '二本松市', '伊達市', '本宮市', '桑折町', '国見町', '川俣町', '大玉村'],
  '県中':  ['郡山市', '須賀川市', '田村市', '鏡石町', '天栄村', '石川町', '玉川村', '平田村', '浅川町', '古殿町', '三春町', '小野町'],
  '県南':  ['白河市', '西郷村', '泉崎村', '中島村', '矢吹町', '棚倉町', '矢祭町', '塙町', '鮫川村'],
  '会津':  ['会津若松市', '喜多方市', '北塩原村', '西会津町', '磐梯町', '猪苗代町', '会津坂下町', '湯川村', '柳津町', '三島町', '金山町', '昭和村', '会津美里町'],
  '相双':  ['相馬市', '南相馬市', '広野町', '楢葉町', '富岡町', '川内村', '大熊町', '双葉町', '浪江町', '葛尾村', '新地町', '飯舘村'],
  'いわき': ['いわき市'],
}

interface Props {
  isOpen: boolean
  onClose: () => void
  categories: string[]
  setCategories: Dispatch<SetStateAction<string[]>>
  municipalities: string[]
  setMunicipalities: Dispatch<SetStateAction<string[]>>
  maxDistance: number | null
  setMaxDistance: (d: number | null) => void
  situations: string[]
  setSituations: Dispatch<SetStateAction<string[]>>
  onReset: () => void
  userPos: { lat: number; lng: number } | null
  onRequestGps: () => void
  gpsLoading?: boolean
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer select-none
   ${active
     ? 'bg-primary text-white shadow-[0_2px_8px_rgba(95,139,139,0.4)]'
     : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
   }`

export default function RestaurantFilterDrawer({
  isOpen, onClose,
  categories, setCategories,
  municipalities, setMunicipalities,
  maxDistance, setMaxDistance,
  situations, setSituations,
  onReset,
  userPos, onRequestGps, gpsLoading,
}: Props) {
  const [localDistance, setLocalDistance] = useState<number>(maxDistance ?? 50)
  const [activeRegion, setActiveRegion] = useState<Region | null>(null)

  useEffect(() => {
    setLocalDistance(maxDistance !== null ? maxDistance : 50)
  }, [maxDistance])

  const sliderFill = `${((localDistance - 1) / 49) * 100}%`

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-[360px] bg-white z-50 flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.12)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[16px] font-bold text-gray-900">絞り込み</h2>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={onReset}
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/8"
                >
                  <RotateCcw size={12} />
                  リセット
                </motion.button>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </motion.button>
              </div>
            </div>

            {/* フィルター内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-7">

              {/* シーン・用途 */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">シーン・用途</p>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    onClick={() => setSituations([])}
                    whileTap={{ scale: 0.93 }}
                    className={chip(situations.length === 0)}
                  >
                    すべて
                  </motion.button>
                  {SITUATIONS.map(s => (
                    <motion.button
                      key={s}
                      onClick={() => setSituations(prev => toggle(prev, s))}
                      whileTap={{ scale: 0.93 }}
                      className={chip(situations.includes(s))}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* 距離スライダー */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">距離で絞り込み</p>
                  {maxDistance !== null && (
                    <button
                      onClick={() => { setLocalDistance(50); setMaxDistance(null) }}
                      className="text-[11px] text-primary hover:underline"
                    >
                      クリア
                    </button>
                  )}
                </div>

                {!userPos ? (
                  <motion.button
                    onClick={onRequestGps}
                    whileTap={{ scale: 0.97 }}
                    disabled={gpsLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary/40 text-primary text-[13px] font-semibold hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-60"
                  >
                    {gpsLoading
                      ? <><Loader2 size={14} className="animate-spin" />取得中...</>
                      : <><Navigation size={14} />現在地を取得する</>
                    }
                  </motion.button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between min-h-[28px]">
                      <span className="text-[14px] font-bold text-gray-800">
                        {localDistance >= 50 ? 'すべて' : `${localDistance}km 以内`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      step={1}
                      value={localDistance}
                      onChange={e => setLocalDistance(parseInt(e.target.value))}
                      onMouseUp={e => {
                        const v = parseInt((e.target as HTMLInputElement).value)
                        setMaxDistance(v >= 50 ? null : v)
                      }}
                      onTouchEnd={e => {
                        const v = parseInt((e.currentTarget as HTMLInputElement).value)
                        setMaxDistance(v >= 50 ? null : v)
                      }}
                      className="distance-slider"
                      style={{
                        background: `linear-gradient(to right, #5f8b8b ${sliderFill}, #e2e8f0 ${sliderFill})`
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium -mt-1">
                      <span>1km</span>
                      <span>25km</span>
                      <span>すべて</span>
                    </div>
                    {/* プリセットボタン */}
                    <div className="flex gap-1.5 flex-wrap">
                      {DISTANCE_PRESETS.map(d => (
                        <button
                          key={d}
                          onClick={() => { setLocalDistance(d); setMaxDistance(d) }}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                            localDistance === d
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {d}km
                        </button>
                      ))}
                      <button
                        onClick={() => { setLocalDistance(50); setMaxDistance(null) }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          localDistance >= 50
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        すべて
                      </button>
                    </div>
                  </div>
                )}
              </motion.section>

              {/* 市区町村 - 2段階選択 */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.11, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">市区町村</p>
                  {municipalities.length > 0 && (
                    <button
                      onClick={() => setMunicipalities([])}
                      className="text-[11px] text-primary hover:underline"
                    >
                      クリア
                    </button>
                  )}
                </div>

                {/* 地域タブ */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {REGIONS.map(region => {
                    const selectedCount = REGION_MUNICIPALITIES[region].filter(m => municipalities.includes(m)).length
                    return (
                      <button
                        key={region}
                        onClick={() => setActiveRegion(prev => prev === region ? null : region)}
                        className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all border ${
                          activeRegion === region
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : selectedCount > 0
                            ? 'bg-primary/5 text-primary border-primary/20'
                            : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {region}
                        {selectedCount > 0 && (
                          <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold">
                            {selectedCount}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* 選択した地域の市区町村チップ */}
                <AnimatePresence>
                  {activeRegion && (
                    <motion.div
                      key={activeRegion}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 pt-2 pb-1 border-t border-gray-100">
                        {REGION_MUNICIPALITIES[activeRegion].map(m => (
                          <motion.button
                            key={m}
                            onClick={() => setMunicipalities(prev => toggle(prev, m))}
                            whileTap={{ scale: 0.93 }}
                            className={chip(municipalities.includes(m))}
                          >
                            {m}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 選択済み市区町村（全地域分を一覧表示） */}
                {municipalities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {municipalities.map(m => (
                      <button
                        key={m}
                        onClick={() => setMunicipalities(prev => prev.filter(x => x !== m))}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20"
                      >
                        {m} <X size={9} />
                      </button>
                    ))}
                  </div>
                )}
              </motion.section>

              {/* カテゴリ */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">カテゴリ</p>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    onClick={() => setCategories([])}
                    whileTap={{ scale: 0.93 }}
                    className={chip(categories.length === 0)}
                  >
                    すべて
                  </motion.button>
                  {CATEGORIES.map(c => (
                    <motion.button
                      key={c}
                      onClick={() => setCategories(prev => toggle(prev, c))}
                      whileTap={{ scale: 0.93 }}
                      className={chip(categories.includes(c))}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
              </motion.section>

            </div>

            {/* 適用ボタン */}
            <div className="px-6 py-5 border-t border-gray-100">
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(95,139,139,0.35)] hover:bg-primary-dark transition-colors"
              >
                この絞り込みを適用
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

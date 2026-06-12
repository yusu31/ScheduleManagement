'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import RegionItem3D from './RegionItem3D'

type ConquestEntry = {
  id: number
  region_id: string
  conquered_at: string
}

type RegionDef = {
  id: string
  name: string
  ruby: string
  color: string
}

type ItemEntry = {
  region: RegionDef
  conquest: ConquestEntry
}

type Props = {
  items: ItemEntry[]
  initialIndex: number
  onClose: () => void
}

const ITEM_LABELS: Record<string, string> = {
  kenpo: '土湯こけし',
  koriyama: '三春滝桜',
  sukagawa: 'クリスタル',
  kennan: '白河だるま',
  aizu: '赤べこ',
  okuaizu: '只見のSL',
  minamiaizu: 'ネギ',
  soma: '相馬野馬追の競走馬',
  futaba: 'サッカーボール',
  iwaki: 'サーフボード',
  all: '福島県制覇トロフィー',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// テキスト部分のみ軽量スライド（3Dは別管理）
const contentVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 32 : -32,
    opacity: 0,
    transition: { duration: 0.16, ease: 'easeOut' as const },
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.18, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    x: 0,
    transition: { duration: 0.10 },
  },
}

export default function CollectionItemModal({ items, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)
  // 遷移中は 3D モデルを非表示にして WebGL キャンバスを 1 つだけ保つ
  const [showModel, setShowModel] = useState(true)
  const modelTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const { region, conquest } = items[index]
  const photoId = region.id === 'all' ? 'aizu' : region.id

  const hasPrev = index > 0
  const hasNext = index < items.length - 1

  const goTo = (newIndex: number, dir: number) => {
    setShowModel(false)
    setDirection(dir)
    setIndex(newIndex)
    clearTimeout(modelTimerRef.current)
    // exit(0.10s) + enter(0.18s) = 0.28s 完了後に 3D を復元
    modelTimerRef.current = setTimeout(() => setShowModel(true), 320)
  }

  useEffect(() => () => clearTimeout(modelTimerRef.current), [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(Math.max(0, index - 1), -1)
      if (e.key === 'ArrowRight') goTo(Math.min(items.length - 1, index + 1), 1)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length, onClose])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[400] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* 背景写真：フェードのみ（スライドなし・GPU合成で軽い） */}
        <AnimatePresence>
          <motion.img
            key={`bg-${photoId}`}
            src={`/conquer/regions/${photoId}.jpg`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ filter: 'brightness(0.45) saturate(1.2)', pointerEvents: 'none' }}
          />
        </AnimatePresence>

        {/* コンテンツ：mode="wait" で旧→新と順番に切り替え（WebGL 重複ゼロ） */}
        <div className="absolute inset-0 flex flex-col">
          <div style={{ height: '9vh', flexShrink: 0 }} />
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={index}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col items-center gap-5 px-8 text-center"
                style={{ willChange: 'transform, opacity' }}
              >
                {/* ── ヘッダー ── */}
                <div>
                  <p style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.55em',
                    textTransform: 'uppercase', color: '#d4af37',
                    textShadow: '0 0 20px rgba(212,175,55,0.5)',
                  }}>
                    Conquered
                  </p>
                  <h2
                    className="text-5xl font-black tracking-wide"
                    style={{ color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.8)' }}
                  >
                    {region.name}
                  </h2>
                  <div className="flex items-center justify-center gap-3 mt-1">
                    <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.25)' }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.35em' }}>制覇</span>
                    <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.25)' }} />
                  </div>
                </div>

                {/* ── 3Dモデル：遷移中は非表示、完了後フェードイン ── */}
                <div style={{ width: 220, height: 220 }}>
                  <AnimatePresence>
                    {showModel && (
                      <motion.div
                        key={`model-${region.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <RegionItem3D regionId={region.id} autoRotate={true} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── アイテム情報 ── */}
                <div className="text-center space-y-2">
                  <p className="text-[9px] font-bold tracking-[0.6em] uppercase"
                    style={{ color: 'rgba(255,255,255,0.28)' }}>
                    Item Acquired
                  </p>
                  <h3
                    className="font-black text-white leading-tight whitespace-nowrap"
                    style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)', fontSize: 'clamp(16px, 4vw, 26px)' }}
                  >
                    {ITEM_LABELS[region.id] ?? region.name}
                  </h3>
                  <p className="text-[11px] font-medium"
                    style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '0.04em' }}>
                    {formatDate(conquest.conquered_at)} 制覇
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── 閉じるボタン（右上・X のみ） ── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full transition-all active:scale-90 hover:scale-110"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <X size={18} className="text-white/60" />
        </button>

        {/* ── 左ナビゲーション ── */}
        {hasPrev && (
          <button
            onClick={() => goTo(index - 1, -1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full transition-all active:scale-90 hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <ChevronLeft size={22} className="text-white/70" />
          </button>
        )}

        {/* ── 右ナビゲーション ── */}
        {hasNext && (
          <button
            onClick={() => goTo(index + 1, 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full transition-all active:scale-90 hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <ChevronRight size={22} className="text-white/70" />
          </button>
        )}

        {/* ── ドットインジケーター ── */}
        {items.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-50">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                style={{
                  width: i === index ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === index ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

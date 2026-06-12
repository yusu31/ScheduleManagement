'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
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

type Props = {
  region: RegionDef
  conquest: ConquestEntry
  onClose: () => void
}

const ITEM_LABELS: Record<string, string> = {
  kenpo: 'こけし',
  koriyama: '三春滝桜',
  sukagawa: 'クリスタル',
  kennan: '白河だるま',
  aizu: '赤べこ',
  okuaizu: '只見線',
  minamiaizu: 'ネギ',
  soma: '馬',
  futaba: 'Jヴィレッジ',
  iwaki: 'フタバスズキリュウ',
  all: '黄金トロフィー',
}

// 写真を Unsplash から差し替えた際にフォトグラファー名を記入する
// 例: kenpo: { name: 'Taro Yamamoto', username: 'taroyamamoto' }
const PHOTO_CREDITS: Record<string, { name: string; username: string } | null> = {
  kenpo: null,
  koriyama: null,
  sukagawa: null,
  kennan: null,
  aizu: null,
  okuaizu: null,
  minamiaizu: null,
  soma: null,
  futaba: null,
  iwaki: null,
  all: null,
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function CollectionItemModal({ region, conquest, onClose }: Props) {
  const photoId = region.id === 'all' ? 'aizu' : region.id
  const credit = PHOTO_CREDITS[photoId]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[400] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        {/* 背景：風景写真 + ブラー */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/conquer/regions/${photoId}.jpg`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'blur(0px) brightness(0.88) saturate(1.15)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)` }}
          />
        </div>

        {/* コンテンツ */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-5 max-w-xs w-full px-6 pb-6"
          initial={{ y: 40, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 地区バッジ */}
          <div
            className="px-5 py-1.5 rounded-full text-[12px] font-bold tracking-[0.18em]"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.35)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            {region.name}
          </div>

          {/* 3Dモデル */}
          <div
            style={{
              width: 260,
              height: 260,
              overflow: 'hidden',
            }}
          >
            <RegionItem3D regionId={region.id} autoRotate={true} />
          </div>

          {/* アイテム情報 */}
          <div className="text-center space-y-2">
            <p
              className="text-[9px] font-bold tracking-[0.6em] uppercase"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              Item Acquired
            </p>
            <h2
              className="text-[32px] font-black text-white leading-tight"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}
            >
              {ITEM_LABELS[region.id] ?? region.name}
            </h2>
            <p
              className="text-[11px] font-medium"
              style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '0.04em' }}
            >
              {formatDate(conquest.conquered_at)} 制覇
            </p>
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="mt-2 p-3 rounded-full transition-all active:scale-90 hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <X size={16} className="text-white/45" />
          </button>

          {/* Unsplash帰属表記（写真配置後に有効化） */}
          {credit && (
            <p
              className="text-[9px]"
              style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.02em' }}
            >
              Photo by {credit.name} on Unsplash
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

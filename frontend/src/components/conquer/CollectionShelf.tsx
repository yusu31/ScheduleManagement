'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
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
  regions: RegionDef[]
  conquests: ConquestEntry[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '.')
}

const ITEM_LABELS: Record<string, string> = {
  kenpo: 'こけし',
  koriyama: '三春駒',
  sukagawa: 'ウルトラマン',
  kennan: '白河だるま',
  aizu: '赤べこ',
  okuaizu: 'クマ',
  minamiaizu: '手まり',
  soma: '馬',
  futaba: 'サッカーボール',
  iwaki: 'フラダンサー',
  all: '黄金トロフィー',
}

export default function CollectionShelf({ regions, conquests }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const conquestMap = new Map(conquests.map((c) => [c.region_id, c]))

  const allItems: RegionDef[] = [
    ...regions,
    { id: 'all', name: '全制覇', ruby: 'ぜんせいは', color: '#d4af37' },
  ]

  return (
    <div className="w-full">
      {/* 棚 */}
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', perspective: '1200px' }}
      >
        {allItems.map((region) => {
          const conquest = conquestMap.get(region.id)
          const isConquered = !!conquest
          const isHovered = hoveredId === region.id

          return (
            <div
              key={region.id}
              onMouseEnter={() => setHoveredId(region.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative rounded-2xl overflow-hidden transition-transform duration-300"
              style={{
                background: isConquered
                  ? `linear-gradient(160deg, ${region.color}22 0%, ${region.color}10 100%)`
                  : 'linear-gradient(160deg, #f0f0f0 0%, #e8e8e8 100%)',
                border: isConquered ? `2px solid ${region.color}40` : '2px solid #e0e0e0',
                transform: isHovered && isConquered ? 'translateY(-4px) scale(1.02)' : 'none',
                boxShadow: isHovered && isConquered
                  ? `0 12px 32px ${region.color}30, 0 4px 12px rgba(0,0,0,0.1)`
                  : '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* 3Dアイテムエリア */}
              <div className="w-full aspect-square relative">
                {isConquered ? (
                  <>
                    {/* 風景写真背景 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/conquer/regions/${region.id === 'all' ? 'aizu' : region.id}.jpg`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ filter: 'brightness(0.5) saturate(0.8)', opacity: 0.6 }}
                    />
                    {/* 3Dモデル */}
                    <div className="absolute inset-0">
                      <RegionItem3D
                        regionId={region.id === 'all' ? 'all' : region.id}
                        autoRotate={isHovered}
                      />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Lock size={28} className="text-gray-300" />
                    <span className="text-2xl font-bold text-gray-200">?</span>
                  </div>
                )}
              </div>

              {/* 棚板ライン */}
              <div
                className="w-full h-px"
                style={{ background: isConquered ? `${region.color}30` : '#e0e0e0' }}
              />

              {/* 情報エリア */}
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isConquered ? `${region.color}20` : '#ebebeb',
                      color: isConquered ? region.color : '#aaa',
                    }}
                  >
                    {region.name}
                  </span>
                  {isConquered && (
                    <span className="text-[9px] text-gray-400">{formatDate(conquest.conquered_at)}</span>
                  )}
                </div>
                <p className="text-[11px] font-bold mt-1" style={{ color: isConquered ? '#1f2937' : '#ccc' }}>
                  {isConquered ? ITEM_LABELS[region.id] : '???'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-6">
        全地区を制覇してコレクションを完成させよう！
      </p>
    </div>
  )
}

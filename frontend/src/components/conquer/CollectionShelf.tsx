'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import RegionItem3D from './RegionItem3D'
import CollectionItemModal from './CollectionItemModal'

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
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const allItems: RegionDef[] = [
    ...regions,
    { id: 'all', name: '全制覇', ruby: 'ぜんせいは', color: '#d4af37' },
  ]

  const conquestMap = new Map(conquests.map((c) => [c.region_id, c]))

  const rows = [
    allItems.slice(0, 4),
    allItems.slice(4, 8),
    allItems.slice(8, 11),
  ]

  const selectedRegion = selectedId ? (allItems.find((r) => r.id === selectedId) ?? null) : null
  const selectedConquest = selectedId ? (conquestMap.get(selectedId) ?? null) : null

  return (
    <>
      <div
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(160deg, #0d0b22 0%, #1e1a42 40%, #2a2050 70%, #1a1830 100%)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)',
          padding: '28px 56px 20px',
        }}
      >
        {/* 左の縦サポート柱 */}
        <div style={{
          position: 'absolute', left: 18, top: 0, bottom: 0, width: 7,
          background: 'linear-gradient(180deg, rgba(210,230,255,0.14) 0%, rgba(210,230,255,0.07) 100%)',
          borderLeft: '1.5px solid rgba(255,255,255,0.22)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }} />
        {/* 右の縦サポート柱 */}
        <div style={{
          position: 'absolute', right: 18, top: 0, bottom: 0, width: 7,
          background: 'linear-gradient(180deg, rgba(210,230,255,0.14) 0%, rgba(210,230,255,0.07) 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.04)',
          borderRight: '1.5px solid rgba(255,255,255,0.22)',
        }} />

        <p style={{
          textAlign: 'center',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.6em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.2)',
          marginBottom: 28,
        }}>
          Collection
        </p>

        {rows.map((row, rowIdx) => (
          <div key={rowIdx}>
            {/* アイテム列 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, paddingBottom: 6 }}>
              {row.map((item) => {
                const conquest = conquestMap.get(item.id)
                const isConquered = !!conquest
                const isHovered = hoveredId === item.id

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: 88,
                      cursor: isConquered ? 'pointer' : 'default',
                    }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => isConquered && setSelectedId(item.id)}
                  >
                    {/* モデルエリア（枠なし） */}
                    <div style={{ position: 'relative', width: 80, height: 80 }}>
                      {/* ホバーグロー */}
                      {isConquered && (
                        <div style={{
                          position: 'absolute',
                          inset: -12,
                          borderRadius: '50%',
                          background: `radial-gradient(circle, ${item.color}${isHovered ? '30' : '12'} 0%, transparent 70%)`,
                          transition: 'background 0.3s ease',
                          pointerEvents: 'none',
                        }} />
                      )}

                      {/* 3Dモデル / ロック */}
                      <div style={{
                        width: 80,
                        height: 80,
                        transform: isHovered && isConquered ? 'translateY(-13px)' : 'translateY(0)',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}>
                        {isConquered ? (
                          <RegionItem3D regionId={item.id} autoRotate={isHovered} />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Lock size={20} style={{ color: 'rgba(255,255,255,0.09)' }} />
                          </div>
                        )}
                      </div>

                      {/* 棚面への影（楕円） */}
                      {isConquered && (
                        <div style={{
                          position: 'absolute',
                          bottom: isHovered ? -22 : -11,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: isHovered ? 34 : 50,
                          height: 10,
                          background: `radial-gradient(ellipse, ${item.color}60 0%, rgba(0,0,0,0.4) 45%, transparent 70%)`,
                          filter: 'blur(4px)',
                          transition: 'all 0.3s ease',
                          pointerEvents: 'none',
                        }} />
                      )}
                    </div>

                    {/* ラベル */}
                    <span style={{
                      marginTop: 14,
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: isConquered ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.11)',
                    }}>
                      {isConquered ? (ITEM_LABELS[item.id] ?? item.name) : '—'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* アクリル棚板（厚め・ガラス感） */}
            <div style={{
              height: 14,
              margin: '0 -56px',
              position: 'relative',
              background: 'linear-gradient(180deg, rgba(220,238,255,0.28) 0%, rgba(200,220,255,0.13) 50%, rgba(180,205,255,0.05) 100%)',
              borderTop: '2px solid rgba(255,255,255,0.44)',
              borderBottom: '1px solid rgba(0,0,0,0.18)',
              boxShadow: '0 10px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.28)',
            }}>
              {/* 表面の反射ハイライト */}
              <div style={{
                position: 'absolute',
                top: 2,
                left: '12%',
                width: '22%',
                height: 3,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                borderRadius: 2,
              }} />
            </div>

            <div style={{ height: 22 }} />
          </div>
        ))}

        <p style={{
          textAlign: 'center',
          fontSize: 9,
          letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.17)',
          paddingBottom: 0,
        }}>
          {conquests.length} / 11 ACQUIRED
        </p>
      </div>

      {selectedId && selectedRegion && selectedConquest && (
        <CollectionItemModal
          region={selectedRegion}
          conquest={selectedConquest}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  )
}

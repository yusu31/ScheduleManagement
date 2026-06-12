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
          background: 'linear-gradient(160deg, #0c0a20 0%, #1c1840 40%, #271e4e 70%, #181628 100%)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.07)',
          padding: '36px 56px 28px',
        }}
      >
        {/* 左の縦サポート柱 */}
        <div style={{
          position: 'absolute', left: 18, top: 0, bottom: 0, width: 8,
          background: 'linear-gradient(180deg, rgba(210,230,255,0.18) 0%, rgba(210,230,255,0.06) 100%)',
          borderLeft: '1.5px solid rgba(255,255,255,0.28)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '0 0 4px 4px',
        }} />
        {/* 右の縦サポート柱 */}
        <div style={{
          position: 'absolute', right: 18, top: 0, bottom: 0, width: 8,
          background: 'linear-gradient(180deg, rgba(210,230,255,0.18) 0%, rgba(210,230,255,0.06) 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.04)',
          borderRight: '1.5px solid rgba(255,255,255,0.28)',
          borderRadius: '0 0 4px 4px',
        }} />

        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.55em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.22)',
            marginBottom: 6,
          }}>
            Collection
          </p>
          <div style={{
            width: 40,
            height: 1,
            margin: '0 auto',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          }} />
        </div>

        {rows.map((row, rowIdx) => (
          <div key={rowIdx}>
            {/* アイテム列 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, paddingBottom: 8 }}>
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
                      width: 84,
                      cursor: isConquered ? 'pointer' : 'default',
                    }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => isConquered && setSelectedId(item.id)}
                  >
                    {/* モデルエリア（枠なし） */}
                    <div style={{ position: 'relative', width: 76, height: 76 }}>
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
                        width: 76,
                        height: 76,
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
                      marginTop: 12,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      color: isConquered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.11)',
                      transition: 'color 0.2s ease',
                    }}>
                      {isConquered ? (ITEM_LABELS[item.id] ?? item.name) : '—'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* アクリル棚板（厚め・ガラス感） */}
            <div style={{
              height: 16,
              margin: '0 -56px',
              position: 'relative',
              background: 'linear-gradient(180deg, rgba(230,245,255,0.3) 0%, rgba(200,225,255,0.14) 55%, rgba(180,205,255,0.04) 100%)',
              borderTop: '2px solid rgba(255,255,255,0.48)',
              borderBottom: '1px solid rgba(0,0,0,0.22)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.32)',
            }}>
              {/* 左側の反射ハイライト */}
              <div style={{
                position: 'absolute',
                top: 3,
                left: '8%',
                width: '18%',
                height: 3,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                borderRadius: 2,
              }} />
              {/* 中央の反射ハイライト */}
              <div style={{
                position: 'absolute',
                top: 3,
                left: '42%',
                width: '14%',
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                borderRadius: 2,
              }} />
            </div>

            <div style={{ height: 24 }} />
          </div>
        ))}

        {/* フッター：取得数カウンター */}
        <div style={{ textAlign: 'center', paddingTop: 4, paddingBottom: 4 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 6,
          }}>
            <span style={{
              fontSize: 18,
              fontWeight: 800,
              color: conquests.length === 11 ? '#d4af37' : 'rgba(255,255,255,0.55)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              {conquests.length}
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.28em',
              color: 'rgba(255,255,255,0.16)',
              textTransform: 'uppercase',
            }}>
              / 11 acquired
            </span>
          </div>
        </div>
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

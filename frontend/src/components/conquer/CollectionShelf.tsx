'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import RegionItem3D from './RegionItem3D'
import CollectionItemModal from './CollectionItemModal'
import { useTheme, isThemeDark } from '@/contexts/ThemeContext'

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

export default function CollectionShelf({ regions, conquests }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { currentTheme } = useTheme()
  const dark = isThemeDark(currentTheme)

  const allItems: RegionDef[] = [
    ...regions,
    { id: 'all', name: '全制覇', ruby: 'ぜんせいは', color: '#d4af37' },
  ]

  const conquestMap = new Map(conquests.map((c) => [c.region_id, c]))

  // 制覇済みアイテムを順番通りに並べた配列（モーダルのナビゲーションに使用）
  const conqueredItems = allItems
    .filter((item) => conquestMap.has(item.id))
    .map((item) => ({ region: item, conquest: conquestMap.get(item.id)! }))

  const rows = [
    allItems.slice(0, 4),
    allItems.slice(4, 8),
    allItems.slice(8, 11),
  ]

  return (
    <>
      <div
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          position: 'relative',
          background: dark
            ? 'rgba(10, 8, 28, 0.58)'
            : 'rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: dark
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(255,255,255,0.45)',
          boxShadow: dark
            ? '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
          padding: '18px 44px 14px',
          transition: 'background 0.4s ease, border 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        {/* 左の縦サポート柱 */}
        <div style={{
          position: 'absolute', left: 18, top: 0, bottom: 0, width: 8,
          background: dark
            ? 'linear-gradient(180deg, rgba(210,230,255,0.18) 0%, rgba(210,230,255,0.06) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)',
          borderLeft: '1.5px solid rgba(255,255,255,0.4)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0 0 4px 4px',
        }} />
        {/* 右の縦サポート柱 */}
        <div style={{
          position: 'absolute', right: 18, top: 0, bottom: 0, width: 8,
          background: dark
            ? 'linear-gradient(180deg, rgba(210,230,255,0.18) 0%, rgba(210,230,255,0.06) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          borderRight: '1.5px solid rgba(255,255,255,0.4)',
          borderRadius: '0 0 4px 4px',
        }} />

        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <p style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.55em',
            textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: 36, paddingBottom: 0 }}>
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
                      width: 120,
                      cursor: isConquered ? 'pointer' : 'default',
                    }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      if (isConquered) {
                        const idx = conqueredItems.findIndex((ci) => ci.region.id === item.id)
                        setSelectedIndex(idx)
                      }
                    }}
                  >
                    {/* ラベル（モデルの上に表示） */}
                    <span style={{
                      marginBottom: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      color: isConquered
                        ? (dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)')
                        : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)'),
                      transition: 'color 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}>
                      {isConquered ? (ITEM_LABELS[item.id] ?? item.name) : '—'}
                    </span>

                    {/* モデルエリア（枠なし・底付き） */}
                    <div style={{ position: 'relative', width: 110, height: 110 }}>
                      {/* ホバーグロー（丸いglow、四角枠なし） */}
                      {isConquered && (
                        <div style={{
                          position: 'absolute',
                          inset: -14,
                          borderRadius: '50%',
                          background: `radial-gradient(circle, ${item.color}${isHovered ? '45' : '18'} 0%, transparent 68%)`,
                          transition: 'background 0.3s ease',
                          pointerEvents: 'none',
                        }} />
                      )}

                      {/* 3Dモデル / ロック */}
                      <div style={{
                        width: 110,
                        height: 110,
                        transform: isHovered && isConquered ? 'translateY(-10px)' : 'translateY(0)',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}>
                        {isConquered ? (
                          <RegionItem3D regionId={item.id} autoRotate={isHovered} />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Lock size={20} style={{ color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)' }} />
                          </div>
                        )}
                      </div>

                      {/* 棚面への落ち影（底付き感） */}
                      {isConquered && (
                        <div style={{
                          position: 'absolute',
                          bottom: isHovered ? -26 : -4,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: isHovered ? 30 : 52,
                          height: 10,
                          background: `radial-gradient(ellipse, ${item.color}70 0%, rgba(0,0,0,0.5) 45%, transparent 70%)`,
                          filter: 'blur(4px)',
                          transition: 'all 0.3s ease',
                          pointerEvents: 'none',
                        }} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* アクリル棚板（厚め・ガラス感） */}
            <div style={{
              height: 16,
              margin: '0 -56px',
              position: 'relative',
              background: dark
                ? 'linear-gradient(180deg, rgba(230,245,255,0.28) 0%, rgba(200,225,255,0.12) 55%, rgba(180,205,255,0.03) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 55%, rgba(255,255,255,0.08) 100%)',
              borderTop: dark
                ? '2px solid rgba(255,255,255,0.48)'
                : '2px solid rgba(255,255,255,0.75)',
              borderBottom: dark
                ? '1px solid rgba(0,0,0,0.22)'
                : '1px solid rgba(0,0,0,0.08)',
              boxShadow: dark
                ? '0 12px 36px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.32)'
                : '0 6px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
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

            <div style={{ height: 10 }} />
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
              color: conquests.length === 11
                ? '#d4af37'
                : (dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'),
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              {conquests.length}
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.28em',
              color: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
              textTransform: 'uppercase',
            }}>
              / 11 acquired
            </span>
          </div>
        </div>
      </div>

      {selectedIndex !== null && (
        <CollectionItemModal
          items={conqueredItems}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  )
}

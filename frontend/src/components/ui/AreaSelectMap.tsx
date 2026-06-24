'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { coordsToPath } from '@/lib/fukushima-geo'

type MunicipalityFeature = {
  type: 'Feature'
  properties: { N03_004: string | null; N03_007: string | null }
  geometry: { type: string; coordinates: number[][][] }
}
type GeoData = { type: 'FeatureCollection'; features: MunicipalityFeature[] }

const REGIONS = [
  { id: 'kenpo',      name: '県北',      municipalities: ['福島市', '二本松市', '伊達市', '本宮市', '桑折町', '国見町', '川俣町', '大玉村'] },
  { id: 'koriyama',   name: '郡山・田村', municipalities: ['郡山市', '田村市', '三春町', '小野町', '平田村'] },
  { id: 'sukagawa',   name: '須賀川・石川', municipalities: ['須賀川市', '鏡石町', '天栄村', '石川町', '玉川村', '浅川町', '古殿町'] },
  { id: 'kennan',     name: '県南',      municipalities: ['白河市', '西郷村', '泉崎村', '中島村', '矢吹町', '棚倉町', '矢祭町', '塙町', '鮫川村'] },
  { id: 'aizu',       name: '会津',      municipalities: ['会津若松市', '喜多方市', '北塩原村', '磐梯町', '猪苗代町', '会津坂下町', '湯川村', '会津美里町'] },
  { id: 'okuaizu',    name: '奥会津',    municipalities: ['西会津町', '柳津町', '三島町', '金山町', '昭和村'] },
  { id: 'minamiaizu', name: '南会津',    municipalities: ['下郷町', '檜枝岐村', '只見町', '南会津町'] },
  { id: 'soma',       name: '相馬',      municipalities: ['相馬市', '南相馬市', '新地町', '飯舘村'] },
  { id: 'futaba',     name: '双葉',      municipalities: ['広野町', '楢葉町', '富岡町', '川内村', '大熊町', '双葉町', '浪江町', '葛尾村'] },
  { id: 'iwaki',      name: 'いわき',    municipalities: ['いわき市'] },
]

const MAP_COLOR = {
  default:       '#c8d4d0',
  hover:         '#a8bcb8',
  selected:      '#5f8b8b',
  selectedHover: '#4a7070',
  muniSelected:  '#2d5252',
}

const MUNI_TO_REGION = new Map<string, typeof REGIONS[number]>()
REGIONS.forEach(r => r.municipalities.forEach(m => MUNI_TO_REGION.set(m, r)))

const W = 900, H = 600

type Props = {
  selectedRegion: string
  selectedMunicipalities: string[]
  onRegionSelect: (region: string) => void
  onMunicipalityToggle: (muni: string) => void
  spotCounts: Record<string, number>
}

export default function AreaSelectMap({
  selectedRegion, selectedMunicipalities, onRegionSelect, onMunicipalityToggle, spotCounts,
}: Props) {
  const [geoData, setGeoData] = useState<GeoData | null>(null)
  const [hoveredMuni, setHoveredMuni] = useState<string | null>(null)

  useEffect(() => {
    fetch('/fukushima.geojson').then(r => r.json()).then(setGeoData)
  }, [])

  const getRegion = useCallback((name: string) => MUNI_TO_REGION.get(name), [])

  const getFill = useCallback((name: string): string => {
    const region = getRegion(name)
    if (!region) return MAP_COLOR.default
    const isSelected = selectedMunicipalities.includes(name)
    const isHovered = hoveredMuni === name
    const isRegionPanel = selectedRegion === region.name

    if (isSelected && isHovered) return MAP_COLOR.selectedHover
    if (isSelected)              return MAP_COLOR.muniSelected
    if (isRegionPanel && isHovered) return MAP_COLOR.selectedHover
    if (isRegionPanel)           return MAP_COLOR.selected
    if (isHovered)               return MAP_COLOR.hover
    return MAP_COLOR.default
  }, [selectedMunicipalities, selectedRegion, hoveredMuni, getRegion])

  const regionMunicipalities = useMemo(() => {
    if (!selectedRegion) return []
    const region = REGIONS.find(r => r.name === selectedRegion)
    if (!region) return []
    return region.municipalities.filter(m => (spotCounts[m] ?? 0) > 0)
  }, [selectedRegion, spotCounts])

  // 地図クリック → 市区町村トグル + 地区パネルを開く（別地区なら切り替え）
  const handlePathClick = useCallback((name: string) => {
    const region = getRegion(name)
    if (!region) return
    onMunicipalityToggle(name)
    if (selectedRegion !== region.name) {
      onRegionSelect(region.name)
    }
  }, [onMunicipalityToggle, onRegionSelect, getRegion, selectedRegion])

  return (
    <div className="relative">
      {/* SVG地図 */}
      {!geoData ? (
        <div className="w-full h-48 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
          <span className="text-[12px] text-gray-400">地図を読み込み中...</span>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full rounded-xl"
          style={{ display: 'block' }}
        >
          {/* 市区町村パス */}
          {geoData.features.map((feature) => {
            const name = feature.properties.N03_004 ?? ''
            const code = feature.properties.N03_007 ?? name
            return (
              <path
                key={code}
                d={coordsToPath(feature.geometry.coordinates)}
                fill={getFill(name)}
                stroke="#ffffff"
                strokeWidth={1.2}
                strokeLinejoin="round"
                style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                onMouseEnter={() => setHoveredMuni(name)}
                onMouseLeave={() => setHoveredMuni(null)}
                onClick={() => handlePathClick(name)}
              >
                <title>{name}</title>
              </path>
            )
          })}

        </svg>
      )}

      {/* ホバー中の市区町村名バー */}
      <div className="mt-2 h-5 flex items-center justify-center">
        {hoveredMuni ? (
          <span className="text-[12px] font-semibold text-app-sub">📍 {hoveredMuni}</span>
        ) : (
          <span className="text-[11px] text-app-sub opacity-40">地図の市区町村にカーソルを当てると名前が表示されます</span>
        )}
      </div>

      {/* 凡例ボタン（地区ラベルを補助する役割） */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {REGIONS.map(r => {
          const isSelected = selectedRegion === r.name
          return (
            <button
              key={r.id}
              onClick={() => onRegionSelect(isSelected ? '' : r.name)}
              className={`
                px-3 py-1 rounded-full text-[12px] font-semibold border transition-all duration-150
                ${isSelected
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white/60 text-app-sub border-app-border hover:border-primary hover:text-primary'
                }
              `}
            >
              {r.name}
            </button>
          )
        })}
      </div>

      {/* 市区町村パネル：地図の右上に浮く */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            key={selectedRegion}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="absolute top-2 right-2 w-[160px] z-10"
          >
            <div className="theme-card-bg bg-white/95 backdrop-blur-md rounded-xl border border-app-border shadow-lg overflow-hidden">
              <div className="px-3 py-2 text-[11px] font-bold tracking-wide text-white"
                style={{ backgroundColor: MAP_COLOR.selected }}>
                {selectedRegion}
              </div>
              <div className="p-1.5 flex flex-col gap-0.5 max-h-[240px] overflow-y-auto">
                {regionMunicipalities.length > 0 ? regionMunicipalities.map(muni => {
                  const isActive = selectedMunicipalities.includes(muni)
                  return (
                    <button
                      key={muni}
                      onClick={() => onMunicipalityToggle(muni)}
                      className={`
                        w-full flex items-center justify-between
                        px-2.5 py-1.5 rounded-lg text-[12px] font-medium
                        transition-colors text-left
                        ${isActive ? 'bg-primary text-white' : 'text-app-sub hover:bg-app-bg hover:text-app-text'}
                      `}
                    >
                      <span>{muni}</span>
                      <span className={`text-[10px] font-bold ${isActive ? 'text-white/70' : 'text-primary'}`}>
                        {spotCounts[muni] ?? 0}
                      </span>
                    </button>
                  )
                }) : (
                  <p className="text-[11px] text-app-sub px-2 py-2">スポットはまだ登録されていません</p>
                )}
              </div>
              <div className="border-t border-app-border p-1.5">
                <button onClick={() => onRegionSelect('')}
                  className="w-full text-[11px] text-app-sub hover:text-primary transition-colors py-1">
                  ← 閉じる
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

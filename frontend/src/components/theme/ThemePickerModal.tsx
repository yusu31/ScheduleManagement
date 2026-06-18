'use client'

import { useState } from 'react'
import { X, Check, Palette } from 'lucide-react'
import {
  useTheme,
  THEMES,
  THEME_CATEGORIES,
  type ThemeCategory,
  type ThemeItem,
} from '@/contexts/ThemeContext'

export default function ThemePickerModal() {
  const { currentTheme, setTheme, isPickerOpen, closePicker } = useTheme()
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>('Japan')

  if (!isPickerOpen) return null

  const filtered = THEMES.filter((th) => th.category === activeCategory)

  const handleSelect = (theme: ThemeItem) => {
    setTheme(theme)
    closePicker()
  }

  const handleReset = () => {
    setTheme(null)
    closePicker()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) closePicker() }}
    >
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* モーダル本体 */}
      <div className="relative w-[760px] max-w-[95vw] max-h-[85vh] flex flex-col bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <div className="flex items-center gap-2.5">
            <Palette size={18} className="text-primary" />
            <h2 className="text-[16px] font-bold text-app-text">背景テーマを選ぶ</h2>
          </div>
          <button
            onClick={closePicker}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/8 transition-colors"
          >
            <X size={16} className="text-app-sub" />
          </button>
        </div>

        {/* カテゴリタブ */}
        <div className="flex flex-wrap gap-1.5 px-5 pt-4 pb-2">
          {THEME_CATEGORIES.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap
                transition-all duration-150
                ${activeCategory === key
                  ? 'bg-primary text-white shadow-[0_2px_8px_rgba(95,139,139,0.35)]'
                  : 'bg-black/6 text-app-sub hover:bg-black/10 hover:text-app-text'
                }
              `}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* 画像グリッド */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="grid grid-cols-5 gap-2.5">
            {filtered.map((theme) => {
              const isSelected = currentTheme?.id === theme.id
              const isGradient = !!theme.gradient

              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme)}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden focus:outline-none"
                >
                  {/* サムネイル表示：グラデーション or 写真 */}
                  {isGradient ? (
                    <div
                      className="absolute inset-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ background: theme.gradient }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={theme.thumbnailUrl}
                      alt={theme.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  )}

                  {/* ホバー時の暗転 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-150" />

                  {/* 選択中のオーバーレイ */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Check size={14} className="text-primary" strokeWidth={3} />
                      </div>
                    </div>
                  )}

                  {/* 画像名（下部） */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[11px] font-medium text-white leading-tight">{theme.name}</p>
                  </div>

                  {/* 選択リング */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-black/8 bg-white/50">
          <button
            onClick={handleReset}
            className="text-[13px] text-app-sub hover:text-app-text transition-colors underline underline-offset-2"
          >
            デフォルトに戻す
          </button>
          <p className="text-[12px] text-app-sub/70">
            {currentTheme ? `現在: ${currentTheme.name}` : 'デフォルト背景'}
          </p>
        </div>
      </div>
    </div>
  )
}

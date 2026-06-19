'use client'

import { useState, useRef } from 'react'
import { X, Check, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useTheme,
  THEMES,
  THEME_CATEGORIES,
  THEME_GROUPS,
  GROUP_CATEGORIES,
  CATEGORY_TO_GROUP,
  type ThemeCategory,
  type ThemeGroup,
  type ThemeItem,
} from '@/contexts/ThemeContext'

export default function ThemePickerModal() {
  const { currentTheme, setTheme, isPickerOpen, closePicker } = useTheme()
  const [activeGroup, setActiveGroup] = useState<ThemeGroup>('photo')
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>('Japan')
  const prevThemeRef = useRef<ThemeItem | null>(currentTheme)

  if (!isPickerOpen) return null

  const filtered = THEMES.filter((th) => th.category === activeCategory)

  const handleGroupChange = (group: ThemeGroup) => {
    setActiveGroup(group)
    setActiveCategory(GROUP_CATEGORIES[group][0])
  }

  const handleSelect = (theme: ThemeItem) => {
    if (currentTheme?.id === theme.id) return

    const prev = currentTheme
    setTheme(theme)

    toast.dismiss()
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-app-text">
            「{theme.name}」に変更
          </span>
          <button
            onClick={() => {
              setTheme(prev)
              prevThemeRef.current = prev
              toast.dismiss(t.id)
            }}
            className="text-[12px] font-semibold text-primary hover:text-primary-dark underline underline-offset-2 shrink-0"
          >
            元に戻す
          </button>
        </div>
      ),
      {
        duration: 5000,
        position: 'bottom-center',
        style: {
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '12px',
          padding: '10px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        },
      }
    )
  }

  const handleReset = () => {
    const prev = currentTheme
    setTheme(null)
    toast.dismiss()
    if (prev) {
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-app-text">デフォルトに変更</span>
            <button
              onClick={() => { setTheme(prev); toast.dismiss(t.id) }}
              className="text-[12px] font-semibold text-primary hover:text-primary-dark underline underline-offset-2 shrink-0"
            >
              元に戻す
            </button>
          </div>
        ),
        { duration: 5000, position: 'bottom-center', style: { background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '10px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } }
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-[8000] flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) closePicker() }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative w-[760px] max-w-[95vw] max-h-[85vh] flex flex-col bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <div className="flex items-center gap-2.5">
            <Palette size={18} className="text-primary" />
            <h2 className="text-[16px] font-bold text-app-text">テーマを選ぶ</h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[12px] text-app-sub/70">
              {currentTheme ? `現在: ${currentTheme.name}` : 'デフォルト'}
            </p>
            <button onClick={closePicker} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/8 transition-colors">
              <X size={16} className="text-app-sub" />
            </button>
          </div>
        </div>

        {/* ヒント */}
        <div className="px-5 pt-3 pb-1">
          <p className="text-[12px] text-app-sub bg-primary/6 rounded-lg px-3 py-2">
            クリックで即時プレビュー。気に入ったら × で閉じてください。「元に戻す」で取り消せます。
          </p>
        </div>

        {/* 大分類タブ */}
        <div className="flex gap-2 px-5 pt-3 pb-2">
          {THEME_GROUPS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleGroupChange(key)}
              className={`
                px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150
                ${activeGroup === key
                  ? 'bg-primary text-white shadow-[0_2px_8px_rgba(95,139,139,0.35)]'
                  : 'bg-black/6 text-app-sub hover:bg-black/10 hover:text-app-text'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 小分類タブ */}
        <div className="flex flex-wrap gap-1.5 px-5 pb-2">
            {GROUP_CATEGORIES[activeGroup].map((cat) => {
              const info = THEME_CATEGORIES.find((c) => c.key === cat)!
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-150
                    ${activeCategory === cat
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/40'
                      : 'bg-black/5 text-app-sub hover:bg-black/8 hover:text-app-text'
                    }
                  `}
                >
                  {info.label}
                </button>
              )
            })}
          </div>

        {/* テーマグリッド */}
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
                  {isGradient ? (
                    <div className="absolute inset-0 transition-transform duration-200 group-hover:scale-105" style={{ background: theme.gradient }} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={theme.thumbnailUrl} alt={theme.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-150" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Check size={14} className="text-primary" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[11px] font-medium text-white leading-tight">{theme.name}</p>
                  </div>
                  {isSelected && <div className="absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-1" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-black/8 bg-white/50">
          <button onClick={handleReset} className="text-[13px] text-app-sub hover:text-app-text transition-colors underline underline-offset-2">
            デフォルトに戻す
          </button>
          {currentTheme && (
            <p className="text-[11px] text-app-sub/60">
              大分類: {THEME_GROUPS.find(g => g.key === CATEGORY_TO_GROUP[currentTheme.category])?.label}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

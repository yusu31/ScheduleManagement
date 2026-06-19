'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type ThemeCategory =
  | 'Japan' | 'Nature' | 'Ocean' | 'Sky' | 'Night' | 'Illustration' | 'Flower'
  | 'Pastel' | 'Lofi' | 'Neon'

export type ThemeItem = {
  id: string
  category: ThemeCategory
  name: string
  // 写真テーマ（public/themes/ 以下の静的ファイル）
  imageUrl?: string
  thumbnailUrl?: string
  // グラデーションテーマ
  gradient?: string
}

const p = (path: string): Pick<ThemeItem, 'imageUrl' | 'thumbnailUrl'> => ({
  imageUrl: `/themes/${path}`,
  thumbnailUrl: `/themes/${path}`,
})

export const THEMES: ThemeItem[] = [
  // ── Japan（和風・日本）────────────────────────────────────────────
  { id: 'japan-1', category: 'Japan', name: '竹林',       ...p('japan/bamboo.jpg') },
  { id: 'japan-2', category: 'Japan', name: '城',         ...p('japan/castle.jpg') },
  { id: 'japan-3', category: 'Japan', name: '富士山',     ...p('japan/fuji.jpg') },
  { id: 'japan-4', category: 'Japan', name: '冬の富士山', ...p('japan/fuji-winter.jpg') },
  { id: 'japan-5', category: 'Japan', name: '清水寺',     ...p('japan/kiyomizu.jpg') },
  { id: 'japan-6', category: 'Japan', name: '昭和の夜',   ...p('japan/showa-night.jpg') },
  { id: 'japan-7', category: 'Japan', name: 'ご来光',     ...p('japan/sunrise.jpg') },

  // ── Nature（自然・風景）───────────────────────────────────────────
  { id: 'nature-1', category: 'Nature', name: '砂漠の風景1', ...p('nature/dry-area-1.jpg') },
  { id: 'nature-2', category: 'Nature', name: '砂漠の風景2', ...p('nature/dry-area-2.jpg') },
  { id: 'nature-3', category: 'Nature', name: '山岳風景',   ...p('nature/mountains.jpg') },
  { id: 'nature-4', category: 'Nature', name: 'パタゴニア', ...p('nature/patagonia.jpg') },
  { id: 'nature-5', category: 'Nature', name: 'パノラマ',   ...p('nature/panorama.jpg') },
  { id: 'nature-6', category: 'Nature', name: '木々',       ...p('nature/trees.png') },
  { id: 'nature-7', category: 'Nature', name: '若葉',       ...p('nature/young-leaves.jpg') },

  // ── Ocean（海・ビーチ）───────────────────────────────────────────
  { id: 'ocean-1',  category: 'Ocean', name: 'ビーチ',         ...p('ocean/beach.png') },
  { id: 'ocean-2',  category: 'Ocean', name: '空撮・珊瑚礁',   ...p('ocean/aerial.jpg') },
  { id: 'ocean-3',  category: 'Ocean', name: 'ギリシャ港',     ...p('ocean/greek-port.jpg') },
  { id: 'ocean-4',  category: 'Ocean', name: '地中海',         ...p('ocean/mediterranean.jpg') },
  { id: 'ocean-5',  category: 'Ocean', name: 'ポップビーチ',   ...p('ocean/pop-beach.jpg') },
  { id: 'ocean-6',  category: 'Ocean', name: '青い海',         ...p('ocean/blue-sea.jpg') },
  { id: 'ocean-7',  category: 'Ocean', name: 'ビーチリゾート', ...p('ocean/summer-resort.jpg') },
  { id: 'ocean-8',  category: 'Ocean', name: '海底',           ...p('ocean/submarine.jpg') },
  { id: 'ocean-9',  category: 'Ocean', name: '沖縄',           ...p('ocean/okinawa.jpg') },
  { id: 'ocean-10', category: 'Ocean', name: '島',             ...p('ocean/island.jpg') },

  // ── Sky（空・宇宙）───────────────────────────────────────────────
  { id: 'sky-1',  category: 'Sky', name: '気球と空',       ...p('sky/balloon.jpg') },
  { id: 'sky-2',  category: 'Sky', name: '惑星と星',       ...p('sky/planet-stars.jpg') },
  { id: 'sky-3',  category: 'Sky', name: 'カラフルな空',   ...p('sky/colorful.jpg') },
  { id: 'sky-4',  category: 'Sky', name: '地球（宇宙から）', ...p('sky/earth-1.jpg') },
  { id: 'sky-5',  category: 'Sky', name: '地球（夜側）',   ...p('sky/earth-2.jpg') },
  { id: 'sky-6',  category: 'Sky', name: '幻想的な空',     ...p('sky/fantastic.jpg') },
  { id: 'sky-7',  category: 'Sky', name: 'ピンクの空',     ...p('sky/pink.jpg') },
  { id: 'sky-8',  category: 'Sky', name: '星雲',           ...p('sky/nebula.jpg') },
  { id: 'sky-9',  category: 'Sky', name: '虹の空',         ...p('sky/rainbow-sky.jpg') },
  { id: 'sky-10', category: 'Sky', name: '虹',             ...p('sky/rainbow.jpg') },
  { id: 'sky-11', category: 'Sky', name: '天文台',         ...p('sky/observatory.jpg') },

  // ── Night（夜景・花火）───────────────────────────────────────────
  { id: 'night-1', category: 'Night', name: '花火',         ...p('night/fireworks.jpg') },
  { id: 'night-2', category: 'Night', name: 'ハロウィン夜空', ...p('night/halloween.jpg') },
  { id: 'night-3', category: 'Night', name: 'ネオンエネルギー', ...p('night/neon-energy.jpg') },
  { id: 'night-4', category: 'Night', name: '夜空',         ...p('night/night-sky.jpg') },
  { id: 'night-5', category: 'Night', name: '光の軌跡',     ...p('night/light-streaks.jpg') },

  // ── Illustration（イラスト・アニメ）──────────────────────────────
  { id: 'illust-1',  category: 'Illustration', name: 'AIアート・抽象1',   ...p('illustration/ai-abstract-1.jpg') },
  { id: 'illust-2',  category: 'Illustration', name: 'AIアート・抽象2',   ...p('illustration/ai-abstract-2.jpg') },
  { id: 'illust-3',  category: 'Illustration', name: 'アニメ少女',         ...p('illustration/anime-girl.jpg') },
  { id: 'illust-4',  category: 'Illustration', name: 'ファンタジー背景',   ...p('illustration/fantasy-bg.jpg') },
  { id: 'illust-5',  category: 'Illustration', name: '水彩背景',           ...p('illustration/watercolor-bg.jpg') },
  { id: 'illust-6',  category: 'Illustration', name: '放課後教室',         ...p('illustration/classroom.jpg') },
  { id: 'illust-7',  category: 'Illustration', name: '魔法陣',             ...p('illustration/magic-circle.jpg') },
  { id: 'illust-8',  category: 'Illustration', name: 'タクシー',           ...p('illustration/taxi.jpg') },
  { id: 'illust-9',  category: 'Illustration', name: '自動販売機',         ...p('illustration/vending-machine.jpg') },
  { id: 'illust-10', category: 'Illustration', name: '抽象背景',           ...p('illustration/abstract.jpg') },
  { id: 'illust-11', category: 'Illustration', name: 'ブルーパターン',     ...p('illustration/blue-pattern.jpg') },

  // ── Flower（花・植物）────────────────────────────────────────────
  { id: 'flower-1', category: 'Flower', name: '花1',     ...p('flower/flowers-1.png') },
  { id: 'flower-2', category: 'Flower', name: '花2',     ...p('flower/flowers-2.jpg') },
  { id: 'flower-3', category: 'Flower', name: 'ネモフィラ', ...p('flower/nemophila.jpg') },
  { id: 'flower-4', category: 'Flower', name: '紅葉',     ...p('flower/autumn-leaves.jpg') },
  { id: 'flower-5', category: 'Flower', name: '夏の植物', ...p('flower/summer.png') },

  // ── Pastel（グラデーション）────────────────────────────────────────
  { id: 'pastel-1', category: 'Pastel', name: 'ピーチブロッサム', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'pastel-2', category: 'Pastel', name: 'ラベンダーミスト', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { id: 'pastel-3', category: 'Pastel', name: 'ミントフレッシュ', gradient: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { id: 'pastel-4', category: 'Pastel', name: 'ローズモーニング', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { id: 'pastel-5', category: 'Pastel', name: 'サクラ',           gradient: 'linear-gradient(160deg, #ffd1dc 0%, #ffb3c6 50%, #ff8fa3 100%)' },

  // ── Lofi（グラデーション）─────────────────────────────────────────
  { id: 'lofi-1', category: 'Lofi', name: 'アンバーライト',    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { id: 'lofi-2', category: 'Lofi', name: 'モーニングコーヒー', gradient: 'linear-gradient(135deg, #c9a880 0%, #e8d5b7 50%, #c9a880 100%)' },
  { id: 'lofi-3', category: 'Lofi', name: 'レインウィンドウ',   gradient: 'linear-gradient(160deg, #667eea 0%, #764ba2 100%)' },
  { id: 'lofi-4', category: 'Lofi', name: 'ビンテージペーパー', gradient: 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%)' },
  { id: 'lofi-5', category: 'Lofi', name: '夕暮れカフェ',       gradient: 'linear-gradient(160deg, #fad7a1 0%, #e96d71 50%, #c0392b 100%)' },

  // ── Neon（グラデーション）─────────────────────────────────────────
  { id: 'neon-1', category: 'Neon', name: 'ディープスペース', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'neon-2', category: 'Neon', name: 'ネオンパープル',   gradient: 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)' },
  { id: 'neon-3', category: 'Neon', name: 'サイバーブルー',   gradient: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
  { id: 'neon-4', category: 'Neon', name: 'マトリックス',     gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' },
  { id: 'neon-5', category: 'Neon', name: 'シンセウェーブ',   gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)' },
]

export const THEME_CATEGORIES: { key: ThemeCategory; label: string }[] = [
  { key: 'Japan',        label: '和風'       },
  { key: 'Nature',       label: '自然'       },
  { key: 'Ocean',        label: 'オーシャン' },
  { key: 'Sky',          label: 'スカイ'     },
  { key: 'Night',        label: 'ナイト'     },
  { key: 'Illustration', label: 'イラスト'   },
  { key: 'Flower',       label: '花・植物'   },
  { key: 'Pastel',       label: 'パステル'   },
  { key: 'Lofi',         label: 'ローファイ' },
  { key: 'Neon',         label: 'ネオン'     },
]

// Night / Neon カテゴリは暗い背景と判定する
export function isThemeDark(theme: ThemeItem | null): boolean {
  if (!theme) return false
  return theme.category === 'Night' || theme.category === 'Neon'
}

type ThemeContextType = {
  currentTheme: ThemeItem | null
  setTheme: (theme: ThemeItem | null) => void
  isPickerOpen: boolean
  openPicker: () => void
  closePicker: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'roami-theme'
const DEFAULT_BG = 'linear-gradient(135deg, #cce8e0 0%, #deeaf8 50%, #ccdcf0 100%)'

function applyBackground(theme: ThemeItem | null) {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  if (!theme) {
    el.style.background = DEFAULT_BG
    el.style.backgroundAttachment = 'fixed'
    el.removeAttribute('data-theme-bg')
    return
  }
  if (theme.gradient) {
    el.style.background = theme.gradient
    el.style.backgroundAttachment = 'fixed'
    el.setAttribute('data-theme-bg', isThemeDark(theme) ? 'dark' : 'light')
  } else if (theme.imageUrl) {
    el.style.background = `url(${theme.imageUrl}) center/cover no-repeat fixed`
    el.setAttribute('data-theme-bg', 'photo')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeItem | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const theme = JSON.parse(saved) as ThemeItem
        setCurrentTheme(theme)
        applyBackground(theme)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const setTheme = useCallback((theme: ThemeItem | null) => {
    setCurrentTheme(theme)
    applyBackground(theme)
    if (theme) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const openPicker = useCallback(() => setIsPickerOpen(true), [])
  const closePicker = useCallback(() => setIsPickerOpen(false), [])

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isPickerOpen, openPicker, closePicker }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

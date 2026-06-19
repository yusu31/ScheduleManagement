'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type ThemeCategory =
  | 'Japan' | 'Nature' | 'Ocean' | 'Sky' | 'Night' | 'Flower' | 'Food'
  | 'IllustAnime' | 'IllustScene' | 'IllustFantasy' | 'IllustPop'
  | 'Pastel' | 'Lofi' | 'Neon'

export type ThemeItem = {
  id: string
  category: ThemeCategory
  name: string
  dark?: boolean
  imageUrl?: string
  thumbnailUrl?: string
  gradient?: string
}

const p = (path: string): Pick<ThemeItem, 'imageUrl' | 'thumbnailUrl'> => ({
  imageUrl: `/themes/${path}`,
  thumbnailUrl: `/themes/${path}`,
})

export const THEMES: ThemeItem[] = [
  // ── Japan（和風・日本）── 実写 ───────────────────────────────────
  { id: 'japan-1', category: 'Japan', name: '竹林',       ...p('japan/bamboo.jpg') },
  { id: 'japan-2', category: 'Japan', name: '城',         ...p('japan/castle.jpg') },
  { id: 'japan-3', category: 'Japan', name: '富士山',     ...p('japan/fuji.jpg') },
  { id: 'japan-4', category: 'Japan', name: '冬の富士山', ...p('japan/fuji-winter.jpg') },
  { id: 'japan-5', category: 'Japan', name: '清水寺',     ...p('japan/kiyomizu.jpg') },
  { id: 'japan-6', category: 'Japan', name: '昭和の夜',   dark: true, ...p('japan/showa-night.jpg') },
  { id: 'japan-7', category: 'Japan', name: 'ご来光',     ...p('japan/sunrise.jpg') },

  // ── Nature（自然・風景）── 実写 ─────────────────────────────────
  { id: 'nature-3', category: 'Nature', name: '山岳風景',   ...p('nature/mountains.jpg') },
  { id: 'nature-4', category: 'Nature', name: 'パタゴニア', ...p('nature/patagonia.jpg') },
  { id: 'nature-7', category: 'Nature', name: '若葉',       ...p('nature/young-leaves.jpg') },
  { id: 'nature-8', category: 'Nature', name: '草原',       ...p('nature/grass-field.jpg') },
  { id: 'nature-9', category: 'Nature', name: '子犬',       ...p('nature/dog.jpg') },

  // ── Ocean（海・ビーチ）── 実写 ──────────────────────────────────
  { id: 'ocean-2',  category: 'Ocean', name: '空撮・珊瑚礁', ...p('ocean/aerial.jpg') },
  { id: 'ocean-9',  category: 'Ocean', name: '沖縄',         ...p('ocean/okinawa.jpg') },
  { id: 'ocean-10', category: 'Ocean', name: '島',           ...p('ocean/island.jpg') },
  { id: 'ocean-11', category: 'Ocean', name: '清流',         ...p('ocean/clear-water.jpg') },

  // ── Sky（空）── 実写・NASA写真 ──────────────────────────────────
  { id: 'sky-1',  category: 'Sky', name: '気球と空',         ...p('sky/balloon.jpg') },
  { id: 'sky-4',  category: 'Sky', name: '地球（宇宙から）', dark: true, ...p('sky/earth-1.jpg') },
  { id: 'sky-5',  category: 'Sky', name: '地球（夜側）',     dark: true, ...p('sky/earth-2.jpg') },
  { id: 'sky-8',  category: 'Sky', name: '星雲',             dark: true, ...p('sky/nebula.jpg') },
  { id: 'sky-11', category: 'Sky', name: '天文台',           dark: true, ...p('sky/observatory.jpg') },

  // ── Night（夜景）── 実写 ────────────────────────────────────────
  { id: 'night-1', category: 'Night', name: '花火',     dark: true, ...p('night/fireworks.jpg') },
  { id: 'night-4', category: 'Night', name: '夜空',     dark: true, ...p('night/night-sky.jpg') },
  { id: 'night-5', category: 'Night', name: '光の軌跡', dark: true, ...p('night/light-streaks.jpg') },

  // ── Flower（花・植物）── 実写 ───────────────────────────────────
  { id: 'flower-3', category: 'Flower', name: 'ネモフィラ',   ...p('flower/nemophila.jpg') },
  { id: 'flower-4', category: 'Flower', name: '紅葉',         ...p('flower/autumn-leaves.jpg') },
  { id: 'flower-5', category: 'Flower', name: '夏の植物',     ...p('flower/summer.png') },
  { id: 'flower-6', category: 'Flower', name: 'チューリップ', ...p('flower/tulips.jpg') },

  // ── Food（食べ物）── 実写 ───────────────────────────────────────
  { id: 'food-1', category: 'Food', name: 'バーガー',     dark: true, ...p('food/burger.jpg') },
  { id: 'food-3', category: 'Food', name: 'フルーツ',               ...p('food/fruits.jpg') },
  { id: 'food-4', category: 'Food', name: 'クロワッサン',           ...p('food/croissant.jpg') },

  // ── IllustAnime（アニメ/キャラ）──────────────────────────────────
  { id: 'illust-6',  category: 'IllustAnime', name: '放課後教室',                  ...p('illustration/classroom.jpg') },
  { id: 'illust-12', category: 'IllustAnime', name: '夏のイラスト',                ...p('illustration/summer-illust.jpg') },
  { id: 'illust-16', category: 'IllustAnime', name: '崖の猫',                      ...p('illustration/cat-cliff.jpg') },
  { id: 'illust-18', category: 'IllustAnime', name: 'ビーチパーティー', dark: true, ...p('illustration/beach-party.jpg') },
  { id: 'illust-20', category: 'IllustAnime', name: '少女と夕焼け',    dark: true, ...p('illustration/girl-sunset.jpg') },
  { id: 'illust-26', category: 'IllustAnime', name: '女性イラスト',                ...p('illustration/woman.svg') },

  // ── IllustScene（風景イラスト）───────────────────────────────────
  { id: 'illust-29', category: 'IllustScene', name: '村',            ...p('illustration/village.svg') },
  { id: 'ocean-3',   category: 'IllustScene', name: 'ギリシャ港',    ...p('ocean/greek-port.jpg') },
  { id: 'ocean-4',   category: 'IllustScene', name: '地中海',        ...p('ocean/mediterranean.jpg') },
  { id: 'ocean-5',   category: 'IllustScene', name: 'ポップビーチ',  ...p('ocean/pop-beach.jpg') },
  { id: 'ocean-6',   category: 'IllustScene', name: '青い海',        ...p('ocean/blue-sea.jpg') },
  { id: 'ocean-7',   category: 'IllustScene', name: 'ビーチリゾート', ...p('ocean/summer-resort.jpg') },
  { id: 'sky-3',     category: 'IllustScene', name: 'カラフルな空',  ...p('sky/colorful.jpg') },
  { id: 'sky-7',     category: 'IllustScene', name: 'ピンクの空',    ...p('sky/pink.jpg') },
  { id: 'sky-9',     category: 'IllustScene', name: '虹の空',        ...p('sky/rainbow-sky.jpg') },
  { id: 'nature-5',  category: 'IllustScene', name: 'パノラマ',      ...p('nature/panorama.jpg') },
  { id: 'flower-1',  category: 'IllustScene', name: '花1',           ...p('flower/flowers-1.png') },

  // ── IllustFantasy（ファンタジー）────────────────────────────────
  { id: 'illust-7',  category: 'IllustFantasy', name: '魔法陣',             dark: true, ...p('illustration/magic-circle.jpg') },
  { id: 'illust-13', category: 'IllustFantasy', name: 'クジラファンタジー', dark: true, ...p('illustration/whale-fantasy.jpg') },
  { id: 'illust-15', category: 'IllustFantasy', name: 'AIアート・月',       dark: true, ...p('illustration/ai-pink-moon.jpg') },
  { id: 'illust-27', category: 'IllustFantasy', name: '街',                 dark: true, ...p('illustration/city.jpg') },
  { id: 'nature-6',  category: 'IllustFantasy', name: '木々',                         ...p('nature/trees.png') },
  { id: 'ocean-8',   category: 'IllustFantasy', name: '海底',                         ...p('ocean/submarine.jpg') },
  { id: 'sky-2',     category: 'IllustFantasy', name: '惑星と星',           dark: true, ...p('sky/planet-stars.jpg') },
  { id: 'sky-6',     category: 'IllustFantasy', name: '幻想的な空',                   ...p('sky/fantastic.jpg') },
  { id: 'sky-10',    category: 'IllustFantasy', name: '虹',                 dark: true, ...p('sky/rainbow.jpg') },
  { id: 'night-2',   category: 'IllustFantasy', name: 'ハロウィン夜空',     dark: true, ...p('night/halloween.jpg') },
  { id: 'night-3',   category: 'IllustFantasy', name: 'ネオンエネルギー',   dark: true, ...p('night/neon-energy.jpg') },

  // ── IllustPop（レトロ/ポップ）───────────────────────────────────
  { id: 'illust-8',  category: 'IllustPop', name: 'タクシー',           ...p('illustration/taxi.jpg') },
  { id: 'illust-9',  category: 'IllustPop', name: '自動販売機',         ...p('illustration/vending-machine.jpg') },
  { id: 'illust-14', category: 'IllustPop', name: 'カラフルウェーブ',   ...p('illustration/colorful-wavy.jpg') },
  { id: 'illust-17', category: 'IllustPop', name: '雪の結晶',           ...p('illustration/snowflake.jpg') },
  { id: 'illust-19', category: 'IllustPop', name: '赤いオープンカー',   ...p('illustration/red-car.jpg') },
  { id: 'illust-21', category: 'IllustPop', name: 'ラップトップ',       ...p('illustration/laptop.jpg') },
  { id: 'illust-22', category: 'IllustPop', name: 'カセットテープ',     dark: true, ...p('illustration/audio.jpg') },
  { id: 'illust-23', category: 'IllustPop', name: 'ギター',             ...p('illustration/guitar.png') },
  { id: 'illust-24', category: 'IllustPop', name: 'タブレット男性',     ...p('illustration/man.png') },
  { id: 'illust-25', category: 'IllustPop', name: 'カラフルスプラッシュ', ...p('illustration/colorful-splash.jpg') },
  { id: 'illust-28', category: 'IllustPop', name: 'サッカー',           ...p('illustration/soccer.svg') },
  { id: 'nature-1',  category: 'IllustPop', name: '砂漠の風景1',        ...p('nature/dry-area-1.jpg') },
  { id: 'nature-2',  category: 'IllustPop', name: '砂漠の風景2',        ...p('nature/dry-area-2.jpg') },
  { id: 'ocean-1',   category: 'IllustPop', name: 'ビーチ',             ...p('ocean/beach.png') },
  { id: 'food-2',    category: 'IllustPop', name: 'チーズ',             ...p('food/cheese.png') },

  // ── Pastel（グラデーション）──────────────────────────────────────
  { id: 'pastel-1', category: 'Pastel', name: 'ピーチブロッサム', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'pastel-2', category: 'Pastel', name: 'ラベンダーミスト', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { id: 'pastel-3', category: 'Pastel', name: 'ミントフレッシュ', gradient: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { id: 'pastel-4', category: 'Pastel', name: 'ローズモーニング', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { id: 'pastel-5', category: 'Pastel', name: 'サクラ',           gradient: 'linear-gradient(160deg, #ffd1dc 0%, #ffb3c6 50%, #ff8fa3 100%)' },

  // ── Lofi（グラデーション）────────────────────────────────────────
  { id: 'lofi-1', category: 'Lofi', name: 'アンバーライト',     gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { id: 'lofi-2', category: 'Lofi', name: 'モーニングコーヒー', gradient: 'linear-gradient(135deg, #c9a880 0%, #e8d5b7 50%, #c9a880 100%)' },
  { id: 'lofi-3', category: 'Lofi', name: 'レインウィンドウ',   dark: true, gradient: 'linear-gradient(160deg, #667eea 0%, #764ba2 100%)' },
  { id: 'lofi-4', category: 'Lofi', name: 'ビンテージペーパー', gradient: 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%)' },
  { id: 'lofi-5', category: 'Lofi', name: '夕暮れカフェ',       gradient: 'linear-gradient(160deg, #fad7a1 0%, #e96d71 50%, #c0392b 100%)' },
  { id: 'lofi-6', category: 'Lofi', name: 'シルバーテクスチャ', ...p('lofi/silver-texture.jpg') },

  // ── Neon（グラデーション）────────────────────────────────────────
  { id: 'neon-1', category: 'Neon', name: 'ディープスペース', dark: true, gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'neon-2', category: 'Neon', name: 'ネオンパープル',   dark: true, gradient: 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)' },
  { id: 'neon-3', category: 'Neon', name: 'サイバーブルー',   dark: true, gradient: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
  { id: 'neon-4', category: 'Neon', name: 'マトリックス',     dark: true, gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' },
  { id: 'neon-5', category: 'Neon', name: 'シンセウェーブ',   dark: true, gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)' },
]

export const THEME_CATEGORIES: { key: ThemeCategory; label: string }[] = [
  { key: 'Japan',         label: '和風'           },
  { key: 'Nature',        label: '自然'           },
  { key: 'Ocean',         label: '海'             },
  { key: 'Sky',           label: '空'             },
  { key: 'Night',         label: '夜景'           },
  { key: 'Flower',        label: '花・植物'       },
  { key: 'Food',          label: 'フード'         },
  { key: 'IllustAnime',   label: 'アニメ/キャラ' },
  { key: 'IllustScene',   label: '風景イラスト'   },
  { key: 'IllustFantasy', label: 'ファンタジー'   },
  { key: 'IllustPop',     label: 'レトロ/ポップ' },
  { key: 'Pastel',        label: 'パステル'       },
  { key: 'Lofi',          label: 'ローファイ'     },
  { key: 'Neon',          label: 'ネオン'         },
]

export type ThemeGroup = 'photo' | 'illustration' | 'gradient'

export const THEME_GROUPS: { key: ThemeGroup; label: string }[] = [
  { key: 'photo',        label: '写真'           },
  { key: 'illustration', label: 'イラスト'       },
  { key: 'gradient',     label: 'グラデーション' },
]

export const GROUP_CATEGORIES: Record<ThemeGroup, ThemeCategory[]> = {
  photo:        ['Japan', 'Nature', 'Ocean', 'Sky', 'Night', 'Flower', 'Food'],
  illustration: ['IllustAnime', 'IllustScene', 'IllustFantasy', 'IllustPop'],
  gradient:     ['Pastel', 'Lofi', 'Neon'],
}

export const CATEGORY_TO_GROUP: Record<ThemeCategory, ThemeGroup> = {
  Japan: 'photo', Nature: 'photo', Ocean: 'photo', Sky: 'photo',
  Night: 'photo', Flower: 'photo', Food: 'photo',
  IllustAnime: 'illustration', IllustScene: 'illustration', IllustFantasy: 'illustration', IllustPop: 'illustration',
  Pastel: 'gradient', Lofi: 'gradient', Neon: 'gradient',
}

// dark フラグが明示されたテーマのみダーク（個別に dark: true で制御）
export function isThemeDark(theme: ThemeItem | null): boolean {
  if (!theme) return false
  return theme.dark === true
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

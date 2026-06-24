'use client'

import { type Dispatch, type SetStateAction } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'

const CATEGORIES = [
  '自然', '歴史・文化', '温泉', 'テーマパーク', '体験・アクティビティ', '道の駅', 'その他',
]

const SEASONS = [
  { value: 'spring', label: '🌸 春（3〜5月）' },
  { value: 'summer', label: '🌿 夏（6〜8月）' },
  { value: 'autumn', label: '🍂 秋（9〜11月）' },
  { value: 'winter', label: '❄️ 冬（12〜2月）' },
  { value: 'all',    label: '🗓️ 通年' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  categories: string[]
  setCategories: Dispatch<SetStateAction<string[]>>
  season: string
  setSeason: Dispatch<SetStateAction<string>>
  onReset: () => void
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer select-none
   ${active
     ? 'bg-primary text-white shadow-[0_2px_8px_rgba(95,139,139,0.4)]'
     : 'bg-app-bg text-app-sub hover:bg-app-border hover:text-app-text'
   }`

export default function SpotFilterDrawer({
  isOpen, onClose,
  categories, setCategories,
  season, setSeason,
  onReset,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-[360px] bg-white z-50 flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.12)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-app-border">
              <h2 className="text-[16px] font-bold text-app-text">絞り込み</h2>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={onReset}
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center gap-1 text-[12px] text-app-sub hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/8"
                >
                  <RotateCcw size={12} />
                  リセット
                </motion.button>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-app-bg hover:bg-app-border transition-colors"
                >
                  <X size={16} className="text-app-sub" />
                </motion.button>
              </div>
            </div>

            {/* フィルター内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-7">

              {/* カテゴリ */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="text-[11px] font-bold tracking-widest text-app-sub uppercase mb-3">カテゴリ</p>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    onClick={() => setCategories([])}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    className={chip(categories.length === 0)}
                  >
                    すべて
                  </motion.button>
                  {CATEGORIES.map(c => (
                    <motion.button
                      key={c}
                      onClick={() => setCategories(prev => toggle(prev, c))}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                      className={chip(categories.includes(c))}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* 季節 */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="text-[11px] font-bold tracking-widest text-app-sub uppercase mb-3">おすすめ季節</p>
                <div className="flex flex-col gap-2">
                  <motion.button
                    onClick={() => setSeason('')}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    className={chip(season === '')}
                  >
                    すべての季節
                  </motion.button>
                  {SEASONS.map(s => (
                    <motion.button
                      key={s.value}
                      onClick={() => setSeason(season === s.value ? '' : s.value)}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                      className={`${chip(season === s.value)} text-left`}
                    >
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </motion.section>

            </div>

            {/* 適用ボタン */}
            <div className="px-6 py-5 border-t border-app-border">
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(95,139,139,0.35)] hover:bg-primary-dark transition-colors"
              >
                この絞り込みを適用
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

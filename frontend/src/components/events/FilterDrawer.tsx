'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'

const CATEGORIES = [
  'すべて', 'テクノロジー', '音楽', 'スポーツ', '自然・アウトドア',
  '食・グルメ', '文化・伝統', 'ファミリー', '教育', '祭り・イベント', 'アート',
]
const AREAS = [
  'すべての地域', '郡山市', '本宮市', 'いわき市',
  '福島市', '会津若松市', '南相馬市', '白河市',
]
const TAGS = ['子連れOK', '無料', '室内', '屋外']

interface Props {
  isOpen: boolean
  onClose: () => void
  category: string
  setCategory: (v: string) => void
  area: string
  setArea: (v: string) => void
  activeTag: string | null
  setActiveTag: (v: string | null) => void
  showPast: boolean
  setShowPast: (v: boolean) => void
  onReset: () => void
}

const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer select-none
   ${active
     ? 'bg-primary text-white shadow-[0_2px_8px_rgba(95,139,139,0.4)]'
     : 'bg-app-bg text-app-sub hover:bg-app-border hover:text-app-text'
   }`

export default function FilterDrawer({
  isOpen, onClose,
  category, setCategory,
  area, setArea,
  activeTag, setActiveTag,
  showPast, setShowPast,
  onReset,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景オーバーレイ */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* ドロワー本体（右からスライドイン） */}
          <motion.div
            className="fixed top-0 right-0 h-full w-[340px] bg-white z-50 flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.12)]"
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

            {/* フィルター内容（スクロール可） */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-7">

              {/* カテゴリ */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="text-[11px] font-bold tracking-widest text-app-sub uppercase mb-3">カテゴリ</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <motion.button
                      key={c}
                      onClick={() => setCategory(c)}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                      className={chip(category === c)}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* 地域 */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="text-[11px] font-bold tracking-widest text-app-sub uppercase mb-3">地域</p>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map(a => (
                    <motion.button
                      key={a}
                      onClick={() => setArea(a)}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                      className={chip(area === a)}
                    >
                      {a}
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* タグ */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="text-[11px] font-bold tracking-widest text-app-sub uppercase mb-3">タグ</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(t => (
                    <motion.button
                      key={t}
                      onClick={() => setActiveTag(activeTag === t ? null : t)}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                      className={chip(activeTag === t)}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* 表示設定 */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="text-[11px] font-bold tracking-widest text-app-sub uppercase mb-3">表示設定</p>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setShowPast(!showPast)}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${showPast ? 'bg-primary' : 'bg-app-border'}`}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                      animate={{ left: showPast ? '22px' : '4px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    />
                  </div>
                  <span className="text-[13px] text-app-text group-hover:text-primary transition-colors">
                    終了したイベントも表示
                  </span>
                </label>
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

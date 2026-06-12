'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, CheckSquare, Square, ChevronRight } from 'lucide-react'

export type PendingSource = {
  source_type: 'event' | 'personal_event'
  source_id: number
  title: string
  date: string
}

export type PendingConfirmation = {
  municipality: string
  sources: PendingSource[]
}

type Props = {
  confirmation: PendingConfirmation
  onConfirmed: (municipality: string, checkedSources: PendingSource[]) => void
  onSkip: () => void
  onClose: () => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function PendingConfirmationModal({ confirmation, onConfirmed, onSkip, onClose }: Props) {
  const [checked, setChecked] = useState<Set<number>>(
    // デフォルト：全チェック
    new Set(confirmation.sources.map((_, i) => i))
  )

  const toggle = (i: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const checkedSources = confirmation.sources.filter((_, i) => checked.has(i))

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[350] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {/* 背景オーバーレイ */}
        <motion.div
          className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* モーダル本体 */}
        <motion.div
          className="relative z-10 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.22)] w-full max-w-sm overflow-hidden"
          initial={{ scale: 0.92, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 16, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={e => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #f59e0b22, #f59e0b44)' }}
              >
                <MapPin size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-amber-500 tracking-wide uppercase">確認待ち</p>
                <h2 className="text-[17px] font-bold text-gray-900 leading-tight">
                  {confirmation.municipality}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors mt-0.5"
            >
              <X size={13} className="text-gray-500" />
            </button>
          </div>

          <p className="px-5 pb-3 text-[12px] text-gray-500 leading-relaxed">
            以下の予定に行きましたか？行ったものにチェックを入れて記録できます。
          </p>

          {/* イベント一覧 */}
          <div className="px-4 pb-3 flex flex-col gap-1.5">
            {confirmation.sources.map((source, i) => {
              const isChecked = checked.has(i)
              return (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left"
                  style={{
                    background: isChecked ? '#f0fdf4' : '#f9fafb',
                    border: `1.5px solid ${isChecked ? '#86efac' : '#e5e7eb'}`,
                  }}
                >
                  {isChecked
                    ? <CheckSquare size={16} className="text-emerald-500 shrink-0" />
                    : <Square size={16} className="text-gray-300 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{source.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatDate(source.date)}
                      <span className="ml-1.5 text-gray-300">
                        {source.source_type === 'event' ? 'イベント' : 'マイ予定'}
                      </span>
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* ボタン行 */}
          <div className="px-4 pb-5 flex flex-col gap-2">
            <button
              onClick={() => checkedSources.length > 0 && onConfirmed(confirmation.municipality, checkedSources)}
              disabled={checkedSources.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-40"
              style={{ background: checkedSources.length > 0 ? '#10b981' : '#9ca3af' }}
            >
              訪問を記録する（{checkedSources.length}件）
              <ChevronRight size={15} />
            </button>
            <button
              onClick={onSkip}
              className="w-full py-2 rounded-xl text-[12px] font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              今回はスキップ
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

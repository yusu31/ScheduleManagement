'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Event } from '@/types/event'

const CATEGORY_STYLES: Record<string, { bg: string; text: string; emoji: string }> = {
  'テクノロジー':    { bg: 'bg-[#e5f3f1]', text: 'text-[#2a7a68]', emoji: '💻' },
  '音楽':           { bg: 'bg-[#f3ede5]', text: 'text-[#7a5a2a]', emoji: '🎵' },
  'スポーツ':       { bg: 'bg-[#eaf3e5]', text: 'text-[#3a7a2a]', emoji: '⚽' },
  '自然・アウトドア': { bg: 'bg-[#e8f3e8]', text: 'text-[#2a6a2a]', emoji: '🏕' },
  '食・グルメ':     { bg: 'bg-[#f3e8e5]', text: 'text-[#7a3a2a]', emoji: '🍽' },
  '文化・伝統':     { bg: 'bg-[#ede5f3]', text: 'text-[#5a2a7a]', emoji: '🏯' },
  'ファミリー':     { bg: 'bg-[#e8f3f0]', text: 'text-[#2a6a50]', emoji: '👨‍👩‍👧' },
  '教育':           { bg: 'bg-[#e5eef3]', text: 'text-[#2a4a7a]', emoji: '📚' },
  '祭り・イベント': { bg: 'bg-[#f3f0e5]', text: 'text-[#7a6a2a]', emoji: '🎆' },
  'アート':         { bg: 'bg-[#f0e5f3]', text: 'text-[#6a2a7a]', emoji: '🎨' },
  'その他':         { bg: 'bg-[#f0f0f0]', text: 'text-[#5a5a5a]', emoji: '📌' },
}
const DEFAULT_STYLE = { bg: 'bg-primary-light', text: 'text-primary-dark', emoji: '📌' }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    month: 'short', day: 'numeric', weekday: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

type Props = { event: Event }

// 画像ズームのspring設定
const IMG_SPRING  = { type: 'spring' as const, stiffness: 260, damping: 28 }
// カードスケールのspring設定
const CARD_SPRING = { type: 'spring' as const, stiffness: 420, damping: 34, restDelta: 0.001 }

export default function EventCard({ event }: Props) {
  const [hovered,   setHovered]   = useState(false)
  const [favorited, setFavorited] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const style = CATEGORY_STYLES[event.category] ?? DEFAULT_STYLE

  function onEnter() {
    timer.current = setTimeout(() => setHovered(true), 280)
  }
  function onLeave() {
    if (timer.current) clearTimeout(timer.current)
    setHovered(false)
  }

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()   // Linkへの遷移を止める
    e.stopPropagation()  // 親へのイベント伝播を止める
    const next = !favorited
    setFavorited(next)
    // id: 'fav' で同一IDに上書き → 連打してもトーストが積み重ならない
    toast(next ? '♥ お気に入りに追加しました' : 'お気に入りを解除しました', {
      id: 'fav',
      icon: next ? '❤️' : '🤍',
      style: { fontSize: '13px', fontWeight: '600' },
      duration: 1500,
    })
  }

  return (
    // z-index はアニメーションせず即座に切り替える（Framer Motion で animate すると遅延が出る）
    <div
      className="relative"
      style={{ zIndex: hovered ? 30 : 1 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Link href={`/events/${event.id}`} className="block outline-none">
        <motion.div
          className="relative overflow-visible cursor-pointer"
          style={{ willChange: 'transform', transformOrigin: 'center center' }}
          animate={{ scale: hovered ? 1.14 : 1 }}
          transition={{
            scale: CARD_SPRING,
            boxShadow: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          {/* ─── カード本体 ─── */}
          <motion.div
            className="rounded-2xl overflow-hidden bg-white"
            animate={{
              boxShadow: hovered
                ? '0 20px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)'
                : '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)',
            }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* 画像エリア：overflow-hidden でズームをクリップ */}
            <div className="relative w-full aspect-video overflow-hidden">
              {event.image_url ? (
                <motion.div
                  className="relative w-full h-full"
                  animate={{ scale: hovered ? 1.08 : 1 }}
                  transition={IMG_SPRING}
                >
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#cde0de] to-[#9cbebe] flex items-center justify-center text-[50px]"
                  animate={{ scale: hovered ? 1.08 : 1 }}
                  transition={IMG_SPRING}
                >
                  {style.emoji}
                </motion.div>
              )}

              {/* ♡ ボタン（Airbnb 方式：画像右上、ホバー時に浮き上がる） */}
              <motion.button
                className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center text-[15px]"
                style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(6px)' }}
                animate={{
                  opacity: hovered ? 1 : 0,
                  scale:   hovered ? 1 : 0.7,
                  y:       hovered ? 0 : 4,
                }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                onClick={handleFavorite}
                whileTap={{ scale: 0.82 }}
                aria-label={favorited ? 'お気に入りを解除' : 'お気に入りに追加'}
              >
                <motion.span
                  key={favorited ? 'filled' : 'empty'}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className={favorited ? 'text-red-400' : 'text-white'}
                >
                  {favorited ? '♥' : '♡'}
                </motion.span>
              </motion.button>
            </div>

            {/* 基本情報（常に表示・高さ固定） */}
            <div className="px-4 pt-3 pb-4">
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                {style.emoji}&nbsp;{event.category}
              </span>
              <div className="mt-1.5 text-[13px] font-bold text-app-text leading-snug line-clamp-2">
                {event.title}
              </div>
              {/* 日付は常に表示（ホバーしなくても一目でわかる Airbnb 方式） */}
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-app-sub">
                <span>📅</span>
                <span>{formatDate(event.start_at)}</span>
              </div>
            </div>
          </motion.div>

          {/* ─── ホバーパネル（absolute 配置＝グリッドに影響ゼロ）───
               top: calc(100% - 1rem) = rounded-b-2xl（16px）分だけ被せてシームレスに接続 */}
          <motion.div
            className="absolute left-0 right-0 bg-white rounded-b-2xl px-4 pb-5 pointer-events-none"
            style={{ top: 'calc(100% - 1rem)', paddingTop: '1rem' }}
            initial={false}
            animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1], delay: hovered ? 0.04 : 0 }}
          >
            <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-[12px] text-app-sub">
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <span>📍</span>
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}
              {event.capacity && (
                <div className="flex items-center gap-1.5">
                  <span>👥</span>
                  <span>定員 {event.capacity}名</span>
                </div>
              )}
            </div>
            <div className="mt-3 text-[12px] font-semibold text-primary">
              詳細を見る →
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import apiClient from '@/lib/axios'
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
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    apiClient.get(`/api/v1/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="bg-app-bg min-h-screen flex items-center justify-center text-app-sub">
        読み込み中...
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div className="bg-app-bg min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-app-sub">イベントが見つかりませんでした</p>
        <button onClick={() => router.back()} className="text-primary underline text-sm">
          一覧に戻る
        </button>
      </div>
    )
  }

  const style = CATEGORY_STYLES[event.category] ?? DEFAULT_STYLE

  return (
    <div className="bg-app-bg min-h-screen">
      <motion.div
        className="max-w-[720px] mx-auto px-4 py-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <button
          onClick={() => router.back()}
          className="text-[13px] text-app-sub hover:text-primary mb-6 flex items-center gap-1 transition-colors"
        >
          ← 一覧に戻る
        </button>

        <div className="bg-app-surface rounded-[18px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          {/* ヘッダー画像 */}
          {event.image_url ? (
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#cde0de] to-[#b4cece] flex items-center justify-center text-[80px]">
              {style.emoji}
            </div>
          )}

          <div className="p-7">
            {/* カテゴリタグ */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4 ${style.bg} ${style.text}`}>
              {style.emoji} {event.category}
            </span>

            {/* タイトル */}
            <h1 className="text-[22px] font-bold text-app-text leading-snug mb-5">
              {event.title}
            </h1>

            {/* メタ情報 */}
            <div className="flex flex-col gap-3 pb-5 border-b border-app-border mb-5">
              <div className="flex items-start gap-2.5 text-[14px] text-app-sub">
                <span>📅</span>
                <span>{formatDate(event.start_at)}{event.end_at && ` 〜 ${formatDate(event.end_at)}`}</span>
              </div>
              {event.location && (
                <div className="flex items-start gap-2.5 text-[14px] text-app-sub">
                  <span>📍</span>
                  <span>{event.location}</span>
                </div>
              )}
              {event.capacity && (
                <div className="flex items-start gap-2.5 text-[14px] text-app-sub">
                  <span>👥</span>
                  <span>定員 {event.capacity}名</span>
                </div>
              )}
              {event.event_url && (
                <div className="flex items-start gap-2.5 text-[14px]">
                  <span>🌐</span>
                  <a
                    href={event.event_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary-dark"
                  >
                    外部サイトでイベント詳細を見る →
                  </a>
                </div>
              )}
            </div>

            {/* 説明文 */}
            {event.description && (
              <p className="text-[14px] leading-[1.85] text-app-text mb-7 whitespace-pre-wrap">
                {event.description}
              </p>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3">
              <button className="bg-primary hover:bg-primary-dark text-white text-[14px] font-semibold px-6 py-2.5 rounded-[10px] transition-colors">
                📅 参加予定に追加
              </button>
              <button className="text-primary border-[1.5px] border-primary hover:bg-primary-light text-[14px] font-semibold px-6 py-2.5 rounded-[10px] transition-colors">
                ♡ お気に入り
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

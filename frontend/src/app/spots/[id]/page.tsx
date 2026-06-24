'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  MapPin, Clock, Ticket, Phone, Globe, Train,
  Leaf, Landmark, Droplets, Sparkles, Bike, ShoppingBag, Tag,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import apiClient from '@/lib/axios'
import { Spot } from '@/types/spot'

const CATEGORY_STYLES: Record<string, { gradient: string; bg: string; text: string; Icon: LucideIcon }> = {
  '自然':                 { gradient: 'from-[#16a34a] to-[#15803d]', bg: 'bg-[#eaf3e8]', text: 'text-[#2a6a2a]', Icon: Leaf },
  '歴史・文化':           { gradient: 'from-[#8b5cf6] to-[#6d28d9]', bg: 'bg-[#ede5f3]', text: 'text-[#5a2a7a]', Icon: Landmark },
  '温泉':                 { gradient: 'from-[#06b6d4] to-[#0284c7]', bg: 'bg-[#e5f3f7]', text: 'text-[#1a6a7a]', Icon: Droplets },
  'テーマパーク':         { gradient: 'from-[#f97316] to-[#dc2626]', bg: 'bg-[#f3ebe5]', text: 'text-[#7a3a1a]', Icon: Sparkles },
  '体験・アクティビティ': { gradient: 'from-[#0ea5e9] to-[#0891b2]', bg: 'bg-[#e5f0f7]', text: 'text-[#1a4a7a]', Icon: Bike },
  '道の駅':               { gradient: 'from-[#f59e0b] to-[#d97706]', bg: 'bg-[#f7f0e5]', text: 'text-[#7a5a1a]', Icon: ShoppingBag },
  'その他':               { gradient: 'from-[#6b7280] to-[#4b5563]', bg: 'bg-[#f0f0f0]', text: 'text-[#5a5a5a]', Icon: Tag },
}
const DEFAULT_STYLE = { gradient: 'from-[#5f8b8b] to-[#4a7070]', bg: 'bg-primary-light', text: 'text-primary-dark', Icon: Tag }

const SEASON_LABEL: Record<string, string> = {
  spring: '🌸 春（3〜5月）',
  summer: '🌿 夏（6〜8月）',
  autumn: '🍂 秋（9〜11月）',
  winter: '❄️ 冬（12〜2月）',
  all:    '🗓️ 通年楽しめます',
}

type InfoRowProps = {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}

function InfoRow({ icon: Icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-app-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-app-sub uppercase tracking-widest mb-0.5">{label}</p>
        <div className="text-[14px] text-app-text">{children}</div>
      </div>
    </div>
  )
}

export default function SpotDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [spot, setSpot] = useState<Spot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    apiClient.get(`/api/v1/spots/${id}`)
      .then(res => setSpot(res.data))
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

  if (notFound || !spot) {
    return (
      <div className="bg-app-bg min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-app-sub">スポットが見つかりませんでした</p>
        <button onClick={() => router.back()} className="text-primary underline text-sm">
          一覧に戻る
        </button>
      </div>
    )
  }

  const style = CATEGORY_STYLES[spot.category] ?? DEFAULT_STYLE

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
          ← スポット一覧に戻る
        </button>

        <div className="bg-app-surface rounded-[18px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          {/* ヘッダー画像 */}
          {spot.image_url ? (
            <div className="relative w-full aspect-[16/9]">
              <Image src={spot.image_url} alt={spot.name} fill className="object-cover" />
            </div>
          ) : (
            <div className={`w-full aspect-[16/9] bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
              <style.Icon size={80} className="text-white/80 drop-shadow-lg" />
            </div>
          )}

          <div className="p-7">
            {/* カテゴリタグ + エリアバッジ */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                <style.Icon size={12} />
                {spot.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                <MapPin size={11} />
                {spot.area}
              </span>
              {spot.season && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                  {SEASON_LABEL[spot.season] ?? spot.season}
                </span>
              )}
            </div>

            {/* スポット名 */}
            <h1 className="text-[22px] font-bold text-app-text leading-snug mb-2">
              {spot.name}
            </h1>
            {spot.municipality && (
              <p className="text-[13px] text-app-sub mb-5">{spot.municipality}　{spot.address ?? ''}</p>
            )}

            {/* 説明文 */}
            {spot.description && (
              <div className="mb-6 pb-5 border-b border-app-border">
                <p className="text-[14px] leading-[1.85] text-app-text whitespace-pre-wrap">
                  {spot.description}
                </p>
              </div>
            )}

            {/* 詳細情報 */}
            <div className="mb-2">
              {spot.opening_hours && (
                <InfoRow icon={Clock} label="営業時間">
                  {spot.opening_hours}
                </InfoRow>
              )}
              {spot.admission_fee && (
                <InfoRow icon={Ticket} label="入場料">
                  {spot.admission_fee}
                </InfoRow>
              )}
              {spot.access && (
                <InfoRow icon={Train} label="アクセス">
                  {spot.access}
                </InfoRow>
              )}
              {spot.phone && (
                <InfoRow icon={Phone} label="電話番号">
                  <a href={`tel:${spot.phone}`} className="text-primary hover:underline">
                    {spot.phone}
                  </a>
                </InfoRow>
              )}
              {spot.official_url && (
                <InfoRow icon={Globe} label="公式サイト">
                  <a
                    href={spot.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    外部サイトで詳細を見る →
                  </a>
                </InfoRow>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

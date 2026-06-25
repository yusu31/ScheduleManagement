'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  MapPin, Clock, Banknote, Phone, Globe, Map, Search,
  UtensilsCrossed, Beef, Soup, Coffee, ChefHat, Tag,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import apiClient from '@/lib/axios'
import { Restaurant } from '@/types/restaurant'

const CATEGORY_STYLES: Record<string, { gradient: string; bg: string; text: string; Icon: LucideIcon }> = {
  '和食':             { gradient: 'from-[#dc2626] to-[#b91c1c]', bg: 'bg-red-50',    text: 'text-red-700',    Icon: UtensilsCrossed },
  '洋食':             { gradient: 'from-[#2563eb] to-[#1d4ed8]', bg: 'bg-blue-50',   text: 'text-blue-700',   Icon: ChefHat },
  '中華':             { gradient: 'from-[#d97706] to-[#b45309]', bg: 'bg-yellow-50', text: 'text-yellow-700', Icon: UtensilsCrossed },
  'イタリアン':       { gradient: 'from-[#16a34a] to-[#15803d]', bg: 'bg-green-50',  text: 'text-green-700',  Icon: ChefHat },
  'フレンチ':         { gradient: 'from-[#7c3aed] to-[#6d28d9]', bg: 'bg-purple-50', text: 'text-purple-700', Icon: ChefHat },
  '焼肉':             { gradient: 'from-[#ea580c] to-[#dc2626]', bg: 'bg-orange-50', text: 'text-orange-700', Icon: Beef },
  'ラーメン':         { gradient: 'from-[#d97706] to-[#b45309]', bg: 'bg-amber-50',  text: 'text-amber-700',  Icon: Soup },
  'カフェ・スイーツ': { gradient: 'from-[#db2777] to-[#be185d]', bg: 'bg-pink-50',   text: 'text-pink-700',   Icon: Coffee },
  'その他':           { gradient: 'from-[#6b7280] to-[#4b5563]', bg: 'bg-gray-100',  text: 'text-gray-600',   Icon: Tag },
}
const DEFAULT_STYLE = { gradient: 'from-[#5f8b8b] to-[#4a7070]', bg: 'bg-primary-light', text: 'text-primary-dark', Icon: Tag }

const SITUATION_COLORS: Record<string, string> = {
  '子連れOK': 'bg-green-50 text-green-700 border-green-200',
  'ランチ向け': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'デートに': 'bg-pink-50 text-pink-700 border-pink-200',
  'ひとり飯OK': 'bg-blue-50 text-blue-700 border-blue-200',
  '個室あり': 'bg-purple-50 text-purple-700 border-purple-200',
}

type InfoRowProps = { icon: LucideIcon; label: string; children: React.ReactNode }

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

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    apiClient.get(`/api/v1/restaurants/${id}`)
      .then(res => setRestaurant(res.data))
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

  if (notFound || !restaurant) {
    return (
      <div className="bg-app-bg min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-app-sub">グルメスポットが見つかりませんでした</p>
        <button onClick={() => router.back()} className="text-primary underline text-sm">
          一覧に戻る
        </button>
      </div>
    )
  }

  const style = CATEGORY_STYLES[restaurant.category] ?? DEFAULT_STYLE
  const tags = Array.isArray(restaurant.situation_tags) ? restaurant.situation_tags : []

  const mapsUrl = restaurant.latitude && restaurant.longitude
    ? `https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`
    : restaurant.address
    ? `https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`
    : null

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
          ← グルメ一覧に戻る
        </button>

        <div className="bg-app-surface rounded-[18px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          {/* ヘッダー画像 */}
          {restaurant.image_url ? (
            <div className="relative w-full aspect-[16/9]">
              <Image src={restaurant.image_url} alt={restaurant.name} fill className="object-cover" />
            </div>
          ) : (
            <div className={`w-full aspect-[16/9] bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
              <style.Icon size={80} className="text-white/80 drop-shadow-lg" />
            </div>
          )}

          <div className="p-7">
            {/* カテゴリ・エリアバッジ */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                <style.Icon size={12} />
                {restaurant.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                <MapPin size={11} />
                {restaurant.area}
              </span>
              {restaurant.genre && restaurant.genre !== restaurant.category && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {restaurant.genre}
                </span>
              )}
            </div>

            {/* 店名 */}
            <h1 className="text-[22px] font-bold text-app-text leading-snug mb-2">{restaurant.name}</h1>
            {restaurant.municipality && (
              <p className="text-[13px] text-app-sub mb-4">{restaurant.municipality}　{restaurant.address ?? ''}</p>
            )}

            {/* シーンタグ */}
            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-5">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className={`text-[12px] font-semibold px-3 py-1 rounded-full border ${SITUATION_COLORS[tag] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 説明文 */}
            {restaurant.description && (
              <div className="mb-6 pb-5 border-b border-app-border">
                <p className="text-[14px] leading-[1.85] text-app-text whitespace-pre-wrap">
                  {restaurant.description}
                </p>
              </div>
            )}

            {/* 詳細情報 */}
            <div className="mb-2">
              {restaurant.opening_hours && (
                <InfoRow icon={Clock} label="営業時間">{restaurant.opening_hours}</InfoRow>
              )}
              {restaurant.budget && (
                <InfoRow icon={Banknote} label="予算目安">{restaurant.budget}</InfoRow>
              )}
              {restaurant.phone && (
                <InfoRow icon={Phone} label="電話番号">
                  <a href={`tel:${restaurant.phone}`} className="text-primary hover:underline">
                    {restaurant.phone}
                  </a>
                </InfoRow>
              )}
              {mapsUrl && (
                <InfoRow icon={Map} label="地図">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Google マップで見る →
                  </a>
                </InfoRow>
              )}
              {restaurant.official_url ? (
                <InfoRow icon={Globe} label="公式サイト">
                  <a href={restaurant.official_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                    外部サイトで詳細を見る →
                  </a>
                </InfoRow>
              ) : (
                <InfoRow icon={Search} label="外部で検索">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(restaurant.name + (restaurant.municipality ? ' ' + restaurant.municipality : ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google で検索する →
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

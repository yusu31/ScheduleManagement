'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Clock, Banknote, Phone, UtensilsCrossed, Beef, Soup, Coffee, ChefHat, Tag, Navigation, Wheat, Flame, Wine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Restaurant } from '@/types/restaurant'

const CATEGORY_STYLES: Record<string, { bg: string; text: string; Icon: LucideIcon; gradient: string }> = {
  '和食':             { bg: 'bg-red-50',    text: 'text-red-700',    Icon: UtensilsCrossed, gradient: 'from-red-400 to-red-600' },
  'ラーメン':         { bg: 'bg-amber-50',  text: 'text-amber-700',  Icon: Soup,            gradient: 'from-amber-400 to-amber-600' },
  '寿司・海鮮':       { bg: 'bg-cyan-50',   text: 'text-cyan-700',   Icon: UtensilsCrossed, gradient: 'from-cyan-400 to-blue-500' },
  '焼肉':             { bg: 'bg-orange-50', text: 'text-orange-700', Icon: Beef,            gradient: 'from-orange-400 to-red-500' },
  'カフェ・スイーツ': { bg: 'bg-pink-50',   text: 'text-pink-700',   Icon: Coffee,          gradient: 'from-pink-400 to-pink-600' },
  'ベーカリー':       { bg: 'bg-yellow-50', text: 'text-yellow-700', Icon: Wheat,           gradient: 'from-yellow-400 to-amber-500' },
  'イタリアン':       { bg: 'bg-green-50',  text: 'text-green-700',  Icon: ChefHat,         gradient: 'from-green-400 to-green-600' },
  '中華':             { bg: 'bg-yellow-50', text: 'text-yellow-700', Icon: UtensilsCrossed, gradient: 'from-yellow-400 to-orange-500' },
  '洋食':             { bg: 'bg-blue-50',   text: 'text-blue-700',   Icon: ChefHat,         gradient: 'from-blue-400 to-blue-600' },
  'フレンチ':         { bg: 'bg-purple-50', text: 'text-purple-700', Icon: ChefHat,         gradient: 'from-purple-400 to-purple-600' },
  'カレー':           { bg: 'bg-orange-50', text: 'text-orange-700', Icon: Flame,           gradient: 'from-orange-500 to-red-600' },
  '居酒屋':           { bg: 'bg-violet-50', text: 'text-violet-700', Icon: Wine,            gradient: 'from-violet-400 to-purple-600' },
  'その他':           { bg: 'bg-gray-100',  text: 'text-gray-600',   Icon: Tag,             gradient: 'from-gray-400 to-gray-600' },
}
const DEFAULT_STYLE = { bg: 'bg-teal-50', text: 'text-teal-700', Icon: Tag, gradient: 'from-teal-400 to-teal-600' }

const SITUATION_COLORS: Record<string, string> = {
  '子連れOK': 'bg-green-50 text-green-700',
  'ランチ向け': 'bg-yellow-50 text-yellow-700',
  'デートに': 'bg-pink-50 text-pink-700',
  'ひとり飯OK': 'bg-blue-50 text-blue-700',
  '個室あり': 'bg-purple-50 text-purple-700',
}

type Props = {
  restaurant: Restaurant
  distance?: number | null
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export default function RestaurantCard({ restaurant, distance }: Props) {
  const style = CATEGORY_STYLES[restaurant.category] ?? DEFAULT_STYLE
  const tags = Array.isArray(restaurant.situation_tags) ? restaurant.situation_tags : []

  const addressLine = [restaurant.municipality, restaurant.address].filter(Boolean).join('　')

  return (
    <Link href={`/restaurants/${restaurant.id}`} className="block outline-none group">
      <motion.div
        className="
          flex gap-0 rounded-2xl overflow-hidden cursor-pointer
          theme-card-bg bg-white border border-app-border
          shadow-[0_1px_4px_rgba(0,0,0,0.06)]
        "
        whileHover={{
          y: -2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        {/* 左：正方形の画像 */}
        <div className="relative shrink-0 w-[120px] h-[120px]">
          {restaurant.image_url ? (
            <Image
              src={restaurant.image_url}
              alt={restaurant.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
              <style.Icon size={36} className="text-white/80" />
            </div>
          )}
        </div>

        {/* 右：情報 */}
        <div className="flex-1 min-w-0 px-3.5 py-3 flex flex-col gap-1.5">
          {/* カテゴリ・エリア・距離 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>
              <style.Icon size={9} />
              {restaurant.category}
            </span>
            <span className="text-[10px] text-app-sub font-medium">{restaurant.area}</span>
            {distance != null && (
              <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                <Navigation size={10} />
                {formatDistance(distance)}
              </span>
            )}
          </div>

          {/* 店名 */}
          <p className="text-[13px] font-bold text-app-text leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {restaurant.name}
          </p>

          {/* 住所 */}
          {addressLine && (
            <div className="flex items-center gap-1 text-[11px] text-app-sub">
              <MapPin size={10} className="shrink-0" />
              <span className="truncate">{addressLine}</span>
            </div>
          )}

          {/* 電話番号（詳細ページでタップして発信） */}
          {restaurant.phone && (
            <div className="flex items-center gap-1 text-[11px] text-app-sub">
              <Phone size={10} className="shrink-0" />
              <span className="truncate">{restaurant.phone}</span>
            </div>
          )}

          {/* 営業時間・予算（1行にまとめる） */}
          <div className="flex items-center gap-3">
            {restaurant.opening_hours && (
              <div className="flex items-center gap-1 text-[10px] text-app-sub min-w-0">
                <Clock size={9} className="shrink-0" />
                <span className="truncate">{restaurant.opening_hours}</span>
              </div>
            )}
            {restaurant.budget && (
              <div className="flex items-center gap-1 text-[10px] text-app-sub shrink-0">
                <Banknote size={9} className="shrink-0" />
                <span>{restaurant.budget}</span>
              </div>
            )}
          </div>

          {/* シーンタグ */}
          {tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${SITUATION_COLORS[tag] ?? 'bg-gray-100 text-gray-600'}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}

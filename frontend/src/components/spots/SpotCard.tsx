'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Clock, Ticket, Leaf, Landmark, Droplets, Sparkles, Bike, ShoppingBag, Tag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Spot } from '@/types/spot'

const CATEGORY_STYLES: Record<string, { bg: string; text: string; Icon: LucideIcon }> = {
  '自然':                 { bg: 'bg-emerald-50',  text: 'text-emerald-700', Icon: Leaf },
  '歴史・文化':           { bg: 'bg-purple-50',   text: 'text-purple-700',  Icon: Landmark },
  '温泉':                 { bg: 'bg-cyan-50',     text: 'text-cyan-700',    Icon: Droplets },
  'テーマパーク':         { bg: 'bg-orange-50',   text: 'text-orange-700',  Icon: Sparkles },
  '体験・アクティビティ': { bg: 'bg-sky-50',      text: 'text-sky-700',     Icon: Bike },
  '道の駅':               { bg: 'bg-amber-50',    text: 'text-amber-700',   Icon: ShoppingBag },
  'その他':               { bg: 'bg-gray-100',    text: 'text-gray-600',    Icon: Tag },
}
const DEFAULT_STYLE = { bg: 'bg-teal-50', text: 'text-teal-700', Icon: Tag }

const GRADIENT: Record<string, string> = {
  '自然':                 'from-emerald-400 to-emerald-600',
  '歴史・文化':           'from-purple-400 to-purple-600',
  '温泉':                 'from-cyan-400 to-cyan-600',
  'テーマパーク':         'from-orange-400 to-red-500',
  '体験・アクティビティ': 'from-sky-400 to-blue-500',
  '道の駅':               'from-amber-400 to-amber-600',
  'その他':               'from-gray-400 to-gray-600',
}

type Props = { spot: Spot }

export default function SpotCard({ spot }: Props) {
  const style = CATEGORY_STYLES[spot.category] ?? DEFAULT_STYLE
  const gradient = GRADIENT[spot.category] ?? 'from-teal-400 to-teal-600'

  return (
    <Link href={`/spots/${spot.id}`} className="block outline-none group h-full">
      <motion.div
        className="
          relative rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full
          theme-card-bg bg-white border border-app-border
          shadow-[0_1px_4px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]
        "
        style={{ willChange: 'transform' }}
        whileHover={{
          y: -4,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        {/* 画像エリア（4:3） */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {spot.image_url ? (
            <Image
              src={spot.image_url}
              alt={spot.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <style.Icon size={48} className="text-white/80" />
            </div>
          )}

          {/* カテゴリバッジ（左上） */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>
              <style.Icon size={10} />
              {spot.category}
            </span>
          </div>
        </div>

        {/* テキストエリア */}
        <div className="px-3.5 pt-3 pb-3.5 flex flex-col flex-1">
          {/* スポット名 */}
          <h3 className="text-[14px] font-bold text-app-text leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
            {spot.name}
          </h3>

          {/* 市区町村 */}
          {spot.municipality && (
            <div className="flex items-center gap-1 text-[12px] text-app-sub mb-2">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{spot.municipality}</span>
            </div>
          )}

          {/* サブ情報 */}
          <div className="mt-auto flex flex-col gap-1">
            {spot.opening_hours && (
              <div className="flex items-center gap-1 text-[11px] text-app-sub">
                <Clock size={10} className="shrink-0" />
                <span className="truncate">{spot.opening_hours}</span>
              </div>
            )}
            {spot.admission_fee && (
              <div className="flex items-center gap-1 text-[11px] text-app-sub">
                <Ticket size={10} className="shrink-0" />
                <span className="truncate">{spot.admission_fee}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

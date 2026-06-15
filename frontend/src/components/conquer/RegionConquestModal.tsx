'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X } from 'lucide-react'
import RegionItem3D from './RegionItem3D'

type RegionStat = { id: string; name: string; color: string }
type Props = {
  region: RegionStat
  onAdd: () => Promise<boolean>
  onClose: () => void
  alreadyConquered: boolean
}

const ITEM_LABELS: Record<string, string> = {
  kenpo: '土湯こけし', koriyama: '三春滝桜', sukagawa: 'クリスタル',
  kennan: '白河だるま', aizu: '赤べこ', okuaizu: '只見のSL',
  minamiaizu: 'ネギ', soma: '相馬野馬追の競走馬', futaba: 'サッカーボール',
  iwaki: 'サーフボード', all: '福島県制覇トロフィー',
}

export default function RegionConquestModal({ region, onAdd, onClose, alreadyConquered }: Props) {
  const firedConfetti = useRef(false)
  const onAddRef = useRef(onAdd)
  useEffect(() => { onAddRef.current = onAdd }, [onAdd])

  // 紙吹雪（複数バースト）
  useEffect(() => {
    if (firedConfetti.current) return
    firedConfetti.current = true

    const fire = (opts: confetti.Options) => confetti({ zIndex: 9999, ...opts })
    const goldColors = ['#ffd700', '#ffaa00', '#fffbe0', '#ffcc00']
    const fullColors = [region.color, '#ffd700', '#ffffff', '#ff6b6b', '#a855f7', '#22d3ee', '#6bcb77', '#ff9a3c']

    // 第1弾：中央から超大量（CONGRATULATIONS 登場に合わせて）
    const t1 = setTimeout(() => {
      fire({ particleCount: 200, spread: 130, origin: { x: 0.5, y: 0.4 }, colors: fullColors, gravity: 0.75, scalar: 1.2 })
      fire({ particleCount: 130, spread: 80, origin: { x: 0.5, y: 0.4 }, colors: goldColors, gravity: 0.6, scalar: 1.0 })
    }, 280)

    // 第2弾：左から右斜め上
    const t2 = setTimeout(() => fire({
      particleCount: 140, angle: 55, spread: 70,
      origin: { x: 0.02, y: 0.6 },
      colors: fullColors,
    }), 680)

    // 第3弾：右から左斜め上
    const t3 = setTimeout(() => fire({
      particleCount: 140, angle: 125, spread: 70,
      origin: { x: 0.98, y: 0.6 },
      colors: fullColors,
    }), 820)

    // 第4弾：中央から金色ドバッ
    const t4 = setTimeout(() => {
      fire({ particleCount: 160, spread: 110, origin: { x: 0.5, y: 0.3 }, colors: goldColors, gravity: 0.65, scalar: 1.3 })
    }, 1200)

    // 第5弾：左右同時
    const t5 = setTimeout(() => {
      fire({ particleCount: 110, angle: 65, spread: 60, origin: { x: 0.1, y: 0.45 }, colors: fullColors })
      fire({ particleCount: 110, angle: 115, spread: 60, origin: { x: 0.9, y: 0.45 }, colors: fullColors })
    }, 1800)

    // 第6弾：テキストが上に定着した頃に仕上げ
    const t6 = setTimeout(() => fire({
      particleCount: 110, spread: 95, origin: { x: 0.5, y: 0.15 },
      colors: goldColors, gravity: 1.0, scalar: 0.9,
    }), 2700)

    return () => { [t1, t2, t3, t4, t5, t6].forEach(clearTimeout) }
  }, [region.color])

  // 保存（自動クローズなし）
  useEffect(() => {
    if (alreadyConquered) return
    const t = setTimeout(() => { onAddRef.current() }, 600)
    return () => clearTimeout(t)
  }, [alreadyConquered])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[300] flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        {/* 背景写真 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/conquer/regions/${region.id}.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.45) saturate(1.2)', pointerEvents: 'none' }}
        />

        {/* CONGRATULATIONS!! ── 中央に大きく登場 → 上部へ縮みながら移動 → 定着 */}
        <motion.p
          className="absolute z-20 w-full text-center pointer-events-none"
          style={{
            top: 0,
            left: 0,
            right: 0,
            paddingTop: '1.5vh',
            fontSize: 'clamp(30px, 7vw, 58px)',
            fontWeight: 900,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffd700 0%, #fffbe0 38%, #ffd700 62%, #ffaa00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 22px rgba(255,215,0,0.95))',
          }}
          initial={{ y: '44vh', scale: 1.5, opacity: 0 }}
          animate={{
            y: ['44vh', '44vh', 0],
            scale: [1.5, 1.5, 0.52],
            opacity: [0, 1, 1],
          }}
          transition={{ duration: 2.6, times: [0, 0.28, 1], ease: 'easeInOut' }}
        >
          Congratulations!!
        </motion.p>

        {/* CONGRATULATIONS 分のスペーサー（コンテンツが被らないよう確保） */}
        <div style={{ height: '9vh', flexShrink: 0 }} />

        {/* コンテンツ（残り高さで中央寄せ） */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="relative z-10 flex flex-col items-center gap-5 px-8 text-center"
            initial={{ y: 40, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── ヘッダー ── */}
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.55em',
                  textTransform: 'uppercase',
                  color: '#d4af37',
                  textShadow: '0 0 20px rgba(212,175,55,0.5)',
                }}
              >
                Conquered
              </p>
              <h2
                className="text-5xl font-black tracking-wide"
                style={{ color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.8)' }}
              >
                {region.name}
              </h2>
              <div className="flex items-center justify-center gap-3 mt-1">
                <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.25)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.35em' }}>制覇</span>
                <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.25)' }} />
              </div>
            </div>

            {/* ── 3Dモデル ── */}
            <div style={{ width: 220, height: 220 }}>
              <RegionItem3D regionId={region.id} autoRotate={true} />
            </div>

            {/* ── アイテム情報 ── */}
            <div className="text-center space-y-2">
              <p
                className="text-[9px] font-bold tracking-[0.6em] uppercase"
                style={{ color: 'rgba(255,255,255,0.28)' }}
              >
                Item Acquired
              </p>
              <h3
                className="font-black text-white leading-tight whitespace-nowrap"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)', fontSize: 'clamp(16px, 4vw, 26px)' }}
              >
                {ITEM_LABELS[region.id] ?? region.name}
              </h3>
              {!alreadyConquered && (
                <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '0.04em' }}>
                  ✓ コレクションに追加しました
                </p>
              )}
            </div>

            {/* ── 閉じるボタン ── */}
            <button
              onClick={onClose}
              className="mt-2 p-3 rounded-full transition-all active:scale-90 hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <X size={16} className="text-white/45" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

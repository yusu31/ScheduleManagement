'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import RegionItem3D from './RegionItem3D'

type RegionStat = {
  id: string
  name: string
  color: string
}

type Props = {
  region: RegionStat
  onAdd: () => Promise<boolean>
  onClose: () => void
  alreadyConquered: boolean
}

export default function RegionConquestModal({ region, onAdd, onClose, alreadyConquered }: Props) {
  const [added, setAdded] = useState(alreadyConquered)
  const [flyOut, setFlyOut] = useState(false)
  const firedConfetti = useRef(false)
  const onAddRef = useRef(onAdd)
  const onCloseRef = useRef(onClose)

  useEffect(() => { onAddRef.current = onAdd }, [onAdd])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // 紙吹雪
  useEffect(() => {
    if (firedConfetti.current) return
    firedConfetti.current = true
    const t = setTimeout(() => {
      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.5 },
        colors: [region.color, '#ffd700', '#ffffff', '#ff6b6b'],
      })
    }, 500)
    return () => clearTimeout(t)
  }, [region.color])

  // 自動保存 → 自動クローズ（2.8秒後）
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!alreadyConquered) {
        await onAddRef.current()
      }
      setAdded(true)
      setFlyOut(true)
      setTimeout(() => onCloseRef.current(), 900)
    }, 2800)
    return () => clearTimeout(t)
  }, [alreadyConquered])

  const handleSkip = () => {
    setFlyOut(true)
    setTimeout(() => onClose(), 900)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[300] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 背景写真 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/conquer/regions/${region.id}.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.45) saturate(1.2)', pointerEvents: 'none' }}
        />

        {/* コンテンツ */}
        <div className="relative z-10 flex flex-col items-center gap-5 px-8 text-center">
          {/* テキスト */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
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
            <div className="flex items-center gap-3 mt-1">
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.25)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.35em' }}>制覇</span>
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.25)' }} />
            </div>
          </motion.div>

          {/* 3Dアイテム */}
          <AnimatePresence>
            {!flyOut ? (
              <motion.div
                key="item"
                initial={{ y: 80, opacity: 0, scale: 0.6 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ x: 200, y: -200, opacity: 0, scale: 0.3 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 22 }}
                style={{ width: 220, height: 220 }}
              >
                <RegionItem3D regionId={region.id} autoRotate={true} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* 保存ステータス（ボタンなし） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex flex-col items-center gap-2"
          >
            {added ? (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.1em' }}>
                ✓ コレクションに追加しました
              </p>
            ) : (
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>
                コレクションに保存中...
              </p>
            )}
            <button
              onClick={handleSkip}
              className="text-white/25 text-[11px] hover:text-white/55 transition-colors"
            >
              スキップ
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

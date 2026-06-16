'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import RegionItem3D from './RegionItem3D'

type RegionDef = {
  id: string
  name: string
  color: string
  municipalities: string[]
}

type Props = {
  regions: RegionDef[]
  onClose: () => void
}

type Phase = 'title' | 'regions' | 'items' | 'trophy'

export default function AllConquestModal({ regions, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('title')
  const [regionIndex, setRegionIndex] = useState(0)
  const [showPrint, setShowPrint] = useState(false)
  const fired = useRef(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setPhase('regions'), 2000))
    timers.push(setTimeout(() => setPhase('items'), 11000))
    timers.push(setTimeout(() => {
      setPhase('trophy')
      if (!fired.current) {
        fired.current = true
        confetti({ particleCount: 250, spread: 120, origin: { y: 0.4 }, colors: ['#ffd700', '#ff6b6b', '#7c3aed', '#ffffff'] })
        setTimeout(() => confetti({ particleCount: 200, spread: 100, origin: { x: 0.2, y: 0.5 } }), 300)
        setTimeout(() => confetti({ particleCount: 200, spread: 100, origin: { x: 0.8, y: 0.5 } }), 600)
      }
    }, 14000))
    timers.push(setTimeout(() => setShowPrint(true), 16000))

    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (phase !== 'regions') return
    let idx = 0
    const interval = setInterval(() => {
      idx++
      if (idx >= regions.length) { clearInterval(interval); return }
      setRegionIndex(idx)
    }, 900)
    return () => clearInterval(interval)
  }, [phase, regions.length])

  const handlePrint = () => window.print()

  return (
    <motion.div
      className="fixed inset-0 z-[400] flex items-center justify-center overflow-hidden"
      style={{ background: '#000' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* タイトルフェーズ */}
      <AnimatePresence>
        {phase === 'title' && (
          <motion.div
            key="title"
            className="absolute flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-white/50 text-lg tracking-[0.3em]">CONGRATULATIONS</p>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-wide text-center leading-tight"
              style={{ textShadow: '0 0 60px rgba(255,215,0,0.4)' }}>
              福島県<br />全59市町村<br />
              <span style={{ color: '#ffd700' }}>制覇</span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 地区スクロールフェーズ */}
      <AnimatePresence>
        {phase === 'regions' && (
          <motion.div
            key="regions"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/40 text-sm tracking-widest mb-4">全10地区 制覇一覧</p>
            {regions.slice(0, regionIndex + 1).map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: r.color }}>
                  {r.name}
                </span>
                <span className="text-white/60 text-[11px]">
                  {r.municipalities.join(' · ')}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* アイテムズ円形表示フェーズ */}
      <AnimatePresence>
        {phase === 'items' && (
          <motion.div
            key="items"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-64 h-64">
              {regions.map((r, i) => {
                const angle = (i / regions.length) * 360
                const rad = (angle - 90) * (Math.PI / 180)
                const x = 50 + 42 * Math.cos(rad)
                const y = 50 + 42 * Math.sin(rad)
                return (
                  <motion.div
                    key={r.id}
                    className="absolute"
                    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', width: 48, height: 48 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: 360 }}
                    transition={{ delay: i * 0.12, duration: 0.6, type: 'spring' }}
                  >
                    <RegionItem3D regionId={r.id} autoRotate={true} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* トロフィーフェーズ */}
      <AnimatePresence>
        {phase === 'trophy' && (
          <motion.div
            key="trophy"
            className="absolute flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ y: 80, scale: 0.5 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 18 }}
              style={{ width: 200, height: 200 }}
            >
              <RegionItem3D regionId="all" autoRotate={true} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-3xl font-black text-center"
              style={{ color: '#ffd700', textShadow: '0 0 40px rgba(255,215,0,0.6)' }}
            >
              全制覇おめでとうございます！
            </motion.p>

            <AnimatePresence>
              {showPrint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <button
                    onClick={handlePrint}
                    className="px-8 py-3 rounded-full font-bold text-black text-lg active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #ffd700, #ffb300)', boxShadow: '0 4px 20px rgba(255,215,0,0.5)' }}
                  >
                    🏆 証明書を表示
                  </button>
                  <button
                    onClick={onClose}
                    className="text-white/40 text-sm hover:text-white/80 transition-colors"
                  >
                    閉じる
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 証明書（印刷用） */}
      <div className="print-only" style={{ display: 'none' }}>
        <div style={{ padding: 60, textAlign: 'center', fontFamily: 'serif' }}>
          <p style={{ fontSize: 14, letterSpacing: '0.3em', color: '#888' }}>CERTIFICATE OF ACHIEVEMENT</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: '16px 0' }}>福島県全市町村制覇証明書</h1>
          <p style={{ fontSize: 16, color: '#555', marginTop: 24 }}>
            あなたは福島県内全59市町村を制覇しました。<br />
            この偉業を称え、ここに証明します。
          </p>
          <p style={{ fontSize: 14, color: '#999', marginTop: 40 }}>
            {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Roami</p>
        </div>
      </div>

      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>
    </motion.div>
  )
}

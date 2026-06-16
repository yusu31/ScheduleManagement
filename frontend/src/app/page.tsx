import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import WeeklyEvents from '@/components/WeeklyEvents'

export default function Home() {
  return (
    <>
      {/* ─── フルスクリーンヒーロー ─── */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden px-6">

        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3f3f] via-[#2d6464] to-[#0d2b2b]" />

        {/* 装飾：ぼかした光の円 */}
        <div className="absolute top-1/4 right-[20%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-[15%] w-[360px] h-[360px] rounded-full bg-teal-400/10 blur-[100px] pointer-events-none" />

        {/* コンテンツ */}
        <div className="relative z-10 max-w-2xl">
          <p className="text-white/50 text-[11px] font-semibold tracking-[0.3em] uppercase mb-6">
            Roami
          </p>

          <h1 className="text-[52px] sm:text-[68px] font-black text-white leading-[1.1] mb-6 drop-shadow-sm">
            福島のイベント、<br />全部ここに。
          </h1>

          <p className="text-white/65 text-[16px] sm:text-[18px] leading-relaxed mb-10 max-w-sm mx-auto">
            郡山・いわき・福島市など、地域の<br />イベントをまとめてチェック。
          </p>

          <Link
            href="/events"
            className="
              inline-flex items-center gap-2
              bg-white text-[#2d6464] font-bold text-[15px]
              px-9 py-4 rounded-2xl
              hover:bg-white/90 active:scale-[0.97]
              transition-all shadow-[0_8px_32px_rgba(0,0,0,0.25)]
            "
          >
            イベントを探す →
          </Link>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-8 flex flex-col items-center gap-1 text-white/30 animate-bounce">
          <ChevronDown size={22} />
        </div>
      </section>

      {/* ─── 今週のおすすめセクション ─── */}
      <WeeklyEvents />
    </>
  )
}

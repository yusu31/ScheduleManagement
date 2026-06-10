import Link from 'next/link'
import RandomIllustration from '@/components/RandomIllustration'

const HERO_IMAGES = [
  '/images/undraw_around-the-world_1p8h.svg',
  '/images/undraw_walk-in-the-city_tk65.svg',
  '/images/undraw_millennial-girl_30gk.svg',
  '/images/undraw_travel-mode_103y.svg',
]

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-5xl w-full flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20 py-16">

        {/* 左：テキスト＋CTA */}
        <div className="text-center lg:text-left flex-1">
          <h1 className="mb-5 leading-none">
            <span className="block">
              <span className="text-[56px] font-black text-primary">F</span>
              <span className="text-[36px] font-bold text-app-text">ukushima</span>
            </span>
            <span className="block">
              <span className="text-[56px] font-black text-primary">E</span>
              <span className="text-[36px] font-bold text-app-text">vent </span>
              <span className="text-[56px] font-black text-primary">F</span>
              <span className="text-[36px] font-bold text-app-text">inder</span>
            </span>
          </h1>
          <p className="text-app-sub text-[15px] mb-8 max-w-sm leading-relaxed mx-auto lg:mx-0">
            福島県内のイベント情報をひとつに。<br />
            郡山・いわき・福島市など、地域のイベントをまとめてチェック。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              href="/events"
              className="bg-primary hover:bg-primary-dark text-white text-[14px] font-semibold px-7 py-3 rounded-[12px] transition-colors shadow-md"
            >
              イベントを探す →
            </Link>
            <Link
              href="/calendar"
              className="bg-white border border-app-border hover:bg-app-bg text-app-text text-[14px] font-semibold px-7 py-3 rounded-[12px] transition-colors"
            >
              カレンダーで見る
            </Link>
          </div>
        </div>

        {/* 右：イラスト（ランダム） */}
        <div className="flex-1 flex justify-center">
          <RandomIllustration
            srcs={HERO_IMAGES}
            alt="地域のイベントを探そう"
            width={460}
            height={360}
            priority
            className="w-full max-w-[380px] lg:max-w-[460px] drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  )
}

import { CalendarDays, Sprout, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const FEATURES: { Icon: LucideIcon; title: string; description: string }[] = [
  {
    Icon: CalendarDays,
    title: 'カレンダー管理',
    description: '個人の予定と地域イベントをひとつのカレンダーにまとめて管理できる。',
  },
  {
    Icon: Sprout,
    title: 'AI提案',
    description: 'ろーみーがあなたの好みに合わせて、おでかけ先やイベントを提案する。',
  },
  {
    Icon: Trophy,
    title: '福島制覇',
    description: '訪れた市町村を記録し、福島県59市町村の制覇を目指せる。',
  },
]

export default function FeaturesSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-[24px] font-bold text-app-text text-center mb-10 theme-readable">
        Roami の特徴
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {FEATURES.map(({ Icon, title, description }) => (
          <div
            key={title}
            className="
              flex flex-col items-center text-center gap-3
              rounded-2xl border border-app-border bg-app-surface
              px-6 py-8
            "
          >
            <span className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Icon size={22} className="text-primary" />
            </span>
            <h3 className="text-[15px] font-bold text-app-text">{title}</h3>
            <p className="text-[13px] text-app-sub leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

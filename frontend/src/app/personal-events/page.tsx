'use client'

import { CalendarDays } from 'lucide-react'

export default function PersonalEventsPage() {
  return (
    <main className="flex-1 p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <CalendarDays size={32} className="text-primary" />
        </span>
        <h1 className="text-[28px] font-black text-app-text mb-4">予定</h1>
        <p className="text-[15px] text-app-sub leading-relaxed">
          個人の予定管理ページは準備中です。<br />
          場所・地区・カテゴリつきで予定を管理できるようになります。
        </p>
      </div>
    </main>
  )
}

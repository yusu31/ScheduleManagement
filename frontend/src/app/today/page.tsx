'use client'

import { Sun } from 'lucide-react'

export default function TodayPage() {
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <main className="flex-1 p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <Sun size={32} className="text-primary" />
        </span>
        <p className="text-[13px] text-app-sub font-medium mb-2">{today}</p>
        <h1 className="text-[28px] font-black text-app-text mb-4">今日</h1>
        <p className="text-[15px] text-app-sub leading-relaxed">
          今日のダッシュボードは準備中です。<br />
          予定・天気・マップ制覇の進捗をここに表示する予定です。
        </p>
      </div>
    </main>
  )
}

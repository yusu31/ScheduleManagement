'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { isLoggedIn, currentUser, signOut, isLoading } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // サインアウト失敗時もUIはリセット済みなので何もしない
    }
  }

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-7 h-[58px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-[17px] tracking-wide hover:opacity-90">
          <span className="w-7 h-7 bg-white/25 rounded-lg flex items-center justify-center text-base">
            🌿
          </span>
          福島イベントナビ
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/events" className="text-white/80 hover:text-white hover:bg-white/18 text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-colors">
            一覧
          </Link>
          <Link href="/calendar" className="text-white/80 hover:text-white hover:bg-white/18 text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-colors">
            カレンダー
          </Link>

          {!isLoading && (
            <>
              {isLoggedIn ? (
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-white/70 text-[13px]">
                    {currentUser?.name || currentUser?.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-[13px] bg-white/15 hover:bg-white/28 text-white border border-white/30 px-3.5 py-1.5 rounded-full font-semibold transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 ml-2">
                  <Link
                    href="/auth/sign-in"
                    className="text-[13px] bg-white/15 hover:bg-white/28 text-white border border-white/30 px-3.5 py-1.5 rounded-full font-semibold transition-colors"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="text-[13px] bg-white/15 hover:bg-white/28 text-white border border-white/30 px-3.5 py-1.5 rounded-full font-semibold transition-colors"
                  >
                    新規登録
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
